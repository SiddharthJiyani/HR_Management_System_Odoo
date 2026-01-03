import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '../components/ui';

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

const LeaveRequest = ({ request }) => {
  const statusVariants = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
  };

  const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
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
      {request.status === 'pending' && (
        <button className="flex-shrink-0 p-2 text-neutral-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors">
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

const TimeOff = () => {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Leave balance
  const leaveBalance = {
    vacation: { total: 20, used: 5, remaining: 15 },
    sick: { total: 10, used: 2, remaining: 8 },
    personal: { total: 5, used: 1, remaining: 4 },
  };

  // Mock requests
  const leaveRequests = [
    {
      id: 1,
      type: 'vacation',
      title: 'Summer Vacation',
      startDate: 'Jan 15, 2026',
      endDate: 'Jan 20, 2026',
      days: 5,
      status: 'pending',
      reason: 'Family trip to Hawaii',
    },
    {
      id: 2,
      type: 'sick',
      title: 'Medical Appointment',
      startDate: 'Dec 28, 2025',
      endDate: 'Dec 28, 2025',
      days: 1,
      status: 'approved',
      reason: 'Annual health checkup',
    },
    {
      id: 3,
      type: 'personal',
      title: 'Personal Day',
      startDate: 'Dec 10, 2025',
      endDate: 'Dec 10, 2025',
      days: 1,
      status: 'approved',
      reason: 'Moving to new apartment',
    },
    {
      id: 4,
      type: 'vacation',
      title: 'Holiday Break',
      startDate: 'Dec 23, 2025',
      endDate: 'Dec 27, 2025',
      days: 3,
      status: 'rejected',
      reason: 'Christmas holiday with family',
    },
  ];

  const handleSubmitRequest = () => {
    // Handle form submission
    console.log('New request:', newRequest);
    setShowNewRequest(false);
    setNewRequest({ type: 'vacation', startDate: '', endDate: '', reason: '' });
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
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmitRequest}
                className="flex-1"
              >
                Submit Request
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
        
        {leaveRequests.length > 0 ? (
          <div className="space-y-2">
            {leaveRequests.map((request) => (
              <LeaveRequest key={request.id} request={request} />
            ))}
          </div>
        ) : (
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

