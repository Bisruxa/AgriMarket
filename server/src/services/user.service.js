const { prisma } = require('../config/db');
const { hashPassword, comparePassword } = require('../models/User.model');
const {
  formatEthiopianPhoneForStorage,
  isValidEthiopianPhone,
  ETHIOPIAN_PHONE_MESSAGE,
} = require('../utils/phone.util');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getUsers = async ({ includeDeleted }) => {
  return prisma.user.findMany({
    where: includeDeleted ? {} : { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      isVerified: true,
      createdAt: true,
      deletedAt: true
    }
  });
};

const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
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
      createdAt: true,
      deletedAt: true
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  return user;
};

const updateUserProfile = async (userId, payload) => {
  const {
    name,
    phone,
    avatar,
    street,
    city,
    state,
    country,
    zipCode,
    region,
    woreda,
    farmSize,
    crops,
    experience
  } = payload;

  let normalizedPhone;
  if (phone !== undefined && phone !== null && String(phone).trim() !== '') {
    if (!isValidEthiopianPhone(phone)) {
      throw createError(ETHIOPIAN_PHONE_MESSAGE, 400);
    }
    normalizedPhone = formatEthiopianPhoneForStorage(phone);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(normalizedPhone && { phone: normalizedPhone }),
      ...(avatar && { avatar }),
      ...(street && { street }),
      ...(city && { city }),
      ...(state && { state }),
      ...(country && { country }),
      ...(zipCode && { zipCode }),
      ...(region && { region }),
      ...(woreda && { woreda }),
      ...(farmSize && { farmSize }),
      ...(crops && { crops }),
      ...(experience && { experience })
    },
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
      createdAt: true
    }
  });
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  const isMatch = await comparePassword(currentPassword, user.password);

  if (!isMatch) {
    throw createError('Current password is incorrect', 401);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
};

const deleteUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  if (user.deletedAt) {
    throw createError('User is already deleted', 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() }
  });
};

const deleteMyAccount = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() }
  });
};

const restoreUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  if (!user.deletedAt) {
    throw createError('User is not deleted', 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: null }
  });
};

const getFarmerPublicProfile = async (farmerId) => {
  const farmer = await prisma.user.findFirst({
    where: {
      id: farmerId,
      role: 'FARMER',
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      phone: true,
      region: true,
      woreda: true,
      farmSize: true,
      crops: true,
      experience: true,
      isVerified: true,
      createdAt: true,
      farms: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          size: true,
          sizeUnit: true,
          region: true,
          woreda: true,
          soilType: true,
          crops: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      },
      products: {
        where: { isAvailable: true },
        select: {
          id: true,
          name: true,
          category: true,
          unit: true,
          price: true,
          stock: true,
          isOrganic: true,
          location: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!farmer) {
    throw createError('Farmer not found', 404);
  }

  const activeProducts = farmer.products || [];
  const avgPrice =
    activeProducts.length > 0
      ? Number(
          (
            activeProducts.reduce((sum, item) => sum + Number(item.price || 0), 0) /
            activeProducts.length
          ).toFixed(2)
        )
      : null;

  return {
    farmer: {
      id: farmer.id,
      name: farmer.name,
      avatar: farmer.avatar,
      phone: farmer.phone,
      region: farmer.region,
      woreda: farmer.woreda,
      farmSize: farmer.farmSize,
      crops: farmer.crops,
      experience: farmer.experience,
      isVerified: farmer.isVerified,
      joinedAt: farmer.createdAt,
    },
    stats: {
      farmCount: farmer.farms.length,
      activeProductCount: activeProducts.length,
      averageListingPrice: avgPrice,
      totalAvailableStock: activeProducts.reduce((sum, p) => sum + (p.stock || 0), 0),
    },
    farms: farmer.farms,
    activeProducts: activeProducts.slice(0, 12),
  };
};

module.exports = {
  getUsers,
  getUserById,
  updateUserProfile,
  updatePassword,
  deleteUserById,
  deleteMyAccount,
  restoreUser,
  getFarmerPublicProfile,
};
