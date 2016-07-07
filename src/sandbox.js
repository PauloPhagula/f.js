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
