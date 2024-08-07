import { Request, Response } from "express";
import { TaskModel } from "../models/TaskModel";
import taskService from "../services/taskService";
import { DBErrInternal, DBErrTaskNotFound, DBErrTaskTimeElapsed } from "../utils/handleErrors";

class TaskController{
    public async createTask(req:Request,res:Response):Promise<void>{
        const taskReq:TaskModel = req.body
        try {
          const {task,successMsg}=await  taskService.CreateTask(taskReq)
          res.status(201).json({
            message:successMsg,
            success:true,
            task,
          })
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
          res.status(201).json({
            message:successMsg,
            success:true,
            task,
          })
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

        res.redirect('https://www.google.co.in')
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
}

export default new TaskController()