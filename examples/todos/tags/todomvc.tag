<todomvc>
	<!-- Layout -->
	<section class="todoapp">
		<header class="header">
			<h1>todos</h1>
			<input class="new-todo" placeholder="What needs to be done?" autofocus>
		</header>
		<!-- This section should be hidden by default and shown when there are todos -->
		<section class="main">
			<input class="toggle-all" type="checkbox">
			<label for="toggle-all">Mark all as complete</label>
			<ul class="todo-list">
				<!-- These are here just to show the structure of the list items -->
				<!-- List items should get the class `editing` when editing and `completed` when marked as completed -->
				<li each={ items } class="{ completed: done, editing: edit}" ondblclick={ edit } if={!hide}>
					<div class="view">
						<input class="toggle" type="checkbox" checked={ selected } onclick={ parent.toggleComplete }>
						<label>{ text }</label>
						<button class="destroy" onclick={ parent.remove }></button>
					</div>
					<input class="edit" value="Create a TodoMVC template">
				</li>
			</ul>
		</section>
		<!-- This footer should hidden by default and shown when there are todos -->
		<footer class="footer" if={ items.length }>
			<!-- This should be `0 items left` by default -->
			<span class="todo-count"><strong>{ pendingItems }</strong> item left</span>
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
			<!-- Hidden if no completed items are left ↓ -->
			<button class="clear-completed" if={ hasCompletedItems } onclick={ clearCompleted }>Clear completed</button>
		</footer>
	</section>

	<!-- Logic -->
	<script>
		var self = this;
		var ENTER_KEY = 13, ESC_KEY = 27;
		self.all_route_active = true;
		$('body').keydown(function(e){
			switch(e.keyCode) {
				case ENTER_KEY:
					var textArea = document.querySelector('input.new-todo'),
						newTodo = textArea.value;

					textArea.value = "";
					if(newTodo)
						opts.actionCreator.createTodo(newTodo);
					break;
				default:
					break;
			}
		});

		function getStoreData(){
			_items = opts.stores.todoStore.getAll();
			self.items = [];
			for(var prop in _items){
				if(_items.hasOwnProperty(prop)){
					_items[prop].done = _items[prop].completed;
					_items[prop].edit = false;
					_items[prop].hide = false;
					self.items.push(_items[prop]);
				}
			}

			self.pendingItems = 0;
			self.items.forEach(function(item, index, array){
				if(!item.completed) self.pendingItems++;
			});

			self.hasCompletedItems = false;
			self.items.forEach(function(item, index, array){
				if(item.completed) self.hasCompletedItems = true;
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
					self.items.forEach(function(item, index, array){
						item.hide = false;
					})
					self.all_route_active = true;
					self.active_route_active = false;
					self.completed_route_active = false;
					break;
				case 'Active':
					self.items.forEach(function(item, index, array){
						if(!item.completed) item.hide = false;
						if(item.completed) item.hide = true;
					})
					self.all_route_active = false;
					self.active_route_active = true;
					self.completed_route_active = false;
					break;
				case 'Completed':
					self.items.forEach(function(item, index, array){
						if(item.completed) item.hide = false;
						if(!item.completed) item.hide = true;
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

			opts.actionCreator.createTodo(newTodo);
		}

		remove(event) {
			// looped item
    		var item = event.item;
			// index on the collection
    		var index = self.items.indexOf(item);

			opts.actionCreator.deleteTodo(item.id);
		}

		toggleComplete(event) {
			var item = event.item;
			opts.actionCreator.updateTodo(item.id, {completed: !item.completed});
		}

		clearCompleted(event) {
			opts.actionCreator.clearCompletedTodos();
		}

		edit(event) {
			console.log('dbclick fired');
			var item = event.item;
		}
	</script>
</todomvc>