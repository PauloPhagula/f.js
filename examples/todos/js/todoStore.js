/* global F, ActionTypes */

var TodoStore = (function(){
	"use strict";

	var todos = {},
		_lastID = 1;

	function add(todo) {
		var id = "ID_" + _lastID++;
		todos[id] = {
			id 			: id,
			text 		: todo,
			completed	: false,
			editing		: false
		};
		return id;
	}

	function update (id, updates) {
		if(!todos[id]) return;
		var updatedTodo = $.extend({}, todos[id], updates);
		todos[id] = updatedTodo;
	}

	function remove (id) {
		if(!todos[id]) return;
		delete todos[id];
	}

	function clearCompleted() {
		for (var todo in todos){
			if(todos[todo].completed === true){
				delete todos[todo];
			}
		}
	}

	function markAllComplete() {
		for(var todo in todos){
			if(todos[todo].completed === false){
				todos[todo].completed = true;
			}
		}
	}

	function markAllIncomplete() {
		for(var todo in todos){
			if(todos[todo].completed === true){
				todos[todo].completed = false;
			}
		}
	}

	return F.Store.extend({
		init : function() {

			var self = this;
			this.dispatchToken = self._dispatcher.subscribe(ActionTypes.ACTION, function(payload){
				switch (payload.type) {
					case ActionTypes.CREATE_TODO:
						add(payload.data.text);
						self.emitChange();
					break;
					case ActionTypes.UPDATE_TODO:
						update(payload.data.id, payload.data.updates);
						self.emitChange();
					break;
					case ActionTypes.DELETE_TODO:
						remove(payload.data.id);
						self.emitChange();
					break;
					case ActionTypes.CLEAR_COMPLETED:
						clearCompleted();
						self.emitChange();
					break;
					case ActionTypes.MARK_ALL_COMPLETE:
						markAllComplete();
						self.emitChange();
					break;
					case ActionTypes.MARK_ALL_INCOMPLETE:
						markAllIncomplete();
						self.emitChange();
					break;
					default:
					break;
				}
			});
		},

		getAll: function() {
			return todos;
		},

		getTodo: function (id) {
			return todos[id];
		}
	});
}());
