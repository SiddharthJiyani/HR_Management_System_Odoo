import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-start to-bg-end flex items-center justify-center p-4">
      {/* Background pattern overlay */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="max-w-lg w-full text-center relative z-10 animate-slide-up">
        {/* Card Container */}
        <div className="bg-white/90 backdrop-blur-auth shadow-soft-lg rounded-card-lg p-8 md:p-12 border border-neutral-200/20">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>

          {/* Text Content */}
          <h1 className="text-3xl font-semibold text-neutral-900 mb-3">
            Coming Soon
          </h1>
          
          <p className="text-neutral-500 mb-6">
            Hey {user?.firstName || 'there'}! We're working hard to bring you an amazing employee dashboard experience. Stay tuned!
          </p>

          {/* User Info Badge */}
          <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm text-neutral-600">
              Logged in as <span className="font-medium text-neutral-800">{user?.email}</span>
            </span>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: '📊', label: 'Dashboard' },
              { icon: '📅', label: 'Attendance' },
              { icon: '🏖️', label: 'Time Off' },
            ].map((feature) => (
              <div 
                key={feature.label}
                className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/50"
              >
                <span className="text-2xl mb-2 block">{feature.icon}</span>
                <span className="text-sm text-neutral-600">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-neutral-500 mt-6">
          © {new Date().getFullYear()} Dayflow HRMS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
