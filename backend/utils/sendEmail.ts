import nodemailer from 'nodemailer';
import schedule from 'node-schedule'
import { TaskModel } from '../models/TaskModel';
import { reminderTemplateHTMLContent } from './mailTemplates';
import masterSwitchRepo from '../repo/masterSwitchRepo';
require('dotenv').config();
const scheduledJobs: { [key: string]: schedule.Job[] } = {};

export const scheduleNotifications= async (task: TaskModel) => {
    if (!scheduledJobs[task.id]) {
      scheduledJobs[task.id] = [];
    }
  
    task.notificationIntervals.forEach((notificationTime: string) => {
      // Check if a job is already scheduled for the same notification time
      const isDuplicate = scheduledJobs[task.id].some(
        job =>job && job.nextInvocation() && job.nextInvocation().getTime() === new Date(notificationTime).getTime()
      );
  
      if (!isDuplicate) {
        const job = schedule.scheduleJob(notificationTime, async () => {
          const gotMasterSwitchData = await masterSwitchRepo.GetMasterSwitchData(task.email)

          if (gotMasterSwitchData?.masterEmailNotificationEnabled){
            console.log(`Sending Email to ${task.email}...`, new Date(notificationTime).toLocaleString());
            await sendEmail(
              task.email,
              `Kind Reminder for ${task.eventType} - ${task.title}`,
              reminderTemplateHTMLContent(task),
              `This is a kind reminder for your ${task.eventType}!`
            );
          }else{
            console.log(`Email Notification Turned off: ${task.email}...`, new Date(notificationTime).toLocaleString());
          }
        });
        
        // Store the job
        if (job){
          scheduledJobs[task.id].push(job);
        }
      } else {
        console.log(`Notification for task ${task.id} at ${new Date(notificationTime).toLocaleString()} already scheduled.`);
      }
    });
  };
  

export const cancelScheduledNotifications = async (taskId: string) => {
    if (scheduledJobs[taskId]) {
        scheduledJobs[taskId].forEach(job => {
            if (job){
                job.cancel();
            }
        });
        delete scheduledJobs[taskId];
    }
};

export const sendEmail = async (email: string, subject: string, htmlTemplate: string, text: string) => {
    const mailOptions = {
        from: process.env.EMAIL || '',
        to: email,
        subject,
        html: htmlTemplate,
        text,
    };
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL || '',
            pass: process.env.PASSWORD || '',
        },
    });

    return await transporter.sendMail(mailOptions);
};