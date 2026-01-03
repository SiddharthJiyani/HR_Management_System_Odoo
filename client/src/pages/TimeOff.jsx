import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Card, Button, Badge, Input, SearchBar, Avatar } from '../components/ui';
import { leaveAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// Balance Card
const BalanceCard = ({ label, days, color }) => {
  const colorClasses = {
    primary: 'text-primary-600',
    info: 'text-info',
  };

  return (
    <div className="text-center">
      <p className={`text-lg font-semibold ${colorClasses[color]}`}>{label}</p>
      <p className="text-neutral-600">{days} Days Available</p>
    </div>
  );
};

// Table Skeleton
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4 px-4 border-b border-neutral-100">
        <div className="flex-1 h-4 bg-neutral-200 rounded w-32" />
        <div className="h-4 bg-neutral-200 rounded w-24" />
        <div className="h-4 bg-neutral-200 rounded w-24" />
        <div className="h-4 bg-neutral-200 rounded w-20" />
        <div className="h-6 bg-neutral-200 rounded w-16" />
      </div>
    ))}
  </div>
);

// Leave Request Row for Employee (no action buttons)
const EmployeeLeaveRow = ({ request }) => {
  const statusVariants = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    cancelled: 'default',
  };

  const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  };

  const typeLabels = {
    annual: 'Paid Time Off',
    vacation: 'Paid Time Off',
    paid: 'Paid Time Off',
    sick: 'Sick Leave',
    unpaid: 'Unpaid Leaves',
    personal: 'Personal',
    casual: 'Casual',
  };

  return (
    <tr className="border-b border-neutral-100 hover:bg-white/50 transition-colors">
      <td className="py-4 px-4">
        <span className="text-sm font-medium text-neutral-900">{request.employeeName}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-neutral-700">{request.startDate}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-neutral-700">{request.endDate}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm font-medium text-primary-600">
          {typeLabels[request.type] || request.type}
        </span>
      </td>
      <td className="py-4 px-4">
        <Badge variant={statusVariants[request.status]} size="sm">
          {statusLabels[request.status]}
        </Badge>
      </td>
    </tr>
  );
};

// Leave Request Row for Admin/HR (with action buttons)
const AdminLeaveRow = ({ request, onApprove, onReject, processing }) => {
  const statusVariants = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    cancelled: 'default',
  };

  const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  };

  const typeLabels = {
    annual: 'Paid Time Off',
    vacation: 'Paid Time Off',
    paid: 'Paid Time Off',
    sick: 'Sick Leave',
    unpaid: 'Unpaid Leaves',
    personal: 'Personal',
    casual: 'Casual',
  };

  return (
    <tr className="border-b border-neutral-100 hover:bg-white/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Avatar 
            src={request.avatar} 
            name={request.employeeName} 
            size="sm"
            className="w-9 h-9"
          />
          <div>
            <p className="font-medium text-neutral-900 text-sm">{request.employeeName}</p>
            <p className="text-xs text-neutral-500">{request.department || 'N/A'}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-neutral-700">{request.startDate}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm text-neutral-700">{request.endDate}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm font-medium text-primary-600">
          {typeLabels[request.type] || request.type}
        </span>
      </td>
      <td className="py-4 px-4">
        <Badge variant={statusVariants[request.status]} size="sm">
          {statusLabels[request.status]}
        </Badge>
      </td>
      <td className="py-4 px-4">
        {request.status === 'pending' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReject(request.id)}
              disabled={processing}
              className="w-8 h-8 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
              title="Reject"
            >
              <XIcon />
            </button>
            <button
              onClick={() => onApprove(request.id)}
              disabled={processing}
              className="w-8 h-8 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
              title="Approve"
            >
              <CheckIcon />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

// New Request Modal for Employees
const NewRequestModal = ({ isOpen, onClose, onSubmit, submitting, employeeName }) => {
  const [formData, setFormData] = useState({
    type: 'paid',
    startDate: '',
    endDate: '',
    allocation: '',
    attachment: null,
  });
  const [isClosing, setIsClosing] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleSubmit = () => {
    if (!formData.startDate || !formData.endDate) {
      alert('Please select validity period.');
      return;
    }
    onSubmit(formData);
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 overflow-y-auto"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop - subtle overlay */}
      <div 
        className={`fixed inset-0 bg-neutral-900/25 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        style={{ zIndex: 9999 }}
        onClick={handleClose}
      />
      
      {/* Modal container - centers the modal */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 10000 }}
      >
        <div 
          className={`relative w-full max-w-md transition-all duration-200 ease-out ${
            isClosing 
              ? 'opacity-0 scale-95' 
              : 'opacity-100 scale-100 animate-modal-enter'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">New Time Off Request</h2>
                <p className="text-sm text-neutral-500 mt-0.5">Request leave from your balance</p>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors -mr-2 -mt-1"
              >
                <CloseIcon />
              </button>
            </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Employee */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">Employee</label>
              <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-sm font-medium text-neutral-800">{employeeName}</span>
              </div>
            </div>

            {/* Time off Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">Time Off Type</label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="paid">Paid Time Off</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">Validity Period</label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                />
                <span className="text-sm text-neutral-400 font-medium">to</span>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                />
              </div>
            </div>

            {/* Allocation */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">Allocation</label>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-100 min-w-[80px] text-center">
                  <span className="text-lg font-bold text-primary-600">
                    {calculateDays().toFixed(2)}
                  </span>
                </div>
                <span className="text-sm text-neutral-500">Days</span>
              </div>
            </div>

            {/* Attachment (for sick leave) */}
            {formData.type === 'sick' && (
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1.5">Attachment</label>
                <label className="flex items-center gap-3 px-4 py-3 bg-white border border-dashed border-neutral-300 rounded-xl cursor-pointer hover:bg-neutral-50 hover:border-primary-400 transition-all">
                  <UploadIcon />
                  <span className="text-sm text-neutral-600">
                    {formData.attachment ? formData.attachment.name : 'Upload certificate'}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-neutral-400 mt-1.5">Required for sick leave</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-neutral-100">
            <button 
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              Discard
            </button>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-5 py-3 bg-primary-400 hover:bg-primary-500 text-neutral-900 font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const TimeOff = ({ isAdmin = false, isHR = false }) => {
  const { user } = useAuth();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    paid: 24,
    sick: 10,
  });

  const isAdminOrHR = isAdmin || isHR;
  const employeeName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Employee';

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Fetch leave balance
  const fetchLeaveBalance = useCallback(async () => {
    try {
      const response = await leaveAPI.getBalance();
      if (response.success && response.data) {
        setLeaveBalance({
          paid: response.data.paid?.remaining || 24,
          sick: response.data.sick?.remaining || 10,
        });
      }
    } catch (err) {
      console.log('Could not fetch leave balance:', err);
    }
  }, []);

  // Fetch leave requests
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = isAdminOrHR 
        ? await leaveAPI.getAll() 
        : await leaveAPI.getMyLeaves();

      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        const formattedLeaves = dataArray.map(leave => ({
          id: leave._id,
          employeeName: leave.employeeId?.firstName 
            ? `${leave.employeeId.firstName} ${leave.employeeId.lastName || ''}`.trim()
            : employeeName,
          department: leave.employeeId?.department || 'N/A',
          avatar: leave.employeeId?.profilePhoto || leave.employeeId?.profileImage,
          startDate: formatDate(leave.startDate),
          endDate: formatDate(leave.endDate),
          type: leave.leaveType,
          status: leave.status,
        }));
        setLeaveRequests(formattedLeaves);
      } else {
        setLeaveRequests([]);
      }

      // Also fetch balance for employees
      if (!isAdminOrHR) {
        await fetchLeaveBalance();
      }

    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, [isAdminOrHR, employeeName, fetchLeaveBalance]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Handle approve
  const handleApprove = async (requestId) => {
    if (!confirm('Approve this leave request?')) return;
    try {
      setProcessing(true);
      const response = await leaveAPI.approve(requestId);
      if (response.success) {
        await fetchLeaves();
        if (!isAdminOrHR) {
          await fetchLeaveBalance();
        }
      } else {
        alert(response.message || 'Failed to approve');
      }
    } catch (e) {
      console.error('Approve error:', e);
      alert('Failed to approve leave request');
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async (requestId) => {
    if (!confirm('Reject this leave request?')) return;
    try {
      setProcessing(true);
      const response = await leaveAPI.reject(requestId, 'Rejected by admin');
      if (response.success) {
        await fetchLeaves();
        if (!isAdminOrHR) {
          await fetchLeaveBalance();
        }
      } else {
        alert(response.message || 'Failed to reject');
      }
    } catch (e) {
      console.error('Reject error:', e);
      alert('Failed to reject leave request');
    } finally {
      setProcessing(false);
    }
  };

  // Handle submit new request
  const handleSubmitRequest = async (formData) => {
    try {
      setSubmitting(true);

      const response = await leaveAPI.apply({
        leaveType: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      
      if (response.success) {
        setShowNewRequest(false);
        fetchLeaves();
        alert('Leave request submitted successfully!');
      } else {
        alert(response.message || 'Failed to submit leave request');
      }
    } catch (err) {
      console.error('Error submitting:', err);
      alert(err.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Time Off</h1>
          <p className="text-neutral-500 mt-1">
            {isAdminOrHR ? 'Manage employee leave requests' : 'View and request time off'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            icon={<RefreshIcon />}
            onClick={fetchLeaves}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button 
            variant="primary"
            icon={<PlusIcon />}
            onClick={() => setShowNewRequest(true)}
            className="bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-neutral-900"
          >
            NEW
          </Button>
        </div>
      </div>

      {/* Sub-tab & Balance */}
      <Card padding="none">
        <div className="flex items-center border-b border-neutral-100">
          <div className="px-6 py-3 bg-primary-100 text-primary-700 font-semibold text-sm border-r border-neutral-100">
            Time Off
          </div>
        </div>
        
        {/* Leave Balance */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-around gap-6 border-b border-neutral-100">
          <BalanceCard label="Paid Time Off" days={leaveBalance.paid} color="primary" />
          <BalanceCard label="Sick Time Off" days={leaveBalance.sick} color="info" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Time Off Type
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                {isAdminOrHR && (
                  <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={isAdminOrHR ? 6 : 5}>
                    <TableSkeleton />
                  </td>
                </tr>
              )}

              {error && !loading && (
                <tr>
                  <td colSpan={isAdminOrHR ? 6 : 5} className="text-center py-12">
                    <div className="text-error mb-3">{error}</div>
                    <Button variant="outline" size="sm" onClick={fetchLeaves}>Retry</Button>
                  </td>
                </tr>
              )}

              {!loading && !error && leaveRequests.length === 0 && (
                <tr>
                  <td colSpan={isAdminOrHR ? 6 : 5} className="text-center py-12">
                    <div className="text-neutral-400 mb-2">
                      <CalendarIcon className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-neutral-500">No leave requests found.</p>
                  </td>
                </tr>
              )}

              {!loading && !error && leaveRequests.map((request) => (
                isAdminOrHR ? (
                  <AdminLeaveRow
                    key={request.id}
                    request={request}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    processing={processing}
                  />
                ) : (
                  <EmployeeLeaveRow key={request.id} request={request} />
                )
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={showNewRequest}
        onClose={() => setShowNewRequest(false)}
        onSubmit={handleSubmitRequest}
        submitting={submitting}
        employeeName={employeeName}
      />
    </div>
  );
};

export default TimeOff;
