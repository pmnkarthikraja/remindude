import { IonAlert, IonLoading } from '@ionic/react';
import React, { Fragment, FunctionComponent, useState } from 'react';
import { useSendOTPMutation, useVerifyOTPMutation } from '../hooks/userHooks';
import { User } from './user';

export interface ForgotPasswordAlertWithResendProps {
    closeAlert: () => void,
    otpVerified: (otpVerified: boolean, email: string, user: User | undefined) => void
}

const ForgotPasswordAlertWithResend: FunctionComponent<ForgotPasswordAlertWithResendProps> = ({
    closeAlert,
    otpVerified
}) => {
    const { isLoading: isSendOtpLoading, isError: isSendOtpError, error: sendOtpError, mutateAsync: sendOtpMutation } = useSendOTPMutation()
    const { data: verifyOtpData, isLoading: isVerifyOtpLoading, isError: isVerifyOtpError, error: verifyOtpError, mutateAsync: verifyOtpMutation } = useVerifyOTPMutation()
    const [email, setEmail] = useState('');
    const [showOtpAlert, setShowOtpAlert] = useState(false);
    const [otpVerifiedAlert, setOtpVerifiedAlert] = useState<{ state: boolean, title: string, msg: string }>({
        msg: '',
        title: '',
        state: false
    })


    const sendOtpQuery = async (email: string) => {
        await sendOtpMutation({ email, accountVerification: false,type:'forgotPassword',userName:undefined})
        setShowOtpAlert(true)
    }

    const onVerifyOTP = async (otp: string) => {
        try {
            const res = await verifyOtpMutation({
                email,
                otp
            })
            if (res.data.success) {
                setOtpVerifiedAlert({
                    msg: "Your OTP has been successfully verified. You're all set to proceed!",
                    title: 'Success: OTP Verified',
                    state: true
                });
                setTimeout(() => {
                    console.log("otp verified data on forgetpasssection:", res.data)
                    otpVerified(true, email, res?.data.user);
                    closeAlert();
                }, 3000);
                return
            } else {
                setTimeout(() => {
                    otpVerified(false, email, res?.data.user);
                    closeAlert();
                }, 3000);
            }
        } catch (e) {
            setTimeout(() => {
                otpVerified(false, email, undefined);
                closeAlert();
            }, 3000);
        }
    }



    return (
        <Fragment>
            <IonAlert
                className="custom-alert"
                isOpen={true}
                header={'Forget Password'}
                inputs={[
                    {
                        name: 'email',
                        type: 'email',
                        placeholder: 'Enter your email',
                        value: email,
                        cssClass: 'custom-alert'
                    },
                ]}
                buttons={[
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            closeAlert()
                        },
                    },
                    {
                        text: 'Send OTP',
                        handler: (e) => {
                            setEmail(e.email)
                            sendOtpQuery(e.email)
                        },
                    },
                ]}
            />

            {otpVerifiedAlert.state &&
                <IonLoading
                    isOpen={!isSendOtpLoading && !isVerifyOtpLoading && otpVerifiedAlert.state}
                    message={otpVerifiedAlert.msg}
                />}

            {isSendOtpError &&
                <IonAlert
                    className='custom-alert'
                    isOpen={true}
                    header={'Send OTP Failed!'}
                    message={sendOtpError.response?.status == 500 ? 'Check your internet connection' : sendOtpError.response?.data.message}
                    buttons={['Ok']}
                    onClick={() => window.location.reload()}
                />
            }

            {isVerifyOtpError &&
                <IonAlert className='custom-alert'
                    isOpen={true}
                    header={'OTP Verification Failed!'}
                    message={verifyOtpError.response?.status == 500 ? 'Check your internet connection' : verifyOtpError.response?.data.message}
                    buttons={['Ok']} />
            }

            <IonLoading
                isOpen={isSendOtpLoading && !isVerifyOtpLoading}
                message={'Sending OTP...'}
            />

            <IonLoading
                isOpen={isVerifyOtpLoading && !isSendOtpLoading}
                message={'Verifying OTP...'}
            />


            {showOtpAlert && <IonAlert
                onDidDismiss={() => { setShowOtpAlert(false) }}
                isOpen={true}
                header={'Enter OTP'}
                message={`An OTP has been sent to ${email}. Please enter the OTP below.`}
                inputs={[
                    {
                        name: 'otp',
                        type: 'number',
                        placeholder: 'Enter OTP',
                    },
                ]}
                buttons={[
                    {
                        text: 'Verify OTP',
                        handler: async (e) => {
                            await onVerifyOTP(e.otp)
                        },
                    },
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            closeAlert()
                        },
                    },
                    {
                        text: 'Resend OTP',
                        handler: () => {
                            sendOtpQuery(email)
                        },
                    },
                ]}
            />}
        </Fragment>
    );
};

export default ForgotPasswordAlertWithResend;
