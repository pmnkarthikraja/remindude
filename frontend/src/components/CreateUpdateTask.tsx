import {
    DatetimeChangeEventDetail,
    IonFab, IonFabButton,
    IonIcon,
    IonLoading,
    IonToast
} from "@ionic/react";
import { add } from 'ionicons/icons';
import React, { Fragment, FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as uuid from 'uuid';
import { useCreateTaskMutation, useUpdateTaskMutation } from "../hooks/taskHooks";
import '../styles/CreateTask.css';
import { Platform, useGetPlatform } from "../utils/useGetPlatform";
import FormModal from "./FormModal";
import { getNotificationSchedule } from "./calculateRemindTime";
import { EventData, TaskRequestData } from "./task";

export function formatISTDateToString(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toJSON();
}

export interface CreateTaskFabButtonProps {
    isEdit: boolean;
    email: string;
    taskData?: EventData;
    toggleEditTask?: (op: { isEdit: boolean, task: TaskRequestData | undefined }) => void
}

const CreateEditTaskFabButton: FunctionComponent<CreateTaskFabButtonProps> = ({ email, isEdit, taskData, toggleEditTask }) => {
    const { register, handleSubmit, setValue, reset, watch, clearErrors, formState: { errors }, control } = useForm<EventData>({
        defaultValues: isEdit && taskData ? {
            id: taskData.id,
            email: taskData.email,
            notificationIntervals: taskData.notificationIntervals,
            title: taskData.title,
            priority: taskData.priority,
            eventType: taskData.eventType,
            category: taskData.category,
            description: taskData.description,
            datetime: taskData.datetime,
            emailNotification: taskData.emailNotification,
            notifyFrequency: taskData.notifyFrequency,
            status: taskData.status,
            subTasks: taskData.subTasks,
            checklists: taskData.checklists
        } : {
            title: '',
            datetime: new Date().toJSON(),
            category: {
                name: 'HR',
                label: 'Employee Onboarding'
            },
            description: '',
            emailNotification: false,
            eventType: 'Task',
            priority: 'Urgent',
            notifyFrequency: '0',
            status: 'InProgress',
        }
    });

    const { isLoading: isCreateTaskMutationLoading, isError: isCreateTaskMutationError, error: createTaskMutationError, mutateAsync: createTaskMutation } = useCreateTaskMutation()
    const { isLoading: isUpdateTaskMutationLoading, isError: isUpdateTaskMutationError, error: UpdateTaskMutationError, mutateAsync: UpdateTaskMutation } = useUpdateTaskMutation()

    const [platform, setPlatform] = useState<Platform>('Windows');
    useGetPlatform(setPlatform);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const datetime = useRef<null | HTMLIonDatetimeElement>(null);
    const [taskTime, setTaskTime] = useState<Date | null>(new Date())

    const onSubmit = useCallback(async (data: EventData) => {
        const taskId = uuid.v4();
        const notificationIntervals = getNotificationSchedule(taskTime || new Date(), parseInt(data.notifyFrequency || '0'));
        const formattedDateTime = new Date(data.datetime);
        if (taskTime !== null) {
            formattedDateTime.setHours(taskTime.getHours(), taskTime.getMinutes(), taskTime.getSeconds());
        }

        const createTaskPayload: TaskRequestData = {
            id: taskId,
            priority: data.priority,
            dateTime: formattedDateTime.toJSON(),
            description: data.description,
            email: email,
            dayFrequency: data.notifyFrequency || '0',
            title: data.title,
            emailNotification: data.emailNotification,
            notificationIntervals,
            eventType: data.eventType,
            categoryName: data.category.name,
            categoryLabel: data.category.label,
            status: 'InProgress',
            checklists: data.checklists,
            subTasks: data.subTasks
        }

        const updateTaskPayload: TaskRequestData = {
            id: data.id,
            dateTime: formattedDateTime.toJSON(),
            dayFrequency: data.notifyFrequency || '0',
            description: data.description,
            email: data.email,
            emailNotification: data.emailNotification,
            notificationIntervals,
            priority: data.priority,
            title: data.title,
            eventType: data.eventType,
            categoryName: data.category.name,
            categoryLabel: data.category.label,
            status: data.status,
            checklists: data.checklists,
            subTasks: data.subTasks
        }

        if (isEdit) {
            await onUpdateTask(updateTaskPayload);
            if (typeof toggleEditTask === 'function') {
                toggleEditTask({
                    isEdit: false,
                    task: undefined
                });
            }
            clearErrors();
            setIsModalOpen(false);
        } else {
            await onCreateTask(createTaskPayload);
            clearErrors();
            setIsModalOpen(false);
        }
    }, [taskTime, email, isEdit, clearErrors, toggleEditTask]);

    const onCreateTask = useCallback(async (data: TaskRequestData) => {
        await createTaskMutation(data);
        reset();
    }, [createTaskMutation, reset]);

    const onUpdateTask = useCallback(async (data: TaskRequestData) => {
        await UpdateTaskMutation(data);
        reset();
    }, [UpdateTaskMutation, reset]);

    const onSkipDays =(days: number) => {
        const today = new Date();
        today.setDate(today.getDate() + days);
        setValue('datetime', today.toJSON());
    };

    const handleDateChange = (e: CustomEvent<DatetimeChangeEventDetail>) => {
        const newDate = new Date(e.detail.value as string);
        if (newDate >= new Date()) { // check if new date is within min and max dates
            const formatedDate = new Date();
                formatedDate.setDate(newDate.getDate())
                formatedDate.setMonth(newDate.getMonth())
                formatedDate.setFullYear(newDate.getFullYear())
            
            setValue('datetime',formatedDate.toJSON());
        }
    };

    const updateTaskTime = useCallback((newTaskTime: Date) => {
        setTaskTime(newTaskTime);
    }, []);

    const togglePopover = useCallback(() => {
        setIsModalOpen(prev => !prev);
    }, []);

    const toastMessage = useMemo(() => {
        if (isCreateTaskMutationError && createTaskMutationError) {
            return createTaskMutationError.response?.data.message || '';
        }
        if (isUpdateTaskMutationError && UpdateTaskMutationError) {
            return UpdateTaskMutationError.response?.data.message || '';
        }
        return '';
    }, [isCreateTaskMutationError, createTaskMutationError, isUpdateTaskMutationError, UpdateTaskMutationError]);

    return (
        <Fragment>
            {!isEdit && (
                <IonFab unselectable='off' vertical='bottom' horizontal="end" slot='fixed' className="fab-button">
                    <IonFabButton className="add-fab" onClick={togglePopover}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                    {isModalOpen && (
                        <Fragment>
                            <IonLoading isOpen={isCreateTaskMutationLoading} message={'Creating Task..'} className="loading" />
                            <FormModal
                                id={platform === 'Windows' ? "responsive-modal-windows" : ''}
                                register={register}
                                watch={watch}
                                setValue={setValue}
                                isEdit={isEdit}
                                datetimeRef={datetime}
                                onSkipDays={onSkipDays}
                                onSubmit={handleSubmit(onSubmit)}
                                setIsAlertOpen={setIsModalOpen}
                                taskTime={taskTime}
                                updateTaskTime={updateTaskTime}
                                toggleEditTask={toggleEditTask}
                                fieldErrors={errors}
                                clearErrors={clearErrors}
                                control={control}
                                handleDateChange={handleDateChange}
                            />
                        </Fragment>
                    )}
                    <IonToast color={'danger'} buttons={[{ text: 'Ok', role: 'cancel' }]} position="top" isOpen={!!toastMessage} message={toastMessage} duration={3000} />
                </IonFab>
            )}
            {isEdit && (
                <Fragment>
                    <IonLoading isOpen={isUpdateTaskMutationLoading} message={'Updating Task..'} className="loading" />
                    <IonToast color={'danger'} buttons={[{ text: 'Ok', role: 'cancel' }]} isOpen={!!toastMessage} message={toastMessage} position="top" duration={3000} />
                    <FormModal
                        id={platform === 'Windows' ? "responsive-modal-windows" : ''}
                        setValue={setValue}
                        register={register}
                        watch={watch}
                        isEdit={isEdit}
                        datetimeRef={datetime}
                        onSkipDays={onSkipDays}
                        onSubmit={handleSubmit(onSubmit)}
                        setIsAlertOpen={setIsModalOpen}
                        taskTime={taskTime}
                        updateTaskTime={updateTaskTime}
                        toggleEditTask={toggleEditTask}
                        fieldErrors={errors}
                        clearErrors={clearErrors}
                        control={control}
                        handleDateChange={handleDateChange}
                    />
                </Fragment>
            )}
        </Fragment>
    );
};

export default React.memo(CreateEditTaskFabButton);
