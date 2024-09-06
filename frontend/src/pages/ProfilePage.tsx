import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications'
import { FilePicker } from '@capawesome/capacitor-file-picker'
import { IonAvatar, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonLoading, IonModal, IonPage, IonRow, IonSelect, IonSelectOption, IonTitle, IonToast, IonToggle, IonToolbar } from "@ionic/react"
import { arrowBack, chevronForwardOutline, logOutOutline, notificationsOutline, personOutline, settingsOutline } from "ionicons/icons"
import React, { Fragment, FunctionComponent, useEffect, useState } from "react"
import { useForm } from 'react-hook-form'
import ChangePasswordModal from '../components/ChangePasswordModal'
import { User } from "../components/user"
import { useWeekContext } from '../components/weekContext'
import { useEditProfileMutation } from '../hooks/userHooks'
import '../styles/ProfilePage.css'
import { chooseAvatar } from '../utils/util'
import imageCompression from 'browser-image-compression'

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
  const [blobData, setBlobData] = useState<Blob | string>('notset')
  const { setValue, watch, reset } = useForm<User>({
    defaultValues: { ...user }
  })
  const [userAvatar,setUserAvatar]=useState('')
  const userData = watch()
  const [warningToast,setWarningToast]=useState(false)

  const callAvatar = async (us:User)=>{
    const image= await chooseAvatar(us)
    setUserAvatar(image)
   }

  useEffect(() => {
    callAvatar(user)
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


  const pickFile = async () => {
    try {
      await pickImages()
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };


  //not using this function
  const pickImages = async (): Promise<string|null> => {
    const result = await FilePicker.pickImages({
      readData: true,
    })

    const blobData1 = result.files[0].blob
    let img = 'data:image/*;base64,' + result.files[0].data
    if (!!blobData1) {
      const imgSizeMB = blobData1.size / (1024 * 1024)
      console.log('Image size in MB:', imgSizeMB) 
      if (imgSizeMB > 2) {
        setWarningToast(true)
        console.log('Warning: Image size exceeds 2 MB')
        return null
      }
  

      setBlobData(blobData1)
      setValue('profilePicture', img)

    }
    return img
  }

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Check the file size
        const fileSizeMB = file.size / (1024 * 1024); // Convert size to MB
        if (fileSizeMB > 2) {
          // Display a warning toast or alert
          setWarningToast(true);
          console.error('The selected image is too large. Please upload an image smaller than 2 MB.');
          return; // Exit the function if the file is too large
        }
  
        // Create a Blob object from the file
        const blobData = new Blob([file], { type: file.type });
  
        // Create a FileReader to read the file as a Data URL (base64)
        const reader = new FileReader();
  
        reader.onloadend = async () => {
          const base64String = reader.result as string;
  
          setBlobData(blobData);  
          setValue('profilePicture', base64String); 
          
          const u: User = {
            email: user.email,
            userName: user.userName,
            googlePicture: '',
            profilePicture: base64String,
            password: ''
          };
          
          await callAvatar(u);
        };
  
        // Read the file as a data URL
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error handling file upload:', error);
      }
    } else {
      console.error('No file selected');
    }
  };
  

  const onSubmit = async () => {
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

  return <Fragment>
    <IonPage>
      {profileModalIsOpen && (
        <Fragment>
         <IonToast
                color={'danger'}
                isOpen={warningToast}
                onDidDismiss={() => setWarningToast(false)}
                message={'The selected image is too large. Please upload an image smaller than 2 MB.'}
                duration={3000}
                position="top"
            />
        <IonModal isOpen={true} onDidDismiss={() => setProfileModalIsOpen(false)}>
          <IonHeader>
            <IonToolbar>
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
                ]} position="top" isOpen={true} message={'Sorry, Please try again later!' + (error.response?.data.message || error.message)} duration={3000}></IonToast>}
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

                      <input
                        type='file'
                        accept=".jpg, .jpeg, .png, .webp, .gif, .bmp, .tiff, .svg"
                        onChange={handleFile}
                      />
                   
                      <IonButton
                      color={'dark'}
                        onClick={async () => {
                          setValue('profilePicture', '')
                          setValue('googlePicture', '')
                          setBlobData("removed")
                          const u:User={
                            email:user.email,
                            googlePicture:'',
                             profilePicture:'',
                             password:'',
                             userName:user.userName
                          }
                          await callAvatar(u)
                        }
                        }
                        size="small"
                        fill="clear"
                      >
                        Remove
                      </IonButton>

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
        </Fragment>
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
         <IonItem disabled={user.password==undefined} onClick={() => setShowChangePassword(true)}>
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