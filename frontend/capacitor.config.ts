import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'remindude',
  webDir: 'dist',
  // server:{
  //   androidScheme:'remindude',
  // },
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
        backgroundColor: "#87ceeb",
        androidSplashResourceName: "splash",
        androidScaleType: "CENTER_CROP",
        showSpinner: true,
        splashFullScreen: true,
        splashImmersive: true
    },
    FilePicker:{
      multiple:true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor:'#488AFF',
      sound:'default',
    }
  }
};

export default config;
