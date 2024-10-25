import { Request, Response } from "express";
import { TaskModel } from "../models/TaskModel";
import taskService from "../services/taskService";
import { DBErrInternal, DBErrTaskNotFound, DBErrTaskTimeElapsed } from "../utils/handleErrors";
import { taskUpdatedWith404, taskUpdatedWithDisableEmailNotification, taskUpdatedWithInternalErr, taskUpdatedWithMissingFields, taskUpdatedWithSuccess, taskUpdatedWithTimeElapsed } from "../utils/mailTemplates";
import taskRepo from "../repo/taskRepo";

class TaskController{
    public async createTask(req:Request,res:Response):Promise<void>{
        const taskReq:TaskModel = req.body
        try {
          const {task,successMsg}=await  taskService.CreateTask(taskReq)
          if (task){
            res.status(201).json({
                message:successMsg,
                success:true,
                task,
              })
          }
        }catch(err:any){
            if (err instanceof DBErrTaskTimeElapsed){
                res.status(400).json({
                    message:err.name,success:false
                })
            }else if (err instanceof DBErrInternal){
                res.status(500).json({
                    message:err.name,success:false
                })
            }else{
                res.status(500).json({
                    message:"Internal Server Error",success:false
                })
            }
        }
    }
    public async updateTask(req:Request,res:Response):Promise<void>{
        const taskReq:TaskModel = req.body

        try {
          const {task,successMsg}=await  taskService.UpdateTask(taskReq)
          if (task){
            res.status(201).json({
                message:successMsg,
                success:true,
                task,
              })
          }
        }catch(err:any){
            if (err instanceof DBErrTaskTimeElapsed){
                res.status(400).json({
                    message:err.name,success:false
                })
            }else if (err instanceof DBErrTaskNotFound){
                res.status(404).json({
                    message:err.name,success:false
                })
            }
            else if (err instanceof DBErrInternal){
                res.status(500).json({
                    message:err.name,success:false
                })
            } 
            else{
                res.status(500).json({
                    message:"Internal Server Error",success:false
                })
            }
        }
    }
    public async deleteTask(req:Request,res:Response):Promise<void>{
        const {email,id} = req.params
        try {
          await  taskService.DeleteTask(email,id)
          res.status(200).json({
            message:"Task successfully deleted",
            success:true,
          })
        }catch(err:any){
            console.log("error on delete:",err)
           if (err instanceof DBErrTaskNotFound){
                res.status(404).json({
                    message:err.name,success:false
                })
            }
            else if (err instanceof DBErrInternal){
                res.status(500).json({
                    message:err.name,success:false
                })
            } 
            else{
                res.status(500).json({
                    message:"Internal Server Error",success:false
                })
            }
        }
    }
    public async getAllTasks(req:Request,res:Response):Promise<void>{
        const {email} = req.params
        try {
         const {tasks,msg}= await  taskService.GetAllTasks(email)
          res.status(200).json({
            message:msg,
            success:true,
            tasks
          })
        }catch(err:any){
           if (err instanceof DBErrInternal){
                res.status(500).json({
                    message:err.name,success:false
                })
            } 
            else{
                res.status(500).json({
                    message:"Internal Server Error",success:false
                })
            }
        }
    }

    // update task status via email
    public async updateTaskStatusViaEmail(req:Request,res:Response):Promise<void>{
        const {email,id,status} = req.params
        try {
          const task=await  taskService.UpdateTaskStatusViaEmail(email,id,status as "InProgress"|"Done")
          console.log("updated task via email: ",task)
        //   res.status(201).json({
        //     message:"Successfully task status has changed!",
        //     success:true,
        //     task,
        //   })

        const appUrl = 'remindude://'; 
        const fallbackUrl = 'https://remindude-theta.vercel.app';  
    
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Redirecting...</title>
                <script>
                    function redirectToApp() {
                        var appUrl = "${appUrl}";
                        var fallbackUrl = "${fallbackUrl}";
    
                        // Create an iframe to attempt opening the app
                        var iframe = document.createElement("iframe");
                        iframe.style.display = "none";
                        iframe.src = appUrl;
    
                        // Append iframe to body
                        document.body.appendChild(iframe);
    
                        // Set a timeout to redirect to fallback URL if app isn't opened
                        setTimeout(function() {
                            window.location.href = fallbackUrl;
                        }, 1000); // Adjust the timeout as needed
                    }
    
                    // Redirect when the page loads
                    window.onload = redirectToApp;
                </script>
            </head>
            <body>
                <p>If you are not redirected automatically, <a href="${fallbackUrl}">click here</a>.</p>
            </body>
            </html>
        `);

        // res.redirect('https://www.google.co.in')
        // res.send(`<p>Congratulation! your task <b>${task.title}</b> has been modified!</p>`) 

        }catch(err:any){
           if (err instanceof DBErrTaskNotFound){
                res.status(404).json({
                    message:err.name,success:false
                })
            }
            else if (err instanceof DBErrInternal){
                res.status(500).json({
                    message:err.name,success:false
                })
            } 
            else{
                res.status(500).json({
                    message:"Internal Server Error",success:false
                })
            }
        }
    }

    public async updateTaskPeriodViaEmail(req:Request,res:Response):Promise<void>{
        const {email,id}=req.params
        const {newDate,newTime} = req.body
        const combinedDateTimeString = `${newDate}T${newTime}:00`;
        console.log("newdate and newtime:",newDate,newTime)
        console.log("combinedDateTimeString: ",combinedDateTimeString)
        try {
            if (!newDate || !newTime){
                res.status(400).send(taskUpdatedWithMissingFields)
                return
            }    
            await taskService.UpdateTaskPeriodViaEmail(email,id,combinedDateTimeString)

            // const appUrl = 'remindude://'; 
            // const fallbackUrl = 'https://remindude-theta.vercel.app';  

            // res.send(`
            //     <!DOCTYPE html>
            //     <html lang="en">
            //     <head>
            //         <meta charset="UTF-8">
            //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
            //         <title>Redirecting...</title>
            //         <script>
            //             function redirectToApp() {
            //                 var appUrl = "${appUrl}";
            //                 var fallbackUrl = "${fallbackUrl}";

            //                 // Create an iframe to attempt opening the app
            //                 var iframe = document.createElement("iframe");
            //                 iframe.style.display = "none";
            //                 iframe.src = appUrl;

            //                 // Append iframe to body
            //                 document.body.appendChild(iframe);

            //                 // Set a timeout to redirect to fallback URL if app isn't opened
            //                 setTimeout(function() {
            //                     window.location.href = fallbackUrl;
            //                 }, 1000); // Adjust the timeout as needed
            //             }

            //             // Redirect when the page loads
            //             window.onload = redirectToApp;
            //         </script>
            //     </head>
            //     <body>
            //         <p>If you are not redirected automatically, <a href="${fallbackUrl}">click here</a>.</p>
            //     </body>
            //     </html>
            // `);

        res.send(taskUpdatedWithSuccess)

        // res.redirect('https://www.google.co.in')
        // res.send(`<p>Congratulation! your task <b>${task.title}</b> has been modified!</p>`) 

        }catch(err:any){
            console.log("error on update:",err)
           if (err instanceof DBErrTaskNotFound){
                res.status(404).send(taskUpdatedWith404)
            }
            else if (err instanceof DBErrTaskTimeElapsed){
                res.status(400).send(taskUpdatedWithTimeElapsed)
            } 
            else if (err instanceof DBErrInternal){
                res.status(500).send(taskUpdatedWithInternalErr)
            } 
            else{
                res.status(500).send(taskUpdatedWithInternalErr)
            }
        }
    }

    public async updateTaskNoEmailNotification(req:Request,res:Response):Promise<void>{
        const {email,id}=req.params

        try{
            await taskRepo.UpdateTaskNoEmailNotificationViaEmail(email,id)
            res.status(200).send(taskUpdatedWithDisableEmailNotification)
        }catch(err){
            console.log("error on update:",err)
           if (err instanceof DBErrTaskNotFound){
                res.status(404).send(taskUpdatedWith404)
            }
            else if (err instanceof DBErrTaskTimeElapsed){
                res.status(400).send(taskUpdatedWithTimeElapsed)
            } 
            else if (err instanceof DBErrInternal){
                res.status(500).send(taskUpdatedWithInternalErr)
            } 
            else{
                res.status(500).send(taskUpdatedWithInternalErr)
            } 
        }
    }
}

export default new TaskController()