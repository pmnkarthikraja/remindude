import {
  AnimationBuilder,
  IonApp,
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonDatetime,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem, IonLabel, IonList,
  IonMenu,
  IonMenuButton,
  IonModal,
  IonPage,
  IonRow,
  IonTitle, IonToolbar,
  createAnimation
} from '@ionic/react';
import { chatbubbles, heart, menu, notifications, people, star, arrowBack } from 'ionicons/icons';
import React, {  useState } from 'react';
import '../styles/TestPage.css';
import { Platform, useGetPlatform } from '../utils/useGetPlatform';

const TestPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [platform,setPlatform]=useState<Platform>('Windows')

  const onPlatformChange = (platform:Platform)=>{
    setPlatform(platform)
  }
  
  useGetPlatform(onPlatformChange)

  const enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot!;
    const wrapperAnimation = createAnimation()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes([
        { transform: 'translateX(-100%)' },
        { transform: 'translateX(0)' },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(200)
      .addAnimation([wrapperAnimation]);
  };
  const leaveAnimation = (baseEl: HTMLElement) => {
    return enterAnimation(baseEl).direction('reverse');
  };
  return <>

    <IonApp>
      <IonPage id='main-content'>
        <IonHeader>
          <IonToolbar>
            <IonTitle color='light'>Reminder Master</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>

              {(platform != 'Android' && platform != 'IOS') && <IonCol sizeLg='1.5'>
                <IonList>
                  <IonItem button>
                    <IonLabel>Dashboard</IonLabel>
                  </IonItem>
                  <IonItem button>
                    <IonLabel>Calendar</IonLabel>
                  </IonItem>
                  <IonItem button>
                    <IonLabel>Patients</IonLabel>
                  </IonItem>
                  <IonItem button>
                    <IonLabel>Staff Schedule</IonLabel>
                  </IonItem>
                  <IonItem button>
                    <IonLabel>Doctors</IonLabel>
                  </IonItem>
                  <IonItem button>
                    <IonLabel>Departments</IonLabel>
                  </IonItem>
                  <IonItem button>
                    <IonLabel>Stock</IonLabel>
                  </IonItem>
                  <IonItem button>
                    <IonLabel>Settings</IonLabel>
                  </IonItem>
                  <IonItem button>
                    <IonLabel>Help Center</IonLabel>
                  </IonItem>
                  <IonItem button>
                    <IonLabel>Log Out</IonLabel>
                  </IonItem>
                </IonList>
              </IonCol>}
              {(platform == 'Android' || platform == 'IOS') && <>
                <IonIcon size='large' icon={menu} onClick={() => { setShowModal(true) }} />
                <IonModal enterAnimation={enterAnimation} leaveAnimation={leaveAnimation} isOpen={showModal} onDidDismiss={() => { setShowModal(false) }} className='slide-in-right' >
                  <IonList >
                    <IonItem button>
                      <IonButton fill='clear' color='secondary' size='default' onClick={() => {
                        window.location.href = '/testpage'
                      }
                      }>Dashboard</IonButton>
                    </IonItem>
                    <IonItem button>
                      <IonButton fill='clear' color='secondary' size='default' onClick={() => {
                        window.location.href = '/calender'
                      }}>Calendar</IonButton >
                    </IonItem>
                    <IonItem button>
                      <IonButton fill='clear' color='secondary' size='default'>Patients</IonButton >
                    </IonItem>
                    <IonItem button>
                      <IonButton fill='clear' color='secondary' size='default'>Staff Schedule</IonButton >
                    </IonItem>
                    <IonItem button>
                      <IonButton fill='clear' color='secondary' size='default'>Doctors</IonButton >
                    </IonItem>
                    <IonItem button>
                      <IonButton fill='clear' color='secondary' size='default'>Departments</IonButton >
                    </IonItem>
                    <IonItem button>
                      <IonButton fill='clear' color='secondary' size='default'>Stock</IonButton >
                    </IonItem>
                    <IonItem button>
                      <IonButton fill='clear' color='secondary' size='default'>Settings</IonButton >
                    </IonItem>
                    <IonItem button>
                      <IonButton fill='clear' color='secondary' size='default'>Help Center</IonButton >
                    </IonItem>
                    <IonItem button>
                      <IonButton fill='clear' color='secondary' size='default'>Log Out</IonButton >
                    </IonItem>
                  </IonList>
                  <IonButton fill='clear' onClick={() => { setShowModal(false) }}>
                    <IonIcon icon={arrowBack} />
                    close</IonButton>
                </IonModal>
                <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu Content</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">This is the menu content.</IonContent>
      </IonMenu>
              </>}

              <IonCol sizeLg='8' sizeMd='12' sizeSm='12' sizeXs='12'>
                <IonCard>
                  <IonCardContent>
                    <IonGrid>
                      <IonRow>
                        <IonCol >
                          <IonItem>
                            <IonIcon icon={people} slot="start" />
                            <IonLabel>78 patients</IonLabel>
                          </IonItem>
                        </IonCol>
                        <IonCol >
                          <IonItem>
                            <IonIcon icon={star} slot="start" />
                            <IonLabel>12 reviews</IonLabel>
                          </IonItem>
                        </IonCol>
                        <IonCol >
                          <IonItem>
                            <IonIcon icon={chatbubbles} slot="start" />
                            <IonLabel>13 appointments</IonLabel>
                          </IonItem>
                        </IonCol>
                        <IonCol >
                          <IonItem>
                            <IonIcon icon={heart} slot="start" />
                            <IonLabel>1 surgery</IonLabel>
                          </IonItem>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h2>Daily Schedule</h2>
                          <p>Maria: Appointment, Patient Examination</p>
                          <p>Patrick: Patient Examination, Appointment</p>
                          <p>Norris: Patient Examination, Appointment</p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h2>Upcoming Appointments</h2>
                          <p>Emilia Fox - Eczema - 29/06/2023, 08:00</p>
                          <p>Ingrid Donald - Flu - 29/06/2023, 09:00 - First appointment</p>
                          <p>Barry Dove - 29/06/2023, 09:20</p>
                          <p>Daniel Howell - Depression - 29/06/2023, 08:00 - Pill prescription</p>
                        </IonLabel>
                      </IonItem>
                      {/* <iframe style={{border:'1px solid rgba(0,0,0,0.1)'}} width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FrEdKqTF8iBBOtqH4bIg0Yr%2FmobileApp%3Fnode-id%3D24-611%26t%3Dz4fw2SXAkFi38UoO-1%26scaling%3Dscale-down%26page-id%3D0%253A1" allowFullScreen={true}></iframe> */}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol >
                <IonCard>
                  <IonCardContent>
                    <IonItem>
                      <IonAvatar slot="start">
                        <img src="https://www.gravatar.com/avatar?d=mp" alt="Profile" />
                      </IonAvatar>
                      <IonLabel>
                        <h2>Dr. Kawasaki</h2>
                        <p>Cardiologist</p>
                      </IonLabel>
                    </IonItem>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardContent>
                    <IonDatetime />
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonIcon icon={notifications} slot="start" />
                        <IonLabel>Notifications</IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <p>You have 38 appointment requests</p>
                          <p>Your vacation request was denied</p>
                          <p>Tom Daley cancelled his appointment</p>
                          <p>Someone wants to become your patient</p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    </IonApp>

  </>
}
  ;

export default TestPage;
