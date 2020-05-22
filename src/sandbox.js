/**
 * @fileOverview contains the Sandbox definition which is an abstraction
 * into the `Core` for use by `Module`s to interact with the environment.
 */

/**
 * @memberOf F
 */
F.Sandbox = (function(){

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
	F.compose(Sandbox.prototype,
        /** @lends Sandbox.prototype */
        {

        // Messaging
        // ---

		/**
		* Checks if a module can publish a certain event.
		* By default any module can publish. Override with your implementation.
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
		* @param {String} channel - the channel into which the message will be published
		* @param {Object} data - the data to be published
		* @param {Function} callback - a callback to be called once publishing is done
		* @param {Object} context - the context under which the callback will be called
		* @returns {void}
		*/
		publish : function (channel, data, callback, context) {
			if ( this.moduleCanPublish(this.moduleName, channel) ) {
				this.core.publish(channel, data);

                if (typeof callback !== 'function') {
                    return;
                }

                if (typeof context === 'object') {
                   return callback.call(context);
                }

                callback();
			}
		},

		/**
		 * Checks if a module can publish an action
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
		 * @param {string} type the type of action being dispatched
		 * @param {*} data the data being dispatched
		 * @return {void}
		 */
		dispatch: function(type, data) {
			if (!this.moduleCanDispatchAction(this.moduleName, type)) {
				throw new Error("module " + this.moduleName + " is not authorized to create action of type: " + type);
            }

            var action = {type: type, data: data};
			this.core.dispatch(action);
		},

		/**
		* Subscribes to a channel of the core's dispatcher
		*
		* @param {String} channel - the channel to which messages will be listened
		* @param {Function} callback - the function to be executed when a message in the channel is published
		* @param {Object} context - the context under which the callback will be called
		* @returns {string} the subscription dispatch token
		*/
		subscribe : function (channel, callback, context) {
			this.core.subscribe(channel, callback, context);
		},

        /**
         * Subscribes to a channel of the core's dispatcher for a single message
         *
         * @param {String} channel - the channel to which messages will be listened
         * @param {Function} callback - the function to be executed when a message in the channel is published
         * @param {Object} context - the context under which the callback will be called
         * @returns {string} the subscription dispatch token
         */
        subscribeOnce: function(channel, callback, context) {
            this.core.subscribesubscribeOnce(channel, callback, context);
        },

		/**
		* Unsubscribes to a channel of the core's dispatcher.
		*
		* @param {String} channel - the channel in which we want to unsubscribe the callback
		* @param {Function} callback - the function which we want to remove
		* @returns {void}
		*/
		unsubscribe : function (channel, callback) {
			this.core.unsubscribe(channel, callback);
		},

        // config

		/**
		* Returns global configuration data for this instance of the module.
		*
		* @param {String} name - Specific config parameter
		* @returns {*} config value or the entire configuration JSON object
		*                if no name is specified (null if either not found)
		*/
		getConfig : function (name) {
			return this.core.getConfig(this.element, name);
		},

        // reporting

		/**
		* Pass-through method that signals that an error has occurred. If in development mode, an error
		* is thrown. If in production mode, an event is fired.
		*
		* @param {Error} exception - the exception object to use
		* @returns {void}
		*/
		reportError : function (exception) {
			this.core.reportError(exception);
		},

		/**
		 * Checks if the `Core` has a `Service` with the given name registered.
		 * @param  {string}  serviceName the name of the service to be checked
		 * @return {Boolean}             true if the service is registered
		 *                               false otherwise
		 */
		hasService: function(serviceName) {
			return this.core.hasService(serviceName);
		},

		/**
		 * Convenience method used by `Module`s to get dynamically get
		 * `Service`s during runtime, instead of using DI.
		 * @param  {string} serviceName the name of the service we want
		 * @return {Object}             the instance of service we're trying to get.
		 * @throws {Error} If no service with given name is registered
		 */
		getService: function (serviceName) {
			return this.core.getService(serviceName);
		},

		/**
		 * Returns the element that represents the module.
		 *
		 * @returns {HTMLElement} The element representing the module.
		 */
		getElement: function() {
			return this.element;
		}
	});

	Sandbox.extend = F.extend;
	return Sandbox;
}());
