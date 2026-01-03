import React, { useState, useEffect, useCallback } from 'react';
import { Card, Avatar, Badge, Tabs, Button } from '../../components/ui';
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

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CancelIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Editable Input Field Component - Fixed to prevent re-render issues
const EditableField = ({ label, value, onChange, isEditing, type = 'text', disabled = false }) => {
  // Use local state to prevent re-render issues
  const [localValue, setLocalValue] = useState(value || '');

  // Sync with parent value when not editing or value changes externally
  useEffect(() => {
    setLocalValue(value || '');
  }, [value, isEditing]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <div className="group">
      <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {isEditing && !disabled ? (
        <input
          type={type}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
        />
      ) : (
        <div className="px-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
          <p className="text-sm font-medium text-neutral-800">
            {value || '—'}
          </p>
        </div>
      )}
    </div>
  );
};

// Profile Header Component
const ProfileHeader = ({ employee, isEditing, setIsEditing, onSave, saving }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        designation: employee.designation || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
      });
    }
  }, [employee]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleCancel = () => {
    // Reset to original values
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        designation: employee.designation || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
      });
    }
    setIsEditing(false);
  };

  const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Employee';

  return (
    <Card className="relative overflow-hidden" padding="none">
      <div className="absolute inset-0 h-28 bg-gradient-to-br from-primary-100 via-primary-200/50 to-bg-end opacity-60" />
      
      <div className="relative p-6">
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="p-2 rounded-xl bg-white/90 text-neutral-600 hover:bg-neutral-100 border border-neutral-200 transition-all"
                disabled={saving}
              >
                <CancelIcon />
              </button>
              <button
                onClick={handleSave}
                className="p-2 rounded-xl bg-success text-white hover:bg-success/90 transition-all"
                disabled={saving}
              >
                {saving ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <SaveIcon />
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-xl bg-white/90 text-neutral-600 hover:text-primary-600 border border-neutral-200 transition-all"
            >
              <EditIcon />
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Left - Avatar & Basic Info */}
          <div className="flex flex-col items-center lg:items-start lg:w-64 flex-shrink-0">
            {/* Avatar */}
            <div className="relative group mb-4">
              <Avatar 
                src={employee?.profilePhoto}
                name={fullName}
                size="xl"
                className="w-20 h-20 text-xl ring-4 ring-white shadow-lg"
              />
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-400 rounded-full shadow flex items-center justify-center text-neutral-900 hover:bg-primary-500 transition-colors">
                  <CameraIcon />
                </button>
              )}
            </div>

            {/* Name */}
            {isEditing ? (
              <div className="w-full space-y-2 mb-4">
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  placeholder="First Name"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-400"
                />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  placeholder="Last Name"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-400"
                />
              </div>
            ) : (
              <h1 className="text-xl font-bold text-neutral-900 mb-1 text-center lg:text-left">{fullName}</h1>
            )}

            {/* Basic Info */}
            <div className="w-full space-y-3">
              <EditableField
                label="Job Position"
                value={formData.designation}
                onChange={(v) => handleFieldChange('designation', v)}
                isEditing={isEditing}
              />
              <EditableField
                label="Email"
                value={formData.email}
                onChange={(v) => handleFieldChange('email', v)}
                isEditing={isEditing}
                type="email"
                disabled={true} // Email usually shouldn't be editable
              />
              <EditableField
                label="Mobile"
                value={formData.phone}
                onChange={(v) => handleFieldChange('phone', v)}
                isEditing={isEditing}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-neutral-200 to-transparent" />

          {/* Right - Company Info */}
          <div className="flex-1 pt-2">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
              Company Information
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="px-4 py-2.5 bg-neutral-50 rounded-xl">
                <p className="text-xs text-neutral-500 mb-1">Company</p>
                <p className="text-sm font-medium text-neutral-800">Dayflow Inc.</p>
              </div>
              <EditableField
                label="Department"
                value={formData.department}
                onChange={(v) => handleFieldChange('department', v)}
                isEditing={isEditing}
              />
              <div className="px-4 py-2.5 bg-neutral-50 rounded-xl">
                <p className="text-xs text-neutral-500 mb-1">Employee ID</p>
                <p className="text-sm font-medium text-neutral-800">{employee?.employeeId || '—'}</p>
              </div>
              <div className="px-4 py-2.5 bg-neutral-50 rounded-xl">
                <p className="text-xs text-neutral-500 mb-1">Join Date</p>
                <p className="text-sm font-medium text-neutral-800">
                  {employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Private Info Tab
const PrivateInfoTab = ({ data, isEditing, onSave, saving }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (data) {
      setFormData({
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
        nationality: data.nationality || '',
        gender: data.gender || '',
        maritalStatus: data.maritalStatus || '',
        personalEmail: data.personalEmail || '',
        residingAddress: data.residingAddress || '',
        // Bank Details
        bankName: data.bankDetails?.bankName || '',
        accountNumber: data.bankDetails?.accountNumber || '',
        ifscCode: data.bankDetails?.ifscCode || '',
        panNo: data.bankDetails?.panNo || '',
        uanNo: data.bankDetails?.uanNo || '',
      });
    }
  }, [data]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({
      dateOfBirth: formData.dateOfBirth,
      nationality: formData.nationality,
      gender: formData.gender,
      maritalStatus: formData.maritalStatus,
      personalEmail: formData.personalEmail,
      residingAddress: formData.residingAddress,
      bankDetails: {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        panNo: formData.panNo,
        uanNo: formData.uanNo,
      }
    });
  };

  return (
    <div className="space-y-6">
      {isEditing && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card>
          <h3 className="font-semibold text-neutral-900 mb-5">Personal Details</h3>
          <div className="space-y-4">
            <EditableField
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(v) => handleFieldChange('dateOfBirth', v)}
              isEditing={isEditing}
              type="date"
            />
            <EditableField
              label="Nationality"
              value={formData.nationality}
              onChange={(v) => handleFieldChange('nationality', v)}
              isEditing={isEditing}
            />
            <div className="group">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Gender
              </label>
              {isEditing ? (
                <select
                  value={formData.gender}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-primary-400"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              ) : (
                <div className="px-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <p className="text-sm font-medium text-neutral-800 capitalize">
                    {formData.gender || '—'}
                  </p>
                </div>
              )}
            </div>
            <div className="group">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Marital Status
              </label>
              {isEditing ? (
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-primary-400"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              ) : (
                <div className="px-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <p className="text-sm font-medium text-neutral-800">
                    {formData.maritalStatus || '—'}
                  </p>
                </div>
              )}
            </div>
            <EditableField
              label="Personal Email"
              value={formData.personalEmail}
              onChange={(v) => handleFieldChange('personalEmail', v)}
              isEditing={isEditing}
              type="email"
            />
            <EditableField
              label="Address"
              value={formData.residingAddress}
              onChange={(v) => handleFieldChange('residingAddress', v)}
              isEditing={isEditing}
            />
          </div>
        </Card>

        {/* Bank Details */}
        <Card>
          <h3 className="font-semibold text-neutral-900 mb-5">Bank Details</h3>
          <div className="space-y-4">
            <EditableField
              label="Bank Name"
              value={formData.bankName}
              onChange={(v) => handleFieldChange('bankName', v)}
              isEditing={isEditing}
            />
            <EditableField
              label="Account Number"
              value={formData.accountNumber}
              onChange={(v) => handleFieldChange('accountNumber', v)}
              isEditing={isEditing}
            />
            <EditableField
              label="IFSC Code"
              value={formData.ifscCode}
              onChange={(v) => handleFieldChange('ifscCode', v)}
              isEditing={isEditing}
            />
            <EditableField
              label="PAN Number"
              value={formData.panNo}
              onChange={(v) => handleFieldChange('panNo', v)}
              isEditing={isEditing}
            />
            <EditableField
              label="UAN Number"
              value={formData.uanNo}
              onChange={(v) => handleFieldChange('uanNo', v)}
              isEditing={isEditing}
            />
            <div className="px-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
              <p className="text-xs text-neutral-500 mb-1">Employee Code</p>
              <p className="text-sm font-medium text-neutral-800">{data?.employeeId || '—'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Salary Info Tab - Employee View (Read Only, Own Salary)
const SalaryInfoTab = ({ data, canViewDetails = false }) => {
  const salary = data?.salary || {};
  const components = salary.components || {};

  // If employee can't view details, show only total
  if (!canViewDetails) {
    return (
      <Card>
        <h3 className="font-semibold text-neutral-900 mb-5">Salary Information</h3>
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
  }

  // Full details view for Admin or own profile
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <p className="text-xs text-neutral-500 mb-1">Monthly CTC</p>
          <p className="text-xl font-bold text-green-600">
            ₹{(salary.monthlyWage || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <p className="text-xs text-neutral-500 mb-1">Annual CTC</p>
          <p className="text-xl font-bold text-blue-600">
            ₹{(salary.yearlyWage || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
          <p className="text-xs text-neutral-500 mb-1">Total Deductions</p>
          <p className="text-xl font-bold text-red-600">
            ₹{(salary.totalDeductions || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-primary-50 to-amber-50 rounded-xl border border-primary-100">
          <p className="text-xs text-neutral-500 mb-1">Net Salary</p>
          <p className="text-xl font-bold text-primary-600">
            ₹{(salary.netSalary || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Salary Components */}
        <Card>
          <h3 className="font-semibold text-neutral-900 mb-5">Salary Components</h3>
          <div className="space-y-3">
            <SalaryRow label="Basic Salary" amount={components.basicSalary?.amount} percentage={components.basicSalary?.percentage} />
            <SalaryRow label="House Rent Allowance" amount={components.houseRentAllowance?.amount} percentage={components.houseRentAllowance?.percentage} />
            <SalaryRow label="Standard Allowance" amount={components.standardAllowance?.amount} percentage={components.standardAllowance?.percentage} />
            <SalaryRow label="Performance Bonus" amount={components.performanceBonus?.amount} percentage={components.performanceBonus?.percentage} />
            <SalaryRow label="Leave Travel Allowance" amount={components.leaveTravelAllowance?.amount} percentage={components.leaveTravelAllowance?.percentage} />
            <SalaryRow label="Fixed Allowance" amount={components.fixedAllowance?.amount} percentage={components.fixedAllowance?.percentage} />
            <div className="pt-3 border-t border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neutral-900">Gross Salary</span>
                <span className="font-bold text-lg text-green-600">₹{(salary.grossSalary || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Deductions */}
        <Card>
          <h3 className="font-semibold text-neutral-900 mb-5">Deductions</h3>
          <div className="space-y-3">
            <SalaryRow 
              label="Employee PF" 
              amount={salary.deductions?.providentFund?.employee?.amount} 
              percentage={salary.deductions?.providentFund?.employee?.percentage}
              isDeduction 
            />
            <SalaryRow 
              label="Employer PF" 
              amount={salary.deductions?.providentFund?.employer?.amount} 
              percentage={salary.deductions?.providentFund?.employer?.percentage}
            />
            <SalaryRow 
              label="Professional Tax" 
              amount={salary.deductions?.professionalTax?.amount}
              isDeduction 
            />
            <div className="pt-3 border-t border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neutral-900">Total Deductions</span>
                <span className="font-bold text-lg text-red-600">₹{(salary.totalDeductions || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-200 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neutral-900">Net Salary (Take Home)</span>
                <span className="font-bold text-xl text-primary-600">₹{(salary.netSalary || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Salary Row Component
const SalaryRow = ({ label, amount, percentage, isDeduction = false }) => (
  <div className="flex justify-between items-center py-2">
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-600">{label}</span>
      {percentage && (
        <span className="text-xs text-neutral-400">({percentage}%)</span>
      )}
    </div>
    <span className={`font-medium ${isDeduction ? 'text-red-600' : 'text-neutral-900'}`}>
      {isDeduction ? '-' : ''}₹{(amount || 0).toLocaleString()}
    </span>
  </div>
);

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
    <Button variant="outline">Upload Resume</Button>
  </Card>
);

// Security Tab
const SecurityTab = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (passwords.newPassword.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }
    setSaving(true);
    // TODO: Implement password change API
    setTimeout(() => {
      alert('Password change functionality coming soon!');
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-md">
      <Card>
        <h3 className="font-semibold text-neutral-900 mb-5">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"
              placeholder="Confirm new password"
            />
          </div>
          <Button variant="primary" className="w-full mt-4" onClick={handleChangePassword} disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Main Employee My Profile Component
const EmployeeMyProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('privateInfo');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getMyProfile();
      
      if (response.success && response.data) {
        setProfileData(response.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Set fallback data
      setProfileData({
        firstName: user?.firstName || 'Employee',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
        designation: 'Employee',
        department: 'General',
        employeeId: '',
        joinDate: null,
        salary: {},
        bankDetails: {},
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Save profile header changes
  const handleHeaderSave = async (formData) => {
    try {
      setSaving(true);
      const response = await employeeAPI.updateMyProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        designation: formData.designation,
        department: formData.department,
      });
      
      if (response.success) {
        setProfileData(prev => ({ ...prev, ...formData }));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Save private info changes
  const handlePrivateInfoSave = async (formData) => {
    try {
      setSaving(true);
      const response = await employeeAPI.updateMyProfile({
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        personalEmail: formData.personalEmail,
        residingAddress: formData.residingAddress,
        bankDetails: formData.bankDetails,
      });
      
      if (response.success) {
        setProfileData(prev => ({ ...prev, ...formData }));
        alert('Private info updated successfully!');
      } else {
        alert(response.message || 'Failed to update');
      }
    } catch (err) {
      console.error('Error updating private info:', err);
      alert('Failed to update private info');
    } finally {
      setSaving(false);
    }
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
          <div className="h-6 bg-neutral-200 rounded w-1/4 mb-6" />
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
            isEditing={isEditing}
            onSave={handlePrivateInfoSave}
            saving={saving}
          />
        );
      case 'salaryInfo':
        // Employee can view their own salary details (read-only)
        return <SalaryInfoTab data={profileData} canViewDetails={true} />;
      case 'security':
        return <SecurityTab />;
      default:
        return <ResumeTab />;
    }
  };

  return (
    <div className="page-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
          <p className="text-neutral-500 mt-1">View and manage your personal information</p>
        </div>
        {activeTab === 'privateInfo' && !isEditing && (
          <Button variant="outline" icon={<EditIcon />} onClick={() => setIsEditing(true)}>
            Edit Info
          </Button>
        )}
        {activeTab === 'privateInfo' && isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel Edit
          </Button>
        )}
      </div>

      {/* Profile Header */}
      {loading ? (
        <Card className="animate-pulse">
          <div className="flex gap-6">
            <div className="w-20 h-20 bg-neutral-200 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-neutral-200 rounded w-1/3" />
              <div className="h-4 bg-neutral-200 rounded w-1/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
            </div>
          </div>
        </Card>
      ) : (
        <ProfileHeader 
          employee={profileData}
          isEditing={isEditing && activeTab !== 'privateInfo'}
          setIsEditing={setIsEditing}
          onSave={handleHeaderSave}
          saving={saving}
        />
      )}

      {/* Tabs */}
      <Tabs 
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setIsEditing(false);
        }}
      />

      {/* Tab Content */}
      <div key={activeTab}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EmployeeMyProfile;
