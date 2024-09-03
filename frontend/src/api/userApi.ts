import axios, {AxiosResponse} from 'axios'
import { User } from '../components/user'

export interface UserAPI{
    authToken:(token:string)=>Promise<AxiosResponse>;
    googleSignup:(accessToken:string)=>Promise<AxiosResponse>;
    googleLogin:(googleId:string,email:string)=>Promise<AxiosResponse>;
    signup:(user:User)=>Promise<AxiosResponse>
    login:(user:User)=>Promise<AxiosResponse>
    sendOTP:(email:string,accountVerification:boolean,type:'verification'|'forgotPassword',userName:string|undefined)=>Promise<AxiosResponse>
    verifyOTP:(email:string,otp:string)=>Promise<AxiosResponse>
    resetPassword:(email:string,password:string)=>Promise<AxiosResponse>
    editProfile:(email:string,password:string,userName:string,profilePicture:Blob|string)=>Promise<AxiosResponse>
    validatePassword :(email:string,password:string)=>Promise<AxiosResponse>
}

// const BASE_URL = "http://localhost:4000"
// const BASE_URL=process.env.NODE_ENV==='production' ? "https://remindude.vercel.app" :  "http://localhost:4000"
const BASE_URL=process.env.NODE_ENV==='production' ? "https://remindude-backend.onrender.com" :  "http://localhost:4000"


class UserAPIService implements UserAPI{
    async signup (user:User): Promise<AxiosResponse>{
         return await axios.post(`${BASE_URL}/signup-email`,{...user},{withCredentials:true,headers:{
             "Content-Type":"application/json"
         }}) 
     }
     async googleSignup (accessToken:string): Promise<AxiosResponse>{
         return await axios.post(`${BASE_URL}/signup-google`,{accessToken},{withCredentials:true,headers:{
             "Content-Type":"application/json"
         }})
     }
 
     async login (user:User): Promise<AxiosResponse>{
         return await axios.post(`${BASE_URL}/signin-email`,{...user},{withCredentials:true,headers:{
             "Content-Type":"application/json"
         }})
     }
 
     async googleLogin (googleId:string,email:string):Promise<AxiosResponse>{
         return await axios.post(`${BASE_URL}/signin-google`,{googleId,email},{withCredentials:true,headers:{
             "Content-Type":"application/json"
         }})
     }
 
     async authToken (token:string):Promise<AxiosResponse>{
         return await axios.post(`${BASE_URL}/auth-user`,{},{withCredentials:true,headers:{
             "Content-Type":"application/json",
             "Authorization":`Bearer ${token}`
         }})
     }
 
     async sendOTP (email:string,accountVerification:boolean, type:'verification'|'forgotPassword',userName:string|undefined):Promise<AxiosResponse>{
         return await axios.post(`${BASE_URL}/send-otp`,{email,accountVerification,type,userName})
     }

     async verifyOTP (email:string,otp:string):Promise<AxiosResponse>{
        return await axios.post(`${BASE_URL}/verify-otp`,{email,otp})
    }
 
     async resetPassword (email:string,password:string):Promise<AxiosResponse> {
         return await axios.put(`${BASE_URL}/reset-password`,{email,password})
     }
     
     async validatePassword (email:string,password:string):Promise<AxiosResponse> {
        return await axios.post(`${BASE_URL}/validate-password`,{email,password})
    }
 
     async editProfile (email:string,password:string,userName:string,profilePicture:Blob|string):Promise<AxiosResponse>{
         const formData = new FormData();
         formData.append('email', email);
         formData.append('password', password);
         formData.append('userName', userName);
         if (!!profilePicture && typeof profilePicture!=='string'){
             formData.append('profilePicture', profilePicture, 'profile.jpg');
         }
         if (!!profilePicture && typeof profilePicture=='string'){
            formData.append("isProfilePicSet",profilePicture)
         }
         return await axios.put(`${BASE_URL}/update-user`,formData,{
             headers: {
                 'Content-Type': 'multipart/form-data',
             },
         })
     }
 }
 

export const userApi = new UserAPIService()