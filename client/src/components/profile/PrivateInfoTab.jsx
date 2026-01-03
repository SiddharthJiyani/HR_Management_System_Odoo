import React, { useState } from 'react';
import { Card, Input } from '../ui';

const PrivateInfoTab = ({ data, onUpdate, isEditable = true }) => {
  const [privateInfo, setPrivateInfo] = useState({
    nationality: data?.nationality || '',
    personalEmail: data?.personalEmail || '',
    maritalStatus: data?.maritalStatus || '',
    residingAddress: data?.residingAddress || '',
    bankDetails: data?.bankDetails || {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      panNo: '',
      uanNo: '',
      empCode: ''
    },
  });

  const handleUpdateField = (field, value) => {
    setPrivateInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBankDetailChange = (field, value) => {
    setPrivateInfo(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [field]: value }
    }));
  };

  const handleSave = () => {
    onUpdate?.(privateInfo);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personal Details */}
      <Card>
        <h3 className="font-semibold text-neutral-900 mb-4">Personal Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Nationality</label>
            <input
              type="text"
              value={privateInfo.nationality}
              onChange={(e) => handleUpdateField('nationality', e.target.value)}
              onBlur={handleSave}
              placeholder="Enter nationality"
              disabled={!isEditable}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Personal Email</label>
            <input
              type="email"
              value={privateInfo.personalEmail}
              onChange={(e) => handleUpdateField('personalEmail', e.target.value)}
              onBlur={handleSave}
              placeholder="Enter personal email"
              disabled={!isEditable}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Marital Status</label>
            <select
              value={privateInfo.maritalStatus}
              onChange={(e) => handleUpdateField('maritalStatus', e.target.value)}
              onBlur={handleSave}
              disabled={!isEditable}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            >
              <option value="">Select status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Residing Address</label>
            <textarea
              value={privateInfo.residingAddress}
              onChange={(e) => handleUpdateField('residingAddress', e.target.value)}
              onBlur={handleSave}
              placeholder="Enter residing address"
              rows={2}
              disabled={!isEditable}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 resize-none disabled:bg-neutral-50 disabled:text-neutral-500"
            />
          </div>
        </div>
      </Card>

      {/* Bank Details */}
      <Card>
        <h3 className="font-semibold text-neutral-900 mb-4">Bank Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Bank Name</label>
            <input
              type="text"
              value={privateInfo.bankDetails.bankName}
              onChange={(e) => handleBankDetailChange('bankName', e.target.value)}
              onBlur={handleSave}
              placeholder="Enter bank name"
              disabled={!isEditable}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Account Number</label>
            <input
              type="text"
              value={privateInfo.bankDetails.accountNumber}
              onChange={(e) => handleBankDetailChange('accountNumber', e.target.value)}
              onBlur={handleSave}
              placeholder="Enter account number"
              disabled={!isEditable}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">IFSC Code</label>
            <input
              type="text"
              value={privateInfo.bankDetails.ifscCode}
              onChange={(e) => handleBankDetailChange('ifscCode', e.target.value)}
              onBlur={handleSave}
              placeholder="Enter IFSC code"
              disabled={!isEditable}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Account Holder Name</label>
            <input
              type="text"
              value={privateInfo.bankDetails.accountHolderName}
              onChange={(e) => handleBankDetailChange('accountHolderName', e.target.value)}
              onBlur={handleSave}
              placeholder="Enter account holder name"
              disabled={!isEditable}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">PAN No</label>
            <input
              type="text"
              value={privateInfo.bankDetails.panNo}
              onChange={(e) => handleBankDetailChange('panNo', e.target.value)}
              onBlur={handleSave}
              placeholder="Enter PAN number"
              disabled={!isEditable}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">UAN No</label>
            <input
              type="text"
              value={privateInfo.bankDetails.uanNo}
              onChange={(e) => handleBankDetailChange('uanNo', e.target.value)}
              onBlur={handleSave}
              placeholder="Enter UAN number"
              disabled={!isEditable}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Employee Code</label>
            <input
              type="text"
              value={privateInfo.bankDetails.empCode}
              onChange={(e) => handleBankDetailChange('empCode', e.target.value)}
              onBlur={handleSave}
              placeholder="Enter employee code"
              disabled={!isEditable}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrivateInfoTab;
