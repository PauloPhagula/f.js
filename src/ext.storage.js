/**
 * Storage extension for the core.
 * Initial code taken from CacheProvider of Dustin Diaz (@ded)
 * http://www.dustindiaz.com/javascript-cache-provider/
 *
 * Taken from Cache provider from paramana of Gia (@bonejp).
 */

;F.storage = (function(undefined){
"use strict";

// values will be stored here
  var CacheProvider = {},
      _cache        = {};

  CacheProvider = {
    /**
     * {String} k - the key
     * {Boolean} local - get this from local storage?
     * {Boolean} o - is the value you put in local storage an object?
     */
    get: function(k, local, o) {
      if (local && CacheProvider.hasLocalStorage) {
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
      if (local && CacheProvider.hasLocalStorage) {
        try {
          localStorage.setItem(k, v);
        }
        catch (ex) {
          if (ex.name == 'QUOTA_EXCEEDED_ERR') {
              // developer needs to figure out what to start invalidating
              throw v;
              return;
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
      if (local && CacheProvider.hasLocalStorage) {
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
      if (CacheProvider.hasLocalStorage)
        localStorage.clear();

      if (all)
        _cache = {};
    }
  };

  try {
    CacheProvider.hasLocalStorage = ('localStorage' in window) && window['localStorage'] !== null;
  }
  catch (ex) {
    CacheProvider.hasLocalStorage = false;
  }

  return CacheProvider;
}());