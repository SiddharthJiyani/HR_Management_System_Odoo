import React from 'react';

/**
 * Status Dot Component
 * Status indicators:
 * 🟢 Green: Employee is present in the office (includes 'present', 'late', 'half-day')
 * ✈️ Airplane: Employee is on leave
 * 🟡 Yellow: Employee is absent (not checked in, no leave applied)
 * 
 * @param {string} status - 'present' | 'late' | 'half-day' | 'absent' | 'leave' | 'not-checked-in'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const StatusDot = ({ status = 'not-checked-in', size = 'md', showPulse = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusConfig = {
    // Green - Present in office
    present: {
      bg: 'bg-success',
      pulse: 'bg-success/30',
      label: 'Present',
    },
    // Green - Late but present in office
    late: {
      bg: 'bg-success',
      pulse: 'bg-success/30',
      label: 'Present (Late)',
    },
    // Green - Half-day but present
    'half-day': {
      bg: 'bg-success',
      pulse: 'bg-success/30',
      label: 'Half Day',
    },
    // Yellow - Absent (no leave applied)
    absent: {
      bg: 'bg-warning',
      pulse: 'bg-warning/30',
      label: 'Absent (No Leave)',
    },
    // Yellow - Not checked in yet (treat as absent)
    'not-checked-in': {
      bg: 'bg-warning',
      pulse: 'bg-warning/30',
      label: 'Not Checked In',
    },
    // Airplane icon - On leave
    leave: {
      bg: 'bg-info',
      pulse: 'bg-info/30',
      label: 'On Leave',
      isIcon: true,
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

