var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var taskIdCounter = 0;
var pageContentEl = document.querySelector("#page-content");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");

var tasks = [];

//Gather data from user input for task
var taskFormHandler = function (event) {
  //prevent default refresh
  event.preventDefault();

  //establish variables for user input
  var taskNameInput = document.querySelector("input[name='task-name']").value;
  var taskTypeInput = document.querySelector("select[name='task-type']").value;

  // check if input values are empty strings
  if (!taskNameInput || !taskTypeInput) {
    alert("You need to fill out the task form!");
    return false;
  }

  //Reset form after submitting
  formEl.reset();

  //When edit button is clicked on a task, it will reload in form. it will already have a data-task-id (new tasks won't)
  var isEdit = formEl.hasAttribute("data-task-id");

  ///has data attribute, so get task id and call function to complete edit process
  if (isEdit) {
    var taskId = formEl.getAttribute("data-task-id");
    completeEditTask(taskNameInput, taskTypeInput, taskId);
  }
  //create variables for new task inputs because no data attribute present
  else {
    var taskDataObj = {
      name: taskNameInput,
      type: taskTypeInput,
      status: "to do",
    };

    //send it as an argument to createTaskEl
    createTaskEl(taskDataObj);
  }
};

//create new task list item
var createTaskEl = function (taskDataObj) {
  //create list item
  var listItemEl = document.createElement("li");
  listItemEl.className = "task-item";

  //add task id as a custom attribut
  listItemEl.setAttribute("data-task-id", taskIdCounter);
  listItemEl.setAttribute("draggable", "true");

  //create div to hold task info and add to list item
  var taskInfoEl = document.createElement("div");
  //give it a class name
  taskInfoEl.className = "task-info";
  //add HTML content to div
  listItemEl.innerHTML =
    "<h3 class='task-name'>" +
    taskDataObj.name +
    "</h3><span class='task-type'>" +
    taskDataObj.type +
    "</span>";
  //add to list item
  listItemEl.appendChild(taskInfoEl);

  //add id value to object and add object to array of tasks for local storage
  taskDataObj.id = taskIdCounter;
  tasks.push(taskDataObj);

  //call function to create task actions
  var taskActionsEl = createTaskActions(taskIdCounter);
  listItemEl.appendChild(taskActionsEl);
  //add entire list item to list
  tasksToDoEl.appendChild(listItemEl);

  //increase task counter for next unique id
  taskIdCounter++;

  saveTasks();
};
//create actions for task
var createTaskActions = function (taskId) {
  //create div elemeent to hold buttons
  var actionContainerEl = document.createElement("div");
  actionContainerEl.className = "task-actions";

  //create edit button
  var editButtonEl = document.createElement("button");
  editButtonEl.textContent = "Edit";
  editButtonEl.className = "btn edit-btn";
  editButtonEl.setAttribute("data-task-id", taskId);

  //append button as child to container
  actionContainerEl.appendChild(editButtonEl);

  //create delete button
  var deleteButtonEl = document.createElement("button");
  deleteButtonEl.textContent = "Delete";
  deleteButtonEl.className = "btn delete-btn";
  deleteButtonEl.setAttribute("data-task-id", taskId);

  //append button as child to container
  actionContainerEl.appendChild(deleteButtonEl);

  //add empty select to the div container
  var statusSelectEl = document.createElement("select");
  statusSelectEl.className = "select-status";
  statusSelectEl.setAttribute("name", "status-change");
  statusSelectEl.setAttribute("data-task-id", taskId);

  //append select feature to div section with buttons
  actionContainerEl.appendChild(statusSelectEl);

  //add options for select drop down menu on task
  var statusChoices = ["To Do", "In Progress", "Completed"];

  for (var i = 0; i < statusChoices.length; i++) {
    //create option element
    var statusOptionEl = document.createElement("option");
    statusOptionEl.textContent = statusChoices[i];
    statusOptionEl.setAttribute("value", statusChoices[i]);

    //append to select drop down menu
    statusSelectEl.appendChild(statusOptionEl);
  }

  return actionContainerEl;
};

var taskButtonHandler = function (event) {
  //get target element from event
  var targetEl = event.target;

  //edit button was clicked
  if (targetEl.matches(".edit-btn")) {
    var taskId = targetEl.getAttribute("data-task-id");
    editTask(taskId);
  }

  //delete button was clicked
  else if (targetEl.matches(".delete-btn")) {
    //get the elements taskId
    var taskId = event.target.getAttribute("data-task-id");
    deleteTask(taskId);
  }
};
//using the select drop down to change task status
var taskStatusChangeHandler = function (event) {
  //get the task item's id
  var taskId = event.target.getAttribute("data-task-id");

  //get the currently selected option's value and convert to lowercase
  var statusValue = event.target.value.toLowerCase();

  //find the parent task item element based on the id
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );

  //if statements for what the option value that the user selected is
  if (statusValue === "to do") {
    tasksToDoEl.appendChild(taskSelected);
  } else if (statusValue === "in progress") {
    tasksInProgressEl.appendChild(taskSelected);
  } else if (statusValue === "completed") {
    tasksCompletedEl.appendChild(taskSelected);
  }

  //update task's in task array
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(taskId)) {
      tasks[i].status = statusValue;
    }
  }

  saveTasks();
};

//get elements to edit code, put them in form, etc.
var editTask = function (taskId) {
  //get task list item element
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );

  //get content from task name and type
  var taskName = taskSelected.querySelector("h3.task-name").textContent;
  var taskType = taskSelected.querySelector("span.task-type").textContent;

  //put the task information back into the form
  document.querySelector("input[name='task-name']").value = taskName;
  document.querySelector("select[name='task-type']").value = taskType;

  //make button say 'Save Task' when in edit mode
  document.querySelector("#save-task").textContent = "Save Task";

  formEl.setAttribute("data-task-id", taskId);
};
//resaving an edited task
var completeEditTask = function (taskName, taskType, taskId) {
  //find the matching task list item
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );

  //set new values
  taskSelected.querySelector("h3.task-name").textContent = taskName;
  taskSelected.querySelector("span.task-type").textContent = taskType;

  //loop through tasks array and task object with new content
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(taskId)) {
      tasks[i].name = taskName;
      tasks[i].type = taskType;
    }
  }

  alert("Task Updated!");

  //Remove data attribute from form and change button back to add task instead of save task
  formEl.removeAttribute("data-task-id");
  document.querySelector("#save-task").textContent = "Add Task";

  saveTasks();
};

var deleteTask = function (taskId) {
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );
  taskSelected.remove();

  //create new array to hold updated list of tasks
  var updatedTaskArr = [];

  //loop through current tasks
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== parseInt(taskId)) {
      updatedTaskArr.push(tasks[i]);
    }
  }

  // reassign tasks array to be the same as updatedTaskArr
  tasks = updatedTaskArr;

  saveTasks();
};

var dragTaskHandler = function (event) {
  //retrieve task ID of dragged task
  var taskId = event.target.getAttribute("data-task-id");

  //set up data transfer property object
  event.dataTransfer.setData("text/plain", taskId);
  var getId = event.dataTransfer.getData("text/plain");
};

var dropZoneDragHandler = function (event) {
  var taskListEl = event.target.closest(".task-list");
  if (taskListEl) {
    event.preventDefault();
    //change what task will look like when dragged
    taskListEl.setAttribute(
      "style",
      "background: rgba(104,119,93,0.6); border-style: dashed;"
    );
  }
};

var dropTaskHandler = function (event) {
  var id = event.dataTransfer.getData("text/plain");
  var draggableElement = document.querySelector("[data-task-id='" + id + "']");
  var dropZoneEl = event.target.closest(".task-list");
  var statusType = dropZoneEl.id;

  //set status of task based on drop zone id
  var statusSelectEl = draggableElement.querySelector(
    "select[name='status-change']"
  );

  if (statusType === "tasks-to-do") {
    statusSelectEl.selectedIndex = 0;
  } else if (statusType === "tasks-in-progress") {
    statusSelectEl.selectedIndex = 1;
  } else if (statusType === "tasks-completed") {
    statusSelectEl.selectedIndex = 2;
  }

  dropZoneEl.removeAttribute("style");

  dropZoneEl.appendChild(draggableElement);

  //loop through tasks array to find and update the updated task's status
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(id)) {
      tasks[i].status = statusSelectEl.value.toLowerCase();
    }
  }

  saveTasks();
};

var dragLeaveHandler = function (event) {
  var taskListEl = event.target.closest(".task-list");
  if (taskListEl) {
    taskListEl.removeAttribute("style");
  }
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var loadTasks = function () {
  //retrieve from local storage
  //create new array to hold updated list of tasks
  var tasksLoaded = localStorage.getItem("tasks");
  //loop through current tasks, check if empty
  if (!tasksLoaded) {
    return false;
  }

  tasksLoaded = JSON.parse(tasksLoaded);

  for (var i = 0; i < tasksLoaded.length; i++) {
    tasksLoaded[i].id = taskIdCounter;

    var listItemEl = document.createElement("li");
    listItemEl.className = "task-item";
    listItemEl.setAttribute("data-task-id", tasksLoaded[i].id);
    listItemEl.setAttribute("draggable", "true");

    var taskInfoEl = document.createElement("div");
    taskInfoEl.className = "task-info";
    taskInfoEl.innerHTML =
      "<h3 class='task-name'>" +
      tasksLoaded[i].name +
      "</h3><span class='task-type'>" +
      tasksLoaded[i].type +
      "</span>";

    listItemEl.appendChild(taskInfoEl);
    var taskActionsEl = createTaskActions(tasksLoaded[i].id);

    listItemEl.appendChild(taskActionsEl);

    if (tasksLoaded[i].status === "to do") {
      listItemEl.querySelector(
        "select[name='status-change']"
      ).selectedIndex = 0;
      tasksToDoEl.appendChild(listItemEl);
    } else if (tasksLoaded[i].status === "in progress") {
      listItemEl.querySelector(
        "select[name='status-change']"
      ).selectedIndex = 1;
      tasksInProgressEl.appendChild(listItemEl);
    } else if (tasksLoaded[i].status === "completed") {
      listItemEl.querySelector(
        "select[name='status-change']"
      ).selectedIndex = 2;
      tasksCompletedEl.appendChild(listItemEl);
    }

    tasks.push(tasksLoaded[i]);
    taskIdCounter++;
  }
};

loadTasks();

//on button click or enter - create a task
formEl.addEventListener("submit", taskFormHandler);
//on button click - run button handler
pageContentEl.addEventListener("click", taskButtonHandler);
//event listener for select box on task
pageContentEl.addEventListener("change", taskStatusChangeHandler);
//Drag listener
pageContentEl.addEventListener("dragstart", dragTaskHandler);
//dragover Listener - find only task lists for drop
pageContentEl.addEventListener("dragover", dropZoneDragHandler);
//drop event listener
pageContentEl.addEventListener("drop", dropTaskHandler);
//drag leave, change style
pageContentEl.addEventListener("dragleave", dragLeaveHandler);
