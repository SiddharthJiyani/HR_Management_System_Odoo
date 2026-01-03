const missedCheckoutTemplate = (firstName, lastName) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Missed Checkout Reminder</title>
  <style>
    body {
      background-color: #f5f5f5;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #FFD966 0%, #FFB300 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 60px;
      margin-bottom: 10px;
    }
    .header h1 {
      color: #000;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
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
      margin-bottom: 30px;
    }
    .highlight-box {
      background-color: #FFF9E6;
      border-left: 4px solid #FFD966;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .highlight-box p {
      margin: 0;
      color: #333;
      font-size: 15px;
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
      <div class="header-icon">⏰</div>
      <h1>Forgot to Check Out?</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hi <strong>${firstName} ${lastName}</strong>,
      </div>
      
      <div class="message">
        We noticed that you checked in today but haven't checked out yet. This is a friendly reminder to mark your checkout time in the system.
      </div>
      
      <div class="highlight-box">
        <p><strong>⚠️ Important:</strong> Forgetting to check out may affect your attendance records and working hours calculation. Please check out as soon as possible.</p>
      </div>
      
      <div class="message">
        If you've already left for the day, please log in to the HR portal and mark your checkout time.
      </div>
      
      <div class="message">
        Thank you for your cooperation! 🙏
      </div>
    </div>
    
    <div class="footer">
      <p><strong class="brand">Dayflow</strong> - HR Management System</p>
      <p>This is an automated reminder. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = missedCheckoutTemplate;
