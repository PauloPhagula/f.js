/**
 * Router - the app router
 *
 * @see https://github.com/mmikowski/urianchor by Mike Mikowski
 * @see http://millermedeiros.github.io/crossroads.js/
 */

/* global jQuery */
/* global crossroads */
/* global uriAnchor */

F.router = (function($, crossroads, undefined){
	"use strict";

	var
		// Dynamic information shared across the module
		stateMap = {
			$container  : null,
			anchorMap	: {
				page : 'home',
				title: 'Home'
			}
		},

		_router = crossroads.create()
	;

	_router.normalizeFn = crossroads.NORM_AS_OBJECT;


	/**
	 * Return copy of stored anchor map; minimizes overhead
	 * @method
	 * @private
	 */
	var copyAnchorMap = function(){
		return $.extend(true, {}, stateMap.anchorMap);
	};

	/**
	 * Handles changes in the hash
	 * @method
	 * @private
	 *
	 * @param {Event} e - the click event
	 */
	var _onHashChange = function(e){
		var
			anchor_map_previous = copyAnchorMap(),
			anchor_map_proposed
		;

		// attempt to parse anchor
		try {
			anchor_map_proposed = $.uriAnchor.makeAnchorMap();
		}
		catch ( error ) {
			$.uriAnchor.setAnchor( anchor_map_previous, null, true );
			return false;
		}

		stateMap.anchorMap = anchor_map_proposed;

		// Change window title
		document.title = anchor_map_proposed.title || '';

		// Get new hash and pass it to crossroads for callback calling.
		var route = '/',
			hash = window.location.hash;
		if (hash.length > 0) {
			route = hash.split('#').pop();
		}
		_router.parse(route);
		return false;
	};

	/**
	 * Handles URL clicks when the router is turned on
	 * @private
	 *
	 * @param {Event} e - the click event
	 */
	var _handleURLClick = function(e){
		// Get the absolute anchor href.
		var href = {
				prop: $(this).prop('href'),
				attr: $(this).attr('href')
			};

		if (href.attr.indexOf('javascript:void(0)') > -1)
			return;

		// Stop the default event to ensure the link will
		// not cause a page refresh.
		e.preventDefault();

		// Navigate away. If possible, construct an object and use this.go(obj)
		window.location.hash = href.attr;
	};

	// Public API
	// --------------

	/**
	 * Creates a new route pattern and add it to crossroads routes collection
	 *
	 * @method addRoute
	 *
	 * @param {String} pattern String pattern that should be used to match against requests
	 * @param {Function} handler Function that should be executed when a request matches the route pattern
	 */
	var add = function(pattern, handler) {
		_router.addRoute(pattern, handler);
	};

	/**
	 * listen to onHashChange event;
	 * get new hash
	 * pass it to crossroads
	 * trigger hashchange in the beggining
	 */
	var start = function() {

		// configure uriAnchor to use our schema
		$.uriAnchor.configModule({
			schema_map : stateMap.anchorMap
		});

		// Handle URI anchor change events.
		// This is done /after/ all feature modules are configured
		// and initialized, otherwise they will not be ready to handle
		// the trigger event, which is used to ensure the anchor
		// is considered on load
		$(window)
			.on( 'hashchange', _onHashChange )
			.trigger( 'hashchange' );

		// delegate URL anchor click
		$(document).on('click', 'a[href]:not([data-external])', _handleURLClick);
	};

	/**
	 * Stops listening for changes on either hash and URL clicks
	 * @method
	 * @public
	 */
	var stop = function(){
		$(window).off('hashchange', _onHashChange);
		$(document).off('click', _handleURLClick);
	};

	/**
	 * changeAnchorPart
	 * @purpose: Changes part of the URI anchor component
	 * @param  {object} args the map describing what part of the URI anchor we want changed.
	 * @return {boolean}
	 *         * true   the anchor portion of the URI was updated
	 *         * false   the anchor portion of the URI could not be updated
	 */
	var go = function(obj) {
		var
			anchorMapRevise = copyAnchorMap(),
			bool_return = true,
			key_name, key_name_dep
		;

		// Merge changes into anchor map
		KEYVAL:
		for(key_name in obj){
			if(obj.hasOwnProperty(key_name)){
				// skip dependent keys during iteration
				if(key_name.indexOf('_') === 0){ continue KEYVAL; }

				// update independent key value
				anchorMapRevise[key_name] = obj[key_name];

				// update matching dependent key
				key_name_dep = '_' + key_name;
				if(obj[key_name_dep]){
					anchorMapRevise[key_name_dep] = obj[key_name_dep];
				}
				else{
					delete anchorMapRevise[key_name_dep];
					delete anchorMapRevise['_s' + key_name_dep];
				}
			}
		}

		// Attempt to update URI; revert if not successful
		try {
			$.uriAnchor.setAnchor(anchorMapRevise);
		}
		catch(error) {
			// replace URI with existing state
			$.uriAnchor.setAnchor(stateMap.anchorMap, null, true);
			bool_return = false;
		}

		return bool_return;
	};

	// Return public methods
	return {
		add		: add,
		go		: go,
		start	: start,
		stop	: stop
	};
}(jQuery, crossroads));
