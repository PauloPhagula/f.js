describe('Injector', function() { 'use strict';

    var logger =  {
        log: function(obj) {
            console.log(obj);
        }
    };

    var calculatorFactory = function(logger) {
        if (!logger) {
            throw new Error("logger is null");
        }

        return {
            sum: function(a, b) {
                logger.log('summing');
                return a + b;
            },
            minus: function(a, b) {
                logger.log('subtracting');
                return a - b;
            }
        };
    };

    beforeEach(function(){

    });

    it('should register values', function() {
        expect(F.injector.register).not.toThrow();
        F.injector.register('logger', logger);
    });

    it('should resolve dependencies by dependency name', function(){
        F.injector.register('logger', logger);

        var calculator = F.injector.resolve(["logger", calculatorFactory]);
        expect(calculator.sum(1, 2)).toBe(3);
    });

    it('should resolve values by function parameter name', function(){
        F.injector.register('logger', logger);

        var calculator = F.injector.resolve(calculatorFactory);
        expect(calculator.minus(1, 2)).toBe(-1);
    });
});
