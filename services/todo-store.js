import Datastore from 'nedb-promises';

export default class Todo {
  constructor(id, createdBy, name, status, description, importance, dueDate) {
    this.id = id;
    this.createdBy = createdBy;
    this.name = name || 'unknown';
    this.status = status || 0;
    this.description = description || '';
    this.importance = importance;
    this.creationDate = new Date();
    this.dueDate = dueDate;
  }
}
export class TodoStore {
  constructor(db) {
    const options =
      process.env.DB_TYPE === 'FILE'
        ? { filename: './data/todos.db', autoload: true }
        : {};
    this.db = db || new Datastore(options);
  }

  async add(id, createdBy, name, status, description, importance, dueDate) {
    let todo = new Todo(
      await this.uuidv4(),
      createdBy,
      name,
      false,
      description,
      importance,
      dueDate
    );
    return this.db.insert(todo);
  }

  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  async uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  async update(id, createdBy, name, description, importance, dueDate) {
    await this.db.update(
      { id: id, createdBy: createdBy },
      {
        $set: {
          name: name,
          description: description,
          importance: importance,
          dueDate: dueDate,
        },
      }
    );
    return this.get(id, createdBy);
  }

  async updateStatus(id, createdBy, status) {
    await this.db.update(
      { id: id, createdBy: createdBy },
      { $set: { status: status } }
    );
    return this.get(id, createdBy);
  }

  async delete(id, currentUser) {
    await this.db.update(
      { _id: id, createdBy: currentUser },
      { $set: { state: 'DELETED' } }
    );
    return this.get(id, currentUser);
  }

  async get(id, currentUser) {
    return this.db.findOne({ id: id, createdBy: currentUser });
  }

  async getTodos(currentUser, sortMethod, sortOrder) {
    const sortOptions = {
      name: { key: 'name', compareFn: this.compareByName },
      dueDate: { key: 'dueDate', compareFn: this.compareByDueDate },
      creationDate: {
        key: 'creationDate',
        compareFn: this.compareByCreationDate,
      },
      importance: { key: 'importance', compareFn: this.compareByImportance },
      status: { key: 'status', compareFn: this.compareByStatus },
    };

    const sortOption = sortOptions[sortMethod];
    if (!sortOption) {
      return this.db.find({ createdBy: currentUser }).sort({}).exec();
    }

    const { key } = sortOption;
    const sortQuery = {};
    sortQuery[key] = sortOrder === 'asc' ? 1 : -1;

    return this.db.find({ createdBy: currentUser }).sort(sortQuery).exec();
  }

  compareByName(a, b) {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  }

  compareByDueDate(a, b) {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);

    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0;
  }

  compareByCreationDate(a, b) {
    const dateA = new Date(a.creationDate);
    const dateB = new Date(b.creationDate);
    return dateA - dateB;
  }

  compareByImportance(a, b) {
    return a.importance - b.importance;
  }

  compareByStatus(a, b) {
    return a.status - b.status;
  }
}

export const todoStore = new TodoStore();
