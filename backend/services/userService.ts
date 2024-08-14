import bcrypt from 'bcrypt';
import jwt, { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail';
import { UserModel } from '../models/UserModel';
import userRepo from '../repo/userRepo';
import createJSONWebToken from '../utils/authToken';
import { DBErrCredentialsMismatch, DBErrInternal, DBErrOTPUserSignedUpByEmail, DBErrTokenExpired, DBErrUserAlreadyExist, DBErrUserNotFound } from '../utils/handleErrors';
import { getUserInfo } from '../utils/helper';
require("dotenv").config();
import UserSchema from '../models/UserModel';

export interface JwtPayload extends BaseJwtPayload {
  id?: string;
}

interface UserServiceImplementation{
    SignUp:(user:UserModel)=>Promise<{ user: UserModel; token: string }>
    SignIn:(email:string,password:string)=>Promise<{user:UserModel;token:string}>
    GoogleSignUp:(accessToken:string)=>Promise<{user:UserModel; token:string}>
    GoogleSignIn:(googleId:string,email:string)=>Promise<{user:UserModel;token:string}>
    AuthUser:(token:string)=>Promise<{user:UserModel}>
    SendOTP:(email:string, accountVerification:boolean )=>Promise<{msg:string,otp:string}>
    UpdateUser:(email:string,userName:string,profilePicture:Express.Multer.File | undefined,isProfilePicSet:string)=>Promise<{user:UserModel}>
    ResetPassword:(email:string,password:string)=>Promise<{user:UserModel}>
    ValidatePassword:(email:string,password:string)=>Promise<{user:UserModel}>
  }

class UserService implements UserServiceImplementation {
  public async SignUp(userData: UserModel): Promise<{ user: UserModel; token: string }> {
    //find the exist one, 
    const existingUser =await userRepo.findOneByEmail(userData.email)
    if (existingUser){
      throw new DBErrUserAlreadyExist()
    }

    const newUser = await userRepo.SignUp(userData)
    const token = createJSONWebToken(newUser._id)
    return {user:newUser,token}
  }

  public async GoogleSignUp(accessToken:string):Promise<{user:UserModel,token:string}>{
    //find the user on google server  
    const googleUser  = await getUserInfo(accessToken)
    
    //find the googleUser on user db
    const existingUser = await userRepo.findOneByEmail(googleUser.email,googleUser.sub)
    if (existingUser){
      throw new DBErrUserAlreadyExist()
    }

    const userData = {
      userName: googleUser.name,
      email:googleUser.email,
      googleId:googleUser.sub,
      profilePicture:googleUser.picture
    } as UserModel

    //if user not present, create user in db with google id
    const newUser = await userRepo.SignUp(userData) 
    const token = createJSONWebToken(newUser._id)
    return {user:newUser,token}
  }

 async SignIn(email: string, password: string): Promise<{ user: UserModel; token: string; }>{
  //find the user by email
  const existingUser =await userRepo.findOneByEmail(email)
  console.log("existing user: ",existingUser)
  if (existingUser==null){
    throw new DBErrUserNotFound()
  }

  const isPasswordMatch = await bcrypt.compare(password,existingUser.password)

  if (!isPasswordMatch){
    throw new DBErrCredentialsMismatch()
  }

  //generate token
  const token = createJSONWebToken(existingUser._id)
  return {user:existingUser,token}
 }

 async GoogleSignIn(googleId:string,email:string):Promise<{user:UserModel; token:string}>{
  //find user email or googleid
  const existingUser = await userRepo.findOneByEmail(email,googleId)

  if (!existingUser){
    throw new DBErrUserNotFound()
  }

  //generate token
  const token = createJSONWebToken(existingUser._id)
  return {user:existingUser,token}
 }

 async AuthUser(token: string): Promise<{ user: UserModel }> {
  const tokenKey = process.env.TOKEN_KEY || '';
  try {
    const decoded = jwt.verify(token, tokenKey) as JwtPayload; 
    const userId = decoded.id;
    if (!userId) {
      throw new DBErrUserNotFound();
    }
    const user = await userRepo.findOneById(userId);
    if (user) {
      return { user };
    } else {
      throw new DBErrUserNotFound();
    }
  } catch (err) {
    if (err instanceof DBErrTokenExpired) {
      throw new DBErrTokenExpired();
    } else {
      throw err;
    }
  }
}
async SendOTP(email:string,accountVerification:boolean):Promise<{msg:string,otp:string}>{
  if (!accountVerification){
    const user= await userRepo.findOneByEmail(email)
    if (user==null){
      throw new DBErrUserNotFound()
    }
    if (user){
      if (!!user.googleId){
        throw new DBErrOTPUserSignedUpByEmail()
      }
    }
  }
  const otp = Math.floor(100000 + Math.random() * 900000) ;
  const onSendMail = await sendEmail(email,'Reset Your Password-OTP','',`Your OTP for resetting password is: ${otp}`)

  if (onSendMail.rejected.length!=0){
    throw new DBErrInternal("failed to send otp")
  }
  return {
    msg:"otp send successfully",
    otp:otp.toString()
  }
}

async UpdateUser(email:string,userName:string,profilePicture:Express.Multer.File | undefined,isProfilePicSet:string):Promise<{user:UserModel}>{
  const fileContent = Buffer.from(profilePicture?.buffer||'').toString('base64');

  const user =await userRepo.UpdateUser(email,userName,fileContent,isProfilePicSet)
  
  if (!user){
    throw new DBErrUserNotFound()
  }

  return {user}
}

async ResetPassword(email:string,password:string):Promise<{user:UserModel}>{
  const hashedPassword = await bcrypt.hash(password, 12);
  const user =await userRepo.ResetPassword(email,hashedPassword)
  
  if (!user){
    throw new DBErrUserNotFound()
  }

  return {user}
}

async ValidatePassword(email:string,password:string):Promise<{user:UserModel}>{
  //find the user by email
  const existingUser =await userRepo.findOneByEmail(email)
  if (existingUser==null){
    throw new DBErrUserNotFound()
  }

  const isPasswordMatch = await bcrypt.compare(password,existingUser.password)

  if (!isPasswordMatch){
    throw new DBErrCredentialsMismatch()
  }

  return {user:existingUser}
}
}

export default new UserService();

