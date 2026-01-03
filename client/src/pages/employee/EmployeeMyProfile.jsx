import React, { useState, useEffect } from 'react';
import { Card, Avatar, Badge, Tabs, Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI } from '../../services/api';

// Icons
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Profile Header
const ProfileHeader = ({ employee, onUpdate, isEditing, setIsEditing }) => {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    jobPosition: employee?.jobPosition || employee?.designation || '',
    email: employee?.email || '',
    mobile: employee?.phone || '',
    company: employee?.company || 'Dayflow Inc.',
    department: employee?.department || '',
    manager: employee?.manager || '',
    location: employee?.location || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate?.(formData);
    setIsEditing(false);
  };

  return (
    <Card className="relative overflow-hidden" padding="none">
      <div className="absolute inset-0 h-28 bg-gradient-to-br from-primary-100 via-primary-200/50 to-bg-end opacity-60" />
      
      <div className="relative p-8">
        {/* Edit Button */}
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`
            absolute top-6 right-6 
            p-2.5 rounded-xl 
            backdrop-blur-sm border border-white/50 shadow-soft
            transition-all duration-300
            ${isEditing 
              ? 'bg-success text-white hover:bg-success/90' 
              : 'bg-white/90 text-neutral-600 hover:text-primary-600'
            }
          `}
        >
          {isEditing ? <CheckIcon /> : <EditIcon />}
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left - Avatar & Basic Info */}
          <div className="flex flex-col items-center lg:items-start lg:w-[280px] flex-shrink-0">
            {/* Avatar */}
            <div className="relative group mb-5">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full opacity-20 group-hover:opacity-30 blur transition-opacity" />
              <Avatar 
                src={employee?.avatar}
                name={formData.name}
                size="xl"
                className="relative w-24 h-24 text-2xl ring-4 ring-white shadow-soft-lg"
              />
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full shadow-soft flex items-center justify-center text-white hover:scale-110 transition-transform">
                  <CameraIcon />
                </button>
              )}
            </div>

            {/* Name */}
            <div className="w-full text-center lg:text-left mb-4">
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-white/90 border border-neutral-200 rounded-xl text-lg font-bold text-neutral-900 focus:outline-none focus:border-primary-400"
                />
              ) : (
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  {formData.name}
                </h1>
              )}
            </div>

            {/* Info Fields */}
            <div className="w-full space-y-4">
              <InfoField 
                label="Job Position" 
                value={formData.jobPosition}
                isEditing={isEditing}
                onChange={(v) => handleChange('jobPosition', v)}
              />
              <InfoField 
                label="Email" 
                value={formData.email}
                isEditing={isEditing}
                onChange={(v) => handleChange('email', v)}
              />
              <InfoField 
                label="Mobile" 
                value={formData.mobile}
                isEditing={isEditing}
                onChange={(v) => handleChange('mobile', v)}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-neutral-200 to-transparent" />

          {/* Right - Company Info */}
          <div className="flex-1 pt-2">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-6">
              Company Information
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
              <InfoField 
                label="Company" 
                value={formData.company}
                isEditing={isEditing}
                onChange={(v) => handleChange('company', v)}
              />
              <InfoField 
                label="Department" 
                value={formData.department}
                isEditing={isEditing}
                onChange={(v) => handleChange('department', v)}
              />
              <InfoField 
                label="Manager" 
                value={formData.manager}
                isEditing={isEditing}
                onChange={(v) => handleChange('manager', v)}
              />
              <InfoField 
                label="Location" 
                value={formData.location}
                isEditing={isEditing}
                onChange={(v) => handleChange('location', v)}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Info Field
const InfoField = ({ label, value, isEditing, onChange }) => (
  <div className="group">
    <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
      {label}
    </p>
    {isEditing ? (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white/90 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-primary-400"
      />
    ) : (
      <p className="text-sm font-semibold text-neutral-800">
        {value || '—'}
      </p>
    )}
  </div>
);

// Private Info Tab with Bank Details
const PrivateInfoTab = ({ data, onUpdate, isEditing }) => {
  const [privateInfo, setPrivateInfo] = useState({
    dateOfBirth: data?.dateOfBirth || '',
    residingAddress: data?.address || '',
    nationality: data?.nationality || '',
    personalEmail: data?.personalEmail || '',
    gender: data?.gender || '',
    maritalStatus: data?.maritalStatus || '',
    dateOfJoining: data?.dateOfJoining || '',
    // Bank Details (hardcoded fields)
    accountNumber: data?.bankDetails?.accountNumber || '',
    bankName: data?.bankDetails?.bankName || '',
    ifscCode: data?.bankDetails?.ifscCode || '',
    panNo: data?.bankDetails?.panNo || '',
    uanNo: data?.bankDetails?.uanNo || '',
    empCode: data?.employeeId || '',
  });

  const handleChange = (field, value) => {
    setPrivateInfo(prev => ({ ...prev, [field]: value }));
    onUpdate?.({ ...privateInfo, [field]: value });
  };

  const InputField = ({ label, field, type = 'text' }) => (
    <div className="group">
      <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={privateInfo[field] || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full px-4 py-3 bg-white/80 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
        />
      ) : (
        <div className="px-4 py-3 bg-neutral-50/50 rounded-xl border border-neutral-100">
          <p className="text-sm font-medium text-neutral-800">
            {privateInfo[field] || '—'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Personal Details */}
      <Card>
        <h3 className="font-semibold text-neutral-900 mb-6">Personal Details</h3>
        <div className="space-y-4">
          <InputField label="Date of Birth" field="dateOfBirth" type="date" />
          <InputField label="Residing Address" field="residingAddress" />
          <InputField label="Nationality" field="nationality" />
          <InputField label="Personal Email" field="personalEmail" type="email" />
          <InputField label="Gender" field="gender" />
          <InputField label="Marital Status" field="maritalStatus" />
          <InputField label="Date of Joining" field="dateOfJoining" type="date" />
        </div>
      </Card>

      {/* Bank Details */}
      <Card>
        <h3 className="font-semibold text-neutral-900 mb-6">Bank Details</h3>
        <div className="space-y-4">
          <InputField label="Account Number" field="accountNumber" />
          <InputField label="Bank Name" field="bankName" />
          <InputField label="IFSC Code" field="ifscCode" />
          <InputField label="PAN No" field="panNo" />
          <InputField label="UAN No" field="uanNo" />
          <InputField label="Emp Code" field="empCode" />
        </div>
      </Card>
    </div>
  );
};

// Resume Tab
const ResumeTab = () => (
  <Card className="text-center py-12">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
      <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-neutral-700 mb-2">No Resume Uploaded</h3>
    <p className="text-neutral-500 mb-4">Upload your resume to keep it on file</p>
    <Button variant="outline">
      Upload Resume
    </Button>
  </Card>
);

// Security Tab
const SecurityTab = ({ isEditing }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert('Password change functionality coming soon!');
  };

  return (
    <div className="max-w-md animate-fade-in">
      <Card>
        <h3 className="font-semibold text-neutral-900 mb-6">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 bg-white/80 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20"
              placeholder="Confirm new password"
            />
          </div>
          <Button variant="primary" className="w-full mt-4" onClick={handleChangePassword}>
            Update Password
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Salary Info Tab (view only for employees)
const SalaryInfoTab = ({ data }) => (
  <Card>
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-neutral-700 mb-2">Salary Information</h3>
      <p className="text-neutral-500">Contact HR to view your salary details</p>
    </div>
  </Card>
);

const EmployeeMyProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('privateInfo');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        try {
          const response = await employeeAPI.getMyProfile();
          
          if (response.success && response.data) {
            const emp = response.data;
            setProfileData({
              id: emp._id,
              name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
              email: emp.email,
              phone: emp.phone || '',
              jobPosition: emp.designation || emp.role || 'Employee',
              department: emp.department || '',
              company: 'Dayflow Inc.',
              manager: emp.manager || '',
              location: emp.address?.city ? `${emp.address.city}, ${emp.address.state || ''}`.trim() : '',
              avatar: emp.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.firstName || 'U')}&background=FFD966&color=000`,
              dateOfBirth: emp.dateOfBirth || '',
              address: emp.address ? `${emp.address.street || ''}, ${emp.address.city || ''}, ${emp.address.state || ''} ${emp.address.zipCode || ''}`.trim() : '',
              nationality: emp.nationality || '',
              personalEmail: emp.personalEmail || '',
              gender: emp.gender || '',
              maritalStatus: emp.maritalStatus || '',
              dateOfJoining: emp.dateOfJoining ? new Date(emp.dateOfJoining).toISOString().split('T')[0] : '',
              employeeId: emp.employeeId || '',
              bankDetails: emp.bankDetails || {},
            });
            return;
          }
        } catch (apiError) {
          console.log('API error, using fallback');
        }

        // Fallback to user data
        setProfileData({
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Employee',
          email: user?.email || '',
          phone: '',
          jobPosition: 'Employee',
          department: 'General',
          company: 'Dayflow Inc.',
          manager: '',
          location: '',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'E')}&background=FFD966&color=000`,
          dateOfBirth: '',
          address: '',
          nationality: '',
          personalEmail: '',
          gender: '',
          maritalStatus: '',
          dateOfJoining: '',
          employeeId: '',
          bankDetails: {},
        });

      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileUpdate = (data) => {
    console.log('Profile updated:', data);
    // TODO: Call API to update profile
  };

  const handlePrivateInfoUpdate = (data) => {
    console.log('Private info updated:', data);
    // TODO: Call API to update private info
  };

  // Tabs
  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'privateInfo', label: 'Private Info' },
    { id: 'salaryInfo', label: 'Salary Info' },
    { id: 'security', label: 'Security' },
  ];

  const renderTabContent = () => {
    if (loading) {
      return (
        <Card className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            <div className="h-12 bg-neutral-200 rounded" />
            <div className="h-12 bg-neutral-200 rounded" />
            <div className="h-12 bg-neutral-200 rounded" />
          </div>
        </Card>
      );
    }

    switch (activeTab) {
      case 'resume':
        return <ResumeTab />;
      case 'privateInfo':
        return (
          <PrivateInfoTab 
            data={profileData}
            onUpdate={handlePrivateInfoUpdate}
            isEditing={isEditing}
          />
        );
      case 'salaryInfo':
        return <SalaryInfoTab data={profileData} />;
      case 'security':
        return <SecurityTab isEditing={isEditing} />;
      default:
        return <ResumeTab />;
    }
  };

  return (
    <div className="page-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
        <p className="text-neutral-500 mt-1">View and manage your personal information</p>
      </div>

      {/* Profile Header */}
      {loading ? (
        <Card className="animate-pulse">
          <div className="flex gap-8">
            <div className="w-24 h-24 bg-neutral-200 rounded-full" />
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-neutral-200 rounded w-1/3" />
              <div className="h-4 bg-neutral-200 rounded w-1/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
            </div>
          </div>
        </Card>
      ) : (
        <ProfileHeader 
          employee={profileData}
          onUpdate={handleProfileUpdate}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      )}

      {/* Tabs */}
      <Tabs 
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {/* Tab Content */}
      <div key={activeTab}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EmployeeMyProfile;

