import { DatetimeChangeEventDetail, IonBadge, IonButton, IonButtons, IonCheckbox, IonCol, IonContent, IonDatetime, IonFooter, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonModal, IonNote, IonRadio, IonRadioGroup, IonRow, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToast, IonToolbar } from "@ionic/react"
import { close, closeOutline } from "ionicons/icons"
import moment from "moment-timezone"
import React, { Fragment, FunctionComponent, useEffect, useRef, useState } from "react"
import { Control, FieldErrors, UseFormClearErrors, UseFormRegister, UseFormReturn, UseFormSetValue, UseFormWatch } from "react-hook-form"
import Select from 'react-select'
import { getTimezoneOffset, localTimeZone, localTimeZoneLabel } from "../utils/util"
import CategoryDropdown from "./CategoryDropdown"
import SubTaskForm from './SubTask'
import { EventData, TaskRequestData } from "./task"
import ToggleWithLabel from "./Toggle"
import { useWeekContext } from "./weekContext"
import StaticTimePickerLandscape from "./TimePicker"
import dayjs from "dayjs"

interface FormModalProps {
    id: string
    formData:UseFormReturn<EventData, any, undefined>
    isEdit: boolean,
    setIsAlertOpen: (isOpen: boolean) => void
    onSubmit: (e: any) => void,
    datetimeRef: React.MutableRefObject<HTMLIonDatetimeElement | null>,
    toggleEditTask?: (op: { isEdit: boolean, task: TaskRequestData | undefined }) => void,
}

const FormModal: FunctionComponent<FormModalProps> = ({
    isEdit,
    setIsAlertOpen,
    onSubmit,
    datetimeRef,
    toggleEditTask,
    id,
    formData
}) => {
    const {clearErrors,control,formState:{errors:fieldErrors}, register, watch, setValue, } = formData 
    const { eventType, category, emailNotification, priority, notifyFrequency, status, datetime, timezone } = watch()
    const modal = useRef<HTMLIonModalElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { startOfWeek } = useWeekContext();
    const [selectedTimezone, setSelectedTimezone] = useState<string | null>(timezone || localTimeZone);
    const [selectedTime, setSelectedTime] = useState<Date | null>(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
    const [initialTime, setInitialTime] = useState<Date | null>(null);


    useEffect(() => {
        if (selectedTimezone) {
            setValue('timezone', selectedTimezone)
            setSelectedTime(new Date())
            setInitialTime(new Date())
        }
    }, [selectedTimezone])


    // for handling initial values on edit
    useEffect(() => {
        if (isEdit && datetime && selectedTimezone) {
            const originalDateTimeInIST = dayjs(datetime).tz(localTimeZone, true);

            // Convert this datetime to the user's timezone
            const localDateTimeInUserTZ = originalDateTimeInIST.tz(selectedTimezone);

            const initialTimeForPicker = new Date(localDateTimeInUserTZ.format());
            setInitialTime(initialTimeForPicker);

            const date = localDateTimeInUserTZ.format('YYYY-MM-DD');
            const time = localDateTimeInUserTZ.toDate();

            setSelectedDate(date);
            setSelectedTime(time);
        } else if (!isEdit) {
            setSelectedDate(dayjs().format('YYYY-MM-DD'));
            setSelectedTime(new Date());
            setInitialTime(new Date());
        }
    }, [isEdit, datetime]);

    // Save function to calculate final datetime with timezone
    const handleSave = () => {
        if (selectedDate && selectedTime && selectedTimezone) {
            try {
                const formattedDate = dayjs(selectedDate, 'YYYY-MM-DD', true);
                if (!formattedDate.isValid()) {
                    throw new Error('Invalid date value');
                }

                const formattedTime = dayjs(selectedTime).format('HH:mm:ss');
                if (!formattedTime) {
                    throw new Error('Invalid time value');
                }

                const dateTimeString = `${formattedDate.format('YYYY-MM-DD')} ${formattedTime}`;
                const dateTimeWithTimezone = dayjs.tz(dateTimeString, selectedTimezone);

                if (!dateTimeWithTimezone.isValid()) {
                    throw new Error('Invalid combined date or time value');
                }

                const localDateTime = dateTimeWithTimezone.local().format();
                setValue('datetime', localDateTime);
            } catch (error) {
                console.error('Error saving task:', error.message);
            }
        } else {
            console.error('Missing date, time, or timezone selection');
        }
    };

    const timezones = moment.tz.names().map((tz) => ({
        value: tz,
        label: `${tz.replace('_', ' ')} ${getTimezoneOffset(tz)}`,
    }));

    const handleChangeOnTimezone = (option: any) => {
        setSelectedTimezone(option.value);
    };


    const handleTimeChange = (hour: number, minute: number, seconds: number) => {
        if (selectedTimezone) {
            const time = new Date()
            time.setHours(hour)
            time.setMinutes(minute)
            time.setSeconds(seconds)
            setSelectedTime(time);
        };
    }

    const handleDateChange = (event: CustomEvent) => {
        setSelectedDate(event.detail.value);
    };

    const onSkipDays = (days:number)=>{
        const updated= dayjs().add(days,'day')
        setSelectedDate(updated.format('YYYY-MM-DD'))
    }

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const addCardTitle = 'Add Task/Meeting'
    const editCardTitle = `Edit ${eventType == 'Meeting' ? "Meeting" : 'Task'}`

    const isDateDisabled = (dateIsoString: string) => {
        const date = new Date(dateIsoString);
        const day = date.getUTCDay();
        if (startOfWeek == 'Sunday') {
            return day === 0 || day === 6;
        } else if (startOfWeek == 'Monday') {
            return day === 5 || day === 6;
        }
    };

    const customTimezoneSelectorStyles = {
        control: (provided: any) => ({
            ...provided,
            zIndex: 9999,
            border: '1px solid #ccc',
            boxShadow: 'none',
            padding: '2px',
            margin: '15px',
            '&:hover': {
                border: '1px solid #aaa',
            },
        }),
        menu: (provided: any) => ({
            ...provided,
            zIndex: 9999,
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#f0f0f0' : provided.backgroundColor,
            color: state.isFocused ? '#333' : provided.color,
        }),
    };

    return (
        <Fragment>
            <IonModal
                id={id}
                mode="ios"
                ref={modal}
                isOpen={true}
                onDidDismiss={() => {
                    if (typeof toggleEditTask == 'function') {
                        toggleEditTask({
                            isEdit: false,
                            task: undefined
                        })
                        setIsAlertOpen(false);
                    } else {
                        setIsAlertOpen(false)
                    }
                }}>
                <IonHeader >
                    <IonToolbar>
                        <IonRow style={{ alignItems: 'center' }}>
                            {!isEdit && (
                                <Fragment>
                                    <IonImg style={{ width: '40px', height: '40px' }} src="/assets/task.png" />
                                    <IonImg style={{ width: '40px', height: '40px' }} src="/assets/meeting-new.png" />
                                    <IonTitle style={{ fontWeight: '700', position: 'relative', color: '#064282', textAlign: 'center', marginLeft: '-50px', flexGrow: 1 }}>
                                        {addCardTitle}
                                    </IonTitle>
                                </Fragment>
                            )}
                            {isEdit && (
                                <Fragment>
                                    <IonImg style={{ width: '40px', height: '40px' }} src={`/assets/${eventType === 'Meeting' ? 'meeting-new' : 'task'}.png`} />
                                    <IonTitle style={{ fontWeight: '700', position: 'relative', color: '#064282', textAlign: 'center', marginLeft: '-50px', flexGrow: 1 }}>
                                        {editCardTitle}
                                    </IonTitle>
                                </Fragment>
                            )}
                            <IonButtons slot="end">
                                <IonButton onClick={() => { }}>
                                    <IonIcon icon={closeOutline} />
                                </IonButton>
                            </IonButtons>
                            <IonBadge style={{ width: '150px', textAlign: 'start' }} color={'light'}>
                                Status: <span style={{ color: status === 'Done' ? 'green' : 'orange' }}>{status}</span>
                                {status === 'Done' && <span className="tick-mark">✔</span>}
                            </IonBadge>
                        </IonRow>

                    </IonToolbar>
                </IonHeader>
                <IonContent
                >
                    {fieldErrors.title && <IonToast color={'danger'}
                        onDidDismiss={() => clearErrors()}
                        buttons={[
                            {
                                text: 'Ok',
                                role: 'cancel',
                                handler: clearErrors
                            },
                        ]} position="top" isOpen={true} message={'Please Enter a valid data!'} duration={3000}></IonToast>}

                    <form id="task-form" onSubmit={(e) => {
                        handleSave();
                        onSubmit(e)
                    }} >
                        <IonItem>
                            <IonLabel position="fixed">Title</IonLabel>
                            <IonInput {...register("title", {
                                required: {
                                    value: true,
                                    message: 'Title is required!'
                                }
                            })} type="text" style={{ border: 'none', height: '30px', width: '250px', outline: 'none' }} />
                        </IonItem>


                        <IonItem>
                            <IonLabel position="fixed">Priority</IonLabel>
                            <IonSelect class="ion-no-padding" {...register("priority")} value={priority} placeholder="Select Priority" onIonChange={e => setValue('priority', e.target.value)}>
                                <IonSelectOption value={'Urgent'}>Urgent</IonSelectOption>
                                <IonSelectOption value={'Moderate'}>Moderate</IonSelectOption>
                                <IonSelectOption value={'Normal'}>Normal</IonSelectOption>
                            </IonSelect>
                        </IonItem>

                        <IonItem>
                            <IonLabel position="fixed">Type:</IonLabel>
                            <ToggleWithLabel initialLabel={eventType} labels={["Task", "Meeting"]}
                                onSelect={e => setValue('eventType', e)} />
                        </IonItem>

                        <CategoryDropdown initialValue={category} onSave={e => setValue('category', e)} />

                        <IonItem>
                            <IonLabel position="fixed">Description</IonLabel>
                            <IonTextarea {...register("description")}></IonTextarea>
                        </IonItem>


                        {isEdit && <IonItem>
                            <IonLabel position="fixed">Status</IonLabel>
                            <IonCheckbox
                                checked={status == 'Done'}
                                value={status}
                                onIonChange={(e) => {
                                    setValue('status', e.target.checked ? 'Done' : 'InProgress')
                                }}>{eventType} Done?</IonCheckbox>
                        </IonItem>}

                        {eventType == 'Task' && <SubTaskForm fieldName="subTasks" isTask={true} control={control} />}
                        {eventType == 'Meeting' && <SubTaskForm fieldName="checklists" isTask={false} control={control} />}

                        <IonLabel style={{ marginLeft: '15px' }} position="fixed" >
                            Timezone: {selectedTimezone != localTimeZone && <IonButton size="small" fill="solid" color={'warning'} style={{marginTop:'-5px'}} onClick={()=>{setSelectedTimezone(localTimeZone)}}>Set Local</IonButton>}
                            </IonLabel>
                        <Select
                            styles={customTimezoneSelectorStyles}
                            value={{ value: selectedTimezone, label: selectedTimezone == localTimeZone ? `(Local) ${localTimeZoneLabel}` : `${selectedTimezone} ${ selectedTimezone && getTimezoneOffset(selectedTimezone)}` }}
                            onChange={handleChangeOnTimezone}
                            options={timezones}
                            placeholder="Select a timezone..."
                            isClearable={false}
                        />

                        <IonItem>
                            <div>
                                <IonLabel position="fixed">Set Time and Date:</IonLabel>
                                <StaticTimePickerLandscape
                                    initialTime={initialTime?.toUTCString() || ''}
                                    selectedTimezone={selectedTimezone || ''}
                                    onTimeChange={handleTimeChange}
                                />
                            </div>
                        </IonItem>

                        <IonItem>
                            <IonImg style={{ width: '20px', height: '20px', marginRight: '5px' }} src='/assets/calender.png' />
                            <IonBadge color='light' onClick={openModal} style={{ cursor: 'pointer' }}>{selectedDate}</IonBadge>


                            {isModalOpen && <IonModal aria-hidden={false} mode="ios" className="custom-modal" isOpen={isModalOpen} onDidDismiss={closeModal} >
                                <IonItem>
                                    <IonBadge color='light'>Saudi Calender</IonBadge>
                                    <IonBadge color='light'>Indian Calender</IonBadge>
                                    <IonButton size="small" slot="end" color={"light"} onClick={closeModal}>
                                        <IonIcon slot="icon-only" icon={close}></IonIcon>
                                    </IonButton>
                                </IonItem>

                                <IonDatetime
                                    value={selectedDate}
                                    ref={datetimeRef}
                                    onIonChange={(e) => {
                                        handleDateChange(e)
                                    }}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="date-time"
                                    presentation='date'
                                    name="datetime"
                                    formatOptions={{
                                        date: {
                                            weekday: 'short',
                                            month: 'long',
                                            day: '2-digit',
                                        },
                                    }}
                                    isDateEnabled={(e) => !isDateDisabled(e)}
                                    showDefaultTimeLabel
                                    max="3000-12-30T23:59:59"
                                />
                                  <IonItem>
                                    <IonButton fill="solid" color='success' onClick={() => onSkipDays(30)}>+30 days</IonButton>
                                    <IonButton fill="solid" color='success' onClick={() => onSkipDays(60)}>+60 days</IonButton>
                                    <IonButton fill="solid" color='success' onClick={() => onSkipDays(90)}>+90 days</IonButton>
                                    <IonButton fill="solid" color='warning' onClick={() => setValue('datetime', new Date().toJSON())}>Reset</IonButton>
                                </IonItem>
                                <IonItem lines='inset'>
                                    <IonInput
                                        type='number' placeholder="Or Enter Manually" onIonChange={(e) => onSkipDays(parseInt(e.detail.value || '') || 3)} ></IonInput>
                                </IonItem>
                                <div style={{ height: '10px' }}></div>
                            </IonModal>
                            }

                            <IonImg style={{ width: '20px', height: '20px', marginRight: '5px' }} src='/assets/clock.png' />

                            <IonBadge color='light'>{selectedTime?.toLocaleTimeString('en-IN',
                                { hour: 'numeric', minute: 'numeric', hour12: true }) || ''}
                            </IonBadge>

                        </IonItem>

                        <IonItem>
                            <IonLabel position="fixed"> Email Notification?</IonLabel>
                            <IonRadioGroup
                                onIonChange={(e) => setValue('emailNotification', e.detail.value === 'yes')}
                                {...register("emailNotification")}
                                value={emailNotification ? 'yes' : 'no'}>
                                <IonRow>
                                    <IonRadio style={{ marginRight: '10px' }} value={'yes'}>Yes</IonRadio>
                                    <IonRadio value={'no'}>No</IonRadio>
                                </IonRow>
                            </IonRadioGroup>
                        </IonItem>

                        {emailNotification && (
                            <IonItem>
                                <IonLabel position="fixed">Notify Frequency</IonLabel>
                                <IonSelect
                                    {...register("notifyFrequency")}
                                    value={notifyFrequency}
                                    placeholder="Select Interval"
                                    name="frequency"
                                    interface='popover'
                                    onIonChange={(e) => setValue('notifyFrequency', e.detail.value)}
                                >
                                    <IonSelectOption value="1">1 hour</IonSelectOption>
                                    <IonSelectOption value="2">2 hours</IonSelectOption>
                                    <IonSelectOption value="3">3 hours</IonSelectOption>
                                    <IonSelectOption value="0">Default</IonSelectOption>
                                </IonSelect>
                                <IonNote style={{ width: '120px', marginLeft: '15px', marginTop: '15px' }}>
                                    To receive reminders on the day of the task
                                </IonNote>
                            </IonItem>
                        )}
                    </form>
                </IonContent>

                <IonFooter >
                    <IonRow>
                        <IonCol>
                            <IonButton size="small" onClick={() => {
                                modal.current?.dismiss()
                                clearErrors()
                            }
                            } color={'warning'} id="task-submit" type="button" expand="full">
                                Cancel
                            </IonButton>
                        </IonCol>
                        <IonCol>
                            <IonButton size="small" id="task-submit" type="submit"
                                expand="full" form="task-form">
                                Submit
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonFooter>
            </IonModal>
        </Fragment>
    );
}

export default FormModal