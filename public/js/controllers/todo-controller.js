import { todoService } from '../services/todo-service.js';
import { authService } from '../services/auth-service.js';
import formatDate from '../helpers/helpers.js';

const buttonTranslations = {
  sortNameButton: 'Name',
  sortDueDateButton: 'Fälligkeitsdatum',
  sortCreationDateButton: 'Erstellungsdatum',
  sortImportanceButton: 'Wichtigkeit',
  sortStatusButton: 'Status',
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
    this.sortMethod = 'name';
    this.sortStatus = 'asc';
    this.saveButton = document.getElementById('saveButton');
    this.saveAndBackButton = document.getElementById('saveAndBackButton');
    this.filterStatusButton = document.getElementById('filterStatusButton');
    this.loginButton = document.getElementById('loginButton');
    this.logoutButton = document.getElementById('logoutButton');

    this.todoTemplateContainer = document.getElementById('todo-container');
    this.editTodoContainer = document.getElementById('edit-todo-container');
    this.todoContainer = document.getElementById('todo-container');
    this.loadTodoTemplate();
  }

  translateButton(buttonId) {
    return buttonTranslations[buttonId];
  }

  initEventHandlers() {
    this.filterStatusButton.addEventListener(
      'click',
      this.setFilterStatus.bind(this)
    );

    // Auth Service
    this.loginButton.addEventListener('click', () => {
      authService
        .login('admin@admin.ch', '123456')
        .then(() => {
          this.updateStatus();
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Fehler beim Einloggen:', error);
        });
    });

    this.logoutButton.addEventListener('click', () => {
      authService.logout();
      this.updateStatus();
    });

    const sortButtons = document.querySelectorAll('.sortButtons button');
    sortButtons.forEach((button) => {
      const sortMethod = button.getAttribute('data-sort');
      button.addEventListener('click', () => {
        this.currentSortBy = sortMethod;
        this.sortMethod = sortMethod;
        this.sortStatus = todoService.setSortStatus(sortMethod);
        this.refreshSortButtons();
        this.renderTodoView();
      });
    });

    this.todoContainer.addEventListener('click', (event) => {
      const { action } = event.target.dataset;
      if (action === 'editTodo') {
        this.editTodo(event);
      }

      if (action === 'toggleStatus') {
        this.toggleTodoStatus(event);
      }
    });

    const createTodoButton = document.getElementById('createTodoButton');
    createTodoButton.addEventListener('click', () => {
      this.showTodoForm();
    });
  }

  refreshSortButtons() {
    const sortButtons = document.querySelectorAll('.sortButtons button');
    sortButtons.forEach((button) => {
      const sortButton = button;
      const buttonSortBy = button.getAttribute('data-sort');
      if (buttonSortBy !== this.sortMethod) {
        sortButton.innerHTML = this.translateButton(button.id);
      }
    });

    const selectedButton = document.querySelector(
      `.sortButtons button[data-sort="${this.sortMethod}"]`
    );
    const buttonName = this.translateButton(selectedButton.id);
    if (this.sortStatus === 'asc') {
      selectedButton.innerHTML = `${buttonName} ▼`;
    } else {
      selectedButton.innerHTML = `${buttonName} ▲`;
    }
  }

  updateStatus() {
    Array.from(document.querySelectorAll('.js-non-user')).forEach((x) =>
      x.classList.toggle('hidden', authService.isLoggedIn())
    );
    Array.from(document.querySelectorAll('.js-user')).forEach((x) =>
      x.classList.toggle('hidden', !authService.isLoggedIn())
    );

    if (authService.isLoggedIn()) {
      this.renderTodoView();
    }
  }

  loadTodoTemplate() {
    fetch('views/todo-list.hbs')
      .then((response) => response.text())
      .then((html) => {
        const template = Handlebars.compile(html);
        this.todoTemplateCompiled = template;
        this.renderTodoView();
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
        const backButton = document.getElementById('backButton');

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
          dueDateInput.value = new Date(todo.dueDate)
            .toISOString()
            .slice(0, 10);
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

    todoService
      .createTodo(name, description, dueDate, importance)
      .then((createdTodo) => {
        this.showTodoForm(createdTodo);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Fehler beim Erstellen des Todos:', error);
      });
  }

  editTodo(event) {
    const { todoId } = event.target.dataset;
    todoService
      .getTodo(todoId)
      .then((todo) => {
        this.showTodoForm(todo);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Fehler beim Abrufen des Todos:', error);
      });
  }

  toggleTodoStatus(event) {
    const { todoId } = event.target.dataset;
    todoService
      .getTodo(todoId)
      .then((todo) => {
        if (todo != null) {
          const updatedStatus = !todo.status;

          todoService
            .updateTodoStatus(todoId, updatedStatus)
            .then(() => {
              this.renderTodoView();
            })
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.error('Fehler beim Aktualisieren des Todos:', error);
            });
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Fehler beim Abrufen des Todos:', error);
      });
  }

  updateTodo(todoId) {
    const nameInput = document.getElementById('todo-name');
    const descriptionInput = document.getElementById('todo-description');
    const dueDateInput = document.getElementById('todo-due-date');
    const importanceInput = document.getElementById('todo-importance');

    const todo = todoService.getTodo(todoId);

    todo.name = nameInput.value;
    todo.description = descriptionInput.value;
    todo.dueDate = new Date(dueDateInput.value);
    todo.importance = parseInt(importanceInput.value, 10);

    todoService
      .updateTodo(
        todoId,
        todo.name,
        todo.description,
        todo.dueDate,
        todo.importance
      )
      .then(() => {
        this.renderTodoView();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Fehler beim Aktualisieren des Todos:', error);
      });
  }

  setFilterStatus() {
    if (!this.filterStatus) {
      this.filterStatusButton.textContent = 'Erledigte anzeigen';
    } else {
      this.filterStatusButton.textContent = 'Erledigte ausblenden';
    }
    this.filterStatus = !this.filterStatus;
    this.renderTodoView();
  }

  renderTodoView() {
    // Rufe die Todos mit Hilfe des todoService ab
    todoService
      .getTodos(this.sortMethod, this.sortStatus)
      .then((todos) => {
        let filteredTodos = todos;
        if (this.filterStatus) {
          filteredTodos = filteredTodos.filter(
            (todo) => todo.status === false || todo.status === 0
          );
        }

        const formattedTodos = filteredTodos.map((todo) => {
          const formattedDueDate = todo.dueDate
            ? formatDate(new Date(todo.dueDate))
            : '';

          return {
            id: todo.id,
            createdBy: todo.createdBy,
            name: todo.name,
            status: todo.status,
            description: todo.description,
            dueDate: formattedDueDate,
            importance: importanceMap[todo.importance],
          };
        });

        this.todoTemplateContainer.innerHTML = this.todoTemplateCompiled(
          { todos: formattedTodos },
          { allowProtoPropertiesByDefault: true }
        );
      })
      .catch((error) => {
        console.error('Fehler beim Abrufen der Todos:', error);
      });
  }

  initialize() {
    this.initEventHandlers();
  }
}

new TodoController().initialize();
