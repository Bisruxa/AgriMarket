const { prisma } = require('../config/db');
const notificationService = require('./notifications.service');
const adminConfigService = require('./adminConfig.service');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getAllUsers = async (query) => {
  const { role, approvalStatus, includeDeleted, page = 1, limit = 10 } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};

  if (role) {
    where.role = role.toUpperCase();
  }

  if (approvalStatus) {
    where.approvalStatus = approvalStatus.toUpperCase();
  }

  if (includeDeleted !== 'true') {
    where.deletedAt = null;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        region: true,
        woreda: true,
        approvalStatus: true,
        approvalNote: true,
        isVerified: true,
        createdAt: true,
        deletedAt: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  return {
    users,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  };
};

const getPendingTraders = async () => {
  return prisma.user.findMany({
    where: {
      role: 'TRADER',
      approvalStatus: 'PENDING',
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      region: true,
      woreda: true,
      approvalStatus: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });
};

const approveTrader = async (userId, note) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  if (user.role !== 'TRADER') {
    throw createError('User is not a trader', 400);
  }

  if (user.approvalStatus === 'APPROVED') {
    throw createError('Trader is already approved', 400);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      approvalStatus: 'APPROVED',
      approvalNote: note || 'Approved by admin',
      isVerified: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      approvalStatus: true,
      approvalNote: true,
      isVerified: true
    }
  });

  try {
    await notificationService.removeNotification(userId, 'trader-pending');
    await notificationService.removeNotification(userId, 'trader-rejected');
    await notificationService.upsertNotification(userId, {
      key: 'trader-welcome',
      type: 'success',
      href: '/trader/purchases',
    });
  } catch (e) {
    console.warn('approveTrader notification:', e.message);
  }

  return updated;
};

const rejectTrader = async (userId, note) => {
  if (!note) {
    throw createError('Rejection reason is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  if (user.role !== 'TRADER') {
    throw createError('User is not a trader', 400);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      approvalStatus: 'REJECTED',
      approvalNote: note
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      approvalStatus: true,
      approvalNote: true
    }
  });

  try {
    await notificationService.removeNotification(userId, 'trader-pending');
    await notificationService.removeNotification(userId, 'trader-welcome');
    await notificationService.upsertNotification(userId, {
      key: 'trader-rejected',
      type: 'error',
      href: '/trader/dashboard',
      note,
    });
  } catch (e) {
    console.warn('rejectTrader notification:', e.message);
  }

  return updated;
};

const getStatistics = async () => {
  const [
    totalUsers,
    totalFarmers,
    totalTraders,
    totalAdmins,
    pendingTraders,
    approvedTraders,
    rejectedTraders,
    verifiedUsers,
    deletedUsers,
    totalProducts,
    availableProducts,
    organicProducts,
    productsByCategory,
    recentUsers,
    recentProducts
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: 'FARMER', deletedAt: null } }),
    prisma.user.count({ where: { role: 'TRADER', deletedAt: null } }),
    prisma.user.count({ where: { role: 'ADMIN', deletedAt: null } }),
    prisma.user.count({ where: { role: 'TRADER', approvalStatus: 'PENDING', deletedAt: null } }),
    prisma.user.count({ where: { role: 'TRADER', approvalStatus: 'APPROVED', deletedAt: null } }),
    prisma.user.count({ where: { role: 'TRADER', approvalStatus: 'REJECTED', deletedAt: null } }),
    prisma.user.count({ where: { isVerified: true, deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: { not: null } } }),
    prisma.product.count(),
    prisma.product.count({ where: { isAvailable: true } }),
    prisma.product.count({ where: { isOrganic: true } }),
    prisma.product.groupBy({
      by: ['category'],
      _count: { id: true }
    }),
    prisma.user.findMany({
      where: { deletedAt: null },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approvalStatus: true,
        createdAt: true
      }
    }),
    prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        isAvailable: true,
        createdAt: true,
        farmer: {
          select: {
            name: true
          }
        }
      }
    })
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newUsersLast30Days = await prisma.user.count({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      deletedAt: null
    }
  });

  return {
    users: {
      total: totalUsers,
      farmers: totalFarmers,
      traders: totalTraders,
      admins: totalAdmins,
      verified: verifiedUsers,
      deleted: deletedUsers,
      newLast30Days: newUsersLast30Days
    },
    traders: {
      pending: pendingTraders,
      approved: approvedTraders,
      rejected: rejectedTraders
    },
    products: {
      total: totalProducts,
      available: availableProducts,
      organic: organicProducts,
      byCategory: productsByCategory.map(item => ({
        category: item.category,
        count: item._count.id
      }))
    },
    recent: {
      users: recentUsers,
      products: recentProducts
    }
  };
};

const getTraderDetails = async (userId) => {
  const trader = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      region: true,
      woreda: true,
      street: true,
      city: true,
      state: true,
      country: true,
      approvalStatus: true,
      approvalNote: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!trader) {
    throw createError('Trader not found', 404);
  }

  if (trader.role !== 'TRADER') {
    throw createError('User is not a trader', 400);
  }

  return trader;
};

const getSystemHealth = async () => {
  const started = Date.now();
  let dbConnected = false;
  let dbLatencyMs = null;

  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
    dbLatencyMs = Date.now() - t0;
  } catch {
    dbConnected = false;
  }

  const [pendingTraders, totalUsers, totalProducts] = await Promise.all([
    prisma.user.count({
      where: { role: 'TRADER', approvalStatus: 'PENDING', deletedAt: null },
    }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { isAvailable: true } }),
  ]);

  const memory = process.memoryUsage();
  const heapUsedMb = Number((memory.heapUsed / 1024 / 1024).toFixed(1));
  const heapTotalMb = Number((memory.heapTotal / 1024 / 1024).toFixed(1));
  const rssMb = Number((memory.rss / 1024 / 1024).toFixed(1));

  const healthChecks = [
    { name: 'database', ok: dbConnected, detail: dbConnected ? 'Connected' : 'Unavailable' },
    { name: 'memory', ok: heapUsedMb < 900, detail: `${heapUsedMb} MB used` },
  ];
  const healthyCount = healthChecks.filter((c) => c.ok).length;
  const healthScore = Math.round((healthyCount / healthChecks.length) * 100);

  return {
    status: healthScore >= 80 ? 'healthy' : 'degraded',
    healthScore,
    generatedAt: new Date().toISOString(),
    process: {
      uptimeSeconds: Math.round(process.uptime()),
      nodeVersion: process.version,
      pid: process.pid,
      memory: {
        heapUsedMb,
        heapTotalMb,
        rssMb,
      },
    },
    database: {
      connected: dbConnected,
      latencyMs: dbLatencyMs,
    },
    operational: {
      pendingTraders,
      activeUsers: totalUsers,
      activeProducts: totalProducts,
    },
    checks: healthChecks,
    requestDurationMs: Date.now() - started,
  };
};

const getSystemSettings = async () => {
  return adminConfigService.getSettings();
};

const updateSystemSettings = async (payload) => {
  return adminConfigService.updateSettings(payload);
};

module.exports = {
  getAllUsers,
  getPendingTraders,
  approveTrader,
  rejectTrader,
  getStatistics,
  getTraderDetails,
  getSystemHealth,
  getSystemSettings,
  updateSystemSettings,
};
