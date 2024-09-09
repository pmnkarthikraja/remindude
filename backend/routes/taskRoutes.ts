import { Router } from 'express';
import TaskController from '../controllers/taskController';

const router: Router = Router();

router.post('/create-task', TaskController.createTask);
router.put('/update-task', TaskController.updateTask);
router.get('/tasks/:email', TaskController.getAllTasks);
router.delete('/delete-task/:email/:id', TaskController.deleteTask);
router.get('/update-task/:email/:id/:status',TaskController.updateTaskStatusViaEmail)
router.post('/update-task-via-email/:email/:id',TaskController.updateTaskPeriodViaEmail)
router.get('/update-task-via-email/:email/:id',(req,res)=>{
    const { email, id } = req.params;
    const BASE_URL=process.env.NODE_ENV==='production' ? "https://remindude-backend.onrender.com" :  "http://localhost:4000"
    res.send(`
       <html>
  <head>
    <style>
      body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        font-family: Arial, sans-serif;
        background-color: #f0f0f0;
      }

      h2 {
        text-align: center;
        margin-bottom: 20px;
        font-size: 24px;
      }

      form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border: 1px solid #ccc;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        background-color: #fff;
        width: auto;
      }

      label {
        font-size: 16px;
        margin-bottom: 10px;
        text-align: left;
        width: 100%;
      }

      input {
        padding: 8px;
        margin-bottom: 15px;
        font-size: 14px;
        width: 100%;
      }

      button {
        background-color: #007bff;
        color: #fff;
        border: none;
        padding: 10px 20px;
        margin: 5px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s;
      }

      button:hover {
        background-color: #0056b3;
      }

      form {
        max-width: 400px; 
        width: 100%;
      }
    </style>
  </head>
  <body>
    <h2>Reschedule the Task</h2>

    <form action="${BASE_URL}/update-task-via-email/${email}/${id}" method="POST">
      <label for="newDate">Select new date:</label>
      <input type="date" id="newDate" name="newDate" required>

      <label for="newTime">Select new time:</label>
      <input type="time" id="newTime" name="newTime" required>

      <button type="submit">Update Task</button>
    </form>
  </body>
</html>
        `)
})

export default router;