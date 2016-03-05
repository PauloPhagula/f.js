/* global F, riot, $, TodoStore, ActionCreator */

var app = (function() {
	"use strict";

	// override and replace default sandbox
	F.Sandbox = F.Sandbox.extend({
		dispatch: function(action) {
			this.core.dispatcher.dispatch(action);
		}
	});

	// Start by creating the core
	var core = new F.Core();

	// Logger Extension
	var loggerExtFactory = function(){

	    var Logger = F.Extension.extend({
	        init: function(options) {},
	        log: function(obj) { console.log(obj);}
	    });

	    return new Logger();
	};
	
	// register the logger extension with no dependencies
	core.registerExtension("logger", [], loggerExtFactory, {}); 


	// calculator extension depending on logger extension
	var calculatorExtFactory = function(logger) {

		var Calculator = F.Extension.extend({
			init: function(options) {},
			add: function(a,b) {return a+b;},
			subsctract: function(a,b) {return a-b;}
		});

		return new Calculator();
	};

	// notice the second parameter stating the calculator extension depends on the logger extension
	core.registerExtension("calculator", ["logger"], calculatorExtFactory, {});
	
	// Flux Action Creator creator Extension.
	// 
    // Is a set of helper methods, used by module views's event handlers,
    // to construct actions to be piped into the dispatcher.
	var actionCreatorExtFactory = function () {

		var ActionCreator = F.Extension.extend({
			createTodo: function(text) {
				return { 
					type : ActionTypes.CREATE_TODO, 
					data : { text: text }
				};
			},
			updateTodo: function(id, data) {
				return {
					type : ActionTypes.UPDATE_TODO,
					data : {id : id, updates: data}
				};
			},
			deleteTodo: function(id) {
				return {
					type : ActionTypes.DELETE_TODO,
					data : { id : id }
				};
			},
			clearCompletedTodos : function() {
				return {
					type : ActionTypes.CLEAR_COMPLETED,
					data : null
				};
			},
			markAllAsComplete: function() {
				return {
					type : ActionTypes.CLEAR_SELECTED,
					data : null
				};
			},
			markAllAsIncomplete : function(){
				return {
					type : ActionTypes.CLEAR_SELECTED,
					data : null
				};
			}
		});

		return new ActionCreator();
	};

	core.registerExtension("actionCreator", [], actionCreatorExtFactory, {});

	// todoStore see todoStore.js
	var store = new TodoStore(core.dispatcher, 'todoStore');
	core.registerStore('todoStore', store);


	// Todo Module depending on logger extension and todoStore which will be injected on startup by the core
	var TodoMVC = F.Module.extend({
		start : function(element, extensions, stores){
			
			this._sandbox.dispatch({type: "da", data: null});

			var logger = extensions["logger"];
			
			var actionCreator = extensions["actionCreator"];
			
			var todoStore = stores["todoStore"];

			this.el = element;
			this.$el = document.querySelector('[data-module="' + this._name + '"]');

			// Local Setup
			this._options.actionCreator = actionCreator;
			this._options.stores = {};
			this._options.stores.todoStore = todoStore;
			this._options.sandbox = this._sandbox;

			// Mouting module to DOM
			var tags = riot.mount(this.$el, this._name, this._options);
		},

		stop : function() {}
	});

	// notice: the second parameter stating on which ext the modules depends
	// notice: the third parameter stating on which stores the module depens
	core.registerModule('todomvc', ["logger", "actionCreator"], ["todoStore"], TodoMVC, {});


	// Router registrations
	F.router.add('/all', function(){
		console.log('route: /all is hit');
	});

	F.router.add('/active', function(){
		console.log('route: /active is hit');
	});

	F.router.add('/completed', function(){
		console.log('route: /completed is hit');
	});


	// Application initialization
	// ---

	var init = function() {
		core.init();
		core.start('todomvc', document.querySelector('[data-module="todomvc"]'));
		F.router.start();
	};

	return {
		init: init
	};

}());

app.init();
