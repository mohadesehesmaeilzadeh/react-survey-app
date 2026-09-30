import { useEffect, useRef, useState } from 'react';
import { Badge } from 'react-bootstrap';

function getRemainingMilliseconds(endTime) {
  if (!Number.isFinite(endTime) || endTime <= 0) {
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

function SurveyTimer({ endTime, onTimeExpired }) {
  const [remainingTime, setRemainingTime] = useState(() => getRemainingMilliseconds(endTime));
  const notifiedEndTime = useRef(null);

  useEffect(() => {
    if (!Number.isFinite(endTime) || endTime <= 0) {
      setRemainingTime(0);
      return undefined;
    }

    let timerId;

    const updateRemainingTime = () => {
      const newRemainingTime = getRemainingMilliseconds(endTime);
      setRemainingTime(newRemainingTime);

      if (newRemainingTime <= 0) {
        if (timerId) {
          clearInterval(timerId);
        }

        if (notifiedEndTime.current !== endTime) {
          notifiedEndTime.current = endTime;
          onTimeExpired();
        }
      }

      return newRemainingTime;
    };

    const initialRemainingTime = updateRemainingTime();

    if (initialRemainingTime > 0) {
      timerId = setInterval(updateRemainingTime, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [endTime, onTimeExpired]);

  const formattedTime = formatTime(remainingTime);

  return (
    <div
      className="timer-box"
      role="timer"
      aria-label={`Time remaining: ${formattedTime}`}
    >
      <svg className="timer-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 1.5M9 3h6" />
      </svg>
      <span className="timer-label" aria-hidden="true">Time remaining</span>
      <Badge
        bg={remainingTime <= 30000 ? 'danger' : 'dark'}
        className="timer-value"
        aria-hidden="true"
      >
        {formattedTime}
      </Badge>
    </div>
  );
}

export default SurveyTimer;
