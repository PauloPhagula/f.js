/**
 * @fileOverview contains the main application object that is the heart of the
 * application architecture.
 */

/**
 * @memberof F
 */
F.Core = (function(injector) { 'use strict';

    F.assert(injector !== undefined);

	// Private
	// ---
	var
        // Global configuration
        _config,

		// Flag indicating if the application has been initialized.
		_initialized,

        // app wide dispatcher
        _dispatcher,

		// Information about registered services, modules and stores by name
		_services,
        _modules,

        // Global error handler
        _errorHandler
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
	 * default global error event handler.
	 * @param  {string} message      error message
	 * @param  {string} file         URL of the script where the error was raised
	 * @param  {number} lineNumber   Line number where error was raised
	 * @param  {number} columnNumber Column number for the line where the error occurred
	 * @param  {Error} exception     the error object
	 * @return {boolean}             When the function returns true, this prevents the firing of the default event handler.
	 */
	function defaultErrorHandler(message, file, lineNumber, columnNumber, exception) {
         exception = exception || {};

		if (_config.debug)
			return false;

		var errorData = {
            message: message,
            file: file,
            line: lineNumber,
            column: columnNumber,
            error: {
                name: 'name' in exception ? exception.name : '',
                message: 'message' in exception ? exception.message : '',
                stack: 'stack' in exception ? exception.stack: ''
            }
        };

        signalError(errorData);
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
     * @mixes F.Dispatcher
	 * @class Core
	 */
    function Core() {
        F.injector.register('core', this);

        // initialize private members per core
        _config = { debug: false }; // Global configuration

		// Flag indicating if the application has been initialized.
		_initialized = false;

        _dispatcher = new F.Dispatcher();

		// Information about registered services, modules and stores by name
		_services = {};
        _modules = {};

        // error handler
        _errorHandler = defaultErrorHandler;
    }

    F.compose(Core.prototype, {

        // App lifecycle
		// ---

		/**
		 * Initializes the application.
		 * @memberOf Core
		 * @param {Object} options the configuration object for the core.
		 * @return {void}
		 */
		init: function(options) {
			_config = F.compose({}, _config, options);

			// Setup global error tracking before anything else runs.
			window.addEventListener('error', _errorHandler);

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

			window.removeEventListener('error', _errorHandler);
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
		 *	    return {
		 *		init: function(options) {},
		 *		log: function(obj) { console.log(obj); }
		 *	    };
		 * };
		 *
		 * core.registerService("logger", [], loggerSvcFactory, {});
		 *
		 * var calculatorSvcFactory = function(logger) {
		 *		return {
		 *			init: function(options) {},
		 *			add: function(a, b) {
         *              logger.log("adding ...");
         *              return a + b;
         *          },
		 *			subtract: function(a, b) {
         *              logger.log("subtracting ...");
         *              return a - b;
         *          }
		 *		};
		 * }
		 *
		 * core.registerService("calculator", ["logger"], calculatorSvcFactory, {})
		 */
		registerService : function(serviceName, dependencies, factory, options) {
            F.assert(serviceName && typeof serviceName === 'string' && serviceName.length > 0, 'serviceName should be a non-zero length string');
            F.assert(dependencies && Object.prototype.toString.call(dependencies) === '[object Array]', 'dependencies should be an array');
            F.assert(factory && typeof factory === 'function', 'factory should be a function');
            F.assert(options && typeof options === 'object', 'options should be an object');

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
            F.assert(moduleName && typeof moduleName === 'string' && moduleName.length > 0, 'moduleName should be a non-zero length string');
            F.assert(services && Object.prototype.toString.call(services) === '[object Array]', 'services should be an array');
            F.assert(factory && typeof factory === 'function', 'factory should be a function');
            F.assert(options && typeof options === 'object', 'options should be an object');

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
            F.assert(moduleName && typeof moduleName === 'string' && moduleName.length > 0, 'moduleName should be a non-zero length string');

			if (!_modules.hasOwnProperty(moduleName)) {
				return signalError(new Error("Trying to start non-registered module: " + moduleName));
			}

			element = element || document.querySelector('[data-module="' + moduleName + '"]');

            // Wish I could guard for the type of element but doing it in JS in crazy
            // F.assert(element instanceof HTMLElement, 'element should be an HTMLElement');
            F.assert(element !== undefined && element !== null, 'element must be given or exist in DOM with data-module="' + moduleName +'"');

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
            F.assert(moduleName && typeof moduleName === 'string' && moduleName.length > 0, 'moduleName should be a non-zero length string');

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
            F.assert(moduleName && typeof moduleName === 'string' && moduleName.length > 0, 'moduleName should be a non-zero length string.');

			this.stop(moduleName);
			this.start(moduleName);
		},

		/**
		 * Starts all registered modules.
		 * @memberOf Core
         * @param {Array} modules list of modules to be started
		 * @return {void}
		 */
		startAll: function(modules) {
			for (var moduleName in (modules || _modules)) {
				if (_modules.hasOwnProperty(moduleName)) {
					this.start(moduleName);
				}
			}

			return this;
		},

		/**
		 * Stops all registered modules.
		 * @memberOf Core
         * @param {Array} modules list of modules to be stopped
		 * @return {void}
		 */
		stopAll: function(modules) {
			for (var moduleName in (modules || _modules)) {
				if (_modules.hasOwnProperty(moduleName)) {
					this.stop(moduleName);
				}
			}

			return this;
		},

        // Messaging
        // ---

        subscribe: function() {
            _dispatcher.subscribe.apply(_dispatcher, arguments);
            return this;
        },

        unsubscribe: function() {
            _dispatcher.unsubscribe.apply(_dispatcher, arguments);
            return this;
        },

        publish: function() {
            // F.Dispatcher.prototype.publish.apply(this, arguments);
            _dispatcher.publish.apply(_dispatcher, arguments);
            return this;
        },

        dispatch: function() {
            _dispatcher.dispatch.apply(_dispatcher, arguments);
            return this;
        },

        waitFor: function() {
            _dispatcher.waitFor.apply(_dispatcher, arguments);
            return this;
        },

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
            if (typeof config !== 'object')
                return signalError(new Error('configuration should be an object'));

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
            F.assert(serviceName && typeof serviceName === 'string' && serviceName.length > 0, 'serviceName should be a non-zero length string');
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
            F.assert(serviceName && typeof serviceName === 'string' && serviceName.length > 0, 'serviceName should be a non-zero length string');

			if (!_services.hasOwnProperty(serviceName)) {
                return signalError(new Error("Extension '" + serviceName + "' Not found"));
            }

			return _services[serviceName];
		},

		// Error reporting
		// ---

        setErrorHandler: function(errorHandler){
            _errorHandler = errorHandler;
        },

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
