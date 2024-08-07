import { IonAlert, IonButton, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonInput, IonItem, IonList, IonLoading, IonModal, IonPage, IonRow, IonText } from '@ionic/react';
import { FunctionComponent, useState } from 'react';
import { userApi } from '../api/userApi';
import { useHistory } from 'react-router';
import '../styles/resetPassword.css'
import React from 'react';


export interface ResetPasswordPageProps {
  email: string
  onClose: (isClose: boolean) => void
}

const ResetPasswordPage: FunctionComponent<ResetPasswordPageProps> = ({
  email,
  onClose
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory()

  const resetPassword = async () => {
    // setErrorMessage('')
    if (password !== confirmPassword) {
      setErrorMessage("Passwords should match!")
      return
    }
    try {
      setIsLoading(true);
      const res = await userApi.resetPassword(email, password)
      setIsLoading(false);
      history.push('/login')
      onClose(true)
    } catch (error) {
      setErrorMessage('Error resetting password');
      setIsLoading(false);
    }
  };

  return (
    <>
      <IonPage>
        <IonContent>
          <IonModal isOpen={true}>
            <IonGrid fixed>
              <IonRow style={{backgroundColor:'#87ceeb'} } >
                <IonCol >
                <IonText  color='light'>
                <h2>Password Reset</h2>
              </IonText>
                </IonCol>
              </IonRow>
              <IonRow>
              <IonList>
              <IonItem>
                <IonInput
                  type="password"
                  label='Enter New Password'
                  labelPlacement='floating'
                  placeholder="Enter new password"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  type="password"
                  label='Confirm New Password'
                  labelPlacement='floating'
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onIonChange={(e) => setConfirmPassword(e.detail.value!)}
                />
              </IonItem>
            </IonList>
              </IonRow>
            </IonGrid>

            <IonAlert className='alert' isOpen={!!errorMessage} header={'Oops..'} message={errorMessage}
              onDidDismiss={() => { setErrorMessage('') }} buttons={['Ok']} />
           

            <IonFooter>
              <IonRow>
                <IonCol>
                  <IonButton color='danger' onClick={() => onClose(true)}>cancel</IonButton>
                </IonCol>
                <IonCol push='0.5' pushMd='2.5'>
                  <IonButton color='success' onClick={() => resetPassword()}>Reset Password</IonButton>
                </IonCol>
              </IonRow>
            </IonFooter>

            <IonLoading isOpen={isLoading} message={'Resetting password...'} />
          </IonModal>
        </IonContent>
      </IonPage>

    </>
  );
};

export default ResetPasswordPage;
