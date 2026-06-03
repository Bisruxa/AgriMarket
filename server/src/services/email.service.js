const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass },
  });

  return transporter;
};

const getFromAddress = () =>
  process.env.EMAIL_FROM || `AgriMarket <${process.env.SMTP_USER || 'noreply@agrimarket.com'}>`;

const getClientUrl = () =>
  (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

/**
 * Send password reset email. In dev without SMTP, logs the link to the console.
 */
const sendPasswordResetEmail = async ({ to, name, resetToken }) => {
  const resetUrl = `${getClientUrl()}/reset-password?token=${resetToken}`;
  const subject = 'AgriMarket — Reset your password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="color: #2A5A2A;">Password reset</h2>
      <p>Hi ${name || 'there'},</p>
      <p>You requested a password reset for your AgriMarket account. Click the button below to choose a new password. This link expires in 1 hour.</p>
      <p style="margin: 28px 0;">
        <a href="${resetUrl}" style="background: #2A5A2A; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Reset password
        </a>
      </p>
      <p style="font-size: 13px; color: #666;">If you did not request this, you can safely ignore this email.</p>
      <p style="font-size: 12px; color: #999; word-break: break-all;">Or copy this link: ${resetUrl}</p>
    </div>
  `;
  const text = `Reset your AgriMarket password: ${resetUrl}\n\nThis link expires in 1 hour.`;

  const mailer = getTransporter();

  if (!mailer) {
    console.log('\n--- Password reset (SMTP not configured) ---');
    console.log(`To: ${to}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('--------------------------------------------\n');
    return { delivered: false, logged: true, resetUrl };
  }

  await mailer.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  });

  return { delivered: true, logged: false };
};

/**
 * Send email verification link. In dev without SMTP, logs the link to the console.
 */
const sendVerificationEmail = async ({ to, name, verifyToken }) => {
  const verifyUrl = `${getClientUrl()}/verify-email?token=${verifyToken}`;
  const subject = 'AgriMarket — Verify your email';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="color: #2A5A2A;">Verify your email</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Thanks for signing up for AgriMarket. Please confirm your email address by clicking the button below. This link expires in 24 hours.</p>
      <p style="margin: 28px 0;">
        <a href="${verifyUrl}" style="background: #2A5A2A; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Verify email
        </a>
      </p>
      <p style="font-size: 13px; color: #666;">If you did not create an account, you can ignore this email.</p>
      <p style="font-size: 12px; color: #999; word-break: break-all;">Or copy this link: ${verifyUrl}</p>
    </div>
  `;
  const text = `Verify your AgriMarket email: ${verifyUrl}\n\nThis link expires in 24 hours.`;

  const mailer = getTransporter();

  if (!mailer) {
    console.log('\n--- Email verification (SMTP not configured) ---');
    console.log(`To: ${to}`);
    console.log(`Verify URL: ${verifyUrl}`);
    console.log('------------------------------------------------\n');
    return { delivered: false, logged: true, verifyUrl };
  }

  await mailer.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  });

  return { delivered: true, logged: false };
};

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
  getClientUrl,
};
