import React from 'react';
import { Card, Avatar, StatusDot, Button, Badge } from '../components/ui';

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const EmployeeCard = ({ employee, onClick }) => {
  const { name, avatar, role, department, status, email } = employee;

  return (
    <Card 
      hover 
      onClick={onClick}
      className="relative overflow-hidden group animate-fade-in"
      padding="none"
    >
      {/* Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <StatusDot status={status} size="md" />
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <Avatar 
            src={avatar}
            name={name}
            size="xl"
            className="ring-4 ring-primary-100 group-hover:ring-primary-200 transition-all"
          />
        </div>

        {/* Info */}
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-neutral-900 text-lg group-hover:text-primary-600 transition-colors">
            {name}
          </h3>
          <p className="text-sm text-neutral-500">{role}</p>
          {department && (
            <Badge variant="primary" size="sm">
              {department}
            </Badge>
          )}
        </div>

        {/* Hover Info */}
        <div className="mt-4 pt-4 border-t border-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-xs text-neutral-400 text-center truncate">
            {email}
          </p>
        </div>
      </div>

      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
};

const EmployeeDirectory = ({ employees, onEmployeeClick, onNewEmployee, searchValue }) => {
  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes((searchValue || '').toLowerCase()) ||
    emp.role.toLowerCase().includes((searchValue || '').toLowerCase()) ||
    emp.department?.toLowerCase().includes((searchValue || '').toLowerCase())
  );

  // Group by status for stats
  const stats = {
    total: employees.length,
    present: employees.filter(e => e.status === 'present').length,
    absent: employees.filter(e => e.status === 'absent').length,
    leave: employees.filter(e => e.status === 'leave').length,
  };

  return (
    <div className="page-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Employee Directory</h1>
          <p className="text-neutral-500 mt-1">
            Manage and view your team members
          </p>
        </div>
        <Button 
          variant="primary"
          icon={<PlusIcon />}
          onClick={onNewEmployee}
        >
          New Employee
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total Employees" 
          value={stats.total} 
          color="neutral" 
        />
        <StatCard 
          label="Present Today" 
          value={stats.present} 
          color="success" 
        />
        <StatCard 
          label="Absent" 
          value={stats.absent} 
          color="warning" 
        />
        <StatCard 
          label="On Leave" 
          value={stats.leave} 
          color="info" 
        />
      </div>

      {/* Employee Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee, index) => (
            <div 
              key={employee.id} 
              className={`stagger-${Math.min(index + 1, 9)}`}
              style={{ animationFillMode: 'both' }}
            >
              <EmployeeCard 
                employee={employee}
                onClick={() => onEmployeeClick(employee)}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="text-neutral-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-700">No employees found</h3>
          <p className="text-neutral-500 mt-1">
            {searchValue ? 'Try adjusting your search' : 'Add your first employee to get started'}
          </p>
        </Card>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color }) => {
  const colorClasses = {
    neutral: 'from-neutral-100 to-neutral-50',
    success: 'from-success/10 to-success/5',
    warning: 'from-warning/10 to-warning/5',
    info: 'from-info/10 to-info/5',
    error: 'from-error/10 to-error/5',
  };

  const textColors = {
    neutral: 'text-neutral-900',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
    error: 'text-error',
  };

  return (
    <div className={`
      rounded-card p-4 bg-gradient-to-br ${colorClasses[color]}
      border border-white/50
    `}>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
    </div>
  );
};

export default EmployeeDirectory;

