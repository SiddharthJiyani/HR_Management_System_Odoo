import React from 'react';
import { Card, Avatar, StatusDot, Button, Badge } from '../components/ui';

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const InfoField = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
      {icon}
    </div>
    <div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="font-medium text-neutral-900">{value || '—'}</p>
    </div>
  </div>
);

const EmployeeProfile = ({ employee, onBack }) => {
  if (!employee) {
    return (
      <div className="page-fade-in">
        <Button variant="ghost" onClick={onBack} icon={<BackIcon />}>
          Back to Directory
        </Button>
        <Card className="mt-4 text-center py-12">
          <p className="text-neutral-500">Employee not found</p>
        </Card>
      </div>
    );
  }

  const statusLabels = {
    present: 'Present',
    absent: 'Absent',
    leave: 'On Leave',
    'not-checked-in': 'Not Checked In',
  };

  const statusVariants = {
    present: 'success',
    absent: 'warning',
    leave: 'info',
    'not-checked-in': 'error',
  };

  return (
    <div className="page-fade-in space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} icon={<BackIcon />}>
        Back to Directory
      </Button>

      {/* Profile Header Card */}
      <Card className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-32 bg-gradient-to-br from-primary-300 to-primary-500 opacity-20" />
        
        <div className="relative pt-8 pb-6 px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <Avatar 
              src={employee.avatar}
              name={employee.name}
              size="xl"
              className="ring-4 ring-white shadow-soft-lg"
            />

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-neutral-900">
                  {employee.name}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <StatusDot status={employee.status} size="sm" showPulse={false} />
                  <Badge variant={statusVariants[employee.status]}>
                    {statusLabels[employee.status]}
                  </Badge>
                </div>
              </div>
              
              <p className="text-lg text-neutral-600 mb-1">{employee.role}</p>
              
              {employee.department && (
                <Badge variant="primary" size="md">
                  {employee.department}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">
            Contact Information
          </h2>
          <div className="space-y-5">
            <InfoField 
              icon={<MailIcon />}
              label="Email Address"
              value={employee.email}
            />
            <InfoField 
              icon={<PhoneIcon />}
              label="Phone Number"
              value={employee.phone}
            />
            <InfoField 
              icon={<LocationIcon />}
              label="Address"
              value={employee.address}
            />
          </div>
        </Card>

        {/* Employment Details */}
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">
            Employment Details
          </h2>
          <div className="space-y-5">
            <InfoField 
              icon={<BriefcaseIcon />}
              label="Employee ID"
              value={employee.employeeId}
            />
            <InfoField 
              icon={<CalendarIcon />}
              label="Join Date"
              value={employee.joinDate}
            />
            <InfoField 
              icon={<BriefcaseIcon />}
              label="Employment Type"
              value={employee.employmentType}
            />
          </div>
        </Card>
      </div>

      {/* Attendance Summary */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">
          Attendance Summary (This Month)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-success/10">
            <p className="text-3xl font-bold text-success">{employee.attendance?.present || 18}</p>
            <p className="text-sm text-neutral-600">Present</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-error/10">
            <p className="text-3xl font-bold text-error">{employee.attendance?.absent || 1}</p>
            <p className="text-sm text-neutral-600">Absent</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-info/10">
            <p className="text-3xl font-bold text-info">{employee.attendance?.leave || 2}</p>
            <p className="text-sm text-neutral-600">Leave</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-warning/10">
            <p className="text-3xl font-bold text-warning">{employee.attendance?.late || 0}</p>
            <p className="text-sm text-neutral-600">Late</p>
          </div>
        </div>
      </Card>

      {/* View Only Notice */}
      <div className="text-center py-4">
        <p className="text-sm text-neutral-400">
          This is a view-only profile. Contact HR for any updates.
        </p>
      </div>
    </div>
  );
};

export default EmployeeProfile;

