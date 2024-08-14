import {
  IonImg,
  IonLabel,
  IonLoading,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Redirect, Route } from 'react-router';
import { Platform, useGetPlatform } from '../utils/useGetPlatform';
import { User } from '../components/user';
import '../styles/Home.css';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import { useAuthUser, useSignOutUser } from '../hooks/userHooks';


const Home: FunctionComponent = () => {
  const [cookies, , removeCookie] = useCookies(['token'])
  const [user, setUser] = useState<User>({
    email: '',
    password: '',
    userName: '',
    profilePicture: '',
    googlePicture: ''
  })
  const { isLoading: isAuthLoading, status, mutateAsync: authMutation } = useAuthUser()
  const [platform, setPlatform] = useState<Platform>('Unknown')
  const onSignOut=useSignOutUser()
  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
  };
  useGetPlatform(handlePlatformChange)

  useEffect(() => {
    const verifyCookie = async () => {
        const res = await authMutation();
        const userData: User = res.data.user
        const img = 'data:image/*;base64,' + userData.profilePicture
        const googlePicture = userData.profilePicture
        setUser({
          email: userData.email,
          userName: userData.userName,
          password:userData.password,
          profilePicture: img,  
          googlePicture
        })
    };
    verifyCookie();
  }, [cookies, history, removeCookie]);

  const signOut = async () => {
    try {
      onSignOut()
    } catch (e) {
      console.log("Error on google sign out", e)
    }
  };
  

  return (<Fragment>
    {status=='success' &&
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
  </Fragment>
  );
};

export default Home;
