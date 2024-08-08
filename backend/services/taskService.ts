import { TaskModel } from "../models/TaskModel";
import { DBErrTaskTimeElapsed, DBErrUserNotFound } from "../utils/handleErrors";
import { getRemainingTime } from "../utils/helper";
import taskRepo from '../repo/taskRepo'
import { cancelScheduledNotifications, scheduleNotifications, sendEmail } from "../utils/sendEmail";

interface TaskServiceImplementation {
    CreateTask: (task: TaskModel) => Promise<{ task: TaskModel }>
    UpdateTask: (task: TaskModel) => Promise<{ task: TaskModel }>
    DeleteTask: (email: string, id: string) => Promise<void>
    GetAllTasks: (email: string) => Promise<{ tasks: TaskModel[], msg: string }>
    UpdateTaskStatusViaEmail: (email: string, id: string, status: "InProgress" | "Done") => Promise<TaskModel>
}

class TaskService implements TaskServiceImplementation {
    async UpdateTaskStatusViaEmail(email: string, id: string, status: "InProgress" | "Done"): Promise<TaskModel> {
        return await taskRepo.UpdateTaskStatusViaEmail(email, id, status)
    }

    async CreateTask(task: TaskModel): Promise<{ task: TaskModel, successMsg: string }> {
        const remainingTime = getRemainingTime(task.dateTime);
        if (remainingTime <= 0) {
            throw new DBErrTaskTimeElapsed()
        }

        const gotTask = await taskRepo.CreateTask(task)

        //send email once the user successfully created the task - testing the status change by email
        const inProgressLink = `https://remindude.vercel.app/update-task/${task.email}/${task.id}/InProgress`;
        const doneLink = `https://remindude.vercel.app/update-task/${task.email}/${task.id}/Done`;

        const emailContent = `
        <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kind Reminder for your task</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f6f6f6;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          text-align: center;
          font-size: 24px;
        }
        .content {
          margin: 20px 0;
        }
        .content p {
          font-size: 16px;
          line-height: 1.5;
        }
        .content .date-time {
          font-weight: bold;
          color: #333;
        }
        .buttons {
          text-align: center;
          margin: 20px 0;
        }
        .buttons a {
          text-decoration: none;
          padding: 10px 20px;
          margin: 0 10px;
          color: white;
          border-radius: 5px;
          font-size: 16px;
        }
        .postpone {
          background-color: #ffc107;
        }
        .prepone {
          background-color: #28a745;
        }
        .delete {
          background-color: #dc3545;
        }
      </style>
      </head>
      <body>
      <div class="container">
        <div class="header">
          ${task.title}
        </div>
        <div class="content">
          <p>${task.description}</p>
          <p class="date-time">Date & Time: ${new Date(task.dateTime).toLocaleDateString()}</p>
        </div>
        <div>
        <p>Priority: ${task.priority}</p>
        </div>
        <div class="buttons">
          <a href="${inProgressLink}" class="postpone">Set InProgress</a>
          <a href="${doneLink}" class="prepone">Set Done</a>
        </div>
      </div>
      </body>
      </html>
  `;
        await sendEmail(task.email, "Task has successfully created!", emailContent, "You can change the task setting here!")

        await cancelScheduledNotifications(gotTask.id)
        if (task.emailNotification) {
            scheduleNotifications(task)
            return {
                task: gotTask,
                successMsg: 'Task Created Successfully with email notification'
            }
        } else {
            return {
                task: gotTask,
                successMsg: "Task Created Successfully without email notification"
            }
        }
    }
    async UpdateTask(task: TaskModel): Promise<{ task: TaskModel, successMsg: string }> {
        const remainingTime = getRemainingTime(task.dateTime);
        if (remainingTime <= 0) {
            throw new DBErrTaskTimeElapsed()
        }

        const gotTask = await taskRepo.UpdateTask(task)
        await cancelScheduledNotifications(gotTask.id)
        if (task.emailNotification) {
            scheduleNotifications(task)
            return {
                task: gotTask,
                successMsg: 'Task Updated Successfully with email notification'
            }
        } else {
            return {
                task: gotTask,
                successMsg: "Task Updated Successfully without email notification"
            }
        }
    }
    async DeleteTask(email: string, id: string): Promise<void> {
        await taskRepo.DeleteTask(email, id)
        await cancelScheduledNotifications(id)
    }
    async GetAllTasks(email: string): Promise<{ tasks: TaskModel[], msg: string }> {
        const { tasks } = await taskRepo.GetAllTasks(email)
        if (tasks.length == 0) {
            return {
                tasks,
                msg: "No Tasks Found"
            }
        }
        return {
            tasks,
            msg: "Tasks Retrieved Successfully"
        }
    }
}

export default new TaskService();
