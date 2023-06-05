import { todoService } from '../services/todo-service.js';

const buttonTranslations = {
  btnSortName: 'Name',
  btnSortDueDate: 'Fälligkeitsdatum',
  btnSortCreationDate: 'Erstellungsdatum',
  btnSortImportance: 'Wichtigkeit',
  btnSortStatus: 'Status',
  // Weitere Übersetzungen hier hinzufügen
};

export default class TodoController {
  constructor() {
    this.todoTemplateCompiled = Handlebars.compile(
      document.getElementById('todo-list').innerHTML
    );
    this.filterStatus = false;
    this.darkMode = false;

    this.todoTemplateContainer = document.getElementById('todo-container');
    this.createTodoContainer = document.getElementById('create-todo-container');
    this.todoContainer = document.getElementById('todo-container');
    this.loadTodoTemplate();
    this.initEventHandlers();
  }

  showTodos() {
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
        sortedTodos = todoService.todos.slice().sort((a, b) => {
          return a.status - b.status;
        });

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

    const sortButtons = document.querySelectorAll('.sortButtons button');
    sortButtons.forEach((button) => {
      const buttonSortBy = button.getAttribute('data-sort');
      if (buttonSortBy !== sortBy) {
        button.innerHTML = this.translateButton(button.id);
      }
    });

    const selectedButton = document.querySelector(
      `.sortButtons button[data-sort="${sortBy}"]`
    );
    const buttonName = this.translateButton(selectedButton.id);
    if (sortStatus === 'ascending') {
      selectedButton.innerHTML = `${buttonName} ▲`;
    } else {
      selectedButton.innerHTML = `${buttonName} ▼`;
    }

    this.todoTemplateContainer.innerHTML = this.todoTemplateCompiled(
      { todos: sortedTodos },
      { allowProtoPropertiesByDefault: true }
    );
  }

  translateButton(buttonId) {
    return buttonTranslations[buttonId];
  }

  initEventHandlers() {
    const btnDarkMode = document.getElementById('btnDarkMode');
    btnDarkMode.addEventListener('click', this.toggleDarkMode);

    const btnFilterStatus = document.getElementById('btnFilterStatus');
    btnFilterStatus.addEventListener('click', this.setFilterStatus.bind(this));

    const createTodoButton = document.getElementById('btnCreateTodo');
    createTodoButton.addEventListener('click', () => {
      this.showCreateTodoForm();
    });

    this.todoContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('edit-todo-button')) {
        this.editTodo(event);
      }

      if (event.target.classList.contains('todo-status-button')) {
        this.toggleTodoStatus(event);
      }
    });

    const sortButtons = document.querySelectorAll('.sortButtons button');
    sortButtons.forEach((button) => {
      const sortBy = button.getAttribute('data-sort');
      button.addEventListener('click', () => {
        this.sortTodos(sortBy);
      });
    });
  }

  loadTodoTemplate() {
    fetch('views/todo-list.html')
      .then((response) => response.text())
      .then((html) => {
        const template = Handlebars.compile(html);
        this.todoTemplateCompiled = template;
        this.renderTodoView(todoService.todos);
        this.initEventHandlers();
      });
  }

  showCreateTodoForm(todo) {
    this.todoTemplateContainer.style.display = 'none';

    fetch('views/create-todo.html')
      .then((response) => response.text())
      .then((html) => {
        this.createTodoContainer.innerHTML = html;

        const backButton = document.getElementById('btnBack');
        backButton.addEventListener('click', () => {
          this.showTodoList();
        });

        const saveButton = document.getElementById('btnSave');
        saveButton.addEventListener('click', () => {
          if (todo) {
            this.updateTodo(todo.id);
          } else {
            this.createTodo();
          }
        });

        if (todo) {
          const nameInput = document.getElementById('todo-name');
          const descriptionInput = document.getElementById('todo-description');
          const dueDateInput = document.getElementById('todo-due-date');
          const importanceInput = document.getElementById('todo-importance');

          nameInput.value = todo.name;
          descriptionInput.value = todo.description;
          dueDateInput.value = todo.dueDate.toISOString().slice(0, 10);
          importanceInput.value = todo.importance;
        }
      });
  }

  showTodoList() {
    this.createTodoContainer.innerHTML = '';

    this.todoTemplateContainer.style.display = 'block';
  }

  loadCreateTodoForm() {
    fetch('create-todo.html')
      .then((response) => response.text())
      .then((html) => {
        this.createTodoContainer.innerHTML = html;

        const createButton = document.getElementById('btnCreateTodo');
        createButton.addEventListener('click', () => {
          this.createTodo();
        });
      })
      .catch((error) => {
        console.error('Template not found: ', error);
      });
  }

  createTodo() {
    const nameInput = document.getElementById('todo-name');
    const descriptionInput = document.getElementById('todo-description');
    const dueDateInput = document.getElementById('todo-due-date');
    const importanceInput = document.getElementById('todo-importance');

    const name = nameInput.value;
    const description = descriptionInput.value;
    const dueDate = dueDateInput.value;
    const importance = parseInt(importanceInput.value, 10);

    todoService.createTodo(name, description, dueDate, importance);

    this.renderTodoView(todoService.todos);
  }

  editTodo(event) {
    const { todoId } = event.target.dataset;
    const todo = todoService.getTodoById(todoId);

    if (todo) {
      this.showCreateTodoForm(todo);
    }
  }

  toggleTodoStatus(event) {
    const { todoId } = event.target.dataset;
    const todo = todoService.getTodoById(todoId);

    if (todo) {
      const updatedStatus = !todo.status;

      todoService.updateTodoStatus(todoId, updatedStatus);

      this.renderTodoView(todoService.todos);
    }
  }

  updateTodo(todoId) {
    const nameInput = document.getElementById('todo-name');
    const descriptionInput = document.getElementById('todo-description');
    const dueDateInput = document.getElementById('todo-due-date');
    const importanceInput = document.getElementById('todo-importance');

    const todo = todoService.getTodoById(todoId);

    todo.name = nameInput.value;
    todo.description = descriptionInput.value;
    todo.dueDate = dueDateInput.value;
    todo.importance = parseInt(importanceInput.value, 10);

    todoService.updateTodo(todoId, todo);

    this.renderTodoView(todoService.todos);
  }

  toggleDarkMode() {
    const htmlElement = document.querySelector('html');
    if (this.darkMode) {
      this.darkMode = false;
      htmlElement.classList.remove('dark-mode');
    } else {
      this.darkMode = true;
      htmlElement.classList.add('dark-mode');
    }
  }

  formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  setFilterStatus() {
    const filterStatusButton = document.getElementById('btnFilterStatus');

    if (!this.filterStatus) {
      filterStatusButton.textContent = 'Erledigte anzeigen';
    } else {
      filterStatusButton.textContent = 'Erledigte ausblenden';
    }
    this.filterStatus = !this.filterStatus;
    this.renderTodoView(todoService.todos);
  }

  renderTodoView(todos) {
    let filteredTodos = todos;
    if (this.filterStatus) {
      filteredTodos = todos.filter(
        (todo) => todo.status === false || todo.status === 0
      );
    }

    const formattedTodos = filteredTodos.map((todo) => ({
      ...todo,
      dueDate: this.formatDate(todo.dueDate),
    }));

    this.todoTemplateContainer.innerHTML = this.todoTemplateCompiled(
      { todos: formattedTodos },
      { allowProtoPropertiesByDefault: true }
    );
    console.log('renderTodoView');
  }

  initialize() {
    todoService.loadData();
    this.renderTodoView(todoService.todos);
    this.initEventHandlers();
  }
}

new TodoController().initialize();
