import axios, { AxiosResponse } from "axios";
import { TaskRequestData } from "../components/task";

interface TaskAPI{
    createTask:(task:TaskRequestData)=>Promise<AxiosResponse>
    updateTask:(task:TaskRequestData)=>Promise<AxiosResponse>
    getAllTasks:(email:string)=>Promise<AxiosResponse>
    deleteTask:(email:string,id:string)=>Promise<AxiosResponse>
}

// const BASE_URL="http://localhost:4000"
const BASE_URL="https://remindude.vercel.app"

class TaskAPIService implements TaskAPI{
    async createTask (task: TaskRequestData) : Promise<AxiosResponse<any, any>>{
        return await axios.post(`${BASE_URL}/create-task`,{...task})
    }
    async updateTask (task:TaskRequestData) : Promise<AxiosResponse>{
        return await axios.put(`${BASE_URL}/update-task`,{...task})
    }
    async deleteTask (email:string,id:string):Promise<AxiosResponse>{
        return await axios.delete(`${BASE_URL}/delete-task/${email}/${id}`,{
            params:[
                {
                    id,
                },{
                    email
                }
            ]
        })
    }
    
    async getAllTasks (email:string):Promise<AxiosResponse<{message:string,success:boolean,tasks:TaskRequestData[]}>>{
        const response = await axios.get(`${BASE_URL}/tasks/${email}`,{
            params:
                {
                    email,
                }
            
        })
        return response
    }
}


export const taskApi = new TaskAPIService()