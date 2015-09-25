/**
 * DOM Extension for the core.
 * It exposes the same interface always but allows choosing the implementation from a available list of implementations
 *
 * Maybe instead of trying to wrap jQuery just return an instance of it.
 * - Pro argument: Save LOC
 * - Con argument: If we, decide to switch from jQuery, we must keep the same interface, so we don't affect the rest of the app
 */

/* global jQuery */
;F.$ = (function($, undefined){
	"use strict";

	return {

		/**
		 * Returns the first element that is a descendant of the element
		 * on which it is invoked that matches the specified group of selectors.
		 * @param {HTMLElement} root parent element to query off of
		 * @param {string} selector query string to match on
		 *
		 * @returns {HTMLElement} first element found matching query
		 */
		query: function(root, selector) {
			// Aligning with native which returns null if not found
			return $(root || 'html').find(selector)[0] || null;
		},

		/**
		 * Returns a non-live NodeList of all elements descended from the
		 * element on which it is invoked that match the specified group of CSS selectors.
		 * @param {HTMLElement} root parent element to query off of
		 * @param {string} selector query string to match on
		 *
		 * @returns {Array} elements found matching query
		 */
		queryAll: function(root, selector) {
			return $.makeArray($(root).find(selector));
		},

		/**
		 * Adds event listener to element via jquery
		 * @param {HTMLElement} element Target to attach listener to
		 * @param {string} type Name of the action to listen for
		 * @param {function} listener Function to be executed on action
		 *
		 * @returns {void}
		 */
		on: function(element, type, listener) {
			$(element).on(type, listener);
		},

		/**
		 * Removes event listener to element via jquery
		 * @param {HTMLElement} element Target to remove listener from
		 * @param {string} type Name of the action remove listener from
		 * @param {function} listener Function to be removed from action
		 *
		 * @returns {void}
		 */
		off: function(element, type, listener) {
			$(element).off(type, listener);
		},

		/**
		 * Changes or get an HTMLElement Css properties
		 * @param  {HTMLElement} element Target to get or change css properties
		 * @param  {PlainObject} props   Object with css properties to be set on element
		 *
		 * @see http://api.jquery.com/css/
		 *
		 * @return {void}
		 */
		css: function(element, props) {
			$(element).css(props);
		}
	};
}(jQuery));