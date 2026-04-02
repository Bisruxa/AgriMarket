from __future__ import annotations

import json
import os
from datetime import date
from pathlib import Path
from typing import Any, Dict, Optional

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
    """
    A service for forecasting crop prices.
    It uses an XGBoost model to make predictions.
    """

    def __init__(self, model_path: str, metadata_path: str, data_path: str) -> None:
        self.model_path = Path(model_path)
        self.metadata_path = Path(metadata_path)
        self.data_path = Path(data_path)
        self._load_metadata()
        self._load_data()
        super().__init__(self.model_path) # Pass the Path object, not the string

    def _load_model(self) -> xgb.Booster:
        """Loads the XGBoost model from the specified path."""
        model = xgb.Booster()
        model.load_model(self.model_path)
        return model

    def _load_metadata(self) -> None:
        """Loads the model metadata from the specified path."""
        with open(self.metadata_path) as f:
            self.metadata = json.load(f)

    def _load_data(self) -> None:
        """Loads the price data from the specified path."""
        self.price_data = load_price_data(self.data_path)

    def predict(self, data: Dict[str, Any]) -> pd.DataFrame:
        """Makes a price prediction based on the input data."""
        crop = data["crop"]
        start_date = pd.to_datetime(data["start_date"])
        end_date = pd.to_datetime(data["end_date"])

        if crop not in self.metadata["crops"]:
            raise ValueError(f"Crop '{crop}' not supported.")

        features = build_feature_frame(
            self.price_data,
            target_crop=crop,
            start_date=start_date,
            end_date=end_date,
            lag_weeks=LAG_WEEKS,
            rolling_windows=ROLLING_WINDOWS,
        )

        if features.empty:
            return pd.DataFrame()

        feature_names = self.model.feature_names
        predictions = self.model.predict(xgb.DMatrix(features[feature_names]))

        result_df = features.copy()
        result_df["prediction"] = predictions
        return result_df[["prediction"]]

    def get_metadata(self) -> Dict[str, Any]:
        """Returns the model metadata."""
        return self.metadata
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

    def _load_metadata(self) -> None:
        if not self.metadata_path.exists():
            raise FileNotFoundError(f"Missing metadata file: {self.metadata_path}")

        self.metadata = json.loads(self.metadata_path.read_text(encoding="utf-8"))
        self.feature_columns = self.metadata.get("feature_columns", [])
        self.forecast_horizon_weeks = int(self.metadata.get("forecast_horizon_weeks", 1))
        self.feature_notes = self.metadata.get("feature_notes", [])
        self.model_version = self.metadata.get("model_version", "price_forecaster_xgboost")

        if not self.feature_columns:
            raise ValueError("No feature columns found in training metadata.")

    def _load_model(self) -> None:
        if not self.model_path.exists():
            raise FileNotFoundError(f"Missing model file: {self.model_path}")

        self.model = xgb.Booster()
        self.model.load_model(str(self.model_path))

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

    def _resolve_value(self, available: list[str], requested: str, label: str) -> str:
        for value in available:
            if value.lower() == requested.lower():
                return value
        raise ValueError(
            f"Unknown {label}: {requested}. Available: {', '.join(available)}"
        )

    def _select_feature_row(
        self,
        crop_name: str,
        region: str,
        as_of_date: Optional[date],
    ) -> pd.Series:
        frame = self.feature_frame
        subset = frame[
            (frame["Crop Name"] == crop_name) & (frame["Region"] == region)
        ]

        if as_of_date:
            as_of_timestamp = pd.Timestamp(as_of_date)
            subset = subset[subset["Date"] <= as_of_timestamp]

        subset = subset.dropna(subset=self.numeric_columns)

        if subset.empty:
            raise LookupError(
                "No historical data available for the requested crop and region."
            )

        return subset.sort_values("Date").iloc[-1]

    def _encode_features(self, row: pd.Series) -> pd.DataFrame:
        base = {
            "Date": row["Date"],
            "Crop Name": row["Crop Name"],
            "Region": row["Region"],
            "Season": row["Season"],
        }
        for column in self.numeric_columns:
            base[column] = row[column]

        model_frame = pd.DataFrame([base])
        encoded = pd.get_dummies(
            model_frame,
            columns=["Crop Name", "Region", "Season"],
            dtype=float,
        )

        for column in self.feature_columns:
            if column not in encoded.columns:
                encoded[column] = 0.0

        encoded = encoded[self.feature_columns].astype(float)
        return encoded

    def predict_price(
        self,
        crop_name: str,
        region: str,
        as_of_date: Optional[date] = None,
    ) -> dict:
        crop = self._resolve_value(self.available_crops, crop_name, "crop")
        region_value = self._resolve_value(self.available_regions, region, "region")

        row = self._select_feature_row(crop, region_value, as_of_date)
        features = self._encode_features(row)

        matrix = xgb.DMatrix(features, feature_names=self.feature_columns)
        prediction = float(self.model.predict(matrix)[0])

        as_of = pd.Timestamp(row["Date"]).date()
        forecast_date = (pd.Timestamp(row["Date"]) + pd.Timedelta(weeks=self.forecast_horizon_weeks)).date()

        return {
            "crop_name": crop,
            "region": region_value,
            "as_of_date": as_of,
            "forecast_date": forecast_date,
            "forecast_horizon_weeks": self.forecast_horizon_weeks,
            "predicted_price": prediction,
            "model_version": self.model_version,
        }
