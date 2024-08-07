    export const startResendTimer = (setRemainingTime: (time: number) => void, setCanResendOtp: (isTrue: boolean) => void) => {
    setCanResendOtp(false);
    let remainingTime = 20;
    const timer = setInterval(() => {
        remainingTime--;
        setRemainingTime(remainingTime);
        if (remainingTime === 0) {
            clearInterval(timer);
            setCanResendOtp(true);
        }
    }, 1000);
}