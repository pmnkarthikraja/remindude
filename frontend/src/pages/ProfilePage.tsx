import { FilePicker } from '@capawesome/capacitor-file-picker'
import { IonAvatar, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonLoading, IonModal, IonPage, IonRow, IonSelect, IonSelectOption, IonTitle, IonToast, IonToggle, IonToolbar, isPlatform, useIonRouter } from "@ionic/react"
import { arrowBack, chevronForwardOutline, cloudUpload, handLeft, logOutOutline, notificationsOutline, personOutline, remove, settingsOutline } from "ionicons/icons"
import React, { Fragment, FunctionComponent, useEffect, useState } from "react"
import { userApi } from '../api/userApi'
import { User } from "../components/user"
import { chooseAvatar } from '../utils/util'
import '../styles/ProfilePage.css'
import { useEditProfileMutation } from '../hooks/userHooks'
import { useForm } from 'react-hook-form'
import ChangePasswordModal from '../components/ChangePasswordModal'
import { useWeekContext } from '../components/weekContext'
import { LocalNotifications } from '@capacitor/local-notifications';

export interface ProfilePageProps {
  user: User,
  signOut: () => void
}

const ProfilePage: FunctionComponent<ProfilePageProps> = ({
  signOut,
  user
}) => {
  const { isLoading, isError, error, mutateAsync: editProfile } = useEditProfileMutation()
  const [profileModalIsOpen, setProfileModalIsOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { startOfWeek, setStartOfWeek } = useWeekContext();

  useEffect(() => {
    // Request permission to send notifications (for iOS)
    LocalNotifications.requestPermissions().then(result => {
      if (result.display === 'granted') {
        console.log('Notification permissions granted');
      } else {
        console.log('Notification permissions denied');
      }
    });

    // Listen for notification events (optional)
    LocalNotifications.addListener('localNotificationReceived', notification => {
      console.log('Notification received:', notification);
    });

  }, []);

  const handleStartOfWeekChange = (value: string) => {
    setStartOfWeek(value);
  };

  const [blobData, setBlobData] = useState<Blob | string>('notset')
  const { setValue, watch, reset } = useForm<User>({
    defaultValues: { ...user }
  })

  const userData = watch()

  const pickFile = async () => {
    try {
      await pickImages()
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };


  const pickImages = async (): Promise<string> => {
    const result = await FilePicker.pickFiles({
      readData: true,
      types:['image/jpeg','image/jpg','image/png']
    })

    const blobData1 = result.files[0].blob
    const img = 'data:image/*;base64,' + result.files[0].data
    if (!!blobData1) {
      setBlobData(blobData1)
    }
    // setUserData(data => { return { ...data, profilePicture: img } })
    setValue('profilePicture', img)
    return img
  }

  

  const onSubmit = async () => {
    // if (newPassword !== confirmNewPassword) {
    //     throw new Error("both passwords should match!")
    // }
    try {
      await editProfile({
        email: userData.email,
        password: userData.password || '',
        userName: userData.userName as string,
        profilePicture: blobData
      })
    }
    catch (e) {
      console.log("failed to update profile :" + e)
    }
  }
  const userAvatar = chooseAvatar(userData)


  const sendLocalNotification = async () => {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Task Reminder",
          body: "You have a task scheduled for 5:00 PM. Don't forget to complete it!",
          id: Math.random(),
          schedule: { at: new Date() },
          actionTypeId: "",
          extra: null,
          sound: 'default',
        },
      ],
    });
  }

  // const getHolidays = async () => {
  //   try{
  //     const holidays:CalenderHoliday[] = await holidayApi.getHolidays()
  //     holidays.map((holiday,idx)=>{
  //       if (holiday.type['0']=='National holiday'){
  //         console.log("holiday: ",holiday.name,holiday.country, holiday.date,  holiday.type, holiday.urlid)
  //       }
  //     })
  //   }catch(e){
  //     console.log("error on getting holidays: ",e)
  //   }
  // }

  return <Fragment>
    <IonPage>
      {profileModalIsOpen && (
        <IonModal isOpen={true} onDidDismiss={() => setProfileModalIsOpen(false)}>
          <IonHeader>
            <IonToolbar className="mobile-header">
              <IonButtons>
                <IonTitle>Profile</IonTitle>
                <IonIcon onClick={() => {
                  setProfileModalIsOpen(false);
                  reset()
                }} style={{ padding: '10px' }} icon={arrowBack} slot='start' size='default' />
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle color={"medium"}>Edit User Profile</IonCardTitle>
                <IonCardSubtitle>
                  You can change your profile here
                </IonCardSubtitle>
              </IonCardHeader>
              {isError && <IonToast color={'danger'}
                onDidDismiss={() => { }}
                buttons={[
                  {
                    text: 'Ok',
                    role: 'cancel',
                    handler: () => { }
                  },
                ]} position="top" isOpen={true} message={'Sorry, Please try again later!' + error.response?.data.message} duration={3000}></IonToast>}
              {isLoading && <IonLoading isOpen={true} message="Updating Profile.." />}
              <IonCardContent>
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="auto">
                      <IonAvatar>
                        <img src={userAvatar} alt="avatar" />
                      </IonAvatar>
                    </IonCol>
                  </IonRow>
                  <IonRow>


                    <IonCol size="auto">
                      <IonButton
                        onClick={async () => {
                          await pickFile();
                        }}
                        size="small"
                        fill="outline"
                      >
                        <IonIcon slot="start" size="small" icon={cloudUpload} />
                        Upload
                      </IonButton>
                    </IonCol>


                    <IonCol>
                      <IonButton
                        onClick={() => {
                          setValue('profilePicture', '')
                          setValue('googlePicture', '')
                          setBlobData("removed")
                        }
                        }
                        size="small"
                        fill="outline"
                      >
                        <IonIcon slot="start" size="small" icon={remove} />
                        Remove
                      </IonButton>
                    </IonCol>


                  </IonRow>
                </IonGrid>
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonItem>
                        <IonInput
                          type="text"
                          onIonInput={e => {
                            setValue('userName', e.target.value as string)
                          }}

                          value={userData.userName}
                          label="UserName"
                          labelPlacement="floating"
                          placeholder="Edit UserName"
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>
                      <IonItem>
                        <IonInput
                          type="email"
                          disabled
                          value={userData.email}
                          label="Email"
                          labelPlacement="stacked"
                          placeholder="Edit Email"
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>

                </IonGrid>
              </IonCardContent>
              <IonFooter>
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonButton onClick={onSubmit} color="success">
                        Save
                      </IonButton>
                    </IonCol>
                    <IonCol></IonCol>
                    <IonCol>
                      <IonButton
                        color="danger"
                        onClick={() => {
                          setProfileModalIsOpen(false);
                          reset()
                        }}
                      >
                        Close
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonFooter>
            </IonCard>
          </IonContent>
        </IonModal>
      )}

      <ChangePasswordModal
        user={user}
        forgotPassword={false}
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <IonHeader>
      <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home"></IonBackButton>
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {/* Account Section */}
          <IonItem lines="none">
            <IonIcon slot="start" icon={personOutline} />
            <IonLabel>Account</IonLabel>
          </IonItem>
          <IonItem onClick={() => { setProfileModalIsOpen(true) }} >
            <IonLabel>Edit profile</IonLabel>
            <IonIcon slot="end" icon={chevronForwardOutline} />
          </IonItem>
          <IonItem onClick={() => setShowChangePassword(true)}>
            <IonLabel>Change password</IonLabel>
            <IonIcon slot="end" icon={chevronForwardOutline} />
          </IonItem>

          {/* Notifications Section */}
          <IonItem lines="none">
            <IonIcon slot="start" icon={notificationsOutline} />
            <IonLabel>Notifications</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Email Notifications</IonLabel>
            <IonToggle slot="end" />
          </IonItem>
          <IonItem>
            <IonLabel>App Push Notifications</IonLabel>
            <IonToggle slot="end" checked />
          </IonItem>
          <IonItem>
            <IonLabel>Notification Sounds</IonLabel>
            <IonToggle slot="end" checked />
          </IonItem>

          {/* Calender Section */}
          <IonItem lines="none" >
            <IonIcon slot="start" icon={notificationsOutline} />
            <IonLabel>Calender Settings</IonLabel>
          </IonItem>

          {/* Start of the Week Selector */}
          <IonItem>
            <IonLabel>Start of the Week</IonLabel>
            <IonSelect
              value={startOfWeek}
              placeholder="Select Day"
              onIonChange={e => handleStartOfWeekChange(e.detail.value)}
              slot="end"
            >
              <IonSelectOption value="Sunday">Sunday</IonSelectOption>
              <IonSelectOption value="Monday">Monday</IonSelectOption>
            </IonSelect>
          </IonItem>

          {/* Time Format */}
          <IonItem lines="none">
            <IonIcon slot="start" icon={notificationsOutline} />
            <IonLabel>Time Format</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>24Hr</IonLabel>
            <IonToggle slot="end" checked />
          </IonItem>

          {/* More Section */}
          <IonItem lines="none">
            <IonIcon slot="start" icon={settingsOutline} />
            <IonLabel>More</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Language</IonLabel>
            <IonIcon slot="end" icon={chevronForwardOutline} />
          </IonItem>
          <IonItem>
            <IonLabel>General Info</IonLabel>
            <IonIcon slot="end" icon={chevronForwardOutline} />
          </IonItem>
          <IonItem onClick={() => { sendLocalNotification() }}>
            <IonLabel>Test Notify</IonLabel>
            <IonIcon slot="end" icon={chevronForwardOutline} />
          </IonItem>
        </IonList>

        {/* Logout Button */}
        <IonRow className="ion-justify-content-center ion-padding">
          <IonButton expand="block" fill="solid" color={'danger'} onClick={signOut}>
            <IonIcon slot="start" icon={logOutOutline} />
            Logout
          </IonButton>
        </IonRow>
      </IonContent>
    </IonPage>


  </Fragment>
}

export default ProfilePage