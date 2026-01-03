import React, { useState } from 'react';
import { Card, Avatar, Button, Badge, Tabs } from '../components/ui';
import { ProfileHeader, PrivateInfoTab, ResumeTab } from '../components/profile';

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// Format employee data for ProfileHeader
const formatForProfileHeader = (employee) => {
  if (!employee) return null;
  
  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    phone: employee.phone || 'N/A',
    loginId: employee.employeeId || 'N/A',
    avatar: employee.avatar,
    company: 'Dayflow Inc.',
    department: employee.department || 'General',
    manager: employee.originalData?.manager || 'Not assigned',
    location: employee.originalData?.address?.city 
      ? `${employee.originalData.address.city}, ${employee.originalData.address.state || ''}`.trim() 
      : employee.address || 'Not specified',
    role: employee.role || 'Employee',
    about: employee.originalData?.about || '',
    whatILove: employee.originalData?.whatILove || '',
    hobbies: employee.originalData?.hobbies || '',
    skills: employee.originalData?.skills || [],
    certifications: employee.originalData?.certifications || [],
  };
};

const EmployeeProfile = ({ employee, onBack }) => {
  const [activeTab, setActiveTab] = useState('resume');

  if (!employee) {
    return (
      <div className="page-fade-in">
        <Button variant="ghost" onClick={onBack} icon={<BackIcon />}>
          Back to Directory
        </Button>
        <Card className="mt-4 text-center py-12">
          <p className="text-neutral-500">Employee not found</p>
        </Card>
      </div>
    );
  }

  // Format employee data for ProfileHeader component
  const profileData = formatForProfileHeader(employee);

  // Tabs for HR view - NO Salary Info
  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'privateInfo', label: 'Private Info' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'resume':
        return <ResumeTab />;
      case 'privateInfo':
        return (
          <PrivateInfoTab 
            data={profileData}
            onUpdate={() => {}} // HR cannot edit
            isEditable={false}
          />
        );
      default:
        return <ResumeTab />;
    }
  };

  return (
    <div className="page-fade-in space-y-6">
      {/* Back Button & Title */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-3 transition-colors group"
        >
          <span className="w-6 h-6 rounded-lg bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center transition-colors">
            <BackIcon />
          </span>
          <span className="font-medium">Back to Directory</span>
        </button>

        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Employee Profile</h1>
        <p className="text-neutral-500 mt-1 text-sm">View employee information</p>
      </div>

      {/* Profile Header - Same as Admin but NOT editable */}
      <div className="animate-fade-in">
        <ProfileHeader 
          employee={profileData}
          onUpdate={() => {}} // HR cannot edit
          isEditable={false}  // No edit button for HR
          isAdmin={false}
        />
      </div>

      {/* Tabs Section - NO Salary Info for HR */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
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

      {/* View Only Notice */}
      <div className="text-center py-4">
        <p className="text-sm text-neutral-400">
          This is a view-only profile. Contact Admin for any updates.
        </p>
      </div>
    </div>
  );
};

export default EmployeeProfile;
