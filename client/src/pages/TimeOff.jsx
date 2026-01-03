import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Input, SearchBar, Avatar } from '../components/ui';
import { leaveAPI } from '../services/api';

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

const LeaveTypeIcon = ({ type }) => {
  const icons = {
    vacation: '🏖️',
    annual: '🏖️',
    sick: '🏥',
    personal: '🏠',
    casual: '🏠',
    bereavement: '🕊️',
    maternity: '👶',
    paternity: '👶',
    unpaid: '📋',
    other: '📋',
  };
  return <span className="text-lg">{icons[type?.toLowerCase()] || icons.other}</span>;
};

// Sub-tab Toggle
const SubTabToggle = ({ activeTab, onChange }) => (
  <div className="flex items-center bg-white/80 rounded-xl border border-neutral-200 overflow-hidden">
    {[
      { id: 'timeoff', label: 'Time Off' },
      { id: 'allocation', label: 'Allocation' },
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`
          px-5 py-2.5 text-sm font-medium transition-all
          ${activeTab === tab.id
            ? 'bg-primary-500 text-white'
            : 'text-neutral-600 hover:bg-neutral-50'
          }
        `}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

// Balance Card
const BalanceCard = ({ label, icon, days, color }) => {
  const colorClasses = {
    primary: 'from-primary-100 to-primary-50 border-primary-200',
    info: 'from-info/10 to-info/5 border-info/20',
    success: 'from-success/10 to-success/5 border-success/20',
  };

  return (
    <div className={`rounded-xl p-5 bg-gradient-to-br border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm text-neutral-600">{label}</p>
          <p className="text-xl font-bold text-neutral-900">{days} Days Available</p>
        </div>
      </div>
    </div>
  );
};

// Table Skeleton
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4 px-4 border-b border-neutral-100">
        <div className="w-9 h-9 bg-neutral-200 rounded-full" />
        <div className="flex-1 h-4 bg-neutral-200 rounded w-32" />
        <div className="h-4 bg-neutral-200 rounded w-24" />
        <div className="h-4 bg-neutral-200 rounded w-24" />
        <div className="h-4 bg-neutral-200 rounded w-20" />
        <div className="h-6 bg-neutral-200 rounded w-16" />
        <div className="h-8 bg-neutral-200 rounded w-20" />
      </div>
    ))}
  </div>
);

// Leave Request Row
const LeaveRequestRow = ({ request, isAdminOrHR, onApprove, onReject, processing }) => {
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
    sick: 'Sick Leave',
    personal: 'Personal',
    casual: 'Casual',
    maternity: 'Maternity',
    paternity: 'Paternity',
    bereavement: 'Bereavement',
    unpaid: 'Unpaid',
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
        <div className="flex items-center gap-2">
          <LeaveTypeIcon type={request.type} />
          <span className="text-sm font-medium text-primary-600">
            {typeLabels[request.type] || request.type}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <Badge variant={statusVariants[request.status]} size="sm">
          {statusLabels[request.status]}
        </Badge>
      </td>
      <td className="py-4 px-4">
        {isAdminOrHR && request.status === 'pending' && (
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
        {request.status !== 'pending' && (
          <span className="text-xs text-neutral-400">—</span>
        )}
      </td>
    </tr>
  );
};

const TimeOff = ({ isAdmin = false, isHR = false }) => {
  const [activeSubTab, setActiveSubTab] = useState('timeoff');
  const [searchValue, setSearchValue] = useState('');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    paid: 24,
    sick: 7,
  });
  const [newRequest, setNewRequest] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Check if user is Admin or HR (can approve/reject)
  const isAdminOrHR = isAdmin || isHR;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Generate mock data for demonstration
  const generateMockData = useCallback(() => {
    const employees = [
      { id: 1, name: 'Sarah Johnson', department: 'Engineering', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
      { id: 2, name: 'Michael Chen', department: 'Product', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
      { id: 3, name: 'Emily Rodriguez', department: 'Design', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
      { id: 4, name: 'James Wilson', department: 'Engineering', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
    ];

    const types = ['annual', 'sick', 'personal', 'casual'];
    const statuses = ['pending', 'pending', 'approved', 'rejected'];

    return employees.map((emp, idx) => ({
      id: `leave-${idx + 1}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      avatar: emp.avatar,
      startDate: formatDate(new Date(2025, 0, 15 + idx * 5)),
      endDate: formatDate(new Date(2025, 0, 17 + idx * 5)),
      type: types[idx % types.length],
      status: statuses[idx % statuses.length],
      reason: 'Personal time off',
      days: 2 + (idx % 3),
    }));
  }, []);

  // Fetch leave requests
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try API first
      try {
        const response = isAdminOrHR 
          ? await leaveAPI.getAll() 
          : await leaveAPI.getMyLeaves();

        if (response.success && response.data?.length > 0) {
          const formattedLeaves = response.data.map(leave => ({
            id: leave._id,
            employeeId: leave.employeeId?._id || leave.employeeId,
            employeeName: leave.employeeId?.firstName 
              ? `${leave.employeeId.firstName} ${leave.employeeId.lastName || ''}`.trim()
              : 'Unknown',
            department: leave.employeeId?.department || 'N/A',
            avatar: leave.employeeId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.employeeId?.firstName || 'U')}&background=FFD966&color=000`,
            startDate: formatDate(leave.startDate),
            endDate: formatDate(leave.endDate),
            type: leave.leaveType,
            status: leave.status,
            reason: leave.reason,
            days: leave.totalDays || 1,
          }));
          setLeaveRequests(formattedLeaves);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data');
      }

      // Fallback to mock data
      setLeaveRequests(generateMockData());

    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, [isAdminOrHR, generateMockData]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Handle approve
  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this leave request?')) return;

    try {
      setProcessing(true);
      
      try {
        const response = await leaveAPI.approve(requestId);
        if (response.success) {
          fetchLeaves();
          return;
        }
      } catch (apiError) {
        console.log('API error, updating locally');
      }

      // Update locally for demo
      setLeaveRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      );
    } catch (err) {
      console.error('Error approving leave:', err);
      alert('Failed to approve leave request.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async (requestId) => {
    if (!confirm('Are you sure you want to reject this leave request?')) return;

    try {
      setProcessing(true);

      try {
        const response = await leaveAPI.reject(requestId, 'Rejected by admin');
        if (response.success) {
          fetchLeaves();
          return;
        }
      } catch (apiError) {
        console.log('API error, updating locally');
      }

      // Update locally for demo
      setLeaveRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'rejected' } : req
        )
      );
    } catch (err) {
      console.error('Error rejecting leave:', err);
      alert('Failed to reject leave request.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle submit new request
  const handleSubmitRequest = async () => {
    if (!newRequest.startDate || !newRequest.endDate) {
      alert('Please select start and end dates.');
      return;
    }

    try {
      setSubmitting(true);

      try {
        const response = await leaveAPI.apply({
          leaveType: newRequest.type,
          startDate: newRequest.startDate,
          endDate: newRequest.endDate,
          reason: newRequest.reason,
        });

        if (response.success) {
          setShowNewRequest(false);
          setNewRequest({ type: 'annual', startDate: '', endDate: '', reason: '' });
          fetchLeaves();
          return;
        }
      } catch (apiError) {
        console.log('API error');
      }

      // Add locally for demo
      const newLeave = {
        id: `leave-${Date.now()}`,
        employeeName: 'You',
        department: 'Your Department',
        avatar: `https://ui-avatars.com/api/?name=You&background=FFD966&color=000`,
        startDate: formatDate(newRequest.startDate),
        endDate: formatDate(newRequest.endDate),
        type: newRequest.type,
        status: 'pending',
        reason: newRequest.reason,
        days: 1,
      };
      setLeaveRequests(prev => [newLeave, ...prev]);
      setShowNewRequest(false);
      setNewRequest({ type: 'annual', startDate: '', endDate: '', reason: '' });

    } catch (err) {
      console.error('Error submitting leave:', err);
      alert('Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter requests by search
  const filteredRequests = leaveRequests.filter(req =>
    req.employeeName?.toLowerCase().includes(searchValue.toLowerCase()) ||
    req.department?.toLowerCase().includes(searchValue.toLowerCase()) ||
    req.type?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Count pending requests
  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="page-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Time Off</h1>
          <p className="text-neutral-500 mt-1">
            {isAdminOrHR 
              ? 'Manage and approve employee leave requests' 
              : 'View and request time off'
            }
          </p>
        </div>
        
        {/* Actions */}
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
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            NEW
          </Button>
        </div>
      </div>

      {/* Sub-tabs and Search */}
      <div className="flex flex-wrap items-center gap-4">
        <SubTabToggle 
          activeTab={activeSubTab}
          onChange={setActiveSubTab}
        />
        
        <div className="flex-1 max-w-xs">
          <SearchBar 
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search requests..."
          />
        </div>

        {isAdminOrHR && pendingCount > 0 && (
          <Badge variant="warning" size="md">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BalanceCard 
          label="Paid Time Off"
          icon="🏖️"
          days={leaveBalance.paid}
          color="primary"
        />
        <BalanceCard 
          label="Sick Time Off"
          icon="🏥"
          days={leaveBalance.sick}
          color="info"
        />
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <Card className="animate-fade-in border-2 border-primary-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              New Leave Request
            </h2>
            <button 
              onClick={() => setShowNewRequest(false)}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="space-y-4">
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Leave Type
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {[
                  { id: 'annual', label: 'Paid Time Off', icon: '🏖️' },
                  { id: 'sick', label: 'Sick Leave', icon: '🏥' },
                  { id: 'personal', label: 'Personal', icon: '🏠' },
                  { id: 'unpaid', label: 'Unpaid', icon: '📋' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setNewRequest(prev => ({ ...prev, type: type.id }))}
                    className={`
                      p-3 rounded-xl border-2 text-center transition-all
                      ${newRequest.type === type.id
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                      }
                    `}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <p className="text-xs font-medium mt-1">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input 
                label="Start Date"
                type="date"
                value={newRequest.startDate}
                onChange={(e) => setNewRequest(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <Input 
                label="End Date"
                type="date"
                value={newRequest.endDate}
                onChange={(e) => setNewRequest(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={newRequest.reason}
                onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter the reason for your leave..."
                className="
                  w-full px-4 py-3
                  bg-white/80 backdrop-blur-sm
                  border border-neutral-200
                  rounded-xl
                  text-neutral-800
                  placeholder-neutral-400
                  focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20
                  transition-all resize-none
                "
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewRequest(false)}
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmitRequest}
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Leave Requests Table */}
      <Card padding="none">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon />
              <h2 className="font-semibold text-neutral-900">
                {activeSubTab === 'timeoff' ? 'Leave Requests' : 'Leave Allocation'}
              </h2>
            </div>
            <Badge variant="primary">
              {filteredRequests.length} Requests
            </Badge>
          </div>
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
              {/* Loading State */}
              {loading && (
                <tr>
                  <td colSpan={isAdminOrHR ? 6 : 5}>
                    <TableSkeleton />
                  </td>
                </tr>
              )}

              {/* Error State */}
              {error && !loading && (
                <tr>
                  <td colSpan={isAdminOrHR ? 6 : 5} className="text-center py-12">
                    <div className="text-error mb-3">{error}</div>
                    <Button variant="outline" size="sm" onClick={fetchLeaves}>
                      Retry
                    </Button>
                  </td>
                </tr>
              )}

              {/* Empty State */}
              {!loading && !error && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={isAdminOrHR ? 6 : 5} className="text-center py-12">
                    <div className="text-neutral-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-neutral-500">No leave requests found.</p>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {!loading && !error && filteredRequests.map((request) => (
                <LeaveRequestRow
                  key={request.id}
                  request={request}
                  isAdminOrHR={isAdminOrHR}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  processing={processing}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {!loading && filteredRequests.length > 0 && (
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/30">
            <div className="flex items-center justify-between text-sm text-neutral-500">
              <span>
                Showing {filteredRequests.length} of {leaveRequests.length} requests
              </span>
              <span>
                {isAdminOrHR 
                  ? 'You can approve or reject pending requests'
                  : 'Contact HR for any questions'
                }
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Note Card */}
      <Card className="bg-primary-50/50 border-primary-100">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-1">Time Off Notes</h3>
            <ul className="text-sm text-neutral-600 space-y-1">
              {isAdminOrHR ? (
                <>
                  <li>• You can view time off records for all employees</li>
                  <li>• Approve or reject pending requests using the action buttons</li>
                  <li>• Rejected requests will notify the employee automatically</li>
                </>
              ) : (
                <>
                  <li>• You can view only your own time off records</li>
                  <li>• Submit new requests and track their status here</li>
                  <li>• Contact HR for any questions about your leave balance</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimeOff;
