import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Avatar, StatusDot } from '../components/ui';
import { attendanceAPI } from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    leave: 0,
    late: 0,
    avgHours: '0',
    totalHours: '0',
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Format time from ISO string
  const formatTime = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Transform API data to display format
  const transformAttendanceData = (records) => {
    return records.map(record => {
      const date = new Date(record.date);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      return {
        day: date.getDate(),
        dayName: dayNames[dayOfWeek],
        status: isWeekend && !record.checkIn ? 'weekend' : record.status,
        checkIn: formatTime(record.checkIn),
        checkOut: formatTime(record.checkOut),
        hours: record.hoursWorked ? record.hoursWorked.toFixed(1) : null,
        note: record.notes || null,
      };
    });
  };

  // Fetch attendance data for the selected month
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const month = currentMonth.getMonth() + 1; // API expects 1-12
      const year = currentMonth.getFullYear();

      const response = await attendanceAPI.getMyAttendance({ month, year });

      if (response.success) {
        const records = response.data || [];
        setAttendanceRecords(transformAttendanceData(records));

        // Calculate stats from records
        const presentCount = records.filter(r => r.status === 'present').length;
        const absentCount = records.filter(r => r.status === 'absent').length;
        const leaveCount = records.filter(r => r.status === 'leave').length;
        const lateCount = records.filter(r => r.status === 'late').length;
        const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
        const workDays = records.filter(r => r.hoursWorked > 0).length;
        const avgHours = workDays > 0 ? (totalHours / workDays).toFixed(1) : '0';

        setStats({
          present: presentCount,
          absent: absentCount,
          leave: leaveCount,
          late: lateCount,
          avgHours,
          totalHours: totalHours.toFixed(0),
        });
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  // Fetch data when month changes
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
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
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Loading attendance...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div className="text-red-500 text-sm mb-3">{error}</div>
            <Button variant="outline" size="sm" onClick={fetchAttendance}>
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && attendanceRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-neutral-500">No attendance records for this month.</p>
          </div>
        )}

        {/* Attendance Records */}
        {!loading && !error && attendanceRecords.length > 0 && (
          <div className="space-y-2">
            {attendanceRecords.map((record, index) => (
              <AttendanceRecord key={index} record={record} />
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && attendanceRecords.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="ghost">
              View Full History
            </Button>
          </div>
        )}
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

