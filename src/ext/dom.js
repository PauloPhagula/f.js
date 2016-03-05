/**
 * DOM Extension for the core.
 * 
 * It exposes the same interface always but allows choosing the implementation 
 * from a available list of implementations.
 *
 */

/* global jQuery */
// Riot should suffice but just in case we can include jQuery as DOM library
var domExtFactory = function() {
    "use strict";
    var dom = F.Extension.extend($);
    return dom;
};
