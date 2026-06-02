const DEFAULT_BASE_URL = 'http://localhost:8000';
const REQUEST_TIMEOUT_MS = Number(process.env.AGRIAI_TIMEOUT_MS || 12000);
const CHAT_TIMEOUT_MS = Number(process.env.AGRIAI_CHAT_TIMEOUT_MS || 60000);

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

    const networkError = new Error('Unable to reach AgriAI service');
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

async function predictPrice(payload) {
  return requestAgriAI('/predict/price', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function getPriceForecasterMetadata() {
  return requestAgriAI('/price-forecaster/metadata', { method: 'GET' });
}

async function getToolDefinitions() {
  const data = await requestAgriAI('/tools/definitions', { method: 'GET' });
  return data;
}

async function executeToolFunction(name, args) {
  const data = await requestAgriAI('/tools/execute', {
    method: 'POST',
    body: JSON.stringify({ name, args }),
  });
  return data;
}

async function sendChatMessage(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

  const url = `${getBaseUrl()}/chat`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
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
          ? `Chat request failed (${response.status}): ${detail}`
          : `Chat request failed (${response.status})`
      );
      err.statusCode = response.status >= 500 ? 502 : response.status;
      throw err;
    }

    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Chat request timed out');
      timeoutError.statusCode = 504;
      throw timeoutError;
    }
    if (error.statusCode) throw error;
    const networkError = new Error('Unable to reach AI chat service');
    networkError.statusCode = 502;
    throw networkError;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  getHealth,
  recommendCrop,
  predictPrice,
  getPriceForecasterMetadata,
  sendChatMessage,
  getToolDefinitions,
  executeToolFunction,
};
