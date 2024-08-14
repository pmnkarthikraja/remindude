import { IonAlert, IonButton, IonCol, IonContent, IonGrid, IonIcon, IonImg, IonInput, IonItem, IonList, IonLoading, IonPage, IonRow, IonText } from '@ionic/react';
import 'flag-icon-css/css/flag-icons.min.css';
import { logoGoogle } from 'ionicons/icons';
import React, { FunctionComponent, useState } from 'react';
import { useForm } from 'react-hook-form';
import 'react-phone-input-2/lib/style.css';
import ForgotPasswordAlertWithResend from '../components/ForgetPasswordWithResend';
import ResetPasswordPage from '../components/ResetPasswordPage';
import { User } from '../components/user';
import { useEmailSigninMutation, useGoogleSigninMutation } from '../hooks/userHooks';
import '../styles/LoginPage.css';
import ChangePasswordModal from '../components/ChangePasswordModal'


const LoginPage: FunctionComponent = () => {
  const { register, handleSubmit, watch, clearErrors, setValue, formState: { errors } } = useForm<User>();
  const { data: emailSignInData, isLoading: isEmailSigninLoading, isError: isEmailSigninError, error: emailSigninError, isSuccess: isEmailSigninSuccess, mutateAsync: emailSigninMutation } = useEmailSigninMutation()
  const { isLoading: isGoogleSigninLoading, isError: isGoogleSigninError, error: googleSigninError, isSuccess: isGoogleSigninSuccess, mutateAsync: googleSigninMutation } = useGoogleSigninMutation()

  const [forgetPassword, setForgetPassword] = useState(false)
  const [otpVerified, setOtpVerified] = useState<{ otpVerified: boolean, email: string,user:User|undefined }>({
    email: '',
    otpVerified: false,
    user:undefined
  })


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


  return (<>
    <IonPage>
      <IonContent >

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
        <div >
          <div className="header-section-login">
            <IonGrid >
              <IonRow>
                <IonCol size='auto'>
                  <IonImg src='./assets/logo2.png' style={{ width: '100px', height: '100px' }} />
                </IonCol>
                <IonCol >
                  <IonText>
                    <h2 style={{ textAlign: 'center', marginRight: '60px' }} >Login</h2>
                  </IonText>
                  <p style={{ textAlign: 'center', marginRight: '60px' }} className="subtitle">Welcome, please login to your account using Email or Google</p>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>

          <div className='scrollable-section'>
            <IonImg src="/assets/login4.png" alt="Logo" className="logo1" />

            <div className='form-inputs'>
              <form onSubmit={handleSubmit(signInQuery)}>
                <IonList style={{ width: '80%', marginLeft: '20px' }}>
                  <IonItem>
                    <IonInput style={{ width: "280px" }} type='email'
                      {...register('email', { required: true })}
                      onIonInput={() => clearErrors('email')}
                      labelPlacement="floating">
                      <div slot="label">
                        Email <IonText color="danger">*</IonText>
                      </div>
                    </IonInput>
                    {errors.email && <IonText color="danger">Email is required</IonText>}
                  </IonItem>
                  <IonItem>
                    <IonInput style={{ width: "150px" }} type='password'
                      {...register("password", { required: true })}
                      onIonInput={(e) => { clearErrors('password'); setValue('password', e.target.value as string) }}
                      labelPlacement="floating">
                      <div slot="label">
                        Password <IonText color="danger"></IonText>
                      </div>
                    </IonInput>
                    {errors.password && <IonText color="danger">Password is required</IonText>}
                  </IonItem>
                </IonList>

                {forgetPassword && !otpVerified.otpVerified &&
                  <ForgotPasswordAlertWithResend
                    otpVerified={(otpVerified, email,user) => {
                      setOtpVerified({
                        email,
                        otpVerified,
                        user

                      })
                    }} closeAlert={() => setForgetPassword(false)} />
                }
                {/* 
                {otpVerified.otpVerified && <ResetPasswordPage email={otpVerified.email} onClose={() => setOtpVerified({
                  email: '',
                  otpVerified: false
                })} />} */}

                {otpVerified.otpVerified && <ChangePasswordModal isOpen={true} forgotPassword={true} user={otpVerified.user || {
                  email:'',
                  googlePicture:'',
                  password:'',
                  profilePicture:'',
                  userName:''
                }} 
                onClose={() => setOtpVerified({
                  email: '',
                  otpVerified: false,
                  user:undefined
                })} />}


                <div style={{ display: 'flex', width: '300px', marginLeft: '15px', flexDirection: 'column', alignItems: 'center' }}>
                  <IonButton onClick={() => setForgetPassword(true)} fill='clear'><span style={{ textTransform: 'none' }}>Forgot your password ?</span></IonButton>
                  <div style={{ height: '10px' }}></div>

                  <div >
                    <IonButton type='submit' style={{ width: '200px' }} color='secondary' size='small' >Login</IonButton>
                  </div>
                  <div>
                    <IonButton style={{ width: '200px' }} color='danger' size='small' onClick={handleGoogleSignIn}>
                      <IonIcon icon={logoGoogle}></IonIcon>
                      Sign In
                    </IonButton>
                  </div>
                  <div>
                    or
                  </div>
                  <div >
                    <IonButton style={{ width: '200px' }} color='primary' size='small' onClick={() => { window.location.href = '/signup' }}>Create Your Account</IonButton>
                  </div>
                  <div style={{ height: '20px' }}></div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  </>
  );
};

export default LoginPage;
