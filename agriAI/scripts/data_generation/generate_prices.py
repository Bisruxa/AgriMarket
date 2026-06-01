"""
AgriMarket – Ethiopian Crop Price Dataset Generator  v2
========================================================
A rewrite of v1 with a disciplined feature set.

FEATURES KEPT  (10, all available at prediction time, no redundancy):
  crop_name            categorical — core identity
  region               categorical — geography / transport / supply zone
  year                 int         — long-run inflation trend
  month                int         — encodes all seasonality (replaces 3 cols)
  lag_1m               float       — last month's price; strongest predictor
  lag_3m               float       — short-term price direction
  lag_6m               float       — medium-term supply cycle
  lag_12m              float       — same month last year; seasonality proxy
  rolling_3m_avg       float       — smoothed recent trend; noise-resistant
  inflation_index      float       — macro context from real World Bank data

TARGET:
  price_per_kg         float — ETB per kilogram
  
"""

import os
import math
import random
import numpy as np
import pandas as pd
from dateutil.relativedelta import relativedelta
from datetime import date

# ── Reproducibility ──────────────────────────────────────────────────────────
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, '..', '..', 'data', 'processed')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Real Ethiopia food-CPI annual rates ──────────────────────────────────────
# Source: World Bank, IMF, National Bank of Ethiopia
ANNUAL_FOOD_INFLATION: dict[int, float] = {
    2015: 0.101,
    2016: 0.073,
    2017: 0.099,
    2018: 0.138,
    2019: 0.158,
    2020: 0.204,
    2021: 0.268,
    2022: 0.339,
    2023: 0.302,
    2024: 0.150,
}

def _monthly_rates() -> dict[tuple, float]:
    out = {}
    for yr, ann in ANNUAL_FOOD_INFLATION.items():
        m = (1 + ann) ** (1 / 12) - 1
        for mo in range(1, 13):
            out[(yr, mo)] = m
    return out

_RATES = _monthly_rates()

def inflation_index(year: int, month: int) -> float:
    """
    Price index relative to Dec-2022 = 1.0.
    Walk month-by-month from the anchor using real CPI rates.
    """
    base = (2022, 12)
    target = (year, month)
    if target == base:
        return 1.0

    index = 1.0
    cur = list(base)

    def advance(y, m):
        m += 1
        if m == 13:
            m, y = 1, y + 1
        return y, m

    def retreat(y, m):
        m -= 1
        if m == 0:
            m, y = 12, y - 1
        return y, m

    if (year * 12 + month) < (2022 * 12 + 12):
        # Walk backward from Dec-2022
        while tuple(cur) != target:
            r = _RATES.get(tuple(cur), 0.012)
            index /= (1 + r)
            cur[0], cur[1] = retreat(cur[0], cur[1])
    else:
        # Walk forward from Dec-2022
        while tuple(cur) != target:
            cur[0], cur[1] = advance(cur[0], cur[1])
            r = _RATES.get(tuple(cur), 0.012)
            index *= (1 + r)

    return round(index, 6)

# ── Crops ─────────────────────────────────────────────────────────────────────
# base  = national retail average ETB/kg, Dec-2022 (CSA bulletin)
# vol   = annual price volatility (log-normal sigma)
CROPS: dict[str, dict] = {
    # Cereals
    'Teff (white)':         {'base': 55.63, 'cat': 'Cereal',    'vol': 0.08},
    'Teff (mixed)':         {'base': 52.20, 'cat': 'Cereal',    'vol': 0.08},
    'Teff (black)':         {'base': 51.51, 'cat': 'Cereal',    'vol': 0.08},
    'Wheat (white)':        {'base': 52.76, 'cat': 'Cereal',    'vol': 0.07},
    'Wheat (mixed)':        {'base': 43.62, 'cat': 'Cereal',    'vol': 0.07},
    'Barley (white)':       {'base': 53.80, 'cat': 'Cereal',    'vol': 0.07},
    'Barley (mixed)':       {'base': 46.05, 'cat': 'Cereal',    'vol': 0.07},
    'Maize':                {'base': 32.16, 'cat': 'Cereal',    'vol': 0.10},
    'Sorghum (yellow)':     {'base': 50.24, 'cat': 'Cereal',    'vol': 0.09},
    'Sorghum (white)':      {'base': 44.72, 'cat': 'Cereal',    'vol': 0.09},
    'Sorghum (red)':        {'base': 37.76, 'cat': 'Cereal',    'vol': 0.09},
    'Millet':               {'base': 41.22, 'cat': 'Cereal',    'vol': 0.10},
    'Rice':                 {'base': 69.04, 'cat': 'Cereal',    'vol': 0.06},
    # Pulses
    'Haricot Bean (white)': {'base': 50.74, 'cat': 'Pulse',     'vol': 0.11},
    'Haricot Bean (mixed)': {'base': 50.38, 'cat': 'Pulse',     'vol': 0.11},
    'Horse Bean':           {'base': 60.78, 'cat': 'Pulse',     'vol': 0.10},
    'Chickpea':             {'base': 59.21, 'cat': 'Pulse',     'vol': 0.10},
    'Field Pea':            {'base': 65.41, 'cat': 'Pulse',     'vol': 0.10},
    'Lentils':              {'base': 129.65,'cat': 'Pulse',     'vol': 0.09},
    'Soybean':              {'base': 66.03, 'cat': 'Pulse',     'vol': 0.10},
    # Oilseeds
    'Sesame (white)':       {'base': 128.05,'cat': 'Oilseed',   'vol': 0.14},
    'Sesame (red)':         {'base': 139.51,'cat': 'Oilseed',   'vol': 0.14},
    'Niger Seed':           {'base': 122.19,'cat': 'Oilseed',   'vol': 0.12},
    'Linseed':              {'base': 133.02,'cat': 'Oilseed',   'vol': 0.12},
    'Sunflower':            {'base': 107.62,'cat': 'Oilseed',   'vol': 0.12},
    'Rapeseed':             {'base': 107.91,'cat': 'Oilseed',   'vol': 0.12},
    # Cash crops
    'Coffee (whole)':       {'base': 169.20,'cat': 'Cash',      'vol': 0.18},
    'Coffee (beans)':       {'base': 388.77,'cat': 'Cash',      'vol': 0.20},
    'Chat':                 {'base': 304.84,'cat': 'Cash',      'vol': 0.22},
    # Vegetables
    'Potato':               {'base': 27.70, 'cat': 'Vegetable', 'vol': 0.18},
    'Sweet Potato':         {'base': 22.71, 'cat': 'Vegetable', 'vol': 0.18},
    'Onion':                {'base': 32.49, 'cat': 'Vegetable', 'vol': 0.22},
    'Tomato':               {'base': 34.86, 'cat': 'Vegetable', 'vol': 0.25},
    'Cabbage':              {'base': 25.55, 'cat': 'Vegetable', 'vol': 0.20},
    'Garlic':               {'base': 145.08,'cat': 'Vegetable', 'vol': 0.15},
}

# ── Regions ───────────────────────────────────────────────────────────────────
# Multipliers derived from CSA regional vs. national averages, Dec-2022.
REGIONS: dict[str, float] = {
    'Oromia':           0.95,
    'Amhara':           0.93,
    'SNNP':             0.97,
    'Tigray':           1.03,
    'Sidama':           0.96,
    'Somali':           1.22,
    'Benshangul-Gumuz': 1.04,
    'Afar':             1.11,
    'Gambella':         1.07,
    'Harari':           1.09,
    'Dire Dawa':        1.12,
    'Addis Ababa':      1.08,
}

# Per-crop regional deviations (additive on the base multiplier).
# Derived from real CSA data patterns.
CROP_REGION_DELTA: dict[str, dict[str, float]] = {
    'Coffee (whole)':       {'Oromia':-0.12,'SNNP':-0.14,'Sidama':-0.15,'Somali':0.10,'Amhara':0.05},
    'Coffee (beans)':       {'Oromia':-0.08,'SNNP':-0.10,'Sidama':-0.12,'Amhara':0.02},
    'Chat':                 {'Harari':-0.08,'Dire Dawa':-0.05,'Oromia':-0.15,'Amhara':0.15,'Somali':0.10},
    'Sesame (white)':       {'Amhara':-0.10,'Tigray':-0.08,'Benshangul-Gumuz':-0.05},
    'Sesame (red)':         {'Amhara':-0.07,'Tigray':-0.05},
    'Teff (white)':         {'Amhara':-0.06,'Oromia':-0.05},
    'Teff (mixed)':         {'Amhara':-0.06,'Oromia':-0.05},
    'Maize':                {'Oromia':-0.07,'Amhara':-0.05,'Gambella':-0.15,'Somali':0.10},
    'Wheat (white)':        {'Amhara':-0.08,'Oromia':-0.05,'Somali':0.10},
    'Haricot Bean (white)': {'SNNP':-0.10,'Oromia':-0.06,'Amhara':-0.10,'Somali':0.15},
    'Lentils':              {'Amhara':-0.08,'Tigray':-0.06},
    'Soybean':              {'Gambella':-0.08,'Benshangul-Gumuz':-0.05},
}

def region_mult(crop: str, region: str) -> float:
    base = REGIONS[region]
    delta = CROP_REGION_DELTA.get(crop, {}).get(region, 0.0)
    return max(0.50, base + delta)

# ── Seasonal price factors per crop category ──────────────────────────────────
# Cereals/pulses: cheap at harvest (Oct-Dec), expensive in lean (May-Jul).
# Vegetables: opposite — expensive in dry months.
# Cash crops: Coffee peaks Oct-Jan (post-harvest).
SEASONAL: dict[str, dict[int, float]] = {
    'Cereal':    {1:1.05,2:1.10,3:1.13,4:1.15,5:1.18,6:1.12,7:1.08,8:1.05,9:1.00,10:0.88,11:0.85,12:0.87},
    'Pulse':     {1:1.06,2:1.10,3:1.12,4:1.14,5:1.15,6:1.10,7:1.05,8:1.02,9:1.00,10:0.90,11:0.88,12:0.90},
    'Oilseed':   {1:1.05,2:1.08,3:1.10,4:1.12,5:1.12,6:1.08,7:1.05,8:1.02,9:1.00,10:0.92,11:0.90,12:0.92},
    'Cash':      {1:1.10,2:1.05,3:1.00,4:0.98,5:0.96,6:0.98,7:1.00,8:1.02,9:1.05,10:1.10,11:1.12,12:1.12},
    'Vegetable': {1:1.10,2:1.08,3:1.05,4:1.02,5:1.00,6:0.96,7:0.95,8:0.97,9:1.00,10:1.05,11:1.08,12:1.10},
}

# ── Shock multipliers (historical events) ─────────────────────────────────────
# Used ONLY during synthetic data generation — never as a model feature.
def _shock(year: int, month: int, cat: str, region: str) -> float:
    m = 1.0
    # El Niño drought 2015-2016
    if year == 2015 and month >= 9 and region in ('Somali','Afar','Oromia') and cat in ('Cereal','Pulse'):
        m *= 1.15
    if year == 2016 and month <= 6 and region in ('Somali','Afar','Oromia','SNNP') and cat in ('Cereal','Pulse'):
        m *= 1.18
    if year == 2016 and month >= 7 and cat in ('Cereal','Pulse'):
        m *= 1.08
    # 2017 good harvest
    if year == 2017 and 1 <= month <= 4 and cat == 'Cereal':
        m *= 0.95
    # COVID 2020
    if year == 2020 and month in (4,5,6,7):
        m *= 1.12
    if year == 2020 and month in (8,9):
        m *= 1.07
    # Tigray conflict 2020-2022
    if year == 2021 and region == 'Tigray':
        m *= 1.40
    elif year == 2021 and region == 'Amhara' and cat in ('Cereal','Pulse'):
        m *= 1.15
    if year == 2022 and month <= 10 and region == 'Tigray':
        m *= 1.35
    elif year == 2022 and month <= 10 and region == 'Amhara' and cat in ('Cereal','Pulse'):
        m *= 1.10
    # Russia-Ukraine 2022 — global wheat/fuel shock
    if year == 2022 and month >= 3 and cat == 'Cereal':
        m *= 1.08
    if year == 2022 and month >= 3 and cat == 'Oilseed':
        m *= 1.05
    # 2023 humanitarian (Somali/Afar drought)
    if year == 2023 and region in ('Somali','Afar') and cat in ('Cereal','Pulse'):
        m *= 1.10
    return m

# ── Generate one price value ───────────────────────────────────────────────────
def _price(year: int, month: int, crop: str, info: dict, region: str) -> float:
    ci  = inflation_index(year, month)
    sf  = SEASONAL[info['cat']][month]
    rf  = region_mult(crop, region)
    shk = _shock(year, month, info['cat'], region)

    deterministic = info['base'] * ci * sf * rf * shk

    # Log-normal noise (realistic market price distribution)
    sigma = info['vol'] * 0.30
    noise = np.random.lognormal(mean=0, sigma=sigma)
    noise /= math.exp(0.5 * sigma ** 2)   # centre around 1.0

    return max(0.5, round(deterministic * noise, 2))

# ── Build the full panel ───────────────────────────────────────────────────────
def generate(start_year: int = 2015, end_year: int = 2024) -> pd.DataFrame:
    records = []
    dt = date(start_year, 1, 1)
    end = date(end_year, 12, 31)
    total = (end_year - start_year + 1) * 12
    done = 0

    print(f"Generating {total} months × {len(CROPS)} crops × {len(REGIONS)} regions "
          f"= {total * len(CROPS) * len(REGIONS):,} rows …")

    while dt <= end:
        y, m = dt.year, dt.month
        ci = inflation_index(y, m)

        for crop, info in CROPS.items():
            for region in REGIONS:
                records.append({
                    'year':           y,
                    'month':          m,
                    'crop_name':      crop,
                    'region':         region,
                    'inflation_index': round(ci, 4),
                    'price_per_kg':   _price(y, m, crop, info, region),
                })

        done += 1
        if done % 24 == 0:
            print(f"  {done}/{total} months ({done/total*100:.0f}%)", flush=True)

        dt = (dt + relativedelta(months=1)).replace(day=1)

    return pd.DataFrame(records)


def add_lags(df: pd.DataFrame) -> pd.DataFrame:
    print("Computing lag features …")
    df = df.sort_values(['crop_name', 'region', 'year', 'month']).reset_index(drop=True)
    key = ['crop_name', 'region']

    df['lag_1m']         = df.groupby(key)['price_per_kg'].shift(1)
    df['lag_3m']         = df.groupby(key)['price_per_kg'].shift(3)
    df['lag_6m']         = df.groupby(key)['price_per_kg'].shift(6)
    df['lag_12m']        = df.groupby(key)['price_per_kg'].shift(12)
    df['rolling_3m_avg'] = (
        df.groupby(key)['price_per_kg']
          .transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean())
          .round(2)
    )
    return df


def validate(df: pd.DataFrame) -> None:
    checks = [
        # (year, month, crop, region, real_csa_price)
        (2022, 12, 'Teff (white)',   'Oromia',      53.19),
        (2022, 12, 'Teff (white)',   'Amhara',       52.09),
        (2022, 12, 'Maize',          'Oromia',       29.47),
        (2022, 12, 'Maize',          'Gambella',     23.81),
        (2022, 12, 'Wheat (white)',  'Somali',       60.74),
        (2022, 12, 'Sesame (white)', 'Amhara',      108.99),
        (2022, 12, 'Lentils',        'Somali',      150.81),
        (2023,  1, 'Teff (white)',   'Addis Ababa',  58.66),
        (2023,  1, 'Maize',          'Gambella',     23.90),
    ]
    print("\n── Validation vs. real CSA data ──")
    print(f"{'Crop':<25} {'Region':<18} {'Synth':>8} {'Real':>8} {'Err%':>7}")
    print("─" * 72)
    errs = []
    for yr, mo, crop, reg, real in checks:
        row = df[(df.year==yr)&(df.month==mo)&(df.crop_name==crop)&(df.region==reg)]
        if row.empty:
            print(f"  MISSING {crop} / {reg}")
            continue
        synth = row.price_per_kg.values[0]
        err   = (synth - real) / real * 100
        errs.append(abs(err))
        flag = '✓' if abs(err) < 20 else '⚠'
        print(f"{flag} {crop:<25} {reg:<18} {synth:>8.2f} {real:>8.2f} {err:>6.1f}%")
    if errs:
        print(f"\n  Mean absolute error: {sum(errs)/len(errs):.1f}%  "
              f"({'✅ acceptable' if sum(errs)/len(errs)<20 else '⚠ review overrides'})")


def main() -> None:
    print("=" * 60)
    print("  AgriMarket – Price Dataset Generator  v2")
    print("=" * 60)

    df = generate()
    df = add_lags(df)
    validate(df)

    out = os.path.join(OUTPUT_DIR, 'crop_price_history_v2.csv')
    df.to_csv(out, index=False)

    print(f"\n✅  {out}")
    print(f"   Rows    : {len(df):,}")
    print(f"   Columns : {list(df.columns)}")
    print(f"   Crops   : {df.crop_name.nunique()}")
    print(f"   Regions : {df.region.nunique()}")
    print(f"   Nulls   : lag_1m={df.lag_1m.isna().sum()}, "
          f"lag_12m={df.lag_12m.isna().sum()}  (expected: first year)")

    print("\n── Sample ──")
    print(
        df.dropna().sample(6, random_state=7)
          [['year','month','crop_name','region','inflation_index',
            'lag_1m','lag_3m','lag_12m','rolling_3m_avg','price_per_kg']]
          .to_string(index=False)
    )


if __name__ == '__main__':
    main()