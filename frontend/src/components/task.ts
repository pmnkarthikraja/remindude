import * as uuid from 'uuid';
import { getNotificationSchedule } from "../components/calculateRemindTime"

export type TaskPriority = 'Urgent' | 'Moderate' | 'Normal'
export interface Task{
    title:string
    taskType:TaskPriority
    description:JSX.Element
    date?:Date
}

export type EventType='Meeting'|'Task'
export type LabelType = 'Visa Processing'|'Employee Onboarding' | 'PO Dates' | 'Bill Payments' | 'Salary Processing' | 'GRO Follow Up' | 'Client Follow Up' | 'Interview Follow Up' | 'Personal Activity'
export type TaskStatus = 'InProgress'|'Done'
export interface TaskRequestData{
    id:string,
    email:string,
    title:string,
    description:string,
    priority:TaskPriority,
    dateTime:string,
    emailNotification:boolean,
    dayFrequency:string,
    notificationIntervals:Date[],
    eventType?:EventType,
    subTasks?:SubTaskData[],
    checklists?:SubTaskData[]
    categoryName:string,
    categoryLabel:string,
    status:TaskStatus,
}




export type TaskCategoryName = 'HR'| 'Recruitment' | 'Client' | 'Internal'
type TaskCategoryHRLabel = 'Salary Processing' | 'Employee Onboarding' | 'Visa Processing'
type TaskCategoryInternalLabel = 'Personal Activity'
type TaskCategoryClientLabel = 'Client Follow Up' | 'GRO Follow Up' | 'Bill Payments' | 'PO Dates'
type TaskCategoryRecruitmentLabel = 'Interview Follow Up' | 'Interview Scheduling' | 'Shortlist Profiles' | 'Contact Interviewee'


export interface CategoryWithLabel{
    HR:TaskCategoryHRLabel
    Recruitment: TaskCategoryRecruitmentLabel
    Client:TaskCategoryClientLabel
    Internal:TaskCategoryInternalLabel
}

export const categoryLabels: Record<TaskCategoryName, string[]> = {
    HR: ['Salary Processing', 'Employee Onboarding', 'Visa Processing'],
    Recruitment: ['Interview Follow Up', 'Interview Scheduling', 'Shortlist Profiles', 'Contact Interviewee'],
    Client: ['Client Follow Up', 'GRO Follow Up', 'Bill Payments', 'PO Dates'],
    Internal: ['Personal Activity']
};

type PropUpdate<T extends object> = {
    [K in keyof T]: { name: K; label: T[K] }
  }[keyof T];

export type TaskCategory = PropUpdate<CategoryWithLabel>


export interface EventData{
    id:string,
    email:string,
    notificationIntervals:Date[],
    title:string,
    priority:TaskPriority,
    eventType:EventType,
    category:TaskCategory,
    description:string,
    datetime:string,
    emailNotification:boolean,
    status:TaskStatus
    notifyFrequency?:"0"|'1'|'2'|'3',
    subTasks?:SubTaskData[]
    checklists?:SubTaskData[]
}

export interface SubTaskData {
    id: string
    subtitle: string,
    subdescription: string,
    optional: boolean
}


export const dummyTasks:TaskRequestData[]=[{
    id:uuid.v4().toString(),
    categoryName:'HR',
    categoryLabel:'Salary Processing',
    dateTime:new Date().toJSON(),
    dayFrequency:'0',
    description:"Test description",
    email:"pmnkarthikraja@gmail.com",
    emailNotification:true,
    notificationIntervals:getNotificationSchedule(new Date(),1),
    priority:'Urgent',
    title:"Dummy Title",
    eventType:'Meeting',
    status:'InProgress'
  },
  {
    id:uuid.v4().toString(),
    categoryName:'HR',
    categoryLabel:'Salary Processing',
    dateTime:new Date().toJSON(),
    dayFrequency:'0',
    description:"Test description",
    email:"pmnkarthikraja@gmail.com",
    emailNotification:true,
    notificationIntervals:getNotificationSchedule(new Date(),1),
    priority:'Urgent',
    title:"Large Title Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque minima incidunt, perspiciatis ex ducimus vel voluptas, harum blanditiis veniam quibusdam accusamus, nulla adipisci magnam explicabo excepturi animi iusto totam culpa.",
    eventType:'Meeting',
    status:'InProgress'
  },
  {
    id:uuid.v4().toString(),
    categoryName:'HR',
    categoryLabel:'Salary Processing',
    dateTime:new Date().toJSON(),
    dayFrequency:'0',
    description:"Test description",
    email:"pmnkarthikraja@gmail.com",
    emailNotification:true,
    notificationIntervals:getNotificationSchedule(new Date(),1),
    priority:'Urgent',
    title:"Dummy Title",
    eventType:'Meeting',
    status:'InProgress'
  },
  {
    id:uuid.v4().toString(),
    categoryName:'HR',
    categoryLabel:'Salary Processing',
    dateTime:new Date().toJSON(),
    dayFrequency:'0',
    description:"Test description",
    email:"pmnkarthikraja@gmail.com",
    emailNotification:true,
    notificationIntervals:getNotificationSchedule(new Date(),1),
    priority:'Urgent',
    title:"Dummy Title",
    eventType:'Meeting',
    status:'InProgress'
  },
  {
    id:uuid.v4().toString(),
    categoryName:'HR',
    categoryLabel:'Salary Processing',
    dateTime:new Date().toJSON(),
    dayFrequency:'0',
    description:"Test description",
    email:"pmnkarthikraja@gmail.com",
    emailNotification:true,
    notificationIntervals:getNotificationSchedule(new Date(),1),
    priority:'Urgent',
    title:"Dummy Title",
    eventType:'Meeting',
    status:'InProgress'
  },
  {
    id:uuid.v4().toString(),
    categoryName:'HR',
    categoryLabel:'Salary Processing',
    dateTime:new Date().toJSON(),
    dayFrequency:'0',
    description:"Test description",
    email:"pmnkarthikraja@gmail.com",
    emailNotification:true,
    notificationIntervals:getNotificationSchedule(new Date(),1),
    priority:'Urgent',
    title:"Dummy Title",
    eventType:'Meeting',
    status:'InProgress'
  },
  {
    id:uuid.v4().toString(),
    categoryName:'HR',
    categoryLabel:'Salary Processing',
    dateTime:new Date().toJSON(),
    dayFrequency:'0',
    description:"Test description",
    email:"pmnkarthikraja@gmail.com",
    emailNotification:true,
    notificationIntervals:getNotificationSchedule(new Date(),1),
    priority:'Urgent',
    title:"Dummy Title",
    eventType:'Meeting',
    status:'InProgress'
  },
  {
    id:uuid.v4().toString(),
    categoryName:'HR',
    categoryLabel:'Salary Processing',
    dateTime:new Date().toJSON(),
    dayFrequency:'0',
    description:"Test description",
    email:"pmnkarthikraja@gmail.com",
    emailNotification:true,
    notificationIntervals:getNotificationSchedule(new Date(),1),
    priority:'Urgent',
    title:"Dummy Title",
    eventType:'Meeting',
    status:'InProgress'
  },
  {
    id:uuid.v4().toString(),
    categoryName:'HR',
    categoryLabel:'Salary Processing',
    dateTime:new Date().toJSON(),
    dayFrequency:'0',
    description:"Test description",
    email:"pmnkarthikraja@gmail.com",
    emailNotification:true,
    notificationIntervals:getNotificationSchedule(new Date(),1),
    priority:'Urgent',
    title:"Dummy Title",
    eventType:'Meeting',
    status:'InProgress'
  }
]