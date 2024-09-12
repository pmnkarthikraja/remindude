import {
  IonAlert,
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
import { useUserContext } from '../components/userContext';

const Home: FunctionComponent = () => {
  const [tok, setToken] = useState<string | null>(null);
  // const [user, setUser] = useState<User>({
  //   email: '',
  //   password: '',
  //   userName: '',
  //   profilePicture: '',
  //   googlePicture: undefined,
  // });
  const {user,setUser} =useUserContext()
  const { status, error: authError, mutateAsync: authMutation } = useAuthUser(); 
  const [platform, setPlatform] = useState<Platform>('Unknown');
  const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false);

  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
  };

  useGetPlatform(handlePlatformChange);

  useEffect(() => {
    const validateSession = async (token: string) => {
      try {
        const res = await authMutation(token);
        const userData: User = res.data.user;
        const img = 'data:image/*;base64,' + userData.profilePicture;
        setUser({
          email: userData.email,
          userName: userData.userName,
          password: userData.password,
          profilePicture: img,
          googlePicture: userData.profilePicture,
        });
      } catch (err) {
        console.log('Session validation failed: ', err);
      }
    };

    const token = window.localStorage.getItem('token');
    setToken(token);

    if (!token) {
      window.location.href = '/login'; 
    } else {
      validateSession(token);
    }
  }, [authMutation]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
  
    if (status === 'loading') {
      timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000);
    }
  
    if (status === 'success' || status === 'error') {
      if (timeout) {
        clearTimeout(timeout);
      }
      setLoadingTimeout(false); 
    }
  
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [status]);
  

  const signOut = async () => {
    try {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (e) {
      console.log('Signout failed: ', e);
    }
  };

  return (
    <Fragment>
      {status === 'success' && (
        <Fragment>
          {platform !== 'Windows' ? (
            <IonReactRouter>
              <IonTabs>
                <IonRouterOutlet>
                  <Redirect exact path="/" to="/home" />
                  <Route
                    path="/home"
                    render={() => <HomePage signOut={signOut} user={user} />}
                    exact={true}
                  />
                  <Route
                    path="/profile"
                    render={() => <ProfilePage signOut={signOut} user={user} />}
                    exact={true}
                  />
                </IonRouterOutlet>
                <IonTabBar slot="bottom">
                  <IonTabButton tab="home" href="/home">
                    <IonImg style={{ width: '30px', height: '30px' }} src="/assets/home.png" />
                    <IonLabel>Home</IonLabel>
                  </IonTabButton>

                  <IonTabButton tab="profile" href="/profile">
                    <IonImg style={{ width: '30px', height: '30px' }} src="/assets/profile.png" />
                    <IonLabel>Settings</IonLabel>
                  </IonTabButton>
                </IonTabBar>
              </IonTabs>
            </IonReactRouter>
          ) : (
            <HomePage signOut={signOut} user={user} />
          )}
        </Fragment>
      )}

      {status === 'loading'  && (
        <IonLoading
          isOpen={true}
          duration={500}
          message={'App Starting...'}
        />
      )}

      {loadingTimeout && status === 'loading' && (
        <IonAlert
          isOpen={true}
          header={'Loading Timeout'}
          message={'The app is taking too long to load. Please try again.'}
          buttons={[
            {
              text: 'Retry',
              handler: () => {
                window.location.href = '/home';
              },
            },
          ]}
        />
      )}

      {status === 'error' && (
        <IonAlert
          isOpen={true}
          header={'Oops'}
          message={authError?.response?.data?.message || authError?.message || 'Unknown error occurred'}
          buttons={[
            {
              text: 'Ok',
              handler: () => {
                window.location.href = '/login';
              },
            },
          ]}
        />
      )}
    </Fragment>
  );
};

export default Home;
