import TodoStorage from './data/todo-storage.js';
import Todo from './todo.js';

export default class TodoService {
  constructor(storage) {
    this.storage = storage || new TodoStorage();
    this.todos = [];
    this.sortStatus = {
      name: 'ascending',
      dueDate: 'ascending',
      creationDate: 'ascending',
      importance: 'ascending',
      status: 'ascending',
    };
  }

  loadData() {
    const storedTodos = this.storage
      .getAll()
      .map(
        (f) =>
          new Todo(
            f.id,
            f.name,
            f.status,
            f.description,
            f.importance,
            new Date(f.creationDate),
            new Date(f.dueDate)
          )
      );
    this.todos = storedTodos.length > 0 ? storedTodos : this.getInitialData();
  }

  getInitialData() {
    const currentDate = new Date();
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

    const initialData = [
      {
        id: `${currentDate}-0`,
        name: 'E-Mails beantworten',
        status: false,
        description:
          'Antworten auf die wichtigsten E-Mails senden und den Posteingang aufräumen.',
        importance: 2,
        creationDate: currentDate,
        dueDate: currentDate + oneDayInMilliseconds,
      },
      {
        id: `${currentDate + oneDayInMilliseconds}-1`,
        name: 'Wäsche waschen',
        status: false,
        description:
          'Schmutzige Wäsche sortieren, Waschmaschine beladen, Waschmittel hinzufügen und Programm starten.',
        importance: 3,
        creationDate: currentDate + oneDayInMilliseconds,
        dueDate: currentDate + 2 * oneDayInMilliseconds,
      },
      {
        id: `${currentDate + 2 * oneDayInMilliseconds}-2`,
        name: 'Sport treiben',
        status: true,
        description:
          'Eine Stunde lang joggen gehen oder eine andere körperliche Aktivität ausüben, um fit zu bleiben.',
        importance: 1,
        creationDate: currentDate + 2 * oneDayInMilliseconds,
        dueDate: currentDate + 3 * oneDayInMilliseconds,
      },
      {
        id: `${currentDate + 3 * oneDayInMilliseconds}-3`,
        name: 'Geburtstagsgeschenk besorgen',
        status: true,
        description:
          'Ein passendes Geburtstagsgeschenk für einen Freund oder Familienmitglied auswählen und kaufen.',
        importance: 2,
        creationDate: currentDate + 3 * oneDayInMilliseconds,
        dueDate: currentDate + 4 * oneDayInMilliseconds,
      },
      {
        id: `${currentDate + 4 * oneDayInMilliseconds}-4`,
        name: 'Küche aufräumen',
        status: false,
        description:
          'Geschirr spülen, Oberflächen reinigen und Küchenutensilien an ihren Platz zurückstellen.',
        importance: 3,
        creationDate: currentDate + 4 * oneDayInMilliseconds,
        dueDate: currentDate + 5 * oneDayInMilliseconds,
      },
    ];

    this.storage.update(initialData);

    return initialData.map(
      (f) =>
        new Todo(
          f.id,
          f.name,
          f.status,
          f.description,
          f.importance,
          new Date(f.creationDate),
          new Date(f.dueDate)
        )
    );
  }

  save() {
    this.storage.update(this.todos.map((f) => f.toJSON()));
  }

  createTodo(name, description, dueDate, importance) {
    const id = this.generateTodoId();
    const todo = new Todo(
      id,
      name,
      false,
      description,
      importance,
      new Date(),
      new Date(dueDate)
    );

    this.todos.push(todo);
    this.save();
  }

  getTodoById(id) {
    return this.todos.find((todo) => todo.id === id);
  }

  updateTodoStatus(todoId, status) {
    const todo = this.todos.find((desiredTodo) => desiredTodo.id === todoId);
    if (todo) {
      todo.status = status;
      this.save();
    }
  }

  updateTodo(todoId, updatedTodo) {
    const todo = this.todos.find((desiredTodo) => desiredTodo.id === todoId);
    if (todo) {
      Object.assign(todo, updatedTodo);
      this.save();
      return true;
    }
    return false;
  }

  deleteTodo(todoId) {
    const todoIndex = this.todos.findIndex((todo) => todo.id === todoId);
    if (todoIndex !== -1) {
      this.todos.splice(todoIndex, 1);
      this.save();
    }
  }

  generateTodoId() {
    const currentDate = Date.now().toString();
    const todoCount = this.todos.length;
    return `${currentDate}-${todoCount}`;
  }
}

export const todoService = new TodoService();
