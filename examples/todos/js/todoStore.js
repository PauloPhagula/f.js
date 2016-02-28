/* global F */

var TodoStore = F.compose({}, F.Store, {

	init : function(dispatcher, name){
		this._dispatcher = dispatcher;
		this._name = name;

		/**
		* indicates if this store is updating.
		* When updating must not accept
		*/
		this._isUpdating = false;

		this._data = [];
		this.actions = {};
			
		this.todos = {};
		this._lastID = 1;
	},

	setup : function(){
		var self = this;
		this.dispatchToken = this._dispatcher.subscribe(ActionTypes.ACTION, function(payload){
			switch (payload.type) {
				case ActionTypes.CREATE_TODO:
					self.add(payload.data.text);
					self.emitChange();
					break;
				case ActionTypes.UPDATE_TODO:
					self.update(payload.data.id, payload.data.updates);
					self.emitChange();
					break;
				case ActionTypes.DELETE_TODO:
					self.remove(payload.data.id);
					self.emitChange();
					break;
				case ActionTypes.CLEAR_COMPLETED:
					self.clearCompleted();
					self.emitChange();
					break;
				case ActionTypes.MARK_ALL_COMPLETE:
					self.markAllComplete();
					self.emitChange();
					break;
				case ActionTypes.MARK_ALL_INCOMPLETE:
					self.markAllIncomplete();
					self.emitChange();
					break;
				default:
					break;
			}
		});
	},

	add : function(todo){
		var id = "ID_" + this._lastID++;
		this.todos[id] = {
			id 			: id,
			text 		: todo,
			completed	: false
		};
		return id;
	},

	getAll : function(){
		return this.todos;
	},

	getTodo : function(id){
		return this.todos[id];
	},

	update : function(id, updates){
		if(!this.todos[id]) return;
		var updatedTodo = $.extend({}, this.todos[id], updates);
		this.todos[id] = updatedTodo;
	},

	remove : function(id){
		if(!this.todos[id]) return;
		delete this.todos[id];
	},

	clearCompleted : function(){
		for (var todo in this.todos){
			if(this.todos[todo].completed === true){
				delete this.todos[todo];
			}
		}
	},

	markAllComplete : function(){
		for(var todo in this.todos){
			if(this.todos[todo].completed === false){
				this.todos[todo].completed = true;
			}
		}
	},

	markAllIncomplete : function(){
		for(var todo in this.todos){
			if(this.todos[todo].completed === true){
				this.todos[todo].completed = false;
			}
		}
	}
});