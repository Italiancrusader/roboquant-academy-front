
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
  // Use a fallback image URL with the full domain to ensure it loads properly
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
        
        <p>If you have any questions, please contact our support team at <a href="mailto:info@roboquant.ai">info@roboquant.ai</a>.</p>
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
