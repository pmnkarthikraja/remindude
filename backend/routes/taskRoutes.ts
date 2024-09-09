import { Router } from 'express';
import TaskController from '../controllers/taskController';

const router: Router = Router();

router.post('/create-task', TaskController.createTask);
router.put('/update-task', TaskController.updateTask);
router.get('/tasks/:email', TaskController.getAllTasks);
router.delete('/delete-task/:email/:id', TaskController.deleteTask);
router.get('/update-task/:email/:id/:status',TaskController.updateTaskStatusViaEmail)
router.post('/update-task-via-email/:email/:id',TaskController.updateTaskPeriodViaEmail)

export default router;