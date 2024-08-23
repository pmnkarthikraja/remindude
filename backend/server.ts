import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
require('dotenv').config();
import bodyParser from 'body-parser';
// import YAML from 'yamljs';
// import swaggerUi from 'swagger-ui-express';
// const swaggerDocument = YAML.load('./swagger/swagger.yml')

import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import holidayRoutes from './routes/holidayRoutes'

export const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// app.use(cors({
//   origin: "*",
//   credentials: true,
// }))

app.use(cors({
  origin: function (origin, callback) {
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
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


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


