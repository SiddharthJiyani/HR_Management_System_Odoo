const anniversaryTemplate = (firstName, lastName, yearsCompleted, joinDate) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getMilestoneMessage = (years) => {
    if (years === 1) return "One amazing year down, many more to go!";
    if (years === 5) return "Half a decade of excellence!";
    if (years === 10) return "A whole decade of dedication!";
    if (years === 15) return "Fifteen years of remarkable contribution!";
    if (years === 20) return "Two decades of outstanding service!";
    if (years === 25) return "A quarter century of excellence!";
    return `${years} incredible years with us!`;
  };

  const getTrophyEmoji = (years) => {
    if (years >= 20) return "🏆";
    if (years >= 10) return "🥇";
    if (years >= 5) return "🥈";
    return "🌟";
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Work Anniversary Celebration!</title>
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
      background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
      padding: 50px 30px;
      text-align: center;
      color: white;
      position: relative;
    }
    .header-icon {
      font-size: 90px;
      margin-bottom: 15px;
      animation: rotate 3s linear infinite;
    }
    @keyframes rotate {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.1); }
      100% { transform: rotate(360deg) scale(1); }
    }
    .header h1 {
      margin: 0;
      font-size: 36px;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      margin-bottom: 10px;
    }
    .header .subtitle {
      font-size: 18px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .name-highlight {
      font-size: 32px;
      font-weight: 700;
      color: #8B5CF6;
      margin: 20px 0;
      display: block;
    }
    .years-badge {
      display: inline-block;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #1F2937;
      padding: 20px 40px;
      border-radius: 50px;
      font-size: 48px;
      font-weight: 800;
      margin: 25px 0;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
      border: 3px solid #FF8C00;
    }
    .milestone-text {
      font-size: 22px;
      color: #8B5CF6;
      font-weight: 600;
      margin: 20px 0;
    }
    .message {
      font-size: 16px;
      line-height: 1.8;
      color: #555;
      margin: 25px 0;
    }
    .celebration-box {
      background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%);
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
      border-left: 5px solid #8B5CF6;
    }
    .celebration-box p {
      margin: 15px 0;
      color: #5B21B6;
      font-size: 16px;
      line-height: 1.6;
    }
    .stats-container {
      display: flex;
      justify-content: space-around;
      margin: 30px 0;
      flex-wrap: wrap;
    }
    .stat-box {
      flex: 1;
      min-width: 140px;
      background-color: #F9FAFB;
      border: 2px solid #E5E7EB;
      border-radius: 10px;
      padding: 20px;
      margin: 10px;
      text-align: center;
    }
    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: #8B5CF6;
      display: block;
    }
    .stat-label {
      font-size: 14px;
      color: #6B7280;
      margin-top: 5px;
    }
    .emoji-row {
      font-size: 40px;
      margin: 25px 0;
      letter-spacing: 15px;
    }
    .quote-box {
      background-color: #FFFBEB;
      border-left: 4px solid #F59E0B;
      padding: 20px;
      margin: 30px 0;
      font-style: italic;
      color: #92400E;
      border-radius: 4px;
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
      <div class="header-icon">${getTrophyEmoji(yearsCompleted)}</div>
      <h1>WORK ANNIVERSARY!</h1>
      <div class="subtitle">Celebrating Your Journey with Us</div>
    </div>
    
    <div class="content">
      <span class="name-highlight">${firstName} ${lastName}</span>
      
      <div class="years-badge">
        ${yearsCompleted} YEAR${yearsCompleted > 1 ? 'S' : ''}
      </div>
      
      <div class="milestone-text">
        ${getMilestoneMessage(yearsCompleted)}
      </div>
      
      <div class="emoji-row">🎊 🎉 🎈 🎊 🎉</div>
      
      <div class="celebration-box">
        <p>
          <strong>Congratulations on completing ${yearsCompleted} ${yearsCompleted === 1 ? 'year' : 'years'} with Dayflow!</strong>
        </p>
        <p>
          Since joining us on <strong>${formatDate(joinDate)}</strong>, you have been an invaluable member of our team. Your dedication, hard work, and contributions have made a significant impact on our organization.
        </p>
        <p>
          Thank you for your continued commitment and for being such an important part of our journey. We look forward to many more years of success together!
        </p>
      </div>
      
      <div class="stats-container">
        <div class="stat-box">
          <span class="stat-number">${yearsCompleted}</span>
          <div class="stat-label">Years of Excellence</div>
        </div>
        <div class="stat-box">
          <span class="stat-number">${yearsCompleted * 12}</span>
          <div class="stat-label">Months</div>
        </div>
        <div class="stat-box">
          <span class="stat-number">${yearsCompleted * 365}</span>
          <div class="stat-label">Days</div>
        </div>
      </div>
      
      <div class="quote-box">
        "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful." - Albert Schweitzer
      </div>
      
      <div class="message" style="font-size: 18px; font-weight: 600; color: #333; margin-top: 30px;">
        Here's to many more years of collaboration and achievements! 🥂
      </div>
      
      <div class="emoji-row">✨ 🌟 ⭐ 🌟 ✨</div>
    </div>
    
    <div class="footer">
      <p><strong class="brand">Dayflow</strong> - HR Management System</p>
      <p>Honoring ${yearsCompleted} ${yearsCompleted === 1 ? 'year' : 'years'} of dedication and excellence!</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = anniversaryTemplate;
