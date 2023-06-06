import { todoService } from '../services/todo-service.js';

const buttonTranslations = {
  btnSortName: 'Name',
  btnSortDueDate: 'Fälligkeitsdatum',
  btnSortCreationDate: 'Erstellungsdatum',
  btnSortImportance: 'Wichtigkeit',
  btnSortStatus: 'Status',
};

const importanceMap = {
  1: 'Gering',
  2: 'Mittel',
  3: 'Hoch',
};

export default class TodoController {
  constructor() {
    this.todoTemplateCompiled = Handlebars.compile(
      document.getElementById('todo-list').innerHTML
    );
    this.filterStatus = false;
    this.currentSortBy = 'name';
    this.darkMode = false;

    this.todoTemplateContainer = document.getElementById('todo-container');
    this.createTodoContainer = document.getElementById('create-todo-container');
    this.todoContainer = document.getElementById('todo-container');
    this.loadTodoTemplate();
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
        sortedTodos = todoService.todos
          .slice()
          .sort((a, b) => a.importance - b.importance);
        break;

      case 'status':
        sortedTodos = todoService.todos
          .slice()
          .sort((a, b) => a.status - b.status);

        break;

      default:
        sortedTodos = todoService.todos;
        break;
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
      this.sortedTodos = sortedTodos.reverse();
      selectedButton.innerHTML = `${buttonName} ▼`;
    }
    this.currentSortBy = sortBy;
    return sortedTodos;
  }

  translateButton(buttonId) {
    return buttonTranslations[buttonId];
  }

  initEventHandlers() {
    const btnDarkMode = document.getElementById('btnDarkMode');
    btnDarkMode.addEventListener('click', this.toggleDarkMode.bind(this));

    const btnFilterStatus = document.getElementById('btnFilterStatus');
    btnFilterStatus.addEventListener('click', this.setFilterStatus.bind(this));

    const sortButtons = document.querySelectorAll('.sortButtons button');
    sortButtons.forEach((button) => {
      const sortMethod = button.getAttribute('data-sort');
      button.addEventListener('click', () => {
        this.currentSortBy = sortMethod;

        const sortStatus = todoService.sortStatus[sortMethod];

        if (sortStatus === 'ascending') {
          todoService.sortStatus[sortMethod] = 'descending';
        } else {
          todoService.sortStatus[sortMethod] = 'ascending';
        }

        this.renderTodoView();
      });
    });

    const createTodoButton = document.getElementById('btnCreateTodo');
    createTodoButton.addEventListener('click', () => {
      this.showCreateTodoForm();
    });
  }

  loadTodoTemplate() {
    fetch('views/todo-list.html')
      .then((response) => response.text())
      .then((html) => {
        const template = Handlebars.compile(html);
        this.todoTemplateCompiled = template;
        this.renderTodoView();
        this.todoContainer.addEventListener('click', (event) => {
          if (event.target.classList.contains('edit-todo-button')) {
            this.editTodo(event);
          }

          if (event.target.classList.contains('todo-status-button')) {
            this.toggleTodoStatus(event);
          }
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Template not found: ', error);
      });
  }

  showCreateTodoForm(todo) {
    this.todoTemplateContainer.style.display = 'none';
    this.createTodoContainer.style.display = 'block';

    fetch('views/create-todo.html')
      .then((response) => response.text())
      .then((html) => {
        this.createTodoContainer.innerHTML = html;

        const backButton = document.getElementById('btnBack');
        backButton.addEventListener('click', () => {
          this.showTodoList();
        });

        const saveButton = document.getElementById('btnSave');
        saveButton.addEventListener('click', (event) => {
          event.preventDefault();
          if (todo) {
            this.updateTodo(todo.id);
          } else {
            this.createTodo();
          }
        });

        const saveAndBackButton = document.getElementById('btnSaveAndBack');
        saveAndBackButton.addEventListener('click', (event) => {
          event.preventDefault();
          if (todo) {
            this.updateTodo(todo.id);
          } else {
            this.createTodo();
          }
          this.showTodoList();
        });
        const nameInput = document.getElementById('todo-name');
        const descriptionInput = document.getElementById('todo-description');
        const dueDateInput = document.getElementById('todo-due-date');
        const importanceInput = document.getElementById('todo-importance');

        // Prefill values
        dueDateInput.value = new Date().toISOString().slice(0, 10);

        if (todo) {
          nameInput.value = todo.name;
          descriptionInput.value = todo.description;
          dueDateInput.value = todo.dueDate.toISOString().slice(0, 10);
          importanceInput.value = todo.importance;
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Template not found: ', error);
      });
  }

  showTodoList() {
    this.renderTodoView();
    this.createTodoContainer.innerHTML = '';
    this.createTodoContainer.style.display = 'none';

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
        // eslint-disable-next-line no-console
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

    const createdTodo = todoService.createTodo(
      name,
      description,
      dueDate,
      importance
    );
    this.showCreateTodoForm(createdTodo);
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

      this.renderTodoView();
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
    todo.dueDate = new Date(dueDateInput.value);
    todo.importance = parseInt(importanceInput.value, 10);

    todoService.updateTodo(todoId, todo);

    this.renderTodoView();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.setDarkMode(this.darkMode);
  }

  setDarkMode(isDarkMode) {
    // TODO: Store Todo in Cookie
    if (isDarkMode) {
      const htmlElement = document.querySelector('html');
      htmlElement.classList.add('dark-mode');
    } else {
      const htmlElement = document.querySelector('html');
      htmlElement.classList.remove('dark-mode');
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
    this.renderTodoView();
  }

  renderTodoView() {
    let filteredTodos = this.sortTodos(this.currentSortBy);
    this.setDarkMode(this.darkMode);
    if (this.filterStatus) {
      filteredTodos = filteredTodos.filter(
        (todo) => todo.status === false || todo.status === 0
      );
    }

    const formattedTodos = filteredTodos.map((todo) => ({
      ...todo,
      dueDate: this.formatDate(todo.dueDate),
      importance: importanceMap[todo.importance],
    }));

    this.todoTemplateContainer.innerHTML = this.todoTemplateCompiled(
      { todos: formattedTodos },
      { allowProtoPropertiesByDefault: true }
    );
    console.log('renderTodoView');
  }

  initialize() {
    todoService.loadData();
    this.initEventHandlers();
  }
}

new TodoController().initialize();
