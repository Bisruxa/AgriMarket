const { prisma } = require('../config/db');

const REGION_MAP = {
  addis: 'Addis Ababa', 'addis ababa': 'Addis Ababa', 'a.a': 'Addis Ababa',
  afar: 'Afar', amhara: 'Amhara',
  'benshangul': 'Benshangul-Gumuz', 'benshangul gumuz': 'Benshangul-Gumuz',
  'benishangul': 'Benshangul-Gumuz', bg: 'Benshangul-Gumuz',
  'dire': 'Dire Dawa', 'dire dawa': 'Dire Dawa',
  gambella: 'Gambella', gambela: 'Gambella',
  harari: 'Harari', harar: 'Harari',
  oromia: 'Oromia', oromiya: 'Oromia',
  sidama: 'Sidama', snnp: 'SNNP', south: 'SNNP',
  somali: 'Somali', tigray: 'Tigray', tigrai: 'Tigray',
};

const CROP_MAP = {
  teff: 'Teff (white)', tef: 'Teff (white)',
  'white teff': 'Teff (white)', 'red teff': 'Teff (red)',
  maize: 'Maize', corn: 'Maize',
  coffee: 'Coffee (beans)', 'coffee beans': 'Coffee (beans)',
  wheat: 'Wheat', barley: 'Barley (white)',
  sorghum: 'Sorghum', chat: 'Chat', khat: 'Chat',
  chickpea: 'Chickpea', shiro: 'Chickpea',
  'haricot bean': 'Haricot Bean (white)', 'haricot beans': 'Haricot Bean (white)',
  'horse bean': 'Horse Bean', 'field pea': 'Field Pea',
};

function normalizeRegion(region) {
  if (!region) return null;
  return REGION_MAP[region.trim().toLowerCase()] || region;
}

function normalizeCrop(cropName) {
  if (!cropName) return null;
  return CROP_MAP[cropName.trim().toLowerCase()] || cropName;
}

async function getPriceTrends({ crop_name, region } = {}) {
  try {
    const dbCrop = normalizeCrop(crop_name);
    const dbRegion = normalizeRegion(region);

    const where = {};
    if (dbCrop) where.cropName = dbCrop;
    if (dbRegion) where.region = dbRegion;

    let rows = await prisma.price.findMany({
      where,
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      take: 6,
    });

    if (rows.length === 0 && dbRegion) {
      delete where.region;
      rows = await prisma.price.findMany({
        where,
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
        take: 6,
      });
    }

    if (rows.length > 0) {
      const prices = rows.map(r => ({
        year: r.year, month: r.month,
        avgPrice: r.avgPrice, minPrice: r.minPrice, maxPrice: r.maxPrice,
      }));
      const avg = prices.reduce((s, p) => s + p.avgPrice, 0) / prices.length;
      const recent = prices[prices.length - 1].avgPrice;
      const first = prices[0].avgPrice;
      const changePct = first ? ((recent - first) / first) * 100 : 0;
      const trend = changePct > 3 ? 'increasing' : changePct < -3 ? 'decreasing' : 'stable';
      const ciLower = +(avg * 0.85).toFixed(2);
      const ciUpper = +(avg * 1.15).toFixed(2);
      return {
        crop_name: dbCrop || crop_name,
        region: dbRegion || 'all regions',
        recent_prices: prices,
        average_price: +avg.toFixed(2),
        price_range: [
          +Math.min(...prices.map(p => p.avgPrice)).toFixed(2),
          +Math.max(...prices.map(p => p.avgPrice)).toFixed(2),
        ],
        trend,
        trend_percentage: +changePct.toFixed(1),
        confidence_interval: [ciLower, ciUpper],
        summary: `${dbCrop || crop_name} in ${dbRegion || 'all regions'}: avg ETB ${avg.toFixed(2)}, ${trend} trend (${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%)`,
      };
    }
    return {
      message: `No specific price data found for ${crop_name} in ${region || 'your region'}.`,
      suggestion: 'Try asking about a common crop like Teff, Maize, or Coffee.',
      recent_prices: [],
    };
  } catch (err) {
    return { message: 'Could not fetch price data right now.', error_detail: err.message };
  }
}

async function getFarmDetails({ farm_id } = {}) {
  try {
    const farm = await prisma.farm.findUnique({ where: { id: farm_id } });
    if (!farm) return { error: `Farm not found: ${farm_id}` };
    return {
      farm: { id: farm.id, name: farm.name, region: farm.region, woreda: farm.woreda, size: farm.size, soilType: farm.soilType, soilColor: farm.soilColor },
      soil_data: { nitrogen: farm.nitrogen, phosphorus: farm.phosphorus, potassium: farm.potassium, ph: farm.ph, soilType: farm.soilType, soilColor: farm.soilColor },
      climate_data: { temperature: farm.temperature, humidity: farm.humidity, rainfall: farm.rainfall },
      location: { region: farm.region, woreda: farm.woreda, latitude: farm.latitude, longitude: farm.longitude },
      summary: `Farm '${farm.name}' in ${farm.region || 'unknown'}: N=${farm.nitrogen}, P=${farm.phosphorus}, K=${farm.potassium}, pH=${farm.ph}`,
    };
  } catch (err) {
    return { error: `Farm not found or inaccessible: ${farm_id}` };
  }
}

async function getUserFarms(userContext) {
  const farms = userContext?.farms || [];
  return {
    farms: farms.map(f => ({
      id: f.id, name: f.name, region: f.region, woreda: f.woreda,
      size: f.size, soilType: f.soilType,
      nitrogen: f.nitrogen, phosphorus: f.phosphorus, potassium: f.potassium, ph: f.ph,
      temperature: f.temperature, humidity: f.humidity, rainfall: f.rainfall,
    })),
    count: farms.length,
    summary: `You have ${farms.length} farm(s) registered.`,
  };
}

async function getWeatherForecast({ latitude, longitude } = {}) {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude), longitude: String(longitude),
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
      timezone: 'auto', forecast_days: '7',
    });
    const resp = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: AbortSignal.timeout(10000) });
    if (!resp.ok) return { error: 'Weather API error' };
    const data = await resp.json();
    const daily = data.daily || {};
    const days = (daily.time || []).map((date, i) => ({
      date,
      maxTemp: daily.temperature_2m_max?.[i] ?? null,
      minTemp: daily.temperature_2m_min?.[i] ?? null,
      precipitation: daily.precipitation_sum?.[i] ?? null,
      weatherCode: daily.weather_code?.[i] ?? null,
    }));
    return {
      location: { latitude, longitude },
      forecast: days,
      summary: days.length ? `7-day forecast for ${latitude}, ${longitude}.` : 'No forecast data.',
    };
  } catch (err) {
    return { error: `Weather fetch failed: ${err.message}` };
  }
}

async function getMarketTrends({ category } = {}) {
  try {
    const where = { isAvailable: true, isActive: true };
    if (category) where.category = category;

    const listings = await prisma.product.findMany({
      where,
      select: { id: true, name: true, price: true, category: true, stock: true, unit: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const catMap = {};
    for (const l of listings) {
      const cat = l.category || 'OTHER';
      if (!catMap[cat]) catMap[cat] = { category: cat, count: 0, totalPrice: 0, listings: [] };
      catMap[cat].count++;
      catMap[cat].totalPrice += Number(l.price) || 0;
      catMap[cat].listings.push({ name: l.name, price: l.price, unit: l.unit, stock: l.stock });
    }

    const snapshot = Object.values(catMap).map(c => ({
      category: c.category,
      listingCount: c.count,
      averagePrice: +(c.totalPrice / c.count).toFixed(2) || 0,
      sampleListings: c.listings.slice(0, 3),
    }));

    return {
      market_data: { snapshot },
      summary: `Market trends available for ${snapshot.length} categories: ${snapshot.map(s => s.category).join(', ')}`,
    };
  } catch (err) {
    return { message: 'Market trends currently unavailable.', market_data: {} };
  }
}

async function getSoilAnalysis({ nitrogen, phosphorus, potassium, ph, region } = {}) {
  const info = [];
  const interpretations = [];

  if (region) info.push(`Region: ${region}`);
  if (nitrogen != null) {
    info.push(`Nitrogen (N): ${nitrogen}`);
    if (nitrogen < 40) interpretations.push('Nitrogen is LOW. Add compost or urea.');
    else if (nitrogen > 80) interpretations.push('Nitrogen is HIGH. Reduce nitrogen fertilizers.');
    else interpretations.push('Nitrogen is ADEQUATE for most crops.');
  }
  if (phosphorus != null) {
    info.push(`Phosphorus (P): ${phosphorus}`);
    if (phosphorus < 15) interpretations.push('Phosphorus is LOW. Add bone meal or phosphate fertilizers.');
    else if (phosphorus > 40) interpretations.push('Phosphorus is HIGH. Reduce phosphorus application.');
    else interpretations.push('Phosphorus is ADEQUATE.');
  }
  if (potassium != null) {
    info.push(`Potassium (K): ${potassium}`);
    if (potassium < 20) interpretations.push('Potassium is LOW. Add potash or wood ash.');
    else if (potassium > 50) interpretations.push('Potassium is HIGH. Reduce potassium fertilizers.');
    else interpretations.push('Potassium is ADEQUATE.');
  }
  if (ph != null) {
    info.push(`pH: ${ph}`);
    if (ph < 5.5) interpretations.push('Soil is too ACIDIC. Add lime to raise pH.');
    else if (ph > 7.5) interpretations.push('Soil is too ALKALINE. Add sulfur or organic matter.');
    else interpretations.push('Soil pH is NEUTRAL and suitable for most crops.');
  }

  if (!info.length) return { error: 'No soil data provided. Please provide at least one parameter.' };

  return {
    soil_data: { nitrogen, phosphorus, potassium, ph, region },
    interpretations,
    summary: info.join(' | ') + (interpretations.length ? ' | ' + interpretations.join(' ') : ''),
  };
}

const HANDLERS = {
  get_price_trends: getPriceTrends,
  get_farm_details: getFarmDetails,
  get_user_farms: getUserFarms,
  get_weather_forecast: getWeatherForecast,
  get_market_trends: getMarketTrends,
  get_soil_analysis: getSoilAnalysis,
};

const FUNCTION_DECLARATIONS = [
  {
    name: 'get_price_trends',
    description: 'Get recent price trends for agricultural crops from the market database',
    parameters: {
      type: 'OBJECT',
      properties: {
        crop_name: { type: 'STRING', description: 'Name of the crop (e.g. Teff, Maize, Coffee)' },
        region: { type: 'STRING', description: 'Region in Ethiopia (e.g. Oromia, Amhara)' },
      },
      required: ['crop_name'],
    },
  },
  {
    name: 'get_farm_details',
    description: 'Get detailed soil and climate data for a specific farm by ID',
    parameters: {
      type: 'OBJECT',
      properties: {
        farm_id: { type: 'STRING', description: 'The ID of the farm to look up' },
      },
      required: ['farm_id'],
    },
  },
  {
    name: 'get_user_farms',
    description: 'List all registered farms for the current user with their soil data',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_weather_forecast',
    description: 'Get 7-day weather forecast for a location using coordinates',
    parameters: {
      type: 'OBJECT',
      properties: {
        latitude: { type: 'NUMBER', description: 'Latitude of the location' },
        longitude: { type: 'NUMBER', description: 'Longitude of the location' },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'get_market_trends',
    description: 'Get current market trends and pricing data for agricultural products',
    parameters: {
      type: 'OBJECT',
      properties: {
        category: { type: 'STRING', description: 'Product category (e.g. GRAINS, VEGETABLES, FRUITS)' },
      },
    },
  },
  {
    name: 'get_soil_analysis',
    description: 'Analyze soil nutrients (N, P, K, pH) and provide improvement recommendations',
    parameters: {
      type: 'OBJECT',
      properties: {
        region: { type: 'STRING', description: 'Region name in Ethiopia' },
        nitrogen: { type: 'NUMBER', description: 'Nitrogen level in soil' },
        phosphorus: { type: 'NUMBER', description: 'Phosphorus level in soil' },
        potassium: { type: 'NUMBER', description: 'Potassium level in soil' },
        ph: { type: 'NUMBER', description: 'Soil pH level' },
      },
    },
  },
];

async function executeFunction(name, args, userContext) {
  const handler = HANDLERS[name];
  if (!handler) return { error: `Unknown function: ${name}` };
  try {
    if (name === 'get_user_farms') return { result: await handler(userContext) };
    return { result: await handler(args || {}) };
  } catch (err) {
    return { error: `Function ${name} execution failed: ${err.message}` };
  }
}

module.exports = { FUNCTION_DECLARATIONS, executeFunction };
