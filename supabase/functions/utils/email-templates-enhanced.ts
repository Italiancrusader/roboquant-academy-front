
/**
 * Enhanced email templates with modern design and responsive layouts
 */

import { formatPrice, formatDate, formatTime } from '../../../src/utils/emailUtils';

interface PurchaseDetails {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  courseTitle: string;
  courseCoverImage?: string;
  purchaseDate: string;
  purchaseAmount: number;
  currency?: string;
}

export const purchaseConfirmationTemplate = (details: PurchaseDetails) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Confirmation - RoboQuant Academy</title>
  <style>
    /* Base Styles */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      -webkit-font-smoothing: antialiased;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      padding: 30px;
      background: linear-gradient(135deg, #0080FF 0%, #00B4FF 100%);
      text-align: center;
    }
    .logo {
      max-width: 180px;
      margin-bottom: 20px;
    }
    .header-text {
      color: white;
      margin: 0;
      font-weight: 600;
      font-size: 24px;
    }
    .body {
      padding: 30px;
      color: #333;
    }
    .order-info {
      background: #f6f9fc;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 25px;
    }
    .order-number {
      font-weight: bold;
      color: #0080FF;
      margin-top: 0;
    }
    .order-date {
      margin-bottom: 0;
      color: #666;
      font-size: 14px;
    }
    .divider {
      border-top: 1px solid #e6e6e6;
      margin: 25px 0;
    }
    .item {
      display: flex;
      margin-bottom: 15px;
      gap: 15px;
    }
    .item-image {
      width: 80px;
      height: 80px;
      background-color: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }
    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .item-details {
      flex: 1;
    }
    .item-title {
      margin-top: 0;
      margin-bottom: 5px;
      font-weight: 600;
    }
    .item-description {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .price {
      display: block;
      font-weight: 600;
      margin-top: 8px;
      font-size: 16px;
    }
    .total {
      text-align: right;
      font-weight: bold;
      font-size: 18px;
      margin-top: 25px;
      margin-bottom: 0;
    }
    .cta {
      text-align: center;
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      background: #0080FF;
      color: white;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 4px;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-size: 14px;
    }
    .info-box {
      background: #edf7ff;
      border-left: 4px solid #0080FF;
      padding: 15px 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .info-box h3 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #0080FF;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
    }
    .footer {
      background: #f9f9f9;
      padding: 25px 30px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .social {
      margin-bottom: 15px;
    }
    .social a {
      display: inline-block;
      margin: 0 8px;
      text-decoration: none;
    }
    .social img {
      width: 24px;
      height: 24px;
      opacity: 0.7;
    }
    .links {
      margin-bottom: 15px;
    }
    .links a {
      color: #0080FF;
      text-decoration: none;
      margin: 0 8px;
    }
    .copyright {
      margin-top: 15px;
      margin-bottom: 0;
    }
    
    /* Responsive styling */
    @media screen and (max-width: 550px) {
      .header, .body, .footer {
        padding: 20px;
      }
      .item {
        flex-direction: column;
        gap: 10px;
      }
      .item-image {
        width: 100%;
        max-width: 120px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://roboquant.academy/lovable-uploads/c963f161-8e34-4c56-be8a-40e2625c6be0.png" alt="RoboQuant Academy Logo" class="logo">
      <h1 class="header-text">Purchase Confirmation</h1>
    </div>
    <div class="body">
      <p>Dear ${details.customerName},</p>
      <p>Thank you for your purchase! We're excited to welcome you to RoboQuant Academy.</p>
      
      <div class="order-info">
        <h2 class="order-number">Order #${details.orderNumber}</h2>
        <p class="order-date">Date: ${details.purchaseDate}</p>
      </div>
      
      <h3>Order Summary</h3>
      <div class="item">
        <div class="item-image">
          ${details.courseCoverImage ? 
            `<img src="${details.courseCoverImage}" alt="${details.courseTitle}" />` : 
            `<div style="height:100%;display:flex;align-items:center;justify-content:center;background:#0080FF;color:white;font-weight:bold;">RQ</div>`
          }
        </div>
        <div class="item-details">
          <h4 class="item-title">${details.courseTitle}</h4>
          <p class="item-description">Lifetime access</p>
          <span class="price">${formatPrice(details.purchaseAmount, details.currency)}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      <p class="total">Total: ${formatPrice(details.purchaseAmount, details.currency)}</p>
      
      <div class="cta">
        <a href="https://roboquant.academy/dashboard" class="button">Start Learning Now</a>
      </div>
      
      <div class="info-box">
        <h3>Getting Started</h3>
        <p>You can access your course anytime by logging into your account. If you have any questions about your purchase or need assistance, please contact our support team at <a href="mailto:info@roboquant.ai">info@roboquant.ai</a>.</p>
      </div>
      
    </div>
    <div class="footer">
      <div class="social">
        <a href="https://discord.gg/7sU4DmvmpW" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" alt="Discord">
        </a>
        <a href="https://www.instagram.com/timhutter.official/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram">
        </a>
        <a href="https://t.me/tradepiloteabot" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111644.png" alt="Telegram">
        </a>
      </div>
      <div class="links">
        <a href="https://roboquant.academy/privacy-policy">Privacy Policy</a>
        <a href="https://roboquant.academy/terms-of-service">Terms of Service</a>
        <a href="https://roboquant.academy/contact">Contact Us</a>
      </div>
      <p class="copyright">&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const courseCompletionEnhancedTemplate = (firstName: string, courseName: string, completionDate: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Course Completion - RoboQuant Academy</title>
  <style>
    /* Base Styles */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      -webkit-font-smoothing: antialiased;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      padding: 30px;
      background: linear-gradient(135deg, #0080FF 0%, #00B4FF 100%);
      text-align: center;
    }
    .logo {
      max-width: 180px;
      margin-bottom: 20px;
    }
    .header-text {
      color: white;
      margin: 0;
      font-weight: 600;
      font-size: 24px;
    }
    .body {
      padding: 30px;
      color: #333;
      text-align: center;
    }
    .achievement {
      margin: 30px 0;
    }
    .certificate {
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
      padding: 30px;
      border: 3px solid #0080FF;
      border-radius: 10px;
      position: relative;
      background-color: #fff;
    }
    .certificate-heading {
      font-size: 24px;
      color: #0080FF;
      margin-top: 0;
      margin-bottom: 10px;
    }
    .certificate-subheading {
      font-size: 16px;
      color: #333;
      margin-top: 0;
      margin-bottom: 30px;
    }
    .certificate-name {
      font-size: 28px;
      font-weight: bold;
      color: #333;
      margin: 20px 0;
    }
    .certificate-course {
      font-size: 18px;
      margin: 10px 0 30px;
    }
    .certificate-date {
      font-size: 14px;
      color: #666;
      margin-bottom: 15px;
    }
    .certificate-signature {
      width: 150px;
      margin: 0 auto;
      border-top: 1px solid #333;
      padding-top: 10px;
      font-size: 12px;
      color: #666;
    }
    .certificate-seal {
      position: absolute;
      bottom: 30px;
      right: 30px;
      width: 70px;
      height: 70px;
      background: #0080FF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }
    .cta {
      text-align: center;
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      background: #0080FF;
      color: white;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 4px;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-size: 14px;
    }
    .next-steps {
      margin-top: 30px;
      padding: 20px;
      background: #f6f9fc;
      border-radius: 6px;
      text-align: left;
    }
    .next-steps h3 {
      margin-top: 0;
      color: #0080FF;
    }
    .next-steps ul {
      padding-left: 20px;
      margin-bottom: 0;
    }
    .next-steps li {
      margin-bottom: 10px;
    }
    .footer {
      background: #f9f9f9;
      padding: 25px 30px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .social {
      margin-bottom: 15px;
    }
    .social a {
      display: inline-block;
      margin: 0 8px;
      text-decoration: none;
    }
    .social img {
      width: 24px;
      height: 24px;
      opacity: 0.7;
    }
    .links {
      margin-bottom: 15px;
    }
    .links a {
      color: #0080FF;
      text-decoration: none;
      margin: 0 8px;
    }
    .copyright {
      margin-top: 15px;
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://roboquant.academy/lovable-uploads/c963f161-8e34-4c56-be8a-40e2625c6be0.png" alt="RoboQuant Academy Logo" class="logo">
      <h1 class="header-text">Congratulations!</h1>
    </div>
    <div class="body">
      <p>Hello ${firstName || 'there'},</p>
      <p>We're thrilled to inform you that you've successfully completed <strong>${courseName}</strong>!</p>
      
      <div class="achievement">
        <div class="certificate">
          <h2 class="certificate-heading">Certificate of Completion</h2>
          <p class="certificate-subheading">This certificate is awarded to</p>
          <p class="certificate-name">${firstName || 'Student'}</p>
          <p class="certificate-course">for successfully completing<br><strong>${courseName}</strong></p>
          <p class="certificate-date">Completed on ${completionDate}</p>
          <div class="certificate-signature">Tim Hutter<br>Lead Instructor</div>
          <div class="certificate-seal">RQA</div>
        </div>
      </div>
      
      <div class="cta">
        <a href="https://roboquant.academy/dashboard/certificates" class="button">Download Your Certificate</a>
      </div>
      
      <div class="next-steps">
        <h3>What's Next?</h3>
        <ul>
          <li>Apply your new skills by creating your first fully automated trading bot</li>
          <li>Join our Discord community to connect with fellow traders</li>
          <li>Explore our other courses to expand your knowledge</li>
          <li>Share your achievement on social media</li>
        </ul>
      </div>
      
    </div>
    <div class="footer">
      <div class="social">
        <a href="https://discord.gg/7sU4DmvmpW" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" alt="Discord">
        </a>
        <a href="https://www.instagram.com/timhutter.official/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram">
        </a>
        <a href="https://t.me/tradepiloteabot" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111644.png" alt="Telegram">
        </a>
      </div>
      <div class="links">
        <a href="https://roboquant.academy/privacy-policy">Privacy Policy</a>
        <a href="https://roboquant.academy/terms-of-service">Terms of Service</a>
        <a href="https://roboquant.academy/contact">Contact Us</a>
      </div>
      <p class="copyright">&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const abandonedCartTemplate = (firstName: string, courseTitle: string, checkoutUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your RoboQuant Academy Enrollment</title>
  <style>
    /* Base Styles */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      -webkit-font-smoothing: antialiased;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      padding: 30px;
      background: linear-gradient(135deg, #0080FF 0%, #00B4FF 100%);
      text-align: center;
    }
    .logo {
      max-width: 180px;
      margin-bottom: 20px;
    }
    .header-text {
      color: white;
      margin: 0;
      font-weight: 600;
      font-size: 24px;
    }
    .body {
      padding: 30px;
      color: #333;
    }
    .countdown {
      background: #edf7ff;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
      margin-bottom: 25px;
    }
    .countdown h3 {
      margin-top: 0;
      color: #0080FF;
    }
    .countdown p {
      margin-bottom: 0;
      font-size: 14px;
      color: #333;
    }
    .cta {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: #0080FF;
      color: white;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 4px;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-size: 14px;
    }
    .reasons {
      margin-top: 25px;
    }
    .reason {
      margin-bottom: 20px;
      padding-left: 25px;
      position: relative;
    }
    .reason:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #0080FF;
      font-weight: bold;
    }
    .reason h4 {
      margin: 0 0 5px 0;
    }
    .reason p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    .testimonial {
      background: #f6f9fc;
      padding: 20px;
      border-radius: 6px;
      margin-top: 25px;
    }
    .testimonial-text {
      font-style: italic;
      margin-top: 0;
      margin-bottom: 10px;
    }
    .testimonial-author {
      text-align: right;
      margin-bottom: 0;
      font-weight: 500;
      color: #0080FF;
    }
    .help {
      margin-top: 25px;
      font-size: 14px;
      color: #666;
    }
    .footer {
      background: #f9f9f9;
      padding: 25px 30px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .social {
      margin-bottom: 15px;
    }
    .social a {
      display: inline-block;
      margin: 0 8px;
      text-decoration: none;
    }
    .social img {
      width: 24px;
      height: 24px;
      opacity: 0.7;
    }
    .links {
      margin-bottom: 15px;
    }
    .links a {
      color: #0080FF;
      text-decoration: none;
      margin: 0 8px;
    }
    .copyright {
      margin-top: 15px;
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://roboquant.academy/lovable-uploads/c963f161-8e34-4c56-be8a-40e2625c6be0.png" alt="RoboQuant Academy Logo" class="logo">
      <h1 class="header-text">Course Reserved</h1>
    </div>
    <div class="body">
      <p>Hello ${firstName || 'there'},</p>
      <p>We noticed that you started enrolling in <strong>${courseTitle}</strong> but didn't complete your purchase.</p>
      
      <div class="countdown">
        <h3>Your spot is reserved for the next 48 hours</h3>
        <p>After that, we can't guarantee availability at this special rate.</p>
      </div>
      
      <p>We've saved your enrollment information so you can quickly complete your purchase with just one click:</p>
      
      <div class="cta">
        <a href="${checkoutUrl}" class="button">Complete Enrollment Now</a>
      </div>
      
      <div class="reasons">
        <h3>Why students love this course:</h3>
        
        <div class="reason">
          <h4>Save time and money</h4>
          <p>Build fully-automated trading bots without coding, saving thousands in development costs.</p>
        </div>
        
        <div class="reason">
          <h4>Learn practical skills</h4>
          <p>Step-by-step guidance from industry experts with proven strategies.</p>
        </div>
        
        <div class="reason">
          <h4>Lifetime access</h4>
          <p>Access course content forever, including all future updates and improvements.</p>
        </div>
      </div>
      
      <div class="testimonial">
        <p class="testimonial-text">"RoboQuant Academy completely transformed my trading. I deployed my first bot within a week and have been seeing consistent profits since. The no-code approach made it accessible for me."</p>
        <p class="testimonial-author">— Michael T., RoboQuant Student</p>
      </div>
      
      <div class="help">
        <p>Having trouble completing your purchase? Reply to this email or contact us at <a href="mailto:info@roboquant.ai">info@roboquant.ai</a> and we'll help you get enrolled.</p>
      </div>
      
    </div>
    <div class="footer">
      <div class="social">
        <a href="https://discord.gg/7sU4DmvmpW" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" alt="Discord">
        </a>
        <a href="https://www.instagram.com/timhutter.official/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram">
        </a>
        <a href="https://t.me/tradepiloteabot" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111644.png" alt="Telegram">
        </a>
      </div>
      <div class="links">
        <a href="https://roboquant.academy/privacy-policy">Privacy Policy</a>
        <a href="https://roboquant.academy/terms-of-service">Terms of Service</a>
        <a href="https://roboquant.academy/contact">Contact Us</a>
      </div>
      <p class="copyright">&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const reEngagementTemplate = (firstName: string, lastActive: string, recommendedCourses: { title: string, url: string }[] = []) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We Miss You at RoboQuant Academy</title>
  <style>
    /* Base Styles */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      -webkit-font-smoothing: antialiased;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      padding: 30px;
      background: linear-gradient(135deg, #0080FF 0%, #00B4FF 100%);
      text-align: center;
    }
    .logo {
      max-width: 180px;
      margin-bottom: 20px;
    }
    .header-text {
      color: white;
      margin: 0;
      font-weight: 600;
      font-size: 24px;
    }
    .body {
      padding: 30px;
      color: #333;
    }
    .cta {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: #0080FF;
      color: white;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 4px;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-size: 14px;
    }
    .recommendations {
      margin-top: 30px;
    }
    .course-card {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
      transition: transform 0.2s;
    }
    .course-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    .course-title {
      color: #0080FF;
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 18px;
    }
    .course-button {
      display: inline-block;
      background: transparent;
      color: #0080FF;
      border: 1px solid #0080FF;
      text-decoration: none;
      padding: 8px 15px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .update {
      background: #f6f9fc;
      padding: 20px;
      border-radius: 6px;
      margin-top: 30px;
    }
    .update h3 {
      margin-top: 0;
      color: #0080FF;
    }
    .update p {
      margin-bottom: 0;
    }
    .footer {
      background: #f9f9f9;
      padding: 25px 30px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .social {
      margin-bottom: 15px;
    }
    .social a {
      display: inline-block;
      margin: 0 8px;
      text-decoration: none;
    }
    .social img {
      width: 24px;
      height: 24px;
      opacity: 0.7;
    }
    .links {
      margin-bottom: 15px;
    }
    .links a {
      color: #0080FF;
      text-decoration: none;
      margin: 0 8px;
    }
    .copyright {
      margin-top: 15px;
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://roboquant.academy/lovable-uploads/c963f161-8e34-4c56-be8a-40e2625c6be0.png" alt="RoboQuant Academy Logo" class="logo">
      <h1 class="header-text">We Miss You!</h1>
    </div>
    <div class="body">
      <p>Hello ${firstName || 'there'},</p>
      <p>We noticed it's been a while since you last visited RoboQuant Academy. Your last login was on <strong>${lastActive}</strong>, and we wanted to check in to see how you're doing with your algorithmic trading journey.</p>
      
      <p>The trading world moves quickly, and staying up-to-date with the latest strategies and tools is essential for success. We've been busy adding new content and improving our platform.</p>
      
      <div class="cta">
        <a href="https://roboquant.academy/dashboard" class="button">Return to Your Dashboard</a>
      </div>
      
      <div class="recommendations">
        <h3>Recommended for You:</h3>
        
        ${recommendedCourses.map(course => `
          <div class="course-card">
            <h4 class="course-title">${course.title}</h4>
            <a href="${course.url}" class="course-button">Explore Course</a>
          </div>
        `).join('')}
        
        ${recommendedCourses.length === 0 ? `
          <div class="course-card">
            <h4 class="course-title">Advanced Bot Strategies</h4>
            <a href="https://roboquant.academy/courses/advanced-bot-strategies" class="course-button">Explore Course</a>
          </div>
          <div class="course-card">
            <h4 class="course-title">Risk Management Masterclass</h4>
            <a href="https://roboquant.academy/courses/risk-management" class="course-button">Explore Course</a>
          </div>
        ` : ''}
      </div>
      
      <div class="update">
        <h3>Platform Updates</h3>
        <p>We've made significant improvements to our platform including enhanced backtesting capabilities, new trading strategies, and additional community features. Log in to check out all the exciting changes!</p>
      </div>
      
    </div>
    <div class="footer">
      <div class="social">
        <a href="https://discord.gg/7sU4DmvmpW" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" alt="Discord">
        </a>
        <a href="https://www.instagram.com/timhutter.official/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram">
        </a>
        <a href="https://t.me/tradepiloteabot" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111644.png" alt="Telegram">
        </a>
      </div>
      <div class="links">
        <a href="https://roboquant.academy/privacy-policy">Privacy Policy</a>
        <a href="https://roboquant.academy/terms-of-service">Terms of Service</a>
        <a href="https://roboquant.academy/contact">Contact Us</a>
      </div>
      <p class="copyright">&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
