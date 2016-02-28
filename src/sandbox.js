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