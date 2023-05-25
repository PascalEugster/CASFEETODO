import TodoStorage from './data/todo-storage.js';
import Todo from './todo.js';

export default class TodoService {
    constructor(storage) {
        this.storage = storage || new TodoStorage();
        this.todos = [ ];
    }

    loadData() {
        this.todos = this.storage.getAll().map(f => new Todo(f.id, f.name, f.status, f.description, f.importance, f.creationDate, f.dueDate));
        
        // initial data seed
        if (this.todos.length === 0) { // initial data seed
            this.todos.push(new Todo(0, 'bring Milk', 0, 'from the store', 1, new Date(), new Date()));
            this.todos.push(new Todo(1, 'bring Bread', 0, 'from the store', 1, new Date(), new Date()));
            this.todos.push(new Todo(2, 'bring Eggs', 0, 'from the store', 1, new Date(), new Date()));
            this.todos.push(new Todo(3, 'bring Butter', 0, 'from the store', 1, new Date(), new Date()));
            this.todos.push(new Todo(4, 'bring Cheese', 0, 'from the store', 1, new Date(), new Date()));
            this.save();
        }
    }

    save() {
        this.storage.update(this.todos.map(f => f.toJSON()));
    }

}

export const todoService = new TodoService();
