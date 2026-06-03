const nodemailer = require('nodemailer');

let transporter = null;

/** Strip quotes and spaces from Gmail app passwords (16 chars, no spaces). */
const normalizeSmtpPassword = (pass) => {
  if (!pass) return '';
  return pass.replace(/^["']|["']$/g, '').replace(/\s+/g, '');
};

const LOCALHOST_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

function parseClientUrlCandidate(value) {
  const trimmed = (value || '').trim();
  if (!trimmed || /^(null|undefined)$/i.test(trimmed)) return null;

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    const host = parsed.hostname?.toLowerCase();
    if (!host || host === 'null' || host === 'undefined') return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

const getClientUrl = () => {
  const fallback = 'http://localhost:3000';
  const raw = process.env.CLIENT_URL || process.env.FRONTEND_URL || '';

  const candidates = raw
    .split(',')
    .map((part) => parseClientUrlCandidate(part))
    .filter(Boolean);

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && candidates.length > 0) {
    const publicHttps = candidates.find(
      (url) => url.startsWith('https://') && !LOCALHOST_ORIGIN.test(url),
    );
    if (publicHttps) return publicHttps;

    const anyPublic = candidates.find((url) => !LOCALHOST_ORIGIN.test(url));
    if (anyPublic) return anyPublic;
  }

  if (candidates.length > 0) return candidates[0];

  return parseClientUrlCandidate(raw) || fallback;
};

const getFromAddress = () => {
  const user = process.env.SMTP_USER;
  const configured = process.env.EMAIL_FROM;

  // Gmail only allows sending as the authenticated account (or configured aliases)
  if (user && configured && !configured.includes(user)) {
    return `AgriMarket <${user}>`;
  }

  return configured || (user ? `AgriMarket <${user}>` : 'AgriMarket <noreply@agrimarket.com>');
};

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = normalizeSmtpPassword(process.env.SMTP_PASS);

  if (!host || !user || !pass) {
    console.warn(
      '[email] SMTP not configured (need SMTP_HOST, SMTP_USER, SMTP_PASS). Links will print to console only.',
    );
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

const sendMailSafe = async (options) => {
  const mailer = getTransporter();

  if (!mailer) {
    return { delivered: false, logged: true };
  }

  try {
    await mailer.sendMail({
      from: getFromAddress(),
      ...options,
    });
    console.log(`[email] Sent "${options.subject}" to ${options.to}`);
    return { delivered: true, logged: false };
  } catch (err) {
    console.error('[email] Failed to send mail:', err.message);
    if (err.response) console.error('[email] SMTP response:', err.response);
    throw err;
  }
};

const sendPasswordResetEmail = async ({ to, name, resetToken }) => {
  const resetUrl = `${getClientUrl()}/reset-password?token=${encodeURIComponent(resetToken)}`;
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

  try {
    const result = await sendMailSafe({ to, subject, text, html });
    return { ...result, resetUrl };
  } catch {
    console.log('\n--- Password reset (SMTP failed) ---');
    console.log(`To: ${to}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('--------------------------------------\n');
    return { delivered: false, logged: true, resetUrl };
  }
};

const sendVerificationEmail = async ({ to, name, verifyToken }) => {
  const verifyUrl = `${getClientUrl()}/verify-email?token=${encodeURIComponent(verifyToken)}`;
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

  try {
    const result = await sendMailSafe({ to, subject, text, html });
    return { ...result, verifyUrl };
  } catch {
    console.log('\n--- Email verification (SMTP failed) ---');
    console.log(`To: ${to}`);
    console.log(`Verify URL: ${verifyUrl}`);
    console.log('----------------------------------------\n');
    return { delivered: false, logged: true, verifyUrl };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
  getClientUrl,
  normalizeSmtpPassword,
};
