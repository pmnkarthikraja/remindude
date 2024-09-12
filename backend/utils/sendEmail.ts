import nodemailer from 'nodemailer';
import schedule from 'node-schedule'
import { TaskModel } from '../models/TaskModel';
import { reminderTemplateHTMLContent } from './mailTemplates';
import masterSwitchRepo from '../repo/masterSwitchRepo';
import { getCurrentUsername } from './helper';
require('dotenv').config();
import moment from 'moment-timezone'

const scheduledJobs: { [key: string]: schedule.Job[] } = {};

export const scheduleNotifications = async (task: TaskModel) => {
  if (!scheduledJobs[task.id]) {
    scheduledJobs[task.id] = [];
  }

  task.notificationIntervals.forEach((notifyTime: string) => {
    let tempTime = notifyTime.toString();

    // Remove the GMT+0000 part if present
    if (tempTime.includes('GMT+0000')) {
      const parts = tempTime.split('GMT');
      tempTime = parts[0].trim();
    }

    const isoFormattedTime = new Date(tempTime).toISOString();


    // Convert the notification time to the task's local timezone
    const notificationTime = moment.tz(isoFormattedTime, task.localTimezone);
    
    // Ensure that we're working in the task's local timezone
    const isDuplicate = scheduledJobs[task.id].some(
      job =>
        job &&
        job.nextInvocation() &&
        job.nextInvocation().getTime() === notificationTime.toDate().getTime()
    );

    if (!isDuplicate) {
      // Schedule the job in the task's local timezone
      const job = schedule.scheduleJob(notificationTime.toDate(), async () => {
        const gotMasterSwitchData = await masterSwitchRepo.GetMasterSwitchData(task.email);

        if (gotMasterSwitchData?.masterEmailNotificationEnabled) {
          console.log(`Sending Email to ${task.email}...`, notificationTime.format('YYYY-MM-DD HH:mm:ss z'));
          const currentUsername = await getCurrentUsername(task.email);
          await sendEmail(
            task.email,
            `Kind Reminder for ${task.eventType} - ${task.title}`,
            reminderTemplateHTMLContent(task, currentUsername),
            `This is a kind reminder for your ${task.eventType}!`
          );
        } else {
          console.log(`Email Notification Turned off: ${task.email}...`, notificationTime.format('YYYY-MM-DD HH:mm:ss z'));
        }
      });

      // Store the job
      if (job) {
        scheduledJobs[task.id].push(job);
      }
    } else {
      console.log(`Notification for task ${task.id} at ${notificationTime.format('YYYY-MM-DD HH:mm:ss z')} already scheduled.`);
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