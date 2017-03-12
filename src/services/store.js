/**
 * @fileOverview Flux Store definition where the `Core` and all feature
 * 				 `Modules` access data and business logic in our SPA.
 *
 */

F.Store = (function(undefined){ "use strict";

	var CHANGE = 'CHANGE',
		ACTION = 'ACTION';

	/**
	 *
	 * Store definition
	 * @class Store
	 *
	 * @param {F.Dispatcher} core the application on which the store
	 *                                  listens for action messages
	 */
	function Store (core) {
		var self = this;
		this.core = core;

		this._changed = false;
		this._data = [];

		/**
		 * Execute the flow of a dispatch handling.
		 *
		 * @memberOf Store
		 * @method _dispatchFlow
		 * @private
		 *
		 * @param  {Object} payload the content of the dispatch
		 * @return {void}
		 */
		this._dispatchFlow = function(payload) {
			self._changed = false;
			self._handleDispatch(payload);
			if (self._changed) {
				self.emitChange();
			}
		};


		self._dispatchToken = core.dispatcher.subscribe(ACTION, this._dispatchFlow);
		this.actions = {};
		this.init.apply(this, arguments);
	}

	// Attach all inheritable methods to the Store prototype.
	F.compose(Store.prototype, F.Dispatcher.prototype, {

		/**
		 * Initialize is an empty function by default. Override it with your own
		 * initialization logic.
		 *
		 * @memberOf Store
		 * @method init
		 * @public
		 *
		 * @param {Object} options - the stores options
		 * @returns {void}
		 */
		init : function(options) {
			throw new Error("Store initialization not done. Override this function");
		},

		/**
		 * Handles the payload of a dispatch.
		 *
		 * @memberOf Store
		 * @method  _handleDispatch
		 * @protected
		 * @abstract
		 *
		 * @param  {Object} payload the content of the dispatch
		 * @return {void}
		 */
		_handleDispatch : function(payload) {
			throw new Error("Store payload handling not done. Override this function");
		},

		/**
		 * This exposes a unique string to identify each store's registered callback.
		 * This is used with the dispatcher's waitFor method to declaratively depend
		 * on other stores updating themselves first.
		 *
		 * @memberOf Store
		 * @method getDispatchToken
		 * @public
		 *
		 * @returns {string} the stores dispatch token
		 */
		getDispatchToken: function() {
			return this._dispatchToken;
		},

		/**
		 * Allows views to subscribe to this store's change event.
		 *
		 * @memberOf Store
		 * @method addChangeListener
		 * @public
		 *
		 * @param {function} callback the function to be called when the `CHANGE` event fires
		 * @returns {void}
		 */
		addChangeListener: function(callback) {
			this.subscribe(CHANGE, callback);
		},

		/**
		 * Allows views to unsubscribe to this store's change event.
		 *
		 * @memberOf Store
		 * @method removeChangeListener
		 * @public
		 *
		 * @param {function} callback the callback function being removed
		 * @returns {void}
		 */
		removeChangeListener: function(callback) {
			this.unsubscribe(CHANGE, callback);
		},

		/**
		 * Runs the callbacks which were registered by views on this store.
		 *
		 * @memberOf Store
		 * @method emitChange
		 * @private
		 *
		 * @returns {void}
		 */
		emitChange: function() {
			this.publish(CHANGE, null);
		}
	});

	Store.extend = F.extend;
	return Store;
}());
