/* global F, riot */

var app = (function() {"use strict";

	// override and replace default sandbox
	F.Sandbox = F.Sandbox.extend({
		dispatch: function(action) {
			this.core.dispatcher.dispatch(action);
		}
	});

	// Flux Action Creator creator Extension.
	//
    // Is a set of helper methods, used by module views's event handlers,
    // to construct actions to be piped into the dispatcher.
	var actionCreatorSvcFactory = function (core) {

		return {
			init: function(options) {},
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
		};
	};

	// Todo Module depending on logger extension and todoStore which will be injected on startup by the core
	var TodoMVC = F.Module.extend({

		events: {
            'click .some-class': 'clickHandler'
        },

		start : function(element, services) {
			var actionCreator = services.actionCreator;
			var todoStore = services.todoStore;

			this.$el = element;

			// Local Setup
			this._options.actionCreator = actionCreator;
			this._options.stores = {};
			this._options.stores.todoStore = todoStore;
			this._options.sandbox = this._sandbox;

			// Mouting module to DOM
			riot.mount(this.$el, this._name, this._options);
		},

		stop : function() {},

		clickHandler: function(event) {}
	});

	 // if the `router` also manages `views`/`modules` then the router is also the `core`
    // and thus both should somehow be merged
    var AppRouter = F.Router.extend({
        routes: { // 'pattern flags': 'handler'
            '/:action': 'hitRoute',
            '/(.*)/ i': 'hitRegex'
        },

        currentView: null,
        previousView: null,
        swapViews: function(view) {

        },

        hitRoute: function(params) {
            console.log('hit route: ' + params.action);
        },

        hitRegex: function(pos) {
            console.log('hit regex:' + pos);
        }
    });

   	var router = new AppRouter('examples/todos/', true);

	// Application initialization
	// ---
	
	// Start by creating the core
	var core = new F.Core();

	// Setting configuration for the app
	core.setConfig({debug: false}); 

	// Register global error handler
	core.dispatcher.subscribe('error', function(error){
		console.log('error: ', error); // Could be send via email
	});

	core.registerService("actionCreator", [], actionCreatorSvcFactory, {});
	core.registerService('todoStore', ["core"], todoStoreSvcFactory, {});
	
	// notice: the second parameter stating on which ext the modules depends
	// notice: the third parameter stating on which stores the module depens
	core.registerModule('todomvc', ["actionCreator", "todoStore"], TodoMVC, {});

	return {
		boot: function() {
			core.init();
			router.start();
		},
		shutdown: function() {
			core.destroy();
			router.stop();
		}
	};
}());

app.boot();
