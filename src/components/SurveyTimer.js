import { useEffect, useState } from 'react';
import { Badge } from 'react-bootstrap';

function getRemainingMilliseconds(endTime) {
  if (!endTime) {
    return 0;
  }

  return Math.max(endTime - Date.now(), 0);
}

function formatTime(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function SurveyTimer({ endTime, isActive, onTimeExpired }) {
  const [remainingTime, setRemainingTime] = useState(() => getRemainingMilliseconds(endTime));

  useEffect(() => {
    if (!isActive || !endTime) {
      return undefined;
    }

    const updateRemainingTime = () => {
      const newRemainingTime = getRemainingMilliseconds(endTime);
      setRemainingTime(newRemainingTime);

      if (newRemainingTime <= 0) {
        onTimeExpired();
      }
    };

    updateRemainingTime();
    const timerId = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(timerId);
  }, [endTime, isActive, onTimeExpired]);

  return (
    <div className="timer-box">
      <span className="timer-label">Time Remaining</span>
      <Badge bg={remainingTime <= 30000 ? 'danger' : 'dark'}>{formatTime(remainingTime)}</Badge>
    </div>
  );
}

export default SurveyTimer;
