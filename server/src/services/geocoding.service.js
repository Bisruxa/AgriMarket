const REGION_COORDS = {
  addis_ababa: { lat: 9.03, lon: 38.74 },
  afar: { lat: 11.82, lon: 41.50 },
  amhara: { lat: 11.66, lon: 37.98 },
  benishangul_gumuz: { lat: 10.50, lon: 36.00 },
  dire_dawa: { lat: 9.60, lon: 41.87 },
  gambela: { lat: 7.87, lon: 34.50 },
  harari: { lat: 9.31, lon: 42.13 },
  oromia: { lat: 7.99, lon: 39.00 },
  sidama: { lat: 6.76, lon: 38.41 },
  somali: { lat: 7.50, lon: 44.00 },
  south_ethiopia: { lat: 6.50, lon: 37.50 },
  south_west: { lat: 7.00, lon: 36.00 },
  tigray: { lat: 13.50, lon: 39.00 },
};

function getCoordsForRegion(region) {
  if (!region) return null;
  const key = region.toLowerCase().replace(/\s+/g, '_').replace(/'/g, '');
  const entry = REGION_COORDS[key];
  if (entry) return entry;
  for (const [k, v] of Object.entries(REGION_COORDS)) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return null;
}

module.exports = { getCoordsForRegion };
