/*global riot, $ */
<todomvc>
	<!-- Layout -->
	<section class="todoapp">
		<header class="header">
			<h1>todos</h1>
			<input class="new-todo" placeholder="What needs to be done?" autofocus autocomplete="off">
		</header>
		<!-- This section should be hidden by default and shown when there are todos -->
		<section class="main">
			<input class="toggle-all" type="checkbox">
			<label for="toggle-all">Mark all as complete</label>
			<ul class="todo-list">
				<!-- These are here just to show the structure of the list todos -->
				<!-- List todos should get the class `editing` when editing and `completed` when marked as completed -->
				<li riot-tag="todotodo" class="{ completed: t.completed, editing: t.editing}" each={ t in todos } todo={t} parentview={parent} if={!t.hide}></li>
			</ul>
		</section>
		<!-- This footer should hidden by default and shown when there are todos -->
		<footer class="footer" if={ todos.length }>
			<!-- This should be `0 todos left` by default -->
			<span class="todo-count"><strong>{ pendingtodos }</strong> { pendingtodos === 1 ? 'todo' : 'todos' } left</span>
			<!-- Remove this if you don't implement routing -->
			<ul class="filters">
				<li>
					<a class="{ selected : all_route_active }" href="/all" onclick={ filter }>All</a>
				</li>
				<li>
					<a class="{ selected : active_route_active }" href="/active" onclick={ filter }>Active</a>
				</li>
				<li>
					<a class="{ selected : completed_route_active }" href="/completed" onclick={ filter }>Completed</a>
				</li>
			</ul>
			<!-- Hidden if no completed todos are left ↓ -->
			<button class="clear-completed" if={ hasCompletedtodos } onclick={ clearCompleted }>Clear completed</button>
		</footer>
	</section>

	<!-- Logic -->
	<script>
		'use strict';

		var self = this,
			ENTER_KEY = 13,
			ESC_KEY = 27;

		self.all_route_active = true;
		$('body').keydown(function(e){
			switch(e.keyCode) {
				case ENTER_KEY:
					var textArea = document.querySelector('input.new-todo'),
						newTodo = textArea.value;

					textArea.value = "";
					if (newTodo)
						opts.sandbox.dispatch(opts.actionCreator.createTodo(newTodo));
					break;
				default:
					break;
			}
		});

		function getStoreData(){
			var _todos = opts.stores.todoStore.getAll();
			self.todos = [];
			for(var prop in _todos){
				if(_todos.hasOwnProperty(prop)){
					_todos[prop].done = _todos[prop].completed;
					_todos[prop].edit = false;
					_todos[prop].hide = false;
					self.todos.push(_todos[prop]);
				}
			}

			self.pendingtodos = 0;
			self.todos.forEach(function(todo, index, array){
				if(!todo.completed) self.pendingtodos++;
			});

			self.hasCompletedtodos = false;
			self.todos.forEach(function(todo, index, array){
				if(todo.completed) self.hasCompletedtodos = true;
			});
		}

		function changeListener(){
			getStoreData();
			self.update();
		}

		this.on('mount', function() {
			// register change listeners on stores right after tag is mounted on the page
			for(var store in opts.stores){
				if(opts.stores.hasOwnProperty(store)){
					opts.stores[store].addChangeListener(changeListener);
				}
			}

			getStoreData();
		});

		this.on('unmount', function() {
			// deregister change listeners on stores right after tag is unmounted on the page
			for(var store in opts.stores){
				if(opts.stores.hasOwnProperty(store)){
					opts.stores[store].removeChangeListener(changeListener);
				}
			}
		});

		filter(event) {
			switch(event.target.innerHTML){
				case 'All':
					self.todos.forEach(function(todo, index, array){
						todo.hide = false;
					})
					self.all_route_active = true;
					self.active_route_active = false;
					self.completed_route_active = false;
					break;
				case 'Active':
					self.todos.forEach(function(todo, index, array){
						todo.hide = todo.completed ? true : false;
					})
					self.all_route_active = false;
					self.active_route_active = true;
					self.completed_route_active = false;
					break;
				case 'Completed':
					self.todos.forEach(function(todo, index, array){
						todo.hide = todo.completed ? false : true;
					})
					self.all_route_active = false;
					self.active_route_active = false;
					self.completed_route_active = true;
					break;
				default:
					// no op
			}

			self.update();
		}

		add(event) {
			var textArea = document.querySelector('textarea'),
				newTodo = textArea.value;

			textArea.value = "";

			opts.sandbox.dispatch(opts.actionCreator.createTodo(newTodo));
		}

		updateTodo(todo) {
			opts.sandbox.dispatch(opts.actionCreator.updateTodo(todo));
		}

		remove(event) {
			// looped todo
    		var todo = event;
			// index on the collection
    		var index = self.todos.indexOf(todo);

			opts.sandbox.dispatch(opts.actionCreator.deleteTodo(todo.id));
		}

		toggleComplete(event) {
			var todo = event;
			opts.sandbox.dispatch(opts.actionCreator.updateTodo(todo.id, {completed: todo.completed}));
		}

		clearCompleted(event) {
			opts.sandbox.dispatch(opts.actionCreator.clearCompletedTodos());
		}
	</script>
</todomvc>

<todotodo>
	<div class="view">
		<input class="toggle" type="checkbox" checked={ opts.todo.completed } onclick={ toggleTodo }>
		<label ondblclick="{ editTodo }">{ opts.todo.text }</label>
		<button class="destroy" onclick={ removeTodo}></button>
	</div>
	<input name="todoeditbox" class="edit" type="text" onoblur={ doneEdit } onkeyup= {editKeyUp}>

	<script>
		'use strict';

		var self = this,
			ENTER_KEY = 13,
			ESC_KEY = 27;

		opts.todo.editing = false;

		toggleTodo() {
			opts.todo.completed = !opts.todo.completed;
			opts.parentview.toggleComplete(opts.todo);
		};

		editTodo() {
			opts.todo.editing = true;
			self.todoeditbox.value = opts.todo.text;
		};

		removeTodo() {
			opts.parentview.remove(opts.todo);
		}

		doneEdit() {
			if (!opts.todo.editing) {
				return true;
			}
			opts.todo.editing = false;
			var enteredText = self.todoeditbox.value && self.todoeditbox.value.trim();
			if (enteredText) {
				opts.todo.text = enteredText;
				opts.parentview.updateTodo(opts.todo);
			} else {
				self.removeTodo(opts.todo);
			}
		};

		editKeyUp(e) {
			if (e.which === ENTER_KEY) {
				self.doneEdit();
			} else if (e.which === ESC_KEY){
				self.todoeditbox.value = opts.todo.text;
				self.doneEdit();
			}
		};

		self.on('update', function(){
			if (opts.todo.editing) {
				opts.parentview.update();
				self.todoeditbox.focus();
			}
		});
	</script>
</todotodo>
