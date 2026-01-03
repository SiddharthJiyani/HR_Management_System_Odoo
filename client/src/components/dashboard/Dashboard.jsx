import { useState, useEffect } from 'react';
import { Button } from '../auth/AuthComponents';

const Dashboard = ({ user, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-start to-bg-end">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-auth shadow-soft border-b border-neutral-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center shadow-soft">
                <span className="text-white font-bold text-sm">HR</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">HRMS Dashboard</h1>
                <p className="text-sm text-neutral-500">
                  {user?.role === 'hr' ? 'Human Resources' : 'Employee'} Portal
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">{user?.email}</p>
                <p className="text-xs text-neutral-500 capitalize">{user?.role} • ID: {user?.employeeId}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="secondary"
                size="sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white/90 backdrop-blur-auth rounded-card-lg p-6 shadow-soft mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </h2>
          <p className="text-neutral-600">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/90 backdrop-blur-auth rounded-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Employee ID</p>
                <p className="text-2xl font-semibold text-neutral-900">{user?.employeeId}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-primary-600 text-xl">👤</span>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-auth rounded-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Role</p>
                <p className="text-2xl font-semibold text-neutral-900 capitalize">{user?.role}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-primary-600 text-xl">
                  {user?.role === 'hr' ? '💼' : '👨‍💻'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-auth rounded-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Status</p>
                <p className="text-2xl font-semibold text-success">Active</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific Content */}
        {user?.role === 'hr' ? (
          <div className="bg-white/90 backdrop-blur-auth rounded-card-lg p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">HR Management Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="text-primary-600 text-2xl mb-2">👥</div>
                <h4 className="font-medium text-neutral-900">Employee Management</h4>
                <p className="text-sm text-neutral-500">Manage employee records and profiles</p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="text-primary-600 text-2xl mb-2">📊</div>
                <h4 className="font-medium text-neutral-900">Reports</h4>
                <p className="text-sm text-neutral-500">View attendance and performance reports</p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="text-primary-600 text-2xl mb-2">💰</div>
                <h4 className="font-medium text-neutral-900">Payroll</h4>
                <p className="text-sm text-neutral-500">Manage payroll and compensation</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-auth rounded-card-lg p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Employee Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="text-primary-600 text-2xl mb-2">⏰</div>
                <h4 className="font-medium text-neutral-900">Time Tracking</h4>
                <p className="text-sm text-neutral-500">Track your working hours</p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="text-primary-600 text-2xl mb-2">📅</div>
                <h4 className="font-medium text-neutral-900">Leave Requests</h4>
                <p className="text-sm text-neutral-500">Request time off and view balance</p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="text-primary-600 text-2xl mb-2">👤</div>
                <h4 className="font-medium text-neutral-900">My Profile</h4>
                <p className="text-sm text-neutral-500">Update your personal information</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;