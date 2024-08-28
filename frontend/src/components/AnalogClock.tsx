import { Fragment, FunctionComponent, useEffect, useState } from 'react';
import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker';
import React from 'react';
import '@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import '../styles/AnalogClock.css'
import { IonImg, IonItem, IonLabel } from '@ionic/react';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

interface AnalogClockProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

const AnalogClock:FunctionComponent<AnalogClockProps> =({
  onDateRangeChange
})=> {
  const [value, onChange] = useState<Value>([new Date(), new Date()]);

useEffect(()=>{
  if (value!==null){
    onDateRangeChange(value[0],value[1])
  }
},[value])
  return (
    <Fragment>
  <IonItem lines='none'>
    <IonLabel >
      Select Date and Time Range here:
    </IonLabel>
  </IonItem>
    <div className='date-time-range-picker-wrapper'>
      <DateTimeRangePicker isCalendarOpen={true}
        calendarProps={{
        showNavigation:true,
        view:'month',
        className:'custom-datetimerange-picker'
      }} dayAriaLabel='day-aria' className={'picker'} 
        clearIcon={null}
        format='dd-MM-y / hh:mm a'   
      onChange={onChange} value={value} rangeDivider={
        <IonImg src='/assets/divider.png' style={{width:'30px',height:'20px'}}/>
      }/>
      </div>
      </Fragment>
  );
}

export default AnalogClock