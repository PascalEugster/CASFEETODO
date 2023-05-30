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
        status: 'ascending'
      };
    }

    loadData() {
        const storedTodos = this.storage.getAll().map(f => new Todo(f.id, f.name, f.status, f.description, f.importance, new Date(f.creationDate), new Date(f.dueDate)));
        this.todos = storedTodos.length > 0 ? storedTodos : this.getInitialData();
      }
      
      getInitialData() {
        const initialData = [
          { id: 0, name: 'bring Milk', status: 0, description: 'from the store', importance: 1, creationDate: new Date(), dueDate: new Date() },
          { id: 1, name: 'bring Bread', status: 0, description: 'from the store', importance: 3, creationDate: new Date(), dueDate: new Date() },
          { id: 2, name: 'bring Eggs', status: 0, description: 'from the store', importance: 2, creationDate: new Date(), dueDate: new Date() },
          { id: 3, name: 'bring Butter', status: 0, description: 'from the store', importance: 5, creationDate: new Date(), dueDate: new Date() },
          { id: 4, name: 'bring Cheese', status: 0, description: 'from the store', importance: 3, creationDate: new Date(), dueDate: new Date() }
        ];
      
        this.storage.update(initialData);
        return initialData.map(f => new Todo(f.id, f.name, f.status, f.description, f.importance, new Date(f.creationDate), new Date(f.dueDate)));
        }


    save() {
        this.storage.update(this.todos.map(f => f.toJSON()));
    }

}

export const todoService = new TodoService();
