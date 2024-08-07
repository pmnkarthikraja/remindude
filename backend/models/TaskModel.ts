import { Document } from "mongodb";
import mongoose, { Schema } from "mongoose";

export interface TaskModel extends Document{
    id:string,
    email:string,
    title:string,
    description:string,
    priority:string,
    dateTime:string,
    emailNotification:boolean,
    notificationIntervals:string[],
    dayFrequency:string,
    eventType:string,
    categoryName:string,
    categoryLabel:string,
    status:'InProgress'|'Done',
    subTasks?:SubTaskData[],
    checklists?:SubTaskData[]
}


export interface SubTaskData {
    id: string
    subtitle: string,
    subdescription: string,
    optional: boolean
}


const subTaskDataSchema = new Schema({
    id:{
        type:String,
        require:true,
    },
    subtitle:{
        type:String,
        require:true,
    },
    subdescription:{
        type:String,
        require:true
    },
    optional:{
        type:Boolean,
        require:true
    }
})

const TaskSchema = new Schema({
    id:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
    },
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
    },
    priority:{
        type:String,
        require:true
    },
    dateTime:{
        type:String
    },
    emailNotification:{
        type:Boolean,
        require:true
    },
    notificationIntervals:{
        type:[String],
    },
    dayFrequency:{
        type:String
    },
    eventType:{
        type:String,
        require:true
    },
    categoryName:{
        type:String,
        require:true
    },
    categoryLabel:{
        type:String,
        require:true
    },
    status:{
        type:String,
        require:true
    },
    subTasks:{
        type:[subTaskDataSchema],
        require:false,
    },
    checklists:{
        type:[subTaskDataSchema],
        require:false
    }
},{
    timestamps:true
})


export default mongoose.model<TaskModel>('TaskTest',TaskSchema)


export const subTasksDummy:SubTaskData[]=[
    {
        id:'1',
        subtitle:'SubTask1',
        subdescription:"sample desc",
        optional:false
    },
    {
        id:'2',
        subtitle:'SubTask2',
        subdescription:"sample desc",
        optional:false
    },
    {
        id:'3',
        subtitle:'SubTask3',
        subdescription:"sample desc",
        optional:false
    }
]


export const checklistsDummy:SubTaskData[]=[
    {
        id:'1',
        subtitle:'checklist1',
        subdescription:"sample desc",
        optional:false
    },
    {
        id:'2',
        subtitle:'checklist2',
        subdescription:"sample desc",
        optional:false
    },
    {
        id:'3',
        subtitle:'checklist3',
        subdescription:"sample desc",
        optional:false
    }
]