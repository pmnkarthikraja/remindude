import mongoose, { CallbackError } from 'mongoose'
import bcrypt from 'bcrypt'
import  { Document } from 'mongoose';
import TaskModel from './TaskModel';


const Schema = mongoose.Schema

export interface UserModel extends Document{
    userName:string,
    email:string,
    password:string,
    googleId:string,
    profilePicture:string
}

const UserSchema = new Schema({
    userName:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:false
    },
    googleId:{
        type:String,
        require:false
    },
    profilePicture:{
        type:String,
        require:false
    }
})

UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) { 
      this.password = await bcrypt.hash(this.password ||'', 12);
    }
    next();
  });

UserSchema.pre('deleteOne',{ document: true, query: false },async function(next){
    try {
        await TaskModel.deleteMany({ email: this.email });
        next();
    } catch (err:any) {
        next(err);
    }
})

UserSchema.pre('findOneAndDelete', async function(next) {
    try {
        const user = await this.model.findOne(this.getFilter());
        if (user) {
            await TaskModel.deleteMany({ email: user.email });
        }
        next();
    } catch (err:any) {
        next(err);
    }
});

export default mongoose.model<UserModel>('User', UserSchema);
