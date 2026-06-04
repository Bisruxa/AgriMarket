const { prisma, ensureDbConnection } = require('../config/db');
const { hashPassword, comparePassword } = require('../models/User.model');
const notificationService = require('./notifications.service');
const { formatEthiopianPhoneForStorage, isValidEthiopianPhone, ETHIOPIAN_PHONE_MESSAGE } = require('../utils/phone.util');

const createError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
};

const TOKEN_EXPIRE_MS = {
  reset: 60 * 60 * 1000,
  verify: 24 * 60 * 60 * 1000,
};

const normalizeToken = (token) => {
  if (!token || typeof token !== 'string') return '';
  try {
    return decodeURIComponent(token.trim());
  } catch {
    return token.trim();
  }
};

const hashToken = (token) =>
  require('crypto').createHash('sha256').update(normalizeToken(token)).digest('hex');

const issueEmailVerification = async (user) => {
  const crypto = require('crypto');
  const verifyToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(verifyToken);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyToken: hashedToken,
      emailVerifyExpire: new Date(Date.now() + TOKEN_EXPIRE_MS.verify),
    },
  });

  const emailService = require('./email.service');
  return emailService.sendVerificationEmail({
    to: user.email,
    name: user.name,
    verifyToken,
  });
};

const registerUser = async (payload) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    region,
    woreda,
    farmSize,
    crops,
    experience
  } = payload;

  await ensureDbConnection();
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    if (!existingUser.deletedAt && !existingUser.isVerified) {
      let emailSent = false;
      try {
        const emailResult = await issueEmailVerification(existingUser);
        emailSent = emailResult?.delivered === true;
      } catch (e) {
        console.error('registerUser resend verification failed:', e.message);
      }

      return { user: existingUser, emailSent, existingUnverified: true };
    }

    throw createError('User with this email already exists', 400, 'EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await hashPassword(password);
  const roleUpper = role ? role.toUpperCase() : 'TRADER';
  const isTrader = roleUpper === 'TRADER';

  let normalizedPhone = null;
  if (phone) {
    if (!isValidEthiopianPhone(phone)) {
      throw createError(ETHIOPIAN_PHONE_MESSAGE, 400);
    }
    normalizedPhone = formatEthiopianPhoneForStorage(phone);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: roleUpper,
      phone: normalizedPhone,
      region: region || null,
      woreda: woreda || null,
      farmSize: farmSize || null,
      crops: crops || null,
      experience: experience || null,
      approvalStatus: isTrader ? 'PENDING' : 'APPROVED',
      isVerified: false,
    },
  });

  let emailSent = false;
  try {
    const emailResult = await issueEmailVerification(user);
    emailSent = emailResult?.delivered === true;
  } catch (e) {
    console.error('registerUser verification email failed:', e.message);
  }

  if (isTrader) {
    try {
      await notificationService.upsertNotification(user.id, {
        key: 'trader-pending',
        type: 'info',
        href: '/trader/dashboard',
      });
    } catch (e) {
      console.warn('registerUser trader notification:', e.message);
    }
  }

  return { user, emailSent, existingUnverified: false };
};

const loginUser = async (email, password) => {
  await ensureDbConnection();
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  if (user.deletedAt) {
    throw createError('This account has been deleted. Please contact support if you believe this is an error.', 401);
  }

  if (!user.isVerified) {
    throw createError(
      'Please verify your email before signing in. Check your inbox or request a new verification link.',
      403,
      'EMAIL_NOT_VERIFIED'
    );
  }

  if (user.role === 'TRADER') {
    if (user.approvalStatus === 'PENDING') {
      throw createError('Your account is pending approval. Please wait for admin verification.', 403);
    }
    if (user.approvalStatus === 'REJECTED') {
      throw createError('Your account has been rejected. Please contact support for more information.', 403);
    }
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw createError('Invalid credentials', 401);
  }

  return user;
};

const getCurrentUser = async (userId) => {
  await ensureDbConnection();
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      street: true,
      city: true,
      state: true,
      country: true,
      zipCode: true,
      region: true,
      woreda: true,
      farmSize: true,
      crops: true,
      experience: true,
      isVerified: true,
      approvalStatus: true,
      approvalNote: true,
      createdAt: true
    }
  });
};

const checkEmailAvailability = async (email) => {
  await ensureDbConnection();
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  return !existingUser;
};

const requestPasswordReset = async (email) => {
  await ensureDbConnection();

  const user = await prisma.user.findUnique({ where: { email } });

  // Always succeed from caller's perspective (avoid email enumeration)
  if (!user || user.deletedAt) {
    return { sent: false };
  }

  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(resetToken);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: new Date(Date.now() + TOKEN_EXPIRE_MS.reset),
    },
  });

  const emailService = require('./email.service');
  await emailService.sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetToken,
  });

  return { sent: true };
};

const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw createError('Token and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw createError('Password must be at least 6 characters', 400);
  }

  await ensureDbConnection();

  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { gt: new Date() },
      deletedAt: null,
    },
  });

  if (!user) {
    throw createError('Invalid or expired reset token', 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    },
  });

  return { success: true };
};

const verifyEmail = async (token) => {
  const cleanToken = normalizeToken(token);
  if (!cleanToken) {
    throw createError('Verification token is required', 400);
  }

  await ensureDbConnection();

  const hashedToken = hashToken(cleanToken);

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: hashedToken,
      deletedAt: null,
    },
  });

  if (!user) {
    throw createError(
      'Invalid or expired verification link. Request a new verification email from the sign-in page.',
      400
    );
  }

  if (user.isVerified) {
    return { alreadyVerified: true, role: user.role, approvalStatus: user.approvalStatus };
  }

  if (!user.emailVerifyExpire || user.emailVerifyExpire <= new Date()) {
    throw createError(
      'Verification link has expired. Request a new verification email from the sign-in page.',
      400
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      // Keep token until expiry so the same link can be opened again (idempotent)
    },
  });

  return { alreadyVerified: false, role: user.role, approvalStatus: user.approvalStatus };
};

const resendVerificationEmail = async (email) => {
  await ensureDbConnection();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.deletedAt || user.isVerified) {
    return { sent: false };
  }

  try {
    const emailResult = await issueEmailVerification(user);
    return { sent: emailResult?.delivered === true };
  } catch {
    return { sent: false };
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  checkEmailAvailability,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};
