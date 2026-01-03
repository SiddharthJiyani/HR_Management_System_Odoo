import React, { useState } from 'react';
import { Card, Avatar, Input, Badge } from '../ui';

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

const ProfileHeader = ({ 
  employee, 
  onUpdate, 
  isEditable = true,
  isAdmin = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    loginId: employee?.loginId || employee?.employeeId || '',
    email: employee?.email || '',
    mobile: employee?.phone || '',
    company: employee?.company || 'Dayflow Inc.',
    department: employee?.department || '',
    manager: employee?.manager || '',
    location: employee?.location || 'San Francisco, CA',
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
      {/* Smooth Background Gradient */}
      <div className="absolute inset-0 h-32 bg-gradient-to-br from-primary-100 via-primary-200/50 to-bg-end opacity-60" />
      <div className="absolute inset-0 h-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-300/20 via-transparent to-transparent" />
      
      <div className="relative p-8">
        {/* Edit Toggle Button */}
        {isEditable && (
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`
              absolute top-6 right-6 
              p-2.5 rounded-xl 
              backdrop-blur-sm
              border border-white/50
              shadow-soft
              transition-all duration-300 ease-out
              ${isEditing 
                ? 'bg-success text-white hover:bg-success/90' 
                : 'bg-white/90 text-neutral-600 hover:text-primary-600 hover:bg-white hover:shadow-soft-lg'
              }
            `}
          >
            {isEditing ? <CheckIcon /> : <EditIcon />}
          </button>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Panel - Avatar & Basic Info */}
          <div className="flex flex-col items-center lg:items-start lg:w-[280px] flex-shrink-0">
            {/* Avatar with Edit */}
            <div className="relative group mb-5">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full opacity-20 group-hover:opacity-30 blur transition-opacity" />
              <Avatar 
                src={employee?.avatar}
                name={formData.name}
                size="xl"
                className="relative w-24 h-24 text-2xl ring-4 ring-white shadow-soft-lg transition-transform duration-300 group-hover:scale-105"
              />
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full shadow-soft flex items-center justify-center text-white hover:scale-110 transition-transform duration-200">
                  <CameraIcon />
                </button>
              )}
            </div>

            {/* Name */}
            <div className="w-full text-center lg:text-left mb-4">
              {isEditing ? (
                <Input 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full"
                  placeholder="Full Name"
                />
              ) : (
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  {formData.name}
                </h1>
              )}
            </div>

            {/* Quick Info Fields */}
            <div className="w-full space-y-4">
              <InfoField 
                label="Login ID" 
                value={formData.loginId}
                isEditing={isEditing}
                onChange={(v) => handleChange('loginId', v)}
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

          {/* Right Panel - Company Info */}
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

            {/* Role Badge */}
            {isAdmin && (
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <Badge variant="primary" size="md" className="shadow-sm">
                  <span className="mr-1">👑</span> Administrator
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Info Field Component with improved styling
const InfoField = ({ label, value, isEditing, onChange }) => (
  <div className="group">
    <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5 transition-colors group-hover:text-neutral-500">
      {label}
    </p>
    {isEditing ? (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-white/90 border border-neutral-200 rounded-xl text-sm text-neutral-800 font-medium focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all duration-200"
      />
    ) : (
      <p className="text-sm font-semibold text-neutral-800 transition-colors">
        {value || '—'}
      </p>
    )}
  </div>
);

export default ProfileHeader;
