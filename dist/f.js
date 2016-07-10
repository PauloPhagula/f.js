/*!
 * f, v0.1.4 (2016/07/10 11:32)
 * A JavaScript framework for modular and scalable SPAs.
 * <https://github.com/dareenzo/f-es>
 *
 * Author: Paulo Phagula <https://dareenzo.github.io/>
 * License: MIT
 * 
 */
(function () {
	
var factory = function (Navigo) {
	"use strict";
	    
    // Initial Setup
    // -------------

    // Save the previous value of the `F` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var F = {};
    var previousF = F;

    // Current version of the library. Keep in sync with `package.json` and `bower.json`.
    F.VERSION = '0.1.4';

    // Set framework to debug mode. Disabled by default
    F.DEBUG = false;

    // Runs F.js in *noConflict* mode, returning the `F` variable
    // to its previous owner. Returns a reference to this F object.
    F.noConflict = function() {
        F = previousF;
        return this;
    };

    // Patch Object
    Object.getOwnPropertyDescriptors = function getOwnPropertyDescriptors(obj) {
        var descriptors = {};
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                descriptors[prop] = Object.getOwnPropertyDescriptor(obj, prop);
            }
        }
        return descriptors;
    };

    // Util
    // ---

    // Composes objects by combining them into a new
    F.compose = Object.assign;

    /**
     * Helper function to correctly set up the prototype chain for subclasses.
     * Similar to `goog.inherits`, but uses a hash of prototype properties and
     * class properties to be extended.
     *
     * Taken from Backbone.js of Jeremy Ashkenas
     * @see https://github.com/jashkenas/backbone/blob/master/backbone.js#L1839
     * @see https://gist.github.com/juandopazo/1367191
     *
     * @param  {Object} protoProps - the instance properties for the *Class*
     * @param  {Object} staticProps - the static properties for the *Class*
     * @return {Function} - a new constructor function
     */
    F.extend = function(protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent constructor.
        if (!protoProps.hasOwnProperty('constructor')) {
            Object.defineProperty(protoProps, 'constructor', {
                value: function () {
                    // Default call to superclass as in maxmin classes
                    parent.apply(this, arguments);
                },
                writable: true,
                configurable: true,
                enumerable: false
            });
        }

        child = protoProps.constructor;
        // Add static properties to the constructor function, if supplied.
        Object.assign(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function and add the prototype properties.
        child.prototype = Object.create(parent.prototype, Object.getOwnPropertyDescriptors(protoProps));
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };

	/**
 * Dispatcher - the communication / app nexus / pub-sub extension
 *
 * Taken from: Facebook Dispatcher and Alex MacCaw - JavaScript Web Applications - Pag.28
 *
 * The Flux dispatcher is different from pub-sub in two ways
 * 1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 * 2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 * But since we need to support both, if we're using actions then we use the channel as 'ACTION'
 * so all participants in Flux can listen
 *
 * @check https://facebook.github.io/flux/docs/dispatcher.html
 * @usage:
 * // creating the callback
 * var fn = function(payload) { alert('wem!'); }
 *
 * // subscribing
 * PubSub.subscribe('wem', fn);
 *
 * // publishing
 * PubSub.publish('wem');
 *
 * // unsubscribing
 * PubSub.unsubscrube('wem', fn);
 */

F.dispatcher = (function(undefined){
	"use strict";

	var _prefix = 'ID_',
		ACTION = 'ACTION',

		_isDispatching = false,
		_isHandled = {},
		_isPending = {},
		_lastID = 1,
		_pendingPayload = null,

		_throwIfDispatching = function(methodName) {
			if (_isDispatching)
				throw new Error('Cannot run ' + methodName + 'in the middle of a dispatch.');
		}
	;

	return {
		/**
		* Registers a callback to be called when an event is published.
		* returns a token that can be used with `waitfFor()`
		* @method
		* @public
		*
		* @param {String} channel - event / channel / action
		* @param {Function} callback - the callback to be registered
		* @param {Object} context - the object under whiches context the callback is to be called
		*/
		subscribe: function (channel, callback, context) {
			_throwIfDispatching('Dispatcher.subscribe(...)');
			// Create _callbacks object, unless it already exists
			var calls = this._callbacks || (this._callbacks = {});

			// Create an array for the given event key, unless it exists, then
			// append the callback to the array
			var id = _prefix + _lastID++;
			(this._callbacks[channel] || (this._callbacks[channel] = [])).push({ callback: callback, context: context, id: id });
			return id;
		},

		/**
		* Deregisters a callback for an event
		* @method
		* @public
		*
		* @param {String} channel
		* @param {Function} callcack - the callback to be unregistered
		*/
		unsubscribe: function (channel, callback) {
			_throwIfDispatching('Dispatcher.subscribe(...)');
			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list, calls, i, l;
			if (!(calls = this._callbacks[channel])) return this;
			if (!(list = this._callbacks[channel])) return this;

			// remove callback
			for (i = 0, l = list.length; i < l; i++) {
				var handler = list[i];
				if (handler === callback) {
					list.splice(i);
				}
			}
		},

		/**
		* Publishes an event and callsback all subscribers to that event
		* @method
		* @public
		*
		* @param {String} eventName - the event / channel / action name
		* @param {Object} payload - the data to be published for the event / channel / action
		*/
		publish: function () {
			// Turn arguments object into a real array
			var args = Array.prototype.slice.call(arguments, 0);
			// Extract the first argument, the event name
			var ev = args.shift();

			if (ev === ACTION) {
				this._startDispatching(args);

				try {
					var list, calls, i, l;
					if (!(calls = this._callbacks)) return;
					if (!(list = this._callbacks[ACTION])) return;

					for (i = 0, l = list.length; i < l; i++) {
						var handler = list[i];
						if (_isPending[handler.id]) {
							continue;
						}
						handler.callback.apply(handler.context || null, args);
					}
				} finally {
					this._stopDispatching();
				}

				return;
			}

			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list1, calls1, i1, l1;
			if (!(calls1 = this._callbacks)) return;
			if (!(list1 = this._callbacks[ev])) return;

			// Invoke the callbacks
			for (i1 = 0, l1 = list1.length; i1 < l1; i1++) {
				var handler1 = list1[i1];
				handler1.callback.apply(handler1.context || null, args);
			}

			return;
		},

		/**
		* Helper method to publish an action
		* @param {Object} payload - the action to be published
		* Payload : {
		*   type : 'action-name',
		*   data : {}
		* }
		*/
		dispatch: function (payload) {
			_throwIfDispatching('Dispatcher.dispatch(...)');
			this.publish(ACTION, payload);
		},

		/**
		* Waits for the callbacks specified to be invoked before continuing execution
		* of the current callback. This method should only be used by a callback in
		* response to a dispatched payload.
		*
		* When `waitFor()` is encountered in a callback, it tells the Dispatcher to invoke the callbacks for the required stores.
		* After these callbacks complete, the original callback can continue to execute.
		* Thus the store that is invoking `waitFor()` can depend on the state of another store to inform how it should update its own state.
		*
		* A problem arises if we create circular dependencies.
		* If Store A waits for Store B, and B waits for A, then we could wind up in an endless loop.
		* The Dispatcher will flag these circular dependencies with console errors.
		*
		* @param {Array} dispatchTokens - an array of dipatcher registry indexes, which we refer to here as each store's dispatchToken
		* @usage:
		* case 'TODO_CREATE':
		*   dispatcher.waitFor([
		*     PrependedTextStore.dispatchToken,
		*     YeatAnotherstore.dispatchToken
		*   ]);
		* 	TodoStore.create(PrependedTextStore.getText() + '' + action.text);
		*   TodoStore.emit('chage');
		*   break;
		*/
		waitFor: function (dispatchTokens) {
			_throwIfDispatching('Dispatcher.waitFor(...)');

			var _handlerFn = function (handler) {
				if (handler.id === token) {
					_handler = handler;
				}
			};

			for (var i = 0; i < dispatchTokens.length; i++) {
				var token = dispatchTokens[i];
				if (_isPending[token]) {
					if (!_isHandled[token]) {
						throw new Error('dispatcher.waitFor(...): Circular dependency detected while waiting for ' + token);
					}
					continue;
				}

				var _handler = null;

				this._callbacks[ACTION].forEach(_handlerFn(handler));

				if (!_handler) {
					throw new Error('dispatcher.waitFor(...):' + token + ' does not map to a registered callback.');
				}

				_isPending[token] = true;
				_handler.callback.apply(_handler.context || null);
				_isHandled[token] = true;
			}
		},

		/**
		* Setup booking used for dispatching
		*/
		_startDispatching: function (payload) {
			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list, calls, i, l;
			if (!(calls = this._callbacks)) return;
			if (!(list = this._callbacks[ACTION])) return;

			// Invoke the callbacks
			for (i = 0, l = list.length; i < l; i++) {
				var handler = list[i];
				_isPending[handler.id] = false;
				_isHandled[handler.id] = false;
			}
			_pendingPayload = payload;
			_isDispatching = true;
		},

		/**
		* Clear booking used for dispatching
		*/
		_stopDispatching: function () {
			_pendingPayload = null;
			_isDispatching = false;
		}
	};
}());

	/*

Dependency Injector

All code is a mixture of the content from the following sources:
    Krasimir Sonev      - http://krasimirtsonev.com/blog/article/Dependency-injection-in-JavaScript
    Tero Parviainen     - http://teropa.info/blog/2014/06/04/angularjs-dependency-injection-from-the-inside-out.html
    Merrick Christensen - http://merrickchristensen.com/articles/javascript-dependency-injection.html
    Yusufaytas          - http://stackoverflow.com/a/20058395
    Alex Rothenberg     - http://www.alexrothenberg.com/2013/02/11/the-magic-behind-angularjs-dependency-injection.html

Usage:
    var Service = function() {
        return { name: 'Service' };
    }
    var Router = function() {
        return { name: 'Router' };
    }

    injector.register('service', Service);
    injector.register('router', Router);

    // when specifying the names of the dependencies, the parameter names in the function can be anything
    var doSomething = injector.resolve(['service', 'router', function(q, s) {
        console.log(q().name === 'Service');
        console.log(s().name === 'Router');
    }]);

    doSomething();

    // When not specifying the dependency names, the parameter names in the function must have the same name as the dependencies
    var doSomething = injector.resolve(function(service, router){
        console.log(q().name === 'Service');
        console.log(s().name === 'Router');
    });

    doSomething();
 */

F.injector = (function(undefined){
    "use strict";

    var dependencies  = {};

    var ARROW_ARG = /^([^\(]+?)=>/;
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    // Impl
    // ---
    function annotate(fn) {
        var $inject,
            fnText,
            argDecl,
            last;

        if (typeof fn === 'function') {
            if (!($inject = fn.$inject)) {
                $inject = [];
                if (fn.length) {
                    fnText = fn.toString().replace(STRIP_COMMENTS, '');
                    argDecl = fnText.match(FN_ARGS);
                    argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg){
                        arg.replace(FN_ARG, function(all, underscore, name){
                            $inject.push(name);
                        });
                    });
                }
                fn.$inject = $inject;
            }
        } else if (isArray(fn)) {
            last = fn.length - 1;
            assertArgFn(fn[last], 'fn');
            $inject = fn.slice(0, last);
        } else {
            assertArgFn(fn, 'fn', true);
        }
        return $inject;
    }

    function register (key, value) {
        dependencies[key] = value;
    }

    function resolve(fn, self, locals) {
        var args = [],
            $inject = annotate(fn),
            length, i,
            key;

        for (i = 0, length = $inject.length; i < length; i++) {
            key = $inject[i];
            if (typeof key !== 'string') {
                throw new Error('Incorrect injection token! Expected service name as string, got: ' + key);
            }
            args.push(
            locals && locals.hasOwnProperty(key) ?
                locals[key] :
                dependencies[key]
            );
        }
        if (isArray(fn)) {
            fn = fn[length];
        }

        // http://jsperf.com/angularjs-invoke-apply-vs-switch
        // #5388
        return fn.apply(self || {}, args);
    }

    // Util
    // ---
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    /**
     * @ngdoc function
     * @name angular.isFunction
     * @module ng
     * @kind function
     *
     * @description
     * Determines if a reference is a `Function`.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `Function`.
     */
    function isFunction(value){return typeof value === 'function';}

    function minErr(module) {
        return function () {
            var code = arguments[0],
            prefix = '[' + (module ? module + ':' : '') + code + '] ',
            template = arguments[1],
            templateArgs = arguments,
            stringify = function (obj) {
            if (typeof obj === 'function') {
                return obj.toString().replace(/ \{[\s\S]*$/, '');
            } else if (typeof obj === 'undefined') {
                return 'undefined';
            } else if (typeof obj !== 'string') {
                return JSON.stringify(obj);
            }
                return obj;
            },
            message, i;

            message = prefix + template.replace(/\{\d+\}/g, function (match) {
                var index = +match.slice(1, -1), arg;

                if (index + 2 < templateArgs.length) {
                    arg = templateArgs[index + 2];
                    if (typeof arg === 'function') {
                        return arg.toString().replace(/ ?\{[\s\S]*$/, '');
                    } else if (typeof arg === 'undefined') {
                        return 'undefined';
                    } else if (typeof arg !== 'string') {
                        return toJson(arg);
                    }
                    return arg;
                }
                return match;
            });

            message = message + '\nhttp://errors.angularjs.org/1.2.27/' +
            (module ? module + '/' : '') + code;
            for (i = 2; i < arguments.length; i++) {
                message = message + (i == 2 ? '?' : '&') + 'p' + (i-2) + '=' +
                encodeURIComponent(stringify(arguments[i]));
            }

            return new Error(message);
        };
    }

    var ngMinErr = minErr('ng');
    /**
     * throw error if the name given is hasOwnProperty
     * @param  {String} name    the name to test
     * @param  {String} context the context in which the name is used, such as module or directive
     */
    function assertNotHasOwnProperty(name, context) {
        if (name === 'hasOwnProperty') {
            throw ngMinErr('badname', "hasOwnProperty is not a valid {0} name", context);
        }
    }

    /**
     * throw error if the argument is falsy.
     */
    function assertArg(arg, name, reason) {
        if (!arg) {
            throw ngMinErr('areq', "Argument '{0}' is {1}", (name || '?'), (reason || "required"));
        }
        return arg;
    }

    function assertArgFn(arg, name, acceptArrayAnnotation) {
        if (acceptArrayAnnotation && isArray(arg)) {
            arg = arg[arg.length - 1];
        }

        assertArg(isFunction(arg), name, 'not a function, got ' +
            (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
        return arg;
    }

    // Public API
    // ---
    return {
        register : register,
        resolve  : resolve
    };
}());

	/**
 * Router - the app router
 *
 * @see https://github.com/krasimir/navigo
 */

F.router = (function(Navigo, undefined){
	"use strict";

	var _router = new Navigo();

	/**
	 * Handles URL clicks when the router is turned on
	 * @private
	 *
	 * @param {Event} e - the click event
	 */
	var _handleURLClick = function(e) {
		var target = e.target;
		if (target.tagName === "A" && !target.hasAttribute('data-external')) {
			// Get the absolute anchor href.
			var href = target.href;

			if (href.indexOf('javascript:void(0)') > -1)
				return;

			// not a client-side navigation URL
			if (href.indexOf('#/') === -1)
				return;

			// Stop the default event to ensure the link will
			// not cause a page refresh.
			e.preventDefault();

			// Get the hash part of the URL and navigate away.

			href = '/' + href.split('#/')[1];
			_router.navigate(href);
		}
	};

	// Public API
	// --------------

	/**
	 * Maps a handler to a given URL pattern.
	 *
	 * @param {String} pattern String pattern that should be used to match against requests
	 * @param {Function} handler Function that should be executed when a request matches the route pattern
	 */
	var add = function(pattern, handler) {
		_router.on(pattern, handler);
	};

	/**
	 *
	 */
	var start = function() {
		document.addEventListener('click', _handleURLClick);
	};

	/**
	 * Stops listening for changes on either hash and URL clicks
	 * @method
	 * @public
	 */
	var stop = function() {
		document.removeEventListener('click', _handleURLClick);
	};

	/**
	 * Navigates to the given url
	 * @param  {url} the url to navigate to.
	 */
	var navigate = function(url) {
		_router.navigate(url);
	};

	// Return public methods
	return {
		add		: add,
		navigate: navigate,
		start	: start,
		stop	: stop
	};
}(Navigo));

	/**
 * Core
 *
 * The `Core` contains the main application object that is the heart of the
 * application architecture.
 */

/* global injector */

F.Core = (function(injector, dispatcher, router, undefined) {
	"use strict";

	// Private
	// ---
	var _config      = { debug: false },   // Global configuration
		_extensions  = {},   // Information about each registered extension by extensionName
        _modules     = {},   // Information about each registered module by moduleName
        _stores	     = {},   // Information about each registered store by storeName
        _initialized = false // Flag whether the application has been initialized
    ;

    /**
     * Resets all state to its default values
     * @return {void}
     * @private
     */
    function reset() {
    	_config      = {};
    	_extensions  = {};
    	_modules     = {};
    	_stores      = {};
    	_initialized = false;
    }

    /**
	 * Signals that an error has occurred. If in development mode, an error
	 * is thrown. If in production mode, an event is fired.
	 * @param {Error} [exception] The exception object to use.
	 * @returns {void}
	 * @private
	 */
    function error(exception) {
		if (_config.debug)
			throw exception;
		else
			dispatcher.publish('error', { exception: exception });
	}

	/**
	 * Makes an object production-ready by wrapping all its methods with a
	 * try-catch so that objects don't need to worry about trapping their own
	 * errors. When an error occurs, the error event is fired with the error information.
	 * @see https://www.nczonline.net/blog/2009/04/28/javascript-error-handling-anti-pattern/
	 * @param {Object} object Any object whose public methods should be wrapped.
	 * @param {string} objectName The name that should be reported for the object
	 *                            when an error occurs.
	 * @returns {void}
	 * @private
	 *
	 * @example
	 * var system = {
	 *		fail: function(){
	 *			throw new Error("Oops!");
	 *		}
	 *	};
	 *
	 *	function log(severity, message){
	 *		alert(severity + ":" + message);
	 *	}
	 *
	 *	if (!debugMode){
	 *		productionize(system);
	 *	}
	 *
	 *	system.fail();   //error is trapped!
	 */
	function productionize(object, objectName) {
		var name,
    		method,
    		wrap = function(name, method){
				return function(){
					var errorPrefix = objectName + '.' + name + '() - ';
					try {
						return method.apply(this, arguments);
					} catch (ex) {
						ex.methodName = name;
						ex.objectName = objectName;
						ex.name = errorPrefix + ex.name;
						ex.message = errorPrefix + ex.message;
						error(ex);
					}
				};
			};

		for (name in object){
			method = object[name];
			if (typeof method === "function"){
				object[name] = wrap(name, method);
			}
		}
	}


	// Public
	// ---
    function Core() {}

    F.compose(Core.prototype, {

    	// App lifecycle
		// ---

		/**
		 * Initializes the application
		 * @return {void}
		 */
		init: function(options) {
			_config = F.compose({}, _config, options);

			this.startAll(document.documentElement);

			router.start();
			dispatcher.publish('app init');
			_initialized = true;
		},

		/**
		 * Stops all modules and clears all saved state
		 * @returns {void}
		 */
		destroy: function() {
			this.stopAll(document.documentElement);

			reset();

			router.stop();
		},

		// Registration Hooks
		// ---

		/**
		 * Method used to add extensions on the core.
		 * @param  {string}   extensionName  unique extension name. This name will be used when injecting the extension
		 * @param  {array}    dependencies   list of dependencies this extension relies on. Generally these are other extensions
		 * @param  {function} factory        the extension factory function
		 * @param  {object}   options        options for the extension initialization
		 * @return {void}
		 *
		 * @example
		 * var core = new F.Core();
		 *
		 * var loggerExtFactory = function(){
		 *	    var Logger = F.Extension.extend({
		 *	        init: function(options) {},
		 *	        log: function(obj) { console.log(obj);}
		 *	    });
		 *
		 *	    return new Logger();
		 * };
		 *
		 * core.registerExtension("logger", [], loggerExtFactory, {});
		 *
		 * var calculatorExtFactory = function(logger) {
		 * 		var Calculator = F.Extension.extend({
		 * 			init: function(options) {},
		 * 			add: function(a,b) {return a+b;},
		 * 			subsctract: function(a,b) {return a-b;}
		 * 		});
		 *
		 * 		return new Calculator();
		 * }
		 *
		 * core.registerExtension("calculator", ["logger"], calculatorExtFactory, {})
		 */
		registerExtension : function(extensionName, dependencies, factory, options) {
			if (_extensions.hasOwnProperty(extensionName))
				return error(new Error("An extension with the given name has already been registered. Ext name: " + extensionName));

			dependencies = dependencies || [];
			options = options || {};

			var injectionSpec = dependencies;
		    injectionSpec.push(factory);

		    var extension = F.injector.resolve(injectionSpec);
		    extension.init(options);
		    _extensions[extensionName] = extension;

		    F.injector.register(extensionName, extension);
		},

		/**
		 * Registers a store on the core
		 * @param  {string} name      unique store identifier
		 * @param  {Store}  instance  the store instance
		 * @return {void}
		 */
		registerStore : function(name, instance) {
    		_stores[name] = instance;
    	},

		/**
		 * Method used to register modules on the core.
		 * @param  {string}   moduleName  unique module identifier
		 * @param  {array}    extensions  List of extensions this module relies on.
		 *                                These are the only extensions the module will be allowed to use.
		 * @param  {function} factory     the module factory function
		 * @param  {object}   options     options for the module initialization
		 * @return {void}
		 */
		registerModule: function(moduleName, extensions, stores, factory, options) {
			if (_modules.hasOwnProperty(moduleName))
				return error(new Error("Module with given name has already been registered. Mod name: " + moduleName));

			_modules[moduleName] = {
				factory    : factory,
				extensions : extensions,
				stores 	   : stores,
				options    : options,
				instance   : null
			};
		},

		// Module lifecycle
		// ---

		/**
		 * Starts a given module on a DOM element.
		 * @param  {string} moduleName unique module identifier
		 * @param  {string} element    the DOM element to which the module will be tied
		 * @return {void}
		 */
		start: function(moduleName, element) {
			if (!_modules.hasOwnProperty(moduleName))
				return error(new Error("Trying to start non-registered module: " + moduleName));

			var module = _modules[moduleName];
			var sandbox = new F.Sandbox(this, moduleName, element);
			module.instance = new module.factory(sandbox, moduleName, module.options);

			var extensions = {};
			var stores     = {};

			var i; // loop controller variable

			for (i = 0; i < module.extensions.length; i++) {
				var extName = module.extensions[i];

				if (_extensions.hasOwnProperty(extName))
					extensions[extName] = _extensions[extName];
				else
					return error(new Error("Module requires an unregistered extensions: " + extName));
			}

			for (i = 0; i < module.stores.length; i++ ) {
				var storeName = module.stores[i];

				if (_stores.hasOwnProperty(storeName))
					stores[storeName] = _stores[storeName];
				else
					return error(new Error("Module requires an unregistered store: " + storeName));
			}

			// Prevent errors from showing the browser, fire event instead
			if (!_config.debug)
				productionize(module.instance, moduleName);

			module.instance.start(element, extensions, stores);
		},

		/**
		 * Stops a given module.
		 * @param  {string} moduleName unique module identifier
		 * @return {void}
		 */
		stop: function(moduleName) {
			var data = _modules[moduleName];

			if (!(data && data.instance))
				return error(new Error('Unable to stop module: ' + moduleName));

			data.instance.stop();
			data.instance = null;
		},

		/**
		 * Restarts the given module.
		 * @param  {string} moduleName unique module identifier
		 * @return {void}
		 */
		restart: function(moduleName) {
			this.stop(moduleName);
			this.start(moduleName);
		},

		/**
		 * Starts all registered modules within an element.
		 * @return {void}
		 */
		startAll: function(root) {
			for (var moduleName in _modules){
				if(_modules.hasOwnProperty(moduleName)){
					this.start(moduleName);
				}
			}

			return this;
		},

		/**
		 * Stops all registered modules within an element.
		 * @return {void}
		 */
		stopAll: function(root) {
			for (var moduleName in _modules){
				if(_modules.hasOwnProperty(moduleName)){
					this.stop(moduleName);
				}
			}

			return this;
		},

		// Messaging
		// ---

		/**
		 * The dispatcher for communication
		 * @todo don't expose the dispatcher. Proxy its methods instead.
		 * @type {F.Dispatcher}
		 */
    	dispatcher: dispatcher,

    	// Routing
    	// ---

    	/**
    	 * The router for anchor management
    	 * @todo  don't expose the router. Proxy its methods instead.
    	 * @type {F.Router}
    	 */
    	router: router,

		// Config
		// ---

		/**
		 * Returns configuration data
		 * @param  {string} name the desired configuration parameter
		 * @return {*}           config value or the entire JSON config object
		 *                       if not name is specified (null if neither is found)
		 */
		getConfig: function(name) {
			if (typeof name === 'undefined')
				return _config;
			else if (name in _config)
				return _config[name];
			else
				return null;
		},

		/**
		 * Sets the configuration data
		 * @param {Object} config
		 * @return {void}
		 */
		setConfig: function(config) {
			if (_initialized)
				return error(new Error('Cannot set configuration after application is initialized'));

			_config = F.compose({}, _config, config);
		},

		// Error reporting
		// ---

		/**
		 * Signals that an error has occurred. If in development mode, an error
		 * is thrown. If in production mode, an event is fired.
		 * @param {Error} [exception] The exception object to use.
		 * @returns {void}
		 */
		reportError: error
	});

    Core.extend = F.extend;
	return Core;
}(F.injector, F.dispatcher, F.router));

	/**
 * Sandbox
 *
 * Abstracton into the `Core` for use by `Module`s to interact with the environment.
 */

F.Sandbox = (function(undefined){
	"use strict";

	/**
	 * @constructor
	 * @param  {Core} core - the application core
	 * @param  {String} moduleName - the module name
	 * @param  {HTMLElement} element - the element underwhich this sandbox has control
	 * @return {void}
	 */
	function Sandbox (core, moduleName, element) {
		this.core 	  = core;
		this.moduleName = moduleName;
    	this.element  = element;
	}

	// Attach all inheritable methods to the Sanbox prototype.
	F.compose(Sandbox.prototype, {
		/**
		* Checks if a module can publish a certain event.
		* By default any module can publish. Override with your implementation.
		*
		* @param  {String} moduleName - The Id of the module for which we're checking permissions
		* @param  {String} channel - The event for we're checking if module has permission to publish to
		* @return {Boolean} - true if module can publish. false otherwise
		*/
		moduleCanPublish : function (moduleName, channel) {
			return true; // no-op
		},

		/**
		* Publishes data into the core's dispatcher
		* @param {String} channel - the channel into which the message will be published
		* @param {Object} data - the data to be published
		* @param {Function} callback - a callback to be called once publishing is done
		* @param {Object} context - the context under which the callback will be called
		*/
		publish : function (channel, data, callback, context) {
			if ( this.moduleCanPublish(this.moduleName, channel) ) {
				this.core.dispatcher.publish.call(channel, data);
			}
		},

		/**
		 * Checks if a module can publish an action
		 * @param  {string} moduleName unique module identifier
		 * @param  {string} actionType unique action type identifier
		 * @return {boolean}
		 */
		moduleCanDispatchAction: function(moduleName, actionType) {
			return true; // no-op
		},

		/**
		 * Publishes an action using the internal dispatcher creator.
		 * This could also be done using an action creator
		 * @return {void}
		 */
		dispatch: function(type, data) {
			if (! this.moduleCanDispatchAction(this.moduleName, type))
				throw new Error("module " + this.moduleName + " is not authorized to create action: " + action);

			this.core.dispatcher.dispatch({type: type, data: data});
		},

		/**
		* Subscribes to a channel of the core's dispatcher
		* @param {String} channel - the channel to which messages will be listened
		* @param {Function} callback - the function to be executed when a message in the channel is published
		* @param {Object} context - the context under which the callback will be called
		*/
		subscribe : function (channel, callback, context) {
			this.core.dispatcher.subscribe( channel, callback, context );
		},

		/**
		* Unsubscribes to a channel of the core's dispatcher
		* @param {String} channel - the channel in which we want to unsubscribe the callback
		* @param {Function} callback - the function which we want to remove
		*/
		unsubscribe : function (channel, callback) {
			this.core.dispatcher.unsubscribe(channel, callback);
		},

		/**
		* Returns global configuration data
		* for this instance of the module.
		* @param {String} name - Specific config parameter
		* @returns {*} config value or the entire configuration JSON object
		*                if no name is specified (null if either not found)
		*/
		getConfig : function (name) {
			return this.core.getConfig(this.element, name);
		},

		/**
		* Passthrough method that signals that an error has occurred. If in development mode, an error
		* is thrown. If in production mode, an event is fired.
		* @param {Error} exception - the exception object to use
		* @returns {void}
		*/
		reportError : function (exception) {
			return this.core.reportError(exception);
		}
	});

	Sandbox.extend = F.extend;
	return Sandbox;
}());

	/**
 * Flux Store
 *
 * Is where the `Core` and all of our feature `Modules` access data and business
 * logic in our SPA.
 */

F.Store = (function(undefined){
	"use strict";

	var CHANGE = 'CHANGE',
		ACTION = 'ACTION';

	function Store (dispatcher, name) {
		var self = this;
		this._dispatcher = dispatcher;
		this._name = name;

		this._changed = false;
		this._data = [];

		this._dispatchFlow = function(payload) {
			self._changed = false;
			self._handleDispatch(payload);
			if (self._changed) {
				self.emitChange();
			}
		};

		self._dispatchToken = dispatcher.subscribe(ACTION, this._dispatchFlow);
		this.actions = {};
		this.init.apply(this, arguments);
	}

	// Attach all inheritable methods to the Store prototype.
	F.compose(Store.prototype, {

		/**
		* Initialize is an empty function by default. Override it with your own
		* initialization logic.
		*
		* @param {PubSub} dispatcher - the dispatcher
		* @param {String} name - the name of this store
		*/
		init : function() {
			throw new Error("Store initialization not done. Override this function");
		},

		_handleDispatch : function(payload) {
			throw new Error("Store payload handling not done. Override this function");
		},

		/**
		 * This exposes a unique string to identify each store's registered callback.
		 * This is used with the dispatcher's waitFor method to devlaratively depend
		 * on other stores updating themselves first.
		 */
		getDispatchToken: function() {
			return this._dispatchToken;
		},

		/**
		* Allows views to subscribe to this store's change event
		* @param {function} callback
		*/
		addChangeListener: function(callback) {
			// Create _callbacks object, unless it already exists
			var calls = this._callbacks || (this._callbacks = {});

			// Create an array for the given event key, unless it exists, then
			// append the callback to the array
			(this._callbacks[CHANGE] || (this._callbacks[CHANGE] = [])).push({ callback : callback });
		},

		/**
		 * Allows views to unsubscribe to this store's change event
		* @param {function} callback
		*/
		removeChangeListener: function(callback) {
			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list, calls, i, l;
			if (!(calls = this._callbacks)) return this;
			if (!(list  = this._callbacks[CHANGE])) return this;

			// remove callback
			for (i = 0, l = list.length; i < l; i++) {
				var handler = list[i];
				if (handler === callback) {
					list.splice(i);
				}
			}
		},

		/**
		* Runs the callbacks which were registered by views on this store
		* @method
		* @private
		*/
		emitChange: function() {
			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list, calls, i, l;
			if (!(calls = this._callbacks)) return this;
			if (!(list  = this._callbacks[CHANGE])) return this;

			// Invoke the callbacks
			for (i = 0, l = list.length; i < l; i++) {
				var handler = list[i];
				handler.callback.apply();
			}
		}
	});

	Store.extend = F.extend;
	return Store;
}());

	/**
 * Extension
 *
 * `Extension`s augment the capabilities of the `Core`.
 */

F.Extension = (function(undefined){
    "use strict";

    function Extension () {}

    // Attach all inheritable methods to the Extension prototype.
    F.compose(Extension.prototype, {

        /**
         * Init is an empty function by default. Override with your own logic.
         * @return {void}
         */
        init: function(options) {
            this._defaults = {};
            this._options = F.compose( {}, this._defaults, options );
        }
    });

    Extension.extend = F.extend;
    return Extension;
}());

	/**
 * Module
 *
 * A `Module` is an independent unit of functionallity that is part of the total
 * structure of a web application, which consists of HTML + CSS + JavaScript
 * and which should be able to live on it's own.
 */

/* global F */
F.Module = (function(undefined){
	"use strict";

	var module_selector = '[data-module]';

	/**
	 * @constructor
	 * @param {Sandbox} the modules sandbox
	 * @param {Object} options - settings for the module
	 */
	function Module(sandbox, name, options) {
		this._sandbox = sandbox;
		this._name = name;
		this._defaults = {};
		this._options  = {};
		this._extensions = {};
		this._stores = {};
		this._options = F.compose( {}, this._defaults, options );

		// Access to jQuery and DOM versions of element
		this.$el = null;
		this.el  = null;
	}

	// Attach all inheritable methods to the Module prototype.
	F.compose(Module.prototype, {
		/**
		* Initializes the module on the specified element with the given options
		*
		* Start is an empty function by default. Override it with your own implementation;
		*
		* @param {Element} element - DOM element where module will be initialized
		* @param {Object} extensions - extensions to be used by module
		* @param {Object} stores - stores to be used by module
		*/
		start : function(element, extensions, stores) {
			throw new Error("Module initialization not done. Override this function");
		},

		/**
		* Destroys the module by unsubscribing for events and removing it from the DOM
		*
		* Destroy is an empty function by default. Override it with your own implementation;
		*/
		stop: function() {
			throw new Error("Module stopping not done. Override this function");
		}
	});

	Module.extend = F.extend;
	return Module;
}());

    return F;
};

if (typeof define === 'function' && define.amd) {
    define(['navigo'], factory);
} else if (typeof module !== 'undefined' && module.exports) { //Node
    module.exports = factory(require('navigo'));
} else {
    /*jshint sub:true */
    window['F'] = factory(window['Navigo']);
}

}());
