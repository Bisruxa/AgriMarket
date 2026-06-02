#!/usr/bin/env python3
"""
sync_prices.py - Sync crop prices from CSV + forecaster into PostgreSQL.

Usage:
    python sync_prices.py                  # sync all missing months (CSV + forecast)
    python sync_prices.py --csv-only      # sync only from CSV (no forecaster)
    python sync_prices.py --dry-run        # show what would be done without writing

Logic:
    - Reads the CSV once, computes avg price per (crop, region, year, month).
    - Compares against existing DB records (single query).
    - Upserts all missing CSV records.
    - For months beyond CSV range (up to last month), uses forecaster.
    - Append-only: existing DB records are never touched.
"""

from __future__ import annotations

import argparse
import csv
import os
import sys
import uuid
from datetime import date
from pathlib import Path
from typing import Dict, List, Set, Tuple

from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values

SCRIPT_DIR = Path(__file__).parent.resolve()
AGRI_ROOT = SCRIPT_DIR.parent.parent

sys.path.insert(0, str(AGRI_ROOT))
os.chdir(AGRI_ROOT)

SERVER_ENV = AGRI_ROOT.parent / "server" / ".env"
if not SERVER_ENV.exists():
    SERVER_ENV = AGRI_ROOT / ".env"
load_dotenv(SERVER_ENV)

CSV_PATH = AGRI_ROOT / "data" / "processed" / "crop_price_history_v2.csv"
BATCH_SIZE = 1000

TODAY = date.today()
CUTOFF_YEAR = TODAY.year
CUTOFF_MONTH = TODAY.month - 1 if TODAY.month > 1 else 12
if CUTOFF_MONTH == 12:
    CUTOFF_YEAR = TODAY.year - 1


def _parse_db_url(url: str):
    import re
    base = url.split("?")[0]
    m = re.match(
        r"postgresql://(?:([^:]+)(?::([^@]+))?@)?([^:/]+)(?::(\d+))?/(.+)",
        base,
    )
    if not m:
        return None
    user, password, host, port, db = m.groups()
    return {
        "host": host or "localhost",
        "port": port or "5432",
        "user": user or "",
        "password": password or "",
        "dbname": db,
    }


def get_connection():
    url = os.getenv("DATABASE_URL", "")
    if "schema=" in url:
        parsed = _parse_db_url(url)
        if parsed:
            return psycopg2.connect(**parsed)
        url = url.split("?")[0]
    return psycopg2.connect(url)


def ensure_table(cur):
    cur.execute("DROP TABLE IF EXISTS prices CASCADE;")
    cur.execute("""
        CREATE TABLE prices (
            id          TEXT PRIMARY KEY,
            "cropName"  TEXT NOT NULL,
            "region"    TEXT NOT NULL,
            "year"      INTEGER NOT NULL,
            "month"     INTEGER NOT NULL,
            "avgPrice"  DOUBLE PRECISION NOT NULL,
            "minPrice"  DOUBLE PRECISION,
            "maxPrice"  DOUBLE PRECISION,
            "source"    TEXT DEFAULT 'csv',
            "createdAt" TIMESTAMPTZ DEFAULT NOW(),
            "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT prices_unique UNIQUE ("cropName", "region", "year", "month")
        );
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_prices_crop ON prices(\"cropName\");")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_prices_region ON prices(\"region\");")
    print("Table 'prices' recreated.")


def get_existing_keys(cur) -> Set[Tuple]:
    cur.execute('SELECT "cropName", "region", "year", "month" FROM prices')
    return {tuple(r) for r in cur.fetchall()}


def read_csv_aggregated() -> Tuple[
    Dict[Tuple[str, str], Dict[Tuple[int, int], Tuple[float, float, float]]],
    Set[Tuple[str, str]],
    List[Tuple[int, int]],
]:
    agg: Dict[Tuple[str, str], Dict[Tuple[int, int], List[float]]] = {}
    all_pairs: Set[Tuple[str, str]] = set()
    all_periods: Set[Tuple[int, int]] = set()

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                year = int(row["year"].strip())
                month = int(row["month"].strip())
                crop = row["crop_name"].strip()
                region = row["region"].strip()
                price = float(row["price_per_kg"].strip())
                key = (crop, region)
                period = (year, month)
                if key not in agg:
                    agg[key] = {}
                if period not in agg[key]:
                    agg[key][period] = []
                agg[key][period].append(price)
                all_pairs.add(key)
                all_periods.add(period)
            except (ValueError, KeyError):
                continue

    stats_data: Dict[Tuple[str, str], Dict[Tuple[int, int], Tuple[float, float, float]]] = {}
    for key, periods in agg.items():
        stats_data[key] = {}
        for p, v in periods.items():
            stats_data[key][p] = (min(v), sum(v) / len(v), max(v))

    sorted_periods = sorted(all_periods)
    return stats_data, all_pairs, sorted_periods


def build_all_periods_for_pairs(
    pairs: Set[Tuple[str, str]],
    existing_keys: Set[Tuple],
    csv_periods: List[Tuple[int, int]],
) -> List[Tuple[Tuple[str, str], Tuple[int, int]]]:
    """Build list of (crop_region, period) missing from DB up to cutoff."""
    result = []
    for pair in pairs:
        for period in csv_periods:
            key = (*pair, *period)
            if key not in existing_keys:
                if period[0] < CUTOFF_YEAR or (period[0] == CUTOFF_YEAR and period[1] <= CUTOFF_MONTH):
                    result.append((pair, period))
    return result


def build_future_periods(
    pairs: Set[Tuple[str, str]],
    existing_keys: Set[Tuple],
    csv_max_period: Tuple[int, int],
) -> List[Tuple[Tuple[str, str], Tuple[int, int]]]:
    """Build list of future periods beyond CSV range up to cutoff."""
    result = []
    year, month = csv_max_period
    target_year, target_month = CUTOFF_YEAR, CUTOFF_MONTH

    while (year, month) < (target_year, target_month):
        month += 1
        if month > 12:
            month = 1
            year += 1
        key = (year, month)
        for pair in pairs:
            db_key = (*pair, year, month)
            if db_key not in existing_keys:
                result.append((pair, (year, month)))
    return result


def upsert_prices(cur, records: List[Tuple], conn) -> int:
    if not records:
        return 0
    records_with_id = []
    for r in records:
        min_p, avg_p, max_p, src = r[4], r[5], r[6], r[7]
        records_with_id.append((str(uuid.uuid4()), r[0], r[1], r[2], r[3], avg_p, min_p, max_p, src))
    execute_values(
        cur,
        """
        INSERT INTO prices (id, "cropName", "region", "year", "month", "avgPrice", "minPrice", "maxPrice", "source")
        VALUES %s
        ON CONFLICT ("cropName", "region", "year", "month")
        DO UPDATE SET
            "avgPrice" = EXCLUDED."avgPrice",
            "minPrice" = EXCLUDED."minPrice",
            "maxPrice" = EXCLUDED."maxPrice",
            "source" = EXCLUDED."source",
            "updatedAt" = NOW()
        """,
        records_with_id,
    )
    conn.commit()
    return len(records)


def main():
    print(f"Starting price sync (cutoff: {CUTOFF_YEAR}-{CUTOFF_MONTH:02d})")
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv-only", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    url = os.getenv("DATABASE_URL")
    if not url:
        print("ERROR: DATABASE_URL not set")
        sys.exit(1)

    conn = get_connection()
    cur = conn.cursor()
    ensure_table(cur)

    existing = get_existing_keys(cur)
    print(f"Existing DB records: {len(existing)}")

    if not CSV_PATH.exists():
        print(f"ERROR: CSV not found at {CSV_PATH}")
        sys.exit(1)

    print("Reading CSV ...")
    csv_avg, all_pairs, csv_periods = read_csv_aggregated()
    csv_max_period = csv_periods[-1] if csv_periods else (2015, 1)
    print(f"CSV: {len(all_pairs)} crop-region pairs, {len(csv_periods)} periods, ends at {csv_max_period}")

    to_insert: List[Tuple] = []

    for pair, period in build_all_periods_for_pairs(all_pairs, existing, csv_periods):
        crop, region = pair
        year, month = period
        if pair in csv_avg and period in csv_avg[pair]:
            min_p, avg_p, max_p = csv_avg[pair][period]
            to_insert.append((crop, region, year, month, min_p, avg_p, max_p, "csv"))

    print(f"CSV records to upsert: {len(to_insert)}")
    if args.dry_run:
        print(f"  [dry-run] Would upsert {len(to_insert)} CSV records")
    elif to_insert:
        for i in range(0, len(to_insert), BATCH_SIZE):
            batch = to_insert[i:i + BATCH_SIZE]
            cnt = upsert_prices(cur, batch, conn)
            print(f"  Upserted batch {i // BATCH_SIZE + 1} ({cnt} records)")

    if args.csv_only:
        print("Done (--csv-only).")
        cur.close()
        conn.close()
        return

    forecast_pairs = set()
    for pair, period in build_future_periods(all_pairs, existing, csv_max_period):
        forecast_pairs.add(pair)
    forecast_pairs = sorted(forecast_pairs)

    if forecast_pairs:
        print(f"Forecasting missing periods for {len(forecast_pairs)} crop-region pairs ...")
        from api.services.service_factory import service_factory

        forecaster = service_factory.get_price_forecaster()

        future_periods: List[Tuple[int, int]] = []
        year, month = csv_max_period
        while (year, month) < (CUTOFF_YEAR, CUTOFF_MONTH):
            month += 1
            if month > 12:
                month = 1
                year += 1
            future_periods.append((year, month))

        print(f"  Future periods to fill: {len(future_periods)} months")
        total_forecasts = len(forecast_pairs) * len(future_periods)
        print(f"  Total forecasts needed: {total_forecasts}")

        fc_records: List[Tuple] = []
        done = 0
        for pair in forecast_pairs:
            crop, region = pair
            for period in future_periods:
                year, month = period
                try:
                    res = forecaster.predict({
                        "crop_name": crop,
                        "region": region,
                        "year": year,
                        "month": month,
                    })
                    avg_p = res.predicted_price
                    ci_lo, ci_hi = res.confidence_interval
                    fc_records.append((crop, region, year, month, ci_lo, avg_p, ci_hi, "forecast"))
                except Exception as e:
                    print(f"  [skip] {crop}/{region} {year}-{month:02d}: {e}")

                done += 1
                if done % 500 == 0:
                    print(f"  Progress: {done}/{total_forecasts} forecasts ({done*100//total_forecasts}%)")

        print(f"Forecasting done. {len(fc_records)} records to upsert.")
        if args.dry_run:
            print(f"  [dry-run] Would upsert {len(fc_records)} forecasted records")
        elif fc_records:
            for i in range(0, len(fc_records), BATCH_SIZE):
                batch = fc_records[i:i + BATCH_SIZE]
                cnt = upsert_prices(cur, batch, conn)
                print(f"  Upserted batch {i // BATCH_SIZE + 1} ({cnt} records)")
    else:
        print("No future periods to forecast.")

    cur.close()
    conn.close()
    print("Sync complete!")


if __name__ == "__main__":
    main()