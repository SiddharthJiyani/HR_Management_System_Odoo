import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO } from 'date-fns';
import { Card, Button, Badge, Avatar } from '../components/ui';
import { employeeAPI, attendanceAPI, leaveAPI } from '../services/api';

// Icons
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TrendUpIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CakeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

// Chart colors
const COLORS = {
  primary: '#FFD966',
  secondary: '#FFB300',
  success: '#22C55E',
  error: '#EF4444',
  info: '#3B82F6',
  warning: '#F59E0B',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

const CHART_COLORS = ['#FFD966', '#22C55E', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];

// Stat Card Component
const StatCard = ({ title, value, change, changeType, icon, color = 'primary', subtitle }) => {
  const colorClasses = {
    primary: 'from-primary-100 to-primary-50 text-primary-600',
    success: 'from-green-100 to-green-50 text-green-600',
    info: 'from-blue-100 to-blue-50 text-blue-600',
    warning: 'from-amber-100 to-amber-50 text-amber-600',
    error: 'from-red-100 to-red-50 text-red-600',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-neutral-500'}`}>
              {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : ''}
              <span>{change}</span>
              <span className="text-neutral-400 font-normal">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

// Attendance Heatmap Calendar
const AttendanceHeatmap = ({ data }) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getIntensity = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = data?.find(d => d.date === dateStr);
    if (!dayData) return 0;
    return dayData.rate || 0;
  };

  const getColorClass = (intensity) => {
    if (intensity === 0) return 'bg-neutral-100';
    if (intensity < 50) return 'bg-red-200';
    if (intensity < 70) return 'bg-amber-200';
    if (intensity < 85) return 'bg-yellow-200';
    if (intensity < 95) return 'bg-green-200';
    return 'bg-green-400';
  };

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
        <div key={i} className="text-xs text-center text-neutral-400 font-medium py-1">
          {day}
        </div>
      ))}
      {/* Empty cells for alignment */}
      {Array.from({ length: monthStart.getDay() }).map((_, i) => (
        <div key={`empty-${i}`} className="aspect-square" />
      ))}
      {days.map((date, i) => {
        const intensity = getIntensity(date);
        const isTodayDate = isToday(date);
        return (
          <div
            key={i}
            className={`aspect-square rounded-lg ${getColorClass(intensity)} ${isTodayDate ? 'ring-2 ring-primary-400 ring-offset-1' : ''} transition-all hover:scale-110 cursor-pointer`}
            title={`${format(date, 'MMM d')}: ${intensity}% attendance`}
          />
        );
      })}
    </div>
  );
};

// Department Progress Bar
const DepartmentBar = ({ name, count, total, percentage, color }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-neutral-700">{name}</span>
      <span className="text-sm text-neutral-500">{count} employees</span>
    </div>
    <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

// Employee List Item
const EmployeeListItem = ({ name, department, avatar, subtitle, badge }) => (
  <div className="flex items-center gap-3 py-3 border-b border-neutral-50 last:border-0">
    <Avatar name={name} src={avatar} size="sm" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
      <p className="text-xs text-neutral-500">{subtitle || department}</p>
    </div>
    {badge && (
      <Badge variant={badge.variant} size="sm">{badge.text}</Badge>
    )}
  </div>
);

// Main Analytics Component
const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  // Analytics data state
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    avgAttendance: 0,
    employeeChange: 0,
  });
  
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [leaveDistribution, setLeaveDistribution] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [newJoiners, setNewJoiners] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [anniversaries, setAnniversaries] = useState([]);
  const [lateArrivals, setLateArrivals] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [workingHours, setWorkingHours] = useState({ avg: 0, overtime: 0 });

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch employees
      const employeesRes = await employeeAPI.getAll();
      const employees = employeesRes.data || [];
      
      // Fetch today's attendance
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      let attendanceRes;
      try {
        attendanceRes = await attendanceAPI.getAll({ date: todayStr });
      } catch {
        attendanceRes = { data: [] };
      }
      const todayAttendance = attendanceRes.data || [];
      
      // Fetch leaves
      let leavesRes;
      try {
        leavesRes = await leaveAPI.getAll();
      } catch {
        leavesRes = { data: [] };
      }
      const leaves = leavesRes.data || [];

      // Calculate stats
      const presentToday = todayAttendance.filter(a => a.checkIn).length;
      const onLeaveToday = leaves.filter(l => 
        l.status === 'approved' && 
        new Date(l.startDate) <= new Date() && 
        new Date(l.endDate) >= new Date()
      ).length;

      setStats({
        totalEmployees: employees.length,
        presentToday,
        onLeave: onLeaveToday,
        avgAttendance: employees.length > 0 ? Math.round((presentToday / employees.length) * 100) : 0,
        employeeChange: '+3', // This would need historical data
      });

      // Generate attendance trend data (last 30 days)
      const trendData = [];
      for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i);
        trendData.push({
          date: format(date, 'MMM dd'),
          fullDate: format(date, 'yyyy-MM-dd'),
          attendance: Math.floor(Math.random() * 20) + 80, // Mock data
          lastMonth: Math.floor(Math.random() * 20) + 75, // Mock data
        });
      }
      setAttendanceTrend(trendData);

      // Leave distribution
      const paidLeaves = leaves.filter(l => l.leaveType === 'paid' || l.leaveType === 'vacation').length;
      const sickLeaves = leaves.filter(l => l.leaveType === 'sick').length;
      const unpaidLeaves = leaves.filter(l => l.leaveType === 'unpaid').length;
      const totalLeaves = paidLeaves + sickLeaves + unpaidLeaves || 1;

      setLeaveDistribution([
        { name: 'Paid Time Off', value: paidLeaves, percentage: Math.round((paidLeaves / totalLeaves) * 100) },
        { name: 'Sick Leave', value: sickLeaves, percentage: Math.round((sickLeaves / totalLeaves) * 100) },
        { name: 'Unpaid Leave', value: unpaidLeaves, percentage: Math.round((unpaidLeaves / totalLeaves) * 100) },
      ]);

      // Department breakdown
      const deptCounts = {};
      employees.forEach(emp => {
        const dept = emp.department || 'Other';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });
      
      const maxCount = Math.max(...Object.values(deptCounts), 1);
      const deptData = Object.entries(deptCounts).map(([name, count], index) => ({
        name,
        count,
        percentage: (count / maxCount) * 100,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })).sort((a, b) => b.count - a.count);
      setDepartmentData(deptData);

      // Peak check-in hours (mock data)
      const peakData = [];
      for (let hour = 7; hour <= 11; hour++) {
        peakData.push({
          hour: `${hour}:00`,
          count: hour === 9 ? 45 : hour === 8 ? 25 : hour === 10 ? 30 : Math.floor(Math.random() * 20) + 5,
        });
      }
      setPeakHours(peakData);

      // Heatmap data for current month
      const heatmap = [];
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      daysInMonth.forEach(day => {
        heatmap.push({
          date: format(day, 'yyyy-MM-dd'),
          rate: Math.floor(Math.random() * 30) + 70, // Mock: 70-100%
        });
      });
      setHeatmapData(heatmap);

      // New joiners (mock)
      const recentJoiners = employees
        .filter(emp => {
          const joinDate = new Date(emp.joinDate || emp.createdAt);
          const thirtyDaysAgo = subDays(new Date(), 30);
          return joinDate >= thirtyDaysAgo;
        })
        .slice(0, 5);
      setNewJoiners(recentJoiners);

      // Mock birthdays and anniversaries
      setBirthdays([
        { name: 'John Smith', department: 'Engineering', date: 'Today' },
        { name: 'Sarah Wilson', department: 'Design', date: 'Tomorrow' },
      ]);

      setAnniversaries([
        { name: 'Mike Johnson', department: 'Marketing', years: 3 },
        { name: 'Emily Brown', department: 'HR', years: 1 },
      ]);

      // Late arrivals trend
      const lateData = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        lateData.push({
          day: format(date, 'EEE'),
          late: Math.floor(Math.random() * 10) + 2,
          onTime: Math.floor(Math.random() * 30) + 40,
        });
      }
      setLateArrivals(lateData);

      // Working hours
      setWorkingHours({
        avg: '8h 15m',
        overtime: '12h 30m',
        undertime: 3,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const departments = ['all', ...departmentData.map(d => d.name)];

  return (
    <div className="page-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h1>
          <p className="text-neutral-500 mt-1">Overview of workforce metrics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <div className="flex items-center bg-white rounded-xl border border-neutral-200 p-1">
            {['week', 'month', 'quarter'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  dateRange === range
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:border-primary-400"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>

          <Button variant="outline" icon={<RefreshIcon />} onClick={fetchAnalytics} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          change={stats.employeeChange}
          changeType="positive"
          icon={<UsersIcon />}
          color="primary"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          subtitle={`${stats.avgAttendance}% of workforce`}
          icon={<CheckIcon />}
          color="success"
        />
        <StatCard
          title="On Leave Today"
          value={stats.onLeave}
          icon={<CalendarIcon />}
          color="info"
        />
        <StatCard
          title="Avg. Attendance Rate"
          value={`${stats.avgAttendance}%`}
          change="+2.5%"
          changeType="positive"
          icon={<TrendUpIcon />}
          color="warning"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Attendance Trends</h3>
              <p className="text-sm text-neutral-500">Daily attendance rate over time</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-400" />
                <span className="text-neutral-600">This Month</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-neutral-300" />
                <span className="text-neutral-600">Last Month</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD966" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFD966" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={[60, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#FFD966" 
                  strokeWidth={2}
                  fill="url(#colorAttendance)" 
                  name="This Month"
                />
                <Line 
                  type="monotone" 
                  dataKey="lastMonth" 
                  stroke="#d1d5db" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Last Month"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Attendance Heatmap */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Attendance Calendar</h3>
            <p className="text-sm text-neutral-500">{format(new Date(), 'MMMM yyyy')}</p>
          </div>
          <AttendanceHeatmap data={heatmapData} />
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-neutral-500">
            <span>Low</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-red-200" />
              <div className="w-4 h-4 rounded bg-amber-200" />
              <div className="w-4 h-4 rounded bg-yellow-200" />
              <div className="w-4 h-4 rounded bg-green-200" />
              <div className="w-4 h-4 rounded bg-green-400" />
            </div>
            <span>High</span>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Distribution */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Leave Distribution</h3>
            <p className="text-sm text-neutral-500">By leave type</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leaveDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {leaveDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }} />
                  <span className="text-neutral-600">{item.name}</span>
                </div>
                <span className="font-medium text-neutral-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Peak Check-in Hours */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Peak Check-in Hours</h3>
            <p className="text-sm text-neutral-500">When employees arrive</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                  }}
                />
                <Bar dataKey="count" fill="#FFD966" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Late Arrivals Trend */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Punctuality Trend</h3>
            <p className="text-sm text-neutral-500">Last 7 days</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lateArrivals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                  }}
                />
                <Bar dataKey="onTime" stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} name="On Time" />
                <Bar dataKey="late" stackId="a" fill="#EF4444" radius={[6, 6, 0, 0]} name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Department & Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <Card className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Department Overview</h3>
            <p className="text-sm text-neutral-500">Employee distribution by department</p>
          </div>
          <div className="space-y-4">
            {departmentData.map((dept) => (
              <DepartmentBar
                key={dept.name}
                name={dept.name}
                count={dept.count}
                total={stats.totalEmployees}
                percentage={dept.percentage}
                color={dept.color}
              />
            ))}
          </div>
        </Card>

        {/* Time & Productivity */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Time & Productivity</h3>
            <p className="text-sm text-neutral-500">This week's summary</p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 rounded-xl">
                  <ClockIcon />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Avg. Working Hours</p>
                  <p className="text-xl font-bold text-neutral-900">{workingHours.avg}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                  <TrendUpIcon />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Total Overtime</p>
                  <p className="text-xl font-bold text-neutral-900">{workingHours.overtime}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Undertime Alerts</p>
                  <p className="text-xl font-bold text-neutral-900">{workingHours.undertime} employees</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Employee Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New Joiners */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">New Joiners</h3>
            <Badge variant="success" size="sm">This Month</Badge>
          </div>
          {newJoiners.length > 0 ? (
            <div className="space-y-0">
              {newJoiners.map((emp, i) => (
                <EmployeeListItem
                  key={i}
                  name={`${emp.firstName} ${emp.lastName}`}
                  department={emp.department}
                  avatar={emp.profilePhoto}
                  subtitle={`Joined ${format(new Date(emp.joinDate || emp.createdAt), 'MMM d')}`}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 text-center py-8">No new joiners this month</p>
          )}
        </Card>

        {/* Birthdays */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <CakeIcon />
              Birthdays
            </h3>
            <Badge variant="info" size="sm">This Week</Badge>
          </div>
          <div className="space-y-0">
            {birthdays.map((person, i) => (
              <EmployeeListItem
                key={i}
                name={person.name}
                department={person.department}
                subtitle={person.date}
                badge={{ variant: person.date === 'Today' ? 'success' : 'neutral', text: person.date }}
              />
            ))}
          </div>
        </Card>

        {/* Work Anniversaries */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <StarIcon />
              Anniversaries
            </h3>
            <Badge variant="warning" size="sm">This Month</Badge>
          </div>
          <div className="space-y-0">
            {anniversaries.map((person, i) => (
              <EmployeeListItem
                key={i}
                name={person.name}
                department={person.department}
                subtitle={`${person.years} year${person.years > 1 ? 's' : ''} at company`}
                badge={{ variant: 'warning', text: `${person.years}yr` }}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

