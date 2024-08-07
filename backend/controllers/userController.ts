import { UserModel } from "../models/UserModel";
import UserService from "../services/UserService";
import {Request,Response,NextFunction} from 'express'
import { DBErrCredentialsMismatch, DBErrInternal, DBErrOTPUserSignedUpByEmail, DBErrTokenExpired, DBErrUserAlreadyExist, DBErrUserNotFound } from "../utils/handleErrors";
import { GoogleUser } from "../view/googleUser";
import axios from 'axios'

let inMemoryOTP:Map<string,string>=new Map()

class UserController {
    public async signUpEmail(req: Request, res: Response): Promise<void> {
      const { userName, email, password } = req.body;
      console.log("signup",userName,email,password)
      try {
        const user: UserModel = { userName, email, password } as UserModel;
        const { user: newUser, token } = await UserService.SignUp(user);
    
        res.cookie('token', token, {
          httpOnly:false,
          secure:true,
          sameSite:'none'
        });
    
        res.setHeader('Authorization', token).status(201).json({
          message: 'User Signed up Successfully',
          success: true,
          user: newUser,
        });
      } catch (err:any) {
        if (err instanceof DBErrUserAlreadyExist) {
          res.status(409).json({ message: err.name, success: false });
        } else if (err instanceof DBErrInternal) {
          res.status(500).json({ message: err.name, success: false });
        } else {
          res.status(500).json({ message: 'An unexpected error occurred', success: false });
        }
      }
    }

    public async signUpGoogle(req:Request,res:Response,next:NextFunction):Promise<void>{
      const {accessToken}=req.body
      try{
        const {user,token} = await UserService.GoogleSignUp(accessToken)
        
        res.cookie('token',token,{
          httpOnly:false,
          sameSite: 'none',
          secure:true,
        })

        res.setHeader('Authorization', token).status(201).json({
          message: 'User Signed up Successfully with google',
          success: true,
          user,
        });
      
        next();
      }catch(err:any){
        if (err instanceof DBErrUserAlreadyExist) {
          res.status(409).json({ message: err.name, success: false });
        } else if (err instanceof DBErrInternal) {
          res.status(500).json({ message: err.name, success: false });
        } else {
          res.status(500).json({ message: 'An unexpected error occurred', success: false });
        }
      }
    }

    public async signInEmail(req:Request,res:Response,next:NextFunction):Promise<void>{
      const {email,password} = req.body
      console.log({email,password})
      try{
        const {user,token} = await UserService.SignIn(email,password)
        res.cookie('token', token, {
          httpOnly:false,
          secure:true,
          sameSite:'none'
        });
    
        res.setHeader('Authorization', token).status(201).json({
          message: 'User Logged In up Successfully',
          success: true,
          user: user,
        });

        next();
      }catch(err:any){
        if (err instanceof DBErrUserNotFound) {
          res.status(404).json({ message: err.name, success: false });
        } else if (err instanceof DBErrInternal) {
          res.status(500).json({ message: err.name, success: false });
        } else if (err instanceof DBErrCredentialsMismatch) {
          res.status(500).json({ message: err.name, success: false });
        }
        else {
          res.status(500).json({ message:  `An unexpected error occurred: ${err}`, success: false });
        }
      }
    }

    public async signInGoogle(req:Request,res:Response,next:NextFunction):Promise<void>{
      const {googleId,email}=req.body
      try{
        const {user,token} =await UserService.GoogleSignIn(googleId,email)
        res.cookie('token',token,{
          httpOnly:false,
          secure:true,
          sameSite:'none'
        })

        res.setHeader('Authorization',token).status(201).json({
          message: 'User Successfully Logged In via Google',
          success:true,
          user
        })
        next()
      }catch(err:any){
        if (err instanceof DBErrUserNotFound) {
          res.status(404).json({ message: err.name, success: false });
        } else if (err instanceof DBErrInternal) {
          res.status(500).json({ message: err.name, success: false });
        } else if (err instanceof DBErrCredentialsMismatch) {
          res.status(500).json({ message: err.name, success: false });
        }
        else {
          res.status(500).json({ message:  `An unexpected error occurred: ${err}`, success: false });
        }
      }
    }

    public async authUser(req:Request,res:Response,next:NextFunction):Promise<void>{
     try{
      const token = req.cookies.token
      if (!token){
         res.status(401).json({message:"User Not Authorized",status:false})
        return
      }
      const {user}= await UserService.AuthUser(token)
        res.status(200).json({message:"successfully authorized",status:true,user})
      next();
     }catch(err:any){
      if (err instanceof DBErrTokenExpired){
        res.status(403).json({message: err.name, success:false})
      }else if (err instanceof DBErrInternal) {
        res.status(500).json({ message: err.name, success: false });
      } else {
        res.status(500).json({ message:  `An unexpected error occurred: ${err}`, success: false });
      }
     }
    }

    public async sendOTP(req:Request,res:Response,next:NextFunction):Promise<void>{
      try{
        const { email, accountVerification } = req.body;
        const {msg,otp}= await UserService.SendOTP(email,accountVerification)
       //saving otp in inmemory
        inMemoryOTP.set(email,otp)
        res.status(200).json({message:msg,status:true})
        next();
      }catch(err:any){
       if (err instanceof DBErrOTPUserSignedUpByEmail){
         res.status(409).json({message: err.name, success:false})
       }else if (err instanceof DBErrInternal) {
         res.status(500).json({ message: err.name, success: false });
       } else {
         res.status(500).json({ message:  `An unexpected error occurred: ${err}`, success: false });
       }
      }
     }

     public async verifyOTP(req:Request,res:Response):Promise<void>{
        const {email,otp}=req.body
        if (inMemoryOTP.get(email)==otp){
          res.status(200).json({message:"OTP Verification successfull",success:true})
          inMemoryOTP=new Map()
          return
        }else{
          res.status(400).json({message:"The OTP entered is incorrect",success:false})
          return
        }
     }

    public async updateUser(req:Request,res:Response):Promise<void>{
      try{
        const {userName,email,password}=req.body
        const file = req.file 
        const {user} =await UserService.UpdateUser(email,userName,password,file)
        res.status(201).json({message:"successfully user profile updated",success:true,user})
      }catch(err:any){
        if (err instanceof DBErrUserNotFound){
          res.status(404).json({ message: err.name, success: false });
        }else if (err instanceof DBErrInternal) {
          res.status(500).json({ message: err.name, success: false });
        } else {
          res.status(500).json({ message: `An unexpected error occurred: ${err}`, success: false });
        }
        
      }
    }

    public async resetPassword(req:Request,res:Response):Promise<void>{
      try{
        const {email,password}=req.body
        const file = req.file
        const {user} =await UserService.ResetPassword(email,password)
        res.status(201).json({message:"successfully password resetted",success:true,user})
      }catch(err:any){
        if (err instanceof DBErrUserNotFound){
          res.status(404).json({ message: err.name, success: false });
        }else if (err instanceof DBErrInternal) {
          res.status(500).json({ message: err.name, success: false });
        } else {
          res.status(500).json({ message: `An unexpected error occurred: ${err}`, success: false });
        }
      }
    }
}

export default new UserController();