/**
 * @fileOverview contains the basic `Module` definition, which is an
 * independent unit of functionality that is part of the total
 * structure of a web application, consisting of HTML + CSS + JavaScript
 * and which should be able to live on it's own.
 */

/* global F */

F.Module = (function(){ 'use strict';

	/**
	 * Module base class definition.
	 *
	 * @class Module
	 * @param {Sandbox} sandbox the modules sandbox
	 * @param {string} name the name of the module
	 * @param {Object} options settings for the module
	 */
	function Module(sandbox, name, options) {
		this._sandbox = sandbox;
		this._name = name;
		this._defaults = {};
		this._options  = {};
		this._services = {};
		this._options = F.compose( {}, this._defaults, options );

		/**
		 * The Module's DOM element
		 * @type {Element}
		 */
		this.$el = null;

		/**
		 * Module's DOM event delegation map.
		 * Mapping is defined in the format: 'event selector' : 'handler'
		 * @type {Object}
		 * @public
		 */
		this.events = {};
	}

	// Attach all inheritable methods to the Module prototype.
	F.compose(Module.prototype, {
		/**
		* Initializes the module on the specified element with the given options
		* Start is an empty function by default. Override it with your own implementation;
		*
		* @memberof Module
		* @method
		* @public
		* @abstract
		*
		* @param {Element} element - DOM element where module will be initialized
		* @param {Object} services - services to be used by module
		* @returns {void}
		*/
		start: function(element, services) {
            F.noop(services);
			throw new Error("Module initialization not done. Override this function");
		},

		/**
		* Destroys the module by unsubscribing for events and removing it from the DOM
		* Destroy is an empty function by default. Override it with your own implementation;
		* @memberof Module
		* @method
		* @public
		* @abstract
		* @returns {void}
		*/
		stop: function() {
			throw new Error("Module stopping not done. Override this function");
		},

		/**
		 * Replaces the `Module`'s DOM element with another and
		 * redelegates the events associated with the old element to the new.
		 * @memberof Module
		 * @param {Element} element the new `Module`'s DOM element
		 * @returns {void}
		 */
		setElement: function(element) {
			this.$el = element;
			this.undelegateEvents();
			this.delegateEvents();
		},

		/**
		 * Delegates events under the DOM element given by the `Core`
		 * upon initialization.
		 * @memberof Module
		 * @method delegateEvents
		 * @protected
		 * @final
		 *
		 * @param  {Object} events - event delegation specification.
		 * @return {void}
		 */
		delegateEvents: function(events) {
			events = events || this.events;

            var self = this;

            for (var spec in events) {

                var eventName, selector, handler;

                if (spec.indexOf(" ") === -1) {
                    eventName = spec;
                } else {
                    eventName = spec.slice(0, spec.indexOf(" "));
                    selector = spec.slice(spec.indexOf(" ") + 1, spec.length).trim();
                }

                handler = self[events[spec]];

                F.delegateEvent(self.$el, eventName, selector, handler, self);
            }
        },

        /**
         * Removes the modules's delegated events.
         * @memberof Module
         * @method undelegateEvents
         * @protected
         * @final
         *
         * @param  {Object} events - event delegation specification
         * @return {void}
         */
        undelegateEvents: function(events) {
            if (!events)
                return;

            var self = this;

            for (var spec in events) {

                var eventName, selector, handler;

                if (spec.indexOf(" ") === -1) {
                    eventName = spec;
                } else {
                    eventName = spec.slice(0, spec.indexOf(" "));
                    selector = spec.slice(spec.indexOf(" ") + 1, spec.length).trim();
                }

                handler = self[events[spec]];

                F.undelegateEvent(self.$el, eventName, selector, handler, self);
            }
        },

        /**
         * Conventioned render method.
         * Defaults to a no-op but can be overridden with code that
         * renders the `Module`s template from model data, and updates
         * this.$el with the new HTML.
         *
         * @memberof Module
         * @method
         * @protected
         * @abstract
         *
         * @return {void}
         */
        render: function(){}
	});

	Module.extend = F.extend;

	return Module;
}());
