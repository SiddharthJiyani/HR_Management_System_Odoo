import React, { useState, useEffect } from 'react';
import { Tabs, Button } from '../components/ui';
import { ProfileHeader, ResumeTab, PrivateInfoTab } from '../components/profile';
import { SalaryInfoTab } from '../components/salary';
import { employeeAPI } from '../services/api';
import { useAuth } from '../context';

const MyProfile = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('resume');
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch employee profile data
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch profile data
      const profileResponse = await employeeAPI.getMyProfile();
      if (profileResponse.success) {
        setEmployeeData(profileResponse.data);
      } else {
        setError(profileResponse.message || 'Failed to load profile');
      }

      // Fetch salary data
      const salaryResponse = await employeeAPI.getMySalary();
      if (salaryResponse.success) {
        setSalaryData(salaryResponse.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await employeeAPI.updateMyProfile(updatedData);
      if (response.success) {
        setEmployeeData(response.data);
        // Show success message
        alert('Profile updated successfully!');
      } else {
        alert(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  const handleSalaryUpdate = async (updatedSalary) => {
    try {
      const response = await employeeAPI.updateSalary(employeeData._id, updatedSalary);
      if (response.success) {
        setSalaryData(response.data);
        alert('Salary updated successfully!');
      } else {
        alert(response.message || 'Failed to update salary');
      }
    } catch (err) {
      console.error('Error updating salary:', err);
      alert('Failed to update salary');
    }
  };

  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'private', label: 'Private Information' },
    { id: 'salary', label: 'Salary Information' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-error mb-4">{error}</p>
            <Button onClick={fetchProfileData}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Header */}
      <ProfileHeader 
        employee={employeeData}
        onUpdate={handleProfileUpdate}
        isEditable={true}
        isAdmin={isAdmin}
      />

      {/* Tabs Navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'resume' && (
          <ResumeTab
            data={employeeData}
            onUpdate={handleProfileUpdate}
            isEditable={true}
          />
        )}

        {activeTab === 'private' && (
          <PrivateInfoTab
            data={employeeData}
            onUpdate={handleProfileUpdate}
            isEditable={true}
          />
        )}

        {activeTab === 'salary' && salaryData && (
          <SalaryInfoTab
            data={salaryData}
            onUpdate={handleSalaryUpdate}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
};

export default MyProfile;

