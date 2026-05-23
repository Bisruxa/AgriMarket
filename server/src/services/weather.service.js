const OPEN_METEO_FORECAST =
  process.env.OPEN_METEO_FORECAST_URL || 'https://api.open-meteo.com/v1/forecast';

const REQUEST_MS = Number(process.env.WEATHER_REQUEST_TIMEOUT_MS || 12000);

function buildForecastUrl(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'rain',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    hourly: ['temperature_2m', 'precipitation_probability', 'precipitation'].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'uv_index_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  });
  return `${OPEN_METEO_FORECAST}?${params.toString()}`;
}

function mapCurrent(payload) {
  const c = payload.current;
  if (!c) return null;
  return {
    time: c.time,
    temperatureC: c.temperature_2m,
    apparentTemperatureC: c.apparent_temperature,
    relativeHumidity: c.relative_humidity_2m,
    precipitationMm: c.precipitation,
    rainMm: c.rain,
    weatherCode: c.weather_code,
    windSpeedKmh: c.wind_speed_10m,
    windDirectionDeg: c.wind_direction_10m,
  };
}

function mapDaily(payload) {
  const d = payload.daily;
  if (!d || !d.time) return [];
  return d.time.map((date, i) => ({
    date,
    weatherCode: d.weather_code?.[i],
    tempMaxC: d.temperature_2m_max?.[i],
    tempMinC: d.temperature_2m_min?.[i],
    precipitationSumMm: d.precipitation_sum?.[i],
    uvIndexMax: d.uv_index_max?.[i],
  }));
}

function mapHourly(payload) {
  const h = payload.hourly;
  if (!h || !h.time) return [];
  return h.time.map((time, i) => ({
    time,
    temperatureC: h.temperature_2m?.[i],
    precipitationProbability: h.precipitation_probability?.[i],
    precipitationMm: h.precipitation?.[i],
  }));
}

/**
 * Fetches 7-day forecast + current conditions from Open-Meteo (no API key).
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>}
 */
async function fetchForecast(latitude, longitude) {
  const url = buildForecastUrl(latitude, longitude);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_MS);

  let response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      const error = new Error('Weather request timed out');
      error.statusCode = 504;
      throw error;
    }
    const error = new Error('Unable to reach weather service');
    error.statusCode = 502;
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const error = new Error(`Weather service returned ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  const payload = await response.json();

  return {
    source: 'open-meteo',
    latitude: payload.latitude,
    longitude: payload.longitude,
    elevationM: payload.elevation,
    timezone: payload.timezone,
    current: mapCurrent(payload),
    daily: mapDaily(payload),
    hourly: mapHourly(payload),
  };
}

module.exports = { fetchForecast };
