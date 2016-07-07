/**
 * Module
 *
 * A `Module` is an independent unit of functionallity that is part of the total
 * structure of a web application, which consists of HTML + CSS + JavaScript
 * and which should be able to live on it's own.
 */

/* global riot, $ */
F.Module = (function(undefined){
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
		this._defaults = {};
		this._options  = {};
		this._extensions = {};
		this._stores = {};
		this._options = $.extend( {}, this._defaults, options );

		// Access to jQuery and DOM versions of element
		this.$el = null;
		this.el  = null;
	}

	// Attach all inheritable methods to the Module prototype.
	F.compose(Module.prototype, {
		/**
		* Initializes the module on the specified element with the given options
		*
		* Start is an empty function by default. Override it with your own implementation;
		*
		* @param {Element} element - DOM element where module will be initialized
		* @param {Object} extensions - extensions to be used by module
		* @param {Object} stores - stores to be used by module
		*/
		start : function(element, extensions, stores) {
			throw new Error("Module initialization not done. Override this function");
		},

		/**
		* Destroys the module by unsubscribing for events and removing it from the DOM
		*
		* Destroy is an empty function by default. Override it with your own implementation;
		*/
		stop: function() {
			throw new Error("Module stopping not done. Override this function");
		}
	});

	Module.extend = F.extend;
	return Module;
}());
