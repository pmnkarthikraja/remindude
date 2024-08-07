import nodemailer from 'nodemailer';
import schedule from 'node-schedule'
import { TaskModel } from '../models/TaskModel';
require('dotenv').config();
const scheduledJobs: { [key: string]: schedule.Job[] } = {};


export const scheduleNotifications = async (task:TaskModel) => {
  if (!scheduledJobs[task.id]) {
      scheduledJobs[task.id] = [];
  }

  task.notificationIntervals.forEach((notificationTime: string) => {
      const job = schedule.scheduleJob(notificationTime, async () => {
          console.log("sending mail...", notificationTime);
          const localDateTime = new Date(task.dateTime).toLocaleString()
          const template = `
        <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kind Reminder for your task</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f6f6f6;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          text-align: center;
          font-size: 24px;
        }
        .content {
          margin: 20px 0;
        }
        .content p {
          font-size: 16px;
          line-height: 1.5;
        }
        .content .date-time {
          font-weight: bold;
          color: #333;
        }
        .buttons {
          text-align: center;
          margin: 20px 0;
        }
        .buttons a {
          text-decoration: none;
          padding: 10px 20px;
          margin: 0 10px;
          color: white;
          border-radius: 5px;
          font-size: 16px;
        }
        .postpone {
          background-color: #ffc107;
        }
        .prepone {
          background-color: #28a745;
        }
        .delete {
          background-color: #dc3545;
        }
      </style>
      </head>
      <body>
      <div class="container">
        <div class="header">
          ${task.title}
        </div>
        <div class="content">
          <p>${task.description}</p>
          <p class="date-time">Date & Time: ${localDateTime}</p>
        </div>
        <div>
        <p>Priority: ${task.priority}</p>
        </div>
        <div class="buttons">
          <a href="http://localhost:8100" class="postpone">Postpone</a>
          <a href="http://localhost:8100" class="prepone">Prepone</a>
          <a href="http://localhost:8100" class="delete">Delete</a>
        </div>
      </div>
      </body>
      </html>
        `
      await sendEmail(task.email, `Kind Reminder for task- ${task.title}`, template, `This is the kind reminder for your task!`);
      });
      scheduledJobs[task.id].push(job);
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