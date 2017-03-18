describe('Core', function(){ 'use strict';
    var core;

    beforeEach(function(){
        core = new F.Core();
        core.setConfig({debug: true});
    });

    it('should allow registering modules', function(){
        var self = this;

        function initializeModuleWithDependencies() {
            core.registerService('logger', [], loggerSvcFactory, {});
            core.registerService("calculator", ["logger"], calculatorSvcFactory, {});

            core.registerModule('sample', ['logger', 'calculator'], SampleModule, {});
        }

        expect(initializeModuleWithDependencies).not.toThrow();
    });

    it('should not allow allow registering the same module twice', function() {
        var self = this;

        function initializeModuleWithDependencies() {
            core.registerService('logger', [], loggerSvcFactory, {});
            core.registerService("calculator", ["logger"], calculatorSvcFactory, {});

            core.registerModule('sample', ['logger', 'calculator'], SampleModule, {});
        }

        expect(initializeModuleWithDependencies).not.toThrow();
        expect(initializeModuleWithDependencies).toThrow();
    });

    describe(' - Service - ', function(){

        it('should register services', function(){
            core.registerService('logger', [], loggerSvcFactory, {});
            core.registerService("calculator", ["logger"], calculatorSvcFactory, {});

            expect(core.hasService('logger')).toBe(true);
            expect(core.hasService('calculator')).toBe(true);
        });

        it('should allow getting registered services', function(){
            core.registerService('logger', [], loggerSvcFactory, {});
            expect(core.hasService('logger')).toBe(true);
            expect(core.getService('logger')).not.toBeNull();
        });

        it('should not allow registering the same service twice', function(){
            function registerSameServiceTwice() {
                core.registerService('logger', [], loggerSvcFactory, {});
                core.registerService('logger', [], loggerSvcFactory, {});
            }

            expect(registerSameServiceTwice).toThrowError("Service 'logger' already registered.");
        });
    });

    describe(' - Config - ', function(){

        it('should allow adding configuration before it is initialized', function(){
            core.setConfig({key: 'value'});
            core.init({});

            expect(core.getConfig('key')).toBe('value');
        });

        it('should not allow adding configuration after it is initialized', function(){
            var self = this;

            function initializeCoreAndSetConfig() {
                core.init({});
                core.setConfig({key: 'value'});
            }

            expect(initializeCoreAndSetConfig).toThrowError('Cannot set configuration after application is initialized');
        });

        it('should get configuration by key', function(){
            expect(core.getConfig('debug')).toBe(true);
        });

        it('should get all configuration if no key is given', function(){
            expect(typeof core.getConfig()).toBe('object');
        });
    });

    describe(' - Module lifecycle - ', function(){
        var $moduleDiv;

        beforeEach(function() {
            $moduleDiv = document.createElement('div', {});
            $moduleDiv.dataset.module = 'sample';

            document.body.appendChild($moduleDiv);

            core = new F.Core();
            core.setConfig({debug: true});

            core.registerService('logger', [], loggerSvcFactory, {});
            core.registerService("calculator", ["logger"], calculatorSvcFactory, {});
            core.registerModule('sample', ['logger', 'calculator'], SampleModule, {});
        });

        afterEach(function(){
            $moduleDiv.parentNode.removeChild($moduleDiv);
        });

        it('should start module', function() {
            function startModule() {
                core.start('sample', $moduleDiv);
            }

            expect(startModule).not.toThrow();
        });

        it('should not stop unstarted module', function() {
            function stopModule() {
                core.stop('sample');
            }

            expect(stopModule).toThrowError('Unable to stop module: sample');
        });

        it('should stop started module', function() {
            function startAndStopModule() {
                core.start('sample', $moduleDiv);
                core.stop('sample');
            }

            expect(startAndStopModule).not.toThrow();
        });

        it('should restart module', function() {
            function startAndRestartModule() {
                core.start('sample', $moduleDiv);
                core.restart('sample');
            }

            expect(startAndRestartModule).not.toThrow();
        });

        it('should start all and then stop all modules', function() {
            function startAll_and_StopAll_Modules(){
                core.startAll();
                core.stopAll();
            }

            expect(startAll_and_StopAll_Modules).not.toThrow();
        });
    });
});
