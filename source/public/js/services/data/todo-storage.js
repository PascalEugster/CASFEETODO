export default class TodoStorage {
    constructor() {
        const todos = JSON.parse(localStorage.getItem('todoStorage_v1') || "[ ]");
        this.todos = todos;
        localStorage.setItem('todoStorage_v1', JSON.stringify(todos));
    }

    getAll() {
        return this.todos;
    }

    update(todos) {
        localStorage.setItem('todoStorage_v1', JSON.stringify(todos));
        return this.todos;
    }
}
