
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Custom email template for email verification
const getEmailVerificationTemplate = (confirmationUrl: string, firstName?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - RoboQuant Academy</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #0F1117;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1A1F2E;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #0080FF 0%, #00E5FF 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }
    .tagline {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
      color: #E1E5E9;
      background-color: #1A1F2E;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #FFFFFF;
    }
    .message {
      font-size: 16px;
      line-height: 1.7;
      margin-bottom: 30px;
      color: #B8BCC8;
    }
    .verify-button {
      display: inline-block;
      background: linear-gradient(135deg, #0080FF 0%, #00E5FF 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: transform 0.2s ease;
      box-shadow: 0 4px 16px rgba(0, 128, 255, 0.3);
    }
    .verify-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 128, 255, 0.4);
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .alternative-text {
      font-size: 14px;
      color: #8B949E;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #30363D;
    }
    .footer {
      background-color: #161B22;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #30363D;
    }
    .footer-text {
      font-size: 12px;
      color: #8B949E;
      margin: 0;
      line-height: 1.5;
    }
    .footer-links {
      margin-top: 15px;
    }
    .footer-links a {
      color: #58A6FF;
      text-decoration: none;
      margin: 0 10px;
      font-size: 12px;
    }
    .security-note {
      background-color: #0D1117;
      border: 1px solid #30363D;
      border-radius: 6px;
      padding: 16px;
      margin: 20px 0;
      font-size: 14px;
      color: #8B949E;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🤖 RoboQuant Academy</div>
      <p class="tagline">Algorithmic Trading Excellence</p>
    </div>
    
    <div class="content">
      <h1 class="greeting">Welcome${firstName ? `, ${firstName}` : ''}!</h1>
      
      <p class="message">
        Thank you for joining RoboQuant Academy! You're just one step away from accessing our comprehensive algorithmic trading courses and tools.
      </p>
      
      <p class="message">
        Click the button below to verify your email address and activate your account:
      </p>
      
      <div class="button-container">
        <a href="${confirmationUrl}" class="verify-button">Verify My Email Address</a>
      </div>
      
      <div class="security-note">
        <strong>🔒 Security Note:</strong> This verification link will expire in 24 hours for your security. If you didn't create an account with RoboQuant Academy, you can safely ignore this email.
      </div>
      
      <div class="alternative-text">
        <p><strong>Having trouble with the button?</strong></p>
        <p>Copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #58A6FF;">${confirmationUrl}</p>
      </div>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        This email was sent to you because you signed up for RoboQuant Academy.<br>
        If you have any questions, reply to this email or contact our support team.
      </p>
      <div class="footer-links">
        <a href="https://roboquant.ai/privacy-policy">Privacy Policy</a>
        <a href="https://roboquant.ai/terms-of-service">Terms of Service</a>
        <a href="https://roboquant.ai/contact">Support</a>
      </div>
      <p class="footer-text" style="margin-top: 20px;">
        © ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Custom email template for password reset
const getPasswordResetTemplate = (resetUrl: string, firstName?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - RoboQuant Academy</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #0F1117;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1A1F2E;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }
    .tagline {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
      color: #E1E5E9;
      background-color: #1A1F2E;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #FFFFFF;
    }
    .message {
      font-size: 16px;
      line-height: 1.7;
      margin-bottom: 30px;
      color: #B8BCC8;
    }
    .reset-button {
      display: inline-block;
      background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: transform 0.2s ease;
      box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
    }
    .reset-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .alternative-text {
      font-size: 14px;
      color: #8B949E;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #30363D;
    }
    .footer {
      background-color: #161B22;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #30363D;
    }
    .footer-text {
      font-size: 12px;
      color: #8B949E;
      margin: 0;
      line-height: 1.5;
    }
    .footer-links {
      margin-top: 15px;
    }
    .footer-links a {
      color: #58A6FF;
      text-decoration: none;
      margin: 0 10px;
      font-size: 12px;
    }
    .security-note {
      background-color: #0D1117;
      border: 1px solid #30363D;
      border-radius: 6px;
      padding: 16px;
      margin: 20px 0;
      font-size: 14px;
      color: #8B949E;
    }
    .warning-box {
      background-color: #1C1E24;
      border-left: 4px solid #F7931E;
      padding: 16px;
      margin: 20px 0;
      border-radius: 0 6px 6px 0;
    }
    .warning-box strong {
      color: #F7931E;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🤖 RoboQuant Academy</div>
      <p class="tagline">Algorithmic Trading Excellence</p>
    </div>
    
    <div class="content">
      <h1 class="greeting">Password Reset Request${firstName ? ` for ${firstName}` : ''}</h1>
      
      <p class="message">
        We received a request to reset the password for your RoboQuant Academy account. No worries - it happens to the best of us!
      </p>
      
      <p class="message">
        Click the button below to create a new password:
      </p>
      
      <div class="button-container">
        <a href="${resetUrl}" class="reset-button">Reset My Password</a>
      </div>
      
      <div class="warning-box">
        <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour for security reasons. If you didn't request this password reset, you can safely ignore this email.
      </div>
      
      <div class="security-note">
        <strong>🔒 Security Tip:</strong> After resetting your password, consider enabling two-factor authentication in your account settings for added security.
      </div>
      
      <div class="alternative-text">
        <p><strong>Having trouble with the button?</strong></p>
        <p>Copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #58A6FF;">${resetUrl}</p>
      </div>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        This email was sent because a password reset was requested for your account.<br>
        If you have any questions, reply to this email or contact our support team.
      </p>
      <div class="footer-links">
        <a href="https://roboquant.ai/privacy-policy">Privacy Policy</a>
        <a href="https://roboquant.ai/terms-of-service">Terms of Service</a>
        <a href="https://roboquant.ai/contact">Support</a>
      </div>
      <p class="footer-text" style="margin-top: 20px;">
        © ${new Date().getFullYear()} RoboQuant Academy. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    console.log("=== Custom Auth Emails Function Called ===");
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    const payload = await req.text();
    console.log("Raw payload:", payload);
    
    // Parse the webhook payload
    const body = JSON.parse(payload);
    console.log("Parsed webhook payload:", JSON.stringify(body, null, 2));
    
    const { user, email_data } = body;
    
    if (!email_data) {
      console.error("No email_data found in webhook payload");
      return new Response(JSON.stringify({ error: "No email_data found" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    
    const { email_action_type, token_hash, redirect_to } = email_data;
    
    console.log("Email action type:", email_action_type);
    console.log("User email:", user?.email);
    console.log("Token hash (first 10 chars):", token_hash?.substring(0, 10));
    console.log("Redirect to:", redirect_to);
    
    if (!user?.email) {
      console.error("No user email found in webhook payload");
      return new Response(JSON.stringify({ error: "No user email found" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    
    // Get user metadata for personalization
    const firstName = user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || '';
    console.log("User first name:", firstName);
    
    let subject = "";
    let htmlContent = "";
    
    if (email_action_type === "signup") {
      console.log("Processing signup confirmation email");
      // Email verification
      const confirmationUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to || 'https://roboquant.ai/dashboard'}`;
      
      subject = "Welcome to RoboQuant Academy - Verify Your Email";
      htmlContent = getEmailVerificationTemplate(confirmationUrl, firstName);
      
    } else if (email_action_type === "recovery") {
      console.log("Processing password recovery email");
      // Password reset
      const resetUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${redirect_to || 'https://roboquant.ai/auth?tab=reset'}`;
      
      subject = "Reset Your RoboQuant Academy Password";
      htmlContent = getPasswordResetTemplate(resetUrl, firstName);
    } else {
      console.log(`Unknown email action type: ${email_action_type}`);
      return new Response(JSON.stringify({ error: "Unknown email action type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    
    console.log("Sending email with subject:", subject);
    console.log("To:", user.email);
    
    // Send the email using Resend
    const emailResponse = await resend.emails.send({
      from: "RoboQuant Academy <team@roboquant.ai>",
      to: [user.email],
      subject: subject,
      html: htmlContent,
    });
    
    console.log("Email sent successfully:", emailResponse);
    
    return new Response(JSON.stringify({
      success: true,
      message: "Custom email sent successfully",
      emailId: emailResponse.id,
      emailActionType: email_action_type
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
    
  } catch (error: any) {
    console.error("Error in custom-auth-emails function:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

serve(handler);
