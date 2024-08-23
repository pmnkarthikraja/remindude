import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'reminderMaster',
  webDir: 'dist',
  plugins:{
    GoogleAuth:{
      scopes:[
        "profile",
        "email"
      ],
      serverClientId:"1045516162918-4qi491fgdb85pf6fdr7mj8t4csor0er1.apps.googleusercontent.com"
    },
    SplashScreen: {
        launchShowDuration: 2000,
        launchAutoHide: true,
        backgroundColor: "#87ceeb"
    },
    FilePicker:{
      multiple:true
    },
    LocalNotifications: {
      iconColor:'#488AFF',
      sound:'sound.mp3',
    }
  }
};

export default config;
