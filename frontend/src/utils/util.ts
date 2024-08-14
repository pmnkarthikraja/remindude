import moment from "moment-timezone";
import { User } from "../components/user"

export function chooseAvatar(user: User | undefined): string {
  return (!!user && user.profilePicture!=undefined && user.profilePicture.length>25 && user.profilePicture) ||
  (!!user && user.googlePicture!=undefined && user.googlePicture.length>20 && user.googlePicture) || '/assets/avatar.png'
  }

export const getTimezoneOffset = (tz: string) => {
      const offset = moment.tz(tz).format('Z');
      return ` (UTC${offset})`;
};

export const localTimeZoneLabel = `${Intl.DateTimeFormat().resolvedOptions().timeZone} ${getTimezoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone)}`
export const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone