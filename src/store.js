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

;F.Store = (function(undefined){
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
			* When updating must not accept
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
		addChangeListener : function(callback) {
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
		removeChangeListener:function(callback) {
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
		emitChange:function() {
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
	}
}());