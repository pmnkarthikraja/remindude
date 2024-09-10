import mongoose from 'mongoose'
import  { Document } from 'mongoose';

const Schema = mongoose.Schema

export interface MasterControllerModel extends Document{
    email:string,
    masterEmailNotificationEnabled:boolean,
    masterPushNotificationEnabled:boolean,
}

const masterControllerSchema = new Schema({
   email:{
    type:String,
    require:true,
   },
   masterEmailNotificationEnabled:{
    type:Boolean,
    require:true
   },
   masterPushNotificationEnabled:{
    type:Boolean,
    require:true
   }
})


export default mongoose.model<MasterControllerModel>('masterController',masterControllerSchema)
