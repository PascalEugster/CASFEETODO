export default class Todo {
    constructor(id, name, status, description, importance, creationDate, dueDate) {
        this.id = id;
        this.name = name || 'unknown';
        this.status = status || 0;
        this.description = description || "";
        this.importance = importance;
        this.creationDate = creationDate;
        this.dueDate = dueDate;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            status: this.status,
            description: this.description,
            importance: this.importance,
            creationDate: this.creationDate,
            dueDate: this.dueDate
        };
    }

}