/**
 * @fileOverview contains the dispatcher definition used for
 *				 communication in the application.
 *
 * As a flux dispatcher it is a simple mechanism for distributing the
 * actions to the stores.
 *
 * @see:
 * https://facebook.github.io/flux/docs/dispatcher.html
 * Alex MacCaw - JavaScript Web Applications - Pag.28
 *
 * The Flux dispatcher is different from pub-sub in two ways:
 *
 * 1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 * 2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * Since we need to support both, if we're publishing actions then
 * we use the 'ACTION' channel, so all stores in Flux can listen.
 *
 * @usage:
 *
 * // creating the dispatcher
 * var dispatcher = new F.Dispatcher();
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
F.Dispatcher = (function(){ 'use strict';

    /**
     * @class Dispatcher
     */
    function Dispatcher() {}

    var
        /**
         * @constant {String} DISPATCH_TOKEN_PREFIX
         * @description the dispatch token prefix.
         * @private
         */
        DISPATCH_TOKEN_PREFIX = 'ID_',

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
                throw new Error('Cannot run ' + methodName + ' in the middle of a dispatch.');
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
            var actionHandlers;
            if (!_callbacks) return;
            if (!(actionHandlers = _callbacks[ACTION])) return;

            // Invoke the callbacks
            for (var i = 0; i < actionHandlers.length; i++) {
                var handler = actionHandlers[i];
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
            _pendingPayload = null; // delete _pendingPayload;
            _isDispatching = false;
        },

        /**
         * Get the callback stored with the given id.
         * @private
         * @param {String} id - the dispatch token ID
         * @return {Object} - the callback
         */
        _getActionHandler = function(id) {
            var handler = _callbacks[ACTION].filter(function(handlerItem){
                return handlerItem.id === id;
            })[0];

            if (!handler || typeof handler.callback !== 'function') {
                return;
            }

            return handler;
        },

        /**
         * Call the callback stored with the given id. Also do some internal
         * bookkeping.
         * @private
         * @param {String} id - the dispatch token ID
         * @returns {void}
         */
        _invokeCallback = function(id) {
            var handler = _getActionHandler(id);

            _isPending[id] = true;
            handler.callback.apply(handler.context || null, _pendingPayload);
            _isHandled[id] = true;
        };

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
            var id = DISPATCH_TOKEN_PREFIX + _lastID++;
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
            var messageHandlers;
            if (!(_callbacks)) return this;
            if (!(messageHandlers = _callbacks[channel])) return this;

            // remove callback
            for (var i = 0; i < messageHandlers.length; i++) {
                var handler = messageHandlers[i];
                // http://stackoverflow.com/questions/9817629/how-do-i-compare-2-functions-in-javascript#9817699
                if (''+handler.callback == ''+callback) {
                    messageHandlers.splice(i);
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
        * @param {Object} data - the data to be published for the event / channel / action
        * @returns {void}
        */
        publish: function () {
            // Turn arguments object into a real array
            var args = Array.prototype.slice.call(arguments, 0);
            // Extract the first argument, the event name
            var channel = args.shift();
            var data = args;

            if (channel === ACTION) {
                _throwIfDispatching('Dispatcher.dispatch(...)');
                _startDispatching(data);

                try {
                    var actionHandlers;

                    if (!_callbacks)
                        return;

                    if (!(actionHandlers = _callbacks[ACTION]))
                        return;

                    for (var i = 0; i < actionHandlers.length; i++) {
                        var handler = actionHandlers[i];

                        if (!handler) {
                            continue;
                        }

                        if (typeof handler.callback != 'function') {
                            continue;
                        }

                        if (_isPending[handler.id]) {
                            continue;
                        }

                        handler.callback.apply(handler.context || null, _pendingPayload);
                    }
                } finally {
                    _stopDispatching();
                }

                return;
            }

            // Return if there isn't a _callbacks object, or
            // if it doesn't contain an array for the given event
            var messageHandlers, j;
            if (!_callbacks) return;
            if (!(messageHandlers = _callbacks[channel])) return;

            // Invoke the callbacks
            for (j = 0; j < messageHandlers.length; j++) {
                var messageHandler = messageHandlers[j];
                if (messageHandler && (typeof messageHandler.callback === 'function')) {
                    messageHandler.callback.apply(messageHandler.context || null, data);
                }
            }
        },

        /**
        * Helper method to publish an action.
        * @memberOf Dispatcher
        * @param {Object} action - the action to be published
        * @param {string} action.type - the action type
        * @param {Object} action.payload - the action data
        * action : {
        *   type : 'action-name',
        *   payload : {}
        * }
        * @returns {void}
        */
        dispatch: function (action) {
            F.assert(typeof action === 'object', 'payload should be an object');
            F.assert('type' in action && typeof action.type === 'string' && action.type.length > 0, 'action.type should be a string');
            F.assert('payload' in action, 'action.payload should present');

            this.publish(ACTION, action);
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
        *	TodoStore.create(PrependedTextStore.getText() + '' + action.text);
        *   TodoStore.emit('change');
        *   break;
        * @return {void}
        */
        waitFor: function (dispatchTokens) {
            F.assert(F.isArray(dispatchTokens));

            if (!_isDispatching) {
                throw new Error('Dispatcher.waitFor(...): Must be invoked while dispatching.')
            }

            for (var i = 0; i < dispatchTokens.length; i++) {
                var token = dispatchTokens[i];

                if (_isPending[token]) {
                    if (!_isHandled[token]) {
                        throw new Error('dispatcher.waitFor(...): Circular dependency detected while waiting for ' + token);
                    }
                    continue;
                }

                var handler = _getActionHandler(token);

                if (!handler) {
                    throw new Error('dispatcher.waitFor(...): ' + token.toString() + ' does not map to a registered callback.');
                }

                _invokeCallback(token);
            }
        },

        /**
         * Is this Dispatcher currently dispatching.
         * @returns {boolean} true if dispatching false otherwise.
         */
        isDispatching: function(){
            return _isDispatching;
        }
    });

    Dispatcher.ACTION = ACTION;

    return Dispatcher;
}());
