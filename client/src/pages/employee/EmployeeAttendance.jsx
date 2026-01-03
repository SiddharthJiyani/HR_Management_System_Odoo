import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { attendanceAPI } from '../../services/api';

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

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
  const diff = (end - start) / (1000 * 60 * 60);
  if (diff < 0) return '—';
  const hours = Math.floor(diff);
  const minutes = Math.round((diff - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Calculate extra hours (over 8 hours)
const calculateExtraHours = (checkIn, checkOut, standardHours = 8) => {
  if (!checkIn || !checkOut) return '—';
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = (end - start) / (1000 * 60 * 60);
  if (diff <= standardHours) return '00:00';
  const extra = diff - standardHours;
  const hours = Math.floor(extra);
  const minutes = Math.round((extra - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Month Picker
const MonthPicker = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/80 rounded-xl border border-neutral-200 hover:bg-white transition-all shadow-sm font-medium text-neutral-700"
      >
        {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        <ChevronDownIcon />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-xl shadow-soft-lg border border-neutral-100 p-3 min-w-[200px]">
          <div className="grid grid-cols-3 gap-1">
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
                  px-2 py-2 rounded-lg text-sm font-medium transition-all
                  ${selectedDate.getMonth() === idx 
                    ? 'bg-primary-500 text-white' 
                    : 'hover:bg-neutral-100 text-neutral-700'
                  }
                `}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card
const StatCard = ({ label, value, variant = 'neutral' }) => {
  const variantClasses = {
    success: 'from-success/10 to-success/5 text-success border-success/20',
    warning: 'from-warning/10 to-warning/5 text-warning border-warning/20',
    info: 'from-info/10 to-info/5 text-info border-info/20',
    neutral: 'from-neutral-100 to-neutral-50 text-neutral-700 border-neutral-200',
  };

  return (
    <div className={`rounded-xl p-4 bg-gradient-to-br border ${variantClasses[variant]}`}>
      <p className="text-sm text-neutral-600 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

// Attendance Row
const AttendanceRow = ({ record }) => (
  <tr className="border-b border-neutral-100 hover:bg-white/50 transition-colors">
    <td className="py-4 px-4">
      <span className="text-sm font-medium text-neutral-900">{record.date}</span>
    </td>
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
  </tr>
);

// Table Skeleton
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4 px-4 border-b border-neutral-100">
        <div className="h-4 bg-neutral-200 rounded w-24" />
        <div className="h-4 bg-neutral-200 rounded w-16" />
        <div className="h-4 bg-neutral-200 rounded w-16" />
        <div className="h-4 bg-neutral-200 rounded w-16" />
        <div className="h-4 bg-neutral-200 rounded w-16" />
      </div>
    ))}
  </div>
);

const EmployeeAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({
    daysPresent: 0,
    leavesCount: 0,
    totalWorkingDays: 0,
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate mock attendance data for demo
  const generateMockData = useCallback(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    const records = [];
    let daysPresent = 0;
    let leavesCount = 0;

    for (let day = 1; day <= Math.min(daysInMonth, today.getDate()); day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const isPresent = Math.random() > 0.15; // 85% attendance rate
      const isLeave = !isPresent && Math.random() > 0.5;

      if (isPresent) {
        daysPresent++;
        const checkInHour = 9 + Math.floor(Math.random() * 2);
        const checkInMinute = Math.floor(Math.random() * 30);
        const checkOutHour = 18 + Math.floor(Math.random() * 2);
        const checkOutMinute = Math.floor(Math.random() * 60);

        records.push({
          date: date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          checkIn: new Date(year, month, day, checkInHour, checkInMinute).toISOString(),
          checkOut: new Date(year, month, day, checkOutHour, checkOutMinute).toISOString(),
          status: 'present',
        });
      } else if (isLeave) {
        leavesCount++;
        records.push({
          date: date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          checkIn: null,
          checkOut: null,
          status: 'leave',
        });
      }
    }

    // Calculate working days (weekdays in month up to today)
    let totalWorkingDays = 0;
    for (let day = 1; day <= Math.min(daysInMonth, today.getDate()); day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) totalWorkingDays++;
    }

    return { records: records.reverse(), daysPresent, leavesCount, totalWorkingDays };
  }, [selectedDate]);

  // Fetch attendance
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try API first
      try {
        const response = await attendanceAPI.getMyAttendance({
          month: selectedDate.getMonth() + 1,
          year: selectedDate.getFullYear(),
        });

        if (response.success && response.data?.length > 0) {
          const formattedRecords = response.data.map(record => ({
            date: new Date(record.date).toLocaleDateString('en-US', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            }),
            checkIn: record.checkIn,
            checkOut: record.checkOut,
            status: record.status,
          }));

          const daysPresent = response.data.filter(r => r.status === 'present').length;
          const leavesCount = response.data.filter(r => r.status === 'leave').length;

          setAttendanceRecords(formattedRecords.reverse());
          setStats({
            daysPresent,
            leavesCount,
            totalWorkingDays: formattedRecords.length,
          });
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data');
      }

      // Fallback to mock data
      const mockData = generateMockData();
      setAttendanceRecords(mockData.records);
      setStats({
        daysPresent: mockData.daysPresent,
        leavesCount: mockData.leavesCount,
        totalWorkingDays: mockData.totalWorkingDays,
      });

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

  // Navigate month
  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  return (
    <div className="page-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Attendance</h1>
          <p className="text-neutral-500 mt-1">View your attendance history</p>
        </div>
        
        <Button 
          variant="outline"
          icon={<RefreshIcon />}
          onClick={fetchAttendance}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-2.5 bg-white/80 rounded-xl border border-neutral-200 hover:bg-white hover:shadow-soft transition-all"
          >
            <ChevronLeftIcon />
          </button>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-2.5 bg-white/80 rounded-xl border border-neutral-200 hover:bg-white hover:shadow-soft transition-all"
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Month Picker */}
        <MonthPicker 
          selectedDate={selectedDate}
          onChange={setSelectedDate}
        />

        {/* Stats Cards */}
        <div className="flex-1 flex flex-wrap gap-3 justify-end">
          <StatCard 
            label="Count of days present"
            value={stats.daysPresent}
            variant="success"
          />
          <StatCard 
            label="Leaves count"
            value={stats.leavesCount}
            variant="warning"
          />
          <StatCard 
            label="Total working days"
            value={stats.totalWorkingDays}
            variant="info"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <Card padding="none">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <h2 className="font-semibold text-neutral-900">
            {selectedDate.getDate()}, {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Date
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
              </tr>
            </thead>
            <tbody>
              {/* Loading State */}
              {loading && (
                <tr>
                  <td colSpan={5}>
                    <TableSkeleton />
                  </td>
                </tr>
              )}

              {/* Error State */}
              {error && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="text-error mb-3">{error}</div>
                    <Button variant="outline" size="sm" onClick={fetchAttendance}>
                      Retry
                    </Button>
                  </td>
                </tr>
              )}

              {/* Empty State */}
              {!loading && !error && attendanceRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <p className="text-neutral-500">No attendance records for this month.</p>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {!loading && !error && attendanceRecords.map((record, index) => (
                <AttendanceRow key={index} record={record} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeAttendance;

