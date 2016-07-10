    
    // Initial Setup
    // -------------

    // Save the previous value of the `F` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var F = {};
    var previousF = F;

    // Current version of the library. Keep in sync with `package.json` and `bower.json`.
    F.VERSION = '::VERSION_NUMBER::';

    // Set framework to debug mode. Disabled by default
    F.DEBUG = false;

    // Runs F.js in *noConflict* mode, returning the `F` variable
    // to its previous owner. Returns a reference to this F object.
    F.noConflict = function() {
        F = previousF;
        return this;
    };

    // Patch Object
    Object.getOwnPropertyDescriptors = function getOwnPropertyDescriptors(obj) {
        var descriptors = {};
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                descriptors[prop] = Object.getOwnPropertyDescriptor(obj, prop);
            }
        }
        return descriptors;
    };

    // Util
    // ---

    // Composes objects by combining them into a new
    F.compose = Object.assign;

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
