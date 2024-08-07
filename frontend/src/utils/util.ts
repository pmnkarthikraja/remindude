import { User } from "../components/user"

export function chooseAvatar(user: User | undefined): string {
  return (!!user && user.profilePicture!=undefined && user.profilePicture.length>25 && user.profilePicture) ||
  (!!user && user.googlePicture!=undefined && user.googlePicture.length>20 && user.googlePicture) || '/assets/avatar.png'
  }