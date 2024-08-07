import { GoogleUser } from "../view/googleUser";
import axios from 'axios'

export const getRemainingTime = (dateTime: string): number => {
  const now = new Date().getTime();
  const targetTime = new Date(dateTime).getTime();
  return targetTime - now;
};

export async function getUserInfo(accessToken: string): Promise<GoogleUser> {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('failed to fetch user info');
  }
}