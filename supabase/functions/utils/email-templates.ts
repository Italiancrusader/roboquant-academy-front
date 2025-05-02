
export const welcomeEmailTemplate = (firstName: string, courseName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(45deg, #0080FF, #00E5FF);
      padding: 20px;
      color: white;
      text-align: center;
      border-radius: 4px 4px 0 0;
    }
    .content {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 0 0 4px 4px;
    }
    .button {
      display: inline-block;
      padding: 12px 20px;
      background: linear-gradient(45deg, #0080FF, #00E5FF);
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to RoboQuant Academy!</h1>
    </div>
    <div class="content">
      <p>Hello ${firstName || 'there'},</p>
      <p>Thank you for enrolling in <strong>${courseName}</strong>. We're excited to have you join our community of algo traders!</p>
      <p>Here's what you can expect:</p>
      <ul>
        <li>Comprehensive video lessons</li>
        <li>Practical exercises</li>
        <li>Community support</li>
        <li>Regular updates and new content</li>
      </ul>
      <p>Ready to start learning?</p>
      <a href="https://roboquantacademy.com/dashboard" class="button">Start Learning Now</a>
      <p>If you have any questions, don't hesitate to reach out to our support team.</p>
      <p>Happy trading!</p>
      <p>The RoboQuant Academy Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
      <p><a href="https://roboquantacademy.com/privacy-policy">Privacy Policy</a> | <a href="https://roboquantacademy.com/terms-of-service">Terms of Service</a></p>
    </div>
  </div>
</body>
</html>
`;

export const courseCompletionTemplate = (firstName: string, courseName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(45deg, #0080FF, #00E5FF);
      padding: 20px;
      color: white;
      text-align: center;
      border-radius: 4px 4px 0 0;
    }
    .content {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 0 0 4px 4px;
    }
    .achievement {
      text-align: center;
      margin: 30px 0;
    }
    .achievement img {
      max-width: 150px;
    }
    .button {
      display: inline-block;
      padding: 12px 20px;
      background: linear-gradient(45deg, #0080FF, #00E5FF);
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Congratulations on Completing Your Course!</h1>
    </div>
    <div class="content">
      <div class="achievement">
        <img src="https://roboquantacademy.com/certificate.png" alt="Certificate of Completion">
        <h2>Certificate of Completion</h2>
      </div>
      <p>Hello ${firstName || 'there'},</p>
      <p>Congratulations on completing <strong>${courseName}</strong>! This is a significant achievement, and we're proud of your dedication to learning.</p>
      <p>You've gained valuable skills that will help you in your algo trading journey.</p>
      <p>What's next?</p>
      <ul>
        <li>Download your certificate of completion</li>
        <li>Share your achievement with your network</li>
        <li>Explore our other courses to continue your learning journey</li>
      </ul>
      <p>Ready to take your skills to the next level?</p>
      <a href="https://roboquantacademy.com/courses" class="button">Explore More Courses</a>
      <p>Thank you for choosing RoboQuant Academy for your learning needs.</p>
      <p>Best regards,</p>
      <p>The RoboQuant Academy Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
      <p><a href="https://roboquantacademy.com/privacy-policy">Privacy Policy</a> | <a href="https://roboquantacademy.com/terms-of-service">Terms of Service</a></p>
    </div>
  </div>
</body>
</html>
`;
