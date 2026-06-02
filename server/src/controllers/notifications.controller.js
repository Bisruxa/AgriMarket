const { prisma } = require('../config/db');
const { fetchForecast } = require('../services/weather.service');
const { getSalesTiming } = require('../services/price.service');

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

      // Price movement alerts based on farmer's listed crops
      const cropNames = [...new Set(products.map((p) => p.name).filter(Boolean))].slice(0, 3);
      if (!prisma.price) {
        // Stale Prisma client (run `npx prisma generate` and restart server)
      } else for (const cropName of cropNames) {
        const rows = await prisma.price.findMany({
          where: { cropName },
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 2,
        });
        if (rows.length < 2) continue;

        const latest = rows[0];
        const prev = rows[1];
        if (!prev.avgPrice) continue;

        const pct = ((latest.avgPrice - prev.avgPrice) / prev.avgPrice) * 100;
        if (pct >= 10) {
          notifications.push({
            id: 'farmer-price-up',
            type: 'success',
            href: '/farmer/trends',
            count: Math.round(pct),
            createdAt: now,
          });
        } else if (pct <= -10) {
          notifications.push({
            id: 'farmer-price-down',
            type: 'warning',
            href: '/farmer/trends',
            count: Math.abs(Math.round(pct)),
            createdAt: now,
          });
        }

        // only one alert per refresh cycle
        if (notifications.some((n) => n.id === 'farmer-price-up' || n.id === 'farmer-price-down')) {
          break;
        }
      }

      // Sales timing recommendation alert
      if (cropNames.length && prisma.price) {
        try {
          const timing = await getSalesTiming({ cropName: cropNames[0] });
          if (timing?.hasData && timing?.recommendation?.expectedGainPercent >= 5) {
            notifications.push({
              id: 'farmer-sell-window',
              type: 'tip',
              href: '/farmer/trends',
              count: Math.round(timing.recommendation.expectedGainPercent),
              createdAt: now,
            });
          }
        } catch {
          // non-blocking
        }
      }

      // Weather warnings (heavy rain / heat risk)
      const homeFarm = await prisma.farm.findFirst({
        where: { farmerId: user.id, isActive: true, latitude: { not: null }, longitude: { not: null } },
        select: { latitude: true, longitude: true },
      });
      if (homeFarm?.latitude != null && homeFarm?.longitude != null) {
        try {
          const forecast = await fetchForecast(homeFarm.latitude, homeFarm.longitude);
          const maxRain = Math.max(...(forecast.daily || []).map((d) => d.precipitationSumMm || 0), 0);
          const maxTemp = Math.max(...(forecast.daily || []).map((d) => d.tempMaxC || 0), 0);

          if (maxRain >= 40) {
            notifications.push({
              id: 'farmer-weather-rain',
              type: 'warning',
              href: '/farmer/dashboard',
              createdAt: now,
            });
          } else if (maxTemp >= 34) {
            notifications.push({
              id: 'farmer-weather-heat',
              type: 'warning',
              href: '/farmer/dashboard',
              createdAt: now,
            });
          }
        } catch {
          // non-blocking
        }
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
