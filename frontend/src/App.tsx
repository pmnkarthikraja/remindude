import { IonApp, IonImg, IonLoading, IonRouterOutlet, IonTitle, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { CookiesProvider } from 'react-cookie';
import { Redirect, Route } from 'react-router-dom';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import './App.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import { SplashScreen } from '@capacitor/splash-screen';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Calender from './components/Calender';
import Home from './pages/Home';
import LoginPageModel from './pages/LoginPage';
import SignupPageModel from './pages/SignupPage';
import TestPage from './pages/TestPage';
import Welcome from './pages/Welcome';
import './theme/variables.css';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

setupIonicReact();
const App: React.FC = () => {
  const queryClient = new QueryClient()
  
  useEffect(() => {
    const initPermissions = async () => {
      //Request Local Notification
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

      // Request notification permissions
      if (Capacitor.isNativePlatform()){
        const notificationPermission = await LocalNotifications.requestPermissions();
        if (notificationPermission.display !== 'granted') {
          console.error('Notification permissions not granted');
        }
  
        // Request file system permissions
        const fileSystemPermission = await Filesystem.requestPermissions();
        if (fileSystemPermission.publicStorage !== 'granted') {
          console.error('File system permissions not granted');
        }
      }
    };

    initPermissions();
  }, []);

  return<QueryClientProvider client={queryClient}> <CookiesProvider><IonApp>
    {/* <div style={{width:'100%', height:'0'}}><iframe src="https://giphy.com/embed/jAYUbVXgESSti" width="100%" height="100%" style={{position:'absolute'}} frameBorder="0" className="giphy-embed" allowFullScreen={true}></iframe></div> */}
    {/* kUTME7ABmhYg5J3psM */}
    
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/welcome" component={Welcome} exact={true} />
        <Route path="/home" component={Home} exact={true} />
        <Route path="/testpage" component={TestPage} exact={true} />
        <Route path="/calender" component={Calender} exact={true} />
        <Route path="/profile" component={Home} exact={true}/>
        <Route path="/login" component={LoginPageModel} exact={true}/>
        <Route path="/signup" component={SignupPageModel} exact={true}/>
        <Route exact path="/" render={() => <Redirect to="/home" />} />
        <Route exact path="" render={() => <Redirect to="/home" />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp></CookiesProvider></QueryClientProvider>
}

export default App;

