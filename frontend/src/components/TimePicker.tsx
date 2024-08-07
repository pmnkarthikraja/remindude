import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import dayjs from 'dayjs';

export interface StaticTimePickerProps{
  onTimeChange:(time:Date)=>void,
  initialTime:Date|null
}

const StaticTimePickerLandscape:React.FunctionComponent<StaticTimePickerProps>=({
  onTimeChange,
  initialTime
})=> {
  // const [time,setTime]=React.useState(initialTime)
  const initial=initialTime ? initialTime : new Date() 

  return (
    <div style={{width:'200px'}}>
        <LocalizationProvider  dateAdapter={AdapterDayjs}>
        <StaticTimePicker   displayStaticWrapperAs='desktop'  onChange={(e)=>{
          // setTime(new Date(e?.toJSON() || ''))
          onTimeChange(new Date(e?.toJSON()|| ''))
          }} value={ dayjs(initial.toJSON())} orientation='portrait' />
        </LocalizationProvider>
    </div>
  );
}

export default StaticTimePickerLandscape