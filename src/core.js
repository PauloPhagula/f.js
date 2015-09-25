/**
 * Core aka Shell aka Application Wide Controller aka Mediator
 * Contains the main application object that is the heart of the JavaScript architecture
 * Responsabilities:
 *   - Manages the lifecyle of modules (registers, starts, renders and stops modules)
 *   - Manages communication between modules
 *   - Coordinates feature modules, dispatching feature specific tasks
 *   - Managing the application state using Anchor Interface Pattern
 *   - Manages application wide features/interfaces such as URL anchor(hash fragment), feature containers, cookies
 *   - Detects, traps and reports errors in the system. Uses available information to determine best course of action
 *   - Allow loose coupling between modules that are related to one another
 *   - Error management will also be handled by the application core
 *   - Be extensible
 */

/* global riot */

;F.Core = (function(undefined){
	"use strict";

	var
		_modules = {}, // Inited Modules data

		// Cache DOM node and collections
		domMap = {},

		setDomMap,  initModule
	;


	setDomMap = function(){
		//var $container = stateMap.$container;
		// domMap = { $container : $container };
	};

	initModule = function($container){
		// load HTML and map jQuery collections
		// stateMap.$container = $container;

		// Render Main App Component
		// riot.mount($container, 'app', {});
		setDomMap();
	}

	return {
		register: function(moduleId, creator, options){
			_modules[moduleId] = {
				creator: creator,
				options: options,
				instance: null
			};
		},

		start: function(moduleId, element){
			var module = _modules[moduleId];
			module.instance = new module.creator(new F.Sandbox(this, moduleId, element), moduleId, module.options);
			module.instance.start();
		},

		stop: function(moduleId){
			var data = _modules[moduleId];
			if(data.instance){
				data.instance.stop();
				data.instance = null;
			}
		},

		restart: function(moduleId){
			this.stop(moduleId);
			this.start(moduleId);
		},

		startAll: function(){
			for (var moduleId in _modules){
				if(_modules.hasOwnProperty(moduleId)){
					this.start(moduleId);
				}
			}
		},

		stopAll: function(){
			for (var moduleId in _modules){
				if(_modules.hasOwnProperty(moduleId)){
					this.stop(moduleId);
				}
			}
		},

		reportError: function(severity, msg, obj){
			this.log(severity, msg, obj);
		},

		init : initModule
	}
}());