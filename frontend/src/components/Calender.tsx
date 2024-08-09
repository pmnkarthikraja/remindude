import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonDatetime,
  IonGrid,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonRow
} from '@ionic/react';
import React, { Fragment, FunctionComponent, useState } from 'react';
import { getRemainingTime } from '../pages/HomePage';
import '../styles/calender.css';
import { TaskRequestData } from './task';

const today = new Date()

export interface Calender1Props {
  tasks: TaskRequestData[]
}

const Calender1: FunctionComponent<Calender1Props> = ({
  tasks
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(today.toJSON());

  const notes: { [key: string]: string } = {
    '2024-06-10': 'Meeting with team',
    '2024-06-13': 'Project deadline',
    '2024-06-14': 'Doctor appointment',
    '2024-06-26': 'Meeting with team',
    '2024-06-21': 'Project deadline',
    '2024-06-29': 'Doctor appointment',
  };



  const tasksWithDates: { [key: string]: string[] } = {}

  tasks.map(task => {
    if (task.eventType == 'Meeting') {
      const date = new Date(task.dateTime).toJSON()
      // const formateDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      const formateDate = date.split('T')[0]
      if (tasksWithDates[formateDate] == undefined) {
        tasksWithDates[formateDate] = []
        tasksWithDates[formateDate].push(`${task.title}|${task.dateTime}|${task.checklists?.map(r => r.subtitle).join(',')}`)
        return
      }
      tasksWithDates[formateDate].push(`${task.title}|${task.dateTime}|${task.checklists?.map(r => r.subtitle).join(',')}`)
      return
    }
  })



  const handleDateChange = (e: CustomEvent) => {
    setSelectedDate(e.detail.value);
  };


  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    const dates: JSX.Element[] = [];

    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day + 1);
      const dateString = date.toISOString().split('T')[0];

      if (!!notes[dateString]) {
        dates.push(<IonCol key={day} className={`calendar-day note-day`}>
          <div >{day}</div>
          {notes[dateString] && <div className="note-tiny">{notes[dateString]}</div>}
        </IonCol>
        );
      } else {
        dates.push(<IonCol key={day} className={`calendar-day`}>
          <div >{day}</div>
        </IonCol>
        );
      }
    }

    return (
      <IonGrid>
        <IonRow>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day,index) => (
            <IonCol key={index} className="calendar-header">
              {day}
            </IonCol>
          ))}
        </IonRow>
        <IonRow>{dates}</IonRow>
      </IonGrid>
 
    );
  };

  const styleForPtag = { color: 'green', border: '2px solid black' }
  const isToday = new Date();
  const isYesterday = new Date();
  const isTomorrow = new Date();

  isToday.setHours(0, 0, 0, 0);
  isYesterday.setHours(0, 0, 0, 0);
  isYesterday.setDate(today.getDate() - 1);
  isTomorrow.setHours(0, 0, 0, 0);
  isTomorrow.setDate(today.getDate() + 1);

  return (
      <IonCol size='auto' >
        <IonCard >
          <IonCardContent>
            <IonRow>
              <IonCol sizeXs='12' sizeSm='12' sizeMd='12' sizeLg='6' sizeXl='6'>
                <IonDatetime
                  size='cover'
                  value={selectedDate}
                  presentation="date"
                  onIonChange={handleDateChange}
                ></IonDatetime>
              </IonCol>

              <IonCol sizeXs='12' sizeSm='12' sizeMd='12' sizeLg='6' sizeXl='6' >
                {selectedDate &&
                  <IonCardContent>
                    {(new Date(selectedDate).toDateString() == isToday.toDateString()) && <Fragment>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2><b>Meetings for Today:</b></h2>
                        <IonImg src='/assets/logo3.png' style={{ width: '50px' }} />
                      </div>
                    </Fragment>}

                    {(new Date(selectedDate).toDateString() == isYesterday.toDateString()) && <Fragment>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2><b>Meetings for Yesterday:</b></h2>
                        <IonImg src='/assets/logo3.png' style={{ width: '50px' }} />
                      </div>
                    </Fragment>}

                    {(new Date(selectedDate).toDateString() == isTomorrow.toDateString()) && <Fragment>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2><b>Meetings for Tomorrow:</b></h2>
                        <IonImg src='/assets/logo3.png' style={{ width: '50px' }} />
                      </div>
                    </Fragment>}

                    {((new Date(selectedDate).toDateString() !== isToday.toDateString()
                      &&
                      new Date(selectedDate).toDateString() !== isYesterday.toDateString()
                      &&
                      new Date(selectedDate).toDateString() !== isTomorrow.toDateString()
                    )) &&
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2><b>Meetings for {new Date(selectedDate).toDateString()}:</b></h2>
                        <IonImg src='/assets/logo3.png' style={{ width: '50px' }} />
                      </div>
                    }
                    <div style={{ maxHeight: '280px', overflow: 'auto', padding: '12px' }}>
                      <IonAccordionGroup >
                        {!!tasksWithDates[selectedDate.split('T')[0]] && tasksWithDates[selectedDate.split('T')[0]].map((task, idx) => { //loop start
                          const taskDateTime = task.split('|')[1]
                          const dateTime = new Date(taskDateTime)
                          const at = new Date(dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                          const remainingTime = getRemainingTime(taskDateTime)
                          return <Fragment key={idx}>
                            {remainingTime <= 0 &&
                              <del>
                                <IonAccordion value={`${idx}`} key={idx}>
                                  <IonItem slot="header" color="light">
                                    <IonLabel style={{ fontSize: '14px' }}>{`${idx + 1}.${task.split('|')[0]} at ` || 'No Meetings'}<strong>{at}</strong></IonLabel>
                                  </IonItem>
                                  <div className="ion-no-padding" slot="content">
                                    <ol>
                                      <strong style={{ color: 'red', fontSize: '13px', textAlign: 'center' }}>-- Checklists --</strong>
                                      {task.split('|')[2].split(',').map((r,listIndex) => <li key={listIndex}>{r}</li>)}
                                    </ol>
                                  </div>
                                </IonAccordion>
                              </del>}
                            {remainingTime > 0 &&
                              <Fragment>
                                <IonAccordion value={`${idx}`} key={idx}>
                                  <IonItem slot="header" color="light">
                                    <IonLabel style={{ fontSize: '14px'}}>{`${idx + 1}.${task.split('|')[0]} at ` || 'No Meetings'}<strong>{at}</strong></IonLabel>
                                  </IonItem>
                                  <div className="ion-no-padding" slot="content">
                                    <ol>
                                      <strong style={{ color: 'green', fontSize: '13px', textAlign: 'center' }}>-- Checklists --</strong>
                                      {task.split('|')[2].split(',').map((r,listIndex) =>
                                        <li key={listIndex}>{r}</li>)}
                                    </ol>
                                  </div>
                                </IonAccordion>
                              </Fragment>
                            }
                          </Fragment>
                        })}

                        {tasksWithDates[selectedDate.split('T')[0]] == undefined && <>No Meetings</>}

                      </IonAccordionGroup>
                    </div>

                  </IonCardContent>
                }
              </IonCol>
            </IonRow>
          </IonCardContent>

        </IonCard>
      </IonCol>
  );
};

export default Calender1;
