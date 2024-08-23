import { IonAccordion, IonAccordionGroup, IonBadge, IonButton, IonButtons, IonCheckbox, IonImg, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonPopover, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { Fragment, FunctionComponent, useState } from 'react';
import { Control, useFieldArray, useForm } from 'react-hook-form';
import * as uuid from 'uuid';
import '../styles/SubTask.css';
import { EventData, SubTaskData } from './task';

export interface SubTaskFormProps {
  isTask: boolean;
  control: Control<EventData, any>;
  fieldName: 'subTasks' | 'checklists'
}

const SubTaskForm: FunctionComponent<SubTaskFormProps> = ({
  isTask,
  control,
  fieldName
}) => {
  const [swipeAnimation, setSwipeAnimation] = useState<boolean>(true);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const { register, setValue, handleSubmit, clearErrors, reset, watch, formState: { errors } } = useForm<SubTaskData>({
    defaultValues: {
      id:uuid.v4(),
      subtitle: '',
      subdescription: '',
      optional: false
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: fieldName,
    keyName: 'id'
  });


  const [isEdit, setIsEdit] = useState<boolean>(false);

  function onDelete(index: number) {
    remove(index);
    reset();
  }

  function onSubmit() {
    const data = watch();
    if (!isEdit) {
      const id = uuid.v4();
      const taskData: SubTaskData = {
        id,
        optional: data.optional,
        subdescription: data.subdescription,
        subtitle: data.subtitle
      };
      append(taskData);
      reset();
      setPopoverOpen(false);
      return;
    } else {
      const currentTaskIdx = fields.findIndex((task) => task.id === data.id);
      update(currentTaskIdx, data);
      setIsEdit(false);
      setPopoverOpen(false);
      reset();
    }
  }

  function onUpdate(data: SubTaskData) {
    setIsEdit(true);
    setValue('id', data.id);
    setValue('subtitle', data.subtitle);
    setValue('subdescription', data.subdescription);
    setValue('optional', data.optional);
    setPopoverOpen(true);
  }

  const optionalValue = watch('optional');
  const title = isTask ? 'Add SubTasks if any' : 'Add Checklists if any';

  return (
    <Fragment>
      <IonItem >
        <div style={{ display: 'flex', cursor: 'pointer' }} onClick={() => setPopoverOpen(true)} >
          <div style={{
            borderRadius: '50%',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            background: '#2A82F3',
            color: 'white',
            margin: 'auto',
            backgroundColor: '#089C82'
          }}>+</div>
          <div style={{ paddingLeft: '5px' }}>{title}</div>
        </div>
      </IonItem>

      <IonPopover mode='ios' id='add-subtask-popover' isOpen={popoverOpen} onDidDismiss={() => setPopoverOpen(false)}>
        <IonTitle>Add Subtask popover</IonTitle>
        <form id='add-subtask-form'>
          <IonItem id='subtask-title' lines='full'>
            <IonInput id='subtitle-input'
              onIonInput={() => clearErrors('subtitle')}
              {...register("subtitle", {
                required: {
                  message: "Title should not be empty",
                  value: true
                }
              })}
              label='Title' labelPlacement='floating'></IonInput>
            {errors.subtitle && <IonText color="danger">Title is required</IonText>}
          </IonItem>
          <IonItem id='subtask-description' lines='full'>
            <IonInput id='subdescription-input'
              {...register("subdescription")}
              label='Description' labelPlacement='floating'></IonInput>
          </IonItem>
          <IonItem id='subtask-optional' lines='full'>
            <IonCheckbox checked={optionalValue} value={optionalValue}
              onIonChange={e => setValue('optional', !optionalValue)}>
              Optional</IonCheckbox>
          </IonItem>
          <IonToolbar>
            <IonButtons slot='secondary'>
            <IonButton size='small'  fill='solid' onClick={() => { setPopoverOpen(false); }} color={'warning'}>Cancel</IonButton>
            <IonButton size='small'  fill='solid' id='subtask-submit' onClick={handleSubmit(onSubmit)} color={'success'}>Submit</IonButton>
            </IonButtons>
            </IonToolbar>
        </form>
      </IonPopover>

      <IonAccordionGroup multiple={true} expand='inset' animated={true}>
        {fields.map((task, idx) => (
          <IonAccordion key={task.id} value={`${idx}`} style={{ cursor: 'pointer' }}>
            <IonItem slot="header" color="light">
              <span>
                <IonRow>
                  <IonImg src="/assets/subtask.png" className='title-left-img' />
                  {task.subtitle}
                  <div style={{ paddingLeft: '10px' }}></div>
                  {task.optional && <IonText color={'danger'}>(optional)</IonText>}
                </IonRow>
              </span>
            </IonItem>
            <div className="ion-padding" slot="content">
              <IonItemSliding onIonDrag={(e) => {
                if (e.detail.ratio! >= 1) {
                  setSwipeAnimation(false);
                } else {
                  setSwipeAnimation(true);
                }
              }}>
                <IonItem lines='none'>
                  <IonLabel>{task.subdescription}
                    <IonBadge color={'light'}>{new Date().toLocaleDateString()}</IonBadge>
                  </IonLabel>
                  <IonImg src='/assets/leftswipe.png' className={swipeAnimation ? 'swipe-left-img-animate' : 'title-left-img'} style={{ width: '18px', height: 'auto' }} />
                </IonItem>
                <IonItemOptions>
                  <IonItemOption onClick={() => {
                    onUpdate({
                      id: task.id,
                      subtitle: task.subtitle,
                      subdescription: task.subdescription,
                      optional: task.optional
                    })
                  }}>Update</IonItemOption>
                  <IonItemOption onClick={() => onDelete(idx)} color="danger">Delete</IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            </div>
          </IonAccordion>
        ))}
      </IonAccordionGroup>
    </Fragment>
  );
}

export default SubTaskForm;