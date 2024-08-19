import moment from "moment-timezone";
import { User } from "../components/user"

export function chooseAvatar(user: User | undefined): string {
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
  // return (!!user && user.googlePicture!=undefined && user.googlePicture.length>25 && user.googlePicture) || (!!user && user.profilePicture!=undefined && user.profilePicture!=='' &&  (!user.profilePicture.endsWith('undefined') || user.profilePicture.length>35) && user.profilePicture) || '/assets/avatar.png'
}



export const getTimezoneOffset = (tz: string) => {
      const offset = moment.tz(tz).format('Z');
      return ` (UTC${offset})`;
};

export const localTimeZoneLabel = `${Intl.DateTimeFormat().resolvedOptions().timeZone} ${getTimezoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone)}`
export const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone