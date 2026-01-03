import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Tabs, Button, Avatar, Badge } from '../../components/ui';
import { ProfileHeader, PrivateInfoTab, ResumeTab } from '../../components/profile';
import { SalaryInfoTab } from '../../components/salary';

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

// Mock employee data - in real app, fetch from API
const employeesData = {
  1: {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@dayflow.com',
    phone: '+1 (555) 123-4567',
    loginId: 'EMP001',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    company: 'Dayflow Inc.',
    department: 'Engineering',
    manager: 'John Smith',
    location: 'San Francisco, CA',
    role: 'Senior Software Engineer',
    about: 'Passionate software engineer with 8+ years of experience building scalable web applications.',
    whatILove: 'I love solving complex problems and mentoring junior developers.',
    hobbies: 'Hiking, photography, and open-source contributions.',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
    certifications: ['AWS Solutions Architect', 'Google Cloud Professional'],
    salaryData: { monthlyWage: 85000, yearlyWage: 1020000 },
  },
  2: {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@dayflow.com',
    phone: '+1 (555) 234-5678',
    loginId: 'EMP002',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    company: 'Dayflow Inc.',
    department: 'Product',
    manager: 'Jane Doe',
    location: 'New York, NY',
    role: 'Product Manager',
    about: 'Product leader with a track record of launching successful products.',
    whatILove: 'Building products that make a difference in people\'s lives.',
    hobbies: 'Reading, chess, and cooking.',
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'UX Research'],
    certifications: ['Certified Scrum Product Owner', 'PMP'],
    salaryData: { monthlyWage: 95000, yearlyWage: 1140000 },
  },
  3: {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@dayflow.com',
    phone: '+1 (555) 345-6789',
    loginId: 'EMP003',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    company: 'Dayflow Inc.',
    department: 'Design',
    manager: 'Sarah Wilson',
    location: 'Austin, TX',
    role: 'UX Designer',
    about: 'User-centered designer passionate about creating intuitive experiences.',
    whatILove: 'Turning complex problems into simple, elegant solutions.',
    hobbies: 'Art, yoga, and traveling.',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    certifications: ['Google UX Design Certificate'],
    salaryData: { monthlyWage: 72000, yearlyWage: 864000 },
  },
  4: {
    id: 4,
    name: 'James Wilson',
    email: 'james.wilson@dayflow.com',
    phone: '+1 (555) 456-7890',
    loginId: 'EMP004',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    company: 'Dayflow Inc.',
    department: 'Engineering',
    manager: 'John Smith',
    location: 'Seattle, WA',
    role: 'DevOps Engineer',
    about: 'Infrastructure specialist focused on automation and reliability.',
    whatILove: 'Building resilient systems that scale.',
    hobbies: 'Gaming, home automation, and music.',
    skills: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Python'],
    certifications: ['CKA', 'AWS DevOps Professional'],
    salaryData: { monthlyWage: 78000, yearlyWage: 936000 },
  },
  5: {
    id: 5,
    name: 'Priya Patel',
    email: 'priya.patel@dayflow.com',
    phone: '+1 (555) 567-8901',
    loginId: 'EMP005',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    company: 'Dayflow Inc.',
    department: 'Analytics',
    manager: 'Mike Johnson',
    location: 'Chicago, IL',
    role: 'Data Analyst',
    about: 'Data-driven analyst with expertise in business intelligence.',
    whatILove: 'Uncovering insights that drive business decisions.',
    hobbies: 'Reading, podcasts, and running.',
    skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics'],
    certifications: ['Google Data Analytics Certificate'],
    salaryData: { monthlyWage: 65000, yearlyWage: 780000 },
  },
  6: {
    id: 6,
    name: 'David Kim',
    email: 'david.kim@dayflow.com',
    phone: '+1 (555) 678-9012',
    loginId: 'EMP006',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    company: 'Dayflow Inc.',
    department: 'Engineering',
    manager: 'John Smith',
    location: 'Los Angeles, CA',
    role: 'Backend Developer',
    about: 'Backend engineer specializing in API design and microservices.',
    whatILove: 'Writing clean, efficient code that powers great products.',
    hobbies: 'Basketball, video games, and cooking.',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Kafka'],
    certifications: ['Oracle Certified Professional'],
    salaryData: { monthlyWage: 75000, yearlyWage: 900000 },
  },
  7: {
    id: 7,
    name: 'Lisa Thompson',
    email: 'lisa.thompson@dayflow.com',
    phone: '+1 (555) 789-0123',
    loginId: 'EMP007',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    company: 'Dayflow Inc.',
    department: 'Human Resources',
    manager: 'CEO',
    location: 'San Francisco, CA',
    role: 'HR Manager',
    about: 'HR leader focused on building great company culture.',
    whatILove: 'Helping people grow and succeed in their careers.',
    hobbies: 'Reading, yoga, and volunteering.',
    skills: ['Recruitment', 'Employee Relations', 'HRIS', 'Compliance'],
    certifications: ['SHRM-CP', 'PHR'],
    salaryData: { monthlyWage: 82000, yearlyWage: 984000 },
  },
  8: {
    id: 8,
    name: 'Robert Martinez',
    email: 'robert.martinez@dayflow.com',
    phone: '+1 (555) 890-1234',
    loginId: 'EMP008',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    company: 'Dayflow Inc.',
    department: 'Engineering',
    manager: 'John Smith',
    location: 'Denver, CO',
    role: 'Cloud Architect',
    about: 'Cloud architect designing scalable, secure infrastructure.',
    whatILove: 'Building the foundation that enables innovation.',
    hobbies: 'Hiking, photography, and flying drones.',
    skills: ['AWS', 'Azure', 'GCP', 'Architecture', 'Security'],
    certifications: ['AWS Solutions Architect Pro', 'Azure Solutions Architect'],
    salaryData: { monthlyWage: 110000, yearlyWage: 1320000 },
  },
  9: {
    id: 9,
    name: 'Amanda Foster',
    email: 'amanda.foster@dayflow.com',
    phone: '+1 (555) 901-2345',
    loginId: 'EMP009',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    company: 'Dayflow Inc.',
    department: 'Finance',
    manager: 'CFO',
    location: 'Boston, MA',
    role: 'Finance Lead',
    about: 'Finance professional with expertise in FP&A and strategic planning.',
    whatILove: 'Helping the company make smart financial decisions.',
    hobbies: 'Tennis, reading, and travel.',
    skills: ['Financial Modeling', 'Budgeting', 'Excel', 'SAP'],
    certifications: ['CPA', 'CFA Level II'],
    salaryData: { monthlyWage: 92000, yearlyWage: 1104000 },
  },
};

const EmployeeProfileView = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('resume');

  // Check if current user is admin
  const isAdminUser = isAdmin || user?.email === 'admin@gmail.com';

  // Get employee data
  const employeeData = employeesData[employeeId] || {
    id: employeeId,
    name: 'Unknown Employee',
    email: 'unknown@dayflow.com',
    phone: 'N/A',
    loginId: `EMP${employeeId}`,
    company: 'Dayflow Inc.',
    department: 'Unknown',
    manager: 'N/A',
    location: 'N/A',
    role: 'Employee',
    about: '',
    whatILove: '',
    hobbies: '',
    skills: [],
    certifications: [],
    salaryData: { monthlyWage: 50000, yearlyWage: 600000 },
  };

  // Tab configuration - Salary Info only visible to admin
  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'privateInfo', label: 'Private Info' },
    ...(isAdminUser ? [{ id: 'salaryInfo', label: 'Salary Info' }] : []),
  ];

  const handleProfileUpdate = (data) => {
    console.log('Profile updated:', data);
  };

  const handlePrivateInfoUpdate = (data) => {
    console.log('Private info updated:', data);
  };

  const handleSalaryUpdate = (data) => {
    console.log('Salary updated:', data);
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'resume':
        return <ResumeTab />;
      case 'privateInfo':
        return (
          <PrivateInfoTab 
            data={employeeData}
            onUpdate={handlePrivateInfoUpdate}
          />
        );
      case 'salaryInfo':
        return (
          <SalaryInfoTab 
            data={employeeData.salaryData}
            onUpdate={handleSalaryUpdate}
            isAdmin={isAdminUser}
          />
        );
      default:
        return <ResumeTab />;
    }
  };

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
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-neutral-900 tracking-tight">Dayflow</span>
                <Badge variant="primary" size="sm">Admin</Badge>
              </div>
            </div>

            {/* Center Nav Tabs */}
            <div className="hidden md:flex items-center gap-1">
              {['Employees', 'Attendance', 'Time Off'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => navigate('/admin/dashboard')}
                  className={`
                    px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
                    ${tab === 'Employees'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-neutral-100/80 transition-all cursor-pointer">
                <Avatar name={user?.firstName || 'Admin'} size="sm" className="w-8 h-8 text-xs" />
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:text-error hover:bg-error/10 transition-all"
              >
                <LogoutIcon />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button & Title Row */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-3 transition-colors group"
            >
              <span className="w-6 h-6 rounded-lg bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center transition-colors">
                <BackIcon />
              </span>
              <span className="font-medium">Back to Employees</span>
            </button>

            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Employee Profile</h1>
            <p className="text-neutral-500 mt-1 text-sm">View and manage employee information</p>
          </div>
        </div>

        {/* Profile Header */}
        <div className="animate-fade-in">
          <ProfileHeader 
            employee={employeeData}
            onUpdate={handleProfileUpdate}
            isEditable={isAdminUser}
            isAdmin={false}
          />
        </div>

        {/* Tabs Section */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Tabs 
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="mb-6"
          />

          <div className="animate-fade-in" key={activeTab}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileView;

