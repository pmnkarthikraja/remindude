import nodemailer from 'nodemailer';
import schedule from 'node-schedule'
import { TaskModel } from '../models/TaskModel';
import { reminderTemplateHTMLContent } from './mailTemplates';
require('dotenv').config();
const scheduledJobs: { [key: string]: schedule.Job[] } = {};

export const scheduleNotifications = async (task:TaskModel) => {
  if (!scheduledJobs[task.id]) {
      scheduledJobs[task.id] = [];
  }

  task.notificationIntervals.forEach((notificationTime: string) => {
      const job = schedule.scheduleJob(notificationTime, async () => {
          console.log("sending mail...", notificationTime);

      await sendEmail(task.email, `Kind Reminder for ${task.eventType} - ${task.title}`, reminderTemplateHTMLContent(task), `This is the kind reminder for your ${task.eventType}!`);
      });
      scheduledJobs[task.id].push(job);
    //   console.log("scheduling for task: ",task.email,": ",task.title, ": ",notificationTime)
  });
};

export const cancelScheduledNotifications = async (taskId: string) => {
    if (scheduledJobs[taskId]) {
        scheduledJobs[taskId].forEach(job => {
          job.cancel()});
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