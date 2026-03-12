const { prisma } = require('../config/db');

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, approvalStatus, includeDeleted, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter
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

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending traders awaiting approval
// @route   GET /api/admin/traders/pending
// @access  Private/Admin
exports.getPendingTraders = async (req, res, next) => {
  try {
    const traders = await prisma.user.findMany({
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
      orderBy: { createdAt: 'asc' } // Oldest first
    });

    res.status(200).json({
      success: true,
      count: traders.length,
      data: traders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a trader
// @route   PUT /api/admin/traders/:id/approve
// @access  Private/Admin
exports.approveTrader = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'TRADER') {
      return res.status(400).json({
        success: false,
        message: 'User is not a trader'
      });
    }

    if (user.approvalStatus === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Trader is already approved'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
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

    res.status(200).json({
      success: true,
      message: 'Trader approved successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a trader
// @route   PUT /api/admin/traders/:id/reject
// @access  Private/Admin
exports.rejectTrader = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'TRADER') {
      return res.status(400).json({
        success: false,
        message: 'User is not a trader'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
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

    res.status(200).json({
      success: true,
      message: 'Trader rejected',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStatistics = async (req, res, next) => {
  try {
    // Get counts for different user types and statuses
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
      // User counts
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: 'FARMER', deletedAt: null } }),
      prisma.user.count({ where: { role: 'TRADER', deletedAt: null } }),
      prisma.user.count({ where: { role: 'ADMIN', deletedAt: null } }),
      prisma.user.count({ where: { role: 'TRADER', approvalStatus: 'PENDING', deletedAt: null } }),
      prisma.user.count({ where: { role: 'TRADER', approvalStatus: 'APPROVED', deletedAt: null } }),
      prisma.user.count({ where: { role: 'TRADER', approvalStatus: 'REJECTED', deletedAt: null } }),
      prisma.user.count({ where: { isVerified: true, deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: { not: null } } }),
      
      // Product counts
      prisma.product.count(),
      prisma.product.count({ where: { isAvailable: true } }),
      prisma.product.count({ where: { isOrganic: true } }),
      
      // Products grouped by category
      prisma.product.groupBy({
        by: ['category'],
        _count: { id: true }
      }),
      
      // Recent users (last 5)
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
      
      // Recent products (last 5)
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

    // Calculate growth (users registered in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        deletedAt: null
      }
    });

    res.status(200).json({
      success: true,
      data: {
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
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trader details for review
// @route   GET /api/admin/traders/:id
// @access  Private/Admin
exports.getTraderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trader = await prisma.user.findUnique({
      where: { id },
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
      return res.status(404).json({
        success: false,
        message: 'Trader not found'
      });
    }

    if (trader.role !== 'TRADER') {
      return res.status(400).json({
        success: false,
        message: 'User is not a trader'
      });
    }

    res.status(200).json({
      success: true,
      data: trader
    });
  } catch (error) {
    next(error);
  }
};
