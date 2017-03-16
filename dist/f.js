/*!
 * f, v0.1.8 (2017/03/16 01:33)
 * A JavaScript framework for modular and scalable SPAs.
 * <https://github.com/dareenzo/f.js>
 *
 * Author: Paulo Phagula <https://dareenzo.github.io/>
 * License: MIT
 *
 */
(function () { 'use strict';

var factory = function () {
	
    // Initial Setup
    // -------------

    /**
     * The one global object for F.
     * @namespace F
     */
    var F = {};

    /**
     * The previous value of the `F` variable, so that it can be
     * restored later on, if `noConflict` is used.
     * @type {F}
     */
    var previousF = F;

    /**
     * Current version of the library.
     * Must be keept in sync with `package.json` and `bower.json`.
     * @type {String}
     */
    F.VERSION = '0.1.8';

    /**
     * Set framework to debug mode. Disabled by default
     * @type {Boolean}
     */
    F.DEBUG = false;

    /**
     * Runs F.js in *noConflict* mode, returning the `F` variable
     * to its previous owner.
     * @return {F} a reference to this F object
     */
    F.noConflict = function() {
        F = previousF;
        return this;
    };

    // Patch Object
    Object.getOwnPropertyDescriptors = function (obj) {
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

    // Composes objects by combining them into a new one
    // TODO: Object.assign only exists in ES6 and library is for ES5 so fix this.
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
     * Performs event delegation setting.
     * @param  {HTMLElement} element the element we want to delegate events for
     * @param  {string} event    the type of event we want to delegate
     * @param  {string} selector a css selector
     * @param  {Function} handler  the handler function
     * @param  {Object} context  the context under which the handler fn
     *                           will be called
     * @param {boolean} useCapture indicates that events of this type will be
     *                           dispatched to the registered listener before
     *                           being dispatched to any EventTarget beneath
     *                           it in the DOM tree
     * @return {void}
     */
    F.delegateEvent = function(element, event, selector, handler, context, useCapture) {

        var listener =  function(e){
            if (typeof selector === "undefined" || selector === null) {
                return handler.call(context || null, e);
            } else if (e.target && e.target.matches(selector)) {
                // console.log('event: ' + eventName + ', selector: ' + selector + ', handler: ' + handler + ', matches: ' + e.target.matches(selector));
                return handler.call(context || null, e);
            }
        };

        useCapture = useCapture || false;
        element.addEventListener(event, listener, useCapture);
    };

    /**
     * Performs event delegation unsetting.
     * @param  {HTMLElement} element the element we want to undelegate events for
     * @param  {string} event    the type of event we want to undelegate
     * @param  {string} selector a css selector
     * @param  {Function} handler  the handler function
     * @param  {Object} context  the context under which the handler fn
     *                           will be called
     * @param {boolean} useCapture indicates that events of this type will be
     *                             dispatched to the registered listener before
     *                             being dispatched to any EventTarget beneath
     *                             it in the DOM tree
     * @return {void}
     */
    F.undelegateEvent = function(element, event, selector, handler, context, useCapture) {

        var listener = function(e) {
            if (typeof selector === "undefined" || selector === null) {
                return handler.call(context || null, e);
            } else if (e.target && e.target.matches(selector)) {
                // console.log('event: ' + eventName + ', selector: ' + selector + ', handler: ' + handler + ', matches: ' + e.target.matches(selector));
                return handler.call(context || null, e);
            }
        };
        useCapture = useCapture || false;

        element.removeEventListener(event, listener, useCapture);
    };

    // Guard
    // ---

    /**
     * Guards that the given assertion is satisfied, immediately raising an
     * error when its not.
     * @param {boolean} assertion the condition to be checked for truthness
     * @param {String} message the message to be contained in the raised error
     * @return {void}
     */
    F.guardThat = function(assertion, message) {
        if (typeof assertion !== 'boolean') {
            throw new Error('assertion must be boolean')
        }

        if (message && typeof message !== 'string') {
            throw new Error('message must be a string')
        }

        if (!assertion) {
            throw new Error(message || "assertion has been violated!");
        }
    }

	/**
 * @fileOverview contains the Dependency Injector definition
 *
 * All code is a mixture of the content from the following sources:
 *     Krasimir Sonev      - http://krasimirtsonev.com/blog/article/Dependency-injection-in-JavaScript
 *     Tero Parviainen     - http://teropa.info/blog/2014/06/04/angularjs-dependency-injection-from-the-inside-out.html
 *     Merrick Christensen - http://merrickchristensen.com/articles/javascript-dependency-injection.html
 *     Yusufaytas          - http://stackoverflow.com/a/20058395
 *     Alex Rothenberg     - http://www.alexrothenberg.com/2013/02/11/the-magic-behind-angularjs-dependency-injection.html
 *
 * @usage:
 *     var Service = function() {
 *         return { name: 'Service' };
 *     }
 *     var Router = function() {
 *         return { name: 'Router' };
 *     }
 *
 *     injector.register('service', Service);
 *     injector.register('router', Router);
 *
 *      * when specifying the names of the dependencies, the parameter names in the function can be anything
 *     var doSomething = injector.resolve(['service', 'router', function(q, s) {
 *         console.log(q().name === 'Service');
 *         console.log(s().name === 'Router');
 *     }]);
 *
 *     doSomething();
 *
 *      * When not specifying the dependency names, the parameter names in the function must have the same name as the dependencies
 *     var doSomething = injector.resolve(function(service, router){
 *         console.log(q().name === 'Service');
 *         console.log(s().name === 'Router');
 *     });
 *
 *     doSomething();
 */

/**
 * @memberof F
 */
F.injector = (function(undefined){

    var dependencies  = {};

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

    /**
     * Registers an object instance in the injector
     * @param  {string} key   the reference name for the instance
     * @param  {*} value the value of the instance
     * @return {void}
     */
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
     * Checks if the given argument is falsy.
     * @param {*} arg object to be analysed
     * @param {string} name the argument's name
     * @param {string} reason the reason to be used for the failure message
     * @returns {*} the argument if is not falsy
     * @throws {Error} if the argument is falsy.
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
 * @fileOverview contains the dispatcher definition used for
 * 				 communication in the application.
 *
 * @see:
 * https://facebook.github.io/flux/docs/dispatcher.html
 * Alex MacCaw - JavaScript Web Applications - Pag.28
 *
 * The Flux dispatcher is different from pub-sub in two ways
 * 1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 * 2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 * Since we need to support both, if we're publishing actions then
 * we use the 'ACTION' channel, so all participants in Flux can listen
 *
 * @usage:
 *
 * // creating the dispatcher
 * var dispatcher = F.Dispatcher();
 *
 * // creating the callback
 * var fn = function(payload) { alert('wem!'); }
 *
 * // subscribing
 * dispatcher.subscribe('wem', fn);
 *
 * // publishing
 * dispatcher.publish('wem');
 *
 * // unsubscribing
 * dispatcher.unsubscribe('wem', fn);
 */

/**
 * @memberOf F
 */
F.Dispatcher = (function(undefined){

	/**
	 * @class Dispatcher
	 */
	function Dispatcher() {}

	var
		/**
		 * @constant {String} PREFIX
		 * @description the dispatch token prefix.
		 * @private
		 */
		PREFIX = 'ID_',
		/**
		 * @constant {String} ACTION
		 * @description the action dispatch channel name.
		 * @private
		 */
		ACTION = 'ACTION',

		_isDispatching = false,
		_isHandled = {},
		_isPending = {},
		_callbacks = {},
		_lastID = 1,
		_pendingPayload = null,

		/**
		 * Utility function to throw errors when attemping other operations
		 * during ongoing `dispatch`.
		 * @memberOf Dispatcher
		 *
		 * @param  {String} methodName the name of the method attempted
		 *                             to run
		 * @return {void}
		 * @throws {Error} If Dispatcher is dispatching
		 */
		_throwIfDispatching = function(methodName) {
			if (_isDispatching) {
				throw new Error('Cannot run '
					+ methodName
					+ 'in the middle of a dispatch.'
				);
			}
		},

		/**
		 * Setup booking used for dispatching.
		 * @memberOf Dispatcher
		 * @private
		 *
		 * @param {object} payload the dispatch payload
		 * @returns {void}
		 */
		_startDispatching = function (payload) {
			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list, calls, i, l;
			if (!(calls = _callbacks)) return;
			if (!(list = _callbacks[ACTION])) return;

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
		 * Clear booking used for dispatching.
		 * @memberOf Dispatcher
		 * @private
		 * @returns {void}
		 */
		_stopDispatching = function () {
			_pendingPayload = null;
			_isDispatching = false;
		}
	;

	F.compose(Dispatcher.prototype, {

		/**
		* Registers a callback to be called when an event is published.
		* returns a token that can be used with `waitfFor()`.
		* @memberOf Dispatcher
		* @method
		* @public
		*
		* @param {String} channel - event / channel / action
		* @param {Function} callback - the callback to be registered
		* @param {Object} context - the object under whiches context the callback is to be called
		* @returns {string} the subscription registration token
		*/
		subscribe: function (channel, callback, context) {
			_throwIfDispatching('Dispatcher.subscribe(...)');
			// Create _callbacks object, unless it already exists
			_callbacks = _callbacks || (_callbacks = {});

			// Create an array for the given event key, unless it exists, then
			// append the callback to the array
			var id = PREFIX + _lastID++;
			(_callbacks[channel] || (_callbacks[channel] = [])).push({
				callback: callback,
				context: context,
				id: id
			});
			return id;
		},

		/**
		* De-registers a callback for an event.
		* @memberOf Dispatcher
		* @method
		* @public
		*
		* @param {String} channel the channel on which to subscribe
		* @param {Function} callback the callback to be unsubscribed
		* @returns {void}
		*/
		unsubscribe: function (channel, callback) {
			_throwIfDispatching('Dispatcher.subscribe(...)');
			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list, calls, i, l;
			if (!(calls = _callbacks)) return this;
			if (!(list = _callbacks[channel])) return this;

			// remove callback
			for (i = 0, l = list.length; i < l; i++) {
				var handler = list[i];
				if (handler === callback) {
					list.splice(i);
				}
			}
		},

		/**
		* Publishes an event and calls back all subscribers to that event.
		* @memberOf Dispatcher
		* @method
		* @public
		*
		* @param {String} eventName - the event / channel / action name
		* @param {Object} payload - the data to be published for the event / channel / action
		* @returns {void}
		*/
		publish: function () {
			// Turn arguments object into a real array
			var args = Array.prototype.slice.call(arguments, 0);
			// Extract the first argument, the event name
			var ev = args.shift();

			if (ev === ACTION) {
				_startDispatching(args);

				try {
					var list, calls, i, l;

					if (!(calls = _callbacks))
                        return;

					if (!(list = _callbacks[ACTION]))
                        return;

					for (i = 0, l = list.length; i < l; i++) {
						var handler = list[i];

                        if (!handler) {
                            continue;
                        }

                        if (typeof handler.callback != 'function') {
                            continue;
                        }

                        if (_isPending[handler.id]) {
							continue;
						}

						handler.callback.apply(handler.context || null, args);
					}
				} catch (error) {
                } finally {
					_stopDispatching();
				}

				return;
			}

			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list1, calls1, i1, l1;
			if (!(calls1 = _callbacks)) return;
			if (!(list1 = _callbacks[ev])) return;

			// Invoke the callbacks
			for (i1 = 0, l1 = list1.length; i1 < l1; i1++) {
				var handler1 = list1[i1];
                if (handler1 && (typeof handler1.callback === 'function')) {
                    handler1.callback.apply(handler1.context || null, args);
                }
			}
		},

		/**
		* Helper method to publish an action.
		* @memberOf Dispatcher
		* @param {Object} payload - the action to be published
		* Payload : {
		*   type : 'action-name',
		*   data : {}
		* }
		* @returns {void}
		*/
		dispatch: function (payload) {
			_throwIfDispatching('Dispatcher.dispatch(...)');

            F.guardThat(typeof payload === 'object', 'payload should be an object');
            F.guardThat('type' in payload && typeof payload.type === 'string' && payload.type.length > 0, 'payload.type should be a string');
            F.guardThat('data' in payload && typeof payload.data === 'object', 'payload.data should be an object');

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
		* @memberOf Dispatcher
		*
		* @param {Array} dispatchTokens - an array of dispatcher registry indexes, which we refer to here as each store's dispatchToken
		* @usage:
		* case 'TODO_CREATE':
		*   dispatcher.waitFor([
		*     PrependedTextStore.dispatchToken,
		*     YetAnotherStore.dispatchToken
		*   ]);
		* 	TodoStore.create(PrependedTextStore.getText() + '' + action.text);
		*   TodoStore.emit('change');
		*   break;
		* @return {void}
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

				_callbacks[ACTION].forEach(_handlerFn(handler));

				if (!_handler) {
					throw new Error('dispatcher.waitFor(...):' + token + ' does not map to a registered callback.');
				}

				_isPending[token] = true;
				_handler.callback.apply(_handler.context || null);
				_isHandled[token] = true;
			}
		}
	});

    return Dispatcher;
}());

	/**
 * @fileOverview contains the main application object that is the heart of the
 *               application architecture.
 */

/**
 * @memberof F
 */
F.Core = (function(injector, undefined) {

	// Private
	// ---
	var _config      = { debug: false }, // Global configuration

		// Flag indicating if the application has been initialized.
		_initialized = false,

        _dispatcher  = new F.Dispatcher(),

		// Information about registered services, modules and stores by name
		_services  	 = {},
        _modules     = {}
    ;

    /**
     * Resets all state to its default values
     * @return {void}
     * @private
     */
    function reset() {
    	_config      = {};
    	_services    = {};
    	_modules     = {};
    	_initialized = false;
    }

    /**
	 * Signals that an error has occurred. If in development mode, an error
	 * is thrown. If in production mode, an event is fired.
	 * @param {Error} exception The exception object to use.
	 * @returns {void}
	 * @private
	 */
    function signalError(exception) {
		if (_config.debug)
			throw exception;
		else
			_dispatcher.publish('error', { exception: exception });
	}

	/**
	 * Global error event handler.
	 * @param  {string} message      error message
	 * @param  {string} file         URL of the script where the error was raised
	 * @param  {number} lineNumber   Line number where error was raised
	 * @param  {number} columnNumber Column number for the line where the error occurred
	 * @param  {Error} exception     the error object
	 * @return {boolean}             When the function returns true, this prevents the firing of the default event handler.
	 */
	function onerror(message, file, lineNumber, columnNumber, exception) {
		if (_config.debug)
			return false;

		if (exception === undefined)
			exception = new Error(message, file, lineNumber);

    	signalError(exception);
    	return true;
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
						signalError(ex);
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

	/**
	 * Core class definition.
	 * @class Core
	 */
    function Core() {
    	F.injector.register('core', this);
    }

    F.compose(Core.prototype, {

    	// App lifecycle
		// ---

		/**
		 * Initializes the application.
		 * @memberOf Core
		 * @param {object} options the configuration object for the core.
		 * @return {void}
		 */
		init: function(options) {
			_config = F.compose({}, _config, options);

			// Setup global error tracking before anything else runs.
			window.addEventListener('error', onerror);

			this.startAll(document.documentElement);

			_dispatcher.publish('app init');
			_initialized = true;
		},

		/**
		 * Stops all modules and clears all saved state.
		 * @memberOf Core
		 * @returns {void}
		 */
		destroy: function() {
			this.stopAll(document.documentElement);

			window.removeEventListener('error', onerror);
			reset();
		},

		// Registration Hooks
		// ---

		/**
		 * Method used to add services on the core.
		 * @memberOf Core
		 * @param  {string}   serviceName  unique service name. This name will be used when injecting the service
		 * @param  {Array}    dependencies   list of dependencies this service relies on. Generally these are other services
		 * @param  {function} factory        the service factory function
		 * @param  {object}   options        options for the service initialization
		 * @return {void}
		 *
		 * @example
		 * var core = new F.Core();
		 *
		 * var loggerSvcFactory = function(){
		 *	    var Logger = F.Service.extend({
		 *	        init: function(options) {},
		 *	        log: function(obj) { console.log(obj);}
		 *	    });
		 *
		 *	    return new Logger();
		 * };
		 *
		 * core.registerService("logger", [], loggerSvcFactory, {});
		 *
		 * var calculatorSvcFactory = function(logger) {
		 * 		var Calculator = F.Service.extend({
		 * 			init: function(options) {},
		 * 			add: function(a,b) {return a+b;},
		 * 			subtract: function(a,b) {return a-b;}
		 * 		});
		 *
		 * 		return new Calculator();
		 * }
		 *
		 * core.registerService("calculator", ["logger"], calculatorSvcFactory, {})
		 */
		registerService : function(serviceName, dependencies, factory, options) {
			if (_services.hasOwnProperty(serviceName)) {
				return signalError(new Error("Service '"  + serviceName + "' already registered."));
			}

			dependencies = dependencies || [];
			options = options || {};

		    dependencies.push(factory);

		    var service = F.injector.resolve(dependencies);
		    service.init(options);
		    _services[serviceName] = service;

		    F.injector.register(serviceName, service);
		},

		/**
		 * Method used to register modules on the core.
		 * @memberOf Core
		 * @param  {string}   moduleName  unique module identifier
		 * @param  {Array}    services  List of services this module relies on.
		 *                              These are the only services the module will be allowed to use.
		 * @param  {function} factory     the module's factory function
		 * @param  {object}   options     options for the module initialization
		 * @return {void}
		 */
		registerModule: function(moduleName, services, factory, options) {
			if (_modules.hasOwnProperty(moduleName)) {
				return signalError(new Error("Module with given name has already been registered. Mod name: " + moduleName));
			}

			_modules[moduleName] = {
				factory    : factory,
				services   : services,
				options    : options,
				instance   : null
			};
		},

		// Module lifecycle
		// ---

		/**
		 * Starts a given module on a DOM element.
		 * @memberOf Core
		 * @param  {string} moduleName unique module identifier
		 * @param  {Element} element    the DOM element to which the module will be tied
		 * @return {void}
		 */
		start: function(moduleName, element) {
			if (!_modules.hasOwnProperty(moduleName)) {
				return signalError(new Error("Trying to start non-registered module: " + moduleName));
			}

			element = element || document.querySelector('[data-module="' + moduleName + '"');

			var module = _modules[moduleName];
			var sandbox = new F.Sandbox(this, moduleName, element);
			module.instance = new module.factory(sandbox, moduleName, module.options);

			var services = {};

			var i; // loop controller variable

			for (i = 0; i < module.services.length; i++) {
				var svcName = module.services[i];

				if (_services.hasOwnProperty(svcName))
					services[svcName] = _services[svcName];
				else
					return signalError(new Error("Module requires an unregistered services: " + svcName));
			}

			// Prevent errors from showing the browser, fire event instead
			if (!_config.debug) {
				productionize(module.instance, moduleName);
			}

			module.instance.start(element, services);
		},

		/**
		 * Stops a given module.
		 * @memberOf Core
		 * @param  {string} moduleName unique module identifier
		 * @return {void}
		 */
		stop: function(moduleName) {
			var data = _modules[moduleName];

			if (!(data && data.instance)) {
				return signalError(new Error('Unable to stop module: ' + moduleName));
			}

			data.instance.stop();
			data.instance = null;
		},

		/**
		 * Restarts the given module.
		 * @memberOf Core
		 * @param  {string} moduleName unique module identifier
		 * @return {void}
		 */
		restart: function(moduleName) {
			this.stop(moduleName);
			this.start(moduleName);
		},

		/**
		 * Starts all registered modules within an element.
		 * @memberOf Core
		 * @param {root} root DOM Element bellow which all the modules will be started.
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
		 * @memberOf Core
		 * @param {root} root DOM Element bellow which all the modules will be stopped.
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
		 * @memberOf Core
		 * @todo don't expose the dispatcher. Proxy its methods instead.
		 * @type {F.Dispatcher}
		 */
    	dispatcher: _dispatcher,

    	// Routing
    	// ---

    	/**
    	 * The router for anchor management
    	 * @memberOf Core
    	 * @todo  don't expose the router. Proxy its methods instead.
    	 * @type {F.Router}
    	 */
    	// router: router,

		// Config
		// ---

		/**
		 * Returns configuration data
		 * @memberOf Core
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
		 * @memberOf Core
		 * @param {Object} config the configuration to merged to the existing configuration
		 * @return {void}
		 * @throws {Error} If core is already initialized.
		 */
		setConfig: function(config) {
			if (_initialized)
				return signalError(new Error('Cannot set configuration after application is initialized'));

			_config = F.compose({}, _config, config);
		},

		// Services
		// ---

		/**
		 * Checks if the `Core` has a `Service` with the given name registered.
		 * @memberOf Core
		 * @param  {string}  serviceName the name of the service to be checked
		 * @return {Boolean}             true if the service is registered
		 *                               false otherwise
		 */
		hasService: function(serviceName) {
			return _services.hasOwnProperty(serviceName);
		},

		/**
		 * Convenience method used by `Module`s to get dynamically get
		 * `Service`s during runtime, instead of using DI
		 * @memberOf Core
		 * @param  {string} serviceName the name of the service we want
		 * @return {Object}             the instance of service we're trying to get.
		 * @throws {Error} If no service with given name is registed
		 */
		getService: function(serviceName) {
			if (!_services.hasOwnProperty(serviceName))
				return signalError(new Error("Extension '" + serviceName + "' Not found"));
			return _services[serviceName];
		},

		// Error reporting
		// ---

		/**
		 * Signals that an error has occurred. If in development mode, an error
		 * is thrown. If in production mode, an event is fired.
		 * @memberOf Core
		 * @param {Error} [exception] The exception object to use.
		 * @returns {void}
		 */
		reportError: signalError
	});

    Core.extend = F.extend;
	return Core;
}(F.injector));

	/**
 * @fileOverview contains the Sandbox definition which is an abstraction
 * 				 into the `Core` for use by `Module`s to interact with
 * 				 the environment.
 */

/**
 * @memberof F
 */
F.Sandbox = (function(undefined){

	/**
	 * @class Sandbox
	 * @param  {Core} core - the application core
	 * @param  {String} moduleName - the module name
	 * @param  {HTMLElement} element - the element under which this sandbox has control
	 * @return {void}
	 */
	function Sandbox (core, moduleName, element) {
		this.core = core;
		this.moduleName = moduleName;
    	this.element = element;
	}

	// Attach all inheritable methods to the Sandbox prototype.
	F.compose(Sandbox.prototype, {
		/**
		* Checks if a module can publish a certain event.
		* By default any module can publish. Override with your implementation.
		*
		* @memberof Sandbox
		* @param  {String} moduleName - The Id of the module for which we're checking permissions
		* @param  {String} channel - The event for we're checking if module has permission to publish to
		* @return {Boolean} - true if module can publish. false otherwise
		*/
		moduleCanPublish : function (moduleName, channel) {
			return true; // no-op
		},

		/**
		* Publishes data into the core's dispatcher.
		*
		* @memberof Sandbox
		* @method
		*
		* @param {String} channel - the channel into which the message will be published
		* @param {Object} data - the data to be published
		* @param {Function} callback - a callback to be called once publishing is done
		* @param {Object} context - the context under which the callback will be called
		* @returns {void}
		*/
		publish : function (channel, data, callback, context) {
			if ( this.moduleCanPublish(this.moduleName, channel) ) {
				this.core.dispatcher.publish.call(channel, data);
			}
		},

		/**
		 * Checks if a module can publish an action
		 * @memberof Sandbox
		 * @method
		 * @abstract
		 *
		 * @param  {string} moduleName unique module identifier
		 * @param  {string} actionType unique action type identifier
		 * @return {boolean} flag indicate if the module can dispatch the given action type.
		 */
		moduleCanDispatchAction: function(moduleName, actionType) {
			return true; // no-op
		},

		/**
		 * Publishes an action using the internal dispatcher creator.
		 * This could also be done using an action creator
		 *
		 * @memberof Sandbox
		 * @method
		 *
		 * @param {string} type the type of action being dispatched
		 * @param {*} data the data being dispatched
		 * @return {void}
		 */
		dispatch: function(type, data) {
			if (!this.moduleCanDispatchAction(this.moduleName, type)) {
				throw new Error("module "
                                + this.moduleName
                                + " is not authorized to create action of type: "
                                + type);
            }

            var action = {type: type, data: data};
			this.core.dispatcher.dispatch(action);
		},

		/**
		* Subscribes to a channel of the core's dispatcher
		* @memberof Sandbox
		* @method
		*
		* @param {String} channel - the channel to which messages will be listened
		* @param {Function} callback - the function to be executed when a message in the channel is published
		* @param {Object} context - the context under which the callback will be called
		* @returns {string} the subscription dispatch token
		*/
		subscribe : function (channel, callback, context) {
			return this.core.dispatcher.subscribe(channel, callback, context);
		},

		/**
		* Unsubscribes to a channel of the core's dispatcher.
		*
		* @memberof Sandbox
		* @method
		*
		* @param {String} channel - the channel in which we want to unsubscribe the callback
		* @param {Function} callback - the function which we want to remove
		* @returns {void}
		*/
		unsubscribe : function (channel, callback) {
			this.core.dispatcher.unsubscribe(channel, callback);
		},

		/**
		* Returns global configuration data for this instance of the module.
		*
		* @memberof Sandbox
		* @method
		* @param {String} name - Specific config parameter
		* @returns {*} config value or the entire configuration JSON object
		*                if no name is specified (null if either not found)
		*/
		getConfig : function (name) {
			return this.core.getConfig(this.element, name);
		},

		/**
		* Pass-through method that signals that an error has occurred. If in development mode, an error
		* is thrown. If in production mode, an event is fired.
		*
		* @memberof Sandbox
		* @method
		*
		* @param {Error} exception - the exception object to use
		* @returns {void}
		*/
		reportError : function (exception) {
			return this.core.reportError(exception);
		},

		/**
		 * Checks if the `Core` has a `Service` with the given name registered.
		 * @memberof Sandbox
		 * @param  {string}  serviceName the name of the service to be checked
		 * @return {Boolean}             true if the service is registered
		 *                               false otherwise
		 */
		hasService: function(serviceName) {
			return this.core.hasService(extensionName);
		},

		/**
		 * Convenience method used by `Module`s to get dynamically get
		 * `Service`s during runtime, instead of using DI.
		 * @memberof Sandbox
		 * @param  {string} serviceName the name of the service we want
		 * @return {Object}             the instance of service we're trying to get.
		 * @throws {Error} If no service with given name is registered
		 */
		getService: function (serviceName) {
			return this.core.getService(extensionName);
		},

		/**
		 * Returns the element that represents the module.
		 *
		 * @memberof Sandbox
		 * @method
		 * @returns {HTMLElement} The element representing the module.
		 */
		getElement: function() {
			return this.element;
		}
	});

	Sandbox.extend = F.extend;
	return Sandbox;
}());

	/**
 * @fileOverview contains the basic `Module` definition, which is an
 * independent unit of functionality that is part of the total
 * structure of a web application, consisting of HTML + CSS + JavaScript
 * and which should be able to live on it's own.
 */

/* global F */

F.Module = (function(undefined){

	/**
	 * Module base class definition.
	 *
	 * @class Module
	 * @param {Sandbox} sandbox the modules sandbox
	 * @param {string} name the name of the module
	 * @param {Object} options settings for the module
	 */
	function Module(sandbox, name, options) {
		this._sandbox = sandbox;
		this._name = name;
		this._defaults = {};
		this._options  = {};
		this._services = {};
		this._options = F.compose( {}, this._defaults, options );

		/**
		 * The Module's DOM element
		 * @type {Element}
		 */
		this.$el = null;

		/**
		 * Module's DOM event delegation map.
		 * Mapping is defined in the format: 'event selector' : 'handler'
		 * @type {Object}
		 * @public
		 */
		this.events = {};
	}

	// Attach all inheritable methods to the Module prototype.
	F.compose(Module.prototype, {
		/**
		* Initializes the module on the specified element with the given options
		* Start is an empty function by default. Override it with your own implementation;
		*
		* @memberof Module
		* @method
		* @public
		* @abstract
		*
		* @param {Element} element - DOM element where module will be initialized
		* @param {Object} services - services to be used by module
		* @param {Object} stores - stores to be used by module
		* @returns {void}
		*/
		start : function(element, services) {
			throw new Error("Module initialization not done. Override this function");
		},

		/**
		* Destroys the module by unsubscribing for events and removing it from the DOM
		* Destroy is an empty function by default. Override it with your own implementation;
		* @memberof Module
		* @method
		* @public
		* @abstract
		* @returns {void}
		*/
		stop: function() {
			throw new Error("Module stopping not done. Override this function");
		},

		/**
		 * Replaces the `Module`'s DOM element with another and
		 * redelegates the events associated with the old element to the new.
		 * @memberof Module
		 * @param {Element} element the new `Module`'s DOM element
		 * @returns {void}
		 */
		setElement: function(element) {
			this.$el = element;
			this.undelegateEvents();
			this.delegateEvents();
		},

		/**
		 * Delegates events under the DOM element given by the `Core`
		 * upon initialization.
		 * @memberof Module
		 * @method delegateEvents
		 * @protected
		 * @final
		 *
		 * @param  {Object} events [description]
		 * @return {void}
		 */
		delegateEvents: function(events) {
			events = events || this.events;

            var self = this;

            for (var spec in events) {

                var eventName, selector, handler;

                if (spec.indexOf(" ") === -1) {
                    eventName = spec;
                } else {
                    eventName = spec.slice(0, spec.indexOf(" "));
                    selector = spec.slice(spec.indexOf(" ") + 1, spec.length).trim();
                }

                handler = self[events[spec]];

                F.delegateEvent(self.$el, eventName, selector, handler, self);
            }
        },

        /**
         * Removes the modules's delegated events.
         * @memberof Module
         * @method undelegateEvents
         * @protected
         * @final
         *
         * @param  {Object} events [description]
         * @return {void}
         */
        undelegateEvents: function(events) {
            if (!events)
                return;

            var self = this;

            for (var spec in events) {

                var eventName, selector, handler;

                if (spec.indexOf(" ") === -1) {
                    eventName = spec;
                } else {
                    eventName = spec.slice(0, spec.indexOf(" "));
                    selector = spec.slice(spec.indexOf(" ") + 1, spec.length).trim();
                }

                handler = self[events[spec]];

                F.undelegateEvent(self.$el, eventName, selector, handler, self);
            }
        },

        /**
         * Conventioned render method.
         * Defaults to a no-op but can be overridden with  code that
         * renders the `Module`s template from model data, and updates
         * this.el with the new HTML.
         *
         * @memberof Module
         * @method
         * @protected
         * @abstract
         *
         * @return {void}
         */
        render: function(){}
	});

	Module.extend = F.extend;

	return Module;
}());

    return F;
};

if (typeof define === 'function' && define.amd) {
    define(factory);
} else if (typeof module !== 'undefined' && module.exports) { // Node
    module.exports = factory();
} else {
    window['F'] = factory();
}

}());
