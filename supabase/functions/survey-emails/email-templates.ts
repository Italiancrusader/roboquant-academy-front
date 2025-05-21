
// Email template for qualified leads
export const qualifiedTemplate = ({ firstName = 'there', callUrl = 'https://roboquant.ai/book-call' }) => `
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
      font-weight: bold;
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
      <h1>You're Qualified for a Strategy Call!</h1>
    </div>
    <div class="content">
      <p>Hello ${firstName},</p>
      <p>Congratulations! Based on your qualification survey, you've been selected for a personalized strategy call with one of our expert traders.</p>
      <p>During this call, we'll discuss:</p>
      <ul>
        <li>Your trading goals and challenges</li>
        <li>How our proven strategies can help you achieve consistent profitability</li>
        <li>A customized plan to enhance your trading performance</li>
      </ul>
      <p><strong>The next step is to schedule your call at a time that works for you:</strong></p>
      <div style="text-align: center;">
        <a href="${callUrl}" class="button">Schedule Your Strategy Call Now</a>
      </div>
      <p>This call is complimentary and comes with no obligation. Our goal is simply to understand your needs and determine if we're the right fit to help you succeed.</p>
      <p>If you have any questions before the call, reply to this email and our team will be happy to assist.</p>
      <p>Looking forward to speaking with you!</p>
      <p>The RoboQuant Academy Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
      <p><a href="https://roboquant.ai/privacy-policy">Privacy Policy</a> | <a href="https://roboquant.ai/terms-of-service">Terms of Service</a> | <a href="https://roboquant.ai/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

// Email template for non-qualified leads
export const nonQualifiedTemplate = ({ firstName = 'there', checkoutUrl = 'https://roboquant.ai/checkout' }) => `
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
      font-weight: bold;
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
      <h1>Your Path to Trading Success Starts Here</h1>
    </div>
    <div class="content">
      <p>Hello ${firstName},</p>
      <p>Thank you for completing our qualification survey. Based on your responses, we've selected our self-paced RoboQuant Academy course as the perfect starting point for your trading journey.</p>
      <p>This comprehensive program will provide you with:</p>
      <ul>
        <li>Step-by-step trading strategies that work in any market condition</li>
        <li>Access to our proprietary trading indicators and tools</li>
        <li>Detailed lessons on risk management and capital preservation</li>
        <li>A supportive community of fellow traders</li>
      </ul>
      <p>While you build your trading foundation and capital base, this course will set you on the path to consistent profitability:</p>
      <div style="text-align: center;">
        <a href="${checkoutUrl}" class="button">Enroll in RoboQuant Academy Now</a>
      </div>
      <p>After completing the program and building your trading capital, you'll be perfectly positioned for our advanced mentorship program in the future.</p>
      <p>If you have any questions about the course, simply reply to this email and our team will be happy to help.</p>
      <p>To your trading success,</p>
      <p>The RoboQuant Academy Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
      <p><a href="https://roboquant.ai/privacy-policy">Privacy Policy</a> | <a href="https://roboquant.ai/terms-of-service">Terms of Service</a> | <a href="https://roboquant.ai/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

// Reminder email template for qualified leads who haven't booked yet
export const reminderTemplate = ({ firstName = 'there', callUrl = 'https://roboquant.ai/book-call', daysLeft = 3 }) => `
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
      font-weight: bold;
    }
    .urgency {
      background-color: #fff0e0;
      border-left: 4px solid #ff9800;
      padding: 10px 15px;
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
      <h1>Don't Miss Your Strategy Call Opportunity</h1>
    </div>
    <div class="content">
      <p>Hello ${firstName},</p>
      <p>I noticed that you haven't booked your complimentary strategy call with our trading team yet.</p>
      <div class="urgency">
        <p><strong>Limited Availability:</strong> Our calendar is filling up quickly, and we have only a few spots remaining this week.</p>
        ${daysLeft ? `<p>Your opportunity to book this complimentary call expires in <strong>${daysLeft} days</strong>.</p>` : ''}
      </div>
      <p>As a reminder, during this personalized call, our expert trader will:</p>
      <ul>
        <li>Review your current trading approach and identify improvement areas</li>
        <li>Share specific strategies that align with your trading goals</li>
        <li>Provide actionable steps to enhance your trading results</li>
      </ul>
      <div style="text-align: center;">
        <a href="${callUrl}" class="button">Reserve Your Call Now</a>
      </div>
      <p>This call is completely free and comes with no obligation. We're simply committed to helping serious traders like you achieve consistent results.</p>
      <p>If you have any questions or need assistance with scheduling, reply to this email and we'll help you right away.</p>
      <p>Looking forward to speaking with you,</p>
      <p>The RoboQuant Academy Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
      <p><a href="https://roboquant.ai/privacy-policy">Privacy Policy</a> | <a href="https://roboquant.ai/terms-of-service">Terms of Service</a> | <a href="https://roboquant.ai/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

// Educational sequence email template
export const educationalTemplate = ({ 
  firstName = 'there', 
  lessonNumber = 1,
  lessonTitle = 'Getting Started with Algorithmic Trading',
  lessonContent = '',
  callToActionUrl = 'https://roboquant.ai/learn-more',
  callToActionText = 'Learn More'
}) => `
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
    .lesson-number {
      background: rgba(255,255,255,0.2);
      border-radius: 50px;
      padding: 5px 15px;
      font-size: 14px;
      margin-bottom: 10px;
      display: inline-block;
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
      font-weight: bold;
    }
    .tip-box {
      background-color: #e9f7fe;
      border-left: 4px solid #0080FF;
      padding: 10px 15px;
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
      <div class="lesson-number">Lesson ${lessonNumber}</div>
      <h1>${lessonTitle}</h1>
    </div>
    <div class="content">
      <p>Hello ${firstName},</p>
      <p>Welcome to lesson ${lessonNumber} in our trading education series. Today, we're exploring ${lessonTitle}.</p>
      
      ${lessonContent || `
      <p>In today's competitive markets, algorithmic trading offers significant advantages:</p>
      <ul>
        <li>Elimination of emotional trading decisions</li>
        <li>Ability to backtest strategies against historical data</li>
        <li>Consistent execution and risk management</li>
        <li>Capacity to monitor multiple markets simultaneously</li>
      </ul>
      
      <div class="tip-box">
        <p><strong>Pro Tip:</strong> Start with simple algorithms that automate one aspect of your trading, such as entry signals or position sizing, before developing more complex systems.</p>
      </div>
      
      <p>The key to successful algorithmic trading is not just the complexity of your code, but the robustness of your strategy and risk management rules.</p>
      `}
      
      <div style="text-align: center;">
        <a href="${callToActionUrl}" class="button">${callToActionText}</a>
      </div>
      
      <p>Stay tuned for our next lesson where we'll cover essential risk management techniques that every trader should implement.</p>
      
      <p>Happy trading,</p>
      <p>The RoboQuant Academy Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
      <p><a href="https://roboquant.ai/privacy-policy">Privacy Policy</a> | <a href="https://roboquant.ai/terms-of-service">Terms of Service</a> | <a href="https://roboquant.ai/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

// Special offer email template
export const specialOfferTemplate = ({ 
  firstName = 'there', 
  offerDetails = {
    discount: '30%',
    originalPrice: '$997',
    discountedPrice: '$697',
    productName: 'RoboQuant Academy Pro'
  },
  expiryDate = '7 days',
  checkoutUrl = 'https://roboquant.ai/special-offer'
}) => `
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
      font-weight: bold;
    }
    .offer-box {
      background-color: #f8f4ff;
      border: 2px dashed #9370DB;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .price {
      font-size: 24px;
      font-weight: bold;
      color: #9370DB;
    }
    .original-price {
      text-decoration: line-through;
      color: #666;
      margin-right: 10px;
    }
    .countdown {
      background-color: #ffe9e9;
      border-left: 4px solid #ff5252;
      padding: 10px 15px;
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
      <h1>Special Limited-Time Offer</h1>
    </div>
    <div class="content">
      <p>Hello ${firstName},</p>
      <p>We noticed that you completed our trading qualification survey but haven't taken the next step yet. To help you get started on your trading journey, we've prepared a special offer just for you.</p>
      
      <div class="offer-box">
        <h2>${offerDetails.discount} OFF ${offerDetails.productName}</h2>
        <p class="price"><span class="original-price">${offerDetails.originalPrice}</span> ${offerDetails.discountedPrice}</p>
        <p>Complete Trading System + Lifetime Updates</p>
      </div>
      
      <p>With this exclusive offer, you'll get complete access to:</p>
      <ul>
        <li>Our complete algorithmic trading framework</li>
        <li>60+ video lessons with step-by-step instructions</li>
        <li>Proprietary trading indicators and tools</li>
        <li>Community support from fellow traders</li>
        <li>Lifetime updates as we enhance our strategies</li>
      </ul>
      
      <div class="countdown">
        <p><strong>This offer expires in ${expiryDate}!</strong></p>
        <p>After that, the price returns to normal and this discount won't be available again.</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${checkoutUrl}" class="button">Claim Your ${offerDetails.discount} Discount Now</a>
      </div>
      
      <p>If you have any questions about this offer or our program, simply reply to this email.</p>
      
      <p>To your trading success,</p>
      <p>The RoboQuant Academy Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
      <p><a href="https://roboquant.ai/privacy-policy">Privacy Policy</a> | <a href="https://roboquant.ai/terms-of-service">Terms of Service</a> | <a href="https://roboquant.ai/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

// Re-engagement email template
export const reEngagementTemplate = ({ 
  firstName = 'there', 
  daysInactive = 30,
  checkoutUrl = 'https://roboquant.ai/checkout',
  surveyUrl = 'https://roboquant.ai/survey'
}) => `
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
      font-weight: bold;
    }
    .button-secondary {
      display: inline-block;
      padding: 12px 20px;
      background: white;
      color: #0080FF;
      text-decoration: none;
      border: 1px solid #0080FF;
      border-radius: 4px;
      margin: 20px 10px;
      font-weight: bold;
    }
    .update-box {
      background-color: #f0f0f0;
      border-radius: 4px;
      padding: 15px;
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
      <h1>We've Missed You, ${firstName}!</h1>
    </div>
    <div class="content">
      <p>Hello ${firstName},</p>
      <p>It's been about ${daysInactive} days since you completed our trading qualification survey, and we wanted to check in.</p>
      
      <p>Since you last visited, we've made some exciting updates to our trading program:</p>
      
      <div class="update-box">
        <ul>
          <li><strong>New Strategy Modules:</strong> We've added two new algorithmic trading strategies specifically designed for volatile markets</li>
          <li><strong>Enhanced Backtesting Tools:</strong> Our platform now includes more robust backtesting capabilities for strategy validation</li>
          <li><strong>Expanded Community Features:</strong> Connect with fellow traders in our newly redesigned community portal</li>
        </ul>
      </div>
      
      <p>We understand that improving your trading results remains a priority for you, and we'd love to help you achieve your goals.</p>
      
      <p>You have two options to move forward:</p>
      
      <div style="text-align: center;">
        <a href="${checkoutUrl}" class="button">Enroll in the Program</a>
        <a href="${surveyUrl}" class="button-secondary">Take Updated Survey</a>
      </div>
      
      <p>If you're facing any challenges or have questions that are holding you back, simply reply to this email. Our team is here to assist.</p>
      
      <p>Looking forward to reconnecting,</p>
      <p>The RoboQuant Academy Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
      <p><a href="https://roboquant.ai/privacy-policy">Privacy Policy</a> | <a href="https://roboquant.ai/terms-of-service">Terms of Service</a> | <a href="https://roboquant.ai/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;
