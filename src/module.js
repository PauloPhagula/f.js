/*

Modules Aka Controller-Views create a meaningful user experience,
ex: a stocks module tell us all we want to know about the stock market

Controller-Views - views often found at the top of the hierarchy that retrieve data from the stores and pass this data down to their children

Responsabilities
- Provides a well-scoped capability to the application.
- Creates and manages its own content (typically HTML and SVG) in a container provided by the sandbox
- Provides a consistent API to the Shell for configuration, initialization, and use
- Is kept isolated from other features by using unique and coordinated JavaScript
and CSS namespaces, and by not allowing any external calls except to shared utilities

Uses the UI Components

- Rules
- Only call your own methods or those in the sandbox
- don't access DOM elements outside of your box
- Don't access non-native global objects
- Anything else you need ask the sandbox
- don't create global objects
- don't directly reference other modules
- modules only know the sandbox, the rest of the architecture doesn't exist to them
- Manage data and views

http://foss-haas.github.io/fynx/
View Components are components that listen to Stores and/or invoke Actions.
According to the philosophy of React, these should usually be the outer most components in an application.
They pass (immutable) data from Stores as props to the underlying Pure Components, the regular self-contained React components.
They may also invoke Actions as the result of user interaction with those components.


It's called mod to avoid colisions with requirejs
*/

/* global riot, $ */
;F.Module = (function(undefined){
	"use strict";

	var module_selector = '[data-module]';

	/**
	 * @constructor
	 * @param {Sandbox} the modules sandbox
	 * @param {Object} options - settings for the module
	 */
	function Module(sandbox, name, options) {
		this._sandbox = sandbox;
		this._name = name;
		this._defaults = { stores: {} };
		this._options  = {};
		this._options = $.extend( {}, this._defaults, options );
		
		// Access to jQuery and DOM versions of element
		this.$el;
		this.el;
	}

	F.compose(Module.prototype, {
		/**
		* initializes the module on the specified element with the given options
		* @param {Element} element - DOM element where module will be initialized
		* @param {Object} stores - stores to be used by module
		*/
		start : function(element, stores) {
			this.el = element;
			this.$el = document.querySelector('[data-module="' + this._name + '"]');


			// Render the module components
			// ----------------------------
			// With React
			// React.render(<MyComponent/>, this.$el);
			//
			// With Backbone
			// var view = new Backbone.View({
			//		render: function(){
			//			this.$el.html('<h1>Hello</h1>')
			//		}
			//	});
			//
			// With Riot
			// riot.mount(this.$el, this._name, this._options);

			// register for listening to events
			// --------------------------------
			// this._sandbox.subscribe(
			//		'channel',
			//		function(payload){
			//			// handle payload
			//		},
			//		this
			// );
		},

		/**
		* Destroys the module by unsubscribing for events and removing it from the DOM
		*/
		stop: function() {
			this.$el.innerHTML = '';
		}
	});

	Module.extend = F.extend;
	return Module;
}());