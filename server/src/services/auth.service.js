const { prisma, ensureDbConnection } = require('../config/db');
const { hashPassword, comparePassword } = require('../models/User.model');
const notificationService = require('./notifications.service');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
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
    throw createError('User with this email already exists', 400);
  }

  const hashedPassword = await hashPassword(password);
  const roleUpper = role ? role.toUpperCase() : 'TRADER';
  const isTrader = roleUpper === 'TRADER';

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: roleUpper,
      phone: phone || null,
      region: region || null,
      woreda: woreda || null,
      farmSize: farmSize || null,
      crops: crops || null,
      experience: experience || null,
      approvalStatus: isTrader ? 'PENDING' : 'APPROVED',
      isVerified: !isTrader,
    },
  });

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

  return user;
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

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  checkEmailAvailability
};
