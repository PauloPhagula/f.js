/**
 * Dispatcher - the communication / app nexus / pub-sub extension
 *
 * Taken from: Facebook Dispatcher and Alex MacCaw - JavaScript Web Applications - Pag.28
 *
 * The Flux dispatcher is different from pub-sub in two ways
 * 1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 * 2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 * But since we need to support both, if we're using actions then we use the channel as 'ACTION'
 * so all participants in Flux can listen
 *
 * @check https://facebook.github.io/flux/docs/dispatcher.html
 * @usage:
 * // creating the callback
 * var fn = function(payload) { alert('wem!'); }
 *
 * // subscribing
 * PubSub.subscribe('wem', fn);
 *
 * // publishing
 * PubSub.publish('wem');
 *
 * // unsubscribing
 * PubSub.unsubscrube('wem', fn);
 */
F.dispatcher = (function(){
	"use strict";

	var _prefix = 'ID_';
	var ACTION = 'ACTION';

	var
		_isDispatching = false,
		_isHandled = {},
		_isPending = {},
		_lastID = 1,
		_pendingPayload = null
	;

	return {
		/**
		* Registers a callback to be called when an event is published.
		* returns a token that can be used with `waitfFor()`
		* @method
		* @public
		*
		* @param {String} channel - event / channel / action
		* @param {Function} callback - the callback to be registered
		* @param {Object} context - the object under whiches context the callback is to be called
		*/
		subscribe: function (channel, callback, context) {
			// Create _callbacks object, unless it already exists
			var calls = this._callbacks || (this._callbacks = {});

			// Create an array for the given event key, unless it exists, then
			// append the callback to the array
			var id = _prefix + _lastID++;
			(this._callbacks[channel] || (this._callbacks[channel] = [])).push({ callback: callback, context: context, id: id });
			return id;
		},

		/**
		* Deregisters a callback for an event
		* @method
		* @public
		*
		* @param {String} channel
		* @param {Function} callcack - the callback to be unregistered
		*/
		unsubscribe: function (channel, callback) {

			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list, calls, i, l;
			if (!(calls = this._callbacks[channel])) return this;
			if (!(list = this._callbacks[channel])) return this;

			// remove callback
			for (i = 0, l = list.length; i < l; i++) {
				var handler = list[i];
				if (handler === callback) {
					list.splice(i);
				}
			}
		},

		/**
		* Publishes an event and callsback all subscribers to that event
		* @method
		* @public
		*
		* @param {String} eventName - the event / channel / action name
		* @param {Object} payload - the data to be published for the event / channel / action
		*/
		publish: function () {
			// Turn arguments object into a real array
			var args = Array.prototype.slice.call(arguments, 0);
			// Extract the first argument, the event name
			var ev = args.shift();

			if (ev === ACTION) {

				/*
				if(!this._isDispatching){
					throw new Error('dispatcher.publish(...): Cannot dispatch in the middle of a dispatch');
				}
				*/
				this._start(args);

				try {
					var list, calls, i, l;
					if (!(calls = this._callbacks)) return;
					if (!(list = this._callbacks[ACTION])) return;

					for (i = 0, l = list.length; i < l; i++) {
						var handler = list[i];
						if (_isPending[handler.id]) {
							continue;
						}
						handler.callback.apply(handler.context || null, args);
					}
				} finally {
					this._stop();
				}

				return;
			}

			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list1, calls1, i1, l1;
			if (!(calls1 = this._callbacks)) return;
			if (!(list1 = this._callbacks[ev])) return;

			// Invoke the callbacks
			for (i1 = 0, l1 = list1.length; i1 < l1; i1++) {
				var handler1 = list1[i1];
				handler1.callback.apply(handler1.context || null, args);
			}

			return;
		},

		/**
		* Helper method to publish an action
		* @param {Object} payload - the action to be published
		* Payload : {
		*   type : 'action-name',
		*   data : {}
		* }
		*/
		dispatch: function (payload) {
			this.publish(ACTION, payload);
		},

		/**
		* Waits for the callbacks specified to be invoked before continuing execution
		* of the current callback. This method should only be used by a callback in
		* response to a dispatched payload.
		*
		* When `waitFor()` is encountered in a callback, it tells the Dispatcher to invoke the callbacks for the required stores.
		* After these callbacks complete, the original callback can continue to execute.
		* Thus the store that is invoking `waitFor()` can depend on the state of another store to inform how it should update its own state.
		*
		* A problem arises if we create circular dependencies.
		* If Store A waits for Store B, and B waits for A, then we could wind up in an endless loop.
		* The Dispatcher will flag these circular dependencies with console errors.
		*
		* @param {Array} dispatchTokens - an array of dipatcher registry indexes, which we refer to here as each store's dispatchToken
		* @usage:
		* case 'TODO_CREATE':
		*   dispatcher.waitFor([
		*     PrependedTextStore.dispatchToken,
		*     YeatAnotherstore.dispatchToken
		*   ]);
		* 	 TodoStore.create(PrependedTextStore.getText() + '' + action.text);
		*   TodoStore.emit('chage');
		*   break;
		*/
		waitFor: function (dispatchTokens) {
			/*
			if (!this.isDispatching) {
				throw new Error('dispatcher.waitFor(...): Must be invoked while dispatching');
			}
			*/
			var _handlerFn = function (handler) {
				if (handler.id === token) {
					_handler = handler;
				}
			};
				
			for (var i = 0; i < dispatchTokens.length; i++) {
				var token = dispatchTokens[i];
				if (_isPending[token]) {
					if (!_isHandled[token]) {
						throw new Error('dispatcher.waitFor(...): Circular dependency detected while waiting for ' + token);
					}
					continue;
				}

				var _handler = null;
				
				this._callbacks[ACTION].forEach(_handlerFn(handler));

				if (!_handler) {
					throw new Error('dispatcher.waitFor(...):' + token + ' does not map to a registered callback.');
				}

				_isPending[token] = true;
				_handler.callback.apply(_handler.context || null);
				_isHandled[token] = true;
			}
		},

		/**
		* Setup booking used for dispatching
		*/
		_start: function (payload) {
			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list, calls, i, l;
			if (!(calls = this._callbacks)) return;
			if (!(list = this._callbacks[ACTION])) return;

			// Invoke the callbacks
			for (i = 0, l = list.length; i < l; i++) {
				var handler = list[i];
				_isPending[handler.id] = false;
				_isHandled[handler.id] = false;
			}
			_pendingPayload = payload;
			_isDispatching = true;
		},

		/**
		* Clear booking used for dispatching
		*/
		_stop: function () {
			_pendingPayload = null;
			_isDispatching = false;
		}
	};
}());