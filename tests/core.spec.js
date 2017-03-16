describe('core', function(){ 'use strict';
    var core;

    var loggerSvcFactory = function(){
        return {
            init: function(options) {},
            log: function(obj) { console.log(obj); }
        };;
    };

    var calculatorSvcFactory = function(logger) {
        return {
            init: function(options) {},
            add: function(a, b) {
                logger.log("adding ...");
                return a + b;
            },
            subtract: function(a, b) {
                logger.log("subtracting ...");
                return a - b;
            }
        };
    }

    beforeEach(function(){
        core = new F.Core();
        core.setConfig({debug: true});
    });

    afterEach(function(){
        core.destroy();
    });

    it('should register services', function(){
        core.registerService('logger', [], loggerSvcFactory, {});
        core.registerService("calculator", ["logger"], calculatorSvcFactory, {});

        expect(core.hasService('logger')).toBe(true);
        expect(core.hasService('calculator')).toBe(true);
    });

    it('should not register the same service twice', function(){
        function registerSameServiceTwice() {
            core.registerService('logger', [], loggerSvcFactory, {});
            core.registerService('logger', [], loggerSvcFactory, {});
        }

        expect(registerSameServiceTwice).toThrowError("Service 'logger' already registered.");
    });

    it('should allow adding configuration before it is initialized', function(){
        core.setConfig({key: 'value'});
        core.init({});
        expect(core.getConfig('key')).toBe('value');
    });

    it('should not allow adding configuration after it is initialized', function(){
        function initializeCoreAndSetConfig() {
            core.init({});
            core.setConfig({key: 'value'});
        }

        expect(initializeCoreAndSetConfig).toThrowError('Cannot set configuration after application is initialized');
    });
});
