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
