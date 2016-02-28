/**
 * Logging extension.
 * Note: Logging != Error Handling, for one can log things (not errors) for debugging purposes
 * and use logging in error handling uses logging.
 *
 * Console log wrapper with environment and log level definition
 * @see https://github.com/cowboy/javascript-debug/tree/v0.4
 * @see https://github.com/patik/console.log-wrapper
 */

/* global $ */

F.Core.log = F.log = (function(undefined){
	"use strict";

	var ALL 	= "ALL",   // 0
	 	LOG		= "LOG",   // 1
	 	DEBUG	= "DEBUG", // 2
	 	INFO	= "INFO",  // 3
	 	WARN	= "WARN",  // 4
	 	ERROR 	= "ERROR", // 5
	 	FATAL	= "FATAL", // 6
	 	OFF		= "OFF"	   // 7
	;

	var severities = [ALL, DEBUG, INFO, WARN, ERROR, FATAL, OFF];

	var _options = {};

	/**
	 * Checks if we can log a message with a given severity at the current log level
	 * @method
	 * @private
	 * @return {Boolean}
	 */
	function _canLog(severity){
		if (typeof severity === "string") {
			return severities.indexOf(severity) >= severities.indexOf(_options.logLevel);
		} else if(typeof severity === "number") {
			return severity >= severities.indexOf(_options.logLevel);
		} else {
			throw new Error("Invalid Severity Level");
		}
	}

	/**
	* Formats errors
	*
	* @method
	* @private
	*
	* @param {Obj} arg - object to be formatted as error
	*/
	function _formatError(arg) {
		if (arg instanceof Error) {
			if (arg.stack) {
				arg = (arg.message && arg.stack.indexOf(arg.message) === -1) ? 
					'Error: ' + arg.message + '\n' + arg.stack : 
					arg.stack;
			} else if (arg.sourceURL) {
				arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
			}
		}
		return arg;
	}

	/**
	 * logs messages with a specific log level
	 * @method
	 * @private
	 *
	 * @param {Number} severity - the severity number
	 * @param {String} msg - the log message
	 * @param {Object} obj - an object following the message. Usualy an error
	 */
	function _log (severity, msg, obj) {

		if(!_canLog(severity))
			return;

		// if env is production log to server
		if (_options.env === 'production') {
			if (!_options.errorLoggingEndpoint){
				throw new Error("No error logging endpoint specified for production environment");
			}

			var img = new Image();
			img.src = _options.errorLoggingEndpoint + '?sev=' +
				encodeURIComponent(severity) +
				'&msg=' + encodeURIComponent(msg);

			return;
		}

		severity = severity.toLowerCase();

		var console = window.console || {},
			logFn = console[severity] || console.log || {}, // instead of an empty object shouldn't it be an empty function
			hasApply = false;

		// Note: reading logFn.apply throws an error in IE11 in IE8 document mode.
		// The reason behind this is that console.log has type "object" in IE8...
		try {
			hasApply = !!logFn.apply;
		} catch (e) {}

		if (hasApply) {
            var args = [];
            for(var i = 0, l = arguments.length; i < l; i++) {
                if (arguments[i])
                    args.push(_formatError(arguments[i]));
            }

            return logFn.apply(console, args);
		}

		// we are IE which either doesn't have window.console => this is noop and we do nothing,
		// or we are IE where console.log doesn't have apply so we log at least first 2 args
		return function(arg1, arg2) {
			logFn(arg1, arg2 === null ? '' : arg2);
		};
	}

	/**
	 * @constructor
	 * @param {Object} options - the options for the new logger
	 */
	var Logger = function(options) {

		var defaults = {
			logLevel : ALL,
			env	: 'development',
			errorLoggingEndpoint: null
		};

		_options = $.extend( {}, defaults, options );
	};


	Logger.prototype = {
		/**
		* gets the log level
		* @getter
		* @return {String}
		*/
		getLogLevel : function (){
			return _options.logLevel;
		},

		/**
		* Sets the minimum log Level
		* @param {String} value - the new log level
		* @setter
		*/
		setLogLevel : function (level) {
			var severities = [ALL, DEBUG, INFO, WARN, ERROR, FATAL, OFF];

			if(typeof level !== "string" || severities.indexOf(level) === -1){
				throw new Error("Invalid log level");
			}

			_options.logLevel = level;
		},

		/**
		* Sets the logging environment
		* @param {String} value - the new environment
		* @setter
		*/
		setEnv: function(value) {
			_options.env = value;
		},

		/**
		* Sets the logging endpoint for production mode
		* @param {String} value - the new error logging endpoint
		*/
		setErrorLoggingEndpoint : function (value){
			_options.errorLoggingEndpoint = value;
		},

		// Public API
		// ----------

		/**
		* Logs a message with a given severity
		* @method
		* @public
		*/
		log : function (severity, msg, obj){
			if(!_canLog(severity))
				return;

			switch(severity) {
				case DEBUG:
					this.debug(msg, obj);
					break;
				case INFO:
					this.info(msg, obj);
					break;
				case WARN:
					this.warn(msg, obj);
					break;
				case ERROR:
					this.error(msg, obj);
					break;
				case FATAL:
					this.error(msg, obj);
					break;
				default:
					this.debug(msg, obj);
					break;
			}
		},

		/**
		* Logs a debug message
		* @method
		* @public
		* @param {String} msg - the message
		* @param {Object} obj - accompanying object
		*/
		debug : function(msg, obj) { _log(DEBUG, msg, obj); },

		/**
		* Logs an informational message
		* @method
		* @public
		* @param {String} msg - the message
		* @param {Object} obj - accompanying object
		*/
		info : function(msg, obj) { _log(INFO, msg, obj); },

		/**
		* Logs a warning message
		* @method
		* @public
		* @param {String} msg - the message
		* @param {Object} obj - accompanying object
		*/
		warn : function(msg, obj) { _log(WARN, msg, obj); },

		/**
		* Logs an error message
		* @method
		* @public
		* @param {String} msg - the message
		* @param {Object} obj - accompanying object
		*/
		error : function(msg, obj) { _log(ERROR, msg, obj); },

		/**
		* Logs a fatal message
		* @method
		* @public
		* @param {String} msg - the message
		* @param {Object} obj - accompanying object
		*/
		fatal: function(msg, obj) { _log(FATAL, msg, obj); }
	};

	return new Logger();
}());