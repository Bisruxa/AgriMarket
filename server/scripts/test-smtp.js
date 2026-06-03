/**
 * Test SMTP config: node scripts/test-smtp.js your-test@email.com
 * Does not print your password.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');
const { normalizeSmtpPassword, getClientUrl } = require('../src/services/email.service');

const to = process.argv[2] || process.env.SMTP_USER;

if (!to) {
  console.error('Usage: node scripts/test-smtp.js recipient@email.com');
  process.exit(1);
}

const user = process.env.SMTP_USER;
const pass = normalizeSmtpPassword(process.env.SMTP_PASS);

console.log('SMTP_USER:', user);
console.log('SMTP_PASS length:', pass.length, '(expect 16 for Gmail app password)');
console.log('CLIENT_URL (first):', getClientUrl());

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user, pass },
});

transport
  .verify()
  .then(() => {
    console.log('SMTP connection OK');
    return transport.sendMail({
      from: `AgriMarket <${user}>`,
      to,
      subject: 'AgriMarket SMTP test',
      text: 'If you received this, SMTP is working.',
    });
  })
  .then(() => {
    console.log('Test email sent to', to);
    process.exit(0);
  })
  .catch((err) => {
    console.error('SMTP failed:', err.message);
    process.exit(1);
  });
