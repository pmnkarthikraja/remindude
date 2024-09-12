import { IonAlert, IonAvatar, IonButton, IonButtons, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonImg, IonLoading, IonMenu, IonMenuButton, IonMenuToggle, IonPage, IonRow, IonToast, IonToolbar, RefresherEventDetail } from "@ionic/react"
import { close, filterOutline } from "ionicons/icons"
import React, { Fragment, FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import InteractiveAnalogClock from "../components/AnalogClock"
import CreateEditTaskFabButton from "../components/CreateUpdateTask"
import FilterComponent from '../components/Filter'
import FilterPopover from "../components/FilterPopover"
import PriorityComponent from "../components/PriorityComponent"
import SortBy from "../components/SortBy"
import SortableCards from '../components/Sorting'
import ExcelUploader from "../components/UploadCalender"
import { filterTasks } from "../components/dateTimeRange"
import { TaskRequestData } from "../components/task"
import { User } from "../components/user"
import { useGetHolidays, useGetLocalHolidays } from "../hooks/calenderHooks"
import { useGetTasks } from "../hooks/taskHooks"
import { useDeleteUserAccount, useGetMasterSwitchData } from "../hooks/userHooks"
import { Platform, useGetPlatform } from "../utils/useGetPlatform"
import { chooseAvatar, useGetAvatar } from "../utils/util"
import CalendarPage from "./CalenderPage"
import ProfilePage from "./ProfilePage"
import Sidebar, { PageNav } from "./Sidebar"
import { useUserContext } from "../components/userContext"

export interface HomePageProps {
  user: User
  signOut: () => void,
}

export const getRemainingTime = (dateTime: string): number => {
  const now = new Date().getTime();
  const targetTime = new Date(dateTime).getTime();
  return targetTime - now;
};

const HomePage: FunctionComponent<HomePageProps> = ({
  // user,
  signOut,
}) => {
  const [platform, setPlatform] = useState<Platform>('Unknown');
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 992);
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({
    label: [],
    category: [],
    priority: [],
    status: [],
  });
  const { user } = useUserContext()

  const [sortByNew, setSortByNew] = useState<{ name: string, isDescending: boolean } | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<MouseEvent | null>(null);
  const [currentFilterKey, setCurrentFilterKey] = useState<string | null>(null);
  const [pageNav, setPageNav] = useState<PageNav>({
    isCalenderRangeTaskPage: false,
    isMonthlyTaskPage: false,
    isTodayTaskPage: true,
    isTomorrowTaskPage: false,
    isWeeklyTaskPage: false,
    isYesterdayTaskPage: false,
    isAllTaskPage: false,
    isProfile: false,
    isSetting: false,
  });
  const [filteredTasks, setFilteredTasks] = useState<TaskRequestData[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [hideSidebar, setHidesibebar] = useState<boolean>(false);
  const { data: taskData, isLoading: isGetTasksLoading, refetch } = useGetTasks(user.email, 2000)
  const { data: holidays, isLoading: isHolidaysLoading, error: holidaysErr, isError: isHolidayErr } = useGetHolidays()
  const { data: localHolidays } = useGetLocalHolidays()
  const [showCalenderModal, setCalenderModal] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [showLoading, setShowLoading] = useState(false);
  const { isLoading: isDeleteUserLoading, isError: isDeleteUserError, error: deleteUserErr, mutateAsync: deleteUserAccount, reset } = useDeleteUserAccount()
  const { data: masterSwitchData, isLoading: isMasterSwitchDataLoading } = useGetMasterSwitchData(user.email)
  // const [userAvatar,setUserAvatar]=useState('')

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFiltersChange = (newFilters: { [key: string]: string[] }) => {
    setFilters(newFilters);
  }

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    setTimeout(() => {
      refetch()
      event.detail.complete();
    }, 1500);
  }

  const tasks = taskData?.tasks || []

  useEffect(() => {
    const filteredTasks = filterTasks(tasks, pageNav, startDate, endDate);
    setFilteredTasks(filteredTasks);

    if (filters[currentFilterKey || '']?.length < 1) {
      setShowPopover(false);
    }

  }, [tasks, pageNav, startDate, endDate, filters, currentFilterKey]);

  const userAvatar = useGetAvatar()

  const handlePlatformChange = useCallback((newPlatform: Platform) => {
    setPlatform(newPlatform);
  }, []);

  const calenderContentRef = useRef<HTMLDivElement>(null);
  useGetPlatform(handlePlatformChange);

  const clearFilter = useCallback((key: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: prevFilters[key].filter((val) => val !== value),
    }));
  }, []);

  const chooseColor = useCallback((key: string, value: string): boolean => {
    const isExist = filters[key].includes(value);
    return isExist;
  }, [filters]);

  const addPriorityFilter = useCallback((key: string, value: string) => {
    setFilters((prevFilters) => {
      const currentValues = prevFilters[key];
      const valueIndex = currentValues.indexOf(value);

      const updatedValues = valueIndex === -1
        ? [...currentValues, value]
        : currentValues.filter((val) => val !== value);

      return {
        ...prevFilters,
        [key]: updatedValues,
      };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      label: [],
      category: [],
      status: [],
      priority: [],
    });
  }, []);

  const filterCount = useMemo(() => Object.values(filters).flat().length, [filters]);

  const filteresWithValues = useMemo(
    () => Object.entries(filters).filter(([, values]) => values.length > 0),
    [filters]
  );

  const openPopover = useCallback((e: MouseEvent, filterKey: string) => {
    setPopoverEvent(e);
    setCurrentFilterKey(filterKey);
    setShowPopover(true);
  }, []);

  const showFilterCount = useMemo(
    () => (filterCount === 0 ? '' : `${filteresWithValues.length}`),
    [filterCount, filteresWithValues]
  );

  const handleSortByNew = useCallback(
    (sort: { name: string, isDescending: boolean } | null) => {
      setSortByNew((pre) => ({
        name: sort?.name || '',
        isDescending: !pre?.isDescending || false,
      }));
    },
    []
  );

  const buildPageNav = useCallback((type: string) => {
    setHidesibebar((e) => !e);
    setPageNav({
      isCalenderRangeTaskPage: false,
      isMonthlyTaskPage: false,
      isTodayTaskPage: false,
      isTomorrowTaskPage: false,
      isWeeklyTaskPage: false,
      isYesterdayTaskPage: false,
      isAllTaskPage: false,
      isProfile: false,
      isSetting: false,
    });

    switch (type) {
      case 'today':
        setPageNav((prev) => ({
          ...prev,
          isTodayTaskPage: true,
        }));
        break;
      case 'yesterday':
        setPageNav((prev) => ({
          ...prev,
          isYesterdayTaskPage: true,
        }));
        break;
      case 'tomorrow':
        setPageNav((prev) => ({
          ...prev,
          isTomorrowTaskPage: true,
        }));
        break;
      case 'week':
        setPageNav((prev) => ({
          ...prev,
          isWeeklyTaskPage: true,
        }));
        break;
      case 'month':
        setPageNav((prev) => ({
          ...prev,
          isMonthlyTaskPage: true,
        }));
        break;
      case 'calender':
        setPageNav((prev) => ({
          ...prev,
          isCalenderRangeTaskPage: true,
        }));
        break;
      case 'all':
        setPageNav((prev) => ({
          ...prev,
          isAllTaskPage: true,
        }));
        break;
      case 'profile':
        setPageNav((prev) => ({
          ...prev,
          isProfile: true,
        }));
        break;
      case 'setting':
        setPageNav((prev) => ({
          ...prev,
          isSetting: true,
        }));
        break;
      default:
        setPageNav((prev) => ({
          ...prev,
          isAllTaskPage: true,
        }));
    }
  }, []);

  const handleDateRangeChange = useCallback((start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setPageNav((prevState) => ({ ...prevState, isCalenderRangeTaskPage: true }));
  }, []);


  return <Fragment>
    <IonMenu contentId="main-content" disabled={hideSidebar} onIonDidClose={() => setHidesibebar(e => !e)}>
      <IonContent scrollX={false} className="sidebar-content">
        <Sidebar buildPageNav={buildPageNav} pageNav={pageNav} signOut={signOut} user={user}
          onDelete={() => {
            setHidesibebar(true);
            setIsDeleteAlertOpen(true);
          }} />
        <IonLoading isOpen={isDeleteUserLoading} message={'Deleting User..'} />

        <IonToast color={'danger'}
          onDidDismiss={() => reset()}
          buttons={[
            {
              text: 'Ok',
              role: 'cancel',
              handler: () => {
                reset()
              }
            },
          ]} position="top" isOpen={isDeleteUserError}
          message={deleteUserErr && deleteUserErr?.response?.data.message || deleteUserErr?.message}
          duration={3000}>
        </IonToast>

        <IonAlert
          isOpen={isDeleteAlertOpen}
          header="Are you sure to delete your account?"
          message={'Once deleted, all tasks and meetings will be deleted. You will be redirected to the login page.'}
          className="custom-alert"
          onDidDismiss={() => setIsDeleteAlertOpen(false)}
          buttons={[
            {
              text: 'No',
              cssClass: 'alert-button-cancel',
              handler: () => {
                setIsDeleteAlertOpen(false);
              },
            },
            {
              text: 'Yes',
              cssClass: 'alert-button-confirm',
              handler: async () => {
                setShowLoading(true);

                await deleteUserAccount(user.email);

                setTimeout(() => {
                  setShowLoading(false);
                  setIsDeleteAlertOpen(false);
                  window.location.href = '/login'
                }, 2000);
              },
            },
          ]}
        />

        <IonLoading
          isOpen={showLoading}
          message={'☹️👋 Goodbye!'}
          duration={2000}
        />

      </IonContent>
    </IonMenu>

    <IonMenu type='overlay' menuId="filter-menu" contentId="main-content" className="filter-menu" >
      <IonContent className="filter-content"  >
        <FilterComponent filters={handleFiltersChange} currentFilters={filters} />
      </IonContent>
    </IonMenu>

    <IonLoading isOpen={isGetTasksLoading || isMasterSwitchDataLoading} message={'Load Tasks..'} duration={2000} />

    <IonPage id="main-content">
      {platform !== 'Windows' && <IonHeader >
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton color='dark' ></IonMenuButton>
          </IonButtons>

          <IonAvatar slot="end" style={{ marginTop: '10px', marginRight: '10px' }}>
            <img style={{ width: '50px', height: '50px' }}
              src={userAvatar} alt="avatar" />
          </IonAvatar>

        </IonToolbar>
      </IonHeader>}

      <IonContent fullscreen={true} scrollY={!isMobileView}>
        <IonGrid>
          <IonRow>
            {platform === 'Windows' && (
              <Sidebar buildPageNav={buildPageNav}
                pageNav={pageNav}
                signOut={signOut}
                user={user}
                onDelete={() => {
                  setHidesibebar(true)
                  setIsDeleteAlertOpen(true);
                }}
              />
            )}

            {!pageNav.isSetting && <Fragment>
              <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="6" sizeXl="5" >
                <IonGrid>
                  <IonRow style={{ width: 'fit-content' }}>
                    <IonCol >
                      <IonMenuToggle menu='filter-menu'>
                        <IonButton shape="round" fill="clear" color='medium' size='small'>
                          <IonIcon
                            icon={filterOutline}
                            slot="start"
                            size="small"
                          />
                          Filters
                          {showFilterCount != '' && <div style={{
                            borderRadius: '50%',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            background: '#2A82F3',
                            color: 'white',
                          }}>{showFilterCount}</div>}
                        </IonButton>
                      </IonMenuToggle>
                    </IonCol>

                    <IonCol style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                      <SortBy onSorting={handleSortByNew} />
                    </IonCol>


                    <IonCol >
                      {Object.values(filters).map(d => d.length > 0).includes(true) &&
                        <IonButton fill='clear' shape='round' color='medium' size='small' style={{ whiteSpace: 'nowrap' }} onClick={clearAllFilters}>
                          Clear All Filters
                          <IonIcon icon={close} />
                        </IonButton>
                      }
                    </IonCol>

                  </IonRow>

                  <FilterPopover
                    filtersWithValues={filteresWithValues}
                    openPopover={openPopover}
                    showPopover={showPopover}
                    popoverEvent={popoverEvent}
                    currentFilterKey={currentFilterKey}
                    filters={filters}
                    clearFilter={clearFilter}
                    setShowPopover={setShowPopover}
                  />

                  <IonRow>
                    <PriorityComponent
                      addPriorityFilter={addPriorityFilter}
                      chooseColor={chooseColor} />
                  </IonRow>
                </IonGrid>

                {pageNav.isCalenderRangeTaskPage && <div>
                  <InteractiveAnalogClock onDateRangeChange={handleDateRangeChange} />
                </div>}

                {pageNav.isProfile && <div>
                  <ProfilePage signOut={signOut} user={user} />
                </div>}

                {!isMasterSwitchDataLoading && <SortableCards email={user.email} sortBy={sortByNew} tasksData={filteredTasks} filters={filters} handleRefresh={handleRefresh} holidays={holidays} localHolidays={localHolidays} masterSwitchData={masterSwitchData?.masterSwitchData} />}              </IonCol>

              <CalendarPage isMobileView={isMobileView} holidays={holidays} localHolidays={localHolidays} tasks={tasks} isOpen={showCalenderModal} onClose={() => { setCalenderModal(false) }} />
            </Fragment>}

            {pageNav.isSetting && <Fragment>
              <ExcelUploader />
            </Fragment>}

          </IonRow>
        </IonGrid>

        {!isMasterSwitchDataLoading &&
          <CreateEditTaskFabButton holidays={holidays} localHolidays={localHolidays} email={user.email} isEdit={false} masterSwitchData={masterSwitchData?.masterSwitchData} />}

        {(isMobileView) && (
          <IonFab vertical='top' horizontal="end" slot="fixed">
            <IonFabButton id="calender-modal" onClick={() => setCalenderModal(true)}>
              <IonImg style={{ width: '50px', height: '50px' }} src="/assets/calender1.png" />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>

    </IonPage>
  </Fragment>

}

export default HomePage


