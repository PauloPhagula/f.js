/**
 * Utilities Extension for the core
 */

/* global jQuery, _ */
;F.util = (function($, _, undefined){
	"use strict";

	// Thanks to Andrea Giammarchi
	var
		reEscape = /[&<>'"]/g,
		reUnescape = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g,
		oEscape = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			"'": '&#39;',
			'"': '&quot;'
		},
		oUnescape = {
			'&amp;'	: '&',
			'&#38;'	: '&',
			'&lt;'	: '<',
			'&#60;'	: '<',
			'&gt;'	: '>',
			'&#62;'	: '>',
			'&apos;': "'",
			'&#39;'	: "'",
			'&quot;': '"',
			'&#34;'	: '"'
		},
		fnEscape = function (m) {
			return oEscape[m];
		},
		fnUnescape = function (m) {
			return oUnescape[m];
		}
	;

	return {
		each	: $.each,

		// Composes objects by combining them into a new
		compose	: _.extend,

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
		extend : function(protoProps, staticProps) {
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
		},
		ready	: $.ready,
		escape 	: fnEscape,
		unescape: fnUnescape,
		replace : String.prototype.replace,

		/**
		 * Generetes a almost Global Unique Identifier (GUID)
		 * @return {[type]} [description]
		 */
		uuid	: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
					.toString(16);
			}

			return uuid;
		},

		/**
		* @see https://lodash.com/docs#template		
		* @see https://engineering.linkedin.com/frontend/client-side-templating-throwdown-mustache-handlebars-dustjs-and-more		
		*/		
		template : _.template,

		/**
		 * Makes an object production-ready
		 * TO-DO: update method to use ES6 Proxies
		 * @see https://www.nczonline.net/blog/2009/04/28/javascript-error-handling-anti-pattern/
		 * @example
		 * var system = {
		 *		fail: function(){
		 *			throw new Error("Oops!");
		 *		}
		 *	};
		 *
		 *	function log(severity, message){
		 *		alert(severity + ":" + message);
		 *	}
		 *
		 *	if (!debugMode){
		 *		productionize(system);
		 *	}
		 *
		 *	system.fail();   //error is trapped!
		 */
		productionize: function(object){
			var name,
        		method;

			for (name in object){
				method = object[name];
				if (typeof method === "function"){
					object[name] = function(name, method){
						return function(){
							try {
								return method.apply(this, arguments);
							} catch (ex) {
								// this should use our logger from the core
								console.log(1, name + "(): " + ex.message);
							}
						};
					}(name, method);
				}
			}
		},

		/*
		* memoize.js
		* by @philogb and @addyosmani
		* with further optimizations by @mathias
		* and @DmitryBaranovsk
		* perf tests: http://bit.ly/q3zpG3
		* Released under an MIT license.
		*/
		memoize: function(fn) {
			return function () {
				var args = Array.prototype.slice.call(arguments),
					hash = "",
					i = args.length,
					currentArg = null;
				while (i--) {
					currentArg = args[i];
					hash += (currentArg === Object(currentArg))
						? JSON.stringify(currentArg)
						: currentArg;
					fn.memoize || (fn.memoize = {});
				}
				return (hash in fn.memoize) ? fn.memoize[hash] :
				fn.memoize[hash] = fn.apply(this, args);
			};
		},
	}
}(jQuery, _));

F.ready = F.util.ready;
F.extend = F.util.extend;
F.compose = F.util.compose;