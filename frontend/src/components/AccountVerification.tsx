
import { IonAlert, IonLoading } from '@ionic/react';
import React, { Fragment, FunctionComponent, useState } from 'react';
import { useVerifyOTPMutation } from '../hooks/userHooks';


export interface AccountVerificationProps {
    forgotPassword: boolean
    closeAlert: () => void;
    otpVerified: (email: string, otpVerified: boolean) => void;
    resendOtp: () => void
    signUpEmail?: string
}

const AccountVerification: FunctionComponent<AccountVerificationProps> = ({
    signUpEmail, closeAlert, otpVerified, resendOtp }) => {
    const { isLoading: isVerifyOtpLoading,mutateAsync: verifyOtpMutation } = useVerifyOTPMutation()
    const [otpVerifiedAlert, setOtpVerifiedAlert] = useState<{ state: boolean, title: string, msg: string }>({
        msg: '',
        title: '',
        state: false
    });
    const gotEmail = signUpEmail || ''

    const onVerifyOTP = async (otp: string) => {
        try {
            const res = await verifyOtpMutation({
                email: gotEmail,
                otp
            })
            if (res.data.success) {
                setOtpVerifiedAlert({
                    msg: "Your OTP has been successfully verified. You're all set to proceed!",
                    title: 'Success: OTP Verified',
                    state: true
                });
                setTimeout(() => {
                    otpVerified(gotEmail, true);
                    closeAlert();
                }, 3000);
                return
            } else {
                setOtpVerifiedAlert({
                    msg: 'OTP Verification Failed!',
                    title: 'Oops..',
                    state: true
                });
                setTimeout(() => {
                    otpVerified(gotEmail, false);
                    closeAlert();
                }, 3000);
            }
        } catch (e) {
            setOtpVerifiedAlert({
                msg: 'OTP Verification Failed!',
                title: 'Oops..',
                state: true
            });
            setTimeout(() => {
                otpVerified(gotEmail, false);
                closeAlert();
            }, 3000);
        }
    }

    return (
        <Fragment>
            {otpVerifiedAlert.state && (
                <IonAlert
                    className='alert'
                    isOpen={true}
                    header={otpVerifiedAlert.title}
                    message={otpVerifiedAlert.msg}
                    buttons={['Ok']}
                />
            )}
            <IonLoading isOpen={isVerifyOtpLoading} message={'Verifying OTP...'} />
            {<IonAlert
                className='alert'
                isOpen={true}
                header={'We have sent a code'}
                message={`Enter it below to verify ${signUpEmail}. Please enter the OTP below.`}
                inputs={[
                    {
                        name: 'otp',
                        type: 'number',
                        placeholder: 'Verification Code',
                    },
                ]}
                buttons={[
                    {
                        text: 'Verify OTP',
                        handler: async (e) => await onVerifyOTP(e.otp),
                    },
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: closeAlert,
                    },
                    {
                        text: 'Resend OTP',
                        handler: () => {
                            otpVerified(signUpEmail || '', false)
                            resendOtp()
                        },
                    },
                ]}
            />}
        </Fragment>
    );
};

export default AccountVerification;
