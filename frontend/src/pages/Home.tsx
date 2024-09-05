import {
  IonImg,
  IonLabel,
  IonLoading,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router';
import { User } from '../components/user';
import { useAuthUser } from '../hooks/userHooks';
import '../styles/Home.css';
import { Platform, useGetPlatform } from '../utils/useGetPlatform';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';


const Home: FunctionComponent = () => {
  const [tok, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User>({
    email: '',
    password: '',
    userName: '',
    profilePicture: '',
    googlePicture: undefined
  })
  const {status, mutateAsync: authMutation } = useAuthUser()
  const [platform, setPlatform] = useState<Platform>('Unknown')
  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
  };
  useGetPlatform(handlePlatformChange)

  useEffect(() => {
    const validateSession = async (token: string) => {
      try {
        const res = await authMutation(token)
        const userData: User = res.data.user
        const img = 'data:image/*;base64,' + userData.profilePicture
        setUser({
          email: userData.email,
          userName: userData.userName,
          password: userData.password,
          profilePicture: img,
          googlePicture: userData.profilePicture
        })
      } catch (e) {
        console.log("session not found: " + e)
        window.location.href='/login'
      }
    }
    const token = window.localStorage.getItem('token');
    console.log("Token found: ", token);
    setToken(token)
    if (token == null) {
      window.location.href='/login'
    }
    if (token != null) {
      validateSession(token)
    }
  }, [authMutation, history, localStorage]);

  const signOut = async () => {
    try {
      localStorage.removeItem('token')
      window.location.href='/login'
    } catch (e) {
      console.log("signout failed: ", e)
    }
  }

  console.log("status: ",status)

  return (<Fragment>
    {status == 'success' &&
      <Fragment>
        {platform != 'Windows' &&
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                <Redirect exact path="/" to="/home" />
                <Route path="/home" render={() => <HomePage signOut={signOut} user={user} />} exact={true} />
                <Route path="/profile" render={() => <ProfilePage signOut={signOut} user={user} />} exact={true} />
              </IonRouterOutlet>
              <IonTabBar slot="bottom" >

                <IonTabButton tab="home" href="/home">
                  <IonImg style={{ width: '30px', height: '30px' }} src='/assets/home.png' />
                  <IonLabel >Home</IonLabel>
                </IonTabButton>


                <IonTabButton tab="profile" href="/profile">
                  <IonImg style={{ width: '30px', height: '30px' }} src='/assets/profile.png' />
                  <IonLabel>Settings</IonLabel>
                </IonTabButton>

              </IonTabBar>
            </IonTabs>
          </IonReactRouter>}
        {platform == 'Windows' && <HomePage signOut={signOut} user={user} />}
      </Fragment>
    }
    {status=='loading' && <IonLoading isOpen={true} duration={5000} message={'App Starting..'} />}
  </Fragment>
  );
};

export default Home;
