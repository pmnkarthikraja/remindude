import { MongoError } from "mongodb";
import TaskSchema,{ TaskModel } from "../models/TaskModel";
import { DBErrInternal, DBErrTaskAlreadyExist, DBErrTaskNotFound, DBErrTaskTimeElapsed } from "../utils/handleErrors";

interface TaskRepo{
    CreateTask:(task:TaskModel)=>Promise<TaskModel>
    UpdateTask:(task:TaskModel)=>Promise<TaskModel>
    DeleteTask:(email:string,id:string)=>Promise<void>
    GetAllTasks:(emai:string)=>Promise<{tasks:TaskModel[]}>
    UpdateTaskStatusViaEmail:(email:string,id:string,status:"InProgress"|"Done")=>Promise<TaskModel>
    GetRawAllTasks:()=>Promise<{tasks:TaskModel[]}>
    DeleteAllTaskWithEmail:(email:string)=>Promise<void>
    UpdateTaskPeriodViaEmail: (email:string,id:string, datetime:string)=>Promise<TaskModel>
}


class TaskRepoClass implements TaskRepo{
    async UpdateTaskStatusViaEmail(email:string,id:string,status:"InProgress"|"Done"):Promise<TaskModel>{
        try{
            const task = await TaskSchema.findOne({id})
            if (!task){
                throw new DBErrTaskNotFound()
            }
            task.status=status
            await task.save()
            return task
        }catch(err:any){
            const e:MongoError=err
            console.log("error on email update: ",e)
            if (e.code==211){
                throw new DBErrTaskNotFound()
            }else{
                throw new DBErrInternal("DB Error")
            }
        }
    }

    async UpdateTaskPeriodViaEmail(email:string,id:string,datetime:string):Promise<TaskModel>{
        try {
            const task = await TaskSchema.findOne({ id });
    
            if (!task) {
                throw new DBErrTaskNotFound(); 
            }
    
            const currentDate = new Date();
            const newTaskDateTime = new Date(datetime);
    
            if (newTaskDateTime < currentDate) {
                throw new DBErrTaskTimeElapsed()
            }
    
            task.dateTime = datetime;
            await task.save();
    
            return task;
        } catch (err: any) {
            const e: MongoError = err;
            console.log("Error on updating date/time: ", e);
    
            if (e.code === 211) {
                throw new DBErrTaskNotFound();
            } else {
                throw new DBErrInternal("DB Error");
            }
        }
    }

    async CreateTask(task: TaskModel): Promise<TaskModel>{
        try{
            const taskDoc = await TaskSchema.create(task)
            return await taskDoc.save()
        }catch(err:any){
            console.log("error:",err)
            const e:MongoError=err
            if (e.code==11000){
                throw new DBErrTaskAlreadyExist()
            }else{
                throw new DBErrInternal("DB Error")
            }
        }
    }
    async UpdateTask(task: TaskModel): Promise<TaskModel>{
        try{
            console.log("income update task: ",{task})
            const taskDoc = await TaskSchema.findOneAndUpdate({id:task.id},{...task},{new:true})
            if (!taskDoc){
                throw new DBErrTaskNotFound()
            }
            return taskDoc
        }catch(err:any){
            const e:MongoError=err
            console.log("error on update code: ",e.code)
            console.log("error on update: ",{e})
            if (e.code==211){
                throw new DBErrTaskNotFound()
            }else{
                throw new DBErrInternal("DB Error")
            }
        }
    }
    async DeleteTask(email:string,id:string):Promise<void>{
        try{
            const result = await TaskSchema.deleteOne({id,email})
            if (result.deletedCount<1){
                throw new DBErrTaskNotFound()
            }
        }catch(e:any){
            throw new DBErrInternal("DB Error")
        }
    }
    async GetAllTasks(email:string):Promise<{tasks:TaskModel[]}>{
        try{
            const gotTasks = await TaskSchema.find({email})
            return {
                tasks:gotTasks,
            }
        }catch(e:any){
            throw new DBErrInternal("DB Error")
        }
    }
    async GetRawAllTasks():Promise<{tasks:TaskModel[]}>{
        try{
            const gotTasks = await TaskSchema.find({})
            return {
                tasks:gotTasks
            }
        }catch(e){
            throw new DBErrInternal('DB Error')
        }
    }

    async DeleteAllTaskWithEmail(email:string):Promise<void>{
        try{
            const result = await TaskSchema.deleteMany({email})
            if (result.deletedCount<1){
                throw new DBErrTaskNotFound()
            }
        }catch(e){
            throw new DBErrInternal('DB Error')
        }
    }

}

export default new TaskRepoClass()