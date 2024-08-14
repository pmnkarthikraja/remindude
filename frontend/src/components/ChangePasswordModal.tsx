import {
    IonAvatar,
    IonButton, IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonInput, IonItem, IonLabel,
    IonLoading,
    IonModal,
    IonNote,
    IonTitle, IonToolbar
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import React, { Fragment, FunctionComponent, useState } from 'react';
import { useResetPassword, useValidatePassword } from '../hooks/userHooks';
import { User } from './user';

export interface ChangePasswordModalProps {
    user: User
    isOpen: boolean
    onClose: () => void
    forgotPassword: boolean
}
const ChangePasswordModal: FunctionComponent<ChangePasswordModalProps> = ({ isOpen, onClose, user, forgotPassword }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { isError: isValidatePasswordError, error: validatePasswordError, isLoading: isValidatePasswordLoading, mutateAsync: validatePasssword, reset: validatePasswordReset } = useValidatePassword()
    const { data: resetPasswordData, isSuccess: isPasswordResetSuccess, isLoading: isResetPasswordLoading, isError: isResetPasswordError, error: resetPasswordError, mutateAsync: resetPassword, reset: resetResetPassword } = useResetPassword()

    const verifyOldPassword = async () => {
        try {
            if (oldPassword == '') {
                setErrorMessage('Please Enter a valid password!')
                return
            }
            await validatePasssword({
                email: user.email,
                password: oldPassword
            });
            setIsVerified(true);
        } catch (e: any) {
            console.log("error on validate password:", e)
        }
    };

    const updatePassword = async () => {
        if (newPassword == '' || confirmPassword == '') {
            setErrorMessage('Passwords should not be empty')
            return
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage('Both passwords should be same')
            setNewPassword('');
            setConfirmPassword('')
            return;
        }
        try {
            await resetPassword({
                email: user.email,
                password: confirmPassword
            });
            setTimeout(() => {
                onClose(); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setIsVerified(false); setErrorMessage(''); validatePasswordReset(); resetResetPassword()
            }, 1000)
        } catch (e: any) {
            setErrorMessage('Failed to update the password.');
            console.log("error on resetting the password", e)
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{forgotPassword ? 'Reset Password' : 'Change Password'}</IonTitle>
                    <IonAvatar slot='end' style={{ width: '80px', height: '80px', padding: '10px' }}>
                        {!forgotPassword && <img src={user.profilePicture || user.googlePicture} alt="avatar" style={{ width: '70px' }} />}
                        {forgotPassword &&
                            <img src={`data:image/*;base64,${user.profilePicture}`} alt="avatar" style={{ width: '70px' }} />
                        }
                    </IonAvatar>
                </IonToolbar>

            </IonHeader>
            <IonContent className="ion-padding">
                {isPasswordResetSuccess && <p style={{ color: 'green', textAlign: 'center', textTransform: 'capitalize' }}>{resetPasswordData.data.message}</p>}
                {(isValidatePasswordLoading || isResetPasswordLoading) && <IonLoading isOpen={true} message={isValidatePasswordLoading && 'Verifying...' || isResetPasswordLoading && 'Updating Password..' || ''} />}
                {isValidatePasswordError && <p style={{ color: 'red', textAlign: 'center' }}>{validatePasswordError.response?.data.message || validatePasswordError.message}</p>}
                {isResetPasswordError && <p style={{ color: 'red', textAlign: 'center' }}>{resetPasswordError.response?.data.message || resetPasswordError.message}</p>}
                {errorMessage != '' && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
               {!forgotPassword && <IonItem>
                    <IonLabel position="stacked">Old Password</IonLabel>
                    <IonInput
                        placeholder='Enter Old Password'
                        type="password"
                        value={oldPassword}
                        onIonInput={e => { setErrorMessage(''); setOldPassword(e.detail.value!); resetResetPassword(); validatePasswordReset() }}
                        disabled={isVerified}
                    />
                    {!isVerified && <IonButton color={'tertiary'} expand="full" size='small' onClick={verifyOldPassword}>Verify</IonButton>}
                </IonItem>}

                {(isVerified || forgotPassword) && (
                    <Fragment>
                        <IonNote style={{ marginLeft: '15px' }}>Password length should be greater than 3</IonNote>
                        <IonItem>
                            <IonLabel position="stacked">Enter New Password</IonLabel>
                            <IonInput
                                type="password"
                                value={newPassword}
                                onIonInput={(e) => { setNewPassword(e.detail.value as string); setErrorMessage(''); }}
                            />
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Confirm New Password</IonLabel>
                            <IonInput
                                type="password"
                                value={confirmPassword}
                                onIonInput={(e) => { setConfirmPassword(e.detail.value as string); setErrorMessage('') }}
                            />
                        </IonItem>
                        <IonButton shape='round' color={'success'} expand="block" onClick={updatePassword}>Update Password</IonButton>
                    </Fragment>
                )}



            </IonContent>
            <IonFooter>
                <IonButton onClick={() => { onClose(); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setIsVerified(false); setErrorMessage(''); validatePasswordReset(); resetResetPassword() }}
                    color="tertiary" expand="block">
                    <IonIcon icon={closeOutline} />
                    Close
                </IonButton>
            </IonFooter>
        </IonModal>
    );
};

export default ChangePasswordModal;
