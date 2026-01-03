import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layout';
import { 
  EmployeeDirectory, 
  EmployeeProfile, 
  MyProfile, 
  Attendance, 
  TimeOff 
} from '../../pages';
import { useAuth } from '../../context/AuthContext';

// Mock employee data
const mockEmployees = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@dayflow.com',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Park, San Francisco, CA 94105',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    employeeId: 'EMP001',
    joinDate: 'March 15, 2022',
    employmentType: 'Full-time',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    attendance: { present: 20, absent: 0, leave: 1, late: 1 },
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@dayflow.com',
    phone: '+1 (555) 234-5678',
    address: '456 Innovation Way, San Francisco, CA 94107',
    role: 'Product Manager',
    department: 'Product',
    employeeId: 'EMP002',
    joinDate: 'January 8, 2021',
    employmentType: 'Full-time',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    attendance: { present: 18, absent: 1, leave: 2, late: 0 },
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@dayflow.com',
    phone: '+1 (555) 345-6789',
    address: '789 Startup Blvd, San Francisco, CA 94110',
    role: 'UX Designer',
    department: 'Design',
    employeeId: 'EMP003',
    joinDate: 'June 22, 2023',
    employmentType: 'Full-time',
    status: 'leave',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    attendance: { present: 15, absent: 0, leave: 5, late: 2 },
  },
  {
    id: 4,
    name: 'James Wilson',
    email: 'james.wilson@dayflow.com',
    phone: '+1 (555) 456-7890',
    address: '321 Code Street, San Francisco, CA 94102',
    role: 'DevOps Engineer',
    department: 'Engineering',
    employeeId: 'EMP004',
    joinDate: 'September 5, 2022',
    employmentType: 'Full-time',
    status: 'absent',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    attendance: { present: 17, absent: 3, leave: 1, late: 1 },
  },
  {
    id: 5,
    name: 'Priya Patel',
    email: 'priya.patel@dayflow.com',
    phone: '+1 (555) 567-8901',
    address: '654 Data Drive, San Francisco, CA 94103',
    role: 'Data Analyst',
    department: 'Analytics',
    employeeId: 'EMP005',
    joinDate: 'February 14, 2023',
    employmentType: 'Full-time',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    attendance: { present: 19, absent: 0, leave: 2, late: 0 },
  },
  {
    id: 6,
    name: 'David Kim',
    email: 'david.kim@dayflow.com',
    phone: '+1 (555) 678-9012',
    address: '987 Backend Ave, San Francisco, CA 94108',
    role: 'Backend Developer',
    department: 'Engineering',
    employeeId: 'EMP006',
    joinDate: 'November 1, 2021',
    employmentType: 'Full-time',
    status: 'not-checked-in',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    attendance: { present: 16, absent: 2, leave: 3, late: 1 },
  },
  {
    id: 7,
    name: 'Lisa Thompson',
    email: 'lisa.thompson@dayflow.com',
    phone: '+1 (555) 789-0123',
    address: '246 HR Lane, San Francisco, CA 94109',
    role: 'HR Manager',
    department: 'Human Resources',
    employeeId: 'EMP007',
    joinDate: 'April 20, 2020',
    employmentType: 'Full-time',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    attendance: { present: 21, absent: 0, leave: 0, late: 0 },
  },
  {
    id: 8,
    name: 'Robert Martinez',
    email: 'robert.martinez@dayflow.com',
    phone: '+1 (555) 890-1234',
    address: '135 Cloud Ct, San Francisco, CA 94111',
    role: 'Cloud Architect',
    department: 'Engineering',
    employeeId: 'EMP008',
    joinDate: 'July 12, 2022',
    employmentType: 'Full-time',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    attendance: { present: 18, absent: 1, leave: 2, late: 2 },
  },
  {
    id: 9,
    name: 'Amanda Foster',
    email: 'amanda.foster@dayflow.com',
    phone: '+1 (555) 901-2345',
    address: '864 Finance Row, San Francisco, CA 94104',
    role: 'Finance Lead',
    department: 'Finance',
    employeeId: 'EMP009',
    joinDate: 'October 3, 2021',
    employmentType: 'Full-time',
    status: 'present',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    attendance: { present: 19, absent: 1, leave: 1, late: 0 },
  },
];

const HRDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState('employees');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showMyProfile, setShowMyProfile] = useState(false);
  
  // Search state
  const [searchValue, setSearchValue] = useState('');
  
  // Attendance state
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  
  // Current user from auth
  const [currentUser, setCurrentUser] = useState({
    id: user?.id || 1,
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'HR User',
    email: user?.email || 'hr@dayflow.com',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Park, San Francisco, CA 94105',
    role: 'HR Manager',
    department: 'Human Resources',
    employeeId: user?.employeeId || 'HR001',
    joinDate: 'March 15, 2022',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    emergencyContact: 'John Doe',
    emergencyPhone: '+1 (555) 999-8888',
  });
  
  // Employees state
  const [employees] = useState(mockEmployees);

  // Calculate user status based on check-in
  const userStatus = isCheckedIn ? 'present' : 'not-checked-in';

  // Navigation handlers
  const handleNavigate = useCallback((page) => {
    setCurrentPage(page);
    setSelectedEmployee(null);
    setShowMyProfile(false);
  }, []);

  const handleEmployeeClick = useCallback((employee) => {
    setSelectedEmployee(employee);
    setShowMyProfile(false);
  }, []);

  const handleMyProfile = useCallback(() => {
    setShowMyProfile(true);
    setSelectedEmployee(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedEmployee(null);
    setShowMyProfile(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/signin');
  }, [logout, navigate]);

  const handleSettings = useCallback(() => {
    console.log('Opening settings...');
    alert('Settings page coming soon!');
  }, []);

  const handleNewEmployee = useCallback(() => {
    console.log('Creating new employee...');
    alert('New employee form coming soon!');
  }, []);

  // Attendance handlers
  const handleCheckIn = useCallback(() => {
    setIsCheckedIn(true);
    setCheckInTime(new Date());
  }, []);

  const handleCheckOut = useCallback(() => {
    setIsCheckedIn(false);
    setCheckInTime(null);
  }, []);

  // Profile save handler
  const handleSaveProfile = useCallback((data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser(prev => ({ ...prev, ...data }));
        resolve();
      }, 500);
    });
  }, []);

  // Render the appropriate page content
  const renderContent = () => {
    // If viewing an employee profile
    if (selectedEmployee) {
      return (
        <EmployeeProfile 
          employee={selectedEmployee}
          onBack={handleBack}
        />
      );
    }

    // If viewing own profile
    if (showMyProfile) {
      return (
        <MyProfile 
          user={currentUser}
          onBack={handleBack}
          onSave={handleSaveProfile}
        />
      );
    }

    // Main page content based on current page
    switch (currentPage) {
      case 'employees':
        return (
          <EmployeeDirectory 
            employees={employees}
            onEmployeeClick={handleEmployeeClick}
            onNewEmployee={handleNewEmployee}
            searchValue={searchValue}
          />
        );
      case 'attendance':
        return <Attendance currentUser={currentUser} />;
      case 'timeoff':
        return <TimeOff />;
      default:
        return (
          <EmployeeDirectory 
            employees={employees}
            onEmployeeClick={handleEmployeeClick}
            onNewEmployee={handleNewEmployee}
            searchValue={searchValue}
          />
        );
    }
  };

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      searchValue={searchValue}
      onSearch={setSearchValue}
      currentUser={currentUser}
      userStatus={userStatus}
      onMyProfile={handleMyProfile}
      onLogout={handleLogout}
      onSettings={handleSettings}
      isCheckedIn={isCheckedIn}
      checkInTime={checkInTime}
      onCheckIn={handleCheckIn}
      onCheckOut={handleCheckOut}
      showAttendancePanel={currentPage === 'employees' && !selectedEmployee && !showMyProfile}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default HRDashboard;
