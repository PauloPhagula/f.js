/**
 * @fileOverview contains the dispatcher definition used for
 * 				 communication in the application.
 *
 * @see:
 * https://facebook.github.io/flux/docs/dispatcher.html
 * Alex MacCaw - JavaScript Web Applications - Pag.28
 *
 * The Flux dispatcher is different from pub-sub in two ways
 * 1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 * 2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 * Since we need to support both, if we're publishing actions then
 * we use the 'ACTION' channel, so all participants in Flux can listen
 *
 * @usage:
 *
 * // creating the dispatcher
 * var dispatcher = F.Dispatcher();
 *
 * // creating the callback
 * var fn = function(payload) { alert('wem!'); }
 *
 * // subscribing
 * dispatcher.subscribe('wem', fn);
 *
 * // publishing
 * dispatcher.publish('wem');
 *
 * // unsubscribing
 * dispatcher.unsubscribe('wem', fn);
 */

/**
 * @memberOf F
 */
F.Dispatcher = (function(undefined){ "use strict";

	/**
	 * @class Dispatcher
	 */
	function Dispatcher() {}

	var
		/**
		 * @constant {String} PREFIX
		 * @description the dispatch token prefix.
		 * @private
		 */
		PREFIX = 'ID_',
		/**
		 * @constant {String} ACTION
		 * @description the action dispatch channel name.
		 * @private
		 */
		ACTION = 'ACTION',

		_isDispatching = false,
		_isHandled = {},
		_isPending = {},
		_callbacks = {},
		_lastID = 1,
		_pendingPayload = null,

		/**
		 * Utility function to throw errors when attemping other operations
		 * during ongoing `dispatch`.
		 * @memberOf Dispatcher
		 *
		 * @param  {String} methodName the name of the method attempted
		 *                             to run
		 * @return {void}
		 * @throws {Error} If Dispatcher is dispatching
		 */
		_throwIfDispatching = function(methodName) {
			if (_isDispatching) {
				throw new Error('Cannot run '
					+ methodName
					+ 'in the middle of a dispatch.'
				);
			}
		},

		/**
		 * Setup booking used for dispatching.
		 * @memberOf Dispatcher
		 * @private
		 *
		 * @param {object} payload the dispatch payload
		 * @returns {void}
		 */
		_startDispatching = function (payload) {
			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list, calls, i, l;
			if (!(calls = _callbacks)) return;
			if (!(list = _callbacks[ACTION])) return;

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
		 * Clear booking used for dispatching.
		 * @memberOf Dispatcher
		 * @private
		 * @returns {void}
		 */
		_stopDispatching = function () {
			_pendingPayload = null;
			_isDispatching = false;
		}
	;

	F.compose(Dispatcher.prototype, {

		/**
		* Registers a callback to be called when an event is published.
		* returns a token that can be used with `waitfFor()`.
		* @memberOf Dispatcher
		* @method
		* @public
		*
		* @param {String} channel - event / channel / action
		* @param {Function} callback - the callback to be registered
		* @param {Object} context - the object under whiches context the callback is to be called
		* @returns {string} the subscription registration token
		*/
		subscribe: function (channel, callback, context) {
			_throwIfDispatching('Dispatcher.subscribe(...)');
			// Create _callbacks object, unless it already exists
			_callbacks = _callbacks || (_callbacks = {});

			// Create an array for the given event key, unless it exists, then
			// append the callback to the array
			var id = PREFIX + _lastID++;
			(_callbacks[channel] || (_callbacks[channel] = [])).push({
				callback: callback,
				context: context,
				id: id
			});
			return id;
		},

		/**
		* De-registers a callback for an event.
		* @memberOf Dispatcher
		* @method
		* @public
		*
		* @param {String} channel the channel on which to subscribe
		* @param {Function} callback the callback to be unsubscribed
		* @returns {void}
		*/
		unsubscribe: function (channel, callback) {
			_throwIfDispatching('Dispatcher.subscribe(...)');
			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list, calls, i, l;
			if (!(calls = _callbacks)) return this;
			if (!(list = _callbacks[channel])) return this;

			// remove callback
			for (i = 0, l = list.length; i < l; i++) {
				var handler = list[i];
				if (handler === callback) {
					list.splice(i);
				}
			}
		},

		/**
		* Publishes an event and calls back all subscribers to that event.
		* @memberOf Dispatcher
		* @method
		* @public
		*
		* @param {String} eventName - the event / channel / action name
		* @param {Object} payload - the data to be published for the event / channel / action
		* @returns {void}
		*/
		publish: function () {
			// Turn arguments object into a real array
			var args = Array.prototype.slice.call(arguments, 0);
			// Extract the first argument, the event name
			var ev = args.shift();

			if (ev === ACTION) {
				_startDispatching(args);

				try {
					var list, calls, i, l;

					if (!(calls = _callbacks))
                        return;

					if (!(list = _callbacks[ACTION]))
                        return;

					for (i = 0, l = list.length; i < l; i++) {
						var handler = list[i];

                        if (!handler) {
                            continue;
                        }

                        if (typeof handler.callback != 'function') {
                            continue;
                        }

                        if (_isPending[handler.id]) {
							continue;
						}

						handler.callback.apply(handler.context || null, args);
					}
				} catch (error) {
                } finally {
					_stopDispatching();
				}

				return;
			}

			// Return if there isn't a _callbacks object, or
			// if it doesn't contain an array for the given event
			var list1, calls1, i1, l1;
			if (!(calls1 = _callbacks)) return;
			if (!(list1 = _callbacks[ev])) return;

			// Invoke the callbacks
			for (i1 = 0, l1 = list1.length; i1 < l1; i1++) {
				var handler1 = list1[i1];
                if (handler1 && (typeof handler1.callback === 'function')) {
                    handler1.callback.apply(handler1.context || null, args);
                }
			}
		},

		/**
		* Helper method to publish an action.
		* @memberOf Dispatcher
		* @param {Object} payload - the action to be published
		* Payload : {
		*   type : 'action-name',
		*   data : {}
		* }
		* @returns {void}
		*/
		dispatch: function (payload) {
			_throwIfDispatching('Dispatcher.dispatch(...)');

            F.guardThat(typeof payload === 'object', 'payload should be an object');
            F.guardThat('type' in payload && typeof payload.type === 'string' && payload.type.length > 0, 'payload.type should be a string');
            F.guardThat('data' in payload && typeof payload.data === 'object', 'payload.data should be an object');

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
		* @memberOf Dispatcher
		*
		* @param {Array} dispatchTokens - an array of dispatcher registry indexes, which we refer to here as each store's dispatchToken
		* @usage:
		* case 'TODO_CREATE':
		*   dispatcher.waitFor([
		*     PrependedTextStore.dispatchToken,
		*     YetAnotherStore.dispatchToken
		*   ]);
		* 	TodoStore.create(PrependedTextStore.getText() + '' + action.text);
		*   TodoStore.emit('change');
		*   break;
		* @return {void}
		*/
		waitFor: function (dispatchTokens) {
			_throwIfDispatching('Dispatcher.waitFor(...)');

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

				_callbacks[ACTION].forEach(_handlerFn(handler));

				if (!_handler) {
					throw new Error('dispatcher.waitFor(...):' + token + ' does not map to a registered callback.');
				}

				_isPending[token] = true;
				_handler.callback.apply(_handler.context || null);
				_isHandled[token] = true;
			}
		}
	});

    return Dispatcher;
}());
