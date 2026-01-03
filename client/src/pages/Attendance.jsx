import React, { useState } from 'react';
import { Card, Button, Badge, Avatar, StatusDot } from '../components/ui';

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const AttendanceRecord = ({ record }) => {
  const statusColors = {
    present: 'bg-success',
    absent: 'bg-error',
    leave: 'bg-info',
    late: 'bg-warning',
    weekend: 'bg-neutral-200',
  };

  const statusLabels = {
    present: 'Present',
    absent: 'Absent',
    leave: 'On Leave',
    late: 'Late',
    weekend: 'Weekend',
  };

  const statusVariants = {
    present: 'success',
    absent: 'error',
    leave: 'info',
    late: 'warning',
    weekend: 'default',
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 hover:bg-white/80 transition-colors">
      {/* Date */}
      <div className="w-16 text-center">
        <div className={`w-12 h-12 mx-auto rounded-xl ${statusColors[record.status]} flex items-center justify-center`}>
          <span className="text-white font-bold">{record.day}</span>
        </div>
        <p className="text-xs text-neutral-500 mt-1">{record.dayName}</p>
      </div>

      {/* Details */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={statusVariants[record.status]} size="sm">
            {statusLabels[record.status]}
          </Badge>
        </div>
        {record.checkIn && (
          <p className="text-sm text-neutral-600">
            <span className="text-neutral-400">Check In:</span> {record.checkIn}
            {record.checkOut && (
              <span className="ml-4">
                <span className="text-neutral-400">Check Out:</span> {record.checkOut}
              </span>
            )}
          </p>
        )}
        {record.note && (
          <p className="text-sm text-neutral-500 mt-1">{record.note}</p>
        )}
      </div>

      {/* Hours */}
      {record.hours && (
        <div className="text-right">
          <p className="font-semibold text-neutral-900">{record.hours}</p>
          <p className="text-xs text-neutral-500">hours</p>
        </div>
      )}
    </div>
  );
};

const Attendance = ({ currentUser }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Mock attendance data
  const attendanceRecords = [
    { day: 3, dayName: 'Fri', status: 'present', checkIn: '09:02 AM', checkOut: '06:15 PM', hours: '9.2' },
    { day: 2, dayName: 'Thu', status: 'present', checkIn: '09:10 AM', checkOut: '06:30 PM', hours: '9.3' },
    { day: 1, dayName: 'Wed', status: 'late', checkIn: '10:15 AM', checkOut: '07:00 PM', hours: '8.75', note: 'Traffic delay' },
    { day: 31, dayName: 'Tue', status: 'present', checkIn: '08:55 AM', checkOut: '06:00 PM', hours: '9.1' },
    { day: 30, dayName: 'Mon', status: 'present', checkIn: '09:00 AM', checkOut: '06:05 PM', hours: '9.1' },
    { day: 29, dayName: 'Sun', status: 'weekend' },
    { day: 28, dayName: 'Sat', status: 'weekend' },
    { day: 27, dayName: 'Fri', status: 'leave', note: 'Personal leave' },
    { day: 26, dayName: 'Thu', status: 'present', checkIn: '09:05 AM', checkOut: '06:20 PM', hours: '9.25' },
  ];

  // Summary stats
  const stats = {
    present: 18,
    absent: 1,
    leave: 2,
    late: 2,
    avgHours: '8.5',
    totalHours: '162',
  };

  return (
    <div className="page-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Attendance</h1>
          <p className="text-neutral-500 mt-1">
            Track your attendance history
          </p>
        </div>
        
        {/* Month Navigator */}
        <div className="flex items-center gap-2 bg-white/60 rounded-xl p-1">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <ChevronLeftIcon />
          </button>
          <div className="flex items-center gap-2 px-4">
            <CalendarIcon />
            <span className="font-medium text-neutral-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
          </div>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard label="Present" value={stats.present} variant="success" />
        <SummaryCard label="Absent" value={stats.absent} variant="error" />
        <SummaryCard label="Leave" value={stats.leave} variant="info" />
        <SummaryCard label="Late" value={stats.late} variant="warning" />
        <SummaryCard label="Avg Hours" value={stats.avgHours} variant="neutral" />
        <SummaryCard label="Total Hours" value={stats.totalHours} variant="primary" />
      </div>

      {/* Attendance List */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-2">
          {attendanceRecords.map((record, index) => (
            <AttendanceRecord key={index} record={record} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-4 text-center">
          <Button variant="ghost">
            View Full History
          </Button>
        </div>
      </Card>

      {/* Calendar View Toggle */}
      <div className="text-center">
        <Button variant="outline" icon={<CalendarIcon />}>
          Switch to Calendar View
        </Button>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, variant }) => {
  const variantClasses = {
    success: 'from-success/10 to-success/5 text-success',
    error: 'from-error/10 to-error/5 text-error',
    info: 'from-info/10 to-info/5 text-info',
    warning: 'from-warning/10 to-warning/5 text-warning',
    neutral: 'from-neutral-100 to-neutral-50 text-neutral-700',
    primary: 'from-primary-100 to-primary-50 text-primary-700',
  };

  return (
    <div className={`
      rounded-card p-4 bg-gradient-to-br border border-white/50
      ${variantClasses[variant]}
    `}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-70">{label}</p>
    </div>
  );
};

export default Attendance;

