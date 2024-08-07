import { IonModal, IonHeader, IonToolbar, IonRow, IonImg, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonDatetimeButton, IonBadge, IonDatetime, IonButton, IonRadioGroup, IonRadio, IonNote, IonCol, IonAccordion, IonAccordionGroup, IonItemSliding, IonIcon, IonToast, IonText, IonCheckbox } from "@ionic/react"
import { Fragment, FunctionComponent, useCallback, useEffect, useRef } from "react"
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors, UseFormClearErrors, Control } from "react-hook-form"
import CategoryDropdown from "./CategoryDropdown"
import { formatISTDateToString } from "./CreateUpdateTask"
import StaticTimePickerLandscape from "./TimePicker"
import ToggleWithLabel from "./Toggle"
import { EventData, TaskRequestData } from "./task"
import React from "react"
import SubTaskForm from './SubTask'

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
    control: Control<EventData, any>
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
    control
}) => {
    const { eventType, category, datetime, emailNotification, priority, notifyFrequency, status,subTasks,checklists } = watch()
    useEffect(() => {
        updateTaskTime(new Date(datetime))
    }, [])
    const modal = useRef<HTMLIonModalElement>(null);

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
                        <IonRow>
                            {!isEdit && <Fragment><IonImg style={{ width: '40px', height: '40px' }} src="/assets/task.png"></IonImg>
                                <IonImg style={{ width: '40px', height: '40px' }} src="/assets/meeting-new.png"></IonImg>
                                <IonTitle style={{ fontWeight: '700', position: 'relative', color: '#064282', textAlign: 'center', marginLeft: '-50px' }}>{addCardTitle}</IonTitle>
                            </Fragment>}
                            {isEdit && <Fragment><IonImg style={{ width: '40px', height: '40px' }} src={`/assets/${eventType == 'Meeting' ? 'meeting-new' : 'task'}.png`}></IonImg>
                                <IonTitle style={{ fontWeight: '700', position: 'relative', color: '#064282', textAlign: 'center', marginLeft: '-50px' }}>{editCardTitle}</IonTitle>
                            </Fragment>}
                            <IonBadge style={{ width: '150px', textAlign: 'start' }} color={'light'}>Status: <span style={{ color: status == 'Done' ? 'green' : 'orange' }}>{status}</span>{status == 'Done' && <span className="tick-mark">✔</span>}</IonBadge>
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

                    <form id="task-formj" onSubmit={onSubmit}>
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


                        {eventType == 'Task' && <SubTaskForm fieldName="subTasks"  isTask={true} control={control}/>}
                        {eventType == 'Meeting' && <SubTaskForm fieldName="checklists"   isTask={false} control={control}/> }


                        <IonItem>
                            <div>
                                <IonLabel position="fixed">Set Time and Date:</IonLabel>
                                <StaticTimePickerLandscape initialTime={taskTime} onTimeChange={updateTaskTime} />
                            </div>
                        </IonItem>


                        <IonItem>
                            <IonImg style={{ width: '20px', height: '20px', marginRight: '5px' }} src='/assets/calender.png' />
                            <IonDatetimeButton datetime="datetime" />
                            <IonModal keepContentsMounted={true}>
                                <IonItem>
                                    <IonBadge color='light'>Saudi Calender</IonBadge>
                                    <IonBadge color='light'>Indian Calender</IonBadge>
                                </IonItem>
                                <IonDatetime
                                    value={datetime}
                                    ref={datetimeRef}
                                    onIonChange={e => setValue('datetime', new Date(e.target.value as string).toJSON())}
                                    min={formatISTDateToString(new Date())}
                                    className="date-time"
                                    presentation='date'
                                    id="datetime"
                                    name="datetime"
                                    formatOptions={{
                                        date: {
                                            weekday: 'short',
                                            month: 'long',
                                            day: '2-digit',
                                        },
                                        time: {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false,
                                        }
                                    }}
                                    max="2900-12-30T23:59:59"
                                />
                                <IonItem>
                                    <IonButton fill="solid" color='success' onClick={() => onSkipDays(30)}>+30 days</IonButton>
                                    <IonButton fill="solid" color='success' onClick={() => onSkipDays(60)}>+60 days</IonButton>
                                    <IonButton fill="solid" color='success' onClick={() => onSkipDays(90)}>+90 days</IonButton>
                                    <IonButton fill="solid" color='warning' onClick={() => setValue('datetime', new Date().toJSON())}>Reset</IonButton>
                                </IonItem>
                                <IonItem lines='full'>
                                    <IonInput
                                        type='number' placeholder="Or Enter Manually" labelPlacement='stacked' onIonChange={(e) => onSkipDays(parseInt(e.detail.value || '') || 3)} ></IonInput>
                                </IonItem>
                            </IonModal>
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

                        
                        <IonRow>
                            <IonCol>
                                <IonButton size="small" onClick={() => {
                                    modal.current?.dismiss()
                                    clearErrors()
                                }
                                } color={'warning'} id="task-submit" type="button" expand="block" className="ion-margin-top">
                                    Cancel
                                </IonButton>
                            </IonCol>
                            <IonCol>
                                <IonButton size="small" id="task-submit" type="submit" expand="block" className="ion-margin-top">
                                    Submit
                                </IonButton>
                            </IonCol>
                        </IonRow>
                    </form>

                </IonContent>
            </IonModal>
        </Fragment>
    );
}

export default FormModal