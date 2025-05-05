
/**
 * Enhanced email templates with modern design and responsive layouts
 */

import { formatPrice, formatDate, formatTime } from './emailUtils.ts';

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

interface RecommendedCourse {
  title: string;
  url: string;
}

/**
 * Purchase confirmation email template
 */
export const purchaseConfirmationTemplate = (details: PurchaseDetails): string => {
  const { 
    orderNumber, 
    customerName, 
    customerEmail, 
    courseTitle, 
    courseCoverImage, 
    purchaseDate, 
    purchaseAmount,
    currency = 'USD'
  } = details;
  
  const formattedPrice = formatPrice(purchaseAmount, currency);
  const coverImage = courseCoverImage || 'https://roboquant.academy/lovable-uploads/fd0974dc-cbd8-4af8-b3c8-35c6a8182cf5.png';

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Confirmation</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #eaeaea;
      }
      .header img {
        width: 160px;
        height: auto;
      }
      .content {
        padding: 30px 0;
      }
      .course-card {
        display: flex;
        margin-bottom: 20px;
        border: 1px solid #eaeaea;
        border-radius: 8px;
        overflow: hidden;
      }
      .course-image {
        width: 120px;
        height: 80px;
        object-fit: cover;
      }
      .course-details {
        padding: 10px 15px;
        flex: 1;
      }
      .course-title {
        font-weight: 600;
        margin-bottom: 5px;
        color: #1a1a1a;
      }
      .order-details {
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .detail-label {
        font-weight: 600;
        color: #666;
      }
      .total-row {
        border-top: 2px solid #eaeaea;
        margin-top: 10px;
        padding-top: 10px;
        font-weight: 700;
      }
      .button {
        display: block;
        width: 200px;
        margin: 30px auto 0;
        padding: 12px 20px;
        background-color: #4f46e5;
        color: white;
        text-decoration: none;
        text-align: center;
        border-radius: 6px;
        font-weight: 600;
      }
      .footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #eaeaea;
        color: #666;
        font-size: 12px;
      }
      @media (max-width: 480px) {
        .course-card {
          flex-direction: column;
        }
        .course-image {
          width: 100%;
          height: 160px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Payment Successful</h1>
      </div>
      <div class="content">
        <p>Hello ${customerName},</p>
        <p>Thank you for your purchase! Your enrollment in <strong>RoboQuant Academy</strong> has been confirmed.</p>
        
        <div class="course-card">
          <img class="course-image" src="${coverImage}" alt="${courseTitle}">
          <div class="course-details">
            <div class="course-title">${courseTitle}</div>
            <div>Lifetime Access</div>
          </div>
        </div>
        
        <div class="order-details">
          <h3>Order Summary</h3>
          <div class="detail-row">
            <span class="detail-label">Order Number:</span>
            <span>${orderNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span>${purchaseDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span>${customerEmail}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method:</span>
            <span>Credit Card</span>
          </div>
          <div class="detail-row total-row">
            <span class="detail-label">Total:</span>
            <span>${formattedPrice}</span>
          </div>
        </div>
        
        <a href="https://roboquant.academy/dashboard" class="button">Go to Dashboard</a>
        
        <p>If you have any questions, please contact our support team at <a href="mailto:support@roboquant.ai">support@roboquant.ai</a>.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
        <p>123 Trading St, Algo City, AC 12345</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Course completion email template
 */
export const courseCompletionEnhancedTemplate = (
  studentName: string,
  courseTitle: string,
  completionDate: string,
): string => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Course Completion Certificate</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #eaeaea;
      }
      .certificate {
        margin: 30px auto;
        padding: 30px;
        border: 2px solid #4f46e5;
        border-radius: 8px;
        text-align: center;
        background-color: #f9f9f9;
        position: relative;
        overflow: hidden;
      }
      .certificate::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l99 99M1 51l49 49M51 1l49 49" stroke="%234f46e5" stroke-width="0.5" fill="none" stroke-opacity="0.1"/></svg>');
        opacity: 0.1;
        z-index: 0;
      }
      .certificate-content {
        position: relative;
        z-index: 1;
      }
      .certificate h2 {
        margin-bottom: 20px;
        font-size: 24px;
        color: #4f46e5;
      }
      .certificate p {
        margin: 10px 0;
      }
      .student-name {
        font-size: 28px;
        font-weight: bold;
        margin: 20px 0;
      }
      .course-title {
        font-size: 18px;
        margin: 10px 0;
      }
      .completion-date {
        font-style: italic;
        margin: 20px 0;
      }
      .signature {
        margin-top: 30px;
        font-family: 'Brush Script MT', cursive;
        font-size: 24px;
      }
      .button {
        display: block;
        width: 200px;
        margin: 30px auto;
        padding: 12px 20px;
        background-color: #4f46e5;
        color: white;
        text-decoration: none;
        text-align: center;
        border-radius: 6px;
        font-weight: 600;
      }
      .footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #eaeaea;
        color: #666;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Congratulations!</h1>
        <p>You've successfully completed your course</p>
      </div>
      
      <div class="certificate">
        <div class="certificate-content">
          <h2>Certificate of Completion</h2>
          <p>This certifies that</p>
          <div class="student-name">${studentName}</div>
          <p>has successfully completed</p>
          <div class="course-title">${courseTitle}</div>
          <div class="completion-date">on ${completionDate}</div>
          
          <div class="signature">
            Robert Smith
            <div style="font-family: sans-serif; font-size: 14px;">Robert Smith, Founder</div>
            <div style="font-family: sans-serif; font-size: 14px;">RoboQuant Academy</div>
          </div>
        </div>
      </div>
      
      <p>Dear ${studentName},</p>
      <p>We're thrilled to announce that you have successfully completed the "${courseTitle}" course. This is a significant achievement, and we're proud of your dedication and hard work.</p>
      <p>Your certificate has been issued and is available on your dashboard. You can also download a PDF version for your records.</p>
      
      <a href="https://roboquant.academy/dashboard/certificates" class="button">View Certificate</a>
      
      <p>What's next? Continue your journey with our other advanced trading courses to further enhance your skills.</p>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
        <p>123 Trading St, Algo City, AC 12345</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Abandoned cart email template
 */
export const abandonedCartTemplate = (
  customerName: string,
  courseTitle: string,
  checkoutUrl: string,
): string => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Enrollment</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #eaeaea;
      }
      .content {
        padding: 30px 0;
      }
      .course-card {
        margin: 20px 0;
        padding: 20px;
        border: 1px solid #eaeaea;
        border-radius: 8px;
        background-color: #f9f9f9;
      }
      .reasons {
        margin: 30px 0;
      }
      .reason-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 15px;
      }
      .reason-icon {
        width: 24px;
        height: 24px;
        margin-right: 10px;
        color: #4f46e5;
      }
      .button {
        display: block;
        width: 200px;
        margin: 30px auto;
        padding: 12px 20px;
        background-color: #4f46e5;
        color: white;
        text-decoration: none;
        text-align: center;
        border-radius: 6px;
        font-weight: 600;
      }
      .footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #eaeaea;
        color: #666;
        font-size: 12px;
      }
      .countdown {
        text-align: center;
        margin: 20px 0;
      }
      .timer {
        font-size: 24px;
        font-weight: bold;
        color: #4f46e5;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Your Course is Waiting!</h1>
      </div>
      <div class="content">
        <p>Hello ${customerName},</p>
        <p>We noticed that you started enrolling in <strong>${courseTitle}</strong> but didn't complete your purchase. Your spot is still reserved, but not for long!</p>
        
        <div class="course-card">
          <h3>${courseTitle}</h3>
          <p>Transform your trading with our comprehensive algorithmic trading curriculum. Lifetime access to all course materials, updates, and our supportive community.</p>
        </div>
        
        <div class="countdown">
          <p>Special offer ending soon:</p>
          <div class="timer">20% OFF</div>
          <p>Limited time only</p>
        </div>
        
        <div class="reasons">
          <h3>Why Complete Your Enrollment Now?</h3>
          
          <div class="reason-item">
            <div class="reason-icon">✓</div>
            <div>
              <strong>Lifetime Access</strong>
              <p>One payment for unlimited access to all course materials and future updates.</p>
            </div>
          </div>
          
          <div class="reason-item">
            <div class="reason-icon">✓</div>
            <div>
              <strong>Trading Bots Included</strong>
              <p>Get access to proven algorithmic trading strategies you can implement immediately.</p>
            </div>
          </div>
          
          <div class="reason-item">
            <div class="reason-icon">✓</div>
            <div>
              <strong>30-Day Guarantee</strong>
              <p>If you're not satisfied, we offer a no-questions-asked refund policy.</p>
            </div>
          </div>
        </div>
        
        <a href="${checkoutUrl}" class="button">Complete Enrollment</a>
        
        <p>If you have any questions or need assistance, please reply to this email or contact our support team at <a href="mailto:support@roboquant.ai">support@roboquant.ai</a>.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
        <p>If you no longer wish to receive these emails, <a href="#">unsubscribe here</a>.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Re-engagement email template
 */
export const reEngagementTemplate = (
  customerName: string,
  lastActiveDate: string,
  recommendedCourses: RecommendedCourse[],
): string => {
  const coursesList = recommendedCourses.map(course => `
    <li style="margin-bottom: 15px;">
      <a href="${course.url}" style="color: #4f46e5; font-weight: 600; text-decoration: none;">${course.title}</a>
    </li>
  `).join('');

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We Miss You at RoboQuant Academy</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #eaeaea;
      }
      .content {
        padding: 30px 0;
      }
      .recommended {
        margin: 30px 0;
        padding: 20px;
        border: 1px solid #eaeaea;
        border-radius: 8px;
        background-color: #f9f9f9;
      }
      ul {
        padding-left: 20px;
      }
      .button {
        display: block;
        width: 200px;
        margin: 30px auto;
        padding: 12px 20px;
        background-color: #4f46e5;
        color: white;
        text-decoration: none;
        text-align: center;
        border-radius: 6px;
        font-weight: 600;
      }
      .footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #eaeaea;
        color: #666;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>We Miss You!</h1>
      </div>
      <div class="content">
        <p>Hello ${customerName},</p>
        <p>We noticed it's been a while since you last visited RoboQuant Academy. Your last login was on <strong>${lastActiveDate}</strong>.</p>
        <p>We've been busy adding new content and improving our platform. Have you been busy making profitable trades with the strategies you learned?</p>
        
        <div class="recommended">
          <h3>Recommended Next Steps</h3>
          <p>Based on your interests, we think you might enjoy these resources:</p>
          <ul>
            ${coursesList}
          </ul>
        </div>
        
        <p>The markets don't stand still, and neither does our curriculum. Stay ahead of the curve by continuing your trading education.</p>
        
        <a href="https://roboquant.academy/dashboard" class="button">Return to Dashboard</a>
        
        <p>Need help getting back on track? Our support team is always available at <a href="mailto:support@roboquant.ai">support@roboquant.ai</a>.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.</p>
        <p>If you no longer wish to receive these emails, <a href="#">unsubscribe here</a>.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
