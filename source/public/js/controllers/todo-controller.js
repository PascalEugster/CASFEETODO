import { todoService } from '../services/todo-service.js';

export default class TodoController {
  constructor() {
    this.todoTemplateCompiled = Handlebars.compile(
      document.getElementById('todo-list-template').innerHTML
    );

    this.todoTemplateContainer = document.getElementById('todo-container');
  }

  showtodos() {
    this.todoTemplateContainer.innerHTML = this.todoTemplateCompiled(
      { todos: todoService.todos },
      { allowProtoPropertiesByDefault: true }
    );
  }

  sortTodos(sortBy) {
    const sortStatus = todoService.sortStatus[sortBy];
  
    let sortedTodos = [];
  
    switch (sortBy) {
      case 'name':
        sortedTodos = todoService.todos.slice().sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
        break;
  
      case 'dueDate':
        sortedTodos = todoService.todos.slice().sort((a, b) => {
          const dateA = new Date(a.dueDate);
          const dateB = new Date(b.dueDate);
          return dateA - dateB;
        });
        break;
  
      case 'creationDate':
        sortedTodos = todoService.todos.slice().sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateA - dateB;
        });
        break;
  
      case 'importance':
        sortedTodos = todoService.todos.slice().sort((a, b) => {
          return a.importance - b.importance;
        });
        break;
  
      case 'status':
        sortedTodos = todoService.todos.filter(todo => todo.status === 'completed');
        break;
  
      default:
        sortedTodos = todoService.todos;
        break;
    }
  
    if (sortStatus === 'ascending') {
      sortedTodos.reverse();
      todoService.sortStatus[sortBy] = 'descending';
    } else {
      todoService.sortStatus[sortBy] = 'ascending';
    }
  
    // Entferne den Pfeil von allen Sortierbuttons
    const sortButtons = document.querySelectorAll('.filters button');
    sortButtons.forEach(button => {
      const buttonSortBy = button.getAttribute('data-sort');
      if (buttonSortBy !== sortBy) {
        button.innerHTML = buttonSortBy;
      }
    });
  
    // Setze den Pfeil für den ausgewählten Sortierbutton
    const selectedButton = document.querySelector(`.filters button[data-sort="${sortBy}"]`);
    if (sortStatus === 'ascending') {
      selectedButton.innerHTML = `${sortBy} ▲`;
    } else {
      selectedButton.innerHTML = `${sortBy} ▼`;
    }
  
    this.todoTemplateContainer.innerHTML = this.todoTemplateCompiled(
      { todos: sortedTodos },
      { allowProtoPropertiesByDefault: true }
    );
  }
 
   updateSortButtonArrow(sortBy, arrow) {
     const sortButton = document.querySelector(`.filters button[data-sort="${sortBy}"]`);
     sortButton.innerHTML = `${sortBy} ${arrow}`;
   }
 
   initEventHandlers() {
     const sortButtons = document.querySelectorAll('.filters button');
 
     sortButtons.forEach(button => {
       const sortBy = button.getAttribute('data-sort');
       button.addEventListener('click', () => {
         this.sortTodos(sortBy);
       });
     });
   }
  

  renderTodoView() {
    this.showtodos();
  }

  initialize() {
    this.initEventHandlers();
    todoService.loadData();
    this.renderTodoView();
  }
}

// create instance of TodoController and initialize it
new TodoController().initialize();
