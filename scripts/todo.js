function sanitize(str) {
	str_array = str.split("");
	var new_array = _.select(str_array, function(letter) {
		return !letter.match(/['"]/);
	} );
	return new_array.join("");
}


var TodoItem = function(text) {
	var date = new Date();
	this.text = text;
	this.created = date.toLocaleTimeString();
	this.completed = '';
};

var TodoApp = function() {
	this.finished_tasks = [];
	this.unfinished_tasks = [];

	this.createTask = function(text) {
		text = sanitize(text);
		var el;
		var task = new TodoItem(text);
		if (_.findWhere(this.unfinished_tasks, {text: text})) {
			// do nothing!
		} else {
			this.unfinished_tasks.push(task);
			localStorage.setItem('unfinished_tasks', JSON.stringify(this.unfinished_tasks));
			el = this.makeTaskElement(task, false);
			this.appendTask(el, false);
		}

		
	};

	this.makeTaskElement = function(task, complete) {
		var el = document.createElement('li');
		var text_span = this.makeTextSpan(task);
		var meta_data = this.makeMetaData(task, complete);
		var delete_btn = this.makeButton('delete');
		var complete_btn = this.makeButton('complete');
		el.className = "items";
		el.dataset.tasktext = task.text;

		el.appendChild(text_span);
		el.appendChild(meta_data);
		
		
		if (!complete) {
			el.appendChild(complete_btn)
		} else {
			el.dataset.completed = 'true';
		}

		el.appendChild(delete_btn);
		return el 
	};

	this.makeButton = function(class_name) {
		var button = document.createElement('button');
		button.className = class_name;
		if (class_name == 'delete') {
			button.innerText = 'Delete';
			button.onclick = function() { todo_app.deleteTask(this.parentElement); }
		} else {
			button.innerText = 'Complete';
			button.onclick = function() { todo_app.completeTask(this.parentElement); }	
		}

		return button
	};

	this.makeTextSpan = function(task) {
		var text_span = document.createElement('span');
		text_span.className = "task-text";
		text_span.innerText = task.text;
		return text_span;
	};

	this.makeMetaData = function(task, complete) {
		var meta_data = document.createElement('span');
		meta_data.className = "meta-data";
		if (complete) {
			meta_data.innerText = " completed at " + task.completed + " ";
		} else {
			meta_data.innerText = " created at " + task.created + " ";
		}
		return meta_data;
	};



	this.appendTask = function(el, complete) {
		if (complete) {
			completed_items.appendChild(el);
		} else {
			todo_items.appendChild(el);
		}
	};

	this.completeTask = function(el) {
		var completed = new Date();
		var text = el.dataset.tasktext;
		var task, completed_el;

		el.remove();

		task = _.findWhere(this.unfinished_tasks, {text: text});
		
		if (task) {
			task.completed = completed.toLocaleTimeString();
		}

		completed_el = this.makeTaskElement(task, true);

		this.unfinished_tasks = _.reject(this.unfinished_tasks, function(task) { return task.text == text } );		
		this.finished_tasks.push(task);
		
		this.storeTasks();

		this.appendTask(completed_el, true);

	};

	this.deleteTask = function(el) {
		var updated_array, task;
		var completed = el.dataset.completed;
		var text = el.dataset.tasktext;
		var task;
		if (completed) {
			//take out of finished
			task = _.findWhere(this.finished_tasks, {text: text});
			updated_array = _.reject(this.finished_tasks, function(task) { return task.text == text; } );
			this.finished_tasks = updated_array;
			localStorage.setItem('finished_tasks', JSON.stringify(this.finished_tasks));

		} else {
			// take out of unfinished
			task = _.findWhere(this.unfinished_tasks, {text: text});
			updated_array =  _.reject(this.unfinished_tasks, function(task) { return task.text == text; } );
			this.unfinished_tasks = updated_array;
			localStorage.setItem('unfinished_tasks', JSON.stringify(this.unfinished_tasks));

		}
		el.remove();
	};

	this.storeTasks = function() {
		localStorage.setItem('finished_tasks', JSON.stringify(this.finished_tasks));
		localStorage.setItem('unfinished_tasks', JSON.stringify(this.unfinished_tasks));
	};

	
};

var todo_app = new TodoApp();

var test_task = new TodoItem('test task');

var add_item, new_task_field, todo_items, completed_items, stored_unfinished_tasks, stored_finished_tasks;

window.onload = function() {
	add_item = document.getElementById('add-item');
	new_task_field = document.getElementById('new-task-field');
	todo_items = document.getElementById('todo-items');
	completed_items = document.getElementById('completed-items');

	stored_unfinished_tasks = JSON.parse(localStorage.getItem('unfinished_tasks'));
	stored_finished_tasks = JSON.parse(localStorage.getItem('finished_tasks'));

	todo_app.unfinished_tasks = stored_unfinished_tasks || [];
	todo_app.finished_tasks = stored_finished_tasks || [];


	_.each(stored_unfinished_tasks, function(task) {
		var el = todo_app.makeTaskElement(task, false)
		todo_app.appendTask(el, false);
	});

	_.each(stored_finished_tasks, function(task) {
		var el = todo_app.makeTaskElement(task, true);
		todo_app.appendTask(el, true);
	});

	add_item.addEventListener('click', function(e) {
		var text = new_task_field.value;
		new_task_field.value = ""
		todo_app.createTask(text);
	});

	new_task_field.addEventListener('keyup', function(e) {
		if (e.keyCode == 13) {
			var text = this.value;
			this.value = ""
			todo_app.createTask(text);
		}
	});
}




// localStorage.setItem('task', 'my key name');
// var json = JSON.stringify(item);
// JSON.parse(json); => it returns the object item

// var new_array = _.reject(todo_app.unfinished_tasks, function(task) { return task.text == 'sweet task' } )




















