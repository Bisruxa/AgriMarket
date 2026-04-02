from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict

import pandas as pd
import xgboost as xgb

from models.price_forecaster import (
    LAG_WEEKS,
    ROLLING_WINDOWS,
    build_feature_frame,
    load_price_data,
)

from .base_service import InferenceService


class PriceForecasterService(InferenceService):
    """Service for crop price forecasting using a trained XGBoost regressor."""

    def __init__(self, model_path: str | Path, metadata_path: str | Path, data_path: str | Path) -> None:
        self.metadata_path = Path(metadata_path)
        self.data_path = Path(data_path)
        super().__init__(Path(model_path))
        self._load_metadata()
        self._load_data()

    @classmethod
    def from_env(cls) -> "PriceForecasterService":
        root = Path(__file__).resolve().parents[2]
        model_dir = Path(
            os.getenv("AGRIAI_MODEL_DIR", str(root / "models" / "price_forecaster"))
        )
        data_path = Path(
            os.getenv(
                "AGRIAI_PRICE_DATA",
                str(root / "data" / "synthetic" / "crop_price_data.csv"),
            )
        )
        return cls(
            model_path=model_dir / "xgboost_price_forecaster.json",
            metadata_path=model_dir / "training_metadata.json",
            data_path=data_path,
        )

    def _load_model(self) -> xgb.Booster:
        model_path = Path(self.model_path)
        if not model_path.exists():
            raise FileNotFoundError(f"Missing model file: {model_path}")

        model = xgb.Booster()
        model.load_model(str(model_path))
        return model

    def _load_metadata(self) -> None:
        if not self.metadata_path.exists():
            raise FileNotFoundError(f"Missing metadata file: {self.metadata_path}")

        self.metadata = json.loads(self.metadata_path.read_text(encoding="utf-8"))
        self.feature_columns = self.metadata.get("feature_columns", [])
        self.forecast_horizon_weeks = int(self.metadata.get("forecast_horizon_weeks", 1))
        self.feature_notes = self.metadata.get("feature_notes", [])
        self.model_version = self.metadata.get("model_version", "price_forecaster_xgboost")
        self.supported_crops = self.metadata.get("crops", [])

        if not self.feature_columns:
            raise ValueError("No feature columns found in training metadata.")

    def _load_data(self) -> None:
        if not self.data_path.exists():
            raise FileNotFoundError(f"Missing price data file: {self.data_path}")

        self.price_data = load_price_data(self.data_path)
        self.available_crops = sorted(self.price_data["Crop Name"].unique().tolist())
        self.available_regions = sorted(self.price_data["Region"].unique().tolist())
        self.feature_frame = build_feature_frame(
            self.price_data,
            forecast_horizon=self.forecast_horizon_weeks,
        )
        self.numeric_columns = self._build_numeric_columns()

    def _build_numeric_columns(self) -> list[str]:
        return [
            "Year",
            "month",
            "quarter",
            "week_of_year",
            "week_sin",
            "week_cos",
            "time_index",
            *[f"price_lag_{lag}" for lag in LAG_WEEKS],
            *[f"price_roll_mean_{window}" for window in ROLLING_WINDOWS],
            *[f"price_roll_std_{window}" for window in ROLLING_WINDOWS],
            *[f"price_roll_min_{window}" for window in ROLLING_WINDOWS],
            *[f"price_roll_max_{window}" for window in ROLLING_WINDOWS],
        ]

    def _resolve_crop_name(self, requested: str) -> str:
        candidates = self.supported_crops or self.available_crops
        for value in candidates:
            if value.lower() == requested.lower():
                return value
        raise ValueError(
            f"Crop '{requested}' not supported. Supported crops are: {candidates}"
        )

    def _encode_features(self, rows: pd.DataFrame) -> pd.DataFrame:
        base_columns = ["Date", "Crop Name", "Region", "Season", *self.numeric_columns]
        model_frame = rows[base_columns].copy()
        encoded = pd.get_dummies(
            model_frame,
            columns=["Crop Name", "Region", "Season"],
            dtype=float,
        )

        for column in self.feature_columns:
            if column not in encoded.columns:
                encoded[column] = 0.0

        return encoded[self.feature_columns].astype(float)

    def predict(self, data: Dict[str, Any]) -> pd.DataFrame:
        """Predict prices for a crop across a target date range.

        Returns a DataFrame indexed by forecast date with a single
        `prediction` column.
        """
        crop_name = self._resolve_crop_name(str(data["crop"]))
        start_date = pd.to_datetime(data["start_date"])
        end_date = pd.to_datetime(data["end_date"])

        if start_date > end_date:
            raise ValueError("start_date must be less than or equal to end_date")

        rows = self.feature_frame[
            (self.feature_frame["Crop Name"] == crop_name)
            & (self.feature_frame["target_date"] >= start_date)
            & (self.feature_frame["target_date"] <= end_date)
        ].copy()

        rows = rows.dropna(subset=self.numeric_columns)
        if rows.empty:
            return pd.DataFrame(columns=["prediction"])

        encoded = self._encode_features(rows)
        matrix = xgb.DMatrix(encoded, feature_names=self.feature_columns)
        predictions = self.model.predict(matrix)

        result = pd.DataFrame(
            {
                "target_date": rows["target_date"].to_numpy(),
                "prediction": predictions,
            }
        )

        aggregated = (
            result.groupby("target_date", as_index=True)["prediction"]
            .mean()
            .to_frame()
            .sort_index()
        )
        aggregated.index = pd.to_datetime(aggregated.index)
        return aggregated

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "crops": self.supported_crops or self.available_crops,
            "forecast_horizon_weeks": self.forecast_horizon_weeks,
            "feature_notes": self.feature_notes,
            "model_version": self.model_version,
        }
