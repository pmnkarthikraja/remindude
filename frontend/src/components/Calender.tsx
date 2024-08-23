import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonDatetime,
  IonGrid,
  IonImg,
  IonItem,
  IonLabel,
  IonRow
} from '@ionic/react';
import React, { Fragment, FunctionComponent, useMemo, useState } from 'react';
import { getRemainingTime } from '../pages/HomePage';
import '../styles/calender.css';
import { TaskRequestData } from './task';
import { HolidayData, LocalHolidayData } from '../api/calenderApi';

const colorMap: { [key: string]: { textColor: string, backgroundColor: string } } = {
  'IN': { textColor: '#ffffff', backgroundColor: '#ffc0cb' },  // India
  'SA': { textColor: '#ffffff', backgroundColor: '#c8e5d0' },  // Saudi Arabia
  'Local': { textColor: '#ffffff', backgroundColor: '#FFA62F' },  // Local Holidays (Excel Data)
};

const today = new Date()

export interface Calender1Props {
  tasks: TaskRequestData[]
  holidays: HolidayData[] | undefined
  localHolidays: LocalHolidayData[] | undefined
}

const Calender1: FunctionComponent<Calender1Props> = ({
  tasks,
  holidays,
  localHolidays
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(today.toJSON());
  const [popoverContent, setPopoverContent] = useState<string | null>(null);

  const notes: { [key: string]: string } = {
    '2024-06-10': 'Meeting with team',
    '2024-06-13': 'Project deadline',
    '2024-06-14': 'Doctor appointment',
    '2024-06-26': 'Meeting with team',
    '2024-06-21': 'Project deadline',
    '2024-06-29': 'Doctor appointment',
  };

  const highlightedDates = useMemo(() => {
    const calenderificHolidaysResult = holidays && holidays.flatMap(data => {
      const color = colorMap[data.country];
      return data.holidays
        .filter(holiday => holiday.type.includes('National holiday'))
        .map(holiday => ({
          date: holiday.date.iso,
          textColor: color.textColor,
          backgroundColor: color.backgroundColor,
        }));
    });
    const localHolidaysResult = localHolidays && localHolidays.map(holiday => ({
      date: holiday.iso_date,
      textColor: colorMap['Local'].textColor,
      backgroundColor: colorMap['Local'].backgroundColor,
    }))

    const mergedHolidaysResultSafe = (calenderificHolidaysResult || []).concat(localHolidaysResult || []);
    return mergedHolidaysResultSafe

  }, [holidays]);

  const tasksWithDates: { [key: string]: string[] } = {}

  tasks.map(task => {
    if (task.eventType == 'Meeting') {
      const date = new Date(task.dateTime).toJSON()
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



  const holidaysUpdate = (date: string) => {
    let content = ''
    const selectedDate = new Date(date).getDate()
    const selectedMonth = new Date(date).getMonth()
    const selectedYear = new Date(date).getFullYear()
    const holidaysOnDate = holidays && holidays
      .flatMap(data => data.holidays)
      .filter(h => {
        const holidayDate = new Date(h.date.iso).getDate()
        const holidayMonth = new Date(h.date.iso).getMonth()
        const holidayYear = new Date(h.date.iso).getFullYear()
        if ((holidayDate == selectedDate && holidayMonth == selectedMonth && holidayYear == selectedYear) && h.type.includes('National holiday')) {
          return h
        }
      });

    const localHolidaysOnDate = localHolidays && localHolidays.filter(d => {
      const holidayDate = new Date(d.iso_date).getDate()
      const holidayMonth = new Date(d.iso_date).getMonth()
      const holidayYear = new Date(d.iso_date).getFullYear()
      if ((holidayDate == selectedDate && holidayMonth == selectedMonth && holidayYear == selectedYear)) {
        return d
      }
    })


    if (localHolidaysOnDate && localHolidaysOnDate.length > 0 && holidaysOnDate && holidaysOnDate.length > 0) {
      content += localHolidaysOnDate.map(holiday => {
        if (holiday.holidayName.includes('Bank Holiday')){
          return `Bank Holiday (${holiday.region})`
        }
        return `${holiday.holidayName} (Local Holiday)`}).join(',')
      content += ', '
      content += holidaysOnDate
        .map(holiday => `${holiday.name} (${holiday.country.name})`)
        .join(',');
      setPopoverContent(content)

    } else if (localHolidaysOnDate && localHolidaysOnDate.length > 0) {
      const content = localHolidaysOnDate.map(holiday => {
        if (holiday.holidayName.includes('Bank Holiday')){
          return `Bank Holiday (${holiday.region})`
        }
        return `${holiday.holidayName} (Local Holiday)`}
      ).join(',')
      setPopoverContent(content)

    } else if (holidaysOnDate && holidaysOnDate.length > 0) {
      const content = holidaysOnDate
        .map(holiday => `${holiday.name} (${holiday.country.name})`)
        .join(',');
      setPopoverContent(content);
      
    } else {
      setPopoverContent(null)
    }
  }

  const handleDateChange = (e: CustomEvent) => {
    setSelectedDate(e.detail.value);
    holidaysUpdate(e.detail.value)
  };

  const isToday = new Date();
  const isYesterday = new Date();
  const isTomorrow = new Date();

  isToday.setHours(0, 0, 0, 0);
  isYesterday.setHours(0, 0, 0, 0);
  isYesterday.setDate(today.getDate() - 1);
  isTomorrow.setHours(0, 0, 0, 0);
  isTomorrow.setDate(today.getDate() + 1);

  
  const buildMaxYear = (): string => {
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 10
    const maxDate = `${maxYear}-12-31T23:59:59`
    return maxDate
};


  return (
    <IonCol size='auto' >
      <IonCard >
        {/* <IonCardContent > */}
        <IonRow>
          <IonCol sizeXs='12' sizeSm='12' sizeMd='12' sizeLg='6' sizeXl='7'>
            {/* {popoverContent != null && (popoverContent?.includes('India') && (!popoverContent.includes('Bank Holiday') || popoverContent.includes(','))) && <IonBadge color='secondary'>India Public Holiday</IonBadge>}
            {popoverContent != null && (popoverContent?.includes('Saudi Arabia') && (!popoverContent.includes('Bank Holiday') || popoverContent.includes(','))) && <IonBadge color='tertiary'>Saudi Public Holiday</IonBadge>}
             */}
            
            {/* {popoverContent != null && (popoverContent?.includes('Saudi Arabia') && (popoverContent.includes('Bank Holiday (Saudi Arabia)') || !popoverContent.includes(','))) && <IonBadge color='warning'>Bank Holiday</IonBadge>}
            {popoverContent != null && (popoverContent?.includes('India') && (popoverContent.includes('Bank Holiday (India)') || !popoverContent.includes(','))) && <IonBadge color='tertiary'>Bank Holiday</IonBadge>}
            {popoverContent != null && (popoverContent?.includes('Both') && (popoverContent.includes('Bank Holiday (Both)') || !popoverContent.includes(','))) && <IonBadge color='danger'>Bank Holiday</IonBadge>} */}

            {popoverContent != null && (popoverContent?.includes('India')) && <IonBadge color='secondary'>India Public Holiday</IonBadge>}
            {popoverContent != null && (popoverContent?.includes('Saudi Arabia') && (!popoverContent.includes('Bank Holiday (Saudi Arabia)'))) && <IonBadge color='tertiary'>Saudi Public Holiday</IonBadge>}
          
            {popoverContent != null && (popoverContent?.includes('Bank Holiday')) && <IonBadge color='danger'>Bank Holiday</IonBadge>}


            {popoverContent != null && popoverContent.includes('(Local Holiday)') && (<IonBadge color="warning">Local Holiday</IonBadge>)}
            {popoverContent != null && <p>{popoverContent}</p>}
            <IonDatetime
              name="datetime"
              highlightedDates={highlightedDates}
              size='cover'
              value={selectedDate}
              presentation="date"
              onIonChange={handleDateChange}
              max={buildMaxYear()}
            ></IonDatetime>
          </IonCol>

          <IonCol sizeXs='12' sizeSm='12' sizeMd='12' sizeLg='3' sizeXl='5' >
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
                                  {task.split('|')[2].split(',').map((r, listIndex) => <li key={listIndex}>{r}</li>)}
                                </ol>
                              </div>
                            </IonAccordion>
                          </del>}
                        {remainingTime > 0 &&
                          <Fragment>
                            <IonAccordion value={`${idx}`} key={idx}>
                              <IonItem slot="header" color="light">
                                <IonLabel style={{ fontSize: '14px' }}>{`${idx + 1}.${task.split('|')[0]} at ` || 'No Meetings'}<strong>{at}</strong></IonLabel>
                              </IonItem>
                              <div className="ion-no-padding" slot="content">
                                <ol>
                                  <strong style={{ color: 'green', fontSize: '13px', textAlign: 'center' }}>-- Checklists --</strong>
                                  {task.split('|')[2].split(',').map((r, listIndex) =>
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
        {/* </IonCardContent> */}

      </IonCard>
    </IonCol>
  );
};

export default Calender1;
