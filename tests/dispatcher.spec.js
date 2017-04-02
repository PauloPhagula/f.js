describe('Dispatcher', function(){ 'use strict';

    var dispatcher,
        messageHandler = {
            messageCallback: function(action) { return action; },
            actionCallback: function(action) { return action; }
        },
        actionCallbackSpy,

        MESSAGE_CHANNEL = 'message',
        ACTION_CHANNEL = 'ACTION',
        ACTION_PAYLOAD = {
            type : 'demo-action',
            payload : {}
        }
    ;

    beforeEach(function(){
        dispatcher = new F.Dispatcher();
        spyOn(messageHandler, 'messageCallback').and.callThrough();
        actionCallbackSpy = spyOn(messageHandler, 'actionCallback').and.callThrough();
    });

    it('should subscribe handler to channel', function(){
        expect(dispatcher.subscribe).not.toThrow();
        dispatcher.subscribe(MESSAGE_CHANNEL, messageHandler.messageCallback);
    });

    it('should call channel subscribers when message is published on channel', function(){
        expect(dispatcher.publish).not.toThrow();
        dispatcher.subscribe(MESSAGE_CHANNEL, messageHandler.messageCallback);
        dispatcher.publish(MESSAGE_CHANNEL, 'payload');
        expect(messageHandler.messageCallback).toHaveBeenCalled();
    });

    it('should call the channel subcribers when message is published on the channel only once', function(){
        expect(dispatcher.publish).not.toThrow();
        dispatcher.subscribeOnce(MESSAGE_CHANNEL, messageHandler.messageCallback);
        dispatcher.publish(MESSAGE_CHANNEL, 'payload');
        dispatcher.publish(MESSAGE_CHANNEL, 'payload');
        expect(messageHandler.messageCallback).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe to message', function(){
        expect(dispatcher.unsubscribe).not.toThrow();
        dispatcher.subscribe(MESSAGE_CHANNEL, messageHandler.messageCallback);
        dispatcher.unsubscribe(MESSAGE_CHANNEL, messageHandler.messageCallback);
    });

    it('should dispatch action payload in action channel', function(){
        dispatcher.subscribe(ACTION_CHANNEL, messageHandler.messageCallback);
        expect(function(){ dispatcher.dispatch(ACTION_PAYLOAD)}).not.toThrow();
        expect(messageHandler.messageCallback).toHaveBeenCalled();
    });

    it('should remain in a consistent state after a failed dispatch', function(){

        function setupWeirdCondition() {
            dispatcher.subscribe(ACTION_CHANNEL, messageHandler.actionCallback);
            dispatcher.subscribe(ACTION_CHANNEL, function(action){
                if (action.payload === 'explode') {
                    throw new Error();
                }

                F.noop();
            });

            dispatcher.dispatch({type: 'test', payload: 'explode'});
        }

        expect(setupWeirdCondition).toThrow();
        expect(dispatcher.isDispatching()).toBe(false);
    });

    it('should throw on self-circular dependencies', function(){

        function setupSelfCircularDependencies() {
            var firstDispatchToken = dispatcher.subscribe(ACTION_CHANNEL, function(action) {
                dispatcher.waitFor(firstDispatchToken);
            });

            dispatcher.dispatch({type: 'test', payload: 'test'});
        }

        expect(setupSelfCircularDependencies).toThrow();
    });

    it('should throw on multi-circular dependencies', function(){

        function setupMultiCircularDependencies() {
            var firstDispatchToken = dispatcher.subscribe(ACTION_CHANNEL, function(action) {
                dispatcher.waitFor(secondDispatchToken);
            });

            var secondDispatchToken = dispatcher.subscribe(ACTION_CHANNEL, function(action) {
                dispatcher.waitFor(firstDispatchToken);
            });

            dispatcher.dispatch({type: 'test', payload: 'test'});
        }

        expect(setupMultiCircularDependencies).toThrow();
    });

     it ('should throw if dispatch() while dispatching', function(){
        var dispatchInTheMiddleOfDispatch = function () {
            dispatcher.subscribe(ACTION_CHANNEL, function(action){
                dispatcher.dispatch(ACTION_PAYLOAD);
            });

            dispatcher.dispatch(ACTION_PAYLOAD);
        }
        expect(dispatchInTheMiddleOfDispatch).toThrow();
    });
});
