/**
 * Flux Store
 *
 * Is where the `Core` and all of our feature `Modules` access data and business
 * logic in our SPA.
 */

F.Store = (function(undefined){
	"use strict";

	var CHANGE = 'CHANGE',
		ACTION = 'ACTION';

	var Store = function (dispatcher, name) {
		this._dispatcher = dispatcher;
		this._name = name;

		// Indicates if this store is updating.
		// When updating must not accept dispatch calls.
		this._isUpdating = false;

		this._data = [];
		this.actions = {};

		this.init.apply(this, arguments);
	};

	// Attach all inheritable methods to the Store prototype.
	F.compose(Store.prototype, {

		/**
		* Initialize is an empty function by default. Override it with your own
		* initialization logic.
		* 
		* @param {PubSub} dispatcher - the dispatcher
		* @param {String} name - the name of this store
		*/
		init : function() {
			throw new Error("Store initialization not done. Override this function");
		},

		/**
		* Allows views to subscribe to this store's change event
		* @param {function} callback
		*/
		addChangeListener: function(callback) {
			// Create _callbacks object, unless it already exists
			var calls = this._callbacks || (this._callbacks = {});

			// Create an array for the given event key, unless it exists, then
			// append the callback to the array
			(this._callbacks[CHANGE] || (this._callbacks[CHANGE] = [])).push({ callback : callback });
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
	});

	Store.extend = F.extend;
	return Store;
}());