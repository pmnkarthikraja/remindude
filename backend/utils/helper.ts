import { GoogleUser } from "../view/googleUser";
import axios from 'axios'
import CalenderHolidayModel from '../models/HolidayModel'; // Adjust path as needed
import schedule from 'node-schedule'
import HolidayDataModel from "../models/HolidayModel";
import TaskModel from "../models/TaskModel";
import UserModel from "../models/UserModel";
import taskRepo from '../repo/taskRepo'
import { cancelScheduledNotifications, scheduleNotifications } from "./sendEmail";


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

    tasks.forEach((task) => {
      const remainingTime = getRemainingTime(task.dateTime);
      if (remainingTime > 0) {
        if (task.emailNotification){
          scheduleNotifications(task);
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