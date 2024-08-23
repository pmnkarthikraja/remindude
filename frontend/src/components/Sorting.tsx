
import { IonAlert, IonBadge, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonCol, IonContent, IonIcon, IonImg, IonItem, IonLabel, IonRefresher, IonRefresherContent, IonRow, IonSearchbar, IonText, IonTextarea, IonToast, RefresherEventDetail } from '@ionic/react';
import { CSSProperties } from '@mui/styled-engine';
import { AnimatePresence, Reorder } from 'framer-motion';
import { chevronDownCircleOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import React, { Fragment, FunctionComponent, useEffect, useRef, useState } from 'react';
import { useDeleteTaskMutation } from '../hooks/taskHooks';
import { getRemainingTime } from '../pages/HomePage';
import { Platform, useGetPlatform } from '../utils/useGetPlatform';
import CreateEditTaskFabButton from './CreateUpdateTask';
import '../styles/Sorting.css';
import { EventData, TaskCategory, TaskCategoryName, TaskRequestData } from './task';
import { localTimeZone } from '../utils/util';
import { CalenderHoliday, HolidayData, LocalHolidayData } from '../api/calenderApi';

export interface SortableCardsProps {
  email: string,
  tasksData: TaskRequestData[],
  filters: { [key: string]: string[] },
  sortBy: { name: string, isDescending: boolean } | null
  handleRefresh: (event: CustomEvent<RefresherEventDetail>) => void
  holidays:HolidayData[] | undefined
  localHolidays:LocalHolidayData[]|undefined
}

const SortableCards: FunctionComponent<SortableCardsProps> = ({
  email,
  tasksData,
  filters,
  sortBy,
  handleRefresh,
  holidays,
  localHolidays
}) => {
  const [filteredTasks, setFilteredTasks] = useState<TaskRequestData[]>(tasksData);
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isOpen, setIsOpen] = useState<{ index: number, isOpen: boolean }[]>([]);
  const [platform, setPlatform] = useState<Platform>('Unknown')
  const [editTask, setEditTask] = useState<{ isEdit: boolean, task: EventData | undefined } | undefined>(undefined)
  const [confirmDelete, setConfirmDelete] = useState<{ task: TaskRequestData | undefined, isOpen: boolean } | undefined>(undefined)
  const { isError: isDeleteTaskMutationError, error: deleteTaskMutationError, mutateAsync: deleteTaskMutation } = useDeleteTaskMutation()

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
        timezone:taskReqData.timezone
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
    width:'100%',
    paddingBottom:'100px',
    maxHeight: '200vh',
    overflowY: 'auto',
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
    width: "70%",
    marginTop: '-15px'
  }

  type HTMLStyle = { [key: string]: string }

  return (
    <div style={cardContentStyle as HTMLStyle} role='feed' >
      <IonSearchbar
        value={searchQuery}
        onIonInput={e => handleSearch(e.detail.value!)}
        debounce={500}
        placeholder="Search tasks"
      />
      {<Fragment>
        {(!!editTask && editTask.isEdit) &&
          <CreateEditTaskFabButton holidays={holidays} localHolidays={localHolidays} email={email} isEdit={true} taskData={editTask.task} toggleEditTask={toggleEditTask} />
        }
      </Fragment>}

      {!!confirmDelete && confirmDelete.isOpen &&
        <IonAlert
          isOpen={confirmDelete.isOpen}
          header="Confirm Delete?"
          message={!!confirmDelete && `Title: ${confirmDelete.task?.title}`}
          className="custom-alert"
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

      <IonToast isOpen={isDeleteTaskMutationError} message={deleteTaskMutationError?.response?.data.message} position='top' duration={3000} />

      <IonContent>
        <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            pullingText="Pull to refresh"
            refreshingSpinner="bubbles"
            refreshingText="Refreshing Tasks..."
          >
          </IonRefresherContent>
        </IonRefresher>

        <Reorder.Group drag={false} style={{ listStyle: 'none', marginLeft: '-40px', scrollBehavior:'smooth' }} values={filteredTasks} onReorder={setFilteredTasks} animate={true}>
          <AnimatePresence >
            {filteredTasks.map((task, idx) => {
              const icon = task.priority === 'Urgent' ? 'highPriority' : task.priority === 'Moderate' ? 'mediumPriority1' : 'lowPriority';

              return (
                <Reorder.Item role='article' drag={false} key={task.id} value={task} initial="hidden" animate="visible" exit="removed" variants={variants} transition={{ duration: 0.2, ease: 'linear' }} >
                  <IonCard style={{ backgroundColor: 'white' }}>
                    <IonCardHeader>
                      <IonRow >
                        <IonCol>
                          <IonItem lines='none'>
                            <IonImg slot='start' style={iconStyle} src={`/assets/${icon}.png`} />
                            <IonTextarea  style={titleTextAreaStyle} shape='round' aria-label='task-title' value={task.title} readonly></IonTextarea>
                            <IonBadge style={{ color: task.status == 'Done' ? 'green' : 'orange', background: "white", paddingLeft: "10px", minWidth: '100px', textAlign: 'start' }}>{task.status}{task.status == 'Done' && <span className="tick-mark">✔</span>}</IonBadge>
                          </IonItem>
                        </IonCol>
                        <IonButtons >
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
                        </IonButtons>
                      </IonRow>
                      <IonRow>
                        <IonCol style={{ width: '300px' }}>
                          <IonItem lines='none'>
                            <IonImg style={{ ...iconStyle, marginRight: '5px' }} src='/assets/calender.png' />
                            <IonCardTitle style={{ fontSize: '15px', marginRight: '10px' }}>{new Date(task.dateTime).toLocaleDateString()}</IonCardTitle>

                            <IonImg style={{ ...iconStyle, marginRight: '5px' }} src='/assets/clock.png' />
                            <IonCardTitle style={{ fontSize: '15px', marginRight: '10px', width: '70px', whiteSpace: 'nowrap' }}>{
                            new Date(task.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true,timeZone:localTimeZone,timeZoneName:'short' })}</IonCardTitle>
                          </IonItem>
                        </IonCol>
                      </IonRow>

                      <IonItem lines='none' >
                        {platform == 'Windows' &&
                          <Fragment>
                            <IonCol style={{ width: 'auto', minWidth: "100px" }}>
                              <IonBadge style={{ color: '#7F0DB5', background: 'white' }}>
                                <IonRow>
                                  {task.eventType == 'Meeting' && <div style={eventTypeStyle as HTMLStyle}>
                                    <IonImg src='/assets/meeting-new.png' style={eventImgStyle} />
                                    <IonLabel >{task.eventType}</IonLabel>
                                  </div>}
                                  {task.eventType == 'Task' && <div style={eventTypeStyle as HTMLStyle}>
                                    <IonImg src='/assets/task.png' style={eventImgStyle} />
                                    <IonLabel >{task.eventType}</IonLabel>
                                  </div>}
                                </IonRow>
                              </IonBadge>
                            </IonCol>


                            <IonCol style={{ width: 'auto', minWidth: '150px' }}>
                              <IonBadge style={{ color: '#3A216E', background: 'rgba(58,33,110,0.1)' }}>
                                {task.categoryLabel}
                              </IonBadge>
                            </IonCol>

                            <IonCol>
                              <IonBadge style={{ color: '#089C82', background: "white", paddingLeft: "10px", minWidth: '100px', textAlign: 'start' }}>{task.categoryName}</IonBadge>
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
                              <IonBadge style={{ color: '#7F0DB5', background: 'white', marginTop: '-2px' }}>
                                <IonRow>
                                  {task.eventType == 'Meeting' && <div style={eventTypeStyle as HTMLStyle}>
                                    <IonImg src='/assets/meeting-new.png' style={eventImgStyle} />
                                    <IonLabel >{task.eventType}</IonLabel>
                                  </div>}
                                  {task.eventType == 'Task' && <div style={eventTypeStyle as HTMLStyle}>
                                    <IonImg src='/assets/task.png' style={eventImgStyle} />
                                    <IonLabel >{task.eventType}</IonLabel>
                                  </div>}
                                </IonRow>
                              </IonBadge>
                            </IonCol>
                            <IonCol style={{ minWidth: '150px' }}>
                              <IonBadge style={{ color: '#089C82', backgroundColor: "white" }}>{task.categoryName}</IonBadge>
                            </IonCol>
                            <IonCol style={{ minWidth: '170px' }}>
                              <IonBadge style={{ color: '#3A216E', background: 'inherit' }}>
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
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>

      {tasksData.length == 0 && <Fragment>
        <IonCard style={{ backgroundColor: 'white' }}>
          <IonCardHeader>
            <IonItem >
              <IonRow >
                <IonCol style={{ width: '250px' }} >
                  <IonItem lines='none'>
                    <IonCardTitle style={{ fontSize: '15px', }}>Sorry, No Data Found</IonCardTitle>
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonItem>
          </IonCardHeader>
        </IonCard>
      </Fragment>}
      </IonContent>

    </div>

  );
};

export default SortableCards;
