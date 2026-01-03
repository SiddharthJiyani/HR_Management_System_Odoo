const leaveDecisionTemplate = (leave, employee, status, approvedBy) => {
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

  const isApproved = status === 'approved';
  const headerColor = isApproved ? '#22C55E' : '#EF4444';
  const headerGradient = isApproved 
    ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
    : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
  const icon = isApproved ? '✅' : '❌';
  const statusText = isApproved ? 'APPROVED' : 'REJECTED';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Leave Request ${statusText}</title>
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
      background: ${headerGradient};
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header-icon {
      font-size: 70px;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px 30px;
    }
    .status-badge {
      display: inline-block;
      padding: 10px 20px;
      background-color: ${headerColor};
      color: white;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #555;
      margin-bottom: 25px;
    }
    .info-box {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    .info-row {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      flex: 0 0 160px;
      font-weight: 600;
      color: #374151;
    }
    .info-value {
      flex: 1;
      color: #6b7280;
    }
    .approval-box {
      background-color: ${isApproved ? '#ECFDF5' : '#FEF2F2'};
      border-left: 4px solid ${headerColor};
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .approval-box p {
      margin: 0;
      color: ${isApproved ? '#065F46' : '#991B1B'};
      line-height: 1.6;
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
      <div class="header-icon">${icon}</div>
      <h1>Leave Request ${statusText}</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi <strong>${employee.firstName} ${employee.lastName}</strong>,
      </div>
      
      <div class="message">
        ${isApproved 
          ? 'Good news! Your leave request has been approved. ✨' 
          : 'We regret to inform you that your leave request has been rejected.'}
      </div>
      
      <div class="approval-box">
        <p><strong>${isApproved ? '✓' : '✗'} Status:</strong> Your ${leaveTypeLabels[leave.leaveType] || leave.leaveType} request has been <strong>${statusText}</strong>${approvedBy ? ` by ${approvedBy.firstName} ${approvedBy.lastName}` : ''}.</p>
      </div>
      
      <div class="info-box">
        <div class="info-row">
          <div class="info-label">Leave Type:</div>
          <div class="info-value"><strong>${leaveTypeLabels[leave.leaveType] || leave.leaveType}</strong></div>
        </div>
        <div class="info-row">
          <div class="info-label">Start Date:</div>
          <div class="info-value">${formatDate(leave.startDate)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">End Date:</div>
          <div class="info-value">${formatDate(leave.endDate)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Duration:</div>
          <div class="info-value">${leave.totalDays} day${leave.totalDays > 1 ? 's' : ''}${leave.isHalfDay ? ' (Half Day)' : ''}</div>
        </div>
        ${leave.reason ? `
        <div class="info-row">
          <div class="info-label">Reason:</div>
          <div class="info-value">${leave.reason}</div>
        </div>
        ` : ''}
        <div class="info-row">
          <div class="info-label">Decision Date:</div>
          <div class="info-value">${formatDate(new Date())}</div>
        </div>
      </div>
      
      ${isApproved 
        ? '<div class="message">Enjoy your time off! Please ensure all your work is delegated before your leave. 🌴</div>'
        : '<div class="message">If you have any questions or concerns about this decision, please contact your HR department. You may submit a new leave request if needed.</div>'
      }
    </div>
    
    <div class="footer">
      <p><strong class="brand">Dayflow</strong> - HR Management System</p>
      <p>For any queries, please contact your HR department.</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = leaveDecisionTemplate;
