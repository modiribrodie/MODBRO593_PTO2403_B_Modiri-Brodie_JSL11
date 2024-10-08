// import helper functions from utils
import { taskFunctions } from './utils/taskFunctions.js';

try {
  console.log(taskFunctions); // this logs the imported functions
} catch (error) {
  console.error('Error using taskFunctions:', error);
}

// import initialData
import initialData from 'initialData.js'
console.log(initialData);

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
 const initialData = [];
 try{
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
      console.log('Initial data has been det in localStorage.');
  } else {
    console.log('Data already exists in localStorage');
  }
 } catch (error){
  console.error('Error accessing localStorage:',error);
 }
}

// TASK: Get elements from the DOM
const elements = {
body : document.getElementById('body')

};

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    //Assigns the click event handler
    boardElement.onclick = function() { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    };
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); // '===' is used for comparison

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");

    // Checks if status is valid
    if (status) {
      // Reset column content while preserving the column title
      column.innerHTML = `<div class="column-head-div">
                            <span class="dot" id="${status}-dot"></span>
                            <h4 class="columnHeader">${status.toUpperCase()}</h4>
                          </div>`;

      const tasksContainer = document.createElement("div");
      column.appendChild(tasksContainer);

      // Filter tasks by status and display them
      filteredTasks.filter(task => task.status === status).forEach(task => { 
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute('data-task-id', task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener('click', () => { 
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
    } else {
      console.warn("Column is missing an attribute.");
    }
  });
}


function refreshTasksUI() {
  if (typeof activeBoard !== 'undefined' && activeBoard !== null) {
  filterAndDisplayTasksByBoard(activeBoard);
} else {
  console.error("Error: activeBoard is not defined or is null.");
}
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active'); 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  //Checks if  task and task.status are defined 
 if (!task || !task.status) {
  console.error('Invalid task or status is undefined');
  return;
 }

  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  if (column) {
  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }
  } else {
    console.error('Column is undefined or null. Cannot find tasks container.');
  }
 
 //Ensures taskContainer is a valid DOM element
 const taskContainer = document.getElementById('tasks-container');

  if (tasksContainer) {
  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
} else {
console.error('Tasks container not found in the DOM.');
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener ('click', () => toggleModal(false, elements.editTaskModal));
}

  // Cancel adding new task event listener
  document.addEventListener('DOMContentLoaded', () => {
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  if (cancelAddTaskBtn) {
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });
} else {
console.error('Cancel Add Task Button not found in the DOM.')
}
});

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.click = () => toggleSidebar(false);
  elements.showSideBarBtn.click = () => toggleSidebar(true);

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal

function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
 const sidebar = document.getElementById('side-bar-div');
 if(show) {
  sidebar.style.display = 'block'; //shows the sidebar
 } else {
  sidebar.style.display = 'none'; //hides the sidebar 
 }
}

function toggleTheme() {
 const body = document.body;

if (body.classList.contains ('dark-theme')) {
  body.classList.remove('dark-theme'); 
        body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
        body.classList.add('dark-theme');
    }
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  const titleInput = document.getElementById('edit-task-title-input');
  const descriptionInput = document.getElementById('taskDescription');
  const dueDateInput = document.getElementById('taskDueDate');

  // Checks if task is defined
  if (task) {
    titleInput.value = task.title || '';
    descriptionInput.value = task.description || '';
    dueDateInput.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
  } else {
    console.error('No task provided to edit.');
  }
}

  // Get button elements from the task modal
  const taskModal = document.getElementById('taskModal'); // Ensure the modal exists
  if (taskModal) {
      const buttons = taskModal.querySelectorAll('button'); // Select all button elements
      buttons.forEach(button => {
          button.addEventListener('click', () => {
              console.log(`Button ${button.textContent} clicked!`);
          });
      });
  } else {
      console.error('Task modal not found!');
  }

  // Call saveTaskChanges upon click of Save Changes button
  document.getElementById('save-task-changes-btn').addEventListener('click', button); 
  function saveTaskChanges() {
    // Logic to save task changes goes here
    console.log("Task changes have been saved.");
}
  // Delete task using a helper function and close the task modal
  function deleteTask(taskId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = true; // Simulate success
        if (success) {
            console.log(`Task with ID ${taskId} deleted.`);
            resolve();
        } else {
            reject('Error deleting task.');
        }
    }, 1000);
});
}
// This Function to close the task modal
function closeTaskModal() {
  console.log('Task modal closed.');
}   
//function to handle task deletion and modal closure
async function handleDeleteTask(taskId) {
    try {
        await deleteTask(taskId);
        closeTaskModal();
    } catch (error) {
        console.error(error);
    }
}


function toggleModal(isVisible, modalElement) {
  if (isVisible) {
      modalElement.style.display = 'block'; // Show the modal
  } else {
      modalElement.style.display = 'none'; // Hide the modal
  }
}
  toggleModal(true, elements.editTaskModal); // Show the edit task modal


function saveTaskChanges(taskId) {
  // Get new user inputs
  const taskInput = document.getElementById(`task-input-${taskId}`).value;
  const taskDescription = document.getElementById(`task-description-${taskId}`).value;

  // Validate inputs
  if (!taskInput || !taskDescription) {
    console.error("Task input and description cannot be empty.");
    return;
  }
  const updatedTask = {
    id: taskId,
    input: taskInput,
    description: taskDescription
  };

  console.log("Task updated successfully:", updatedTask);
}

  // Create an object with the updated task details
const updatedTask = {
    id: 1,
    title: "Complete the project",
    description: "Finish the project by the end of the week",
    status: "In Progress",
  };

  console.log(updatedTask);

  // Update task using a helper function
 

  // Close the modal and refresh the UI to reflect the changes
function closeModal() {
    // Close the modal
    const modal = document.getElementById('myModal');
    if (modal) {
        modal.style.display = 'none'; // Hide the modal
    }

    // Refresh the UI to reflect the changes
    refreshUI();
}

function refreshUI() {
    // Logic to refresh the UI
    console.log('UI has been refreshed to reflect changes.');
    // Additional code to update UI elements goes here
}

// Example of how to call closeModal when a button is clicked
document.getElementById('closeButton').addEventListener('click', closeModal);
  refreshTasksUI();


/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}