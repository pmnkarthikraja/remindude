//To process the task date:

//    For Short-Term Tasks (within a day)
// Notify 3 hours before the task.
// Notify 1 hour before the task.
// Notify 15 minutes before the task.
//    For Medium-Term Tasks (within a week)
// Notify 2 days before the task.
// Notify 1 day before the task.
// Notify 3 hours before the task.
// Notify 1 hour before the task.
// Notify 15 minutes before the task.
//    For Long-Term Tasks (within a month)
// Notify 1 week before the task.
// Notify 2 days before the task.
// Notify 1 day before the task.
// Notify 3 hours before the task.
// Notify 1 hour before the task.
// Notify 15 minutes before the task.
//    For Very Long-Term Tasks (more than a month)
// Notify 1 month before the task.
// Notify 2 weeks before the task.
// Notify 1 week before the task.
// Notify 2 days before the task.
// Notify 1 day before the task.
// Notify 3 hours before the task.
// Notify 1 hour before the task.
// Notify 15 minutes before the task.


export function getNotificationSchedule(taskDateTime: Date, reminderInterval: number | null): Date[] {
    const now = new Date();
    const taskDate = taskDateTime
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

            if (threeHoursBefore > now) notifications.push(threeHoursBefore);
            if (oneHourBefore > now) notifications.push(oneHourBefore);
            if (fifteenMinutesBefore > now) notifications.push(fifteenMinutesBefore);
        }
        // for medium task - for a week
        else if (timeToTask <= 7 * millisecondsInADay) {
            const twoDaysBefore = new Date(taskDate.getTime() - 2 * millisecondsInADay);
            const oneDayBefore = new Date(taskDate.getTime() - millisecondsInADay);
            const threeHoursBefore = new Date(taskDate.getTime() - 3 * millisecondsInAnHour);
            const oneHourBefore = new Date(taskDate.getTime() - millisecondsInAnHour);
            const fifteenMinutesBefore = new Date(taskDate.getTime() - 15 * 60000);

            if (twoDaysBefore > now) notifications.push(twoDaysBefore);
            if (oneDayBefore > now) notifications.push(oneDayBefore);
            if (threeHoursBefore > now) notifications.push(threeHoursBefore);
            if (oneHourBefore > now) notifications.push(oneHourBefore);
            if (fifteenMinutesBefore > now) notifications.push(fifteenMinutesBefore);
        }
        // For long term task - with in a month
        else if (timeToTask <= 30 * millisecondsInADay) {
            const oneWeekBefore = new Date(taskDate.getTime() - 7 * millisecondsInADay);
            const twoDaysBefore = new Date(taskDate.getTime() - 2 * millisecondsInADay);
            const oneDayBefore = new Date(taskDate.getTime() - millisecondsInADay);
            const threeHoursBefore = new Date(taskDate.getTime() - 3 * millisecondsInAnHour);
            const oneHourBefore = new Date(taskDate.getTime() - millisecondsInAnHour);
            const fifteenMinutesBefore = new Date(taskDate.getTime() - 15 * 60000);

            if (oneWeekBefore > now) notifications.push(oneWeekBefore);
            if (twoDaysBefore > now) notifications.push(twoDaysBefore);
            if (oneDayBefore > now) notifications.push(oneDayBefore);
            if (threeHoursBefore > now) notifications.push(threeHoursBefore);
            if (oneHourBefore > now) notifications.push(oneHourBefore);
            if (fifteenMinutesBefore > now) notifications.push(fifteenMinutesBefore);
        }
        // For more than a month
        else {
            const oneMonthBefore = new Date(taskDate.getTime() - 30 * millisecondsInADay);
            const twoWeeksBefore = new Date(taskDate.getTime() - 14 * millisecondsInADay);
            const oneWeekBefore = new Date(taskDate.getTime() - 7 * millisecondsInADay);
            const twoDaysBefore = new Date(taskDate.getTime() - 2 * millisecondsInADay);
            const oneDayBefore = new Date(taskDate.getTime() - millisecondsInADay);
            const threeHoursBefore = new Date(taskDate.getTime() - 3 * millisecondsInAnHour);
            const oneHourBefore = new Date(taskDate.getTime() - millisecondsInAnHour);
            const fifteenMinutesBefore = new Date(taskDate.getTime() - 15 * 60000);

            if (oneMonthBefore > now) notifications.push(oneMonthBefore);
            if (twoWeeksBefore > now) notifications.push(twoWeeksBefore);
            if (oneWeekBefore > now) notifications.push(oneWeekBefore);
            if (twoDaysBefore > now) notifications.push(twoDaysBefore);
            if (oneDayBefore > now) notifications.push(oneDayBefore);
            if (threeHoursBefore > now) notifications.push(threeHoursBefore);
            if (oneHourBefore > now) notifications.push(oneHourBefore);
            if (fifteenMinutesBefore > now) notifications.push(fifteenMinutesBefore);
        }
    }

    // On the day of the task, notify every hour or two or three, based on user choice
    if (reminderInterval) {
        let reminderTime = new Date(taskDayStart);
        reminderTime.setHours(0, 0, 0, 0); 

        while (reminderTime < taskDate) {
            reminderTime = new Date(reminderTime.getTime() + reminderInterval * millisecondsInAnHour);
            if (reminderTime < taskDate && reminderTime > now) {
                notifications.push(reminderTime);
            }
        }
    }
    return notifications;
}

// Example Usage
// const taskDateTime2 = new Date('2024-07-01T15:00:00');
// const reminderInterval2 = 2; // 0 for default, or 1, 2, 3 for hourly, two-hourly, three-hourly reminders
// const notifications2 = getNotificationScheduleCorrect(taskDateTime2, reminderInterval2);
