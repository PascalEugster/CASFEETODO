import { todoService } from '../services/todo-service.js';

export default class TodoController {
  constructor() {
    this.todoTemplateCompiled = Handlebars.compile(document.getElementById('todo-list-template').innerHTML);

    this.todoTemplateContainer = document.getElementById('todo-container');
  }

  showtodos() {
    this.todoTemplateContainer.innerHTML = this.todoTemplateCompiled(
      { todos: todoService.todos },
      { allowProtoPropertiesByDefault: true }
    );
  }

  // initEventHandlers() {

  // }

  renderTodoView() {
    this.showtodos();
  }

  initialize() {
    // this.initEventHandlers();
    todoService.loadData();
    this.renderTodoView();
  }
}

// create instance of TodoController and initialize it
new TodoController().initialize();
