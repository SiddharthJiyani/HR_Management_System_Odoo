import React, { useState, useEffect } from 'react';
import { Card, Button, StatusDot } from '../ui';

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const AttendancePanel = ({ 
  isCheckedIn = false, 
  checkInTime = null,
  onCheckIn,
  onCheckOut,
  className = ''
}) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    if (!isCheckedIn || !checkInTime) return;

    const updateElapsedTime = () => {
      const now = new Date();
      const checkIn = new Date(checkInTime);
      const diff = now - checkIn;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className={`${className}`} padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
            <ClockIcon />
            Attendance
          </h3>
          <StatusDot 
            status={isCheckedIn ? 'present' : 'not-checked-in'} 
            size="md" 
          />
        </div>

        {/* Content */}
        {isCheckedIn ? (
          <div className="space-y-4">
            {/* Check-in Info */}
            <div className="bg-success/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-success mb-1">
                <CheckIcon />
                <span className="font-medium text-sm">Checked In</span>
              </div>
              <p className="text-sm text-neutral-600">
                Since {formatTime(checkInTime)}
              </p>
            </div>

            {/* Time Counter */}
            <div className="text-center py-3">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                Time Elapsed
              </p>
              <p className="text-3xl font-bold text-neutral-900 font-mono">
                {elapsedTime}
              </p>
            </div>

            {/* Check Out Button */}
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={onCheckOut}
              icon={<ArrowRightIcon />}
              iconPosition="right"
            >
              Check Out
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Info */}
            <div className="bg-error/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-error mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-sm">Not Checked In</span>
              </div>
              <p className="text-sm text-neutral-600">
                Mark your attendance for today
              </p>
            </div>

            {/* Current Time */}
            <div className="text-center py-3">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                Current Time
              </p>
              <CurrentTime />
            </div>

            {/* Check In Button */}
            <Button 
              variant="primary" 
              className="w-full"
              onClick={onCheckIn}
              icon={<ArrowRightIcon />}
              iconPosition="right"
            >
              Check In
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// Current Time Display Component
const CurrentTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-3xl font-bold text-neutral-900 font-mono">
      {time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })}
    </p>
  );
};

export default AttendancePanel;

