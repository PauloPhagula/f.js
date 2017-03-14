describe('core', function(){ 'use strict';
    var core;

    beforeEach(function(){
        core = new F.Core();
    });

    it ('should register services', function(){
        var loggerSvcFactory = function(core){
            return {
                init: function(options) {},
                log: function(obj) { console.log(obj);}
            };;
		};

        core.registerService('logger', [], loggerSvcFactory, {});

        expect(core.hasService('logger')).toBe(true);
    });

    it('should allow adding configuration before it is initialized', function(){
        core.setConfig({debug: true, key: 'value'});
        core.init({});
        expect(core.getConfig('key')).toBe('value');
    });

    it('should not allow adding configuration after it is initialized', function(){
        function initializeCoreAndSetConfig() {
            core.init({});
            core.setConfig({debug: true, key: 'value'});
        }

        expect(initializeCoreAndSetConfig).toThrowError('Cannot set configuration after application is initialized');
    });
});
