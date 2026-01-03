import React, { useState } from 'react';
import { Card, Avatar, Button, Input, Badge } from '../components/ui';

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MyProfile = ({ user, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    emergencyPhone: user?.emergencyPhone || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await onSave?.(formData);
      setHasChanges(false);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-fade-in space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} icon={<BackIcon />}>
          Back
        </Button>
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {saveMessage.text}
            </span>
          )}
          {hasChanges && (
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={isSaving}
              icon={<SaveIcon />}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 h-28 bg-gradient-to-br from-primary-300 to-primary-500 opacity-30" />
        
        <div className="relative pt-12 pb-6 px-6 text-center">
          {/* Avatar with Edit Button */}
          <div className="relative inline-block mb-4">
            <Avatar 
              src={user?.avatar}
              name={user?.name}
              size="xl"
              className="ring-4 ring-white shadow-soft-lg"
            />
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-soft flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
              <CameraIcon />
            </button>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            {user?.name}
          </h1>
          <p className="text-neutral-500">{user?.role}</p>
          {user?.department && (
            <Badge variant="primary" className="mt-2">
              {user?.department}
            </Badge>
          )}
        </div>
      </Card>

      {/* Personal Information */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">
          Personal Information
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input 
            label="Full Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your full name"
          />
          <Input 
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter your email"
          />
          <Input 
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
          <Input 
            label="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter your address"
          />
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">
          Emergency Contact
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input 
            label="Contact Name"
            value={formData.emergencyContact}
            onChange={(e) => handleChange('emergencyContact', e.target.value)}
            placeholder="Enter emergency contact name"
          />
          <Input 
            label="Contact Phone"
            type="tel"
            value={formData.emergencyPhone}
            onChange={(e) => handleChange('emergencyPhone', e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </Card>

      {/* Employment Info (Read Only) */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">
          Employment Information
          <span className="ml-2 text-sm font-normal text-neutral-400">
            (Read Only)
          </span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input 
            label="Employee ID"
            value={user?.employeeId || 'EMP001'}
            readOnly
          />
          <Input 
            label="Department"
            value={user?.department || 'Engineering'}
            readOnly
          />
          <Input 
            label="Role"
            value={user?.role || 'Software Engineer'}
            readOnly
          />
          <Input 
            label="Join Date"
            value={user?.joinDate || 'January 15, 2023'}
            readOnly
          />
        </div>
      </Card>

      {/* Password Section */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">
          Security
        </h2>
        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
          <div>
            <p className="font-medium text-neutral-900">Password</p>
            <p className="text-sm text-neutral-500">Last changed 30 days ago</p>
          </div>
          <Button variant="outline" size="sm">
            Change Password
          </Button>
        </div>
      </Card>

      {/* Save Button - Mobile */}
      {hasChanges && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden">
          <Button 
            variant="primary" 
            className="w-full"
            onClick={handleSave}
            disabled={isSaving}
            icon={<SaveIcon />}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyProfile;

