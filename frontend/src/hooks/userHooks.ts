import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { AxiosError, AxiosResponse } from "axios";
import { useMutation, useQueryClient } from "react-query";
import { useHistory } from "react-router-dom";
import { userApi } from "../api/userApi";
import { User } from "../components/user";
import { useIonRouter } from "@ionic/react";

interface AxiosErrorType {
  message: string,
  success: boolean
}


export const useEmailSignupMutation = (validatePassword:boolean) => {
  const queryClient = useQueryClient();
  const history = useHistory()

  return useMutation(
    (userDetails: User) => userApi.signup(userDetails),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('userDetails');
        if (!validatePassword){
          localStorage.setItem('token',data.data.token)
        }
        setTimeout(() => {
          history.push('/home');
          
        }, 1500);
      },
      onError: (e: AxiosError<AxiosErrorType>) => {
        console.log("error on onRegister", e);
      }
    }
  );
};

export const useAuthUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
  AxiosResponse<{ message: string, success: boolean, user: User }, AxiosError<AxiosErrorType>>, 
  AxiosError<AxiosErrorType>, 
  string,
  unknown
  >(
    'authenticateUser', 
    (token:string)=> userApi.authToken(token),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userDetails');
      },
      onError: (e) => {
        console.log("Error during authentication", e);
      }
    }
  );
};

interface OTPPayload {
  email: string,
  accountVerification: boolean,
  type:'forgotPassword'|'verification',
  userName:string | undefined
}

export const useSendOTPMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (payload: OTPPayload) => userApi.sendOTP(payload.email, payload.accountVerification,payload.type,payload.userName),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('userclient');
      },
      onError: (e: AxiosError<AxiosErrorType>) => {
        console.log("error on sending otp: ", e)
      }
    }
  )
}

interface VerifyOTPPayload{
  email:string,
  otp:string
}

export const useVerifyOTPMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (payload: VerifyOTPPayload) => userApi.verifyOTP(payload.email, payload.otp),
    {
      onSuccess: (data) => {
        console.log("on verified data: ",data.data)
        queryClient.invalidateQueries('userclient');
      },
      onError: (e: AxiosError<AxiosErrorType>) => {
        console.log("error on verifying otp: ", e)
      }
    }
  )
}

interface ValidatePasswordPayload{
  email:string,
  password:string,
}

export const useValidatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (payload: ValidatePasswordPayload) => userApi.validatePassword(payload.email, payload.password),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('userclient');
      },
      onError: (e: AxiosError<AxiosErrorType>) => {
        console.log("error on validating password: ", e)
      }
    }
  )
}

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (payload: ValidatePasswordPayload) => userApi.resetPassword(payload.email, payload.password),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('userclient');
      },
      onError: (e: AxiosError<AxiosErrorType>) => {
        console.log("error on reseting password: ", e)
      }
    }
  )
}




const initializeGoogleAuth = async () => {
  try {
    await GoogleAuth.initialize({
      clientId: process.env.NODE_ENV !== 'production' ? '312340865452-v83k8uchncmkgufublc2ee3da5bkhops.apps.googleusercontent.com' : '312340865452-g3vcao11ukkovh2o19ic8ka9h3pasdmj.apps.googleusercontent.com', 
      // clientId:'312340865452-g3vcao11ukkovh2o19ic8ka9h3pasdmj.apps.googleusercontent.com',   //production client
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  } catch (e: any) {
    console.log("error on google auth", e)
  }
};


//since the name conflict between google and our user name 'User'
interface GoogleUser {
  email: string,
  familyName: string,
  givenName: string,
  id: string,
  imageUrl: string,
  serverAuthCode: string,
  name: string
  authentication: {
    accessToken: string,
    idToken: string,
    refreshToken: string
  }
}

const signInWithGoogle = async (): Promise<GoogleUser | null> => {
  try {
    await initializeGoogleAuth();
    const result = await GoogleAuth.signIn();
    return result as GoogleUser
  } catch (e: any) {
    console.log("error in google signin", e);
    if (e.error === 'popup_closed_by_user') {
      return null;
    }
    throw e;
  }
};


const googleSignup = async (accessToken: string) => {
 const data=  await userApi.googleSignup(accessToken);
 localStorage.setItem('token',data.data.token)
};

const googleSignin = async (googleId:string,email:string)=>{
  const data= await userApi.googleLogin(googleId,email)
  localStorage.setItem('token',data.data.token)
}


export const useGoogleSignupMutation = () => {
  const queryClient = useQueryClient();
  const history = useHistory()

  return useMutation(
    async () => {
      const googleUser = await signInWithGoogle()
      if (googleUser?.authentication.accessToken) {
        await googleSignup(googleUser.authentication.accessToken)
      } else {
        throw new Error('popup_closed_by_user')
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userDetails');
        history.push('/home');
      },
      onError: (e: AxiosError<any>) => {
        console.log("error on google signup", e);
      }
    }
  );
}

export const useGoogleSigninMutation = () => {
  const queryClient = useQueryClient();
  const history = useHistory()

  return useMutation(
    async () => {
      const googleUser = await signInWithGoogle()

      if (googleUser?.authentication.accessToken) {
        await googleSignin(googleUser.id,googleUser.email)
      } else {
        throw new Error('popup_closed_by_user')
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userDetails');
        setTimeout(() => {
          history.push('/home')
        }, 2500)
      },
      onError: (e: AxiosError<any>) => {
        console.log("error on google signup", e);
      }
    }
  );
}


export const useEmailSigninMutation = (validatePassword:boolean) => {
  const queryClient = useQueryClient();
  const history = useHistory()

  return useMutation(
    (user: User) => userApi.login(user),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('userLogin');
        if (!validatePassword){
          localStorage.setItem('token',data.data.token)
        }
        setTimeout(() => {
          history.push('/home')
        }, 2500)
        console.log("on login mutation success: ", data);
      },
      onError: (e: AxiosError<AxiosErrorType>) => {
        console.log("error on onLogin", e);
      }
    }
  );
};

interface EditProfilePayload{
  email:string,
  password:string,
  userName:string,
  profilePicture:Blob|string
}

export const useEditProfileMutation = () => {
  const queryClient = useQueryClient();
  const router = useIonRouter()

  return useMutation(
    (user: EditProfilePayload) => userApi.editProfile(user.email,user.password,user.userName,user.profilePicture),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('userDetails');
        setTimeout(() => {
          router.push('/home')
        }, 1000)
        console.log("on edit profile mutation success: ", data);
      },
      onError: (e: AxiosError<AxiosErrorType>) => {
        console.log("error on edit profile", e);
      }
    }
  );
};


