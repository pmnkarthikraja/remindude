import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
require('dotenv').config();
import bodyParser from 'body-parser';
import axios from 'axios'
import admin from 'firebase-admin';

// import YAML from 'yamljs';
// import swaggerUi from 'swagger-ui-express';
// const swaggerDocument = YAML.load('./swagger/swagger.yml')

import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import holidayRoutes from './routes/holidayRoutes'
import masterSwitchRoute from './routes/masterSwitchDataRoute'
import officeRoutes from './routes/officeRoutes'

export const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// app.use(cors({
//   origin: "*",
//   credentials: true,
// }))

app.use(cors({
  origin: function (origin, callback) {
    console.log("origin: ",origin)
  // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Set the Access-Control-Allow-Origin header to the incoming origin
    callback(null, origin);
  },
  credentials: true // Allow credentials
}));

app.use(cookieParser())
app.use(express.json())
app.use('/', userRoutes);
app.use('/',taskRoutes)
app.use('/',holidayRoutes)
app.use('/',masterSwitchRoute)
app.use('/',officeRoutes)


admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail:'firebase-adminsdk-i1skv@remindude-1c964.iam.gserviceaccount.com',
    privateKey:'-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCh9Qpg+3GS3n4S\ndH9DI+DnYODrArJhtBFffgSYa07auT8Gpz6xuEe95pKsCBu1oaEs0aIB/4G0sU3I\nsI4o82wyHxcSvKHtgTZF7pGwxi1HXREzEhycmmltGoSrX9lUNbfGEXrfz9vP9iAV\nuBHujVZ8UL1I+30s5ychd+sydILDhXeeEj9vqDRzzv9H/pF7WVio1lKJSGNxEFfp\n/FqZTjTgCMUYZ588ndjvpURm9pPs8qO6AHAqHf81U+c/alPhkb9Av7ArVXWa+/46\nfsAcsbqioWXeM/5GZryh8wCo3kc/bWZTAONfKzGjAQAFh/oDDdSngYwyqe1JV81f\n9UW9UAh3AgMBAAECggEATfwVDE/nB0Z1RGOuJ+Et2ZwPkXoR9PPk7atbgR0isjVD\nAOwlRyQp/2n4NDgPR61VU6R5syaaCSza/IjvWw6jiZro3E/SVO/D93aB1rIGeXd5\n4bKV7l53514+hdq4ZlEbdZdTKFQJTyD/oBWrJMgP3fpuuqbGRonjkL0Slo/9qzFj\nNDxph2IqFCxENh+y2soTWQHkQs/EqZkQx8bj+ibBGnj0eTlDCuIazJARp9IhnKyK\nQiyTvBRtd6YL2Tk6r8So7LbqSUGksIWLTA6CH+yMIcmOE9b+Mqjhb1jZDMhr02mS\nymthx9G7bWw/xl1Q1KFyccPubiS7I6O5FvDCAVuS8QKBgQDguXSeJbdVkIFjTsFM\n/mRw+6TyMxgHul5QszLrLvd7wykIiVCdjM6PiJ3JYsczk2LJpjllDMouA5ey60Yz\nE6gJNf7VS1LYiRAgmj8jzMRB0C++l8bJKbuIv+VbZKLFmA6xmWM+wKf9I+kX7mn3\nUCsrT1TDdMUTmx5Ek1vEf3kaaQKBgQC4f0vRwN6ps239j7s+Yjoom1PgMnZKZBLk\n5nYj22byFWsVAYYxEc4fAp/R2fIuhpFYVuh9voSAtiPZ7lr7+XkjnrcH7exi4yCv\nuL/MvTo0ryAiS4VCmPLZiuR0yEO2D4VFLD3DGHHFDGFBpz1c7q/iz25OPtA5/rVB\n4EXwwJrv3wKBgA8NnTgywpMiuOgUEHK937CJysTGk2eBHmw9dL24Sa+qpQcDW7kS\nA4wt1JP23+0ehFGJpvKT5r8qUnETvYISYQEs8sMK5qPGmqP0cSJOxx65eVlFBXXY\nK82/PPfgR98AjotrAPDlKtuUGjsWJ1b/scSW7dCh88mabG6fiFgjSdNxAoGBALAd\nG2PzRtkZJVJYxHUtULT4aJ1nrhEe7AZCk91wjxlhJqGbndvzUh255JNuB0cwP0fj\nVfTKSzOOKjTa2VET9/XviGnyTKashsQWiEfJDenCjdsO2fsTgyXz9lYf4LrGoAHC\n1IYKLHfbdG82VFYEpjLMrU/Vl/D0WVOz4S+Ku5tjAoGAMsH6EL+xzH4hofyAyW8N\ngVRIB+F23g9xJYlj9u8qsSrIOdHWYxQrHELveSMxaSakda/WF8SeVLvYMwWQNSnC\nWmr0B+zYUrwRhV+aCdmigQoBP0O9+qr8MVtobFh5h0RpizIhk7//D6Us61GYxXIw\n7U7cZDxA5img764OO/8LukY=\n-----END PRIVATE KEY-----\n',
    projectId:'remindude-1c964'
  })
});


app.get('/google-image', async (req, res) => {
  const imageUrl:string = req.query.url as string;

  try {
    const response = await axios.get(imageUrl,{
      responseType:'arraybuffer'
    });

    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
});

app.get('/health',async (req, res)=>{
  res.send('server is alive!')
})

app.post('/send-notification', (req, res) => {
  const {title, message, fcmToken } = req.body; 

  const notificationPayload = {
    notification: {
      title: title,
      body: message, 
    },
    token: fcmToken, 
  };

  admin.messaging().send(notificationPayload)
    .then(response => {
      console.log('Successfully sent message:', response);
      res.status(200).send('Notification sent successfully');
    })
    .catch(error => {
      console.error('Error sending message:', error);
      res.status(500).send('Failed to send notification');
    });
});

let serverStarted=false
export const startServer = async () => {
  app.listen(process.env.PORT, async () => {
    console.log(`Server started listening on port ${process.env.PORT}`);
    serverStarted=true
  });
};

export const checkIsServerStarted = ():boolean =>{
  return serverStarted
}