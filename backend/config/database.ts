import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { startServer,checkIsServerStarted } from '../server';
import { checkAndRefreshDatabase, cleanupTasks, pollAndReschedule, startPolling } from '../utils/helper';

dotenv.config();

const connectDBwithRetry = async (): Promise<void> => {
    try {
      await mongoose.connect(process.env.MONGO_URI as string);
      if (!checkIsServerStarted()) {
        startServer();
      }
      console.log('MongoDB connected successfully');
      if (checkIsServerStarted()==false){
        await cleanupTasks()
        await checkAndRefreshDatabase();
        // reschedule all the upcoming tasks upon restart
        await startPolling();
      }
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      setTimeout(connectDBwithRetry, 5000)
    }
  };

  //handling mongoose connection error
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  
  //try to connect with db once it gets disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('Lost MongoDB connection. Attempting to reconnect...');
    connectDBwithRetry();
  });

  connectDBwithRetry()

  export default connectDBwithRetry