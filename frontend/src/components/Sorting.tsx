
import { IonAlert, IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonCol, IonContent, IonIcon, IonImg, IonItem, IonLabel, IonLoading, IonRefresher, IonRefresherContent, IonRow, IonSearchbar, IonText, IonTextarea, IonToast, RefresherEventDetail } from '@ionic/react';
import { CSSProperties } from '@mui/styled-engine';
import { chevronDownCircleOutline, chevronDownOutline, chevronUpOutline, sadOutline } from 'ionicons/icons';
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { HolidayData, LocalHolidayData } from '../api/calenderApi';
import { MasterSwitchData } from '../api/userApi';
import { useDeleteTaskMutation } from '../hooks/taskHooks';
import { getRemainingTime } from '../pages/HomePage';
import '../styles/Sorting.css';
import { Platform, useGetPlatform } from '../utils/useGetPlatform';
import { localTimeZone } from '../utils/util';
import CreateEditTaskFabButton from './CreateUpdateTask';
import { EventData, TaskCategory, TaskCategoryName, TaskRequestData } from './task';
import TaskTimer from './TaskTimer';

export interface SortableCardsProps {
  email: string,
  tasksData: TaskRequestData[],
  filters: { [key: string]: string[] },
  sortBy: { name: string, isDescending: boolean } | null
  handleRefresh: (event: CustomEvent<RefresherEventDetail>) => void
  holidays: HolidayData[] | undefined
  localHolidays: LocalHolidayData[] | undefined
  masterSwitchData:MasterSwitchData | undefined
}

const SortableCards: FunctionComponent<SortableCardsProps> = ({
  email,
  tasksData,
  filters,
  sortBy,
  handleRefresh,
  holidays,
  localHolidays,
  masterSwitchData
}) => {
  const [filteredTasks, setFilteredTasks] = useState<TaskRequestData[]>(tasksData);
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isOpen, setIsOpen] = useState<{ index: number, isOpen: boolean }[]>([]);
  const [platform, setPlatform] = useState<Platform>('Unknown')
  const [editTask, setEditTask] = useState<{ isEdit: boolean, task: EventData | undefined } | undefined>(undefined)
  const [confirmDelete, setConfirmDelete] = useState<{ task: TaskRequestData | undefined, isOpen: boolean } | undefined>(undefined)
  const { isError: isDeleteTaskMutationError,isLoading:isDeleteTaskLoading, error: deleteTaskMutationError, mutateAsync: deleteTaskMutation } = useDeleteTaskMutation()

  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
  };

  useGetPlatform(handlePlatformChange)

  const toggleContent = (idx: number) => {
    setIsOpen((prev) => {
      const itemIndex = prev.findIndex(item => item.index === idx);
      if (itemIndex > -1) {
        const newItem = { index: idx, isOpen: !prev[itemIndex].isOpen };
        return [
          ...prev.slice(0, itemIndex),
          newItem,
          ...prev.slice(itemIndex + 1),
        ];
      } else {
        return [...prev, { index: idx, isOpen: true }];
      }
    });
  };

  const isItemOpen = (idx: number) => {
    const item = isOpen.find(item => item.index === idx);
    return item ? item.isOpen : false;
  };

  const updateTasks = () => {
    let updatedTasks = applyFilters(tasksData);
    updatedTasks = applySorting(updatedTasks, sortBy)

    if (searchQuery) {
      updatedTasks = applySearch(updatedTasks, searchQuery);
    }
    setFilteredTasks(updatedTasks);
  };

  useEffect(() => {
    updateTasks();
  }, [tasksData, filters, searchQuery, sortBy]);


  const applyFilters = (tasks: TaskRequestData[]): TaskRequestData[] => {
    let filteredTasks = tasks;

    if (filters.label.length > 0) {
      filteredTasks = filteredTasks.filter((task) =>
        filters.label.includes(task.categoryLabel || '')
      );
    }

    if (filters.category.length > 0) {
      filteredTasks = filteredTasks.filter((task) =>
        filters.category.includes(task.eventType || '')
      );
    }
    if (filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter((task) =>
        filters.priority.includes(task.priority)
      );
    }
    if (filters.status.length == 1) {
      if (filters.status[0] == 'Completed') {
        filteredTasks = filteredTasks.filter(task => getRemainingTime(task.dateTime) < 0)
      } else {
        filteredTasks = filteredTasks.filter(task => getRemainingTime(task.dateTime) > 0)
      }
    }
    return filteredTasks
  };

  const applySorting = (tasks: TaskRequestData[], sortBy: { name: string, isDescending: boolean } | null): TaskRequestData[] => {
    let sortedTasks = [...tasks];
    const pastTasks = sortedTasks.filter(task => getRemainingTime(task.dateTime) < 0);
    const upcomingTasks = sortedTasks.filter(task => getRemainingTime(task.dateTime) >= 0);
    if (sortBy == null) {
      return sortedTasks
    }
    switch (sortBy.name) {
      case 'Upcoming':
        pastTasks.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        if (sortBy.isDescending) {
          upcomingTasks.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        } else {
          upcomingTasks.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        }
        sortedTasks = [...upcomingTasks, ...pastTasks];
        break;
      case 'Finished':
        if (sortBy.isDescending) {
          sortedTasks.sort((a, b) => {
            if (a.status == 'Done' && b.status !== 'Done') {
              return -1
            } else if (a.status !== 'Done' && b.status == 'Done') {
              return 1
            } else {
              return 0
            }
          });
          break
        } else {
          sortedTasks.sort((a, b) => {
            if (a.status == 'InProgress' && b.status !== 'InProgress') {
              return -1
            } else if (a.status !== 'InProgress' && b.status == 'InProgress') {
              return 1
            } else {
              return 0
            }
          });
          break
        }

      case 'Departments':
        if (!sortBy.isDescending) {
          sortedTasks.sort((a, b) => {
            if (a.categoryName && b.categoryName) {
              return a.categoryName.localeCompare(b.categoryName);
            } else {
              return 0;
            }
          });
          break;
        } else {
          sortedTasks.sort((a, b) => {
            if (b.categoryName && a.categoryName) {
              return b.categoryName.localeCompare(a.categoryName);
            } else {
              return 0;
            }
          });
          break;
        }
      case 'Activities':
        if (!sortBy.isDescending) {
          sortedTasks.sort((a, b) => {
            if (a.categoryLabel && b.categoryLabel) {
              return a.categoryLabel.localeCompare(b.categoryLabel);
            } else {
              return 0;
            }
          });
          break;
        } else {
          sortedTasks.sort((a, b) => {
            if (b.categoryLabel && a.categoryLabel) {
              return b.categoryLabel.localeCompare(a.categoryLabel);
            } else {
              return 0;
            }
          });
          break;
        }
    }
    return sortedTasks;
  }

  const applySearch = (tasks: TaskRequestData[], query: string): TaskRequestData[] => {
    const lowerCaseQuery = query.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerCaseQuery) ||
        task.description.toLowerCase().includes(lowerCaseQuery) ||
        (task.eventType && task.eventType.toLowerCase().includes(lowerCaseQuery))
        || (task.categoryName && task.categoryName.toLowerCase().includes(lowerCaseQuery))
        || (task.categoryLabel && task.categoryLabel.toLowerCase().includes(lowerCaseQuery))
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    removed: { opacity: 0, y: 20 },
  };

  const toggleEditTask = (op: { isEdit: boolean, task: TaskRequestData | undefined }) => {
    const taskReqData = op.task
    if (!!taskReqData) {
      const categoryName = taskReqData.categoryName as TaskCategoryName
      const category = {
        name: categoryName,
        label: taskReqData.categoryLabel
      } as TaskCategory

      const data: EventData = {
        id: taskReqData.id,
        email: taskReqData.email,
        notificationIntervals: taskReqData.notificationIntervals,
        title: taskReqData.title,
        category: category,
        datetime: taskReqData.dateTime,
        description: taskReqData.description,
        emailNotification: taskReqData.emailNotification,
        eventType: taskReqData.eventType || 'Meeting',
        priority: taskReqData.priority,
        notifyFrequency: taskReqData.dayFrequency as '0' | '1' | '2' | '3',
        status: taskReqData.status,
        checklists: taskReqData.checklists,
        subTasks: taskReqData.subTasks,
        timezone: taskReqData.timezone
      }
      setEditTask({
        isEdit: op.isEdit,
        task: data
      })
      return
    }
    setEditTask({
      isEdit: op.isEdit,
      task: undefined
    })
  }

  const onDeleteTask = async (email: string, id: string) => {
    await deleteTaskMutation({
      email,
      id
    })
  }


  const cardContentStyle: CSSProperties = {
    height: '120vh',
    width: '100%',
    paddingBottom: '100px',
    maxHeight: '200vh',
    backgroundColor: 'inherit',
  }

  const iconStyle: CSSProperties = {
    width: '20px',
    height: '20px',
  }

  const eventTypeStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
  const eventImgStyle: CSSProperties = {
    width: '18px',
    height: '18px'
  }

  const titleTextAreaStyle: CSSProperties = {
    height: '50px',
    width: "100%",
    minWidth:'120px',
    marginTop: '-15px'
  }

  type HTMLStyle = { [key: string]: string }

  return (
    <div style={cardContentStyle as HTMLStyle}  >
      <IonSearchbar
        value={searchQuery}
        onIonInput={e => handleSearch(e.detail.value!)}
        debounce={500}
        placeholder="Search tasks"
      />
      {<Fragment>
        {(!!editTask && editTask.isEdit) &&
          <CreateEditTaskFabButton holidays={holidays} localHolidays={localHolidays} email={email} isEdit={true} taskData={editTask.task} toggleEditTask={toggleEditTask} masterSwitchData={masterSwitchData} />
        }
      </Fragment>}

      {!!confirmDelete && confirmDelete.isOpen &&
        <IonAlert
          isOpen={confirmDelete.isOpen}
          header="Confirm Delete?"
          message={!!confirmDelete && `Title: ${confirmDelete.task?.title}`}
          // className="custom-alert"
          onDidDismiss={() => setConfirmDelete({
            task: undefined,
            isOpen: false
          })}
          buttons={[
            {
              text: 'No',
              cssClass: 'alert-button-cancel',
              handler: () => {
                setConfirmDelete({
                  task: undefined,
                  isOpen: false
                })
              }
            },
            {
              text: 'Yes',
              cssClass: 'alert-button-confirm',
              handler: () => {
                !!confirmDelete.task && onDeleteTask(confirmDelete.task.email, confirmDelete.task.id)
                setConfirmDelete({
                  task: undefined,
                  isOpen: false
                })
              }
            },
          ]}
        >
        </IonAlert>
      }

      <IonToast color={'danger'} isOpen={isDeleteTaskMutationError} message={deleteTaskMutationError?.response?.data.message || deleteTaskMutationError?.message} position='top' duration={3000} />

      <IonContent>
      <IonLoading isOpen={isDeleteTaskLoading} message={'Deleting..'} />
        <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            pullingText="Pull to refresh"
            refreshingSpinner="bubbles"
            refreshingText="Refreshing Tasks..."
          >
          </IonRefresherContent>
        </IonRefresher>

        {/* <Reorder.Group axis='y' drag={false} style={{ listStyle: 'none', marginLeft: '-40px',scrollBehavior:'smooth',transition:'ease-in' }} values={filteredTasks} onReorder={setFilteredTasks} animate={true}>
    
        </Reorder.Group> */}

        {filteredTasks.map((task, idx) => {
          const icon = task.priority === 'Urgent' ? 'highPriority' : task.priority === 'Moderate' ? 'mediumPriority1' : 'lowPriority';
          return (
            // <Reorder.Item key={task.id} value={task} >
            <IonCard key={idx} style={{ boxShadow: '0 4px 8px rgba(1, 1, 100, 0.3)' }}>
              <IonCardHeader>
                <IonRow >
                  <IonCol sizeXs='12' sizeSm='8' sizeMd='8' sizeLg='6' sizeXl='8'> 
                    <IonItem lines='none'>
                      <IonImg slot='start' style={iconStyle} src={`/assets/${icon}.png`} />
                      <IonTextarea style={titleTextAreaStyle} shape='round' aria-label='task-title' value={task.title} readonly></IonTextarea>
                    </IonItem>
                  </IonCol>

                  <IonCol sizeXs='12' sizeSm='4' sizeMd='4' sizeLg='6' sizeXl='4'>
                    <IonItem>
                  <IonBadge style={{ color: task.status == 'Done' ? 'green' : 'orange', background: "inherit",minWidth:'80px', textAlign: 'start' }}>{task.status}{task.status == 'Done' && <span className="tick-mark">✔</span>}</IonBadge>
                  <div style={{width:'10px'}}></div>
                  
                  <div style={{display:'flex', flexDirection:'row',flex:'1'}}>
                    <IonImg onClick={() => toggleEditTask({
                      isEdit: true,
                      task
                    })} style={{ ...iconStyle, marginRight: '15px', cursor: 'pointer' }} src='/assets/edit1.png' />

                    <IonImg onClick={() => {
                      setConfirmDelete({
                        isOpen: true,
                        task: task,
                      });

                    }} style={{ ...iconStyle, cursor: 'pointer' }} src='/assets/trash1.png' />
               </div>
                  </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol style={{ width: '300px' }}>
                    <IonItem lines='none'>
                      <IonImg style={{ ...iconStyle, marginRight: '5px' }} src='/assets/calender.png' />
                      <IonCardTitle style={{ fontSize: '15px', marginRight: '10px' }}>{new Date(task.dateTime).toLocaleDateString()}</IonCardTitle>

                      <IonImg style={{ ...iconStyle, marginRight: '5px' }} src='/assets/clock.png' />
                      <IonCardTitle style={{ fontSize: '15px', marginRight: '10px', width: '70px', whiteSpace: 'nowrap' }}>{
                        new Date(task.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: localTimeZone, timeZoneName: 'short' })}</IonCardTitle>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <TaskTimer task={task} key={idx} />
                </IonRow>

                <IonItem lines='none' >
                  {platform == 'Windows' &&
                    <Fragment>
                      <IonCol style={{ width: 'auto', minWidth: "100px" }}>
                        <IonBadge style={{ color: '#7F0DB5', background: 'inherit' }}>
                          <IonRow>
                            {task.eventType == 'Meeting' && <div style={eventTypeStyle as HTMLStyle}>
                              <IonImg src='/assets/meeting-new.png' style={eventImgStyle} />
                              <IonLabel >{task.eventType}</IonLabel>
                            </div>}
                            {task.eventType == 'Task' && <div style={eventTypeStyle as HTMLStyle}>
                              <IonImg src='/assets/task.png' style={eventImgStyle} />
                              <IonLabel>{task.eventType}</IonLabel>
                            </div>}
                          </IonRow>
                        </IonBadge>
                      </IonCol>

                      <IonCol style={{ width: 'auto', minWidth: '150px' }}>
                        <IonBadge style={{ color: 'inherit', background: 'rgba(58,33,110,0.1)' }}>
                          {task.categoryLabel}
                        </IonBadge>
                      </IonCol>

                      <IonCol>
                        <IonBadge style={{ color: '#089C82', background: "inherit", paddingLeft: "10px", minWidth: '100px', textAlign: 'start' }}>{task.categoryName}</IonBadge>
                      </IonCol>

                      <IonCol  >
                        <IonChip className='chip' key={idx} outline={true} color='secondary' onClick={() => toggleContent(idx)}>
                          <IonLabel>Description</IonLabel>
                          <IonIcon icon={isItemOpen(idx) ? chevronUpOutline : chevronDownOutline} />
                        </IonChip>
                      </IonCol>
                    </Fragment>
                  }

                  {platform != 'Windows' && <Fragment>
                    <IonRow>
                      <IonCol >
                        <IonBadge style={{ color: '#7F0DB5', background: 'inherit', marginTop: '-2px' }}>
                          <IonRow>
                            {task.eventType == 'Meeting' && <div style={eventTypeStyle as HTMLStyle}>
                              <IonImg src='/assets/meeting-new.png' style={eventImgStyle} />
                              <IonLabel >{task.eventType}</IonLabel>
                            </div>}
                            {task.eventType == 'Task' && <div style={eventTypeStyle as HTMLStyle}>
                              <IonImg src='/assets/task.png' style={eventImgStyle} />
                              <IonLabel>{task.eventType}</IonLabel>
                            </div>}
                          </IonRow>
                        </IonBadge>
                      </IonCol>
                      <IonCol style={{ minWidth: '150px' }}>
                        <IonBadge style={{ color: '#089C82', backgroundColor: "inherit" }}>{task.categoryName}</IonBadge>
                      </IonCol>
                      <IonCol style={{ minWidth: '170px' }}>
                        <IonBadge style={{ color: 'inherit', background: 'inherit' }}>
                          {task.categoryLabel}
                        </IonBadge>
                      </IonCol>
                      <IonCol >
                        <IonIcon onClick={() => toggleContent(idx)} icon={isItemOpen(idx) ? chevronUpOutline : chevronDownOutline} />
                      </IonCol>
                    </IonRow>
                  </Fragment>}
                </IonItem>
              </IonCardHeader>
              <IonCardContent>
                {isItemOpen(idx) && (
                  <div className={`content ${isOpen ? 'open' : 'closed'}`}>
                    <IonText color='dark'>{task.description} </IonText><br />
                  </div>
                )}
              </IonCardContent>
            </IonCard>
            //  </Reorder.Item>
          );
        })}
        {tasksData.length !== 0 && <IonContent style={{ marginLeft: '-40px', height: '600px', width: '100px', overflowY: 'auto' }}></IonContent>}
        {tasksData.length === 0 && (
          <Fragment>
            <IonCard style={{ backgroundColor: 'inherit', textAlign: 'center', padding: '20px', boxShadow: '0 4px 8px rgba(1, 1, 100, 0.9)', borderRadius: '15px', animation: 'fadeIn 1s ease-in-out' }}>
              <IonCardHeader>
                <IonItem lines="none" style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <IonRow>
                    <IonCol style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <IonIcon icon={sadOutline} style={{ fontSize: '40px', color: '#ff6b6b', marginBottom: '0px', animation: 'bounce 2s infinite' }} />
                      <IonCardTitle style={{ fontSize: '18px', margin: '10px 0' }}>&nbsp; Sorry, No Data Found</IonCardTitle>
                    </IonCol>
                  </IonRow>
                </IonItem>
              </IonCardHeader>
            </IonCard>
            <style>
              {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}
            </style>
          </Fragment>
        )}

      </IonContent>
    </div>
  );
};

export default SortableCards;
``