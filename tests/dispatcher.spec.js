describe('Dispatcher', function(){ 'use strict';

    var dispatcher,
        messageHandler = {
            messageCallback: function(payload) { return payload; },
            actionCallback: function(payload) { return payload; }
        },

        CHANNEL = 'message',
        ACTION_CHANNEL = 'ACTION',
        ACTION_PAYLOAD = {
            type : 'demo-action',
            data : {}
        }
    ;

    beforeEach(function(){
        dispatcher = new F.Dispatcher();
        spyOn(messageHandler, 'messageCallback').and.callThrough();
        spyOn(messageHandler, 'actionCallback').and.callThrough();
    });

    it('should subscribe handler to channel', function(){
        expect(dispatcher.subscribe).not.toThrow();
        dispatcher.subscribe(CHANNEL, messageHandler.messageCallback);
    });

    it('should call channel subscribers when message is published on channel', function(){
        expect(dispatcher.publish).not.toThrow();
        dispatcher.subscribe(CHANNEL, messageHandler.messageCallback);
        dispatcher.publish(CHANNEL, 'payload');
        expect(messageHandler.messageCallback).toHaveBeenCalled();
    });

    it('should unsubscribe to message', function(){
        expect(dispatcher.unsubscribe).not.toThrow();
        dispatcher.subscribe(CHANNEL, messageHandler.messageCallback);
        dispatcher.unsubscribe(CHANNEL, messageHandler.messageCallback);
    });

    it('should dispatch action payload in action channel', function(){
        dispatcher.subscribe(ACTION_CHANNEL, messageHandler.messageCallback);
        expect(function(){ dispatcher.dispatch(ACTION_PAYLOAD)}).not.toThrow();
        expect(messageHandler.messageCallback).toHaveBeenCalled();
    });
});
