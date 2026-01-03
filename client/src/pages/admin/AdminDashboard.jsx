import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Avatar, StatusDot, Button, Badge, SearchBar } from '../../components/ui';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';

// Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Mock employee data
const mockEmployees = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@dayflow.com',
    phone: '+1 (555) 123-4567',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@dayflow.com',
    phone: '+1 (555) 234-5678',
    role: 'Product Manager',
    department: 'Product',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@dayflow.com',
    phone: '+1 (555) 345-6789',
    role: 'UX Designer',
    department: 'Design',
    status: 'leave',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'James Wilson',
    email: 'james.wilson@dayflow.com',
    phone: '+1 (555) 456-7890',
    role: 'DevOps Engineer',
    department: 'Engineering',
    status: 'absent',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 5,
    name: 'Priya Patel',
    email: 'priya.patel@dayflow.com',
    phone: '+1 (555) 567-8901',
    role: 'Data Analyst',
    department: 'Analytics',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 6,
    name: 'David Kim',
    email: 'david.kim@dayflow.com',
    phone: '+1 (555) 678-9012',
    role: 'Backend Developer',
    department: 'Engineering',
    status: 'not-checked-in',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 7,
    name: 'Lisa Thompson',
    email: 'lisa.thompson@dayflow.com',
    phone: '+1 (555) 789-0123',
    role: 'HR Manager',
    department: 'Human Resources',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 8,
    name: 'Robert Martinez',
    email: 'robert.martinez@dayflow.com',
    phone: '+1 (555) 890-1234',
    role: 'Cloud Architect',
    department: 'Engineering',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 9,
    name: 'Amanda Foster',
    email: 'amanda.foster@dayflow.com',
    phone: '+1 (555) 901-2345',
    role: 'Finance Lead',
    department: 'Finance',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
  },
];

// Employee Card Component
const EmployeeCard = ({ employee, onClick }) => {
  return (
    <Card 
      hover 
      onClick={onClick}
      className="relative overflow-hidden group animate-fade-in cursor-pointer"
      padding="none"
    >
      {/* Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <StatusDot status={employee.status} size="md" />
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <Avatar 
            src={employee.avatar}
            name={employee.name}
            size="xl"
            className="ring-4 ring-primary-100 group-hover:ring-primary-200 transition-all duration-300"
          />
        </div>

        {/* Info */}
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-neutral-900 text-lg group-hover:text-primary-600 transition-colors">
            {employee.name}
          </h3>
          <p className="text-sm text-neutral-500">{employee.role}</p>
          {employee.department && (
            <Badge variant="primary" size="sm">
              {employee.department}
            </Badge>
          )}
        </div>

        {/* Hover Info */}
        <div className="mt-4 pt-4 border-t border-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-xs text-neutral-400 text-center truncate">
            {employee.email}
          </p>
        </div>
      </div>

      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color }) => {
  const colorClasses = {
    neutral: 'from-neutral-100 to-neutral-50 text-neutral-900',
    success: 'from-success/10 to-success/5 text-success',
    warning: 'from-warning/10 to-warning/5 text-warning',
    info: 'from-info/10 to-info/5 text-info',
    error: 'from-error/10 to-error/5 text-error',
  };

  return (
    <div className={`rounded-card p-4 bg-gradient-to-br border border-white/50 ${colorClasses[color]}`}>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState('employees');
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Filter employees based on search
  const filteredEmployees = mockEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchValue.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Stats
  const stats = {
    total: mockEmployees.length,
    present: mockEmployees.filter(e => e.status === 'present').length,
    absent: mockEmployees.filter(e => e.status === 'absent').length,
    leave: mockEmployees.filter(e => e.status === 'leave').length,
  };

  const handleEmployeeClick = (employee) => {
    navigate(`/admin/employee/${employee.id}`);
  };

  const handleMyProfile = () => {
    navigate('/admin/my-profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleCheckIn = () => {
    setIsCheckedIn(true);
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
  };

  const userStatus = isCheckedIn ? 'present' : 'not-checked-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-start to-bg-end">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-neutral-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-soft flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-neutral-900 tracking-tight">Dayflow</span>
            </div>

            {/* Center Nav Tabs */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { id: 'employees', label: 'Employees' },
                { id: 'attendance', label: 'Attendance' },
                { id: 'timeoff', label: 'Time Off' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentPage(tab.id)}
                  className={`
                    px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
                    ${currentPage === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <SearchBar 
                value={searchValue}
                onChange={setSearchValue}
                className="hidden lg:block w-56"
                placeholder="Search employees..."
              />

              {/* Settings */}
              <button className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all">
                <SettingsIcon />
              </button>

              {/* Avatar with Dropdown */}
              <Dropdown
                align="right"
                trigger={
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-neutral-100/80 transition-all duration-200 cursor-pointer">
                    <div className="relative">
                      <Avatar 
                        name={user?.firstName || 'Admin'}
                        size="sm"
                        className="w-8 h-8 text-xs"
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${userStatus === 'present' ? 'bg-success' : 'bg-error'}`} />
                    </div>
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                }
              >
                <div className="py-1">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="font-semibold text-neutral-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-neutral-500">{user?.email}</p>
                  </div>
                  <DropdownItem icon={<UserIcon />} onClick={handleMyProfile}>
                    My Profile
                  </DropdownItem>
                  <DropdownItem icon={<LogoutIcon />} onClick={handleLogout} danger>
                    Log Out
                  </DropdownItem>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content Area */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Employee Directory</h1>
                <p className="text-neutral-500 mt-1">Manage and view your team members</p>
              </div>
              <Button 
                variant="primary"
                icon={<PlusIcon />}
                onClick={() => alert('Add employee form coming soon!')}
              >
                New Employee
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Employees" value={stats.total} color="neutral" />
              <StatCard label="Present Today" value={stats.present} color="success" />
              <StatCard label="Absent" value={stats.absent} color="warning" />
              <StatCard label="On Leave" value={stats.leave} color="info" />
            </div>

            {/* Mobile Search */}
            <div className="lg:hidden mb-6">
              <SearchBar 
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search employees..."
              />
            </div>

            {/* Employee Grid */}
            {filteredEmployees.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map((employee, index) => (
                  <div 
                    key={employee.id} 
                    className={`stagger-${Math.min(index + 1, 9)}`}
                    style={{ animationFillMode: 'both' }}
                  >
                    <EmployeeCard 
                      employee={employee}
                      onClick={() => handleEmployeeClick(employee)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <div className="text-neutral-400 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-700">No employees found</h3>
                <p className="text-neutral-500 mt-1">Try adjusting your search</p>
              </Card>
            )}
          </main>

          {/* Right Sidebar - Check In/Out */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <Card className="sticky top-24">
              <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Attendance
              </h3>
              
              {isCheckedIn ? (
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 rounded-xl">
                    <div className="flex items-center gap-2 text-success mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium text-sm">Checked In</span>
                    </div>
                    <p className="text-sm text-neutral-600">Since {new Date().toLocaleTimeString()}</p>
                  </div>
                  <Button variant="secondary" className="w-full" onClick={handleCheckOut}>
                    Check Out →
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-error/10 rounded-xl">
                    <div className="flex items-center gap-2 text-error mb-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-sm">Not Checked In</span>
                    </div>
                    <p className="text-sm text-neutral-600">Mark your attendance</p>
                  </div>
                  <Button variant="primary" className="w-full" onClick={handleCheckIn}>
                    Check In →
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <h4 className="text-sm font-medium text-neutral-600 mb-3">This Week</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Hours Worked</span>
                  <span className="font-semibold text-neutral-900">32h 15m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Days Present</span>
                  <span className="font-semibold text-neutral-900">4 / 5</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

