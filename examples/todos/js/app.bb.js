// Element.matches polyfill
if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
}

var app = (function(Mustache) { 'use strict';

    var utilExtFactory = function() {

        // By default, Underscore uses ERB-style template delimiters, change the
        // following template settings to use alternative delimiters.
        var settings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        };

        // When customizing `templateSettings`, if you don't want to define an
        // interpolation, evaluation or escaping regex, we need one that is
        // guaranteed not to match.
        var noMatch = /.^/;

        // Certain characters need to be escaped so that they can be put into a
        // string literal.
        var escapes = {
            '\\': '\\',
            "'": "'",
            'r': '\r',
            'n': '\n',
            't': '\t',
            'u2028': '\u2028',
            'u2029': '\u2029'
        };

        for (var p in escapes) {
            escapes[escapes[p]] = p;
        }

        var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
        var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

        var tmpl = function (text, data, objectName) {
            settings.variable = objectName;

            // Compile the template source, taking care to escape characters that
            // cannot be included in a string literal and then unescape them in code
            // blocks.
            var source = "__p+='" + text
                .replace(escaper, function (match) {
                    return '\\' + escapes[match];
                })
                .replace(settings.escape || noMatch, function (match, code) {
                    return "'+\n_.escape(" + unescape(code) + ")+\n'";
                })
                .replace(settings.interpolate || noMatch, function (match, code) {
                    return "'+\n(" + unescape(code) + ")+\n'";
                })
                .replace(settings.evaluate || noMatch, function (match, code) {
                    return "';\n" + unescape(code) + "\n;__p+='";
                }) + "';\n";

            // If a variable is not specified, place data values in local scope.
            if (!settings.variable) {
                source = 'with(obj||{}){\n' + source + '}\n';
            }

            source = "var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" + source + "return __p;\n";

            var render = new Function(settings.variable || 'obj', source);

            if (data) {
                return render(data);
            }

            var template = function (data) {
                return render.call(this, data);
            };

            // Provide the compiled function source as a convenience for build time
            // precompilation.
            template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

            return template;
        };

        var Util = F.Extension.extend({
            template: tmpl
        });

        return new Util();
    }

    var core = new F.Core();

    // Register global error handler
	core.dispatcher.subscribe('error', function(error){
		console.log('error: ' + JSON.stringify(error)); // Could be send via email
	});


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



    var TodosModule = F.Module.extend({

        start : function(element, extensions, stores) {
            this.model = {
                all_route_active: false,
                active_route_active: false,
                completed_route_active: false,
                todos: []
            };
            this.actionCreator = extensions["actionCreator"];

            this.todoStore = stores["todoStore"];
			this.todoStore.addChangeListener(this.onStoreChange);
			this.getStoreData();

            this.el = element;
            this.$el = document.querySelector('[data-module="' + this._name + '"]');

            var util = extensions["util"];
            this.template = document.querySelector('#tpl-' + this._name).innerHTML; // maybe innerText
            Mustache.parse(this.template);

            this.events = { // 'event selector' : 'handler',
                'click .new-todo': 'keydown',
                'click .filters li a': 'filterTodos',
                'click button.clear-completed': 'clearCompleted',
                'blur': 'doneEdit',
                'click .todoeditbox': 'editKeyUp'
            };

            this.delegateEvents(this.events);

            this.render();
        },

        stop : function() {
            this.$el.innerHTML = "";
            this.undelegateEvents(this.events);
            this.todoStore.removeChangeListener(this.onStoreChange);
        },

        delegateEvents: function(specs) {
            if (!specs)
                return;

            var self = this, event, selector, handler;

            for (var spec in specs) {
                if (spec.indexOf(" ") === -1) {
                    event = spec;
                } else {
                    event = spec.slice(0, spec.indexOf(" "));
                    selector = spec.slice(spec.indexOf(" ") + 1, spec.length).trim();
                }

                handler = specs[spec];
                self.$el.addEventListener(event, function(e){
                    console.log('event: ' + event + ', selector: ' + selector + ', handler: ' + handler + ', matches: ' + e.target.matches(selector));
                    if (selector === undefined || selector === null) {
                        self[handler].call(self || null, e);
                    } else if(e.target && e.target.matches(selector)) {
                        self[handler].call(self || null, e);
                    }
                    return self;
                });
            }
        },

        undelegateEvents: function(specs) {
            if (!specs)
                return;

            var self = this, spec, event, selector, handler;

            for (var spec in specs) {
                if (spec.indexOf(" ") === -1) {
                    event = spec;
                    selector = null;
                } else {
                    event = spec.slice(0, spec.indexOf(" "));
                    selector = spec.slice(spec.indexOf(" ") + 1, spec.length).trim();
                }

                handler = specs[spec];

                self.$el.removeEventListener(event, function(e){
                    if (selector === undefined || selector === null) {
                        self[handler].call(self || null, e);
                    } else if(e.target && e.target.matches(selector)) {
                        self[handler].call(self || null, e);
                    }
                });
            }
        },

        onStoreChange: function(){
            this.getStoreData();
			this.render();
		},

        getStoreData: function() {
            var self = this;
            var model = self.model;
			var _todos = this.todoStore.getAll();
			model.todos = [];
			for (var prop in _todos) {
				if (_todos.hasOwnProperty(prop)) {
					_todos[prop].done = _todos[prop].completed;
					_todos[prop].edit = false;
					_todos[prop].hide = false;
					model.todos.push(_todos[prop]);
				}
			}

			model.pendingtodos = 0;
			model.todos.forEach(function(todo, index, array){
				if (!todo.completed)
                    model.pendingtodos++;
			});
            model.pendingText = model.pendingtodos === 1 ? 'item' : 'items';

			model.hasCompletedtodos = false;
			model.todos.forEach(function(todo, index, array){
				if (todo.completed)
                    hasCompletedtodos = true;
			});
		},

        render: function() {
            this.$el.innerHTML = Mustache.render(this.template, this.model);
        },

        // Event handlers
        // ---

        keydown : function(e) {
            console.log('keydown');
            var self = this, ENTER_KEY = 13, ESC_KEY = 27;
            switch(e.keyCode) {
				case ENTER_KEY:
					var textArea = self.$el.querySelector('.new-todo'),
						newTodo = textArea.value;

					textArea.value = "";
					if (newTodo)
						self._sandbox.dispatch(self.actionCreator.createTodo(newTodo));
					break;
				default:
					break;
			}
        },

        filterTodos: function(event) {
            console.log('filtering');
            self = this;
            var model = self.model;
			switch(event.target.innerHTML){
				case 'All':
					model.todos.forEach(function(todo, index, array){
						todo.hide = false;
					})
					model.all_route_active = true;
					model.active_route_active = false;
					model.completed_route_active = false;
					break;
				case 'Active':
					model.todos.forEach(function(todo, index, array){
						todo.hide = todo.completed ? true : false;
					})
					model.all_route_active = false;
					model.active_route_active = true;
					model.completed_route_active = false;
					break;
				case 'Completed':
					model.todos.forEach(function(todo, index, array){
						todo.hide = todo.completed ? false : true;
					})
					model.all_route_active = false;
					model.active_route_active = false;
					model.completed_route_active = true;
					break;
				default:
					// no op
			}

			self.update();
		},

		add: function(event) {
			var textArea = self.$el.querySelector('textarea'),
				newTodo = textArea.value;

			textArea.value = "";

			this._sandbox.dispatch(this.actionCreator.createTodo(newTodo));
		},

		updateTodo: function (todo) {
			this._sandbox.dispatch(this.actionCreator.updateTodo(todo));
		},

		remove: function (event) {
			// looped todo
    		var todo = event;
			// index on the collection
    		var index = this.todos.indexOf(todo);

			this._sandbox.dispatch(this.actionCreator.deleteTodo(todo.id));
		},

		toggleComplete: function (event) {
			var todo = event;
			this._sandbox.dispatch(this.actionCreator.updateTodo(todo.id, {completed: todo.completed}));
		},

		clearCompleted: function(event) {
			this._sandbox.dispatch(this.actionCreator.clearCompletedTodos());
		},

        doneEdit: function(event) {},

        editKeyUp: function(event) {}
    });

    // Public
	// ---

	var store = new TodoStore(core.dispatcher, 'todoStore');
    core.setConfig({debug: true});
    core.registerStore('todoStore', store);
    core.registerExtension("actionCreator", [], actionCreatorExtFactory, {});
    core.registerExtension("util", [], utilExtFactory, {});
    core.registerModule('todomvc', ["actionCreator", "util"], ["todoStore"], TodosModule, {});

	return {
		boot: function() {
			core.init();
		},
		shutdown: function() {
			core.destroy();
		}
	};
}(Mustache));

app.boot();
