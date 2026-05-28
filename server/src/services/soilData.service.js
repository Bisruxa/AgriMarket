const { getCoordsForRegion } = require('./geocoding.service');

const SOILGRIDS_URL =
  process.env.SOILGRIDS_URL || 'https://rest.isric.org/soilgrids/v2.0/properties/query';
const OPEN_METEO_URL =
  process.env.OPEN_METEO_CLIMATE_URL || 'https://api.open-meteo.com/v1/forecast';

const REQUEST_MS = Number(process.env.SOIL_REQUEST_TIMEOUT_MS || 20000);

// SoilGrids returns total N in cg/kg. The ML model expects available N in kg/ha.
// Conversion: total N (kg/ha) = N_cgkg × 20 × bulk_density (assumed 1.0 for Ethiopian highlands).
// Available N ≈ 1% of total N (mineralization rate for tropical soils).
// So: available N ≈ N_cgkg × 20 × 0.01 = N_cgkg × 0.2.
// Override via SOILGRIDS_N_SCALE env var.
const N_SCALE = Number(process.env.SOILGRIDS_N_SCALE || 0.2);

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

function normalizeKey(s) {
  if (!s) return '';
  return s.toLowerCase().replace(/\s+/g, '_').replace(/'/g, '');
}

function getDefaultForRegion(region) {
  return REGION_DEFAULTS[normalizeKey(region)] || null;
}

function adjustForSoil(base, soilType) {
  if (!base) return null;
  const adj = soilType ? SOIL_TYPE_ADJUSTMENTS[soilType.toLowerCase()] : null;
  if (!adj) return { ...base };
  return {
    nitrogen: Math.round((base.nitrogen || 60) * adj.nitrogen),
    phosphorus: Math.round((base.phosphorus || 20) * adj.phosphorus),
    potassium: Math.round((base.potassium || 30) * adj.potassium),
    ph: Math.round(((base.ph || 6.5) + adj.ph) * 10) / 10,
    temperature: base.temperature,
    humidity: base.humidity,
    rainfall: base.rainfall,
  };
}

// Query a single SoilGrids property (individual queries work, batch often fails)
async function fetchSoilProperty(lat, lon, property) {
  const params = new URLSearchParams({
    lon: String(lon), lat: String(lat),
    property,
    depth: '0-5cm', value: 'mean',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_MS);

  try {
    const response = await fetch(`${SOILGRIDS_URL}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const body = await response.json();
    return body?.properties?.layers?.[0]?.depths?.[0]?.values?.mean ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSoilGrids(lat, lon) {
  const [rawN, rawP, rawK, rawPh] = await Promise.all([
    fetchSoilProperty(lat, lon, 'nitrogen'),
    fetchSoilProperty(lat, lon, 'phosphorus'),
    fetchSoilProperty(lat, lon, 'potassium'),
    fetchSoilProperty(lat, lon, 'phh2o'),
  ]);

  // SoilGrids N = total N (cg/kg) → scale to available N (kg/ha) via N_SCALE factor.
  // SoilGrids P, K in mg/kg — roughly same ballpark as model's available P, K.
  // SoilGrids pH in pHx10 — divide by 10 to get standard pH.
  const nitrogen = rawN != null ? Math.round(rawN * N_SCALE) : null;
  const phosphorus = rawP != null ? Math.round(rawP * 10) / 10 : null;
  const potassium = rawK != null ? Math.round(rawK * 10) / 10 : null;
  const ph = rawPh != null ? Math.round((rawPh / 10) * 10) / 10 : null;

  console.log(`[soilData] SoilGrids: N=${rawN}→${nitrogen}, P=${rawP}→${phosphorus}, K=${rawK}→${potassium}, pH=${rawPh}→${ph}`);

  return { nitrogen, phosphorus, potassium, ph };
}

async function fetchClimateData(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat), longitude: String(lon),
    current: ['temperature_2m', 'relative_humidity_2m', 'precipitation'].join(','),
    timezone: 'auto',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_MS);

  try {
    const response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
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
  // Resolve lat/lon
  let lat = latitude != null ? Number(latitude) : null;
  let lon = longitude != null ? Number(longitude) : null;

  if ((lat == null || lon == null) && region) {
    const coords = getCoordsForRegion(region);
    if (coords) { lat = coords.lat; lon = coords.lon; }
    console.log(`[soilData] Geocoded ${region} → (${lat}, ${lon})`);
  }

  // Start with region baseline adjusted for soil type
  const base = adjustForSoil(getDefaultForRegion(region), soilType) || {
    nitrogen: 60, phosphorus: 20, potassium: 30, ph: 6.5, temperature: 22, humidity: 60, rainfall: 120,
  };

  const result = { ...base };

  // Try Open APIs when coordinates available — per-property override
  if (lat != null && lon != null) {
    const [soil, climate] = await Promise.allSettled([
      fetchSoilGrids(lat, lon),
      fetchClimateData(lat, lon),
    ]);

    if (soil.status === 'fulfilled' && soil.value) {
      const s = soil.value;
      if (s.nitrogen != null) result.nitrogen = s.nitrogen;
      if (s.phosphorus != null) result.phosphorus = s.phosphorus;
      if (s.potassium != null) result.potassium = s.potassium;
      if (s.ph != null) result.ph = s.ph;
    }

    if (climate.status === 'fulfilled' && climate.value) {
      const c = climate.value;
      if (c.temperature != null) result.temperature = c.temperature;
      if (c.humidity != null) result.humidity = c.humidity;
      if (c.rainfall != null) result.rainfall = Math.round(c.rainfall * 10) / 10;
    }
  }

  console.log(`[soilData] Final: N=${result.nitrogen} P=${result.phosphorus} K=${result.potassium} pH=${result.ph} temp=${result.temperature} hum=${result.humidity} rain=${result.rainfall}`);

  return {
    nitrogen: result.nitrogen,
    phosphorus: result.phosphorus,
    potassium: result.potassium,
    ph: result.ph,
    temperature: result.temperature,
    humidity: result.humidity,
    rainfall: result.rainfall,
    latitude: lat,
    longitude: lon,
    soilColor: soilColor || 'brown',
  };
}

module.exports = { enrichFarmData };
