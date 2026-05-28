const { getCoordsForRegion } = require('./geocoding.service');

const SOILGRIDS_URL =
  process.env.SOILGRIDS_URL || 'https://rest.isric.org/soilgrids/v2.0/properties/query';
const OPEN_METEO_URL =
  process.env.OPEN_METEO_CLIMATE_URL || 'https://api.open-meteo.com/v1/forecast';

const REQUEST_MS = Number(process.env.SOIL_REQUEST_TIMEOUT_MS || 20000);

const REGION_DEFAULTS = {
  addis_ababa:        { nitrogen: 70, phosphorus: 25, potassium: 35, ph: 6.8, temperature: 22, humidity: 60, rainfall: 120 },
  oromia:             { nitrogen: 65, phosphorus: 20, potassium: 30, ph: 6.5, temperature: 24, humidity: 65, rainfall: 150 },
  amhara:             { nitrogen: 60, phosphorus: 18, potassium: 28, ph: 6.3, temperature: 22, humidity: 70, rainfall: 140 },
  tigray:             { nitrogen: 50, phosphorus: 15, potassium: 25, ph: 6.0, temperature: 25, humidity: 55, rainfall: 80 },
  sidama:             { nitrogen: 75, phosphorus: 22, potassium: 32, ph: 6.7, temperature: 20, humidity: 75, rainfall: 160 },
  somali:             { nitrogen: 40, phosphorus: 12, potassium: 20, ph: 7.2, temperature: 28, humidity: 45, rainfall: 60 },
  afar:               { nitrogen: 35, phosphorus: 10, potassium: 18, ph: 7.5, temperature: 30, humidity: 40, rainfall: 40 },
  benishangul_gumuz:  { nitrogen: 55, phosphorus: 16, potassium: 26, ph: 6.4, temperature: 26, humidity: 60, rainfall: 110 },
  gambela:            { nitrogen: 60, phosphorus: 18, potassium: 28, ph: 6.2, temperature: 27, humidity: 70, rainfall: 130 },
  harari:             { nitrogen: 65, phosphorus: 22, potassium: 30, ph: 6.6, temperature: 23, humidity: 60, rainfall: 100 },
  dire_dawa:          { nitrogen: 55, phosphorus: 18, potassium: 25, ph: 6.8, temperature: 25, humidity: 55, rainfall: 90 },
  south_ethiopia:     { nitrogen: 70, phosphorus: 22, potassium: 32, ph: 6.6, temperature: 21, humidity: 72, rainfall: 155 },
  south_west:         { nitrogen: 68, phosphorus: 20, potassium: 30, ph: 6.4, temperature: 23, humidity: 68, rainfall: 145 },
};

const SOIL_TYPE_ADJUSTMENTS = {
  clay:    { nitrogen: 1.2,  phosphorus: 1.15, potassium: 1.3,  ph: 0.2 },
  sandy:   { nitrogen: 0.6,  phosphorus: 0.7,  potassium: 0.6,  ph: -0.3 },
  loam:    { nitrogen: 1.0,  phosphorus: 1.0,  potassium: 1.0,  ph: 0.0 },
  silt:    { nitrogen: 1.1,  phosphorus: 1.05, potassium: 1.15, ph: 0.1 },
  peaty:   { nitrogen: 1.5,  phosphorus: 0.8,  potassium: 0.7,  ph: -0.5 },
  chalky:  { nitrogen: 0.8,  phosphorus: 0.9,  potassium: 0.9,  ph: 0.5 },
  laterite:{ nitrogen: 0.7,  phosphorus: 0.5,  potassium: 0.6,  ph: -0.4 },
};

function getDefaultForRegion(region) {
  if (!region) return null;
  const key = region.toLowerCase().replace(/\s+/g, '_').replace(/'/g, '');
  return REGION_DEFAULTS[key] || null;
}

function applySoilAdjustments(base, soilType) {
  if (!soilType || !base) return base;
  const adj = SOIL_TYPE_ADJUSTMENTS[soilType.toLowerCase()];
  if (!adj) return base;
  return {
    nitrogen: Math.round((base.nitrogen || 60) * (adj.nitrogen || 1)),
    phosphorus: Math.round((base.phosphorus || 20) * (adj.phosphorus || 1)),
    potassium: Math.round((base.potassium || 30) * (adj.potassium || 1)),
    ph: Math.round(((base.ph || 6.5) + (adj.ph || 0)) * 10) / 10,
    temperature: base.temperature,
    humidity: base.humidity,
    rainfall: base.rainfall,
  };
}

async function fetchSoilGrids(lat, lon) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_MS);

  try {
    const params = new URLSearchParams({
      lon: String(lon), lat: String(lat),
      property: ['nitrogen', 'phosphorus', 'potassium', 'phh2o'].join(','),
      depth: '0-5cm', value: 'mean',
    });
    const response = await fetch(`${SOILGRIDS_URL}?${params.toString()}`, { signal: controller.signal });
    if (!response.ok) return null;
    const body = await response.json();
    const layers = body?.properties?.layers || [];

    function getMean(name) {
      const layer = layers.find((l) => l.name === name);
      return layer?.depths?.[0]?.values?.mean ?? null;
    }

    return {
      nitrogen: getMean('nitrogen') != null ? getMean('nitrogen') / 100 : null,
      phosphorus: getMean('phosphorus') != null ? getMean('phosphorus') : null,
      potassium: getMean('potassium') != null ? getMean('potassium') : null,
      ph: getMean('phh2o') != null ? getMean('phh2o') / 10 : null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchClimateData(lat, lon) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_MS);

  try {
    const params = new URLSearchParams({
      latitude: String(lat), longitude: String(lon),
      current: ['temperature_2m', 'relative_humidity_2m', 'precipitation'].join(','),
      timezone: 'auto',
    });
    const response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, { signal: controller.signal });
    if (!response.ok) return null;
    const body = await response.json();
    const c = body.current;
    if (!c) return null;
    return {
      temperature: c.temperature_2m ?? null,
      humidity: c.relative_humidity_2m ?? null,
      rainfall: c.precipitation ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function enrichFarmData({ region, woreda, kebele, latitude, longitude, soilColor, soilType }) {
  let lat = latitude != null ? Number(latitude) : null;
  let lon = longitude != null ? Number(longitude) : null;

  if ((lat == null || lon == null) && region) {
    const coords = getCoordsForRegion(region);
    if (coords) { lat = coords.lat; lon = coords.lon; }
  }

  // Start with region defaults, then try to override with API data
  let base = getDefaultForRegion(region);
  let enriched = base ? applySoilAdjustments(base, soilType) : null;

  if (lat != null && lon != null) {
    const [soil, climate] = await Promise.allSettled([
      fetchSoilGrids(lat, lon),
      fetchClimateData(lat, lon),
    ]);

    if (soil.status === 'fulfilled' && soil.value) {
      const s = soil.value;
      if (s.nitrogen != null) enriched = { ...enriched, nitrogen: Math.round(s.nitrogen) };
      if (s.phosphorus != null) enriched = { ...enriched, phosphorus: Math.round(s.phosphorus) };
      if (s.potassium != null) enriched = { ...enriched, potassium: Math.round(s.potassium) };
      if (s.ph != null) enriched = { ...enriched, ph: Math.round(s.ph * 10) / 10 };
    }

    if (climate.status === 'fulfilled' && climate.value) {
      const c = climate.value;
      if (c.temperature != null) enriched = { ...enriched, temperature: c.temperature };
      if (c.humidity != null) enriched = { ...enriched, humidity: c.humidity };
      if (c.rainfall != null) enriched = { ...enriched, rainfall: Math.round(c.rainfall * 10) / 10 };
    }
  }

  if (!enriched) {
    enriched = { nitrogen: 60, phosphorus: 20, potassium: 30, ph: 6.5, temperature: 22, humidity: 60, rainfall: 120 };
  }

  return {
    nitrogen: enriched.nitrogen ?? null,
    phosphorus: enriched.phosphorus ?? null,
    potassium: enriched.potassium ?? null,
    ph: enriched.ph ?? null,
    temperature: enriched.temperature ?? null,
    humidity: enriched.humidity ?? null,
    rainfall: enriched.rainfall ?? null,
    latitude: lat,
    longitude: lon,
    soilColor: soilColor || 'brown',
  };
}

module.exports = { enrichFarmData };
