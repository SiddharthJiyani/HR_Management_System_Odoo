const leaveRequestTemplate = (leave, employee) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const leaveTypeLabels = {
    'paid': 'Paid Leave',
    'vacation': 'Vacation Leave',
    'annual': 'Annual Leave',
    'sick': 'Sick Leave',
    'personal': 'Personal Leave',
    'casual': 'Casual Leave',
    'unpaid': 'Unpaid Leave',
    'maternity': 'Maternity Leave',
    'paternity': 'Paternity Leave',
    'bereavement': 'Bereavement Leave',
    'other': 'Other Leave'
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Leave Request</title>
  <style>
    body {
      background-color: #f5f5f5;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 650px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header-icon {
      font-size: 60px;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 15px;
      margin: 25px 0;
      background-color: #f9fafb;
      padding: 25px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .info-label {
      font-weight: 600;
      color: #374151;
    }
    .info-value {
      color: #6b7280;
    }
    .reason-box {
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .reason-box h3 {
      margin: 0 0 10px 0;
      color: #92400E;
      font-size: 16px;
    }
    .reason-box p {
      margin: 0;
      color: #78350F;
      line-height: 1.6;
    }
    .action-buttons {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      margin: 0 10px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.3s;
    }
    .btn-approve {
      background-color: #22C55E;
      color: white;
    }
    .btn-reject {
      background-color: #EF4444;
      color: white;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      margin: 5px 0;
      color: #888;
      font-size: 14px;
    }
    .brand {
      color: #FFD966;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-icon">📋</div>
      <h1>New Leave Request</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #333; margin-bottom: 10px;">
        A new leave request has been submitted and requires your attention.
      </p>
      
      <div class="info-grid">
        <div class="info-label">Employee:</div>
        <div class="info-value"><strong>${employee.firstName} ${employee.lastName}</strong></div>
        
        <div class="info-label">Employee ID:</div>
        <div class="info-value">${employee.employeeId}</div>
        
        <div class="info-label">Department:</div>
        <div class="info-value">${employee.department || 'N/A'}</div>
        
        <div class="info-label">Leave Type:</div>
        <div class="info-value"><strong>${leaveTypeLabels[leave.leaveType] || leave.leaveType}</strong></div>
        
        <div class="info-label">Start Date:</div>
        <div class="info-value">${formatDate(leave.startDate)}</div>
        
        <div class="info-label">End Date:</div>
        <div class="info-value">${formatDate(leave.endDate)}</div>
        
        <div class="info-label">Duration:</div>
        <div class="info-value">${leave.totalDays} day${leave.totalDays > 1 ? 's' : ''}${leave.isHalfDay ? ' (Half Day)' : ''}</div>
        
        <div class="info-label">Applied On:</div>
        <div class="info-value">${formatDate(leave.appliedDate || leave.createdAt)}</div>
      </div>
      
      ${leave.reason ? `
      <div class="reason-box">
        <h3>📝 Reason for Leave:</h3>
        <p>${leave.reason}</p>
      </div>
      ` : ''}
      
      <div class="action-buttons">
        <p style="color: #666; margin-bottom: 20px;">Please review this request and take appropriate action:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard" class="btn btn-approve">
          ✓ Review & Approve
        </a>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard" class="btn btn-reject">
          ✗ Review & Reject
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong class="brand">Dayflow</strong> - HR Management System</p>
      <p>This is an automated notification. Please log in to the HR portal to take action.</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = leaveRequestTemplate;
