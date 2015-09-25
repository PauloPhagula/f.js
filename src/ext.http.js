/**
 * Ajax / HTTP Extension
 *
 * - Hide ajax communication details - Modules don't need to know of it
 * - Provide common request interface - Modules use this interfce to specify data to send to the server
 * - Provide common response interface - Modules use this interface to retrive data from the response
 * - Manage server failures - Modules only care if they got what they wanted or not, don't care why
 *
 * @see http://davidwalsh.name/fetch
 * @see https://github.com/github/fetch
 */

/* global fetch */
/* global jQuery */
;F.Core.http = F.http = (function($, undefined){
	"use strict";

	var defaults = {
		headers: {
			'Accept'		: 'application/json',
			'Content-Type'	: 'application/json',
		},
		mode		: 'cors',
		cache		: 'default',
		credentials	: 'same-origin' // include cookies
	};

	/**
	 * Checks if a {Response} to a {Request} is non-error
	 * @param {Response} the response to be checked
	 */
	function _checkStatus(response) {
		if (response.status >= 200 && response.status < 300) {
			return response;
		} else {
			var error = new Error(response.statusText);
			error.response = response;
			throw error;
		}
	}

	/**
	 * Converts a response into JSON
	 * @param {Response} the response to be converted
	 * @return {Promise} a promise that resolves to the JSON data after the request
	 */
	function _parseJson(response) {
		return response.json();
	}

	/**
	 * fetches something in the path using HTML5 fetch API
	 * @param {String} path - the path to the resource you want to fetch
	 * @param {Object} options - the options to be used when making the request
	 * @return {Promise} a promise that resolves to the Response of the Request
	 */
	function _fetch(path, options){

		if(options){
			// merge it with the defaults
			options = $.extend( {}, defaults, options );
		}
		return fetch(path, options)
				.then(_checkStatus)
				.then(_parseJson)
				.catch(function(error){
					// notify caller of error
					throw new Error("There's been a problwm with your operation", error);
				});
	}

	/**
	 * Makes an XHR request
	 * @param {Object} the request configuration object
	 */
	function _xhr(path, options){
		return $.ajax(path, options);
	}

	// Public API
	// ----------

	/**
	 * Common interface. It will use fetch for new browsers and $.ajax for older implementation internally
	 * @param {String} path - the path to the resource you want to fetch
	 * @param {Object} options - the options to be used when making the request
	 */
	function request(path, options){
		if(window.fetch && typeof window.fetch === 'function'){
			return _fetch(path, options);
		} else {
			return _xhr(path, options);
		}
	}

	// Return public methods
	return {
		request: request
	}
}(jQuery));