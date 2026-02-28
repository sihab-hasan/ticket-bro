"use strict";

const env = require("../../../config/env");

const baseTemplate = (content, previewText = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${previewText}</title>
  <style>
    /* Base Reset & Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background-color: #fafafa; 
      color: #1a1a1a; 
      line-height: 1.6;
    }
    
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    
    /* Header - Updated to Brand Primary (Lime) */
    .header { background: #1a1a1a; padding: 48px 30px; text-align: center; border-bottom: 4px solid #a3e635; }
    .header h1 { 
        color: #ffffff; 
        font-family: 'Plus Jakarta Sans', sans-serif; 
        font-size: 26px; 
        font-weight: 800; 
        letter-spacing: -0.5px; 
    }
    .header p { color: #a3e635; font-size: 14px; font-weight: 600; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
    
    .body { padding: 40px 35px; }
    .greeting { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 16px; }
    .text { font-size: 15px; color: #4b5563; margin-bottom: 20px; }
    
    /* Button - Brand Primary with Dark Text for Contrast */
    .btn { 
        display: inline-block; 
        background-color: #a3e635; 
        color: #000000 !important; 
        text-decoration: none; 
        padding: 14px 32px; 
        border-radius: 8px; 
        font-size: 15px; 
        font-weight: 700; 
        margin: 24px 0; 
        transition: opacity 0.2s;
    }
    
    /* OTP Box - Subtle Brand Accent */
    .otp-box { background: #f7fee7; border: 2px dashed #a3e635; border-radius: 12px; padding: 32px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 48px; font-weight: 800; color: #1a1a1a; letter-spacing: 10px; }
    .otp-label { font-size: 13px; color: #4d7c0f; font-weight: 600; margin-top: 12px; }
    
    .divider { height: 1px; background: #f3f4f6; margin: 32px 0; }
    
    /* Warning - Shadcn/Destructive style */
    .warning-box { background: #fff7ed; border-left: 4px solid #f97316; padding: 16px; border-radius: 4px; margin: 20px 0; }
    .warning-box p { font-size: 13px; color: #9a3412; font-weight: 500; }
    
    .link-fallback { word-break: break-all; font-size: 12px; color: #6b7280; background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #f3f4f6; margin-top: 10px; }
    
    .footer { background: #ffffff; padding: 32px 30px; text-align: center; border-top: 1px solid #f3f4f6; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.8; }
    .footer a { color: #4d7c0f; text-decoration: underline; font-weight: 600; }
    .security-note { font-size: 12px; color: #9ca3af; margin-top: 16px; display: block; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🔐 Ticket Bro </h1>
      <p>${previewText}</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Ticket Bro. All rights reserved.</p>
      <p style="margin-top:10px;">
        <a href="${env.FRONTEND_URL}/privacy">Privacy</a> &middot;
        <a href="${env.FRONTEND_URL}/terms">Terms</a> &middot;
        <a href="${env.FRONTEND_URL}/unsubscribe">Unsubscribe</a>
      </p>
      <span class="security-note">Automated security notification.</span>
    </div>
  </div>
</body>
</html>
`;

const welcomeTemplate = ({ firstName, verificationUrl }) =>
  baseTemplate(
    `
  <p class="greeting">Welcome, ${firstName}! 👋</p>
  <p class="text">We're excited to have you join us. To finalize your account setup and ensure your security, please verify your email address below.</p>
  <div style="text-align:center;">
    <a href="${verificationUrl}" class="btn">Verify Account</a>
  </div>
  <div class="warning-box">
    <p>This secure link expires in 24 hours. If you did not sign up for this account, no further action is required.</p>
  </div>
  <p class="text" style="font-size: 13px; margin-bottom: 8px;">Button not working? Paste this into your browser:</p>
  <div class="link-fallback">${verificationUrl}</div>
`,
    "Confirm your new account",
  );

const verifyEmailTemplate = ({ firstName, verificationUrl }) =>
  baseTemplate(
    `
  <p class="greeting">Verify your email</p>
  <p class="text">Hi ${firstName}, click the button below to confirm your email address and unlock all features of your account.</p>
  <div style="text-align:center;">
    <a href="${verificationUrl}" class="btn">Confirm Email</a>
  </div>
  <div class="warning-box">
    <p>This link is valid for 24 hours.</p>
  </div>
  <div class="link-fallback">${verificationUrl}</div>
`,
    "Action Required: Email Verification",
  );

const resetPasswordTemplate = ({ firstName, resetUrl }) =>
  baseTemplate(
    `
  <p class="greeting">Reset your password</p>
  <p class="text">Hi ${firstName}, we received a request to reset your password. Use the secure button below to choose a new one.</p>
  <div style="text-align:center;">
    <a href="${resetUrl}" class="btn">Reset Password</a>
  </div>
  <div class="warning-box">
    <p><strong>Security Notice:</strong> This link expires in 1 hour. If you didn't request this, please secure your account immediately.</p>
  </div>
  <p class="text" style="font-size: 13px;">Manual link:</p>
  <div class="link-fallback">${resetUrl}</div>
`,
    "Password Reset Request",
  );

const passwordChangedTemplate = ({ firstName }) =>
  baseTemplate(
    `
  <p class="greeting">Security Update ✅</p>
  <p class="text">Hi ${firstName}, your account password has been successfully updated.</p>
  <p class="text">If this was you, you can safely ignore this email. You are now protected with your new credentials.</p>
  <div class="warning-box" style="border-left-color: #ef4444; background: #fef2f2;">
    <p style="color: #991b1b;"><strong>Wasn't you?</strong> If you didn't change your password, <a href="${env.FRONTEND_URL}/forgot-password" style="color:#b91c1c; font-weight:700;">Click here to reset it</a> immediately.</p>
  </div>
`,
    "Your password has been changed",
  );

const otpTemplate = ({ firstName, otp, purpose = "verification" }) =>
  baseTemplate(
    `
  <p class="greeting">Verification Code</p>
  <p class="text">Hi ${firstName}, use the one-time password (OTP) below to complete your ${purpose}:</p>
  <div class="otp-box">
    <div class="otp-code">${otp}</div>
    <p class="otp-label">Valid for 10 minutes</p>
  </div>
  <div class="warning-box">
    <p>For your security, never share this code with anyone. Our team will never ask for this code via phone or email.</p>
  </div>
`,
    `Your OTP: ${otp}`,
  );

const loginAlertTemplate = ({ firstName, ipAddress, device, time }) =>
  baseTemplate(
    `
  <p class="greeting">New Login Detected 🔔</p>
  <p class="text">Hi ${firstName}, we detected a new sign-in to your account with the following details:</p>
  <table style="width:100%; border-collapse:separate; border-spacing: 0; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; margin:20px 0;">
    <tr style="background:#f9fafb;"><td style="padding:12px; font-size:13px; color:#6b7280;">Time</td><td style="padding:12px; font-size:13px; font-weight:600; text-align:right;">${time}</td></tr>
    <tr><td style="padding:12px; font-size:13px; color:#6b7280;">IP Address</td><td style="padding:12px; font-size:13px; font-weight:600; text-align:right;">${ipAddress}</td></tr>
    <tr style="background:#f9fafb;"><td style="padding:12px; font-size:13px; color:#6b7280;">Device</td><td style="padding:12px; font-size:13px; font-weight:600; text-align:right;">${device}</td></tr>
  </table>
  <div class="warning-box" style="border-left-color: #ef4444;">
    <p style="color: #991b1b;">If this was not you, please <strong>lock your account</strong> and reset your password immediately via our website.</p>
  </div>
`,
    "Security Alert: New Login",
  );

module.exports = {
  welcomeTemplate,
  verifyEmailTemplate,
  resetPasswordTemplate,
  passwordChangedTemplate,
  otpTemplate,
  loginAlertTemplate,
};
