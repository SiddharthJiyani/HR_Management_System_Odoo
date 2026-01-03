import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Input } from '../components/ui';
import { leaveAPI } from '../services/api';

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LeaveTypeIcon = ({ type }) => {
  const icons = {
    vacation: '🏖️',
    sick: '🏥',
    personal: '🏠',
    bereavement: '🕊️',
    maternity: '👶',
    other: '📋',
  };
  return <span className="text-xl">{icons[type] || icons.other}</span>;
};

const LeaveRequest = ({ request, onCancel }) => {
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

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 hover:bg-white/80 transition-colors">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
        <LeaveTypeIcon type={request.type} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-semibold text-neutral-900">{request.title}</h3>
          <Badge variant={statusVariants[request.status]} size="sm">
            {statusLabels[request.status]}
          </Badge>
        </div>
        <p className="text-sm text-neutral-600 mb-1">
          {request.startDate} — {request.endDate}
        </p>
        <p className="text-sm text-neutral-500">{request.days} days</p>
        {request.reason && (
          <p className="text-sm text-neutral-400 mt-2 truncate">{request.reason}</p>
        )}
      </div>

      {/* Actions */}
      {request.status === 'pending' && onCancel && (
        <button 
          onClick={() => onCancel(request.id)}
          className="flex-shrink-0 p-2 text-neutral-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

const TimeOff = () => {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    vacation: { total: 20, used: 0, remaining: 20 },
    sick: { total: 10, used: 0, remaining: 10 },
    personal: { total: 5, used: 0, remaining: 5 },
  });
  const [newRequest, setNewRequest] = useState({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Map leave types from API format
  const mapLeaveType = (type) => {
    const typeMap = {
      annual: 'vacation',
      sick: 'sick',
      personal: 'personal',
      casual: 'personal',
      maternity: 'maternity',
      paternity: 'maternity',
      bereavement: 'bereavement',
      unpaid: 'other',
    };
    return typeMap[type?.toLowerCase()] || 'other';
  };

  // Map leave type back to API format
  const mapLeaveTypeToAPI = (type) => {
    const typeMap = {
      vacation: 'annual',
      sick: 'sick',
      personal: 'casual',
    };
    return typeMap[type] || type;
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Transform API data to display format
  const transformLeaveData = (leaves) => {
    return leaves.map(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      return {
        id: leave._id,
        type: mapLeaveType(leave.leaveType),
        title: leave.leaveType ? `${leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave` : 'Leave Request',
        startDate: formatDate(leave.startDate),
        endDate: formatDate(leave.endDate),
        days: leave.totalDays || days,
        status: leave.status,
        reason: leave.reason,
      };
    });
  };

  // Fetch leave requests
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await leaveAPI.getMyLeaves();
      
      if (response.success) {
        setLeaveRequests(transformLeaveData(response.data || []));
        
        // Extract leave balance if provided
        if (response.leaveBalance) {
          setLeaveBalance({
            vacation: {
              total: response.leaveBalance.annual?.total || 20,
              used: response.leaveBalance.annual?.used || 0,
              remaining: response.leaveBalance.annual?.remaining || 20,
            },
            sick: {
              total: response.leaveBalance.sick?.total || 10,
              used: response.leaveBalance.sick?.used || 0,
              remaining: response.leaveBalance.sick?.remaining || 10,
            },
            personal: {
              total: response.leaveBalance.casual?.total || 5,
              used: response.leaveBalance.casual?.used || 0,
              remaining: response.leaveBalance.casual?.remaining || 5,
            },
          });
        }
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError('Failed to load leave requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleSubmitRequest = async () => {
    // Validate form
    if (!newRequest.startDate || !newRequest.endDate) {
      alert('Please select start and end dates.');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await leaveAPI.apply({
        leaveType: mapLeaveTypeToAPI(newRequest.type),
        startDate: newRequest.startDate,
        endDate: newRequest.endDate,
        reason: newRequest.reason,
      });

      if (response.success) {
        setShowNewRequest(false);
        setNewRequest({ type: 'vacation', startDate: '', endDate: '', reason: '' });
        fetchLeaves(); // Refresh the list
      }
    } catch (err) {
      console.error('Error submitting leave request:', err);
      alert(err.message || 'Failed to submit leave request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return;
    
    try {
      const response = await leaveAPI.cancel(requestId, 'Cancelled by employee');
      
      if (response.success) {
        fetchLeaves(); // Refresh the list
      }
    } catch (err) {
      console.error('Error cancelling leave:', err);
      alert(err.message || 'Failed to cancel leave request. Please try again.');
    }
  };

  return (
    <div className="page-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Time Off</h1>
          <p className="text-neutral-500 mt-1">
            Manage your leave requests
          </p>
        </div>
        <Button 
          variant="primary"
          icon={<PlusIcon />}
          onClick={() => setShowNewRequest(true)}
        >
          New Request
        </Button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BalanceCard 
          label="Vacation"
          icon="🏖️"
          total={leaveBalance.vacation.total}
          used={leaveBalance.vacation.used}
          remaining={leaveBalance.vacation.remaining}
          color="primary"
        />
        <BalanceCard 
          label="Sick Leave"
          icon="🏥"
          total={leaveBalance.sick.total}
          used={leaveBalance.sick.used}
          remaining={leaveBalance.sick.remaining}
          color="info"
        />
        <BalanceCard 
          label="Personal"
          icon="🏠"
          total={leaveBalance.personal.total}
          used={leaveBalance.personal.used}
          remaining={leaveBalance.personal.remaining}
          color="success"
        />
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <Card className="animate-fade-in">
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
              <div className="grid grid-cols-3 gap-2">
                {['vacation', 'sick', 'personal'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewRequest(prev => ({ ...prev, type }))}
                    className={`
                      p-3 rounded-xl border-2 text-center transition-all
                      ${newRequest.type === type
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                      }
                    `}
                  >
                    <LeaveTypeIcon type={type} />
                    <p className="text-sm font-medium mt-1 capitalize">{type}</p>
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

      {/* Requests List */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Leave Requests
        </h2>
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Loading leave requests...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div className="text-red-500 text-sm mb-3">{error}</div>
            <Button variant="outline" size="sm" onClick={fetchLeaves}>
              Retry
            </Button>
          </div>
        )}

        {/* Leave Requests List */}
        {!loading && !error && leaveRequests.length > 0 && (
          <div className="space-y-2">
            {leaveRequests.map((request) => (
              <LeaveRequest key={request.id} request={request} onCancel={handleCancelRequest} />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!loading && !error && leaveRequests.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium text-neutral-700">No leave requests</h3>
            <p className="text-neutral-500 mt-1">
              Submit your first leave request to get started
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

const BalanceCard = ({ label, icon, total, used, remaining, color }) => {
  const colorClasses = {
    primary: 'from-primary-400 to-primary-500',
    info: 'from-info to-blue-500',
    success: 'from-success to-green-500',
  };

  const percentage = ((total - remaining) / total) * 100;

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{remaining}</p>
          <p className="text-xs text-neutral-400">days remaining</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="text-xs text-neutral-500 mt-2">
        {used} of {total} days used
      </p>
    </Card>
  );
};

export default TimeOff;

