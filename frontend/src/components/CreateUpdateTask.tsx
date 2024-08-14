import {
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
    const formData = useForm<EventData>({
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
            checklists: taskData.checklists,
            timezone: taskData.timezone,
        } : {
            title: '',
            datetime: new Date().toISOString(),
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

    const onSubmit = useCallback(async (data: EventData) => {
        const taskId = uuid.v4();
        const notificationIntervals = getNotificationSchedule(new Date(data.datetime) || new Date(), parseInt(data.notifyFrequency || '0'));

        const createTaskPayload: TaskRequestData = {
            id: taskId,
            priority: data.priority,
            dateTime: data.datetime,
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
            subTasks: data.subTasks,
            timezone: data.timezone
        }

        const updateTaskPayload: TaskRequestData = {
            id: data.id,
            dateTime: data.datetime,
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
            subTasks: data.subTasks,
            timezone: data.timezone
        }

        if (isEdit) {
            await onUpdateTask(updateTaskPayload);
            if (typeof toggleEditTask === 'function') {
                toggleEditTask({
                    isEdit: false,
                    task: undefined
                });
            }
            formData.clearErrors();
            setIsModalOpen(false);
        } else {
            await onCreateTask(createTaskPayload);
            formData.clearErrors();
            setIsModalOpen(false);
        }
    }, [email, isEdit, formData.clearErrors, toggleEditTask]);

    const onCreateTask = useCallback(async (data: TaskRequestData) => {
        await createTaskMutation(data);
        formData.reset();
    }, [createTaskMutation, formData.reset]);

    const onUpdateTask = useCallback(async (data: TaskRequestData) => {
        await UpdateTaskMutation(data);
        formData.reset();
    }, [UpdateTaskMutation, formData.reset]);


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

                                isEdit={isEdit}
                                datetimeRef={datetime}
                                onSubmit={formData.handleSubmit(onSubmit)}
                                setIsAlertOpen={setIsModalOpen}
                                toggleEditTask={toggleEditTask}
                                formData={formData}
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
                        isEdit={isEdit}
                        datetimeRef={datetime}
                        onSubmit={formData.handleSubmit(onSubmit)}
                        setIsAlertOpen={setIsModalOpen}
                        toggleEditTask={toggleEditTask}
                        formData={formData}
                    />
                </Fragment>
            )}
        </Fragment>
    );
};

export default React.memo(CreateEditTaskFabButton);
