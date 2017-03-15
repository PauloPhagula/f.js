/**
 * @fileOverview contains the Dependency Injector definition
 *
 * All code is a mixture of the content from the following sources:
 *     Krasimir Sonev      - http://krasimirtsonev.com/blog/article/Dependency-injection-in-JavaScript
 *     Tero Parviainen     - http://teropa.info/blog/2014/06/04/angularjs-dependency-injection-from-the-inside-out.html
 *     Merrick Christensen - http://merrickchristensen.com/articles/javascript-dependency-injection.html
 *     Yusufaytas          - http://stackoverflow.com/a/20058395
 *     Alex Rothenberg     - http://www.alexrothenberg.com/2013/02/11/the-magic-behind-angularjs-dependency-injection.html
 *
 * @usage:
 *     var Service = function() {
 *         return { name: 'Service' };
 *     }
 *     var Router = function() {
 *         return { name: 'Router' };
 *     }
 *
 *     injector.register('service', Service);
 *     injector.register('router', Router);
 *
 *      * when specifying the names of the dependencies, the parameter names in the function can be anything
 *     var doSomething = injector.resolve(['service', 'router', function(q, s) {
 *         console.log(q().name === 'Service');
 *         console.log(s().name === 'Router');
 *     }]);
 *
 *     doSomething();
 *
 *      * When not specifying the dependency names, the parameter names in the function must have the same name as the dependencies
 *     var doSomething = injector.resolve(function(service, router){
 *         console.log(q().name === 'Service');
 *         console.log(s().name === 'Router');
 *     });
 *
 *     doSomething();
 */

/**
 * @memberof F
 */
F.injector = (function(undefined){

    var dependencies  = {};

    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    // Impl
    // ---
    function annotate(fn) {
        var $inject,
            fnText,
            argDecl,
            last;

        if (typeof fn === 'function') {
            if (!($inject = fn.$inject)) {
                $inject = [];
                if (fn.length) {
                    fnText = fn.toString().replace(STRIP_COMMENTS, '');
                    argDecl = fnText.match(FN_ARGS);
                    argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg){
                        arg.replace(FN_ARG, function(all, underscore, name){
                            $inject.push(name);
                        });
                    });
                }
                fn.$inject = $inject;
            }
        } else if (isArray(fn)) {
            last = fn.length - 1;
            assertArgFn(fn[last], 'fn');
            $inject = fn.slice(0, last);
        } else {
            assertArgFn(fn, 'fn', true);
        }
        return $inject;
    }

    /**
     * Registers an object instance in the injector
     * @param  {string} key   the reference name for the instance
     * @param  {*} value the value of the instance
     * @return {void}
     */
    function register (key, value) {
        dependencies[key] = value;
    }

    function resolve(fn, self, locals) {
        var args = [],
            $inject = annotate(fn),
            length, i,
            key;

        for (i = 0, length = $inject.length; i < length; i++) {
            key = $inject[i];
            if (typeof key !== 'string') {
                throw new Error('Incorrect injection token! Expected service name as string, got: ' + key);
            }
            args.push(
            locals && locals.hasOwnProperty(key) ?
                locals[key] :
                dependencies[key]
            );
        }
        if (isArray(fn)) {
            fn = fn[length];
        }

        // http://jsperf.com/angularjs-invoke-apply-vs-switch
        // #5388
        return fn.apply(self || {}, args);
    }

    // Util
    // ---
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    /**
     * Determines if a reference is a `Function`.
     *
     * @param {*} value Reference to check.
     * @returns {boolean} True if `value` is a `Function`.
     */
    function isFunction(value){return typeof value === 'function';}

    function minErr(module) {
        return function () {
            var code = arguments[0],
            prefix = '[' + (module ? module + ':' : '') + code + '] ',
            template = arguments[1],
            templateArgs = arguments,
            stringify = function (obj) {
            if (typeof obj === 'function') {
                return obj.toString().replace(/ \{[\s\S]*$/, '');
            } else if (typeof obj === 'undefined') {
                return 'undefined';
            } else if (typeof obj !== 'string') {
                return JSON.stringify(obj);
            }
                return obj;
            },
            message, i;

            message = prefix + template.replace(/\{\d+\}/g, function (match) {
                var index = +match.slice(1, -1), arg;

                if (index + 2 < templateArgs.length) {
                    arg = templateArgs[index + 2];
                    if (typeof arg === 'function') {
                        return arg.toString().replace(/ ?\{[\s\S]*$/, '');
                    } else if (typeof arg === 'undefined') {
                        return 'undefined';
                    } else if (typeof arg !== 'string') {
                        return toJson(arg);
                    }
                    return arg;
                }
                return match;
            });

            message = message + '\nhttp://errors.angularjs.org/1.2.27/' +
            (module ? module + '/' : '') + code;
            for (i = 2; i < arguments.length; i++) {
                message = message + (i == 2 ? '?' : '&') + 'p' + (i-2) + '=' +
                encodeURIComponent(stringify(arguments[i]));
            }

            return new Error(message);
        };
    }

    var ngMinErr = minErr('ng');

    /**
     * Checks if the given argument is falsy.
     * @param {*} arg object to be analysed
     * @param {string} name the argument's name
     * @param {string} reason the reason to be used for the failure message
     * @returns {*} the argument if is not falsy
     * @throws {Error} if the argument is falsy.
     */
    function assertArg(arg, name, reason) {
        if (!arg) {
            throw ngMinErr('areq', "Argument '{0}' is {1}", (name || '?'), (reason || "required"));
        }
        return arg;
    }

    function assertArgFn(arg, name, acceptArrayAnnotation) {
        if (acceptArrayAnnotation && isArray(arg)) {
            arg = arg[arg.length - 1];
        }

        assertArg(isFunction(arg), name, 'not a function, got ' +
            (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
        return arg;
    }

    // Public API
    // ---
    return {
        register : register,
        resolve  : resolve
    };
}());
