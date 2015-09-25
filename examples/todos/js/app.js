/* global F, riot, $ */

var store = TodoStore;
store.init(F.Core.dispatcher, 'todoStore');
store.setup();

var TodoMVC = F.Module.extend({
	constructor: function(sandbox, name, options){
		// Always call super first
		F.Module.call(this, sandbox, name, options);
	},
	start : function(element, options){
		// Always call super first
		F.Module.prototype.start.call(this, element, options);

		// Local Setup
		this._options.actionCreator = ActionCreator;
		this._options.stores = {};
		this._options.stores.todoStore = store;
		this._options.sandbox = this._sandbox;

		// Mouting module to DOM
		var tags = riot.mount(this.$el, this._name, this._options);
	}
});

F.Core.register('todomvc', TodoMVC, {});
F.Core.init();
F.Core.start('todomvc', document.querySelector('[data-module="todomvc"]'));


F.router.add('/all', function(){
	console.log('route: /all is hit');
})

F.router.add('/active', function(){
	console.log('route: /active is hit');
})

F.router.add('/completed', function(){
	console.log('route: /completed is hit');
})

F.router.start();