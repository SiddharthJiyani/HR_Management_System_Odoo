import React from 'react';

/**
 * Status Dot Component
 * @param {string} status - 'present' | 'absent' | 'leave' | 'not-checked-in'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const StatusDot = ({ status = 'not-checked-in', size = 'md', showPulse = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusConfig = {
    present: {
      bg: 'bg-success',
      pulse: 'bg-success/30',
      label: 'Present',
    },
    absent: {
      bg: 'bg-warning',
      pulse: 'bg-warning/30',
      label: 'Absent (No Leave)',
    },
    leave: {
      bg: 'bg-info',
      pulse: 'bg-info/30',
      label: 'On Leave',
      isIcon: true,
    },
    'not-checked-in': {
      bg: 'bg-error',
      pulse: 'bg-error/30',
      label: 'Not Checked In',
    },
  };

  const config = statusConfig[status] || statusConfig['not-checked-in'];

  if (config.isIcon) {
    return (
      <div className={`flex items-center justify-center ${className}`} title={config.label}>
        <span className="text-info text-sm">✈️</span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} title={config.label}>
      {showPulse && (
        <span className={`absolute ${sizeClasses[size]} rounded-full ${config.pulse} animate-ping`} />
      )}
      <span className={`relative ${sizeClasses[size]} rounded-full ${config.bg}`} />
    </div>
  );
};

export default StatusDot;

