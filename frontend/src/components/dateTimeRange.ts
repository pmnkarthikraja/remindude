import { endOfMonth, endOfWeek, isSameDay, isWithinInterval, startOfMonth, startOfTomorrow, startOfWeek, startOfYesterday } from 'date-fns';
import { TaskRequestData } from './task';




const isToday = (date: Date) => isSameDay(date, new Date());
const isYesterday = (date: Date) => isSameDay(date, startOfYesterday());
const isTomorrow = (date: Date) => isSameDay(date, startOfTomorrow());
const isThisWeek = (date: Date) => isWithinInterval(date, { start: startOfWeek(new Date()), end: endOfWeek(new Date()) });
const isThisMonth = (date: Date) => isWithinInterval(date, { start: startOfMonth(new Date()), end: endOfMonth(new Date()) });



const isDateToday = (date: Date) => isToday(date);
const isDateYesterday = (date: Date) => isYesterday(date);
const isDateTomorrow = (date: Date) => isTomorrow(date);
const isDateThisWeek = (date: Date) => isThisWeek(date);
const isDateThisMonth = (date: Date) => isThisMonth(date);

// export const filterTasks = (tasks: TaskRequestData[], filters: any): TaskRequestData[] => {
//     const today = new Date();
//     const startOfToday = startOfDay(today);
//     const startOfTomorrow = addDays(startOfToday, 1);
//     const startOfYesterday = subDays(startOfToday, 1);
//     const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Assuming week starts on Monday
//     const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
//     const startOfThisMonth = startOfMonth(today);
//     const endOfThisMonth = endOfMonth(today);
  
//     return tasks.filter(task => {
//       const taskDate = new Date(task.dateTime);
      
//       if (filters.isTodayTaskPage && isToday(taskDate)) return true;
//       if (filters.isYesterdayTaskPage && isYesterday(taskDate)) return true;
//       if (filters.isTomorrowTaskPage && isTomorrow(taskDate)) return true;
//       if (filters.isWeeklyTaskPage && isThisWeek(taskDate)) return true;
//       if (filters.isMonthlyTaskPage && isThisMonth(taskDate)) return true;
//       if (filters.isCalenderRangeTaskPage && isWithinInterval(taskDate, { start: filters.startDate, end: filters.endDate })) return true;
//       if (filters.isAllTaskPage) return true;
      
//       return false;
//     });
//   };
  

export const filterTasks = (tasks: TaskRequestData[], pageNav: any, startDate?: Date, endDate?: Date): TaskRequestData[] => {
    const today = new Date();  
    return tasks.filter(task => {
      const taskDate = new Date(task.dateTime);
      if (pageNav.isTodayTaskPage && isDateToday(taskDate)) {
        return true;}
      if (pageNav.isYesterdayTaskPage && isDateYesterday(taskDate)) return true;
      if (pageNav.isTomorrowTaskPage && isDateTomorrow(taskDate)) return true;
      if (pageNav.isWeeklyTaskPage && isDateThisWeek(taskDate)) return true;
      if (pageNav.isMonthlyTaskPage && isDateThisMonth(taskDate)) return true;
      if (pageNav.isCalenderRangeTaskPage && startDate && endDate && taskDate >= startDate && taskDate <= endDate) return true;
      if (pageNav.isAllTaskPage) return true;
      return false;
    });
  };