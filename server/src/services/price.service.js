const { prisma } = require('../config/db');

function priceModel() {
  if (!prisma.price) {
    const err = new Error(
      'Price data model is unavailable. Stop the server, run `npx prisma generate` in /server, then restart.'
    );
    err.statusCode = 503;
    throw err;
  }
  return prisma.price;
}

async function getPriceTrends({ cropName, region, limit = 12 }) {
  return priceModel().findMany({
    where: {
      ...(cropName && { cropName }),
      ...(region && { region }),
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
    take: limit,
  });
}

function monthName(month) {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return names[Math.max(1, Math.min(12, month)) - 1];
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

async function getSalesTiming({ cropName, region }) {
  if (!cropName) {
    const err = new Error('cropName is required');
    err.statusCode = 400;
    throw err;
  }

  const rows = await priceModel().findMany({
    where: {
      cropName,
      ...(region ? { region } : {}),
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });

  if (!rows.length) {
    return {
      cropName,
      region: region || null,
      hasData: false,
      recommendation: null,
    };
  }

  /** @type {Map<number, number[]>} */
  const byMonth = new Map();
  for (const row of rows) {
    const list = byMonth.get(row.month) || [];
    list.push(row.avgPrice);
    byMonth.set(row.month, list);
  }

  const monthAverages = [...byMonth.entries()]
    .map(([month, values]) => ({
      month,
      monthName: monthName(month),
      avgPrice: Number(average(values).toFixed(2)),
      samples: values.length,
    }))
    .sort((a, b) => b.avgPrice - a.avgPrice);

  const latest = rows[rows.length - 1];
  const best = monthAverages[0];
  const low = monthAverages[monthAverages.length - 1];
  const expectedGainPercent = latest?.avgPrice
    ? Number((((best.avgPrice - latest.avgPrice) / latest.avgPrice) * 100).toFixed(1))
    : 0;

  return {
    cropName,
    region: region || latest.region || null,
    hasData: true,
    recommendation: {
      bestSellMonth: best.month,
      bestSellMonthName: best.monthName,
      averageBestPrice: best.avgPrice,
      lowestMonth: low.month,
      lowestMonthName: low.monthName,
      averageLowestPrice: low.avgPrice,
      latestKnownPrice: latest.avgPrice,
      latestKnownPeriod: `${latest.year}-${String(latest.month).padStart(2, '0')}`,
      expectedGainPercent,
    },
    topMonths: monthAverages.slice(0, 3),
    dataPoints: rows.length,
  };
}

function normalizeCropName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

async function getMultiCropProfitability({ userId, farmId }) {
  const farmWhere = {
    farmerId: userId,
    isActive: true,
    ...(farmId ? { id: farmId } : {}),
  };

  const farms = await prisma.farm.findMany({
    where: farmWhere,
    select: {
      id: true,
      name: true,
      region: true,
      crops: true,
      size: true,
      sizeUnit: true,
    },
  });

  const cropFromFarms = farms.flatMap((f) => (Array.isArray(f.crops) ? f.crops : []));
  const products = await prisma.product.findMany({
    where: { farmerId: userId },
    select: { name: true, stock: true, isAvailable: true },
  });
  const cropFromProducts = products.map((p) => p.name);

  const uniqueCrops = [...new Set([...cropFromFarms, ...cropFromProducts])]
    .map((c) => String(c).trim())
    .filter(Boolean);

  if (!uniqueCrops.length) {
    return {
      hasData: false,
      summary: null,
      items: [],
      message: 'No crops found. Add crops to farms or market listings.',
    };
  }

  const candidateRegions = [...new Set(farms.map((f) => f.region).filter(Boolean))];
  const prices = await priceModel().findMany({
    where: {
      ...(candidateRegions.length ? { region: { in: candidateRegions } } : {}),
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });

  const rowsByCrop = new Map();
  for (const row of prices) {
    const key = normalizeCropName(row.cropName);
    if (!rowsByCrop.has(key)) rowsByCrop.set(key, []);
    rowsByCrop.get(key).push(row);
  }

  const items = uniqueCrops
    .map((crop) => {
      const rows = rowsByCrop.get(normalizeCropName(crop)) || [];
      if (!rows.length) {
        return {
          cropName: crop,
          hasPriceData: false,
          score: 0,
        };
      }

      const latest = rows[rows.length - 1];
      const recent = rows.slice(-6);
      const recentAvg = average(recent.map((r) => r.avgPrice));
      const annual = rows.slice(-12);
      const annualAvg = average(annual.map((r) => r.avgPrice));
      const trendPercent = recentAvg
        ? Number((((latest.avgPrice - recentAvg) / recentAvg) * 100).toFixed(1))
        : 0;
      const score = Number((latest.avgPrice * (1 + trendPercent / 100)).toFixed(2));

      return {
        cropName: crop,
        hasPriceData: true,
        region: latest.region,
        latestPrice: Number(latest.avgPrice.toFixed(2)),
        recentAverage: Number(recentAvg.toFixed(2)),
        annualAverage: Number(annualAvg.toFixed(2)),
        trendPercent,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  const withData = items.filter((i) => i.hasPriceData);
  const top = withData.slice(0, 3);
  const diversificationIndex = Number(
    (
      withData.reduce((sum, item) => sum + Math.max(0, item.trendPercent), 0) /
      Math.max(withData.length, 1)
    ).toFixed(1)
  );

  return {
    hasData: withData.length > 0,
    summary: {
      farmsAnalyzed: farms.length,
      cropsAnalyzed: uniqueCrops.length,
      profitableNow: withData.filter((i) => i.trendPercent >= 0).length,
      diversificationIndex,
      topRecommendation: top[0]?.cropName || null,
    },
    topRecommendations: top,
    items,
  };
}

async function getAvailableCrops() {
  const results = await priceModel().findMany({
    select: { cropName: true },
    distinct: ['cropName'],
    orderBy: { cropName: 'asc' },
  });
  return results.map(r => r.cropName);
}

async function getAvailableRegions() {
  const results = await priceModel().findMany({
    select: { region: true },
    distinct: ['region'],
    orderBy: { region: 'asc' },
  });
  return results.map(r => r.region);
}

async function getYearRange() {
  const oldest = await priceModel().findFirst({ orderBy: { year: 'asc' } });
  const newest = await priceModel().findFirst({ orderBy: { year: 'desc' } });
  return {
    minYear: oldest?.year || 2015,
    maxYear: newest?.year || 2024,
  };
}

module.exports = {
  getPriceTrends,
  getAvailableCrops,
  getAvailableRegions,
  getYearRange,
  getSalesTiming,
  getMultiCropProfitability,
};