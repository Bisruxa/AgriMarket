const { prisma } = require('../config/db');

/**
 * GET /api/notifications — role-based alerts for the bell menu
 */
exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const notifications = [];
    const now = new Date().toISOString();

    if (user.role === 'FARMER') {
      const farms = await prisma.farm.count({
        where: { farmerId: user.id, isActive: true },
      });
      if (farms === 0) {
        notifications.push({
          id: 'farmer-no-farms',
          type: 'info',
          href: '/farmer/farms',
          createdAt: now,
        });
      }

      const products = await prisma.product.findMany({
        where: { farmerId: user.id },
        select: { id: true, name: true, stock: true, isAvailable: true },
      });

      const soldOut = products.filter((p) => !p.isAvailable || p.stock === 0);
      if (soldOut.length > 0) {
        notifications.push({
          id: 'farmer-sold-out',
          type: 'warning',
          href: '/farmer/market',
          count: soldOut.length,
          createdAt: now,
        });
      }

      const lowStock = products.filter((p) => p.isAvailable && p.stock > 0 && p.stock <= 5);
      if (lowStock.length > 0) {
        notifications.push({
          id: 'farmer-low-stock',
          type: 'warning',
          href: '/farmer/market',
          count: lowStock.length,
          createdAt: now,
        });
      }

      if (farms > 0) {
        notifications.push({
          id: 'farmer-crop-tip',
          type: 'tip',
          href: '/farmer/cropdetail',
          createdAt: now,
        });
      }
    }

    if (user.role === 'TRADER') {
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { approvalStatus: true, approvalNote: true },
      });

      if (fullUser?.approvalStatus === 'PENDING') {
        notifications.push({
          id: 'trader-pending',
          type: 'info',
          href: '/trader/dashboard',
          createdAt: now,
        });
      }
      if (fullUser?.approvalStatus === 'REJECTED') {
        notifications.push({
          id: 'trader-rejected',
          type: 'error',
          href: '/trader/dashboard',
          note: fullUser.approvalNote || null,
          createdAt: now,
        });
      }
      if (fullUser?.approvalStatus === 'APPROVED') {
        notifications.push({
          id: 'trader-welcome',
          type: 'success',
          href: '/trader/purchases',
          createdAt: now,
        });
      }
    }

    if (user.role === 'ADMIN') {
      const pendingCount = await prisma.user.count({
        where: { role: 'TRADER', approvalStatus: 'PENDING', deletedAt: null },
      });
      if (pendingCount > 0) {
        notifications.push({
          id: 'admin-pending-traders',
          type: 'action',
          href: '/admin/traderApproval',
          count: pendingCount,
          createdAt: now,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: { notifications, unreadCount: notifications.length },
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load notifications',
    });
  }
};
