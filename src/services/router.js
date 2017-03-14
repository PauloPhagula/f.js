/**
 * @fileOverview Definition of the application router
 *
 * @todo  Make it based on states.
 * A state can be represented by an URL. And navigating to the state with the a
 * given set of params should present the same view to the user
 *
 * A state has a name, URL pattern defining a set of required params
 */
/** global window, document */


F.Router = (function(Navigo, undefined){ "use strict";

	var _router, _root, _useHash, _prevURL;

	/**
	 * Handles URL clicks when the router is turned on
	 * @private
	 *
	 * @param {Event} event the click event
	 * @todo use event delegation instead hooking directly like this
	 * @returns {void}
	 */
	var _handleURLClick = function(event) {
		var target = event.target;

		// Get the absolute anchor href.
		var url = target.getAttribute('href');

		if (   url.indexOf('javascript:void(0)') > -1
			|| url.match(/^(mailto|tel|sms|itms-apps|marked):/)
		){
			return true;
		}

		// Stop the default event to ensure the link will not cause a page refresh.
		event.preventDefault();
		event.stopPropagation();

		// Remove leading slashes and hash bangs (backward compatablility)
  		url = url.replace(/^\//, '')
				.replace('\#\!\/', '')
				.replace('\#\/', '');

		url = _sanitizeInnerUrl(url, _root);

  		if (_useHash) {
  			_prevURL = window.location.hash;
  		} else {
  			_prevURL = window.location.pathname + window.location.search;
  		}

  		// only navigate to proposed url if it's not equal to the previous or current
  		if (_prevURL !== url) {
  			_prevURL = url;
  			_router.navigate(url);
  		}
	};

	/**
	 * Handles the hash-change which is fired when the fragment identifier of the URL has changed
	 * @private
	 *
	 * @param  {HashChangeEvent} e The hash-change event
	 * @returns {void}
	 */
	var _handleHashChange = function(e) {

	};

	var _sanitizeInnerUrl = function(url, prefix){
        //clean start and trailing slash
        url = url.replace(/^\//, '').replace(/\/$/, '');

        //clean router prefix
        if (!prefix)
            return url;

        url = url.replace(prefix, "").replace(/^\//, '');

        return (_useHash ? '' : prefix) + (!url ? '' : '/' + url);
    };

	/**
	 * Creates a new client-side router.
	 *
	 * @param {String} root    the root URL for the router
	 * @param {Boolean} useHash specifies if the router should use the # or not
	 *
	 * @constructor
	 * @returns {void}
	 */
	function Router(root, useHash) {
		_root = root || null;
		_useHash = useHash || false;
		_router = new Navigo(_root, _useHash);

	}


	F.compose(Router.prototype, {

		routes: {},

		delegateRoutes: function(routes) {

			routes = routes || this.routes;

			for (var spec in routes) {
				var pattern, flags, handler;

				if (spec.indexOf(" ") === -1) {
					pattern = spec;
				} else {
					pattern = spec.slice(0, spec.indexOf(" "));
                	flags = spec.slice(spec.indexOf(" ") + 1, spec.length).trim();
				}

				handler = routes[spec];

				if (pattern.startsWith('/') && pattern.endsWith('/')){
					pattern = pattern.slice(1, -1);
					pattern = flags ? new RegExp(pattern, flags) : new RegExp(pattern);
				}

				_router.on(pattern, this[handler]);
			}
		},

		// Public API
		// --------------

		/**
		 * Maps a handler to a given URL pattern.
		 *
		 * @param {String} pattern String or RegExp pattern that should be used to match against requests
		 * @param {Function} handler Function that should be executed when a request matches the route pattern
		 * @returns {void}
		 */
		add: function(pattern, handler) {
			_router.on(pattern, handler);
		},

		/**
		 * Starts listening for changes on either hash and URL clicks
		 * @method
		 * @public
		 * @returns {void}
		 */
		start: function() {
			F.delegateEvent(document, 'click', 'a[href]:not([data-external]):not(.disabled)', _handleURLClick, null);
			window.addEventListener('hashchange', _handleHashChange, false);
			this.delegateRoutes();
			_router.resolve();
		},

		/**
		 * Stops listening for changes on either hash and URL clicks
		 * @method
		 * @public
		 * @returns {void}
		 */
		stop: function() {
		    F.undelegateEvent(document, 'click', 'a[href]:not([data-external]):not(.disabled)', _handleURLClick, null);
		    document.removeEventListener('hashchange', _handleHashChange, false);
		    _router.destroy();
		},

		/**
		 * Navigates to the given url
		 * @param  {String} url the url to navigate to.
		 * @param  {String} title the title to be send on the window
		 * @param  {Object} state the state that should be associated with the title.
		 * @returns {void}
		 */
		navigate: function(url, title, state) {
			_router.navigate(url);
		},

		/**
		 * Convenience method to go back to previous state
		 * @return {void}
		 */
		back: function() {

		},

		/**
		 * Convenience method to go to given index in the history.
		 * @param {int} index the history index to jump to.
		 * @return {void}
		 */
		go: function(index) {

		}
	});

	Router.extend = F.extend;
	return Router;
}(Navigo));
