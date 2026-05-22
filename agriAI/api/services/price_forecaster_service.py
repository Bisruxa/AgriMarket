from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, Optional

import pandas as pd
import torch
import xgboost as xgb

from models.price_forecaster import (
    ForecastResult,
    build_feature_frame,
    build_recursive_features,
    calculate_trend,
    fill_null_lags,
    load_price_data,
    project_inflation_index,
)

from .base_service import InferenceService


class PriceForecasterService(InferenceService):
    """Crop price forecasting service with recursive future-month support.

    Predicts the price for a specific crop, region, year and month.  When the
    target month lies beyond the last known data point the service walks
    forward month-by-month, feeding each prediction back as ``lag_1m`` for the
    next step (recursive forecasting).

    Missing lag features are filled via cascading fallback:
    ``lag_12m → lag_6m → regional average`` (same pattern for shorter lags).

    Inflation for future dates is projected by compounding the average monthly
    rate observed over the last three years of data.
    """

    def __init__(
        self,
        model_path: str | Path,
        metadata_path: str | Path,
        data_path: str | Path,
    ) -> None:
        self.metadata_path = Path(metadata_path)
        self.data_path = Path(data_path)
        super().__init__(Path(model_path))
        self._load_metadata()
        self._load_data()

    # ------------------------------------------------------------------
    # Factory
    # ------------------------------------------------------------------

    @classmethod
    def from_env(cls) -> "PriceForecasterService":
        root = Path(__file__).resolve().parents[2]
        model_dir = Path(
            os.getenv("AGRIAI_MODEL_DIR", str(root / "models" / "price_forecaster"))
        )
        data_path = Path(
            os.getenv(
                "AGRIAI_PRICE_DATA",
                str(root / "data" / "processed" / "crop_price_history_v2.csv"),
            )
        )
        return cls(
            model_path=model_dir / "xgboost_price_forecaster.json",
            metadata_path=model_dir / "training_metadata.json",
            data_path=data_path,
        )

    # ------------------------------------------------------------------
    # Internal loaders
    # ------------------------------------------------------------------

    def _load_model(self) -> xgb.Booster:
        model_path = Path(self.model_path)
        if not model_path.exists():
            raise FileNotFoundError(f"Missing model file: {model_path}")

        model = xgb.Booster()
        model.load_model(str(model_path))

        device = "cuda" if torch.cuda.is_available() else "cpu"
        model.set_param({"device": device})

        return model

    def _load_metadata(self) -> None:
        if not self.metadata_path.exists():
            raise FileNotFoundError(f"Missing metadata file: {self.metadata_path}")

        self.metadata = json.loads(self.metadata_path.read_text(encoding="utf-8"))
        self.feature_columns = self.metadata.get("feature_columns", [])
        self.forecast_horizon_months = int(
            self.metadata.get("forecast_horizon_months", 1)
        )
        self.feature_notes = self.metadata.get("feature_notes", [])
        self.supported_crops = self.metadata.get("crops", [])

        metrics = self.metadata.get("metrics", {})
        self._rmse = float(metrics.get("rmse", 10.0))

        if not self.feature_columns:
            raise ValueError("No feature columns found in training metadata.")

    def _load_data(self) -> None:
        if not self.data_path.exists():
            raise FileNotFoundError(f"Missing price data file: {self.data_path}")

        self.price_data = load_price_data(self.data_path)
        self.available_crops = sorted(self.price_data["crop_name"].unique().tolist())
        self.available_regions = sorted(self.price_data["region"].unique().tolist())

        self.feature_frame = build_feature_frame(
            self.price_data,
            forecast_horizon=self.forecast_horizon_months,
        )

        self._crop_regional_averages = self._compute_crop_regional_averages()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _compute_crop_regional_averages(self) -> dict[tuple[str, str], float]:
        """Mean price per (crop, region) used as the ultimate null-lag fallback."""
        averages = (
            self.price_data.groupby(["crop_name", "region"])["price_per_kg"]
            .mean()
            .round(2)
        )
        return {key: float(val) for key, val in averages.items()}

    def _resolve_crop_name(self, requested: str) -> str:
        candidates = self.supported_crops or self.available_crops
        for value in candidates:
            if value.lower() == requested.lower():
                return value
        raise ValueError(
            f"Crop '{requested}' not supported. Supported crops are: {candidates}"
        )

    def _resolve_region(self, requested: str) -> str:
        candidates = self.available_regions
        for value in candidates:
            if value.lower() == requested.lower():
                return value
        raise ValueError(
            f"Region '{requested}' not recognised. Available regions are: {candidates}"
        )

    def _get_reference_price(
        self, crop_name: str, region: str, target_date: pd.Timestamp
    ) -> Optional[float]:
        """Return the price from 12 months ago (or nearest available) for trend calc."""
        ref_date = target_date - pd.DateOffset(months=12)
        hist = self.price_data[
            (self.price_data["crop_name"] == crop_name)
            & (self.price_data["region"] == region)
        ]

        # Try exact 12-month match
        match = hist[
            (hist["year"] == ref_date.year) & (hist["month"] == ref_date.month)
        ]
        if not match.empty:
            val = match["price_per_kg"].iloc[0]
            if not pd.isna(val):
                return float(val)

        # Walk backward up to 6 months
        for offset in range(13, 19):
            ref_date_alt = target_date - pd.DateOffset(months=offset)
            match = hist[
                (hist["year"] == ref_date_alt.year)
                & (hist["month"] == ref_date_alt.month)
            ]
            if not match.empty:
                val = match["price_per_kg"].iloc[0]
                if not pd.isna(val):
                    return float(val)

        return None

    def _encode_row(self, row: dict) -> pd.DataFrame:
        """One-hot encode a single feature dict so it matches the trained model."""
        base = {
            "year": row["year"],
            "month": row["month"],
            "inflation_index": row["inflation_index"],
            "lag_1m": row["lag_1m"],
            "lag_3m": row["lag_3m"],
            "lag_6m": row["lag_6m"],
            "lag_12m": row["lag_12m"],
            "rolling_3m_avg": row["rolling_3m_avg"],
        }
        df = pd.DataFrame([base])
        # One-hot encode as the training pipeline did
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0.0
        return df[self.feature_columns].astype(float)

    def _predict_single(self, features: dict) -> float:
        """Run the model on a single row dict and return the predicted price."""
        encoded = self._encode_row(features)
        matrix = xgb.DMatrix(encoded, feature_names=self.feature_columns)
        return float(self.model.predict(matrix)[0])

    def _last_complete_row(
        self, crop_name: str, region: str
    ) -> tuple[pd.Series, pd.Timestamp]:
        """Return the most-recent historical row that has all lags populated."""
        hist = self.price_data[
            (self.price_data["crop_name"] == crop_name)
            & (self.price_data["region"] == region)
        ].sort_values(["year", "month"])

        lag_cols = ["lag_1m", "lag_3m", "lag_6m", "lag_12m", "rolling_3m_avg"]
        complete = hist.dropna(subset=lag_cols)
        if complete.empty:
            raise ValueError(
                f"No complete historical row for {crop_name} / {region}. "
                "Cannot initialise recursive forecasting."
            )
        last = complete.iloc[-1]
        last_date = pd.Timestamp(
            year=int(last["year"]), month=int(last["month"]), day=1
        )
        return last, last_date

    # ------------------------------------------------------------------
    # Recursive forecast
    # ------------------------------------------------------------------

    def _recursive_forecast(
        self,
        crop_name: str,
        region: str,
        start_row: pd.Series,
        start_date: pd.Timestamp,
        target_date: pd.Timestamp,
    ) -> tuple[pd.Timestamp, float]:
        """Walk forward month-by-month from *start_date* to *target_date*,
        feeding predictions back as lags.

        Returns the last ``(date, price)`` pair reached — normally the target
        month.
        """
        predicted_prices: dict[pd.Timestamp, float] = {}
        current_date = start_date
        current_price = float(start_row["price_per_kg"])

        while current_date < target_date:
            current_date += pd.DateOffset(months=1)

            inflation_idx = project_inflation_index(
                self.price_data,
                target_year=current_date.year,
                target_month=current_date.month,
            )

            features = build_recursive_features(
                crop_name=crop_name,
                region=region,
                target_date=current_date,
                historical_data=self.price_data,
                predicted_prices=predicted_prices,
                inflation_index_value=inflation_idx,
                crop_regional_averages=self._crop_regional_averages,
            )

            current_price = self._predict_single(features)
            predicted_prices[current_date] = current_price

        return current_date, current_price

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(self, data: Dict[str, Any]) -> ForecastResult:
        """Forecast the price for a single crop × region × month.

        Parameters
        ----------
        data : dict
            Keys: ``crop_name``, ``region``, ``year``, ``month``.
            Example: ``{"crop_name": "Teff (white)", "region": "Oromia",
            "year": 2026, "month": 10}``.

        Returns
        -------
        ForecastResult
        """
        crop_name = self._resolve_crop_name(str(data["crop_name"]))
        region = self._resolve_region(str(data["region"]))
        year = int(data["year"])
        month = int(data["month"])

        if month < 1 or month > 12:
            raise ValueError("month must be between 1 and 12.")

        target_date = pd.Timestamp(year=year, month=month, day=1)
        last_complete_row, last_complete_date = self._last_complete_row(
            crop_name, region
        )

        # --- Predict (historical or recursive) --------------------------
        if target_date <= last_complete_date:
            # Target lies within (or before) our historical window
            match = self.feature_frame[
                (self.feature_frame["crop_name"] == crop_name)
                & (self.feature_frame["region"] == region)
                & (self.feature_frame["target_date"] == target_date)
            ]
            if match.empty:
                raise ValueError(
                    f"No feature row found for {crop_name} / {region} "
                    f"at {target_date.date().isoformat()}."
                )

            row = match.iloc[0]
            raw_lags = {
                "year": int(row["year"]),
                "month": int(row["month"]),
                "inflation_index": float(row["inflation_index"]),
                "lag_1m": (
                    float(row["lag_1m"]) if not pd.isna(row["lag_1m"]) else None
                ),
                "lag_3m": (
                    float(row["lag_3m"]) if not pd.isna(row["lag_3m"]) else None
                ),
                "lag_6m": (
                    float(row["lag_6m"]) if not pd.isna(row["lag_6m"]) else None
                ),
                "lag_12m": (
                    float(row["lag_12m"]) if not pd.isna(row["lag_12m"]) else None
                ),
                "rolling_3m_avg": (
                    float(row["rolling_3m_avg"])
                    if not pd.isna(row["rolling_3m_avg"])
                    else None
                ),
            }
            filled = fill_null_lags(
                raw_lags, self._crop_regional_averages, crop_name, region
            )
            predicted_price = self._predict_single(filled)
        else:
            # Future target — recursive walk
            _, predicted_price = self._recursive_forecast(
                crop_name=crop_name,
                region=region,
                start_row=last_complete_row,
                start_date=last_complete_date,
                target_date=target_date,
            )

        predicted_price = round(predicted_price, 2)

        # --- Confidence interval (± 2 × RMSE) --------------------------
        z = 2.0
        margin = z * self._rmse
        ci_lower = round(predicted_price - margin, 2)
        ci_upper = round(predicted_price + margin, 2)

        # --- Trend -----------------------------------------------------
        ref_price = self._get_reference_price(crop_name, region, target_date)
        if ref_price is None:
            # Fall back to the price 1 month before the last complete row
            ref_price = float(last_complete_row["price_per_kg"])

        trend_label, trend_pct = calculate_trend(predicted_price, ref_price)

        return ForecastResult(
            crop_name=crop_name,
            region=region,
            year=year,
            month=month,
            predicted_price=predicted_price,
            confidence_interval=(ci_lower, ci_upper),
            trend=trend_label,
            trend_percentage=trend_pct,
        )

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "crops": self.supported_crops or self.available_crops,
            "regions": self.available_regions,
            "forecast_horizon_months": self.forecast_horizon_months,
            "feature_notes": self.feature_notes,
            "validation_rmse": self._rmse,
        }