const { prisma } = require('../config/db');
const { Prisma } = require('@prisma/client');
const { predictPrice } = require('./agriai.service');

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

function clampLimit(value, fallback = 5) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(10, Math.max(1, n));
}

function normalizeCropName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function getNextMonthRef(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
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

/**
 * AI-assisted buying opportunities for traders.
 * Score is driven by expected spread (AI predicted next-month price vs current listing avg).
 * @param {{ region?: string, crop?: string, limit?: string|number }} query
 */
async function getBuyingOpportunities(query = {}) {
  const region = query.region?.trim() || null;
  const crop = query.crop?.trim() || null;
  const limit = clampLimit(query.limit, 5);

  const where = {
    isAvailable: true,
    farmer: {
      deletedAt: null,
      ...(region ? { region: { contains: region, mode: 'insensitive' } } : {}),
    },
    ...(crop ? { name: { contains: crop, mode: 'insensitive' } } : {}),
  };

  const listings = await prisma.product.findMany({
    where,
    select: {
      name: true,
      category: true,
      price: true,
      stock: true,
      farmer: { select: { region: true } },
    },
    take: 500,
    orderBy: { createdAt: 'desc' },
  });

  if (!listings.length) {
    return {
      generatedAt: new Date().toISOString(),
      filters: { region, crop, limit },
      opportunities: [],
      message: 'No active listings found for the selected filters.',
    };
  }

  const grouped = new Map();
  for (const row of listings) {
    const key = normalizeCropName(row.name);
    if (!grouped.has(key)) {
      grouped.set(key, {
        cropName: row.name.trim(),
        category: row.category,
        listingCount: 0,
        totalPrice: 0,
        totalStock: 0,
        regionVotes: {},
      });
    }
    const bucket = grouped.get(key);
    bucket.listingCount += 1;
    bucket.totalPrice += Number(row.price);
    bucket.totalStock += row.stock || 0;
    const voteRegion = row.farmer?.region || region || 'Addis Ababa';
    bucket.regionVotes[voteRegion] = (bucket.regionVotes[voteRegion] || 0) + 1;
  }

  const candidates = [...grouped.values()]
    .map((item) => {
      const avgListingPrice = item.listingCount ? item.totalPrice / item.listingCount : 0;
      const dominantRegion = Object.entries(item.regionVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Addis Ababa';
      return {
        cropName: item.cropName,
        category: item.category,
        region: dominantRegion,
        avgListingPrice: Number(avgListingPrice.toFixed(2)),
        listingCount: item.listingCount,
        totalStock: item.totalStock,
      };
    })
    .sort((a, b) => b.listingCount - a.listingCount)
    .slice(0, limit);

  const forecastRef = getNextMonthRef();
  const withAi = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        const ai = await predictPrice({
          crop_name: candidate.cropName,
          region: candidate.region,
          year: forecastRef.year,
          month: forecastRef.month,
        });
        const predictedPrice = Number(ai?.predicted_price);
        if (!Number.isFinite(predictedPrice)) {
          throw new Error('Invalid prediction value');
        }
        const spreadPercent =
          candidate.avgListingPrice > 0
            ? Number((((predictedPrice - candidate.avgListingPrice) / candidate.avgListingPrice) * 100).toFixed(1))
            : null;
        const stockSignal = Math.min(12, Math.log10(candidate.totalStock + 1) * 6);
        const demandSignal = Math.min(15, candidate.listingCount * 1.5);
        const score = Number(((spreadPercent || 0) + stockSignal + demandSignal).toFixed(1));
        let recommendation = 'HOLD';
        if ((spreadPercent || 0) >= 8) recommendation = 'STRONG_BUY';
        else if ((spreadPercent || 0) >= 3) recommendation = 'CONSIDER_BUY';
        else if ((spreadPercent || 0) <= -4) recommendation = 'AVOID';

        return {
          ...candidate,
          aiForecast: {
            predictedPrice: Number(predictedPrice.toFixed(2)),
            trend: ai?.trend || null,
            trendPercentage: ai?.trend_percentage ?? null,
            confidenceInterval: ai?.confidence_interval ?? null,
            forecastMonth: forecastRef.month,
            forecastYear: forecastRef.year,
          },
          spreadPercent,
          score,
          recommendation,
        };
      } catch (error) {
        return {
          ...candidate,
          aiForecast: null,
          spreadPercent: null,
          score: 0,
          recommendation: 'INSUFFICIENT_DATA',
        };
      }
    })
  );

  withAi.sort((a, b) => b.score - a.score);

  return {
    generatedAt: new Date().toISOString(),
    filters: { region, crop, limit },
    opportunities: withAi,
    notes: [
      'AI forecast uses the same AgriAI price predictor used in farmer price forecast.',
      'Score combines expected price spread, active listing depth, and stock liquidity.',
    ],
  };
}

module.exports = {
  getMarketTrends,
  getBuyingOpportunities,
  PRODUCT_CATEGORIES,
};
