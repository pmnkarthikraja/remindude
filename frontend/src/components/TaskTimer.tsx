import { IonCol, IonNote, isPlatform } from '@ionic/react';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { TaskRequestData } from './task';

const TaskTimer: FunctionComponent<{ task: TaskRequestData }> = ({ task }) => {
    const [timeLeft, setTimeLeft] = useState<string>('00h 00m 00s');
    const [isTaskOverdue, setIsTaskOverdue] = useState<boolean>(false);
 
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const taskDate = new Date(task.dateTime);

            const difference = taskDate.getTime() - now.getTime();
            const today = now.toLocaleDateString();
            const taskDateString = taskDate.toLocaleDateString();

            if (difference > 0) {
                // Task is in the future
                if (today === taskDateString) {
                    // Task is due today
                    const hours = Math.floor(difference / (1000 * 60 * 60));
                    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                    setTimeLeft(`in ${hours}h ${minutes}m ${seconds}s ...`);
                    setIsTaskOverdue(false);
                } else {
                    // Task is in the future but not today
                    setTimeLeft('');
                    setIsTaskOverdue(false);
                }
            } else {
                // Task is overdue or expired
                if (today === taskDateString) {
                    // Task was due today but time has lapsed
                    setTimeLeft('Task overdue! Postpone or remove it.');
                    setIsTaskOverdue(true);
                } else {
                    // Task is from yesterday or earlier
                    setTimeLeft('Task expired! Reset.');
                    setIsTaskOverdue(true);
                }
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [task.dateTime]);

    return <IonCol size='auto' style={{marginLeft:'18px'}}>
            <IonNote style={{ fontSize: '15px', marginTop: '10px', color:isTaskOverdue ? 'red':''}}>
                {timeLeft}
            </IonNote>
        </IonCol>
};

export default TaskTimer
