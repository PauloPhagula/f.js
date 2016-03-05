/**
 * Core
 *
 * The `Core` contains the main application object that is the heart of the 
 * application architecture.
 */

/* global injector */

F.Core = (function(injector, dispatcher, undefined) {
	"use strict";

	var _extensions = {},
        _modules    = {},
        _stores	    = {}
    ;

    function Core() {}

    F.compose(Core.prototype, {

    	dispatcher: dispatcher,

		/**
		 * Method used to add extensions on the core.
		 * @param  {string}  extensionName  unique extension name. This name will be used when injecting the extension
		 * @param  {array}   dependencies   list of dependencies this extension relies on. Generally these are other extensions
		 * @param  {functon} factory        the extension factory function
		 * @param  {object}  options        options for the extension initialization
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
				throw new Error("An extension with the given name has already been registered. Ext name: " + extensionName);

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
			if (_extensions.hasOwnProperty(moduleName))
				throw new Error("Module with given name has already been registered. Mod name: " + moduleName);

			_modules[moduleName] = {
				factory    : factory,
				extensions : extensions,
				stores 	   : stores,
				options    : options,
				instance   : null
			};
		},

		/**
		 * Starts a given module on a DOM element.
		 * @param  {string} moduleName unique module identifier
		 * @param  {string} element    the DOM element to which the module will be tied
		 * @return {void}
		 */
		start: function(moduleName, element) {
			if (!_modules.hasOwnProperty(moduleName))
				throw new Error("Trying to start non-registered module: " + moduleName);

			var module = _modules[moduleName];
			var sandbox = new F.Sandbox(this, moduleName, element);
			module.instance = new module.factory(sandbox, moduleName, module.options);

			var extensions = {};
			var stores     = {};
			
			for (var i = 0; i < module.extensions.length; i++) {
				var extName = module.extensions[i];

				if (_extensions.hasOwnProperty(extName))
					extensions[extName] = _extensions[extName];
				else
					throw new Error("Module requires an unregistered extensions: " + extName);
			}

			for (var i = 0; i < module.stores.length; i++ ) {
				var storeName = module.stores[i];

				if (_stores.hasOwnProperty(storeName))
					stores[storeName] = _stores[storeName];
				else
					throw new Error("Module requires an unregistered store: " + storeName);
			}

			module.instance.start(element, extensions, stores);
		},

		/**
		 * Stops a given module.
		 * @param  {string} moduleName unique module identifier
		 * @return {void}
		 */
		stop: function(moduleName) {
			var data = _modules[moduleName];
			if(data.instance){
				data.instance.stop();
				data.instance = null;
			}
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
		 * Starts all registered modules.
		 * @return {void}
		 */
		startAll: function() {
			for (var moduleName in _modules){
				if(_modules.hasOwnProperty(moduleName)){
					this.start(moduleName);
				}
			}
		},

		/**
		 * Stops all registered modules.
		 * @return {void}
		 */
		stopAll: function() {
			for (var moduleName in _modules){
				if(_modules.hasOwnProperty(moduleName)){
					this.stop(moduleName);
				}
			}
		},

		/**
		 * Reports errors in the system.
		 * @param  {int}    severity severity level
		 * @param  {string} msg      message
		 * @param  {object} obj      object to complemenet the message
		 * @return {void}
		 */
		reportError: function(severity, msg, obj) {
			this.log(severity, msg, obj);
		},

		/**
		 * Initialize is an empty function by default. Override it with your own logic.
		 * @return {void}
		 */
		init: function() {}
	});

    Core.extend = F.extend;
	return Core;
}(F.injector, F.dispatcher));