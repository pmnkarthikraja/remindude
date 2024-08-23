import React, { useRef, useState } from 'react';
import {
  IonModal,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonAlert,
} from '@ionic/react';
import { LocalHolidayData } from '../api/calenderApi';

interface HolidayModalProps {
  holidays: LocalHolidayData[] | undefined;
  onDelete: (id?: string) => void;
}

//onClick={() => onDelete(holiday._id)}

const LocalHolidayModal: React.FC<HolidayModalProps> = ({ holidays, onDelete }) => {
  const modalRef = useRef<HTMLIonModalElement>(null);
  const alertRef = useRef<HTMLIonAlertElement>(null);
  const [deleteId,setDeleteId]=useState<string|undefined>(undefined)
  return (
    <>
    <IonAlert
          ref={alertRef}
          isOpen={!!deleteId}
          header="Confirm Delete?"
          className="custom-alert"
          onDidDismiss={() => {alertRef.current?.dismiss();setDeleteId(undefined)}}
          buttons={[
            {
              text: 'No',
              cssClass: 'alert-button-cancel',
              handler: () => {
                setDeleteId(undefined)
                alertRef.current?.dismiss()
              }
            },
            {
              text: 'Yes',
              cssClass: 'alert-button-confirm',
              handler: () => {
                onDelete(deleteId)
              }
            },
          ]}
        >
        </IonAlert>
   
    <IonModal mode='ios' ref={modalRef} trigger='trigger-local-holidays' >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Manage Local Holiday's</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={()=>modalRef.current?.dismiss()}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Holiday</th>
                <th>Region</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {holidays && holidays.map((holiday, index) => (
                <tr key={index}>
                  <td>{holiday.iso_date}</td>
                  <td>{holiday.holidayName}</td>
                  <td>{holiday.region}</td>
                  <td>
                    <IonButton id='confirm-delete' color="danger" onClick={()=>setDeleteId(holiday._id)}> 
                      Delete
                    </IonButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </IonContent>
    </IonModal>
    </>
  );
};

export default LocalHolidayModal;
