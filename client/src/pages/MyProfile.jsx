import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Button, Card } from '../components/ui';
import { ProfileHeader, ResumeTab, PrivateInfoTab } from '../components/profile';
import { employeeAPI } from '../services/api';
import { useAuth } from '../context';

// HR's own Salary View - Read Only, shows only totals
const HRSalaryView = ({ salary }) => {
  if (!salary) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-700 mb-2">Salary Information</h3>
        <p className="text-neutral-500">Salary details not available</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-semibold text-neutral-900 mb-5">My Salary Information</h3>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <p className="text-xs text-neutral-500 mb-1">Monthly Salary (CTC)</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{(salary.monthlyWage || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <p className="text-xs text-neutral-500 mb-1">Annual Salary</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{(salary.yearlyWage || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-primary-50 to-amber-50 rounded-xl border border-primary-100">
          <p className="text-xs text-neutral-500 mb-1">Net Salary</p>
          <p className="text-2xl font-bold text-primary-600">
            ₹{(salary.netSalary || 0).toLocaleString()}
          </p>
        </div>
      </div>
      <p className="text-sm text-neutral-500 mt-4 text-center">
        Contact Admin for detailed salary breakdown
      </p>
    </Card>
  );
};

const MyProfile = () => {
  const { user, isAdmin, isHR } = useAuth();
  const [activeTab, setActiveTab] = useState('resume');
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch employee profile data
  const fetchProfileData = useCallback(async () => {
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
      try {
        const salaryResponse = await employeeAPI.getMySalary();
        if (salaryResponse.success) {
          setSalaryData(salaryResponse.data?.salary || salaryResponse.data);
        }
      } catch (salaryErr) {
        console.log('Salary fetch error (may not be set up):', salaryErr);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await employeeAPI.updateMyProfile(updatedData);
      if (response.success) {
        setEmployeeData(response.data);
        alert('Profile updated successfully!');
      } else {
        alert(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
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

        {activeTab === 'salary' && (
          <HRSalaryView salary={salaryData} />
        )}
      </div>
    </div>
  );
};

export default MyProfile;

