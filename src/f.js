/*!
 * F - a JavaScript framework for modular and scalable SPAs
 */

/* global define */
/* global global */
/* global jQuery, _ */

var F = (function(){
    "use strict";

    // Initial Setup
    // -------------

    // Save the previous value of the `F` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var F = {};
    var previousF = F;

    // Current version of the library. Keep in sync with `package.json` and `bower.json`.
    F.VERSION = '0.0.2';

    // Set framework to debug mode. Disabled by default
    F.DEBUG = false;

    // Runs F.js in *noConflict* mode, returning the `F` variable
    // to its previous owner. Returns a reference to this F object.
    F.noConflict = function() {
        F = previousF;
        return this;
    };

    // Extensions Plugging
    // -------------------
    /*
    F.Core = Core;
    F.Core.dispatcher = Dispatcher; // don't expose the dispatcher. Only core has it
    F.Core.http = Http;
    F.Core.log = F.log = new Log();
    F.Sandbox = Sandbox;
    F.Store = Store;
    F.util = Util;
    F.http = Http;
    F.$ = DOM;
    F.Storage = Storage;
    F.Module = Mod;

    F.router = Router;
    // We can use backbone views or riot components
    // F.BackboneView = View;

    // Shortcuts
    // ---------
    F.ready = Util.ready;
    F.extend = Util.extend;
    */
    return F;
}());