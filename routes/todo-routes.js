import express from 'express';

const router = express.Router();
import { todoController } from '../controller/todo-controller.js';

router.post('/', todoController.getTodos);
router.post('/create', todoController.createTodo);
router.get('/:id/', todoController.getTodo);
router.put('/:id/', todoController.updateTodo);
router.patch('/:id/', todoController.updateTodoStatus);
router.delete('/:id/', todoController.deleteTodo);

export const todoRoutes = router;
