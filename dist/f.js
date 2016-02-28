/*!
 * F - a JavaScript framework for modular and scalable SPAs
 */

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 4,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/* global define */
/* global global */
/* global jQuery, _ */

var F = (function(){
    "use strict";

    // Initial Setup
    // -------------

    // Save the previous value of the `F` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var F = {};
    var previousF = F;

    // Current version of the library. Keep in sync with `package.json`.
    F.VERSION = '0.0.2';

    // Set framework to debug mode. Disabled by default
    F.DEBUG = false;

    // Runs F.js in *noConflict* mode, returning the `F` variable
    // to its previous owner. Returns a reference to this F object.
    F.noConflict = function() {
        F = previousF;
        return this;
    };

    // Extensions Plugging
    // -------------------
    /*
    F.Core = Core;
    F.Core.dispatcher = Dispatcher; // don't expose the dispatcher. Only core has it
    F.Core.http = Http;
    F.Core.log = F.log = new Log();
    F.Sandbox = Sandbox;
    F.Store = Store;
    F.util = Util;
    F.http = Http;
    F.$ = DOM;
    F.Storage = Storage;
    F.Module = Mod;

    F.router = Router;
    // We can use backbone views or riot components
    // F.BackboneView = View;

    // Shortcuts
    // ---------
    F.ready = Util.ready;
    F.extend = Util.extend;
    */
   
    
    return F;
}());
/**
 * Utilities Extension for the core
 */

/* global jQuery, _ */
F.util = (function($, _, undefined){
	"use strict";

	// Thanks to Andrea Giammarchi
	var
		reEscape = /[&<>'"]/g,
		reUnescape = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g,
		oEscape = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			"'": '&#39;',
			'"': '&quot;'
		},
		oUnescape = {
			'&amp;'	: '&',
			'&#38;'	: '&',
			'&lt;'	: '<',
			'&#60;'	: '<',
			'&gt;'	: '>',
			'&#62;'	: '>',
			'&apos;': "'",
			'&#39;'	: "'",
			'&quot;': '"',
			'&#34;'	: '"'
		},
		fnEscape = function (m) {
			return oEscape[m];
		},
		fnUnescape = function (m) {
			return oUnescape[m];
		}
	;

	return {
		each	: $.each,

		// Composes objects by combining them into a new
		compose	: _.extend,

		/**
		 * Helper function to correctly set up the prototype chain for subclasses.
		 * Similar to `goog.inherits`, but uses a hash of prototype properties and
		 * class properties to be extended.
		 *
		 * Taken from Backbone.js of Jeremy Ashkenas
		 * @see https://github.com/jashkenas/backbone/blob/master/backbone.js#L1839
		 * 
		 * @param  {Object} protoProps - the instance properties for the *Class*
		 * @param  {Object} staticProps - the static properties for the *Class*
		 * @return {Function} - a new constructor function
		 */
		extend : function(protoProps, staticProps) {
			var parent = this;
			var child;

			// The constructor function for the new subclass is either defined by you
			// (the "constructor" property in your `extend` definition), or defaulted
			// by us to simply call the parent constructor.
			if (protoProps && _.has(protoProps, 'constructor')) {
			  child = protoProps.constructor;
			} else {
			  child = function(){ return parent.apply(this, arguments); };
			}

			// Add static properties to the constructor function, if supplied.
			_.extend(child, parent, staticProps);

			// Set the prototype chain to inherit from `parent`, without calling
			// `parent`'s constructor function and add the prototype properties.
			child.prototype = _.create(parent.prototype, protoProps);
			child.prototype.constructor = child;

			// Set a convenience property in case the parent's prototype is needed
			// later.
			child.__super__ = parent.prototype;

			return child;
		},
		ready	: $.ready,
		escape 	: fnEscape,
		unescape: fnUnescape,
		replace : String.prototype.replace,

		/**
		 * Generetes a almost Global Unique Identifier (GUID)
		 * @return {[type]} [description]
		 */
		uuid	: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
					.toString(16);
			}

			return uuid;
		},

		/**
		* @see https://lodash.com/docs#template		
		* @see https://engineering.linkedin.com/frontend/client-side-templating-throwdown-mustache-handlebars-dustjs-and-more		
		*/		
		template : _.template,

		/**
		 * Makes an object production-ready
		 * TO-DO: update method to use ES6 Proxies
		 * @see https://www.nczonline.net/blog/2009/04/28/javascript-error-handling-anti-pattern/
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
		productionize: function(object){
			var name,
        		method;

			for (name in object){
				method = object[name];
				if (typeof method === "function"){
					object[name] = function(name, method){
						return function(){
							try {
								return method.apply(this, arguments);
							} catch (ex) {
								// this should use our logger from the core
								console.log(1, name + "(): " + ex.message);
							}
						};
					}(name, method);
				}
			}
		},

		/*
		* memoize.js
		* by @philogb and @addyosmani
		* with further optimizations by @mathias
		* and @DmitryBaranovsk
		* perf tests: http://bit.ly/q3zpG3
		* Released under an MIT license.
		*/
		memoize: function(fn) {
			return function () {
				var args = Array.prototype.slice.call(arguments),
					hash = "",
					i = args.length,
					currentArg = null;
				while (i--) {
					currentArg = args[i];
					hash += (currentArg === Object(currentArg)) ? 
                        JSON.stringify(currentArg) : 
                        currentArg;
					fn.memoize || (fn.memoize = {});
				}
				return (hash in fn.memoize) ? fn.memoize[hash] :
				fn.memoize[hash] = fn.apply(this, args);
			};
		},

		/**
         * Sets a name/value pair which is stored in the browser and sent to the server
         * with every request. This is also known as a cookie. Be careful setting
         * cookies, because they can take up a lot of bandwidth, especially for Ajax
         * applications.
         *
         * @param {String}  name     cookie name
         * @param {String}  value    cookie value
         * @param {Date}    expire   expire date representing the number of milliseconds
         *                           since 1 January 1970 00:00:00 UTC.
         * @param {String}  path     path name
         * @param {String}  domain   domain name
         * @param {Boolean} secure   cookie may benefit all the documents and CGI programs
         *                           meet the requirements as to the path and domain
         *                           compatibility
         *     Possible values:
         *     true   may benefit
         *     false  can not benefit
         *
         * @return {String} Returns a cookie name.
         */
        setcookie: function(name, value, expire, path, domain, secure) {
            var ck = name + "=" + escape(value) + ";";
            if (expire) ck += "expires=" + new Date(expire +
                new Date().getTimezoneOffset() * 60).toGMTString() + ";";
            if (path)   ck += "path=" + path + ";";
            if (domain) ck += "domain=" + domain + ";";
            if (secure) ck += "secure";

            document.cookie = ck;
            return value;
        },

        /**
         * Gets the value of a stored name/value pair called a cookie.
         *
         * @param {String} name the name of the stored cookie.
         * @return {String} Returns a value of the cookie or the empty string if it isn't found
         */
        getcookie: function(name) {
          var aCookie = document.cookie.split("; ");
          for (var i = 0; i < aCookie.length; i++) {
              var aCrumb = aCookie[i].split("=");
              if (name == aCrumb[0])
                  return unescape(aCrumb[1]);
          }

          return "";
        },

        /**
         * Deletes a stored name/value pair called a cookie.
         *
         * @param {String} name     the name of the stored cookie
         * @param {String} domain   the name of the domain of stored cookie
         */
        delcookie: function (name, domain){
            document.cookie = name + "=blah; expires=Fri, 31 Dec 1999 23:59:59 GMT;" + (domain ? 'domain='+domain : '');
        }
	};
}(jQuery, _));

F.ready = F.util.ready;
F.extend = F.util.extend;
F.compose = F.util.compose;
/**
 * Core aka Shell aka Application Wide Controller aka Mediator
 * Contains the main application object that is the heart of the JavaScript architecture
 * Responsabilities:
 *   - Manages the lifecyle of modules (registers, starts, renders and stops modules)
 *   - Manages communication between modules
 *   - Coordinates feature modules, dispatching feature specific tasks
 *   - Managing the application state using Anchor Interface Pattern
 *   - Manages application wide features/interfaces such as URL anchor(hash fragment), feature containers, cookies
 *   - Detects, traps and reports errors in the system. Uses available information to determine best course of action
 *   - Allows loose coupling between modules that are related to one another
 *   - Error management will also be handled by the application core
 *   - Be extensible
 */

/* global riot */

F.Core = (function(undefined){
	"use strict";

	var
		_modules = {}, // Inited Modules data

		// Cache DOM node and collections
		domMap = {},

		setDomMap,  initModule
	;


	setDomMap = function(){
		//var $container = stateMap.$container;
		// domMap = { $container : $container };
	};

	initModule = function($container){
		// load HTML and map jQuery collections
		// stateMap.$container = $container;

		// Render Main App Component
		// riot.mount($container, 'app', {});
		setDomMap();
	};

	return {
		register: function(moduleId, creator, options){
			_modules[moduleId] = {
				creator: creator,
				options: options,
				instance: null
			};
		},

		start: function(moduleId, element){
			var module = _modules[moduleId];
			module.instance = new module.creator(new F.Sandbox(this, moduleId, element), moduleId, module.options);
			module.instance.start();
		},

		stop: function(moduleId){
			var data = _modules[moduleId];
			if(data.instance){
				data.instance.stop();
				data.instance = null;
			}
		},

		restart: function(moduleId){
			this.stop(moduleId);
			this.start(moduleId);
		},

		startAll: function(){
			for (var moduleId in _modules){
				if(_modules.hasOwnProperty(moduleId)){
					this.start(moduleId);
				}
			}
		},

		stopAll: function(){
			for (var moduleId in _modules){
				if(_modules.hasOwnProperty(moduleId)){
					this.stop(moduleId);
				}
			}
		},

		reportError: function(severity, msg, obj){
			this.log(severity, msg, obj);
		},

		init : initModule
	};
}());
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
F.Core.dispatcher = (function(){
	"use strict";

	var _prefix = 'ID_';
	var ACTION = 'ACTION';

	var
		_isDispatching = false,
		_isHandled = {},
		_isPending = {},
		_lastID = 1,
		_pendingPayload = null
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

				/*
				if(!this._isDispatching){
					throw new Error('dispatcher.publish(...): Cannot dispatch in the middle of a dispatch');
				}
				*/
				this._start(args);

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
					this._stop();
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
		publishAction: function (payload) {
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
		* 	 TodoStore.create(PrependedTextStore.getText() + '' + action.text);
		*   TodoStore.emit('chage');
		*   break;
		*/
		waitFor: function (dispatchTokens) {
			/*
			if (!this.isDispatching) {
				throw new Error('dispatcher.waitFor(...): Must be invoked while dispatching');
			}
			*/
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
		_start: function (payload) {
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
		_stop: function () {
			_pendingPayload = null;
			_isDispatching = false;
		}
	};
}());
/**
 * Sandbox - The facade into the core
 *
 * - Acts as a security guard for the modules, meaning it knows what a module can access
 *   and what cannot. It determines which parts of the framework the modules can access
 * - provide a dependable interface for modules
 * - translate module requests into core actions
 * - ensures a consistent interface for the modules - modules can rely on the methods to always be there
 *
 * The main purpose of the sandbox is to use the facade pattern.
 * In that way you can hide the features provided by the core and only show a well
 * defined custom static long term API to your modules. This is actually one of the
 * most important concept for creating mainainable apps. Change plugins, implementations, etc.
 * but keep your API stable for your modules.
 *
 * For each module a separate sandbox will be created.
 */

F.Sandbox = (function(undefined){
	"use strict";

	/**
	 * @constructor
	 * @param  {Core} core - the application core
	 * @param  {String} moduleId - the module name
	 * @param  {HTMLElement} element - the element underwhich this sandbox has control
	 * @return {void}
	 */
	function Sandbox (core, moduleId, element) {
		this.core 	  = core;
		this.moduleId = moduleId;
    	this.element  = element;
	}

	Sandbox.prototype = {
		/**
		* Checks if a module can publish a certain event. Security check
		* @param  {String} moduleId - The Id of the module for which we're checking permissions
		* @param  {String} channel - The event for we're checking if module has permission to publish to
		* @return {Boolean} - true if module can publish. false otherwise
		*/
		moduleCanPublish : function (moduleId, channel) {
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
			if ( this.moduleCanPublish(this.moduleId, channel) ) {
				this.core.dispatcher.publish.call(channel, data);
			}
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
		* AJAX abstracion
		* @param {String} path - the path to the resource you want to fetch
		* @param {Object} options - the options to be used when making the request
		*/
		request : function (path, options) {
			return this.core.http.request(path, options);
		},

		/**
		* Returns any configuration information that was output into the page
		* for this instance of the module.
		* @param {String} name - Specific config parameter
		* @returns {*} config value or the entire configuration JSON object
		*                if no name is specified (null if either not found)
		*/
		getConfig : function (name) {
			return this.core.getModuleConfig(this.element, name);
		},

		/**
		* Passthrough method that signals that an error has occurred.
		*
		* @param {Number} severity - the severity number
		* @param {String} msg - the log message
		* @param {Object} obj - an object following the message. Usualy an error
		*/
		reportError : function (severity, msg, obj) {
			return this.core.reportError(severity, msg, obj);
		}
	};

	return Sandbox;
}());
/**
 * Flux Store Implementation
 * -------------------------
 *
 * Their role is somewhat similar to a model in a traditional MVC,
 * but they manage the state of many objects — they are not instances of one object(not a model).
 * Nor are they the same as Backbone's collections.
 * More than simply managing a collection of ORM-style * * objects,
 * stores manage the application state for a particular domain within the application.
 *
 * - Data and application for a logical domain
 * - Setup: Register with the dispatcher
 * - Dispatcher calls registered callback
 * - Emits a change event
 * - Public interface: getters, no setters
 *
 * - Setters are forbidden here
 * - Application state is maintained only in the stores
 * - Stores contain the application state and logic.
 *
 * DOES / IS / HAS
 * - is where the Shell and all of our feature modules access data and business logic in our SPA.
 * - any data or logic, that we want to share between feature modules, or is central to the application.
 * - breakeable into more manageable parts.
 *
 * DOESN'T / ISN'T
 * - require a browser.
 * - provide general purpose utilities
 * - communicate directly with the server
 */

F.Store = (function(undefined){
	"use strict";

	var CHANGE = 'CHANGE',
		ACTION = 'ACTION';

	return {

		/**
		* @constructor
		* @param {PubSub} dispatcher - the dispatcher
		* @param {String} name - the name of this store
		*/
		init : function(dispatcher, name) {
			this._dispatcher = dispatcher;
			this._name = name;

			/**
			* indicates if this store is updating.
			* When updating must not accept dispatch calls.
			*/
			this._isUpdating = false;

			this._data = [];
			this.actions = {};
		},

		/**
		* Subscribes to interesting events in the dispatcher
		*/
		setup: function() {
			// subscribe for events
			this.dispatchToken = this._dispatcher.subscribe(ACTION, function(payload){
				switch(payload.type) {
					case '':
						// some logic here
						this.emitChange();
						break;
					default:
						// no-op
				}
			});
		},

		/**
		* Allows views to subscribe to this store's change event
		* @param {function} callback
		*/
		addChangeListener: function(callback) {
			// this.on(CHANGE, callback);
			// Create _callbacks object, unless it already exists
			var calls = this._callbacks || (this._callbacks = {});

			// Create an array for the given event key, unless it exists, then
			// append the callback to the array
			(this._callbacks[CHANGE] || (this._callbacks[CHANGE] = [])).push({ callback : callback });
			// return this;
		},

		/**
		* @param {function} callback
		*/
		removeChangeListener: function(callback) {
			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list, calls, i, l;
			if (!(calls = this._callbacks[CHANGE])) return this;
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
	};
}());
/*

Modules Aka Controller-Views create a meaningful user experience,
ex: a stocks module tell us all we want to know about the stock market

Controller-Views - views often found at the top of the hierarchy that retrieve data from the stores and pass this data down to their children

Responsabilities
- Provides a well-scoped capability to the application.
- Creates and manages its own content (typically HTML and SVG) in a container provided by the sandbox
- Provides a consistent API to the Shell for configuration, initialization, and use
- Is kept isolated from other features by using unique and coordinated JavaScript
and CSS namespaces, and by not allowing any external calls except to shared utilities

Uses the UI Components

- Rules
- Only call your own methods or those in the sandbox
- don't access DOM elements outside of your box
- Don't access non-native global objects
- Anything else you need ask the sandbox
- don't create global objects
- don't directly reference other modules
- modules only know the sandbox, the rest of the architecture doesn't exist to them
- Manage data and views

http://foss-haas.github.io/fynx/
View Components are components that listen to Stores and/or invoke Actions.
According to the philosophy of React, these should usually be the outer most components in an application.
They pass (immutable) data from Stores as props to the underlying Pure Components, the regular self-contained React components.
They may also invoke Actions as the result of user interaction with those components.


It's called mod to avoid colisions with requirejs
*/

/* global riot, $ */
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
		this._defaults = { stores: {} };
		this._options  = {};
		this._options = $.extend( {}, this._defaults, options );
		
		// Access to jQuery and DOM versions of element
		this.$el = null;
		this.el  = null;
	}

	F.compose(Module.prototype, {
		/**
		* initializes the module on the specified element with the given options
		* @param {Element} element - DOM element where module will be initialized
		* @param {Object} stores - stores to be used by module
		*/
		start : function(element, stores) {
			this.el = element;
			this.$el = document.querySelector('[data-module="' + this._name + '"]');


			// Render the module components
			// ----------------------------
			// With React
			// React.render(<MyComponent/>, this.$el);
			//
			// With Backbone
			// var view = new Backbone.View({
			//		render: function(){
			//			this.$el.html('<h1>Hello</h1>')
			//		}
			//	});
			//
			// With Riot
			// riot.mount(this.$el, this._name, this._options);

			// register for listening to events
			// --------------------------------
			// this._sandbox.subscribe(
			//		'channel',
			//		function(payload){
			//			// handle payload
			//		},
			//		this
			// );
		},

		/**
		* Destroys the module by unsubscribing for events and removing it from the DOM
		*/
		stop: function() {
			this.$el.innerHTML = '';
		}
	});

	Module.extend = F.extend;
	return Module;
}());
/**
 * Router - the app router
 *
 * @see https://github.com/mmikowski/urianchor by Mike Mikowski
 * @see http://millermedeiros.github.io/crossroads.js/
 */

/* global jQuery */
/* global crossroads */
/* global uriAnchor */

F.router = (function($, crossroads, undefined){
	"use strict";

	var
		// Dynamic information shared across the module
		stateMap = {
			$container  : null,
			anchorMap	: {
				page : 'home',
				title: 'Home'
			}
		},

		_router = crossroads.create()
	;

	_router.normalizeFn = crossroads.NORM_AS_OBJECT;


	/**
	 * Return copy of stored anchor map; minimizes overhead
	 * @method
	 * @private
	 */
	var copyAnchorMap = function(){
		return $.extend(true, {}, stateMap.anchorMap);
	};

	/**
	 * Handles changes in the hash
	 * @method
	 * @private
	 *
	 * @param {Event} e - the click event
	 */
	var _onHashChange = function(e){
		var
			anchor_map_previous = copyAnchorMap(),
			anchor_map_proposed
		;

		// attempt to parse anchor
		try {
			anchor_map_proposed = $.uriAnchor.makeAnchorMap();
		}
		catch ( error ) {
			$.uriAnchor.setAnchor( anchor_map_previous, null, true );
			return false;
		}

		stateMap.anchorMap = anchor_map_proposed;

		// Change window title
		document.title = anchor_map_proposed.title || '';

		// Get new hash and pass it to crossroads for callback calling.
		var route = '/',
			hash = window.location.hash;
		if (hash.length > 0) {
			route = hash.split('#').pop();
		}
		_router.parse(route);
		return false;
	};

	/**
	 * Handles URL clicks when the router is turned on
	 * @private
	 *
	 * @param {Event} e - the click event
	 */
	var _handleURLClick = function(e){
		// Get the absolute anchor href.
		var href = {
				prop: $(this).prop('href'),
				attr: $(this).attr('href')
			};

		if (href.attr.indexOf('javascript:void(0)') > -1)
			return;

		// Stop the default event to ensure the link will
		// not cause a page refresh.
		e.preventDefault();

		// Navigate away. If possible, construct an object and use this.go(obj)
		window.location.hash = href.attr;
	};

	// Public API
	// --------------

	/**
	 * Creates a new route pattern and add it to crossroads routes collection
	 *
	 * @method addRoute
	 *
	 * @param {String} pattern String pattern that should be used to match against requests
	 * @param {Function} handler Function that should be executed when a request matches the route pattern
	 */
	var add = function(pattern, handler) {
		_router.addRoute(pattern, handler);
	};

	/**
	 * listen to onHashChange event;
	 * get new hash
	 * pass it to crossroads
	 * trigger hashchange in the beggining
	 */
	var start = function() {

		// configure uriAnchor to use our schema
		$.uriAnchor.configModule({
			schema_map : stateMap.anchorMap
		});

		// Handle URI anchor change events.
		// This is done /after/ all feature modules are configured
		// and initialized, otherwise they will not be ready to handle
		// the trigger event, which is used to ensure the anchor
		// is considered on load
		$(window)
			.on( 'hashchange', _onHashChange )
			.trigger( 'hashchange' );

		// delegate URL anchor click
		$(document).on('click', 'a[href]:not([data-external])', _handleURLClick);
	};

	/**
	 * Stops listening for changes on either hash and URL clicks
	 * @method
	 * @public
	 */
	var stop = function(){
		$(window).off('hashchange', _onHashChange);
		$(document).off('click', _handleURLClick);
	};

	/**
	 * changeAnchorPart
	 * @purpose: Changes part of the URI anchor component
	 * @param  {object} args the map describing what part of the URI anchor we want changed.
	 * @return {boolean}
	 *         * true   the anchor portion of the URI was updated
	 *         * false   the anchor portion of the URI could not be updated
	 */
	var go = function(obj) {
		var
			anchorMapRevise = copyAnchorMap(),
			bool_return = true,
			key_name, key_name_dep
		;

		// Merge changes into anchor map
		KEYVAL:
		for(key_name in obj){
			if(obj.hasOwnProperty(key_name)){
				// skip dependent keys during iteration
				if(key_name.indexOf('_') === 0){ continue KEYVAL; }

				// update independent key value
				anchorMapRevise[key_name] = obj[key_name];

				// update matching dependent key
				key_name_dep = '_' + key_name;
				if(obj[key_name_dep]){
					anchorMapRevise[key_name_dep] = obj[key_name_dep];
				}
				else{
					delete anchorMapRevise[key_name_dep];
					delete anchorMapRevise['_s' + key_name_dep];
				}
			}
		}

		// Attempt to update URI; revert if not successful
		try {
			$.uriAnchor.setAnchor(anchorMapRevise);
		}
		catch(error) {
			// replace URI with existing state
			$.uriAnchor.setAnchor(stateMap.anchorMap, null, true);
			bool_return = false;
		}

		return bool_return;
	};

	// Return public methods
	return {
		add		: add,
		go		: go,
		start	: start,
		stop	: stop
	};
}(jQuery, crossroads));
/**
 * AJAX / HTTP Extension
 *
 * - Hide ajax communication details - Modules don't need to know of it
 * - Provide common request interface - Modules use this interfce to specify data to send to the server
 * - Provide common response interface - Modules use this interface to retrive data from the response
 * - Manage server failures - Modules only care if they got what they wanted or not, don't care why
 *
 * @see http://davidwalsh.name/fetch
 * @see https://github.com/github/fetch
 */

/* global fetch */
/* global jQuery */
F.Core.http = F.http = (function($, undefined){
	"use strict";

	var defaults = {
		headers: {
			'Accept'		: 'application/json',
			'Content-Type'	: 'application/json',
		},
		mode		: 'cors',
		cache		: 'default',
		credentials	: 'same-origin' // include cookies
	};

	/**
	 * Checks if a {Response} to a {Request} is non-error
	 * @param {Response} the response to be checked
	 */
	function _checkStatus(response) {
		if (response.status >= 200 && response.status < 300) {
			return response;
		} else {
			var error = new Error(response.statusText);
			error.response = response;
			throw error;
		}
	}

	/**
	 * Converts a response into JSON
	 * @param {Response} the response to be converted
	 * @return {Promise} a promise that resolves to the JSON data after the request
	 */
	function _parseJson(response) {
		return response.json();
	}

	/**
	 * fetches something in the path using HTML5 fetch API
	 * @param {String} path - the path to the resource you want to fetch
	 * @param {Object} options - the options to be used when making the request
	 * @return {Promise} a promise that resolves to the Response of the Request
	 */
	function _fetch(path, options){

		if(options){
			// merge it with the defaults
			options = $.extend( {}, defaults, options );
		}
		return fetch(path, options)
				.then(_checkStatus)
				.then(_parseJson)
				.catch(function(error){
					// notify caller of error
					throw new Error("There's been a problwm with your operation", error);
				});
	}

	/**
	 * Makes an XHR request
	 * @param {Object} the request configuration object
	 */
	function _xhr(path, options){
		return $.ajax(path, options);
	}

	// Public API
	// ----------

	/**
	 * Common interface. It will use fetch for new browsers and $.ajax for older implementation internally
	 * @param {String} path - the path to the resource you want to fetch
	 * @param {Object} options - the options to be used when making the request
	 */
	function request(path, options){
		if(window.fetch && typeof window.fetch === 'function'){
			return _fetch(path, options);
		} else {
			return _xhr(path, options);
		}
	}

	// Return public methods
	return {
		request: request
	};
}(jQuery));
/**
 * DOM Extension for the core.
 * It exposes the same interface always but allows choosing the implementation from a available list of implementations
 *
 * Maybe instead of trying to wrap jQuery just return an instance of it.
 * - Pro argument: Save LOC
 * - Con argument: If we, decide to switch from jQuery, we must keep the same interface, so we don't affect the rest of the app
 */

/* global jQuery */
F.$ = (function($, undefined){
	"use strict";

	return {

		/**
		 * Returns the first element that is a descendant of the element
		 * on which it is invoked that matches the specified group of selectors.
		 * @param {HTMLElement} root parent element to query off of
		 * @param {string} selector query string to match on
		 *
		 * @returns {HTMLElement} first element found matching query
		 */
		query: function(root, selector) {
			// Aligning with native which returns null if not found
			return $(root || 'html').find(selector)[0] || null;
		},

		/**
		 * Returns a non-live NodeList of all elements descended from the
		 * element on which it is invoked that match the specified group of CSS selectors.
		 * @param {HTMLElement} root parent element to query off of
		 * @param {string} selector query string to match on
		 *
		 * @returns {Array} elements found matching query
		 */
		queryAll: function(root, selector) {
			return $.makeArray($(root).find(selector));
		},

		/**
		 * Adds event listener to element via jquery
		 * @param {HTMLElement} element Target to attach listener to
		 * @param {string} type Name of the action to listen for
		 * @param {function} listener Function to be executed on action
		 *
		 * @returns {void}
		 */
		on: function(element, type, listener) {
			$(element).on(type, listener);
		},

		/**
		 * Removes event listener to element via jquery
		 * @param {HTMLElement} element Target to remove listener from
		 * @param {string} type Name of the action remove listener from
		 * @param {function} listener Function to be removed from action
		 *
		 * @returns {void}
		 */
		off: function(element, type, listener) {
			$(element).off(type, listener);
		},

		/**
		 * Changes or get an HTMLElement Css properties
		 * @param  {HTMLElement} element Target to get or change css properties
		 * @param  {PlainObject} props   Object with css properties to be set on element
		 *
		 * @see http://api.jquery.com/css/
		 *
		 * @return {void}
		 */
		css: function(element, props) {
			$(element).css(props);
		}
	};
}(jQuery));
/**
 * Storage extension for the core.
 * Initial code taken from CacheProvider of Dustin Diaz (@ded)
 * http://www.dustindiaz.com/javascript-cache-provider/
 *
 * Taken from Cache provider from paramana of Gia (@bonejp).
 */

F.storage = (function(undefined){
"use strict";

// values will be stored here
    var CacheProvider = {},
        _cache        = {};

    CacheProvider = {
        /**
         * {String} k - the key
         * {Boolean} local - get this from local storage?
         * {Boolean} o - is the value you put in local storage an object?
         */
        get: function(k, local, o) {
            if (local && CacheProvider.hasLocalStorage) {
                var action = o ? 'getObject' : 'getItem';
                return localStorage[action](k) || undefined;
            }
            else {
                return _cache[k] || undefined;
            }
        },
        /**
         * {String} k - the key
         * {Object} v - any kind of value you want to store
         * however only objects and strings are allowed in local storage
         * {Boolean} local - put this in local storage
         */
        set: function(k, v, local) {
            if (local && CacheProvider.hasLocalStorage) {
                try {
                    localStorage.setItem(k, v);
                }
                catch (ex) {
                    if (ex.name == 'QUOTA_EXCEEDED_ERR') {
                        // developer needs to figure out what to start invalidating
                        throw v;
                    }
                }
            }
            else {
                // put in our local object
                _cache[k] = v;
            }
            // return our newly cached item
            return v;
        },
        /**
         * {String} k - the key
         * {Boolean} local - put this in local storage
         */
        clear: function(k, local) {
            if (local && CacheProvider.hasLocalStorage) {
                localStorage.removeItem(k);
            }
            // delete in both caches - doesn't hurt.
            delete _cache[k];
        },
        /**
         * Empty the cache
         *
         * {Boolean} all - if true clears everything and the varibles cache
         */
        empty: function(all) {
            if (CacheProvider.hasLocalStorage)
                localStorage.clear();

            if (all)
                _cache = {};
        }
    };

    try {
        CacheProvider.hasLocalStorage = ('localStorage' in window) && window.localStorage !== null;
    }
    catch (ex) {
        CacheProvider.hasLocalStorage = false;
    }

    return CacheProvider;
}());