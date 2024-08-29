import moment from "moment-timezone";
import { User } from "../components/user"
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL=process.env.NODE_ENV==='production' ? "https://remindude.vercel.app" :  "http://localhost:4000"

async function fetchImageAndReturnAsBlob(url:string) {
  const proxyUrl = `${BASE_URL}/google-image?url=${encodeURIComponent(url)}`;
  try {
    const response = await axios.get(proxyUrl, { responseType: 'blob' });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Error fetching image:', error);
    return '/assets/avatar.png'; //fallback
  }
}


export async function chooseAvatar(user:User | undefined) {
  if (!!user) {
      if ((user.googlePicture == '' && user.profilePicture == 'data:image/*;base64,') || (user.profilePicture == '' && user.googlePicture == '')) {
          return '/assets/avatar.png';
      } else if (user.googlePicture && user.googlePicture.startsWith('https')) {
          try {
              return await fetchImageAndReturnAsBlob(user.googlePicture);
          } catch (error) {
              console.error('Error fetching Google profile picture:', error);
              return '/assets/avatar.png';
          }
      } else if (!user.googlePicture?.startsWith('https') && (user.profilePicture && user.profilePicture.length > 40 && !user.profilePicture.includes('https'))) {
          return user.profilePicture;
      } else if (!user.profilePicture?.endsWith('undefined')) {
          return user.profilePicture || '';
      } else {
          return '/assets/avatar.png';
      }
  } else {
      return '/assets/avatar.png';
  }
}


export const useGetAvatar =(user:User)=>{
  const [userAvatar,setUserAvatar]=useState('')
  useEffect(()=>{
    const callAvatar = async ()=>{
     const image= await chooseAvatar(user)
     setUserAvatar(image)
    }
    callAvatar()
  },[user])
  return userAvatar
}


 function chooseAvatar1(user: User | undefined): string {
  if (!!user){
    if ((user.googlePicture == '' && user.profilePicture == 'data:image/*;base64,') || (user.profilePicture == '' && user.googlePicture=='')){
      return '/assets/avatar.png'
    }else if(user.googlePicture && user.googlePicture.startsWith('https')){
      return user.googlePicture
    }
    else if (!user.googlePicture?.startsWith('https') && (user.profilePicture && user.profilePicture?.length>40 && !user.profilePicture.includes('https'))){
      return user.profilePicture
    }
    else if (!user.profilePicture?.endsWith('undefined')){
      return user.profilePicture || ''
    }else{
      return '/assets/avatar.png'
    }
  }else{
    return '/assets/avatar.png'
  }
}

export const getTimezoneOffset = (tz: string) => {
      const offset = moment.tz(tz).format('Z');
      return ` (UTC${offset})`;
};

export const localTimeZoneLabel = `${Intl.DateTimeFormat().resolvedOptions().timeZone} ${getTimezoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone)}`
export const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone