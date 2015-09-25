/*!
 * F - a JavaScript framework for modular and scalable SPAs
 *
 * Version: 0.0.1
 * Started: 12-09-2015
 * Updated: 13-09-2015
 * Url    : http://github.com/dareenzo/F
 * Author : @dareenzo
 * Review : @bonejp
 *
 * Copyright (c) 2015 maparato.co.mz
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 4,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/* global define */
/* global global */
/* global jQuery, _ */

;var F = (function(){
    "use strict";

    // Initial Setup
    // -------------

    // Save the previous value of the `F` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var F = {};
    var previousF = F;

    // Current version of the library. Keep in sync with `package.json`.
    F.VERSION = '0.0.1';

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