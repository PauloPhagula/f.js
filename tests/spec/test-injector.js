// Injector Tests
// ---
injector.register('dep', 1);

test = injector.resolve(['dep', function(a, b) {
    "use strict";
    console.log("dep: " + a);
    console.log("b: " + b);
    return { 
        sum: function(c, d) { return c+d+a; } 
    };
}]);

test = injector.resolve(function(dep, b) {
    "use strict";
    console.log("dep: " + a);
    console.log("b: " + b);
    return { 
        sum: function(c, d) { return c+d+a; } 
    };
});

test.sum(1,2);


var logger =  {
    log: function(obj) { 
        console.log(obj); 
    }
};

injector.register('logger', logger);

var calculatorFactory = function(logger) {
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

var calculator = injector.resolve(["logger", calculatorFactory]);

injector.register('calculator', calculator);

var calculatorModule = injector.resolve(["logger", "calculator", function(logger, calculator) {
    var sum =  function(a , b) {
        logger.log( calculator.sum(a, b) );
    };

    var minus = function(a, b) {
        logger.log( calculator.minus(a, b) );
    };

    return {
        sum   : sum,
        minus : minus
    };
}]);
