describe('Dispatcher', function(){ 'use strict';

    var dispatcher,
        messageHandler = {
            messageCallback: function(payload) { return payload; },
            actionCallback: function(payload) { return payload; }
        },

        CHANNEL = 'message',
        ACTION_PAYLOAD = {
            type : 'demo-action',
            data : {}
        }
    ;

    beforeEach(function(){
        dispatcher = new F.Dispatcher();
        spyOn(messageHandler, 'messageCallback');
        spyOn(messageHandler, 'actionCallback');
    });

    it('should subscribe handler to message', function(){
        expect(dispatcher.subscribe).not.toThrow();
        dispatcher.subscribe(CHANNEL, messageHandler.messageCallback);
    });

    it('should publish message', function(){
        expect(dispatcher.publish).not.toThrow();
        dispatcher.subscribe(CHANNEL, messageHandler.messageCallback);
        dispatcher.publish(CHANNEL, 'payload');
        expect(messageHandler.messageCallback).toHaveBeenCalled();
    });

    it('should unsubscribe to message', function(){
        expect(dispatcher.unsubscribe).not.toThrow();
        dispatcher.unsubscribe(CHANNEL, messageHandler.messageCallback);
    });

    it('should dispatch action', function(){
        expect(dispatcher.dispatch).not.toThrow();
        dispatcher.dispatch(ACTION_PAYLOAD);
    });
});
