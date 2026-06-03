const fs = require('fs/promises');
const path = require('path');

const SETTINGS_PATH = path.join(__dirname, '..', 'config', 'admin.settings.json');

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  allowTraderSelfRegistration: true,
  emailNotificationsEnabled: true,
  aiForecastEnabled: true,
  maxProductsPerFarmer: 100,
  defaultMarketRegion: 'Oromia',
  updatedAt: null,
};

async function ensureSettingsFile() {
  try {
    await fs.access(SETTINGS_PATH);
  } catch {
    const initial = {
      ...DEFAULT_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(initial, null, 2), 'utf8');
  }
}

async function getSettings() {
  await ensureSettingsFile();
  const raw = await fs.readFile(SETTINGS_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
  };
}

function sanitizeUpdates(payload = {}) {
  const updates = {};
  if (typeof payload.maintenanceMode === 'boolean') {
    updates.maintenanceMode = payload.maintenanceMode;
  }
  if (typeof payload.allowTraderSelfRegistration === 'boolean') {
    updates.allowTraderSelfRegistration = payload.allowTraderSelfRegistration;
  }
  if (typeof payload.emailNotificationsEnabled === 'boolean') {
    updates.emailNotificationsEnabled = payload.emailNotificationsEnabled;
  }
  if (typeof payload.aiForecastEnabled === 'boolean') {
    updates.aiForecastEnabled = payload.aiForecastEnabled;
  }
  if (
    payload.maxProductsPerFarmer !== undefined &&
    Number.isInteger(Number(payload.maxProductsPerFarmer)) &&
    Number(payload.maxProductsPerFarmer) > 0
  ) {
    updates.maxProductsPerFarmer = Number(payload.maxProductsPerFarmer);
  }
  if (typeof payload.defaultMarketRegion === 'string' && payload.defaultMarketRegion.trim()) {
    updates.defaultMarketRegion = payload.defaultMarketRegion.trim();
  }
  return updates;
}

async function updateSettings(payload = {}) {
  const current = await getSettings();
  const updates = sanitizeUpdates(payload);
  const next = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

module.exports = {
  getSettings,
  updateSettings,
};
