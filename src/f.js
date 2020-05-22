
    // Initial Setup
    // -------------

    /**
     * The previous value of the `F` variable, so that it can be
     * restored later on, if `noConflict` is used.
     * @type {F}
     */
    var previousF = root.F;

    /**
     * Current version of the library.
     * Must be kept in sync with `package.json` and `bower.json`.
     * @type {String}
     */
    F.VERSION = '::VERSION_NUMBER::';

    /**
     * Set framework to debug mode. Disabled by default
     * @type {Boolean}
     */
    F.DEBUG = false;

    /**
     * Runs F.js in *noConflict* mode, returning the `F` variable
     * to its previous owner.
     * @return {F} a reference to this F object
     */
    F.noConflict = function() {
        root.F = previousF;
        return this;
    };

    // Patch Object
    Object.getOwnPropertyDescriptors = function (obj) {
        var descriptors = {};
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                descriptors[prop] = Object.getOwnPropertyDescriptor(obj, prop);
            }
        }
        return descriptors;
    };

    // Polyfill Object.assign
    // taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    if (typeof Object.assign !== 'function') {
        Object.assign = function(target, varArgs) { // .length of function is 2
            if (target === null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource !== null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    // Util
    // ---

    // Composes objects by combining them into a new one
    F.compose = F.merge = Object.assign;

    /**
     * Helper function to correctly set up the prototype chain for subclasses.
     * Similar to `goog.inherits`, but uses a hash of prototype properties and
     * class properties to be extended.
     *
     * Taken from Backbone.js of Jeremy Ashkenas
     * @see https://github.com/jashkenas/backbone/blob/master/backbone.js#L1839
     * @see https://gist.github.com/juandopazo/1367191
     *
     * @param  {Object} protoProps - the instance properties for the *Class*
     * @param  {Object} staticProps - the static properties for the *Class*
     * @return {Function} - a new constructor function
     */
    F.extend = function(protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent constructor.
        if (!protoProps.hasOwnProperty('constructor')) {
            Object.defineProperty(protoProps, 'constructor', {
                value: function () {
                    // Default call to superclass as in maxmin classes
                    parent.apply(this, arguments);
                },
                writable: true,
                configurable: true,
                enumerable: false
            });
        }

        child = protoProps.constructor;
        // Add static properties to the constructor function, if supplied.
        Object.assign(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function and add the prototype properties.
        child.prototype = Object.create(parent.prototype, Object.getOwnPropertyDescriptors(protoProps));
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };

    /**
     * Performs event delegation setting.
     * @param {object} spec - event delegation specification
     * @param {EventTarget} spec.element the element we want to delegate events for
     * @param {string} spec.event the type of event we want to delegate
     * @param {Function} spec.handler the handler function
     * @param {boolean} [spec.useCapture = false] indicates that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree
     * @param {string} [spec.selector] a css selector
     * @param {Object} [spec.context=null] the context under which the handler fn will be called
     *
     * @return {void}
     */
    F.delegateEvent = function(spec) {

        var defaults = {
            element: document,
            event: null,
            selector: null,
            handler: null,
            context: null,
            useCapture: false,
        }

        var options = F.compose(defaults, spec);

        var listener =  function(e) {
            if (typeof options.selector === "undefined" || options.selector === null) {
                return options.handler.call(options.context || null, e);
            } else if (e.target && e.target.matches(options.selector)) {
                // console.log('event: ' + eventName + ', selector: ' + selector + ', handler: ' + handler + ', matches: ' + e.target.matches(selector));
                return options.handler.call(options.context || null, e);
            }
        };

        options.useCapture = options.useCapture || false;

        if (options.element.addEventListener) {
            options.element.addEventListener(options.event, listener, options.useCapture);
        } else {
            if (options.element.attachEvent) {
                options.element.attachEvent('on' + options.event, listener);
            } else {
                options.element[options.event] = listener;
            }
        }
    };

    /**
     * Performs event delegation unsetting.
     * @param {object} spec - event delegation specification
     * @param {EventTarget} spec.element the element we want to undelegate events for
     * @param {string} spec.event the type of event we want to undelegate
     * @param {string} [spec.selector] a css selector
     * @param {Function} spec.handler the handler function
     * @param {Object} [spec.context=null] the context under which the handler fn will be called
     * @param {boolean} [spec.useCapture=false] indicates that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree
     * @return {void}
     */
    F.undelegateEvent = function(spec) {

        var defaults = {
            element: document,
            event: null,
            selector: null,
            handler: null,
            context: null,
            useCapture: false,
        }

        var options = F.compose(defaults, spec);

        var listener = function(e) {
            if (typeof options.selector === "undefined" || options.selector === null) {
                return options.handler.call(options.context || null, e);
            } else if (e.target && e.target.matches(options.selector)) {
                // console.log('event: ' + eventName + ', selector: ' + selector + ', handler: ' + handler + ', matches: ' + e.target.matches(selector));
                return options.handler.call(options.context || null, e);
            }
        };

        options.useCapture = options.useCapture || false;

        if (options.element.removeEventListener) {
            options.element.removeEventListener(options.event, listener, options.useCapture);
        } else {
            if (options.element.detachEvent) {
                options.element.detachEvent('on' + options.event, listener);
            } else {
                if (options.element[options.event] === listener) {
                    options.element.splice(options.event, 1);
                }
            }
        }
    };

    /**
     * Assert that a given condition is satisfied, immediately raising an
     * error when its not.
     * @param {?} expression - the expression whose result value is to be checked for truthiness
     * @param {String} [message] - the message to be contained in the raised error
     * @return {void}
     */
    F.assert = function(expression, message) {
        if (message && typeof message !== 'string') {
            throw new Error('message must be a string');
        }

        message = message ? ": " + message : "";

        if (!expression) {
            throw new Error("Assertion error" + message);
        }
    };

    /**
     * Do nothing.
     * @return {void}
     */
    F.noop = function(){};

    F.isArray = function(variable) {
        return Object.prototype.toString.call(variable) === '[object Array]';
    };
