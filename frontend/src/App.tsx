import { IonApp, IonRouterOutlet, IonTitle, setupIonicReact } from '@ionic/react';
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
import ConfirmationPage from './pages/ConfirmationPage';
import Home from './pages/Home';
import LoginPageModel from './pages/LoginPageModel';
import SignupPageModel from './pages/SignupPageModel';
import TestPage from './pages/TestPage';
import Welcome from './pages/Welcome';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const show = async ()=>{
    await SplashScreen.show({
      showDuration: 2000,
      autoHide: true,
    });
  }

  useEffect(()=>{
    show()
  },[])
  const queryClient = new QueryClient()

  return<QueryClientProvider client={queryClient}> <CookiesProvider><IonApp>
    <IonTitle>Remindude App</IonTitle>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/welcome" component={Welcome} exact={true} />
        {/* <Route path="/login" component={LoginPage} exact={true} /> */}
        {/* <Route path="/signup" component={SignupPage} exact={true} /> */}
        <Route path="/home" component={Home} exact={true} />
        <Route path="/confirmation" component={ConfirmationPage} exact={true} />
        <Route path="/testpage" component={TestPage} exact={true} />
        <Route path="/calender" component={Calender} exact={true} />
        <Route path="/profile" component={Home} exact={true}/>
        <Route path="/login" component={LoginPageModel} exact={true}/>
        <Route path="/signup" component={SignupPageModel} exact={true}/>
        <Route exact path="/" render={() => <Redirect to="/home" />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp></CookiesProvider></QueryClientProvider>
}

export default App;

