/*!
 * F - a JavaScript framework for modular and scalable SPAs
 */

/* global jQuery, _ */

var F = (function($, _, undefined){
    "use strict";

    // Initial Setup
    // -------------

    // Save the previous value of the `F` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var F = {};
    var previousF = F;

    // Current version of the library. Keep in sync with `package.json` and `bower.json`.
    F.VERSION = '0.1.0';

    // Set framework to debug mode. Disabled by default
    F.DEBUG = false;

    // Runs F.js in *noConflict* mode, returning the `F` variable
    // to its previous owner. Returns a reference to this F object.
    F.noConflict = function() {
        F = previousF;
        return this;
    };

    // Util
    // ---

    // Composes objects by combining them into a new
    F.compose = _.extend;

    /**
     * Helper function to correctly set up the prototype chain for subclasses.
     * Similar to `goog.inherits`, but uses a hash of prototype properties and
     * class properties to be extended.
     *
     * Taken from Backbone.js of Jeremy Ashkenas
     * @see https://github.com/jashkenas/backbone/blob/master/backbone.js#L1839
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
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ return parent.apply(this, arguments); };
        }

        // Add static properties to the constructor function, if supplied.
        _.extend(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function and add the prototype properties.
        child.prototype = _.create(parent.prototype, protoProps);
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };

    return F;
}(jQuery, _));