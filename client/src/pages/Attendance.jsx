import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, SearchBar, Avatar } from '../components/ui';
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

// Format time (24hr format)
const formatTime = (isoString) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

// Calculate work hours as HH:MM
const calculateWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '—';
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = (end - start) / (1000 * 60);
  if (diff < 0) return '—';
  const hours = Math.floor(diff / 60);
  const minutes = Math.round(diff % 60);
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

// Date Picker Dropdown
const DatePicker = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDisplay = () => {
    const day = selectedDate.getDate();
    const month = months[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-neutral-300 hover:bg-neutral-50 transition-all font-medium text-neutral-700"
      >
        Date <ChevronDownIcon />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-xl shadow-lg border border-neutral-100 p-4 min-w-[280px]">
            {/* Month Grid */}
            <div className="grid grid-cols-3 gap-1 mb-4">
              {months.map((month, idx) => (
                <button
                  key={month}
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(idx);
                    onChange(newDate);
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
            {/* Year selector */}
            <div className="flex items-center justify-center gap-2 pt-3 border-t border-neutral-100">
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
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full mt-3 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// View Toggle (Day)
const ViewToggle = ({ view, onChange }) => (
  <button
    onClick={() => onChange('day')}
    className={`px-4 py-2.5 rounded-lg border font-medium text-sm transition-all ${
      view === 'day' 
        ? 'bg-neutral-200 border-neutral-300 text-neutral-800' 
        : 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50'
    }`}
  >
    Day
  </button>
);

// Attendance Row
const AttendanceRow = ({ record }) => (
  <tr className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
    <td className="py-4 px-4 border-r border-neutral-200">
      <div className="flex items-center gap-3">
        <Avatar 
          src={record.avatar} 
          name={record.employeeName} 
          size="sm"
          className="w-8 h-8"
        />
        <span className="text-sm font-medium text-neutral-900">{record.employeeName}</span>
      </div>
    </td>
    <td className="py-4 px-4 border-r border-neutral-200">
      <span className="text-sm text-neutral-700">{formatTime(record.checkIn)}</span>
    </td>
    <td className="py-4 px-4 border-r border-neutral-200">
      <span className="text-sm text-neutral-700">{formatTime(record.checkOut)}</span>
    </td>
    <td className="py-4 px-4 border-r border-neutral-200">
      <span className="text-sm font-medium text-neutral-900">
        {calculateWorkHours(record.checkIn, record.checkOut)}
      </span>
    </td>
    <td className="py-4 px-4">
      <span className={`text-sm font-medium ${
        calculateExtraHours(record.checkIn, record.checkOut) !== '00:00' && 
        calculateExtraHours(record.checkIn, record.checkOut) !== '—'
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
      <div key={i} className="flex items-center py-4 px-4 border-b border-neutral-200">
        <div className="w-8 h-8 bg-neutral-200 rounded-full mr-3" />
        <div className="flex-1 h-4 bg-neutral-200 rounded" />
        <div className="flex-1 h-4 bg-neutral-200 rounded mx-2" />
        <div className="flex-1 h-4 bg-neutral-200 rounded mx-2" />
        <div className="flex-1 h-4 bg-neutral-200 rounded mx-2" />
        <div className="flex-1 h-4 bg-neutral-200 rounded" />
      </div>
    ))}
  </div>
);

const Attendance = ({ isAdmin = false }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [weekData, setWeekData] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    onLeave: 0,
    late: 0,
    totalHours: '0',
    avgHours: '0'
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate mock data
  const generateMockData = useCallback(() => {
    const employees = [
      { id: 1, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
      { id: 2, name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
      { id: 3, name: 'Emily Rodriguez', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
      { id: 4, name: 'James Wilson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
      { id: 5, name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
    ];

    const today = selectedDate;
    
    return employees.map((emp) => {
      const checkInHour = 10;
      const checkInMinute = Math.floor(Math.random() * 15);
      const checkOutHour = 19;
      const checkOutMinute = Math.floor(Math.random() * 30);

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        avatar: emp.avatar,
        date: today.toISOString().split('T')[0],
        checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), checkInHour, checkInMinute).toISOString(),
        checkOut: new Date(today.getFullYear(), today.getMonth(), today.getDate(), checkOutHour, checkOutMinute).toISOString(),
      };
    });
  }, [selectedDate]);

  // Fetch attendance
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API first
      try {
        const response = await attendanceAPI.getAll({
          date: selectedDate.toISOString().split('T')[0],
        });

        if (response.success && response.data?.length > 0) {
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
  }, [selectedDate, viewMode]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Navigate date
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Filter by search
  const filteredRecords = attendanceRecords.filter(record =>
    record.employeeName?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Format date header
  const getDateHeader = () => {
    const day = selectedDate.getDate();
    const month = months[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    return `${day}, ${month} ${year}`;
  };

  return (
    <div className="page-fade-in space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Attendance</h1>
        <div className="flex items-center gap-3">
          <SearchBar 
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search employees..."
            className="w-64"
          />
          <Button 
            variant="outline"
            icon={<RefreshIcon />}
            onClick={fetchAttendance}
            disabled={loading}
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card padding="none">
        {/* Controls Row */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex flex-wrap items-center gap-3">
            {/* Navigation Arrows */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => navigateDate(-1)}
                className="p-2 bg-white rounded-lg border border-neutral-300 hover:bg-neutral-50 transition-all"
              >
                <span className="text-lg font-bold text-neutral-600">←</span>
              </button>
              <button 
                onClick={() => navigateDate(1)}
                className="p-2 bg-white rounded-lg border border-neutral-300 hover:bg-neutral-50 transition-all"
              >
                <span className="text-lg font-bold text-neutral-600">→</span>
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
          </div>
        </div>

        {/* Date Header */}
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900">{getDateHeader()}</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white border-b border-neutral-300">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 border-r border-neutral-200">
                  Emp
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 border-r border-neutral-200">
                  Check In
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 border-r border-neutral-200">
                  Check Out
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 border-r border-neutral-200">
                  Work Hours
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                  Extra hours
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan={5}>
                    <TableSkeleton />
                  </td>
                </tr>
              )}

              {/* Error */}
              {error && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="text-error mb-3">{error}</div>
                    <Button variant="outline" size="sm" onClick={fetchAttendance}>Retry</Button>
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && !error && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <p className="text-neutral-500">No attendance records for this date.</p>
                  </td>
                </tr>
              )}

              {/* Data */}
              {!loading && !error && filteredRecords.map((record, index) => (
                <AttendanceRow key={record.employeeId || index} record={record} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
