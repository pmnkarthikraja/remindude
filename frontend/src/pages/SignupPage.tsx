
import { IonAlert, IonButton, IonCol, IonContent, IonGrid, IonIcon, IonImg, IonInput, IonItem, IonList, IonLoading, IonPage, IonRow, IonText } from '@ionic/react';
import 'flag-icon-css/css/flag-icons.min.css';
import { logoGoogle } from 'ionicons/icons';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import 'react-phone-input-2/lib/style.css';
import AccountVerification from '../components/AccountVerification';
import { User } from '../components/user';
import { useEmailSignupMutation, useGoogleSignupMutation, useSendOTPMutation } from '../hooks/userHooks';
import '../styles/SignupPage.css';

const SignupPage: FunctionComponent = () => {
  const { register, watch, handleSubmit,setValue,clearErrors, formState: { errors } } = useForm<User>();
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
      <IonContent>
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
              handler:()=> {
                window.location.href='/login'
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

        <div>
          <div className="header-section-signup">
            <IonGrid>
              <IonRow>
                <IonCol size='auto'>
                  <IonImg src='./assets/logo2.png' style={{ width: '100px', height: '100px' }} />
                </IonCol>
                <IonCol>
                  <IonText>
                    <h2 style={{ textAlign: 'center', marginRight: '60px' }}>Register</h2>
                  </IonText>
                  <p style={{ textAlign: 'center', marginRight: '60px' }} className="subtitle">Welcome, please create your account using email address</p>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>

          <div className="scrollable-section">
            <IonImg src="/assets/login3.png" alt="Logo" className="logo1" />
            <div className='form-inputs'>
              <form onSubmit={handleSubmit(onSubmit)}>
                <IonList style={{ width: '80%', marginLeft: '20px' }}>
                  <IonItem>
                    <IonInput type='text'
                      {...register('userName', { required: true })}
                      onIonInput={()=>clearErrors('userName')}
                      labelPlacement="floating">
                      <div slot="label">
                        User Name <IonText color="danger">*</IonText>
                      </div>
                    </IonInput>
                    {errors.userName && <IonText color='danger'>user name is required!</IonText>}
                  </IonItem>
                  <IonItem>
                    <IonInput type='email'
                      {...register("email", { required: true })}
                      onIonInput={()=>clearErrors('email')}
                      labelPlacement="floating">
                      <div slot="label">
                        Email <IonText color="danger">*</IonText>
                      </div>
                    </IonInput>
                    {errors.email && <IonText color='danger'>email is required!</IonText>}
                  </IonItem>
                  <IonItem>
                    <IonInput type='password'
                      {...register("password", { required: true })}
                      onIonInput={(e)=>{
                        clearErrors('password');
                        setValue('password',e.target.value as string)
                      }}
                      labelPlacement="floating">
                      <div slot="label">
                        Password <IonText color="danger"></IonText>
                      </div>
                    </IonInput>
                    {errors.password && <IonText color='danger'>password is required!</IonText>}
                  </IonItem>
                  {/* <IonItem>
                    <PhoneInput
                      country={'in'}
                      value={phone}
                      specialLabel='Mobile'
                      onChange={setPhone}
                    />
                  </IonItem> */}
                </IonList>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div >
                    <IonButton type='submit' style={{ width: '200px' }} color='secondary' size='small' >Register</IonButton>
                  </div>
                  <div>
                    or
                  </div>
                  <div >
                    <IonButton style={{ width: '200px' }} color='danger' size='small' onClick={googleSignupQuery}>
                      <IonIcon icon={logoGoogle}></IonIcon>
                      Sign Up
                    </IonButton>
                  </div>
                  <div style={{ height: '20px' }}></div>
                  <div>
                    <IonButton fill='clear' href='/login' color='primary'><span style={{ textTransform: 'none' }}>Already have an account ?</span></IonButton>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SignupPage;



