import React, { Fragment, FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import {
    IonCol, IonRow, IonCard, IonCardContent, IonDatetime, IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonBadge,
    IonImg, IonFab, IonFabButton, IonModal, IonButton,
    IonCardTitle,
    IonBackButton,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonIcon
} from '@ionic/react';
import { Platform, useGetPlatform } from '../utils/useGetPlatform';
import Calender1 from '../components/Calender';
import { TaskRequestData } from '../components/task';
import { HolidayData, LocalHolidayData } from '../api/calenderApi';
import { arrowBack } from 'ionicons/icons';

export interface CalendarPageProps {
    tasks: TaskRequestData[],
    holidays: HolidayData[] | undefined,
    localHolidays: LocalHolidayData[] | undefined
    isOpen: boolean,
    onClose: () => void,
    isMobileView: boolean
}
const CalendarPage: FunctionComponent<CalendarPageProps> = ({
    holidays,
    localHolidays,
    tasks,
    isOpen,
    onClose,
    isMobileView
}) => {
    const [platform, setPlatform] = useState<Platform>('Unknown');
    const handlePlatformChange = useCallback((newPlatform: Platform) => {
        setPlatform(newPlatform);
    }, []);


    useGetPlatform(handlePlatformChange);

    return (
        <Fragment>
            {/* Calendar Modal for mobile view */}
            {isMobileView && (
                <IonModal isOpen={isOpen} onDidDismiss={() => onClose()}>
                    <IonToolbar>
                        <IonButtons>
                            <IonCardTitle style={{ fontWeight: 'bold', color: '#3880ff' }}>
                                Calendar Overview
                            </IonCardTitle>
                            <IonIcon onClick={onClose} style={{ padding: '10px',color:'#3880ff' }} icon={arrowBack} slot='start' size='default' />
                        </IonButtons>
                    </IonToolbar>
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <Calender1 tasks={tasks} holidays={holidays} localHolidays={localHolidays} />
                        </div>
                    </div>
                </IonModal>
            )}

            {/* Calendar side-by-side for desktop view */}
            {!isMobileView && (
                <IonCol sizeXs='12' sizeSm='6' sizeMd='6' sizeLg='6' sizeXl='5'>
                    <div>
                        <Calender1 tasks={tasks} holidays={holidays} localHolidays={localHolidays} />
                    </div>
                </IonCol>
            )}
        </Fragment>
    );
};

export default CalendarPage;
