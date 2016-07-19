/**
 * Router - the app router
 *
 * @see https://github.com/krasimir/navigo
 */

F.router = (function(Navigo, undefined){
	"use strict";

	var _router = new Navigo(null, true);

	/**
	 * Handles URL clicks when the router is turned on
	 * @private
	 *
	 * @param {Event} e - the click event
	 */
	var _handleURLClick = function(e) {
		var target = e.target;
		if (target.tagName === "A" && !target.hasAttribute('data-external')) {
			// Get the absolute anchor href.
			var href = target.href;

			if (href.indexOf('javascript:void(0)') > -1)
				return;

			// not a client-side navigation URL
			if (href.indexOf('#/') === -1)
				return;

			// Stop the default event to ensure the link will
			// not cause a page refresh.
			e.preventDefault();

			// Get the hash part of the URL and navigate away.

			href = '/' + href.split('#/')[1];
			_router.navigate(href);
		}
	};

	// Public API
	// --------------

	/**
	 * Maps a handler to a given URL pattern.
	 *
	 * @param {String} pattern String pattern that should be used to match against requests
	 * @param {Function} handler Function that should be executed when a request matches the route pattern
	 */
	var add = function(pattern, handler) {
		_router.on(pattern, handler);
	};

	/**
	 *
	 */
	var start = function() {
		document.addEventListener('click', _handleURLClick);
	};

	/**
	 * Stops listening for changes on either hash and URL clicks
	 * @method
	 * @public
	 */
	var stop = function() {
		document.removeEventListener('click', _handleURLClick);
	};

	/**
	 * Navigates to the given url
	 * @param  {url} the url to navigate to.
	 */
	var navigate = function(url) {
		_router.navigate(url);
	};

	// Return public methods
	return {
		add		: add,
		navigate: navigate,
		start	: start,
		stop	: stop
	};
}(Navigo));
