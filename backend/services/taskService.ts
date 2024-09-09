import { TaskModel } from "../models/TaskModel";
import { DBErrTaskTimeElapsed } from "../utils/handleErrors";
import { getNotificationSchedule, getRemainingTime } from "../utils/helper";
import taskRepo from '../repo/taskRepo'
import { cancelScheduledNotifications, scheduleNotifications, sendEmail } from "../utils/sendEmail";
import { createTemplateHTMLContent } from "../utils/mailTemplates";

interface TaskServiceImplementation {
    CreateTask: (task: TaskModel) => Promise<{ task: TaskModel|undefined,successMsg:string }>
    UpdateTask: (task: TaskModel) => Promise<{ task: TaskModel|undefined,successMsg:string }>
    DeleteTask: (email: string, id: string) => Promise<void>
    GetAllTasks: (email: string) => Promise<{ tasks: TaskModel[], msg: string }>
    UpdateTaskStatusViaEmail: (email: string, id: string, status: "InProgress" | "Done") => Promise<TaskModel>
    UpdateTaskPeriodViaEmail: (email:string,id:string, datetime:string)=>Promise<TaskModel>
}

class TaskService implements TaskServiceImplementation {
    async UpdateTaskStatusViaEmail(email: string, id: string, status: "InProgress" | "Done"): Promise<TaskModel> {
        return await taskRepo.UpdateTaskStatusViaEmail(email, id, status)
    }

    async UpdateTaskPeriodViaEmail(email: string, id: string, datetime:string): Promise<TaskModel> {
        const remainingTime = getRemainingTime(datetime);
        if (remainingTime <= 0) {
            throw new DBErrTaskTimeElapsed()
        }
        let gotTask= await taskRepo.UpdateTaskPeriodViaEmail(email, id, datetime)

        if (gotTask){
            await cancelScheduledNotifications(gotTask.id)
            if (gotTask.emailNotification) {
                  scheduleNotifications(gotTask)
                  return gotTask
              }
        }
        return gotTask
    }

    async CreateTask(task: TaskModel): Promise<{ task: TaskModel|undefined, successMsg: string }> {
        const remainingTime = getRemainingTime(task.dateTime);
        if (remainingTime <= 0) {
            throw new DBErrTaskTimeElapsed()
        }

        const gotTask = await taskRepo.CreateTask(task)

        if (gotTask){
          await sendEmail(task.email, `${gotTask.eventType} has successfully created!`, createTemplateHTMLContent(gotTask,false), "You can change the task setting here!")

          await cancelScheduledNotifications(gotTask.id)
          if (task.emailNotification) {
            console.log("schedule notifications upon creation: ",task.notificationIntervals)
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
        }else{
          return {
            task:undefined,
            successMsg:''
          }
        }
    }
    async UpdateTask(task: TaskModel): Promise<{ task: TaskModel|undefined, successMsg: string }> {
        const remainingTime = getRemainingTime(task.dateTime);
        if (remainingTime <= 0) {
            throw new DBErrTaskTimeElapsed()
        }

        const gotTask = await taskRepo.UpdateTask(task)
        if (gotTask){
          await sendEmail(task.email, `${gotTask.eventType} has successfully updated!`, createTemplateHTMLContent(gotTask,true), "You can change the task setting here!")

        await cancelScheduledNotifications(gotTask.id)
        console.log("task email notificaiotn:",task.emailNotification)
        if (task.emailNotification) {
          console.log("task has emailnotification:")
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
        }else{
          return {
            task:undefined,
            successMsg:''
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
