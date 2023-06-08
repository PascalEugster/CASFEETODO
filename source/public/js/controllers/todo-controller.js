import { todoService } from '../services/todo-service.js';
import formatDate from '../helpers/helpers.js';

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
    this.saveButton = document.getElementById('btnSave');
    this.saveAndBackButton = document.getElementById('btnSaveAndBack');

    this.todoTemplateContainer = document.getElementById('todo-container');
    this.editTodoContainer = document.getElementById('edit-todo-container');
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
      const sortButton = button;
      const buttonSortBy = button.getAttribute('data-sort');
      if (buttonSortBy !== sortBy) {
        sortButton.innerHTML = this.translateButton(button.id);
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
      this.showTodoForm();
    });
  }

  loadTodoTemplate() {
    fetch('views/todo-list.hbs')
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

  showTodoForm(todo) {
    const currentTodo = todo;
    this.todoTemplateContainer.style.display = 'none';
    this.editTodoContainer.style.display = 'block';

    let templatePath = '';
    if (todo != null) {
      templatePath = 'views/edit-todo.hbs';
    } else {
      templatePath = 'views/create-todo.hbs';
    }

    fetch(templatePath)
      .then((response) => response.text())
      .then((html) => {
        this.editTodoContainer.innerHTML = html;
        const todoForm = document.getElementById('todo-form');
        const backButton = document.getElementById('btnBack');

        todoForm.addEventListener('submit', (event) => {
          event.preventDefault();
          const buttonAction = event.submitter.dataset.action;

          if (buttonAction === 'save') {
            this.submitTodoForm(currentTodo);
          } else if (buttonAction === 'saveAndBack') {
            const isValid = this.submitTodoForm(currentTodo);
            if (isValid) {
              this.showTodoList();
            }
          }
        });

        backButton.addEventListener('click', () => {
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

  submitTodoForm(todo) {
    const todoForm = document.getElementById('todo-form');
    const isFormValid = todoForm.checkValidity();
    if (!isFormValid) {
      return false;
    }
    if (todo) {
      this.updateTodo(todo.id, todoForm);
    } else {
      this.createTodo(todoForm);
    }
    return true;
  }

  showTodoList() {
    this.renderTodoView();
    this.editTodoContainer.innerHTML = '';
    this.editTodoContainer.style.display = 'none';

    this.todoTemplateContainer.style.display = 'block';
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
    this.showTodoForm(createdTodo);
  }

  editTodo(event) {
    const { todoId } = event.target.dataset;
    const todo = todoService.getTodoById(todoId);

    if (todo) {
      this.showTodoForm(todo);
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
    if (this.filterStatus) {
      filteredTodos = filteredTodos.filter(
        (todo) => todo.status === false || todo.status === 0
      );
    }

    const formattedTodos = filteredTodos.map((todo) => ({
      ...todo,
      dueDate: formatDate(todo.dueDate),
      importance: importanceMap[todo.importance],
    }));

    this.todoTemplateContainer.innerHTML = this.todoTemplateCompiled(
      { todos: formattedTodos },
      { allowProtoPropertiesByDefault: true }
    );
  }

  initialize() {
    todoService.loadData();
    this.initEventHandlers();
  }
}

new TodoController().initialize();
