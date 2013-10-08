function sanitize(str) {
	str_array = str.split("");
	var new_array = _.select(str_array, function(letter) {
		return !letter.match(/['"]/);
	} );
	return new_array.join("");
}

function getDueDate(date, due_mins) {
	date.setMinutes(date.getMinutes() + due_mins);
	return date
}


var TodoItem = function(text, due_mins) {
	var date = new Date();
	var due_date = new Date();
	var mins = due_mins || 5
	
	due_date.setMinutes(due_date.getMinutes() + mins)

	
	this.text = text;
	this.created = date
	this.completed = '';
	this.due_date = due_date;
};

var TodoApp = function() {
	this.finished_tasks = [];
	this.unfinished_tasks = [];
	this.warn_times = [295,290,285]

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
		var due_timer;
		var delete_btn = this.makeButton('delete');
		var complete_btn;
		var action_span = document.createElement('span');
		action_span.className = "actions"
		el.className = "items";
		el.dataset.tasktext = task.text;

		el.appendChild(text_span);
		el.appendChild(meta_data);
		
		
		if (!complete) {
			due_timer = this.makeDueTimer(task);
			complete_btn = this.makeButton('complete');
			action_span.appendChild(due_timer);
			action_span.appendChild(complete_btn);

		} else {
			el.dataset.completed = 'true';
		}

		action_span.appendChild(delete_btn);
		el.appendChild(action_span);
		return el 
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
			meta_data.innerText = " completed at " + task.completed.toLocaleTimeString() + " ";
		} else {
			meta_data.innerText = " created at " + task.created.toLocaleTimeString() + " ";
		}
		return meta_data;
	};

	this.makeDueTimer = function(task) {
		var due_timer = document.createElement('span');
		due_timer.className = 'due-timer';
		due_timer.innerText = "due " + task.due_date.toLocaleTimeString();
		return due_timer

	};

	this.updateTimer = function(el) {
		var timer = el.getElementsByClassName('due-timer')[0];
		var task = _.findWhere(this.unfinished_tasks, {text: el.dataset.tasktext});
		var now = new Date();
		var due = Math.round((task.due_date - now) / 1000);
		if (due > this.warn_times[0]) {
			el.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
			el.style.border = '2px solid rgba(0, 255, 0, 0.3)';

		} else if (due > this.warn_times[1]) {
			el.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
			el.style.border = '2px solid rgba(255, 255, 0, 0.3)';

		} else if (due > this.warn_times[2]) {
			el.style.backgroundColor = 'rgba(255, 165, 0, 0.2)';
			el.style.border = '2px dotted rgba(255, 165, 0, 0.3)';
		} else {
			el.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
			el.style.border = '2px dashed rgba(255, 0, 0, 0.3)';

		}

		timer.innerText = "due in " + due + " seconds";
	}

	this.makeButton = function(class_name) {
		var button = document.createElement('button');
		button.className = class_name;
		if (class_name == 'delete') {
			button.innerText = 'Delete';
			button.onclick = function() { todo_app.deleteTask(this.parentElement.parentElement); }
		} else {
			button.innerText = 'Complete';
			button.onclick = function() { todo_app.completeTask(this.parentElement.parentElement); }	
		}

		return button
	};



	this.appendTask = function(el, complete) {
		if (complete) {
			completed_items.appendChild(el);
		} else {
			this.updateTimer(el);
			todo_items.appendChild(el);
			el.timer = setInterval(function() { todo_app.updateTimer(el); }, 1000);
		}
	};

	this.completeTask = function(el) {
		clearInterval(el.timer);
		var completed = new Date();
		var text = el.dataset.tasktext;
		var task, completed_el;

		el.remove();

		task = _.findWhere(this.unfinished_tasks, {text: text});
		
		if (task) {
			task.completed = completed;
		}

		completed_el = this.makeTaskElement(task, true);

		this.unfinished_tasks = _.reject(this.unfinished_tasks, function(task) { return task.text == text } );		
		this.finished_tasks.push(task);
		
		this.storeTasks();

		this.appendTask(completed_el, true);

	};

	this.deleteTask = function(el) {
		clearInterval(el.timer);
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
var first_item;
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
		task.created = new Date(task.created);
		task.due_date = new Date(task.due_date);
		
		var el = todo_app.makeTaskElement(task, false)
		todo_app.appendTask(el, false);
	});

	_.each(stored_finished_tasks, function(task) {
		task.created = new Date(task.created);
		task.due_date = new Date(task.due_date);
		task.completed = new Date(task.completed);
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

	first_item = document.getElementsByClassName('items')[0]
}




// localStorage.setItem('task', 'my key name');
// var json = JSON.stringify(item);
// JSON.parse(json); => it returns the object item

// var new_array = _.reject(todo_app.unfinished_tasks, function(task) { return task.text == 'sweet task' } )




















