import { DatetimeChangeEventDetail, IonBadge, IonButton, IonButtons, IonCheckbox, IonCol, IonContent, IonDatetime, IonFooter, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonModal, IonNote, IonRadio, IonRadioGroup, IonRow, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToast, IonToolbar } from "@ionic/react"
import { close, closeOutline, closeSharp } from "ionicons/icons"
import React, { Fragment, FunctionComponent, useEffect, useRef, useState } from "react"
import { Control, FieldErrors, UseFormClearErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import CategoryDropdown from "./CategoryDropdown"
import SubTaskForm from './SubTask'
import StaticTimePickerLandscape from "./TimePicker"
import ToggleWithLabel from "./Toggle"
import { EventData, TaskRequestData } from "./task"


interface FormModalProps {
    id: string
    register: UseFormRegister<EventData>,
    watch: UseFormWatch<EventData>,
    setValue: UseFormSetValue<EventData>,
    isEdit: boolean,
    setIsAlertOpen: (isOpen: boolean) => void
    onSubmit: (e: any) => void,
    updateTaskTime: (time: Date) => void,
    datetimeRef: React.MutableRefObject<HTMLIonDatetimeElement | null>,
    onSkipDays: (n: number) => void,
    taskTime: Date | null,
    toggleEditTask?: (op: { isEdit: boolean, task: TaskRequestData | undefined }) => void,
    fieldErrors: FieldErrors<EventData>
    clearErrors: UseFormClearErrors<EventData>
    control: Control<EventData, any>,
    handleDateChange: (e: CustomEvent<DatetimeChangeEventDetail>) => void
}

const FormModal: FunctionComponent<FormModalProps> = ({
    register,
    watch,
    setValue,
    isEdit,
    setIsAlertOpen,
    onSubmit,
    updateTaskTime,
    datetimeRef,
    onSkipDays,
    taskTime,
    toggleEditTask,
    id,
    fieldErrors,
    clearErrors,
    control,
    handleDateChange
}) => {
    const { eventType, category, datetime, emailNotification, priority, notifyFrequency, status } = watch()
    const modal = useRef<HTMLIonModalElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        updateTaskTime(new Date(datetime))
    }, [])

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const addCardTitle = 'Add Task/Meeting'
    const editCardTitle = `Edit ${eventType == 'Meeting' ? "Meeting" : 'Task'}`
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
            <IonButton  onClick={()=>{}}>
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

                    <form id="task-form" onSubmit={onSubmit} >
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

                        <IonItem>
                            <div>
                                <IonLabel position="fixed">Set Time and Date:</IonLabel>
                                <StaticTimePickerLandscape initialTime={taskTime} onTimeChange={updateTaskTime} />
                            </div>
                        </IonItem>

                        <IonItem>
                            <IonImg style={{ width: '20px', height: '20px', marginRight: '5px' }} src='/assets/calender.png' />
                            <IonBadge color='light' onClick={openModal} style={{ cursor: 'pointer' }}>{new Date(datetime).toLocaleDateString()}</IonBadge>

                            {isModalOpen && <IonModal aria-hidden={false} mode="ios" className="custom-modal" isOpen={isModalOpen} onDidDismiss={closeModal} >
                                <IonItem>
                                    <IonBadge color='light'>Saudi Calender</IonBadge>
                                    <IonBadge color='light'>Indian Calender</IonBadge>
                                    <IonButton size="small" slot="end" color={"light"} onClick={closeModal}>
                                        <IonIcon slot="icon-only" icon={close}></IonIcon>
                                    </IonButton>
                                </IonItem>

                                <IonDatetime
                                    value={datetime}
                                    ref={datetimeRef}
                                    onIonChange={handleDateChange}
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
                                    showDefaultTimeLabel
                                    max="2900-12-30T23:59:59"
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
                            <IonBadge color='light'>{taskTime?.toLocaleTimeString('en-IN',
                                { hour: 'numeric', minute: 'numeric', hour12: true }) || ''}
                            </IonBadge>
                        </IonItem>


                        <IonItem>
                            <IonLabel position="fixed"> Email Notification?</IonLabel>
                            <IonRadioGroup
                                onIonChange={(e) => setValue('emailNotification', e.detail.value === 'yes')}
                                {...register("emailNotification")}
                                value={emailNotification ? 'yes' : 'no'}
                            >
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
                                clearErrors()}
                            } color={'warning'} id="task-submit" type="button" expand="full">
                                Cancel
                            </IonButton>
                        </IonCol>
                        <IonCol>
                            <IonButton  size="small" id="task-submit" type="submit" expand="full" form="task-form">
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