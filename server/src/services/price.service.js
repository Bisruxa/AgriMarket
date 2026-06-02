const { prisma } = require('../config/db');

async function getPriceTrends({ cropName, region, limit = 12 }) {
  return prisma.price.findMany({
    where: {
      ...(cropName && { cropName }),
      ...(region && { region }),
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
    take: limit,
  });
}

async function getAvailableCrops() {
  const results = await prisma.price.findMany({
    select: { cropName: true },
    distinct: ['cropName'],
    orderBy: { cropName: 'asc' },
  });
  return results.map(r => r.cropName);
}

async function getAvailableRegions() {
  const results = await prisma.price.findMany({
    select: { region: true },
    distinct: ['region'],
    orderBy: { region: 'asc' },
  });
  return results.map(r => r.region);
}

async function getYearRange() {
  const oldest = await prisma.price.findFirst({ orderBy: { year: 'asc' } });
  const newest = await prisma.price.findFirst({ orderBy: { year: 'desc' } });
  return {
    minYear: oldest?.year || 2015,
    maxYear: newest?.year || 2024,
  };
}

module.exports = { getPriceTrends, getAvailableCrops, getAvailableRegions, getYearRange };