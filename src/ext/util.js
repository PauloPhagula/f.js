/**
 * Utilities for the framework
 */

/* global jQuery, _ */
F.util = (function($, _, undefined){
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
        each    : $.each,
        ready   : $.ready,
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
					hash += (currentArg === Object(currentArg)) ?
                        JSON.stringify(currentArg) :
                        currentArg;
					fn.memoize || (fn.memoize = {});
				}
				return (hash in fn.memoize) ? fn.memoize[hash] :
				fn.memoize[hash] = fn.apply(this, args);
			};
		},

		/**
         * Sets a name/value pair which is stored in the browser and sent to the server
         * with every request. This is also known as a cookie. Be careful setting
         * cookies, because they can take up a lot of bandwidth, especially for Ajax
         * applications.
         *
         * @param {String}  name     cookie name
         * @param {String}  value    cookie value
         * @param {Date}    expire   expire date representing the number of milliseconds
         *                           since 1 January 1970 00:00:00 UTC.
         * @param {String}  path     path name
         * @param {String}  domain   domain name
         * @param {Boolean} secure   cookie may benefit all the documents and CGI programs
         *                           meet the requirements as to the path and domain
         *                           compatibility
         *     Possible values:
         *     true   may benefit
         *     false  can not benefit
         *
         * @return {String} Returns a cookie name.
         */
        setcookie: function(name, value, expire, path, domain, secure) {
            var ck = name + "=" + escape(value) + ";";
            if (expire) ck += "expires=" + new Date(expire +
                new Date().getTimezoneOffset() * 60).toGMTString() + ";";
            if (path)   ck += "path=" + path + ";";
            if (domain) ck += "domain=" + domain + ";";
            if (secure) ck += "secure";

            document.cookie = ck;
            return value;
        },

        /**
         * Gets the value of a stored name/value pair called a cookie.
         *
         * @param {String} name the name of the stored cookie.
         * @return {String} Returns a value of the cookie or the empty string if it isn't found
         */
        getcookie: function(name) {
          var aCookie = document.cookie.split("; ");
          for (var i = 0; i < aCookie.length; i++) {
              var aCrumb = aCookie[i].split("=");
              if (name == aCrumb[0])
                  return unescape(aCrumb[1]);
          }

          return "";
        },

        /**
         * Deletes a stored name/value pair called a cookie.
         *
         * @param {String} name     the name of the stored cookie
         * @param {String} domain   the name of the domain of stored cookie
         */
        delcookie: function (name, domain){
            document.cookie = name + "=blah; expires=Fri, 31 Dec 1999 23:59:59 GMT;" + (domain ? 'domain='+domain : '');
        }
	};
}(jQuery, _));
