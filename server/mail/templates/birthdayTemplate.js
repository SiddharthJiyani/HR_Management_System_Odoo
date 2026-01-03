const birthdayTemplate = (firstName, lastName) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Happy Birthday!</title>
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
      background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
      padding: 50px 30px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .confetti {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
    }
    .confetti-piece {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #FFD700;
      opacity: 0.7;
    }
    .header-icon {
      font-size: 80px;
      margin-bottom: 15px;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    .header h1 {
      margin: 0;
      font-size: 36px;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .message {
      font-size: 18px;
      line-height: 1.8;
      color: #333;
      margin: 25px 0;
    }
    .name-highlight {
      font-size: 28px;
      font-weight: 700;
      color: #EC4899;
      margin: 20px 0;
      display: block;
    }
    .wishes-box {
      background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
      border: 2px dashed #F59E0B;
    }
    .wishes-box p {
      margin: 15px 0;
      color: #92400E;
      font-size: 16px;
      line-height: 1.6;
    }
    .emoji-row {
      font-size: 40px;
      margin: 20px 0;
      letter-spacing: 10px;
    }
    .gift-icon {
      font-size: 60px;
      margin: 20px 0;
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
      <div class="header-icon">🎂</div>
      <h1>HAPPY BIRTHDAY!</h1>
    </div>
    
    <div class="content">
      <span class="name-highlight">${firstName} ${lastName}</span>
      
      <div class="emoji-row">🎉 🎈 🎁 🎊 🎈</div>
      
      <div class="message">
        Wishing you a fantastic birthday filled with joy, laughter, and wonderful moments!
      </div>
      
      <div class="wishes-box">
        <div class="gift-icon">🎁</div>
        <p>
          <strong>Today is YOUR special day!</strong><br>
          May this year bring you success, happiness, and exciting opportunities.
        </p>
        <p>
          Thank you for being an amazing part of the Dayflow family. Your dedication and hard work are truly appreciated!
        </p>
        <p>
          Have a wonderful celebration! 🥳
        </p>
      </div>
      
      <div class="message" style="font-style: italic; color: #666;">
        "Age is merely the number of years the world has been enjoying you!"
      </div>
      
      <div class="emoji-row">🌟 ✨ 🎆 ✨ 🌟</div>
      
      <div class="message" style="font-size: 16px; color: #555; margin-top: 30px;">
        From all of us at <strong>Dayflow</strong>,<br>
        Have an absolutely wonderful birthday! 🎂
      </div>
    </div>
    
    <div class="footer">
      <p><strong class="brand">Dayflow</strong> - HR Management System</p>
      <p>Celebrating YOU today! 🎉</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = birthdayTemplate;
