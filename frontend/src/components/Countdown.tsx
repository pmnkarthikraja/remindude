import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  initialTime: number;
  onTimeUp: () => void;
  onTimeChange: (time: number) => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialTime, onTimeUp, onTimeChange }) => {
  const [remainingTime, setRemainingTime] = useState(initialTime);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          const newTime = prevTime - 1;
          onTimeChange(newTime);
          if (newTime === 0) {
            clearInterval(timer);
            onTimeUp();
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime, onTimeUp, onTimeChange]);

  return <p>Resend OTP in {remainingTime} seconds</p>;
};

export default CountdownTimer;
