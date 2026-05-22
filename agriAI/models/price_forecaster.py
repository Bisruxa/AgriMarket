from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd


GROUP_COLUMNS = ["crop_name", "region"]


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


def load_price_data(csv_path: str | Path) -> pd.DataFrame:
    data = pd.read_csv(csv_path)
    data["Date"] = pd.to_datetime(data[["year", "month"]].assign(day=1))
    data = data.sort_values(GROUP_COLUMNS + ["Date"]).reset_index(drop=True)
    return data


def build_feature_frame(price_data: pd.DataFrame, forecast_horizon: int = 1) -> pd.DataFrame:
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

    feature_columns = [column for column in encoded_frame.columns if column not in {"Date", "target_price"}]
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


def regression_metrics(actual: np.ndarray, predicted: np.ndarray) -> dict[str, float]:
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
