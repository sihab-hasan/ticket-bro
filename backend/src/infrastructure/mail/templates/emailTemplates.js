"use strict";

const env = require("../../../config/env");

/* ─────────────────────────────────────────────
   BASE TEMPLATE
───────────────────────────────────────────── */

const baseTemplate = (content, preview = "") => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${env.APP_NAME || "TicketBro"}</title>

<style>
body{
margin:0;
padding:0;
background:#f9fafb;
font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}

a{color:inherit}
</style>

</head>

<body>

<div style="display:none;max-height:0;overflow:hidden;">
${preview}
</div>

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 12px;">

<table width="520" cellpadding="0" cellspacing="0"
style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">

<tr>
<td style="background:#18181b;padding:22px 26px;text-align:center;">

<table cellpadding="0" cellspacing="0">
<tr>

<td style="padding-right:10px;">
<img
src="https://raw.githubusercontent.com/sihab-hasan/ticket-bro/main/frontend/src/assets/images/ticket-bro-logo-dark-mode.png"
height="28"
style="display:block;border:0"
/>
</td>

<td>
<span style="color:#ffffff;font-size:20px;font-weight:600;">
${env.APP_NAME || "TicketBro"}
</span>
</td>

</tr>
</table>

</td>
</tr>

${content}

<tr>
<td style="background:#fafafa;padding:18px 26px;text-align:center;border-top:1px solid #eee;">

<p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
This is an automated email from <strong>${env.APP_NAME || "TicketBro"}</strong>.<br>
If you didn't request this email, you can safely ignore it.
</p>

</td>
</tr>

</table>

<table width="520" style="margin-top:10px;">
<tr>
<td align="center">

<a href="${env.FRONTEND_URL}/privacy"
style="font-size:11px;color:#9ca3af;text-decoration:none;margin:0 8px;">
Privacy
</a>

<span style="color:#d1d5db;">|</span>

<a href="${env.FRONTEND_URL}/terms"
style="font-size:11px;color:#9ca3af;text-decoration:none;margin:0 8px;">
Terms
</a>

<p style="margin:6px 0 0;font-size:11px;color:#c7c7c7;">
© ${new Date().getFullYear()} ${env.APP_NAME || "TicketBro"}
</p>

</td>
</tr>
</table>

</td>
</tr>
</table>

</body>
</html>
`;

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */

const button = (url, text) => `
<tr>
<td align="center" style="padding:22px 0;">

<a href="${url}"
style="background:#18181b;color:#ffffff;text-decoration:none;
padding:12px 26px;border-radius:6px;font-size:15px;font-weight:500;
display:inline-block;">
${text}
</a>

</td>
</tr>
`;

const linkBox = (url) => `
<tr>
<td style="padding:0 28px 24px;font-size:12px;color:#6b7280;word-break:break-all;">
<div style="background:#f9fafb;border:1px solid #e5e7eb;padding:10px;border-radius:6px;">
${url}
</div>
</td>
</tr>
`;

const otpBox = (code) => `
<tr>
<td align="center" style="padding:20px 0;">

<div style="
background:#f9fafb;
border:1px solid #e5e7eb;
padding:18px 24px;
border-radius:6px;
font-size:34px;
letter-spacing:0.35em;
font-weight:600;
color:#111827;
display:inline-block;
">
${code}
</div>

</td>
</tr>
`;

const notice = (text) => `
<p style="margin:6px 0;font-size:13px;color:#374151;">
${text}
</p>
`;

/* ─────────────────────────────────────────────
   EMAILS
───────────────────────────────────────────── */

// ✅ FIXED: now accepts verificationUrl and shows verify button
const welcomeTemplate = ({ firstName, verificationUrl }) =>
  baseTemplate(`
<tr>
<td style="padding:30px 28px;">

<h2 style="margin:0 0 14px;font-size:20px;color:#111827;">
Welcome to ${env.APP_NAME || "TicketBro"}, ${firstName}! 🎉
</h2>

<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
Thanks for signing up! Please verify your email address to activate your account and start exploring events.
</p>

<p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
This verification link expires in ${process.env.EMAIL_VERIFICATION_EXPIRES_IN || "24h"}.
</p>

</td>
</tr>

${button(verificationUrl, "Verify My Email")}
${linkBox(verificationUrl)}
`,
`Welcome to ${env.APP_NAME || "TicketBro"} — please verify your email`
);

const verifyEmailTemplate = ({ firstName, verificationUrl }) =>
  baseTemplate(`
<tr>
<td style="padding:30px 28px;">

<h2 style="margin:0 0 14px;font-size:20px;color:#111827;">
Verify your email
</h2>

<p style="margin:0 0 16px;font-size:15px;color:#374151;">
Hi <strong>${firstName}</strong>, please confirm your email to activate your account.
</p>

<p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
This verification link expires in ${process.env.EMAIL_VERIFICATION_EXPIRES_IN || "24h"}.
</p>

</td>
</tr>

${button(verificationUrl,"Verify Email")}
${linkBox(verificationUrl)}
`,
"Confirm your email"
);

const resetPasswordTemplate = ({ firstName, resetUrl }) =>
  baseTemplate(`
<tr>
<td style="padding:30px 28px;">

<h2 style="margin:0 0 14px;font-size:20px;color:#111827;">
Reset your password
</h2>

<p style="margin:0 0 16px;font-size:15px;color:#374151;">
Hi <strong>${firstName}</strong>, we received a password reset request.
</p>

<p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
This link expires in ${process.env.PASSWORD_RESET_EXPIRES_IN || "1h"}.
</p>

</td>
</tr>

${button(resetUrl,"Reset Password")}
${linkBox(resetUrl)}
`,
"Password reset request"
);

const passwordChangedTemplate = ({ firstName }) =>
  baseTemplate(`
<tr>
<td style="padding:30px 28px;">

<h2 style="margin:0 0 14px;font-size:20px;color:#111827;">
Password updated
</h2>

<p style="margin:0 0 16px;font-size:15px;color:#374151;">
Hi <strong>${firstName}</strong>, your password has been changed.
</p>

<p style="margin:0;font-size:13px;color:#6b7280;">
If you didn't make this change, reset your password immediately.
</p>

</td>
</tr>
`,
"Password changed"
);

const otpTemplate = ({ firstName, otp }) =>
  baseTemplate(`
<tr>
<td style="padding:30px 28px;">

<h2 style="margin:0 0 14px;font-size:20px;color:#111827;">
Verification code
</h2>

<p style="margin:0 0 16px;font-size:15px;color:#374151;">
Hi <strong>${firstName}</strong>, use the code below to continue.
</p>

</td>
</tr>

${otpBox(otp)}

<tr>
<td align="center" style="font-size:13px;color:#6b7280;padding-bottom:24px;">
This code expires in 10 minutes.
</td>
</tr>
`,
`${otp} is your verification code`
);

const loginAlertTemplate = ({ firstName, ipAddress, device, time }) =>
  baseTemplate(`
<tr>
<td style="padding:30px 28px;">

<h2 style="margin:0 0 14px;font-size:20px;color:#111827;">
New login detected
</h2>

<p style="margin:0 0 16px;font-size:15px;color:#374151;">
Hi <strong>${firstName}</strong>, a new login was detected on your account.
</p>

${notice(`Time: ${time}`)}
${notice(`IP Address: ${ipAddress}`)}
${notice(`Device: ${device}`)}

<p style="margin-top:14px;font-size:13px;color:#6b7280;">
If this wasn't you, reset your password immediately.
</p>

</td>
</tr>
`,
"Security alert"
);

/* ───────────────────────────────────────────── */

module.exports = {
  welcomeTemplate,
  verifyEmailTemplate,
  resetPasswordTemplate,
  passwordChangedTemplate,
  otpTemplate,
  loginAlertTemplate,
};
