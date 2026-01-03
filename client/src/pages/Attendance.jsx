import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Avatar, SearchBar } from '../components/ui';
import { attendanceAPI, employeeAPI } from '../services/api';

// Icons
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

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Format time helper
const formatTime = (isoString) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

// Calculate work hours
const calculateWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '—';
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = (end - start) / (1000 * 60 * 60); // hours
  if (diff < 0) return '—';
  const hours = Math.floor(diff);
  const minutes = Math.round((diff - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Calculate extra hours (assuming 8 hour workday)
const calculateExtraHours = (checkIn, checkOut, standardHours = 8) => {
  if (!checkIn || !checkOut) return '—';
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = (end - start) / (1000 * 60 * 60); // hours
  if (diff <= standardHours) return '00:00';
  const extra = diff - standardHours;
  const hours = Math.floor(extra);
  const minutes = Math.round((extra - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Date Picker Dropdown
const DatePicker = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatDisplayDate = (date) => {
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl border border-neutral-200 hover:bg-white transition-all shadow-sm"
      >
        <CalendarIcon />
        <span className="font-medium text-neutral-700">{formatDisplayDate(selectedDate)}</span>
        <ChevronDownIcon />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-xl shadow-soft-lg border border-neutral-100 p-4 min-w-[250px]">
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, idx) => (
              <button
                key={month}
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(idx);
                  onChange(newDate);
                  setIsOpen(false);
                }}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${selectedDate.getMonth() === idx 
                    ? 'bg-primary-500 text-white' 
                    : 'hover:bg-neutral-100 text-neutral-700'
                  }
                `}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-center gap-2">
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setFullYear(newDate.getFullYear() - 1);
                  onChange(newDate);
                }}
                className="p-1 rounded hover:bg-neutral-100"
              >
                <ChevronLeftIcon />
              </button>
              <span className="font-semibold text-neutral-900 w-16 text-center">
                {selectedDate.getFullYear()}
              </span>
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setFullYear(newDate.getFullYear() + 1);
                  onChange(newDate);
                }}
                className="p-1 rounded hover:bg-neutral-100"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// View Toggle
const ViewToggle = ({ view, onChange }) => (
  <div className="flex items-center bg-white/80 rounded-xl border border-neutral-200 overflow-hidden">
    {['Day', 'Week', 'Month'].map((v) => (
      <button
        key={v}
        onClick={() => onChange(v.toLowerCase())}
        className={`
          px-4 py-2 text-sm font-medium transition-all
          ${view === v.toLowerCase()
            ? 'bg-primary-500 text-white'
            : 'text-neutral-600 hover:bg-neutral-50'
          }
        `}
      >
        {v}
      </button>
    ))}
  </div>
);

// Attendance Table Row
const AttendanceRow = ({ record, showEmployee = true }) => {
  const getStatusBadge = (status) => {
    const variants = {
      present: 'success',
      absent: 'error',
      leave: 'info',
      late: 'warning',
      'not-checked-in': 'error',
    };
    const labels = {
      present: 'Present',
      absent: 'Absent',
      leave: 'On Leave',
      late: 'Late',
      'not-checked-in': 'Not Checked In',
    };
    return (
      <Badge variant={variants[status] || 'default'} size="sm">
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <tr className="border-b border-neutral-100 hover:bg-white/50 transition-colors">
      {showEmployee && (
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <Avatar 
              src={record.avatar} 
              name={record.employeeName} 
              size="sm"
              className="w-9 h-9"
            />
            <div>
              <p className="font-medium text-neutral-900 text-sm">{record.employeeName}</p>
              <p className="text-xs text-neutral-500">{record.department || 'N/A'}</p>
            </div>
          </div>
        </td>
      )}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${record.checkIn ? 'bg-success' : 'bg-neutral-300'}`} />
          <span className="text-sm font-medium text-neutral-700">
            {formatTime(record.checkIn)}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${record.checkOut ? 'bg-error' : 'bg-neutral-300'}`} />
          <span className="text-sm font-medium text-neutral-700">
            {formatTime(record.checkOut)}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm font-semibold text-neutral-900">
          {calculateWorkHours(record.checkIn, record.checkOut)}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={`text-sm font-semibold ${
          calculateExtraHours(record.checkIn, record.checkOut) !== '00:00' && calculateExtraHours(record.checkIn, record.checkOut) !== '—'
            ? 'text-success' 
            : 'text-neutral-400'
        }`}>
          {calculateExtraHours(record.checkIn, record.checkOut)}
        </span>
      </td>
      <td className="py-4 px-4">
        {getStatusBadge(record.status)}
      </td>
    </tr>
  );
};

// Loading Skeleton
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4 px-4 border-b border-neutral-100">
        <div className="w-9 h-9 bg-neutral-200 rounded-full" />
        <div className="flex-1 h-4 bg-neutral-200 rounded w-32" />
        <div className="h-4 bg-neutral-200 rounded w-16" />
        <div className="h-4 bg-neutral-200 rounded w-16" />
        <div className="h-4 bg-neutral-200 rounded w-16" />
        <div className="h-4 bg-neutral-200 rounded w-16" />
        <div className="h-6 bg-neutral-200 rounded w-20" />
      </div>
    ))}
  </div>
);

// Summary Card
const SummaryCard = ({ label, value, icon, variant = 'neutral' }) => {
  const variantClasses = {
    success: 'from-success/10 to-success/5 text-success border-success/20',
    error: 'from-error/10 to-error/5 text-error border-error/20',
    info: 'from-info/10 to-info/5 text-info border-info/20',
    warning: 'from-warning/10 to-warning/5 text-warning border-warning/20',
    neutral: 'from-neutral-100 to-neutral-50 text-neutral-700 border-neutral-200',
    primary: 'from-primary-100 to-primary-50 text-primary-700 border-primary-200',
  };

  return (
    <div className={`
      rounded-xl p-4 bg-gradient-to-br border
      ${variantClasses[variant]}
    `}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-70">{label}</p>
        </div>
        {icon && <div className="opacity-50">{icon}</div>}
      </div>
    </div>
  );
};

const Attendance = ({ currentUser, isAdmin = false }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    onLeave: 0,
    late: 0,
    totalHours: '0',
    avgHours: '0',
  });

  // Mock data for demonstration (replace with actual API calls)
  const generateMockData = useCallback(() => {
    const employees = [
      { id: 1, name: 'Sarah Johnson', department: 'Engineering', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
      { id: 2, name: 'Michael Chen', department: 'Product', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
      { id: 3, name: 'Emily Rodriguez', department: 'Design', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
      { id: 4, name: 'James Wilson', department: 'Engineering', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
      { id: 5, name: 'Priya Patel', department: 'Analytics', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
      { id: 6, name: 'David Kim', department: 'Engineering', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
    ];

    const statuses = ['present', 'present', 'present', 'present', 'late', 'leave', 'absent'];
    const today = new Date();
    
    return employees.map((emp, idx) => {
      const status = statuses[idx % statuses.length];
      const baseHour = 9 + Math.floor(Math.random() * 2);
      const baseMinute = Math.floor(Math.random() * 30);
      
      const checkIn = status !== 'absent' && status !== 'leave' 
        ? new Date(today.setHours(baseHour, baseMinute, 0)).toISOString()
        : null;
      
      const checkOut = checkIn && status !== 'leave'
        ? new Date(today.setHours(18 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0)).toISOString()
        : null;

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        avatar: emp.avatar,
        date: today.toISOString().split('T')[0],
        checkIn,
        checkOut,
        status,
      };
    });
  }, []);

  // Fetch attendance data
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API first
      try {
        const response = await attendanceAPI.getAll({
          date: selectedDate.toISOString().split('T')[0],
        });

        if (response.success && response.data) {
          setAttendanceRecords(response.data);
          
          // Calculate stats from response or data
          if (response.stats) {
            setStats({
              present: response.stats.present || 0,
              absent: response.stats.absent || 0,
              onLeave: response.stats.leave || 0,
              late: response.stats.late || 0,
              totalHours: '0',
              avgHours: '0'
            });
          } else {
            // Calculate stats from data
            const present = response.data.filter(r => r.status === 'present').length;
            const absent = response.data.filter(r => r.status === 'absent' || r.status === 'not-checked-in').length;
            const onLeave = response.data.filter(r => r.status === 'leave').length;
            const late = response.data.filter(r => r.status === 'late').length;

            setStats({ present, absent, onLeave, late, totalHours: '0', avgHours: '0' });
          }
          return;
        }
      } catch (apiError) {
        console.log('API error:', apiError);
        console.log('Using mock data');
      }

      // Fallback to mock data
      const mockData = generateMockData();
      setAttendanceRecords(mockData);

      // Calculate stats
      const present = mockData.filter(r => r.status === 'present').length;
      const absent = mockData.filter(r => r.status === 'absent').length;
      const onLeave = mockData.filter(r => r.status === 'leave').length;
      const late = mockData.filter(r => r.status === 'late').length;

      setStats({ present, absent, onLeave, late, totalHours: '48', avgHours: '8.5' });

    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, generateMockData]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Navigate date
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedDate(newDate);
  };

  // Filter records by search
  const filteredRecords = attendanceRecords.filter(record =>
    record.employeeName?.toLowerCase().includes(searchValue.toLowerCase()) ||
    record.department?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="page-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Attendance</h1>
          <p className="text-neutral-500 mt-1">
            {isAdmin ? 'View and manage all employee attendance' : 'Track employee attendance records'}
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full lg:w-72">
          <SearchBar 
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search employees..."
          />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateDate(-1)}
            className="p-2.5 bg-white/80 rounded-xl border border-neutral-200 hover:bg-white hover:shadow-soft transition-all"
          >
            <ChevronLeftIcon />
          </button>
          <button 
            onClick={() => navigateDate(1)}
            className="p-2.5 bg-white/80 rounded-xl border border-neutral-200 hover:bg-white hover:shadow-soft transition-all"
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Date Picker */}
        <DatePicker 
          selectedDate={selectedDate}
          onChange={setSelectedDate}
        />

        {/* View Toggle */}
        <ViewToggle 
          view={viewMode}
          onChange={setViewMode}
        />

        {/* Refresh Button */}
        <Button 
          variant="outline" 
          icon={<RefreshIcon />}
          onClick={fetchAttendance}
          disabled={loading}
        >
          Refresh
        </Button>

        {/* Today Button */}
        <Button 
          variant="ghost"
          onClick={() => setSelectedDate(new Date())}
        >
          Today
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Present" value={stats.present} variant="success" />
        <SummaryCard label="Absent" value={stats.absent} variant="error" />
        <SummaryCard label="On Leave" value={stats.onLeave} variant="info" />
        <SummaryCard label="Late" value={stats.late} variant="warning" />
      </div>

      {/* Attendance Table */}
      <Card padding="none">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClockIcon />
              <h2 className="font-semibold text-neutral-900">
                {formatDisplayDate(selectedDate)}
              </h2>
            </div>
            <Badge variant="primary">
              {filteredRecords.length} Employees
            </Badge>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Work Hours
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Extra Hours
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Loading State */}
              {loading && (
                <tr>
                  <td colSpan={6}>
                    <TableSkeleton />
                  </td>
                </tr>
              )}

              {/* Error State */}
              {error && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="text-error mb-3">{error}</div>
                    <Button variant="outline" size="sm" onClick={fetchAttendance}>
                      Retry
                    </Button>
                  </td>
                </tr>
              )}

              {/* Empty State */}
              {!loading && !error && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="text-neutral-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-neutral-500">No attendance records for this date.</p>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {!loading && !error && filteredRecords.map((record, index) => (
                <AttendanceRow 
                  key={record.employeeId || index} 
                  record={record} 
                  showEmployee={true}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {!loading && filteredRecords.length > 0 && (
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/30">
            <div className="flex items-center justify-between text-sm text-neutral-500">
              <span>
                Showing {filteredRecords.length} of {attendanceRecords.length} employees
              </span>
              <span className="flex items-center gap-2">
                <ClockIcon />
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Note Card */}
      <Card className="bg-primary-50/50 border-primary-100">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-1">Attendance Notes</h3>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>• Attendance data serves as the basis for payslip generation</li>
              <li>• Unpaid leave or missing attendance reduces the number of payable days</li>
              <li>• Standard work hours: 8 hours/day (extra hours calculated automatically)</li>
              <li>• Please contact HR for any attendance corrections</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
