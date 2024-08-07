import connectDBwithRetry from './config/database';

// global error handling to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// call the function to connect to the DB and then start the server
connectDBwithRetry();