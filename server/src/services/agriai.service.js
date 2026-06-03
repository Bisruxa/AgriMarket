const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';
const REQUEST_TIMEOUT_MS = Number(process.env.AGRIAI_TIMEOUT_MS || 12000);
const METADATA_CACHE_TTL_MS = 5 * 60 * 1000;
let metadataCache = null;
let metadataFetchedAt = 0;

function getBaseUrl() {
  return (process.env.AGRIAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

async function requestAgriAI(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const url = `${getBaseUrl()}${path}`;
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let detail = '';
      try {
        const errPayload = await response.json();
        detail = errPayload?.detail || errPayload?.message || '';
      } catch (parseErr) {
        detail = '';
      }

      const err = new Error(
        detail
          ? `AgriAI request failed (${response.status}): ${detail}`
          : `AgriAI request failed (${response.status})`
      );
      err.statusCode = response.status >= 500 ? 502 : response.status;
      throw err;
    }

    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('AgriAI request timed out');
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    if (error.statusCode) {
      throw error;
    }

    const hint = getBaseUrl();
    const networkError = new Error(
      `Unable to reach AgriAI at ${hint}. Start it from the agriAI folder: python -m uvicorn api.main:app --reload --port 8001`
    );
    networkError.statusCode = 502;
    throw networkError;
  } finally {
    clearTimeout(timeout);
  }
}

async function getHealth() {
  return requestAgriAI('/health', { method: 'GET' });
}

async function recommendCrop(payload) {
  return requestAgriAI('/recommend/crop', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function resolveSupportedValue(input, candidates) {
  const normalized = normalizeText(input);
  if (!normalized || !Array.isArray(candidates) || candidates.length === 0) {
    return input;
  }

  const exact = candidates.find((item) => normalizeText(item) === normalized);
  if (exact) return exact;

  const contains = candidates.find(
    (item) =>
      normalizeText(item).includes(normalized) ||
      normalized.includes(normalizeText(item))
  );
  return contains || input;
}

async function getCachedPriceMetadata() {
  const now = Date.now();
  if (metadataCache && now - metadataFetchedAt < METADATA_CACHE_TTL_MS) {
    return metadataCache;
  }

  try {
    const meta = await getPriceForecasterMetadata();
    metadataCache = meta;
    metadataFetchedAt = now;
    return meta;
  } catch {
    return metadataCache;
  }
}

async function predictPrice(payload) {
  let normalizedPayload = { ...payload };
  try {
    const metadata = await getCachedPriceMetadata();
    if (metadata?.crops?.length) {
      normalizedPayload.crop_name = resolveSupportedValue(
        payload.crop_name,
        metadata.crops
      );
    }
    if (metadata?.regions?.length) {
      normalizedPayload.region = resolveSupportedValue(
        payload.region,
        metadata.regions
      );
    }
  } catch {
    normalizedPayload = { ...payload };
  }

  return requestAgriAI('/predict/price', {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
  });
}

async function getPriceForecasterMetadata() {
  return requestAgriAI('/price-forecaster/metadata', { method: 'GET' });
}

module.exports = {
  getHealth,
  recommendCrop,
  predictPrice,
  getPriceForecasterMetadata,
};
