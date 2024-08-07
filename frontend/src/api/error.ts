import { TaskRequestData } from "../components/task";
import { User } from "../components/user";

export interface ErrResponse{
    message:string,
    success:boolean,
    task?:TaskRequestData
    user?:User
}