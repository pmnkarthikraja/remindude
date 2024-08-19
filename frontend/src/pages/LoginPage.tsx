import {
  IonAlert,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonImg,
  IonInput,
  IonItem,
  IonLoading,
  IonPage,
  IonRow,
  IonToast,
  IonToolbar
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ForgotPasswordAlertWithResend from '../components/ForgetPasswordWithResend';
import { User } from '../components/user';
import { useAuthUser, useEmailSigninMutation, useGoogleSigninMutation } from '../hooks/userHooks';
import '../styles/LoginPageModel.css';

const LoginPage: React.FC = () => {
  const { register, handleSubmit, watch, clearErrors, setValue, formState: { errors } } = useForm<User>();
  const { data: emailSignInData, isLoading: isEmailSigninLoading, isError: isEmailSigninError, error: emailSigninError, isSuccess: isEmailSigninSuccess, mutateAsync: emailSigninMutation } = useEmailSigninMutation(false)
  const { isLoading: isGoogleSigninLoading, isError: isGoogleSigninError, error: googleSigninError, isSuccess: isGoogleSigninSuccess, mutateAsync: googleSigninMutation } = useGoogleSigninMutation()
  const { mutateAsync: authUser } = useAuthUser()

  const [forgetPassword, setForgetPassword] = useState(false)
  const [otpVerified, setOtpVerified] = useState<{ otpVerified: boolean, email: string, user: User | undefined }>({
    email: '',
    otpVerified: false,
    user: undefined
  })

  useEffect(() => {
    const validateSession = async (token: string) => {
      try {
        await authUser(token)
        window.location.href = '/home'
      } catch (e) {
        console.log("session not found: " + e)
      }
    }
    const token = window.localStorage.getItem('token');

    if (token != null) {
      validateSession(token)
    }
  }, [authUser, history, localStorage]);


  const signInQuery = async () => {
    const data = watch()
    await emailSigninMutation(data)
  }

  const handleGoogleSignIn = async () => {
    try {
      await googleSigninMutation()
    } catch (e: any) {
      console.log("error on google", e)
    }
  }

  const googlesigninerrmsg = googleSigninError?.message == 'popup_closed_by_user' && 'An error occurred during the Google sign-up process. Please try again.' || googleSigninError?.response?.data.message

  return (
    <IonPage>
      <IonHeader style={{ backgroundColor: '#1C0941' }}>
        <IonToolbar>
          <div className="header-content">
            <div className="header-quote" >Welcome Back, Let's Get You <span style={{ color: 'red' }}>Logged In</span>!</div>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="login-content">

        {(isEmailSigninError || isGoogleSigninError && googleSigninError.message !== 'popup_closed_by_user') && <>
          <IonAlert
            className='alert'
            isOpen={true}
            header="Login Failed!"
            cssClass={'alert-wrapper'}
            message={isEmailSigninError && emailSigninError.response?.data.message || googlesigninerrmsg}
            buttons={[{
              text: 'Ok',
              role: 'cancel',
              handler: () => window.location.reload()
            },
            ]}
          ></IonAlert>
        </>}

        {isGoogleSigninError && googleSigninError.message == 'popup_closed_by_user' && <>
          <IonAlert
            className='alert'
            isOpen={true}
            header="Please complete sign up flow!"
            cssClass={'alert-wrapper'}
            message={googlesigninerrmsg}
            buttons={[
              {
                text: 'Ok',
                role: 'confirm',
                handler: () => window.location.reload(),
              },]}
          ></IonAlert>
        </>}


        <IonLoading
          isOpen={isEmailSigninLoading || isGoogleSigninLoading}
          message={'Loading...'}
          duration={0}
        />

        <IonLoading
          isOpen={isEmailSigninSuccess || isGoogleSigninSuccess}
          message={"Login successfull, Redirecting to homepage.."}
          duration={2400}
        />

        {errors.password && <IonToast color={'danger'}
          onDidDismiss={() => clearErrors()}
          buttons={[
            {
              text: 'Ok',
              role: 'cancel',
              handler: clearErrors
            },
          ]} position="top" isOpen={true} message={'Password is required!'} duration={3000}></IonToast>}

        {errors.email && <IonToast color={'danger'}
          onDidDismiss={() => clearErrors()}
          buttons={[
            {
              text: 'Ok',
              role: 'cancel',
              handler: clearErrors
            },
          ]} position="top" isOpen={true} message={'Email is required!'} duration={3000}></IonToast>}

        <IonGrid>
          <IonRow className="ion-justify-content-center animate__fadeInDown animate__animated">
            <IonCol size="12" size-md="8" size-lg="6" sizeSm='8' sizeLg='4'>
              <div className="login-box">
                <IonImg src="/assets/login5.png" alt="Company Logo" className="header-logo animate__bounceIn animate__animated" />

                <form onSubmit={handleSubmit(signInQuery)}>
                  <IonItem className="input-item">
                    <IonInput
                      {...register('email', { required: true })}
                      onIonInput={(e) => {
                        const email = e.target.value as string
                        setValue('email',email.toLowerCase() )
                        clearErrors('email')}}
                      label='Email' labelPlacement='floating' type="email" />
                  </IonItem>
                  <IonItem className="input-item">
                    <IonInput
                      {...register("password", { required: true })}
                      onIonInput={(e) => { clearErrors('password'); setValue('password', e.target.value as string) }}
                      label='Password' labelPlacement='floating' type="password" />
                  </IonItem>

                  <div className="forgot-password" onClick={() => setForgetPassword(true)}>Forgot password?</div>
                  <IonButton type='submit' expand="block" className="login-button animate__bounceIn animate__animated">
                    LOGIN
                  </IonButton>
                </form>

                {forgetPassword && !otpVerified.otpVerified &&
                  <ForgotPasswordAlertWithResend
                    otpVerified={(otpVerified, email, user) => {
                      setOtpVerified({
                        email,
                        otpVerified,
                        user

                      })
                    }} closeAlert={() => setForgetPassword(false)} />
                }

                {otpVerified.otpVerified && <ChangePasswordModal isOpen={true} forgotPassword={true} user={otpVerified.user || {
                  email: '',
                  googlePicture: '',
                  password: '',
                  profilePicture: '',
                  userName: ''
                }}
                  onClose={() => setOtpVerified({
                    email: '',
                    otpVerified: false,
                    user: undefined
                  })} />}

                <div className="or-text">Or Sign Up Using</div>
                <div className="social-buttons">
                  <IonButton
                    onClick={handleGoogleSignIn}
                    fill="clear" className="social-icon-button animate__bounceIn animate__animated">
                    <img src="assets/google.png" alt="Facebook" className="social-icon" />
                  </IonButton>
                </div>
                <div className="signup-text">Or Sign Up Using</div>
                <div className="signup-link" onClick={() => window.location.href = '/signup'}>Create Your Account</div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
