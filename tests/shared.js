var loggerSvcFactory = function(){
    return {
        init: function(options) {},
        log: function(obj) { console.log(obj); }
    };
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
};

var ThrowingModule = F.Module.extend({

});

var SampleModule = F.Module.extend({
    start: function(element, services) {},
    stop: function() {}
});
