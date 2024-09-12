import { TaskModel } from "../models/TaskModel";

const formatTimeWithZone = (date: Date, timeZone: string) => {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: timeZone,
        timeZoneName: 'short'
    }).format(date)
}

function calculateTimeLeft(targetDate: string) {
    const now = new Date();
    const target = new Date(targetDate);
    const timeDiff = target.getTime() - now.getTime()

    if (timeDiff <= 0) {
        return "The time has passed";
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0) result += `${seconds}s`;

    return result.trim() || "Less than a second left";
}


export const createTemplateHTMLContent = (task: TaskModel, isUpdate: boolean,currentUserName:string|undefined) => {
    const BASE_URL=process.env.NODE_ENV==='production' ? "https://remindude-backend.onrender.com" :  "http://localhost:4000"

    const formattedTime = formatTimeWithZone(new Date(task.dateTime), task.localTimezone)
    const inProgressLink = `${BASE_URL}/update-task/${task.email}/${task.id}/InProgress`;
    const doneLink = `${BASE_URL}/update-task/${task.email}/${task.id}/Done`;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${task.eventType} has successfully ${isUpdate ? 'Updated' : 'Created'}!</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
            }
            .header h1 {
                color: #007bff;
            }
            .content {
                margin-bottom: 20px;
            }
            .content p {
                margin: 0;
                font-size: 16px;
            }
            .content .type {
                font-weight: bold;
                color: #007bff;
            }
            .content .title {
                font-weight: bold;
                color: #007bff;
            }
            .priority {
                padding: 10px;
                border-radius: 4px;
                color: #fff;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 20px;
            }
            .urgent {
                background-color: #dc3545; /* Red for urgent */
            }
            .moderate {
                background-color: #ffc107; /* Yellow for moderate */
            }
            .normal {
                background-color: #28a745; /* Green for normal */
            }
            .footer {
                text-align: center;
            }
            .footer button {
                background-color: #007bff;
                color: #fff;
                border: none;
                padding: 10px 20px;
                margin: 5px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                transition: background-color 0.3s;
            }
            .footer button.set-in-progress {
                background-color: #ffc107;
            }
            .footer button.done {
                background-color: #28a745;
            }
            .footer button:hover {
                background-color: #0056b3;
            }
            .footer button.set-in-progress:hover {
                background-color: #e0a800;
            }
            .footer button.done:hover {
                background-color: #218838;
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
            .inprogress {
                background-color: #ffc107;
            }
            .done {
                background-color: #28a745;
            }
            .emailnotification{
                margin-top:10px;
            }
        </style>
        </head>
        <body>
        <div class="container">
            <h1>Hello, ${currentUserName}</h1>
        
            <div class="header">
                <h1>${task.eventType} ${isUpdate ? 'Updated' : 'Created'} Successfully!</h1>
            </div>
            <div class="content">
                <p><span class="type">Type: </span>${task.eventType}</p>
                <p><span class="title">Title: </span>${task.title}</p>
                <p><span class="type">Scheduled At: </span>${new Date(task.dateTime).toLocaleDateString()} and ${formattedTime} (${task.localTimezone})</p>
            </div>
                <div class="priority ${task.priority.toLowerCase()}">
                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </div>
            <div class="footer">
                <div class="buttons">
          <a href="${inProgressLink}" class="inprogress">InProgress</a>
          <a href="${doneLink}" class="done">Done</a>
        </div>

  <p>If you would like to postpone or prepone this task, please select a new date and time:</p>

  <form action="${BASE_URL}/update-task-via-email/${task.email}/${task.id}" method="POST" onsubmit="return combineDateTimeWithTimezone()">
    <label for="newDate">Select new date:</label><br>
    <input type="date" id="newDate" name="newDate" required><br><br>

    <label for="newTime">Select new time:</label><br>
    <input type="time" id="newTime" name="newTime" required><br><br>

    <input type="hidden" id="taskId" name="taskId" value="${task.id}">
    <input type="hidden" id="localTimezone" name="localTimezone" value="${task.localTimezone}">
    <input type="hidden" id="combinedDateTime" name="combinedDateTime">

    <button type="submit">Update Task</button>
  </form>

  <p>If forms are not supported, <a href="${BASE_URL}/update-task-via-email/${task.email}/${task.id}">click here to reschedule the task</a>.</p>

  <p class="emailnotification">Turn off email notification for this task: <a href="${BASE_URL}/update-task-via-email/${task.email}/${task.id}/turn-off-email-notification">Click Here</a></p>

  <p>Best regards,<br> Datasack Solutions</p>
            </div>
        </div>
    </body>
    </html>
`}

export const reminderTemplateHTMLContent = (task: TaskModel,currentUsername:string|undefined) => {
    const BASE_URL=process.env.NODE_ENV==='production' ? "https://remindude-backend.onrender.com" :  "http://localhost:4000"
    const inProgressLink = `${BASE_URL}/update-task/${task.email}/${task.id}/InProgress`;
    const doneLink = `${BASE_URL}/update-task/${task.email}/${task.id}/Done`;
    console.log("task date time on reminder:",task.dateTime)
    // const formattedTime = formatTimeWithZone(new Date(task.dateTime), task.localTimezone)

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reminder: Task/Meeting Scheduled</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.5;
        }
        .content p {
            margin: 5px 0;
        }
        .time-left {
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
            margin: 15px 0;
        }
        .action-buttons {
            text-align: center;
            margin-top: 20px;
        }
        .action-buttons a {
            text-decoration: none;
            padding: 10px 15px;
            margin: 5px;
            color: #fff;
            border-radius: 5px;
            font-size: 16px;
            display: inline-block;
        }
        .postpone {
            background-color: #007bff;
        }
        .prepone {
            background-color: #28a745;
        }
        .delete {
            background-color: #dc3545;
        }
             .footer {
            text-align: center;
        }
        .footer button {
            background-color: #007bff;
            color: #fff;
            border: none;
            padding: 10px 20px;
            margin: 5px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        .footer button.set-in-progress {
            background-color: #ffc107;
        }
        .footer button.done {
            background-color: #28a745;
        }
        .footer button:hover {
            background-color: #0056b3;
        }
        .footer button.set-in-progress:hover {
            background-color: #e0a800;
        }
        .footer button.done:hover {
            background-color: #218838;
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
        .inprogress {
            background-color: #ffc107;
        }
        .done {
            background-color: #28a745;
        }
    </style>
</head>
<body>
    <div class="container">
     <h1>Hello, ${currentUsername}</h1>
        <div class="header">
            Reminder: ${task.title}
        </div>
        <div class="content">
            <p><strong>Description: </strong>${task.description}</p>
            <p><strong>Date & Time: </strong>${new Date(task.dateTime).toLocaleDateString()} and ${task.dateTime} (${task.localTimezone})</p>
            <p class="time-left">In ${calculateTimeLeft(task.dateTime)}</p>
        </div>
        <div class="footer">
           <div class="buttons">
          <a href="${inProgressLink}" class="inprogress">InProgress</a>
          <a href="${doneLink}" class="done">Done</a>
        </div>
         <p>If you would like to postpone or prepone this task, please select a new date and time:</p>

  <form action="${BASE_URL}/update-task-via-email/${task.email}/${task.id}" method="POST" onsubmit="return combineDateTimeWithTimezone()">
    <label for="newDate">Select new date:</label><br>
    <input type="date" id="newDate" name="newDate" required><br><br>

    <label for="newTime">Select new time:</label><br>
    <input type="time" id="newTime" name="newTime" required><br><br>

    <input type="hidden" id="taskId" name="taskId" value="${task.id}">
    <input type="hidden" id="localTimezone" name="localTimezone" value="${task.localTimezone}">
    <input type="hidden" id="combinedDateTime" name="combinedDateTime">

    <button type="submit">Update Task</button>
  </form>

  <p>If forms are not supported, <a href="${BASE_URL}/update-task-via-email/${task.email}/${task.id}">click here to reschedule the task</a>.</p>

  <p class="emailnotification">Turn off email notification for this task: <a href="${BASE_URL}/update-task-via-email/${task.email}/${task.id}/turn-off-email-notification">Click Here</a></p>

  <p>Best regards,<br> Datasack Solutions</p>
        </div>
    </div>
</body>
</html>
`}


export const accountVerificationHTMLTemplate = (userName: string, otp: number) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            text-align: center;
            padding: 20px;
            background-color: #007bff;
            color: #ffffff;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }

        .email-content {
            margin: 20px 0;
            text-align: center;
        }

        .email-content h1 {
            color: #333333;
        }

        .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin: 20px 0;
        }

        .email-footer {
            text-align: center;
            color: #777777;
            font-size: 12px;
            margin-top: 30px;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Email Verification</h1>
        </div>

        <div class="email-content">
            <h1>Hello, ${userName}</h1>
            <p>Thank you for registering with us. Please use the following OTP to verify your email address:</p>
            <div class="otp-code">${otp}</div>
            <p>If you did not request this, please ignore this email.</p>
        </div>

        <div class="email-footer">
            <p>&copy; 2024 Datasack Solutions. All rights reserved.</p>
        </div>
    </div>
</body>

</html>
`

export const forgotPasswordHTMLTemplate = (otp: number,currentUsername:string|undefined) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            text-align: center;
            padding: 20px;
            background-color: #007bff;
            color: #ffffff;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }

        .email-content {
            margin: 20px 0;
            text-align: center;
        }

        .email-content h1 {
            color: #333333;
        }

        .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin: 20px 0;
        }

        .email-footer {
            text-align: center;
            color: #777777;
            font-size: 12px;
            margin-top: 30px;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Password Reset Request</h1>
        </div>

        <div class="email-content">
            <h1>Hello, ${currentUsername}</h1>
            <h1>Reset Your Password</h1>
            <p>We received a request to reset your password. Please use the following OTP to proceed:</p>
            <div class="otp-code">${otp}</div>
            <p>If you did not request this, please ignore this email or contact support.</p>
        </div>

        <div class="email-footer">
            <p>&copy; 2024 Datasack Solutions. All rights reserved.</p>
        </div>
    </div>
</body>

</html>

`

export const taskUpdatedWith404 = `
        <html>
          <body>
            <h1>😔 Task Not Found</h1>
            <p>We couldn't find the task you were trying to update. Please make sure the task or meeting exist and try again.</p>
          </body>
        </html>
`

export const taskUpdatedWithMissingFields = `
        <html>
          <body>
            <h1>😕 Missing Information</h1>
            <p>It looks like some information is missing. Please provide both date and time, and try again.</p>
          </body>
        </html>
`

export const taskUpdatedWithTimeElapsed =`
        <html>
          <body>
            <h1>🚫 Task Update Failed</h1>
            <p>Sorry, but you cannot schedule a task for a past date. Please choose a future date and time.</p>
          </body>
        </html>
`

export const taskUpdatedWithSuccess =`
     <html>
        <body>
          <h1>✅ Task Updated Successfully</h1>
          <p>Your task has been updated to the new date and time. Thank you for your patience!</p>
        </body>
      </html>
`

export const taskUpdatedWithDisableEmailNotification =`
     <html>
        <body>
          <h1>✅ Email Notification has stopped for this task</h1>
          <p>Your task has been updated with disable email notification. Thank you for your patience!</p>
        </body>
      </html>
`

export const taskUpdatedWithInternalErr =`
    <html>
        <body>
          <h1>😔 Something Went Wrong</h1>
          <p>Oops! Something went wrong while updating the task. Please try again later.</p>
        </body>
      </html>   
`