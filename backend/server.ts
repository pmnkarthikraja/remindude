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
    privateKey:process.env.FIREBASESECRETKEY,
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