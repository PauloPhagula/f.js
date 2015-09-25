/**
 * Flux Action Creators
 * They are helper methods, used by views's event handlers, to construct actions and pipe them into the dispatcher
 */
/* global F */

;var ActionCreator = (function(dispatcher){

	var createTodo = function(text) {
		
		dispatcher.publishAction({
			type : ActionTypes.CREATE_TODO,
			data : {
				text: text
			}
		});
	}

	var deleteTodo = function(id) {
		dispatcher.publishAction({
			type : ActionTypes.DELETE_TODO,
			data : { id : id }
		});
	}

	var updateTodo = function(id, data) {
		dispatcher.publishAction({
			type : ActionTypes.UPDATE_TODO,
			data : {id : id, updates: data}
		});
	}

	var clearCompletedTodos = function(){
		dispatcher.publishAction({
			type : ActionTypes.CLEAR_COMPLETED,
			data : null
		});
	}

	var markAllAsComplete = function(){
		dispatcher.publishAction({
			type : ActionTypes.CLEAR_SELECTED,
			data : null
		});
	}

	var markAllAsIncomplete = function(){
		dispatcher.publishAction({
			type : ActionTypes.CLEAR_SELECTED,
			data : null
		});
	}

	// Public API
	// ----------
	return {
		createTodo 			: createTodo,
		updateTodo 			: updateTodo,
		deleteTodo 			: deleteTodo,
		clearCompletedTodos : clearCompletedTodos,
		markAllAsComplete 	: markAllAsComplete,
		markAllAsIncomplete : markAllAsIncomplete
	};

}(F.Core.dispatcher));