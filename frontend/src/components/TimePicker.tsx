import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import * as React from 'react';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface StaticTimePickerProps {
  onTimeChange: (hour: number, minute: number, seconds: number) => void;
  initialTime: string | null;
  selectedTimezone: string;
}

const StaticTimePickerLandscape: React.FunctionComponent<StaticTimePickerProps> = ({
  onTimeChange,
  initialTime,
  selectedTimezone,
}) => {
  const [time, setTime] = React.useState<Dayjs | null>(null);


  const handleTimeChange = (newValue: Dayjs | null) => {
    setTime(newValue);
    const hour = newValue?.get('hour') || 0
    const minute = newValue?.get('minute') || 0
    const seconds = newValue?.get('second') || 0
    if (newValue) {
      onTimeChange(hour, minute, seconds);
    }
  };

  React.useEffect(() => {
    if (initialTime && selectedTimezone) {
      const parsedTime1 = dayjs(initialTime).utcOffset(0,false).tz(selectedTimezone)

      setTime(parsedTime1);
      const hour = parsedTime1?.get('hour') || 0
      const minute = parsedTime1?.get('minute') || 0
      const seconds = parsedTime1?.get('second') || 0
      if (parsedTime1) {
        onTimeChange(hour, minute, seconds);
      }
    } else {
      setTime(null);
    }
  }, [initialTime, selectedTimezone]);

  return (
    <div style={{ width: '200px' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticTimePicker
        sx={{
          backgroundColor: 'inherit',
          color: 'var(--primary-color)',

          /* Apply styles to the entire time picker */
          '.MuiClockNumber-root': {
            color: 'var(--time-picker-color)', // Change clock numbers' color
            WebkitTextFillColor: 'var(--time-picker-color)', // Ensures proper color in WebKit browsers
          },
          '.MuiButtonBase-root': {
            color: 'var(--time-picker-color)', // Change button color
          },
          '.MuiPickersToolbarText-root': {
            color: 'var(--time-picker-color)', // Change toolbar text color
          },
          '.MuiTypography-root': {
            color: 'var(--time-picker-color)', // Change typography color
          }
        }}
          displayStaticWrapperAs="desktop"
          value={time}
          onChange={handleTimeChange}
          orientation="portrait"
        />
      </LocalizationProvider>
    </div>
  );
};

export default StaticTimePickerLandscape;