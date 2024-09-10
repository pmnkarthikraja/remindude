import { GoogleUser } from "../view/googleUser";
import axios from 'axios'
import CalenderHolidayModel from '../models/HolidayModel'; // Adjust path as needed
import schedule from 'node-schedule'
import HolidayDataModel from "../models/HolidayModel";
import TaskModel from "../models/TaskModel";
import UserModel from "../models/UserModel";
import taskRepo from '../repo/taskRepo'
import { cancelScheduledNotifications, scheduleNotifications } from "./sendEmail";

// const formatTimeWithZone = (date: Date, timeZone: string) => {
//   return new Intl.DateTimeFormat('en-US', {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//     hour12: true,
//     timeZone: timeZone,
//     timeZoneName: 'short'
//   }).format(date);
// };

// const convertToLocalTime = (dates: string[], timeZone: string) => {
//   return dates.map(dateStr => {
//     const date = new Date(dateStr);
//     return formatTimeWithZone(date, timeZone); 
//   });
// };


export const getRemainingTime = (dateTime: string): number => {
  const now = new Date().getTime();
  const targetTime = new Date(dateTime).getTime();
  return targetTime - now;
};

export async function getUserInfo(accessToken: string): Promise<GoogleUser> {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('failed to fetch user info');
  }
}

export interface CalenderHoliday{
  name:string,
  description:string,
  country:{
      id:string,
      name:string,
  },
  date:{
      iso:string,
      datetime:{
          year:string,
          month:string,
          day:string
      }
  },
  type:[string],
  urlid:string,
  primary_type:string
}

// function to get the previous, current, and next 2 years
const getYears = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
};


//into the db
const API_KEY = process.env.CALENDARIFIC_API_KEY;


const refreshHolidays = async (): Promise<void> => {
  try {
      const countries = ['IN', 'SA'];
      const years = getYears();

      for (const country of countries) {
          for (const year of years) {
              try {
                  const response = await axios.get('https://calendarific.com/api/v2/holidays', {
                      params: {
                          api_key: API_KEY,
                          country,
                          year
                      }
                  });

                  const holidays: CalenderHoliday[] = response.data.response.holidays;

                  // update or create the document in the database
                  await CalenderHolidayModel.findOneAndUpdate(
                      { country, year },
                      { holidays },
                      { upsert: true, new: true, setDefaultsOnInsert: true }
                  );

                  console.log(`Holiday data for ${country}-${year} has been updated.`);
              } catch (error) {
                  console.error(`Error fetching or updating holidays for ${country}-${year}:`, error);
              }
          }
      }
  } catch (error) {
      console.error('Error refreshing holidays:', error);
  }
};

export const checkAndRefreshDatabase = async (): Promise<void> => {
  try {
    const countries = ['IN', 'SA'];
    const years = getYears();

    let allRecordsExist = true;

    for (const country of countries) {
        for (const year of years) {
            // check if there's an existing record for the given country and year
            const record = await HolidayDataModel.findOne({ country, year }).exec();

            if (!record) {
                console.log(`No records found for ${country}-${year}`);
                allRecordsExist = false;
            }
        }
    }

    if (!allRecordsExist) {
        console.log('Holiday database does not have records for all specified countries and years. Refreshing holidays...');
        await refreshHolidays();
    } else {
        console.log('Holiday database has sufficient records.');
    }
  } catch (error) {
      console.error('Error checking and refreshing database:', error);
  }
};


schedule.scheduleJob('0 0 */4 * *', async () => { //this means, 0 minute, 0 hour, */4 every 4 days, * all month, * all year
  console.log('Running scheduled task to refresh holiday data (every 4 days)');
  await refreshHolidays();
});


// cleanup tasks, if user not exists

export async function cleanupTasks() {
  try {
      const tasks = await TaskModel.find();

      for (const task of tasks) {
          const userExists = await UserModel.exists({ email: task.email });

          if (!userExists) {
              await TaskModel.deleteOne({ id:task.id,email:task.email });
              await cancelScheduledNotifications(task.id)
              console.log(`Deleted task with ID: ${task._id}`);
          }
      }
  } catch (error) {
      console.error('Error during task cleanup:', error);
  }
}

export const pollAndReschedule = async () => {
  try {
    console.log('Polling for tasks to reschedule...');

    const { tasks} = await taskRepo.GetRawAllTasks(); 

    tasks.forEach(async (task) => {
      const remainingTime = getRemainingTime(task.dateTime);
      if (remainingTime > 0) {
        if (task.emailNotification){
          await scheduleNotifications(task);
        }
      }
    });

    console.log('Rescheduling completed.');
  } catch (error) {
    console.error('Error during polling and rescheduling:', error);
  }
};

const POLL_INTERVAL = 15 * 60 * 1000;

export const startPolling = async () => {
  await pollAndReschedule();
  setInterval(pollAndReschedule, POLL_INTERVAL);
};

//health check for the server is alive or not.
const pingInterval = 1 * 30 * 1000; 
const BASE_URL=process.env.NODE_ENV==='production' ? "https://remindude-backend.onrender.com/health" :  "http://localhost:4000/health"

setInterval(async () => {
  try {
    await axios.get(BASE_URL);
    console.log('Ping successful!');
  } catch (error) {
    console.error('Error pinging the server:', error);
  }
}, pingInterval);




// const formatDateInTimezone = (date: Date, timeZone: string) => {
//   return new Intl.DateTimeFormat('en-US', {
//     timeZone,
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//     hour12: true,
//   }).format(date);
// };

// export const getNotificationSchedule = (taskDateTime: Date, reminderInterval: number | null, timeZone: string): Date[] => {
//   const now = new Date();
//   const taskDate = new Date(taskDateTime);
//   const taskDayStart = new Date(taskDate);
//   taskDayStart.setHours(0, 0, 0, 0);
//   const taskDayEnd = new Date(taskDayStart);
//   taskDayEnd.setHours(23, 59, 59, 999);

//   const timeToTask = taskDate.getTime() - now.getTime();
//   const notifications: Date[] = [];

//   const millisecondsInAnHour = 3600000;
//   const millisecondsInADay = 86400000;

//   // Convert the current time to the target timezone
//   const nowInTargetTimezone = new Date(formatDateInTimezone(now, timeZone));
//   const taskDateInTargetTimezone = new Date(formatDateInTimezone(taskDate, timeZone));

//   if (timeToTask > 0) {
//     if (timeToTask <= millisecondsInADay) {
//       const threeHoursBefore = new Date(taskDateInTargetTimezone.getTime() - 3 * millisecondsInAnHour);
//       const oneHourBefore = new Date(taskDateInTargetTimezone.getTime() - millisecondsInAnHour);
//       const fifteenMinutesBefore = new Date(taskDateInTargetTimezone.getTime() - 15 * 60000);

//       if (threeHoursBefore > nowInTargetTimezone) notifications.push(threeHoursBefore);
//       if (oneHourBefore > nowInTargetTimezone) notifications.push(oneHourBefore);
//       if (fifteenMinutesBefore > nowInTargetTimezone) notifications.push(fifteenMinutesBefore);
//     }
//     // For medium tasks - within a week
//     else if (timeToTask <= 7 * millisecondsInADay) {
//       const twoDaysBefore = new Date(taskDateInTargetTimezone.getTime() - 2 * millisecondsInADay);
//       const oneDayBefore = new Date(taskDateInTargetTimezone.getTime() - millisecondsInADay);
//       const threeHoursBefore = new Date(taskDateInTargetTimezone.getTime() - 3 * millisecondsInAnHour);
//       const oneHourBefore = new Date(taskDateInTargetTimezone.getTime() - millisecondsInAnHour);
//       const fifteenMinutesBefore = new Date(taskDateInTargetTimezone.getTime() - 15 * 60000);

//       if (twoDaysBefore > nowInTargetTimezone) notifications.push(twoDaysBefore);
//       if (oneDayBefore > nowInTargetTimezone) notifications.push(oneDayBefore);
//       if (threeHoursBefore > nowInTargetTimezone) notifications.push(threeHoursBefore);
//       if (oneHourBefore > nowInTargetTimezone) notifications.push(oneHourBefore);
//       if (fifteenMinutesBefore > nowInTargetTimezone) notifications.push(fifteenMinutesBefore);
//     }
//     // For long-term tasks - within a month
//     else if (timeToTask <= 30 * millisecondsInADay) {
//       const oneWeekBefore = new Date(taskDateInTargetTimezone.getTime() - 7 * millisecondsInADay);
//       const twoDaysBefore = new Date(taskDateInTargetTimezone.getTime() - 2 * millisecondsInADay);
//       const oneDayBefore = new Date(taskDateInTargetTimezone.getTime() - millisecondsInADay);
//       const threeHoursBefore = new Date(taskDateInTargetTimezone.getTime() - 3 * millisecondsInAnHour);
//       const oneHourBefore = new Date(taskDateInTargetTimezone.getTime() - millisecondsInAnHour);
//       const fifteenMinutesBefore = new Date(taskDateInTargetTimezone.getTime() - 15 * 60000);

//       if (oneWeekBefore > nowInTargetTimezone) notifications.push(oneWeekBefore);
//       if (twoDaysBefore > nowInTargetTimezone) notifications.push(twoDaysBefore);
//       if (oneDayBefore > nowInTargetTimezone) notifications.push(oneDayBefore);
//       if (threeHoursBefore > nowInTargetTimezone) notifications.push(threeHoursBefore);
//       if (oneHourBefore > nowInTargetTimezone) notifications.push(oneHourBefore);
//       if (fifteenMinutesBefore > nowInTargetTimezone) notifications.push(fifteenMinutesBefore);
//     }
//     // For more than a month
//     else {
//       const oneMonthBefore = new Date(taskDateInTargetTimezone.getTime() - 30 * millisecondsInADay);
//       const twoWeeksBefore = new Date(taskDateInTargetTimezone.getTime() - 14 * millisecondsInADay);
//       const oneWeekBefore = new Date(taskDateInTargetTimezone.getTime() - 7 * millisecondsInADay);
//       const twoDaysBefore = new Date(taskDateInTargetTimezone.getTime() - 2 * millisecondsInADay);
//       const oneDayBefore = new Date(taskDateInTargetTimezone.getTime() - millisecondsInADay);
//       const threeHoursBefore = new Date(taskDateInTargetTimezone.getTime() - 3 * millisecondsInAnHour);
//       const oneHourBefore = new Date(taskDateInTargetTimezone.getTime() - millisecondsInAnHour);
//       const fifteenMinutesBefore = new Date(taskDateInTargetTimezone.getTime() - 15 * 60000);

//       if (oneMonthBefore > nowInTargetTimezone) notifications.push(oneMonthBefore);
//       if (twoWeeksBefore > nowInTargetTimezone) notifications.push(twoWeeksBefore);
//       if (oneWeekBefore > nowInTargetTimezone) notifications.push(oneWeekBefore);
//       if (twoDaysBefore > nowInTargetTimezone) notifications.push(twoDaysBefore);
//       if (oneDayBefore > nowInTargetTimezone) notifications.push(oneDayBefore);
//       if (threeHoursBefore > nowInTargetTimezone) notifications.push(threeHoursBefore);
//       if (oneHourBefore > nowInTargetTimezone) notifications.push(oneHourBefore);
//       if (fifteenMinutesBefore > nowInTargetTimezone) notifications.push(fifteenMinutesBefore);
//     }
//   }

//   // On the day of the task, notify every hour or two or three, based on user choice
//   if (reminderInterval) {
//     let reminderTime = new Date(taskDayStart);
//     reminderTime.setHours(0, 0, 0, 0);

//     while (reminderTime < taskDate) {
//       reminderTime = new Date(reminderTime.getTime() + reminderInterval * millisecondsInAnHour);
//       if (reminderTime < taskDate && reminderTime > nowInTargetTimezone) {
//         notifications.push(reminderTime);
//       }
//     }
//   }

//   return notifications;
// }


const getLocalDateInTimezone = (date: Date, timeZone: string): Date => {
  const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;
  const hour = parts.find(part => part.type === 'hour')?.value;
  const minute = parts.find(part => part.type === 'minute')?.value;
  const second = parts.find(part => part.type === 'second')?.value;

  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
};

export function getNotificationSchedule(taskDateTime: Date, reminderInterval: number | null, timeZone: string): Date[] {
  const now = new Date();
  const taskDate = taskDateTime;
  const taskDayStart = new Date(taskDate);
  taskDayStart.setHours(0, 0, 0, 0); 
  const taskDayEnd = new Date(taskDayStart);
  taskDayEnd.setHours(23, 59, 59, 999);

  const timeToTask = taskDate.getTime() - now.getTime();
  const notifications: Date[] = [];

  const millisecondsInAnHour = 3600000; 
  const millisecondsInADay = 86400000;

  if (timeToTask > 0) {
      if (timeToTask <= millisecondsInADay) {
          const threeHoursBefore = new Date(taskDate.getTime() - 3 * millisecondsInAnHour);
          const oneHourBefore = new Date(taskDate.getTime() - millisecondsInAnHour);
          const fifteenMinutesBefore = new Date(taskDate.getTime() - 15 * 60000);

          if (threeHoursBefore > now) notifications.push(getLocalDateInTimezone(threeHoursBefore, timeZone));
          if (oneHourBefore > now) notifications.push(getLocalDateInTimezone(oneHourBefore, timeZone));
          if (fifteenMinutesBefore > now) notifications.push(getLocalDateInTimezone(fifteenMinutesBefore, timeZone));
      } 
      else if (timeToTask <= 7 * millisecondsInADay) {
          const twoDaysBefore = new Date(taskDate.getTime() - 2 * millisecondsInADay);
          const oneDayBefore = new Date(taskDate.getTime() - millisecondsInADay);
          const threeHoursBefore = new Date(taskDate.getTime() - 3 * millisecondsInAnHour);
          const oneHourBefore = new Date(taskDate.getTime() - millisecondsInAnHour);
          const fifteenMinutesBefore = new Date(taskDate.getTime() - 15 * 60000);

          if (twoDaysBefore > now) notifications.push(getLocalDateInTimezone(twoDaysBefore, timeZone));
          if (oneDayBefore > now) notifications.push(getLocalDateInTimezone(oneDayBefore, timeZone));
          if (threeHoursBefore > now) notifications.push(getLocalDateInTimezone(threeHoursBefore, timeZone));
          if (oneHourBefore > now) notifications.push(getLocalDateInTimezone(oneHourBefore, timeZone));
          if (fifteenMinutesBefore > now) notifications.push(getLocalDateInTimezone(fifteenMinutesBefore, timeZone));
      } 
      else if (timeToTask <= 30 * millisecondsInADay) {
          const oneWeekBefore = new Date(taskDate.getTime() - 7 * millisecondsInADay);
          const twoDaysBefore = new Date(taskDate.getTime() - 2 * millisecondsInADay);
          const oneDayBefore = new Date(taskDate.getTime() - millisecondsInADay);
          const threeHoursBefore = new Date(taskDate.getTime() - 3 * millisecondsInAnHour);
          const oneHourBefore = new Date(taskDate.getTime() - millisecondsInAnHour);
          const fifteenMinutesBefore = new Date(taskDate.getTime() - 15 * 60000);

          if (oneWeekBefore > now) notifications.push(getLocalDateInTimezone(oneWeekBefore, timeZone));
          if (twoDaysBefore > now) notifications.push(getLocalDateInTimezone(twoDaysBefore, timeZone));
          if (oneDayBefore > now) notifications.push(getLocalDateInTimezone(oneDayBefore, timeZone));
          if (threeHoursBefore > now) notifications.push(getLocalDateInTimezone(threeHoursBefore, timeZone));
          if (oneHourBefore > now) notifications.push(getLocalDateInTimezone(oneHourBefore, timeZone));
          if (fifteenMinutesBefore > now) notifications.push(getLocalDateInTimezone(fifteenMinutesBefore, timeZone));
      } 
      else {
          const oneMonthBefore = new Date(taskDate.getTime() - 30 * millisecondsInADay);
          const twoWeeksBefore = new Date(taskDate.getTime() - 14 * millisecondsInADay);
          const oneWeekBefore = new Date(taskDate.getTime() - 7 * millisecondsInADay);
          const twoDaysBefore = new Date(taskDate.getTime() - 2 * millisecondsInADay);
          const oneDayBefore = new Date(taskDate.getTime() - millisecondsInADay);
          const threeHoursBefore = new Date(taskDate.getTime() - 3 * millisecondsInAnHour);
          const oneHourBefore = new Date(taskDate.getTime() - millisecondsInAnHour);
          const fifteenMinutesBefore = new Date(taskDate.getTime() - 15 * 60000);

          if (oneMonthBefore > now) notifications.push(getLocalDateInTimezone(oneMonthBefore, timeZone));
          if (twoWeeksBefore > now) notifications.push(getLocalDateInTimezone(twoWeeksBefore, timeZone));
          if (oneWeekBefore > now) notifications.push(getLocalDateInTimezone(oneWeekBefore, timeZone));
          if (twoDaysBefore > now) notifications.push(getLocalDateInTimezone(twoDaysBefore, timeZone));
          if (oneDayBefore > now) notifications.push(getLocalDateInTimezone(oneDayBefore, timeZone));
          if (threeHoursBefore > now) notifications.push(getLocalDateInTimezone(threeHoursBefore, timeZone));
          if (oneHourBefore > now) notifications.push(getLocalDateInTimezone(oneHourBefore, timeZone));
          if (fifteenMinutesBefore > now) notifications.push(getLocalDateInTimezone(fifteenMinutesBefore, timeZone));
      }
  }

  if (reminderInterval) {
      let reminderTime = new Date(taskDayStart);
      reminderTime.setHours(0, 0, 0, 0); 

      while (reminderTime < taskDate) {
          reminderTime = new Date(reminderTime.getTime() + reminderInterval * millisecondsInAnHour);
          if (reminderTime < taskDate && reminderTime > now) {
              notifications.push(getLocalDateInTimezone(reminderTime, timeZone));
          }
      }
  }

  return notifications;
}
