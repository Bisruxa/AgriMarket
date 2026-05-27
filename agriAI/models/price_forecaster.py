from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd


GROUP_COLUMNS = ["crop_name", "region"]

# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------


@dataclass
class DatasetBundle:
    train_x: pd.DataFrame
    train_y: pd.Series
    valid_x: pd.DataFrame
    valid_y: pd.Series
    valid_context: pd.DataFrame
    feature_columns: list[str]
    train_rows: int
    valid_rows: int
    feature_notes: list[str]


@dataclass
class ForecastResult:
    crop_name: str
    region: str
    year: int
    month: int
    predicted_price: float
    confidence_interval: tuple[float, float]
    trend: str  # "increasing" | "decreasing" | "stable"
    trend_percentage: float


# ---------------------------------------------------------------------------
# Data I/O
# ---------------------------------------------------------------------------


def load_price_data(csv_path: str | Path) -> pd.DataFrame:
    data = pd.read_csv(csv_path)
    data["Date"] = pd.to_datetime(data[["year", "month"]].assign(day=1))
    data = data.sort_values(GROUP_COLUMNS + ["Date"]).reset_index(drop=True)
    return data


# ---------------------------------------------------------------------------
# Feature engineering (training)
# ---------------------------------------------------------------------------


def build_feature_frame(
    price_data: pd.DataFrame, forecast_horizon: int = 1
) -> pd.DataFrame:
    frame = price_data.copy()
    grouped_prices = frame.groupby(GROUP_COLUMNS)

    frame["target_price"] = grouped_prices["price_per_kg"].shift(-forecast_horizon)
    frame["target_date"] = grouped_prices["Date"].shift(-forecast_horizon)
    return frame


def prepare_training_data(
    price_data: pd.DataFrame,
    train_end_date: str = "2023-12-31",
    forecast_horizon: int = 1,
) -> DatasetBundle:
    featured = build_feature_frame(price_data, forecast_horizon=forecast_horizon)
    featured = featured.dropna(subset=["target_price"]).copy()

    numeric_columns = [
        "year",
        "month",
        "inflation_index",
        "lag_1m",
        "lag_3m",
        "lag_6m",
        "lag_12m",
        "rolling_3m_avg",
    ]
    model_frame = featured[
        ["Date", "target_price", "crop_name", "region", *numeric_columns]
    ].dropna()
    context_frame = model_frame[["Date", "crop_name", "region"]].copy()
    encoded_frame = pd.get_dummies(
        model_frame,
        columns=["crop_name", "region"],
        dtype=float,
    )

    train_cutoff = pd.Timestamp(train_end_date)
    train_mask = encoded_frame["Date"] <= train_cutoff
    train_frame = encoded_frame.loc[train_mask].copy()
    valid_frame = encoded_frame.loc[~train_mask].copy()
    valid_context = context_frame.loc[~train_mask].reset_index(drop=True)

    if train_frame.empty or valid_frame.empty:
        raise ValueError(
            "Time-based split produced an empty train or validation set. "
            "Adjust the split date or forecast horizon."
        )

    feature_columns = [
        column
        for column in encoded_frame.columns
        if column not in {"Date", "target_price"}
    ]
    feature_notes = identify_feature_gaps(price_data)

    return DatasetBundle(
        train_x=train_frame[feature_columns],
        train_y=train_frame["target_price"],
        valid_x=valid_frame[feature_columns],
        valid_y=valid_frame["target_price"],
        valid_context=valid_context,
        feature_columns=feature_columns,
        train_rows=len(train_frame),
        valid_rows=len(valid_frame),
        feature_notes=feature_notes,
    )


# ---------------------------------------------------------------------------
# Inflation projection
# ---------------------------------------------------------------------------


def project_inflation_index(
    price_data: pd.DataFrame,
    target_year: int,
    target_month: int,
    lookback_years: int = 3,
) -> float:
    """Project the inflation index for a future date.

    Computes the average monthly inflation rate over the last *lookback_years*
    of available data and compounds it forward from the last known index value.
    """
    sorted_data = price_data.sort_values(["year", "month"])
    last_row = sorted_data.iloc[-1]
    last_index = float(last_row["inflation_index"])
    last_date = pd.Timestamp(
        year=int(last_row["year"]), month=int(last_row["month"]), day=1
    )
    target_date = pd.Timestamp(year=target_year, month=target_month, day=1)

    if target_date <= last_date:
        match = sorted_data[
            (sorted_data["year"] == target_year)
            & (sorted_data["month"] == target_month)
        ]
        if not match.empty:
            return float(match["inflation_index"].iloc[0])
        return last_index

    # Compute monthly rates from the lookback window
    lookback_start = last_date - pd.DateOffset(years=lookback_years)
    window = sorted_data[
        pd.to_datetime(sorted_data[["year", "month"]].assign(day=1))
        >= lookback_start
    ]
    if len(window) < 2:
        raise ValueError(
            "Not enough historical data to project inflation. "
            "Need at least 2 months in the lookback window."
        )

    indices = window["inflation_index"].values
    monthly_rates = (indices[1:] / indices[:-1]) - 1.0
    avg_monthly_rate = float(np.mean(monthly_rates))

    # Compound forward
    months_ahead = (target_date.year - last_date.year) * 12 + (
        target_date.month - last_date.month
    )
    projected = last_index * ((1 + avg_monthly_rate) ** months_ahead)
    return round(projected, 6)


# ---------------------------------------------------------------------------
# Null-lag fallback
# ---------------------------------------------------------------------------


def fill_null_lags(
    row: dict,
    crop_regional_averages: dict[tuple[str, str], float],
    crop_name: str,
    region: str,
) -> dict:
    """Fill missing lag features using a cascading fallback strategy.

    Fallback order for each lag:
        lag_12m → lag_6m → crop regional average
        lag_6m  → lag_3m → crop regional average
        lag_3m  → lag_1m → crop regional average

    rolling_3m_avg is recomputed from available lags when missing.
    """
    fallback_key = (crop_name, region)
    regional_avg = crop_regional_averages.get(fallback_key, 0.0)

    filled = dict(row)

    # Cascading fallback for each lag
    filled["lag_12m"] = (
        filled.get("lag_12m")
        or filled.get("lag_6m")
        or regional_avg
    )
    filled["lag_6m"] = (
        filled.get("lag_6m")
        or filled.get("lag_3m")
        or regional_avg
    )
    filled["lag_3m"] = (
        filled.get("lag_3m")
        or filled.get("lag_1m")
        or regional_avg
    )

    if not filled.get("lag_1m"):
        filled["lag_1m"] = regional_avg

    # Recompute rolling_3m_avg if missing
    if not filled.get("rolling_3m_avg"):
        lags = [filled.get("lag_1m", 0), filled.get("lag_2m", 0), filled.get("lag_3m", 0)]
        lags = [v for v in lags if v]
        filled["rolling_3m_avg"] = round(sum(lags) / len(lags), 2) if lags else regional_avg

    return filled


# ---------------------------------------------------------------------------
# Recursive feature building for future months
# ---------------------------------------------------------------------------


def build_recursive_features(
    crop_name: str,
    region: str,
    target_date: pd.Timestamp,
    historical_data: pd.DataFrame,
    predicted_prices: dict[pd.Timestamp, float],
    inflation_index_value: float,
    crop_regional_averages: dict[tuple[str, str], float],
) -> dict:
    """Build a feature row for a future target month using known history and
    previously predicted prices.

    Lags are drawn from historical data when available, otherwise from the
    *predicted_prices* cache (recursive forecasting). Missing lags are filled
    via ``fill_null_lags``.
    """
    crop_region_hist = historical_data[
        (historical_data["crop_name"] == crop_name)
        & (historical_data["region"] == region)
    ]

    def _get_lag(months_back: int) -> Optional[float]:
        lag_date = target_date - pd.DateOffset(months=months_back)
        # Prefer historical data
        match = crop_region_hist[
            (crop_region_hist["year"] == lag_date.year)
            & (crop_region_hist["month"] == lag_date.month)
        ]
        if not match.empty:
            val = match["price_per_kg"].iloc[0]
            if not pd.isna(val):
                return float(val)
        # Fall back to predicted prices
        return predicted_prices.get(lag_date)

    lag_1m = _get_lag(1)
    lag_3m = _get_lag(3)
    lag_6m = _get_lag(6)
    lag_12m = _get_lag(12)

    # Compute rolling_3m_avg from the last 3 months
    prev_1 = _get_lag(1)
    prev_2 = _get_lag(2)
    prev_3 = _get_lag(3)
    rolling_vals = [v for v in [prev_1, prev_2, prev_3] if v is not None]
    if rolling_vals:
        rolling_3m_avg = round(sum(rolling_vals) / len(rolling_vals), 2)
    else:
        rolling_3m_avg = None

    raw_row = {
        "year": target_date.year,
        "month": target_date.month,
        "inflation_index": inflation_index_value,
        "lag_1m": lag_1m,
        "lag_3m": lag_3m,
        "lag_6m": lag_6m,
        "lag_12m": lag_12m,
        "rolling_3m_avg": rolling_3m_avg,
    }

    return fill_null_lags(raw_row, crop_regional_averages, crop_name, region)


# ---------------------------------------------------------------------------
# Trend calculation
# ---------------------------------------------------------------------------


def calculate_trend(
    predicted_price: float,
    reference_price: float,
    threshold: float = 2.0,
) -> tuple[str, float]:
    """Compare predicted price to a reference (e.g. price 12 months ago).

    Returns ``(trend_label, trend_percentage)`` where *trend_label* is one of
    ``"increasing"``, ``"decreasing"``, or ``"stable"``.
    """
    if reference_price <= 0:
        return ("stable", 0.0)

    pct = ((predicted_price - reference_price) / reference_price) * 100
    if pct > threshold:
        return ("increasing", round(pct, 1))
    elif pct < -threshold:
        return ("decreasing", round(pct, 1))
    return ("stable", round(pct, 1))


# ---------------------------------------------------------------------------
# Metrics & metadata (unchanged training helpers)
# ---------------------------------------------------------------------------


def identify_feature_gaps(price_data: pd.DataFrame) -> list[str]:
    notes = [
        "The current dataset only contains historical prices, crop, region, season, and year.",
        "This is enough for a baseline forecaster, but it cannot explain shocks from weather, transport, or input-cost changes.",
    ]

    crop_count = price_data["crop_name"].nunique()
    region_count = price_data["region"].nunique()
    notes.append(
        f"The model learns {crop_count} crop patterns across {region_count} regions using lagged price history."
    )
    notes.append(
        "Accuracy should improve if weekly weather, market volume, and input-cost features are joined in by region and date."
    )
    return notes


def regression_metrics(
    actual: np.ndarray, predicted: np.ndarray
) -> dict[str, float]:
    errors = predicted - actual
    mae = float(np.mean(np.abs(errors)))
    rmse = float(np.sqrt(np.mean(np.square(errors))))
    denominator = np.where(actual == 0, np.nan, np.abs(actual))
    mape = float(np.nanmean(np.abs(errors) / denominator) * 100)
    return {"mae": mae, "rmse": rmse, "mape": mape}


def save_training_metadata(
    output_path: str | Path,
    metrics: dict[str, float],
    feature_columns: list[str],
    train_rows: int,
    valid_rows: int,
    feature_notes: list[str],
    train_end_date: str,
    forecast_horizon: int,
    crops: list[str],
) -> None:
    payload = {
        "metrics": metrics,
        "crops": crops,
        "feature_columns": feature_columns,
        "train_rows": train_rows,
        "valid_rows": valid_rows,
        "train_end_date": train_end_date,
        "forecast_horizon_months": forecast_horizon,
        "feature_notes": feature_notes,
    }
    Path(output_path).write_text(json.dumps(payload, indent=2), encoding="utf-8")