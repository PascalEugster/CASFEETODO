import { todoStore } from '../services/todo-store.js';
import { SecurityUtil } from '../utils/security.js';

export class TodoController {
  getTodos = async (req, res) => {
    res.json(
      (await todoStore.getTodos(
        SecurityUtil.currentUser(req),
        req.body.sortMethod,
        req.body.sortOrder, 
        req.body.filterStatus
      )) || []
    );
  };

  createTodo = async (req, res) => {
    res.json(
      await todoStore.add(
        req.body.id,
        SecurityUtil.currentUser(req),
        req.body.name,
        req.body.status,
        req.body.description,
        req.body.importance,
        req.body.dueDate
      )
    );
  };

  getTodo = async (req, res) => {
    res.json(await todoStore.get(req.params.id, SecurityUtil.currentUser(req)));
  };

  getSortStatus = async (req, res) => {
    res.json(
      await todoStore.get(SecurityUtil.currentUser(req), req.params.sortMethod)
    );
  };

  updateTodo = async (req, res) => {
    res.json(
      await todoStore.update(
        req.params.id,
        SecurityUtil.currentUser(req),
        req.body.name,
        req.body.description,
        req.body.importance,
        req.body.dueDate
      )
    );
  };

  updateTodoStatus = async (req, res) => {
    res.json(
      await todoStore.updateStatus(
        req.params.id,
        SecurityUtil.currentUser(req),
        req.body.status
      )
    );
  };

  deleteTodo = async (req, res) => {
    res.json(
      await todoStore.delete(req.params.id, SecurityUtil.currentUser(req))
    ); // TODO should return 402 if not ok
  };
}

export const todoController = new TodoController();
