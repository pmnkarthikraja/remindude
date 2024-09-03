import { IonBadge, IonButton, IonButtons, IonCheckbox, IonCol, IonContent, IonDatetime, IonFooter, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonModal, IonNote, IonRadio, IonRadioGroup, IonRow, IonSelect, IonSelectOption, IonText, IonTextarea, IonTitle, IonToast, IonToolbar } from "@ionic/react"
import { CSSProperties } from "@mui/styled-engine"
import dayjs from "dayjs"
import { close, closeOutline } from "ionicons/icons"
import moment from "moment-timezone"
import React, { Fragment, FunctionComponent, useEffect, useMemo, useRef, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import Select from 'react-select'
import { HolidayData, LocalHolidayData } from "../api/calenderApi"
import { getTimezoneOffset, localTimeZone, localTimeZoneLabel } from "../utils/util"
import CategoryDropdown from "./CategoryDropdown"
import SubTaskForm from './SubTask'
import { EventData, TaskRequestData } from "./task"
import StaticTimePickerLandscape from "./TimePicker"
import ToggleWithLabel from "./Toggle"
import { useWeekContext } from "./weekContext"


const colorMap: { [key: string]: { textColor: string, backgroundColor: string } } = {
    'IN': { textColor: '#ffffff', backgroundColor: '#ffc0cb' },  // India
    'SA': { textColor: '#ffffff', backgroundColor: '#c8e5d0' },  // Saudi Arabia
    'Local': { textColor: '#ffffff', backgroundColor: '#FFA62F' },  // Local Holidays (Excel Data)
};

interface FormModalProps {
    id: string
    formData: UseFormReturn<EventData, any, undefined>
    isEdit: boolean,
    setIsAlertOpen: (isOpen: boolean) => void
    onSubmit: (e: any) => void,
    datetimeRef: React.MutableRefObject<HTMLIonDatetimeElement | null>,
    holidays: HolidayData[] | undefined
    localHolidays: LocalHolidayData[] | undefined
    toggleEditTask?: (op: { isEdit: boolean, task: TaskRequestData | undefined }) => void,
}

const FormModal: FunctionComponent<FormModalProps> = ({
    isEdit,
    setIsAlertOpen,
    onSubmit,
    datetimeRef,
    toggleEditTask,
    id,
    formData,
    holidays,
    localHolidays
}) => {
    const { clearErrors, control, formState: { errors: fieldErrors }, register, watch, setValue, } = formData
    const { eventType, category, emailNotification, priority, notifyFrequency, status, datetime, timezone } = watch()
    const modal = useRef<HTMLIonModalElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { startOfWeek } = useWeekContext();
    const [selectedTimezone, setSelectedTimezone] = useState<string | null>(timezone || localTimeZone);
    const [selectedTime, setSelectedTime] = useState<Date | null>(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
    const [initialTime, setInitialTime] = useState<Date | null>(null);
    const [popoverContent, setPopoverContent] = useState<string | null>(null);

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

        const mergedHolidaysResult = [
            ...(calenderificHolidaysResult || []),
            ...(localHolidaysResult || [])
        ];

        const mergedHolidaysResultSafe = (calenderificHolidaysResult || []).concat(localHolidaysResult || []);
        return mergedHolidaysResultSafe

    }, [holidays]);

    const holidaysUpdate = (date: string) => {
        let content = ''
        const holidaysOnDate = holidays && holidays
            .flatMap(data => data.holidays)
            .filter(h => h.date.iso === date && h.type.includes('National holiday'));

        const localHolidaysOnDate = localHolidays && localHolidays.filter(d => d.iso_date == date)

        if (localHolidaysOnDate && localHolidaysOnDate.length > 0 && holidaysOnDate && holidaysOnDate.length > 0) {
            content += localHolidaysOnDate.map(holiday => {
                if (holiday.holidayName.includes('Bank Holiday')) {
                    return `Bank Holiday (${holiday.region})`
                }
                return `${holiday.holidayName} [${holiday.region}]`
            }).join(',')
            content += ', '
            content += holidaysOnDate
                .map(holiday => `${holiday.name}-${holiday.country.name}`)
                .join(',');
            setPopoverContent(content)

        } else if (localHolidaysOnDate && localHolidaysOnDate.length > 0) {
            const content = localHolidaysOnDate.map(holiday => {
                if (holiday.holidayName.includes('Bank Holiday')) {
                    return `Bank Holiday (${holiday.region})`
                }
                return `${holiday.holidayName} [${holiday.region}]`
            }
            ).join(',')
            setPopoverContent(content)

        } else if (holidaysOnDate && holidaysOnDate.length > 0) {
            const content = holidaysOnDate
                .map(holiday => `${holiday.name}-${holiday.country.name}`)
                .join(',');
            setPopoverContent(content);

        } else {
            setPopoverContent(null)
        }
    }


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
            holidaysUpdate(date)
            setSelectedTime(time);
        } else if (!isEdit) {
            const date = dayjs().format('YYYY-MM-DD')
            setSelectedDate(date);
            holidaysUpdate(date)
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
        const date = event.detail.value as string
        setSelectedDate(date);
        holidaysUpdate(date)
    };


    const onSkipDays = (days: number) => {
        const updated = dayjs().add(days, 'day')
        setSelectedDate(updated.format('YYYY-MM-DD'))
        holidaysUpdate(updated.format('YYYY-MM-DD'))
    }

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const addCardTitle = 'Add Task/Meeting'
    const editCardTitle = `Edit ${eventType == 'Meeting' ? "Meeting" : 'Task'}`

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
            color: 'black',
            backgroundColor: '#d7eee4'
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#f0f0f0' : provided.backgroundColor,
            color: state.isFocused ? '#333' : provided.color,
        }),
    };


    const buildMaxYear = (): string => {
        const currentYear = new Date().getFullYear();
        const maxYear = currentYear + 10
        const maxDate = `${maxYear}-12-31T23:59:59`
        return maxDate
    };

    const titleTextAreaStyle: CSSProperties = {
        height: '50px',
        width: "100%",
        marginTop: '-15px'
    }

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
                                <b>Status:</b> <span style={{ color: status === 'Done' ? 'green' : 'orange' }}>{status}</span>
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
                        ]} position="top" isOpen={true} message={'Please Enter a Valid Title!'} duration={3000}></IonToast>}

                    <form id="task-form" onSubmit={(e) => {
                        handleSave();
                        onSubmit(e)
                    }} >
                        <IonItem lines="none">
                            <IonLabel position="fixed" color={fieldErrors.title ? 'danger' : 'secondary'}><b>Title: <IonText color="danger">*</IonText>
                            </b></IonLabel>
                            <IonInput
                             {...register("title", {
                                required: {
                                    value: true,
                                    message: 'Title is required!'
                                }
                            })} type="text" style={{ border: 'none', height: '30px', width: '250px', outline: 'none' }} />
                        </IonItem>


                        <IonItem lines="none">
                            <IonLabel position="fixed" color={'secondary'} ><b>Priority:</b></IonLabel>
                            <IonSelect class="ion-no-padding" {...register("priority")} value={priority} placeholder="Select Priority" onIonChange={e => setValue('priority', e.target.value)}>
                                <IonSelectOption value={'Urgent'}>Urgent</IonSelectOption>
                                <IonSelectOption value={'Moderate'}>Moderate</IonSelectOption>
                                <IonSelectOption value={'Normal'}>Normal</IonSelectOption>
                            </IonSelect>
                        </IonItem>

                        <IonItem lines="none">
                            <IonLabel position="fixed" color={'secondary'}><b>Type:</b></IonLabel>
                            <ToggleWithLabel initialLabel={eventType} labels={["Task", "Meeting"]}
                                onSelect={e => setValue('eventType', e)} />
                        </IonItem>

                        <CategoryDropdown initialValue={category} onSave={e => setValue('category', e)} />

                        <IonItem lines="none">
                            <IonLabel position="fixed" color={'secondary'}><b>Description:</b></IonLabel>
                            <IonTextarea  maxlength={500} counter={true} {...register("description")}></IonTextarea>
                        </IonItem>


                        {isEdit && <IonItem lines="none">
                            <IonLabel position="fixed" color={'secondary'}><b>Status:</b></IonLabel>
                            <IonCheckbox
                                checked={status == 'Done'}
                                value={status}
                                onIonChange={(e) => {
                                    setValue('status', e.target.checked ? 'Done' : 'InProgress')
                                }}>{eventType} Done?</IonCheckbox>
                        </IonItem>}

                        {eventType == 'Task' && <SubTaskForm fieldName="subTasks" isTask={true} control={control} />}
                        {eventType == 'Meeting' && <SubTaskForm fieldName="checklists" isTask={false} control={control} />}

                        <IonLabel color={'secondary'} style={{ marginLeft: '15px' }} position="fixed" >
                            <b> Timezone:</b> {selectedTimezone != localTimeZone && <IonButton size="small" fill="solid" color={'warning'} style={{ marginTop: '-5px' }} onClick={() => { setSelectedTimezone(localTimeZone) }}>Set Local</IonButton>}
                        </IonLabel>
                        <Select
                            styles={customTimezoneSelectorStyles}
                            value={{ value: selectedTimezone, label: selectedTimezone == localTimeZone ? `(Local) ${localTimeZoneLabel}` : `${selectedTimezone} ${selectedTimezone && getTimezoneOffset(selectedTimezone)}` }}
                            onChange={handleChangeOnTimezone}
                            options={timezones}
                            placeholder="Select a timezone..."
                            isClearable={false}
                        />

                        <IonItem lines="none">
                            <div>
                                <IonLabel position="fixed" color={'secondary'}><b>Set Time and Date:</b></IonLabel>
                                <StaticTimePickerLandscape
                                    initialTime={initialTime?.toUTCString() || ''}
                                    selectedTimezone={selectedTimezone || ''}
                                    onTimeChange={handleTimeChange}
                                />
                            </div>
                        </IonItem>
                        <IonItem lines="none">
                            <IonImg style={{ width: '20px', height: '20px', marginRight: '5px' }} src='/assets/calender.png' />
                            <IonButton color={'light'} onClick={openModal} style={{ cursor: 'pointer', backgroundColor: 'inherit' }}>{new Date(selectedDate).toLocaleDateString()}</IonButton>


                            {isModalOpen && <IonModal title="Set Date" aria-hidden={false} mode="ios" className="custom-modal" isOpen={isModalOpen} onDidDismiss={closeModal} >
                                <IonHeader>
                                    <IonToolbar>
                                        <IonTitle>Set Date</IonTitle>
                                        <IonButton size="small" slot="end" color="light" onClick={closeModal}>
                                            <IonIcon slot="icon-only" icon={close}></IonIcon>
                                        </IonButton>
                                    </IonToolbar>

                                    <IonItem lines="none" >
                                        {popoverContent != null && popoverContent.includes('-India') && <IonBadge color={'tertiary'}>Indian Public Holiday</IonBadge>}
                                        {popoverContent != null && popoverContent.includes('-Saudi') && <IonBadge color={'tertiary'}>Saudi Public Holiday</IonBadge>}
                                        {popoverContent != null && (popoverContent?.includes('Bank Holiday')) && <IonBadge color='danger'>Bank Holiday</IonBadge>}
                                        {popoverContent != null && popoverContent.includes('[') && (<IonBadge color="warning">Local Holiday</IonBadge>)}
                                    </IonItem>

                                </IonHeader>

                                <IonContent>

                                    <IonDatetime
                                        highlightedDates={highlightedDates}
                                        value={selectedDate}
                                        size="fixed"
                                        ref={datetimeRef}
                                        id="datetime"
                                        onIonChange={handleDateChange}
                                        min={new Date().toISOString().split("T")[0]}
                                        formatOptions={{
                                            date: {
                                                weekday: 'short',
                                                month: 'long',
                                                day: '2-digit',
                                            },
                                        }}
                                        name="datetime"
                                        presentation='date'
                                        showDefaultTimeLabel={true}
                                        max={buildMaxYear()}
                                    >
                                        {popoverContent != null && <IonTextarea style={titleTextAreaStyle} shape='round' aria-label='task-title' value={popoverContent} slot="title" readonly></IonTextarea>
                                        }
                                    </IonDatetime>

                                    <IonItem lines="none">
                                        <IonButton fill="solid" color='success' onClick={() => onSkipDays(30)}>+30 days</IonButton>
                                        <IonButton fill="solid" color='success' onClick={() => onSkipDays(60)}>+60 days</IonButton>
                                        <IonButton fill="solid" color='success' onClick={() => onSkipDays(90)}>+90 days</IonButton>
                                        <IonButton fill="solid" color='warning' onClick={() => {
                                            setValue('datetime', new Date().toJSON());
                                            datetimeRef.current?.reset()
                                        }}>Reset</IonButton>
                                    </IonItem>
                                    <IonItem lines="none" >
                                        <IonInput
                                            clearInput
                                            clearOnEdit
                                            type='number' placeholder="Or Enter days count to skip.." onIonChange={(e) => onSkipDays(parseInt(e.detail.value || '') || 3)} ></IonInput>
                                    </IonItem>
                                    <div style={{ height: '10px' }}></div>
                                </IonContent>
                            </IonModal>
                            }

                            <IonImg style={{ width: '20px', height: '20px', marginRight: '5px' }} src='/assets/clock.png' />

                            <IonButton color='light'>{selectedTime?.toLocaleTimeString('en-IN',
                                { hour: 'numeric', minute: 'numeric', hour12: true }) || ''}
                            </IonButton>

                        </IonItem>

                        <IonItem lines="none">
                            <IonLabel position="fixed" color={'secondary'}> <b>Email Notification</b></IonLabel>
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
                            <IonItem lines="none">
                                <IonLabel position="fixed" color={'secondary'}><b>Notify Frequency</b></IonLabel>
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
        </Fragment >
    );
}

export default FormModal