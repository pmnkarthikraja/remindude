// DateRangePicker.tsx
import React, { useState } from 'react';
import { IonDatetime, IonButton, IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon, IonRow, IonCol, createAnimation, IonPopover, IonFooter } from '@ionic/react';
import '../styles/DateRangeModal.css'
interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onDateRangeChange }) => {
const dateTimeNow = new Date().toJSON()
  const [startDate, setStartDate] = useState<string>(dateTimeNow);
  const [endDate, setEndDate] = useState<string>(dateTimeNow);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      onDateRangeChange(new Date(startDate), new Date(endDate));
      setShowModal(false);
    }
  };


  return (
    <>
      <IonButton color='secondary' onClick={() => setShowModal(true)}>Select Date Range</IonButton>
      <IonModal className='date-range-popover'  isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Select Date & Time Range</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <>
            <IonTitle>From</IonTitle>
            <IonDatetime
              value={startDate}
              onIonChange={e => setStartDate(e.detail.value as string)}
              max="2900-12-30T23:59:59"
            />
            <IonTitle>To</IonTitle>
            <IonDatetime
              value={endDate}
              onIonChange={e => setEndDate(e.detail.value as string)}
              max="2900-12-30T23:59:59"
            />
          </>
        </IonContent>
        <IonFooter>
            <IonRow>
                <IonCol >
                    <IonButton color='tertiary' expand='block' onClick={handleDateRangeChange}>Apply</IonButton>
                </IonCol>
                <IonCol>
                    <IonButton color='medium' expand='block' onClick={()=>setShowModal(pre=>!pre)}>Cancel</IonButton>
                </IonCol>
                </IonRow>
        </IonFooter>
      </IonModal>
    </>
  );
};

export default DateRangePicker;
