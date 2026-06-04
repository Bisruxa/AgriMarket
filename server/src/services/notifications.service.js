const { prisma } = require('../config/db');
const { fetchForecast } = require('./weather.service');
const { getSalesTiming } = require('./price.service');

function hasPriceModel() {
  return prisma.price && typeof prisma.price.findMany === 'function';
}

/**
 * API shape — `id` is the stable `key` for client label maps.
 */
function formatNotification(row) {
  return {
    id: row.key,
    key: row.key,
    type: row.type,
    href: row.href,
    count: row.count ?? undefined,
    note: row.note ?? undefined,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Build alerts that should exist right now for this user (same rules as before).
 */
async function buildDesiredNotifications(user) {
  const notifications = [];
  const role = user.role;

  if (role === 'FARMER') {
    const farms = await prisma.farm.count({
      where: { farmerId: user.id, isActive: true },
    });
    if (farms === 0) {
      notifications.push({
        key: 'farmer-no-farms',
        type: 'info',
        href: '/farmer/farms',
      });
    }

    const products = await prisma.product.findMany({
      where: { farmerId: user.id },
      select: { id: true, name: true, stock: true, isAvailable: true },
    });

    const soldOut = products.filter((p) => !p.isAvailable || p.stock === 0);
    if (soldOut.length > 0) {
      notifications.push({
        key: 'farmer-sold-out',
        type: 'warning',
        href: '/farmer/market',
        count: soldOut.length,
      });
    }

    const lowStock = products.filter(
      (p) => p.isAvailable && p.stock > 0 && p.stock <= 5,
    );
    if (lowStock.length > 0) {
      notifications.push({
        key: 'farmer-low-stock',
        type: 'warning',
        href: '/farmer/market',
        count: lowStock.length,
      });
    }

    if (farms > 0) {
      notifications.push({
        key: 'farmer-crop-tip',
        type: 'tip',
        href: '/farmer/cropdetail',
      });
    }

    const cropNames = [...new Set(products.map((p) => p.name).filter(Boolean))].slice(
      0,
      3,
    );

    if (hasPriceModel()) {
      for (const cropName of cropNames) {
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
            key: 'farmer-price-up',
            type: 'success',
            href: '/farmer/trends',
            count: Math.round(pct),
          });
        } else if (pct <= -10) {
          notifications.push({
            key: 'farmer-price-down',
            type: 'warning',
            href: '/farmer/trends',
            count: Math.abs(Math.round(pct)),
          });
        }

        if (
          notifications.some(
            (n) => n.key === 'farmer-price-up' || n.key === 'farmer-price-down',
          )
        ) {
          break;
        }
      }

      if (cropNames.length) {
        try {
          const timing = await getSalesTiming({ cropName: cropNames[0] });
          if (timing?.hasData && timing?.recommendation?.expectedGainPercent >= 5) {
            notifications.push({
              key: 'farmer-sell-window',
              type: 'tip',
              href: '/farmer/trends',
              count: Math.round(timing.recommendation.expectedGainPercent),
            });
          }
        } catch {
          // non-blocking
        }
      }
    }

    const homeFarm = await prisma.farm.findFirst({
      where: {
        farmerId: user.id,
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: { latitude: true, longitude: true },
    });
    if (homeFarm?.latitude != null && homeFarm?.longitude != null) {
      try {
        const forecast = await fetchForecast(homeFarm.latitude, homeFarm.longitude);
        const maxRain = Math.max(
          ...(forecast.daily || []).map((d) => d.precipitationSumMm || 0),
          0,
        );
        const maxTemp = Math.max(
          ...(forecast.daily || []).map((d) => d.tempMaxC || 0),
          0,
        );

        if (maxRain >= 40) {
          notifications.push({
            key: 'farmer-weather-rain',
            type: 'warning',
            href: '/farmer/dashboard',
          });
        } else if (maxTemp >= 34) {
          notifications.push({
            key: 'farmer-weather-heat',
            type: 'warning',
            href: '/farmer/dashboard',
          });
        }
      } catch {
        // non-blocking
      }
    }
  }

  if (role === 'TRADER') {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { approvalStatus: true, approvalNote: true },
    });

    if (fullUser?.approvalStatus === 'PENDING') {
      notifications.push({
        key: 'trader-pending',
        type: 'info',
        href: '/trader/dashboard',
      });
    }
    if (fullUser?.approvalStatus === 'REJECTED') {
      notifications.push({
        key: 'trader-rejected',
        type: 'error',
        href: '/trader/dashboard',
        note: fullUser.approvalNote || null,
      });
    }
    if (fullUser?.approvalStatus === 'APPROVED') {
      notifications.push({
        key: 'trader-welcome',
        type: 'success',
        href: '/trader/purchases',
      });
    }
  }

  if (role === 'ADMIN') {
    const pendingCount = await prisma.user.count({
      where: { role: 'TRADER', approvalStatus: 'PENDING', deletedAt: null },
    });
    if (pendingCount > 0) {
      notifications.push({
        key: 'admin-pending-traders',
        type: 'action',
        href: '/admin/traderApproval',
        count: pendingCount,
      });
    }
  }

  return notifications;
}

async function syncNotificationsForUser(user) {
  if (!prisma.notification) {
    throw new Error(
      'Notification model missing - run: npx prisma generate && npx prisma migrate deploy',
    );
  }

  const desired = await buildDesiredNotifications(user);
  const desiredKeys = desired.map((d) => d.key);

  for (const item of desired) {
    await prisma.notification.upsert({
      where: {
        userId_key: { userId: user.id, key: item.key },
      },
      create: {
        userId: user.id,
        key: item.key,
        type: item.type,
        href: item.href,
        count: item.count ?? null,
        note: item.note ?? null,
      },
      update: {
        type: item.type,
        href: item.href,
        count: item.count ?? null,
        note: item.note ?? null,
      },
    });
  }

  if (desiredKeys.length === 0) {
    await prisma.notification.deleteMany({ where: { userId: user.id } });
  } else {
    await prisma.notification.deleteMany({
      where: {
        userId: user.id,
        key: { notIn: desiredKeys },
      },
    });
  }
}

async function syncAndList(user) {
  await syncNotificationsForUser(user);

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const notifications = rows.map(formatNotification);
  const unreadCount = rows.filter((r) => !r.isRead).length;

  return { notifications, unreadCount };
}

async function listNotifications(userId) {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  const notifications = rows.map(formatNotification);
  const unreadCount = rows.filter((r) => !r.isRead).length;
  return { notifications, unreadCount };
}

async function upsertNotification(userId, item) {
  if (!prisma.notification) return null;

  return prisma.notification.upsert({
    where: { userId_key: { userId, key: item.key } },
    create: {
      userId,
      key: item.key,
      type: item.type,
      href: item.href,
      count: item.count ?? null,
      note: item.note ?? null,
    },
    update: {
      type: item.type,
      href: item.href,
      count: item.count ?? null,
      note: item.note ?? null,
    },
  });
}

async function removeNotification(userId, key) {
  if (!prisma.notification) return;
  await prisma.notification.deleteMany({ where: { userId, key } });
}

async function markAsRead(userId, key) {
  if (!prisma.notification) {
    throw new Error('Notification model not available');
  }
  const row = await prisma.notification.findUnique({
    where: { userId_key: { userId, key } },
  });
  if (!row) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  await prisma.notification.update({
    where: { id: row.id },
    data: { isRead: true, readAt: new Date() },
  });
}

async function markAllAsRead(userId) {
  if (!prisma.notification) return { count: 0 };
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return { count: result.count };
}

async function dismissNotification(userId, key) {
  if (!prisma.notification) return;
  await prisma.notification.deleteMany({ where: { userId, key } });
}

module.exports = {
  formatNotification,
  buildDesiredNotifications,
  syncNotificationsForUser,
  syncAndList,
  listNotifications,
  upsertNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  dismissNotification,
};
