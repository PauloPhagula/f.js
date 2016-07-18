/**
 * Storage extension for the core.
 *
 * Initial code taken from Cache provider of Gia (@bonejp) who took from Dustin Diaz (@ded).
 * http://www.dustindiaz.com/javascript-cache-provider/
 */

var storageExtFactory = function() {
    "use strict";

    var _cache = {};

    var CacheProvider = F.Extension.extend({

        init: function(options) {
            try {
                this.hasLocalStorage = ('localStorage' in window) && window.localStorage !== null;
            }
            catch (ex) {
                this.hasLocalStorage = false;
            }
        },

        /**
         * {String} k - the key
         * {Boolean} local - get this from local storage?
         * {Boolean} o - is the value you put in local storage an object?
         */
        get: function(k, local, o) {
            if (local && this.hasLocalStorage) {
                var action = o ? 'getObject' : 'getItem';
                return localStorage[action](k) || undefined;
            }
            else {
                return _cache[k] || undefined;
            }
        },

        /**
         * {String} k - the key
         * {Object} v - any kind of value you want to store
         * however only objects and strings are allowed in local storage
         * {Boolean} local - put this in local storage
         */
        set: function(k, v, local) {
            if (local && this.hasLocalStorage) {
                try {
                    localStorage.setItem(k, v);
                }
                catch (ex) {
                    if (ex.name == 'QUOTA_EXCEEDED_ERR') {
                        // developer needs to figure out what to start invalidating
                        throw v;
                    }
                }
            }
            else {
                // put in our local object
                _cache[k] = v;
            }
            // return our newly cached item
            return v;
        },

        /**
         * {String} k - the key
         * {Boolean} local - put this in local storage
         */
        clear: function(k, local) {
            if (local && this.hasLocalStorage) {
                localStorage.removeItem(k);
            }
            // delete in both caches - doesn't hurt.
            delete _cache[k];
        },

        /**
         * Empty the cache
         *
         * {Boolean} all - if true clears everything and the varibles cache
         */
        empty: function(all) {
            if (this.hasLocalStorage)
                localStorage.clear();

            if (all)
                _cache = {};
        }
    });

    return new CacheProvider();
};
