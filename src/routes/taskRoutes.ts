import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema } from '../utils/validation';

const router = Router();

router.use(authenticate as any);

router.get('/', taskController.getTasks as any);
router.post('/', validate(createTaskSchema), taskController.createTask as any);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask as any);
router.delete('/:id', taskController.deleteTask as any);

export default router;
