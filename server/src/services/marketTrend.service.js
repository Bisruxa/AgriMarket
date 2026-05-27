const { prisma } = require('../config/db');
const { Prisma } = require('@prisma/client');

const PRODUCT_CATEGORIES = [
  'VEGETABLES',
  'FRUITS',
  'GRAINS',
  'DAIRY',
  'POULTRY',
  'MEAT',
  'SEEDS',
  'FERTILIZERS',
  'EQUIPMENT',
  'OTHER',
];

function clampWeeks(value) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return 8;
  return Math.min(52, Math.max(1, n));
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildProductWhere(region, category) {
  const farmerWhere = { deletedAt: null };
  if (region) {
    farmerWhere.region = { contains: region, mode: 'insensitive' };
  }
  const where = {
    isAvailable: true,
    farmer: farmerWhere,
  };
  if (category) where.category = category;
  return where;
}

async function getSnapshotByCategory(region, category) {
  const where = buildProductWhere(region, category);
  const rows = await prisma.product.groupBy({
    by: ['category'],
    where,
    _count: { _all: true },
    _avg: { price: true },
    _min: { price: true },
    _max: { price: true },
    _sum: { stock: true },
  });

  return rows.map((r) => ({
    category: r.category,
    listingCount: r._count._all,
    avgPrice: toNumber(r._avg.price),
    minPrice: toNumber(r._min.price),
    maxPrice: toNumber(r._max.price),
    totalStockUnits: r._sum.stock ?? 0,
  }));
}

async function getWeeklyNewListings(region, category, weeks) {
  const daySpan = weeks * 7;
  const parts = [
    Prisma.sql`p."isAvailable" = true`,
    Prisma.sql`u."deletedAt" IS NULL`,
    Prisma.sql`p."createdAt" >= NOW() - (${daySpan} * INTERVAL '1 day')`,
  ];
  if (region) {
    parts.push(Prisma.sql`u.region ILIKE ${`%${region}%`}`);
  }
  if (category) {
    parts.push(Prisma.sql`p.category::text = ${category}`);
  }
  const whereClause = Prisma.join(parts, ' AND ');

  const rows = await prisma.$queryRaw`
    SELECT
      date_trunc('week', p."createdAt") AS "weekStart",
      p.category::text AS category,
      AVG(CAST(p.price AS DOUBLE PRECISION)) AS "avgListingPrice",
      COUNT(*)::int AS "newListings"
    FROM products p
    INNER JOIN users u ON u.id = p."farmerId"
    WHERE ${whereClause}
    GROUP BY 1, p.category
    ORDER BY 1 ASC, p.category ASC
  `;

  return rows.map((r) => ({
    weekStart: r.weekStart instanceof Date ? r.weekStart.toISOString() : r.weekStart,
    category: r.category,
    avgListingPrice:
      r.avgListingPrice == null ? null : toNumber(r.avgListingPrice),
    newListings: r.newListings,
  }));
}

function computeCategoryMomentum(weeklyRows) {
  const byCategory = new Map();
  for (const row of weeklyRows) {
    if (!byCategory.has(row.category)) byCategory.set(row.category, []);
    byCategory.get(row.category).push({ ...row });
  }

  const results = [];
  for (const [category, rows] of byCategory) {
    rows.sort(
      (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
    );

    if (rows.length < 2) {
      results.push({
        category,
        direction: 'insufficient_data',
        changePercent: null,
        recentWeightedAvgPrice: null,
        priorWeightedAvgPrice: null,
        weeksCompared: rows.length,
      });
      continue;
    }

    const weightedAvg = (slice) => {
      let weight = 0;
      let sum = 0;
      for (const r of slice) {
        const w = r.newListings || 0;
        const p = r.avgListingPrice;
        if (w <= 0 || p == null) continue;
        sum += p * w;
        weight += w;
      }
      return weight > 0 ? sum / weight : null;
    };

    const mid = Math.ceil(rows.length / 2);
    const priorSlice = rows.slice(0, mid);
    const recentSlice = rows.slice(mid);
    const priorAvg = weightedAvg(priorSlice);
    const recentAvg = weightedAvg(recentSlice);

    let direction = 'flat';
    let changePercent = null;
    if (priorAvg != null && recentAvg != null && priorAvg > 0) {
      changePercent = ((recentAvg - priorAvg) / priorAvg) * 100;
      if (changePercent > 2) direction = 'up';
      else if (changePercent < -2) direction = 'down';
    } else {
      direction = 'insufficient_data';
    }

    results.push({
      category,
      direction,
      changePercent:
        changePercent == null ? null : Math.round(changePercent * 10) / 10,
      recentWeightedAvgPrice: recentAvg,
      priorWeightedAvgPrice: priorAvg,
      weeksCompared: rows.length,
    });
  }

  results.sort((a, b) => a.category.localeCompare(b.category));
  return results;
}

/**
 * Market trend snapshot from live product listings + weekly new-listing prices.
 * @param {{ weeks?: string|number, region?: string, category?: string }} query
 */
async function getMarketTrends(query = {}) {
  const weeks = clampWeeks(query.weeks);
  const region = query.region?.trim() || null;
  const rawCategory = query.category?.trim().toUpperCase() || null;
  const category =
    rawCategory && PRODUCT_CATEGORIES.includes(rawCategory) ? rawCategory : null;

  if (rawCategory && !category) {
    const err = new Error(
      `Invalid category. Use one of: ${PRODUCT_CATEGORIES.join(', ')}`
    );
    err.statusCode = 400;
    throw err;
  }

  const [snapshotByCategory, weeklyNewListings] = await Promise.all([
    getSnapshotByCategory(region, category),
    getWeeklyNewListings(region, category, weeks),
  ]);

  const categoryMomentum = computeCategoryMomentum(weeklyNewListings);

  return {
    generatedAt: new Date().toISOString(),
    filters: { weeks, region, category },
    notes: [
      'Snapshot reflects current available listings on AgriMarket.',
      'Weekly series uses new listings created in each calendar week (average ask price), not repeated measures of the same SKUs.',
      'Momentum compares the first half of the selected window to the second half (volume-weighted by new listing counts).',
    ],
    snapshotByCategory,
    weeklyNewListings,
    categoryMomentum,
  };
}

module.exports = {
  getMarketTrends,
  PRODUCT_CATEGORIES,
};
