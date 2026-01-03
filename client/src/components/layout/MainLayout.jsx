import React from 'react';
import Navbar from './Navbar';
import AttendancePanel from './AttendancePanel';

const MainLayout = ({ 
  children, 
  currentPage,
  onNavigate,
  searchValue,
  onSearch,
  currentUser,
  userStatus,
  onMyProfile,
  onLogout,
  onSettings,
  isCheckedIn,
  checkInTime,
  onCheckIn,
  onCheckOut,
  showAttendancePanel = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-start to-bg-end">
      {/* Navbar */}
      <Navbar 
        currentPage={currentPage}
        onNavigate={onNavigate}
        searchValue={searchValue}
        onSearch={onSearch}
        currentUser={currentUser}
        userStatus={userStatus}
        onMyProfile={onMyProfile}
        onLogout={onLogout}
        onSettings={onSettings}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <main className={`flex-1 ${showAttendancePanel ? 'lg:mr-80' : ''}`}>
            {children}
          </main>

          {/* Attendance Side Panel - Fixed on Desktop */}
          {showAttendancePanel && (
            <aside className="hidden lg:block fixed right-8 top-24 w-72">
              <AttendancePanel 
                isCheckedIn={isCheckedIn}
                checkInTime={checkInTime}
                onCheckIn={onCheckIn}
                onCheckOut={onCheckOut}
              />

              {/* Quick Stats */}
              <div className="mt-4 glass-card rounded-card-lg p-4">
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-500">Avg. Check-in</span>
                    <span className="font-semibold text-neutral-900">9:05 AM</span>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Attendance Panel */}
      {showAttendancePanel && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
          <AttendancePanel 
            isCheckedIn={isCheckedIn}
            checkInTime={checkInTime}
            onCheckIn={onCheckIn}
            onCheckOut={onCheckOut}
          />
        </div>
      )}
    </div>
  );
};

export default MainLayout;

