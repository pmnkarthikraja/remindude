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
import '../styles/LoginPageModel.css';
import { User } from '../components/user';
import { useForm } from 'react-hook-form';
import { useEmailSignupMutation, useSendOTPMutation, useGoogleSignupMutation } from '../hooks/userHooks';
import AccountVerification from '../components/AccountVerification';

const SignupPage: React.FC = () => {
  const { register, watch, handleSubmit, setValue, clearErrors, formState: { errors } } = useForm<User>();
  const { isLoading: isEmailSignupLoading, isError: isEmailSignupError, error: emailSignupError, mutateAsync: emailSignupMutation } = useEmailSignupMutation(false)
  const { isLoading: isSendOtpLoading, isError: isSendOtpError, error: sendOtpError, mutateAsync: sendOtpMutation } = useSendOTPMutation()
  const { isLoading: isGoogleSignupLoading, isError: isGoogleSignupError, error: googleSignupError, status, mutateAsync: googleSignupMutation } = useGoogleSignupMutation()
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const email = watch('email');

  useEffect(() => {
    if (otpVerified) {
      signUpQuery();
    }
  }, [otpVerified]);


  const sendOtpQuery = async (email: string) => {
    await sendOtpMutation({ email, accountVerification: true })
    setAlertIsOpen(true);
  }

  const signUpQuery = async () => {
    const data = watch()
    await emailSignupMutation(data)
  }


  const onSubmit = async (data: User) => {
    clearErrors()
    await sendOtpQuery(data.email);
  };


  const googleSignupQuery = async () => {
    try {
      await googleSignupMutation()
    } catch (e: any) {
      console.log("error on google", e)
    }
  }

  const googlesignuperrmsg = googleSignupError?.message == 'popup_closed_by_user' && 'An error occurred during the Google sign-up process. Please try again.' || googleSignupError?.response?.data.message

  return (
    <IonPage>
      <IonHeader style={{ backgroundColor: '#1C0941' }}>
        <IonToolbar>
          <div className="header-content">
            <div className="header-quote" >Your Next Step is Just a <span style={{ color: 'red' }}>Sign-Up </span>Away!</div>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="login-content">

        {alertIsOpen && !otpVerified && (
          <AccountVerification
            forgotPassword={false}
            closeAlert={() => setAlertIsOpen(false)}
            otpVerified={(email, verified) => {
              setOtpVerified(verified);
              setAlertIsOpen(false);
            }}
            resendOtp={() => sendOtpQuery(email)}
            signUpEmail={email}
          />
        )}

        <IonLoading
          isOpen={isSendOtpLoading || isEmailSignupLoading || (isGoogleSignupLoading)}
          message={isSendOtpLoading ? 'Sending OTP..' : 'Loading...'}
          duration={0}
        />

        {(isEmailSignupError || isSendOtpError || (isGoogleSignupError && googleSignupError.message !== 'popup_closed_by_user')) && <>
          <IonAlert
            className='alert'
            isOpen={true}
            header="Warning!"
            cssClass={'alert-wrapper'}
            message={isEmailSignupError && emailSignupError.response?.data.message || sendOtpError?.response?.data.message || googlesignuperrmsg}
            buttons={[{
              text: 'Cancel',
              role: 'cancel',
              handler: () => window.location.reload()
            },
            {
              text: 'Go to Login',
              role: 'confirm',
              handler: () => {
                window.location.href = '/login'
              }
            },]}
          ></IonAlert>
        </>}

        {isGoogleSignupError && googleSignupError.message == 'popup_closed_by_user' &&
          <IonAlert
            className='alert'
            isOpen={true}
            header="Please complete sign up flow!"
            cssClass={'alert-wrapper'}
            message={googlesignuperrmsg}
            buttons={[
              {
                text: 'Ok',
                role: 'confirm',
                handler: () => window.location.reload(),
              },]}
          ></IonAlert>
        }

        {(errors.userName || errors.email || errors.password) && <IonToast color={'danger'}
          onDidDismiss={() => clearErrors()}
          buttons={[
            {
              text: 'Ok',
              role: 'cancel',
              handler: clearErrors
            },
          ]} position="top" isOpen={true} message={(errors.email && "Email is required!") || (errors.password && 'Password is required!') || (errors.userName && "Username is required!") || '' } duration={3000}></IonToast>}

        <IonGrid>
          <IonRow className="ion-justify-content-center animate__fadeInDown animate__animated">
            <IonCol size="12" size-md="8" size-lg="6" sizeSm='8' sizeLg='4'>
              <div className="login-box">
                <IonImg src="/assets/signup.png" alt="Company Logo" className="header-logo animate__bounceIn animate__animated" />
                <form onSubmit={handleSubmit(onSubmit)}>
                  <IonItem className="input-item" >
                    <IonInput
                      color={errors.userName && 'danger'}
                      {...register('userName', { required: true})}
                      onIonInput={() => clearErrors('userName')}
                      label='Username' labelPlacement='floating' type="text"/>
                  </IonItem>
                  <IonItem className="input-item">
                    <IonInput
                      color={errors.email && 'danger'}
                      {...register("email", { required: true })}
                      onIonInput={() => clearErrors('email')}
                      label='Email' labelPlacement='floating' type="email" />
                  </IonItem>
                  <IonItem className="input-item">
                    <IonInput
                      color={errors.password && 'danger'}
                      {...register("password", { required: true })}
                      onIonInput={(e) => {
                        clearErrors('password');
                        setValue('password', e.target.value as string)
                      }}
                      label='Password' labelPlacement='floating' type="password" />
                  </IonItem>
                  <IonButton type='submit' expand="block" className="login-button animate__bounceIn animate__animated">
                    Register
                  </IonButton>
                </form>

                <div className="or-text">Or Sign Up Using</div>
                <div className="social-buttons">
                  <IonButton onClick={googleSignupQuery} fill="clear" className="social-icon-button animate__bounceIn animate__animated">
                    <img src="assets/google.png" alt="Facebook" className="social-icon" />
                  </IonButton>
                </div>
                <div className="signup-text">Already have an account ?</div>
                <div className="signup-link" onClick={() => window.location.href = '/login'}>Go to Login</div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default SignupPage;
