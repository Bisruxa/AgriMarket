"""LSTM inference service for crop price forecasting.

Same ``predict()`` contract as ``PriceForecasterService`` so it can be
swapped in transparently via the service factory.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd
import torch
from sklearn.preprocessing import StandardScaler

from models.price_forecaster_lstm import (
    ForecastResult,
    PriceForecasterLSTM,
    calculate_trend,
    load_lstm_model,
    predict_single,
)

from .base_service import InferenceService


class PriceForecasterLSTMService(InferenceService):
    """LSTM-based price forecaster.

    Loads a trained LSTM model + scalers and exposes the same
    ``predict(crop_name, region, year, month) → ForecastResult`` interface
    as the XGBoost service.
    """

    def __init__(
        self,
        model_path: str | Path,
        metadata_path: str | Path,
        data_path: str | Path,
    ) -> None:
        self.metadata_path = Path(metadata_path)
        self.data_path = Path(data_path)
        self._device = "cuda" if torch.cuda.is_available() else "cpu"
        super().__init__(Path(model_path))
        self._load_metadata()
        self._load_data()

    # ------------------------------------------------------------------
    # Factory
    # ------------------------------------------------------------------

    @classmethod
    def from_env(cls) -> "PriceForecasterLSTMService":
        root = Path(__file__).resolve().parents[2]
        model_dir = Path(
            os.getenv(
                "AGRIAI_LSTM_MODEL_DIR",
                str(root / "models" / "price_forecaster_lstm"),
            )
        )
        data_path = Path(
            os.getenv(
                "AGRIAI_PRICE_DATA",
                str(root / "data" / "processed" / "crop_price_history_v2.csv"),
            )
        )
        return cls(
            model_path=model_dir / "lstm_price_forecaster.pt",
            metadata_path=model_dir / "lstm_training_metadata.json",
            data_path=data_path,
        )

    # ------------------------------------------------------------------
    # Loaders
    # ------------------------------------------------------------------

    def _load_model(self):
        model, meta = load_lstm_model(
            Path(self.model_path).parent, device=self._device
        )
        # Store the full metadata loaded by load_lstm_model for later use
        self._lstm_meta = meta
        return model

    def _load_metadata(self) -> None:
        if not self.metadata_path.exists():
            raise FileNotFoundError(f"Missing metadata: {self.metadata_path}")

        self.metadata = self._lstm_meta if hasattr(self, "_lstm_meta") else {}

        self.supported_crops: list[str] = self.metadata.get("crops", [])
        self.supported_regions: list[str] = self.metadata.get("regions", [])
        self.crop_to_idx: dict[str, int] = self.metadata.get("crop_to_idx", {})
        self.region_to_idx: dict[str, int] = self.metadata.get("region_to_idx", {})
        self.seq_len: int = int(self.metadata.get("seq_len", 12))
        metrics = self.metadata.get("metrics", {})
        self._rmse: float = float(metrics.get("rmse", 10.0))

        # Restore scalers
        self.price_scaler = StandardScaler()
        self.price_scaler.mean_ = np.array(
            self.metadata.get("price_scaler_mean", [0.0])
        )
        self.price_scaler.scale_ = np.array(
            self.metadata.get("price_scaler_scale", [1.0])
        )

        self.inflation_scaler = StandardScaler()
        self.inflation_scaler.mean_ = np.array(
            self.metadata.get("inflation_scaler_mean", [0.0])
        )
        self.inflation_scaler.scale_ = np.array(
            self.metadata.get("inflation_scaler_scale", [1.0])
        )

    def _load_data(self) -> None:
        if not self.data_path.exists():
            raise FileNotFoundError(f"Missing price data: {self.data_path}")

        self.price_data = pd.read_csv(self.data_path)
        self.price_data = self.price_data.sort_values(
            ["crop_name", "region", "year", "month"]
        ).reset_index(drop=True)

        self._crop_regional_averages = (
            self.price_data.groupby(["crop_name", "region"])["price_per_kg"]
            .mean()
            .round(2)
            .to_dict()
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _resolve_crop(self, name: str) -> str:
        candidates = self.supported_crops
        for c in candidates:
            if c.lower() == name.lower():
                return c
        raise ValueError(f"Crop '{name}' not supported. Choices: {candidates}")

    def _resolve_region(self, name: str) -> str:
        candidates = self.supported_regions
        for r in candidates:
            if r.lower() == name.lower():
                return r
        raise ValueError(f"Region '{name}' not recognised. Choices: {candidates}")

    def _hist(self, crop_name: str, region: str) -> pd.DataFrame:
        return self.price_data[
            (self.price_data["crop_name"] == crop_name)
            & (self.price_data["region"] == region)
        ].sort_values(["year", "month"])

    @staticmethod
    def _add_months(y: int, m: int, n: int) -> tuple[int, int]:
        total = y * 12 + (m - 1) + n
        return total // 12, (total % 12) + 1

    def _get_reference_price(
        self, crop_name: str, region: str, target_date: pd.Timestamp
    ) -> Optional[float]:
        ref_date = target_date - pd.DateOffset(months=12)
        hist = self._hist(crop_name, region)
        match = hist[
            (hist["year"] == ref_date.year) & (hist["month"] == ref_date.month)
        ]
        if not match.empty:
            return float(match["price_per_kg"].iloc[0])
        # Walk backward
        for offset in range(13, 19):
            alt = target_date - pd.DateOffset(months=offset)
            match = hist[(hist["year"] == alt.year) & (hist["month"] == alt.month)]
            if not match.empty:
                return float(match["price_per_kg"].iloc[0])
        return None

    def _build_initial_window(
        self, crop_name: str, region: str, end_date: pd.Timestamp
    ) -> tuple[list[float], list[tuple[int, int]], list[float]]:
        """Return the *seq_len* months ending at (or before) *end_date*."""
        hist = self._hist(crop_name, region)
        mask = pd.to_datetime(hist[["year", "month"]].assign(day=1)) <= end_date
        rows = hist[mask].tail(self.seq_len)

        if len(rows) < self.seq_len:
            raise ValueError(
                f"Not enough history for {crop_name} / {region}: "
                f"need {self.seq_len} months, got {len(rows)}."
            )

        prices = rows["price_per_kg"].tolist()
        months = list(zip(rows["year"].astype(int), rows["month"].astype(int)))
        infl = rows["inflation_index"].tolist()
        return prices, months, infl

    def _project_inflation(
        self, target_year: int, target_month: int
    ) -> float:
        """Simple inflation projection - average monthly rate from last 3 years."""
        df = self.price_data.sort_values(["year", "month"])
        last = df.iloc[-1]
        last_date = pd.Timestamp(
            year=int(last["year"]), month=int(last["month"]), day=1
        )
        target_date = pd.Timestamp(year=target_year, month=target_month, day=1)

        if target_date <= last_date:
            match = df[
                (df["year"] == target_year) & (df["month"] == target_month)
            ]
            if not match.empty:
                return float(match["inflation_index"].iloc[0])
            return float(last["inflation_index"])

        lookback = last_date - pd.DateOffset(years=3)
        window = df[
            pd.to_datetime(df[["year", "month"]].assign(day=1)) >= lookback
        ]
        indices = window["inflation_index"].values
        if len(indices) < 2:
            raise ValueError("Not enough inflation data for projection.")

        monthly_rates = (indices[1:] / indices[:-1]) - 1.0
        avg_rate = float(np.mean(monthly_rates))

        months_ahead = (target_date.year - last_date.year) * 12 + (
            target_date.month - last_date.month
        )
        return round(float(last["inflation_index"]) * ((1 + avg_rate) ** months_ahead), 6)

    # ------------------------------------------------------------------
    # Recursive forecast
    # ------------------------------------------------------------------

    def _recursive_forecast(
        self,
        crop_name: str,
        region: str,
        start_prices: list[float],
        start_months: list[tuple[int, int]],
        start_infl: list[float],
        target_date: pd.Timestamp,
    ) -> float:
        """Walk forward month-by-month until *target_date*."""
        prices = list(start_prices)
        months = list(start_months)
        infls = list(start_infl)
        crop_idx = self.crop_to_idx[crop_name]
        region_idx = self.region_to_idx[region]

        last_y, last_m = months[-1]
        current_date = pd.Timestamp(year=last_y, month=last_m, day=1)

        while current_date < target_date:
            current_date += pd.DateOffset(months=1)
            ny, nm = current_date.year, current_date.month

            proj_infl = self._project_inflation(ny, nm)

            # Slide window
            prices.pop(0)
            months.pop(0)
            infls.pop(0)
            months.append((ny, nm))
            infls.append(proj_infl)

            # Predict — the LSTM uses the last seq_len prices as input
            # but price for the "current" month is unknown, so we use
            # the latest known price as a placeholder
            pred = predict_single(
                self.model,
                price_sequence=prices,
                months=months,
                inflation_indices=infls,
                crop_idx=crop_idx,
                region_idx=region_idx,
                price_scaler=self.price_scaler,
                inflation_scaler=self.inflation_scaler,
                seq_len=self.seq_len,
                device=self._device,
            )
            prices.append(round(pred, 2))

        return prices[-1]

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(self, data: Dict[str, Any]) -> ForecastResult:
        crop_name = self._resolve_crop(str(data["crop_name"]))
        region = self._resolve_region(str(data["region"]))
        year = int(data["year"])
        month = int(data["month"])

        if month < 1 or month > 12:
            raise ValueError("month must be between 1 and 12.")

        target_date = pd.Timestamp(year=year, month=month, day=1)

        # Get the last seq_len months ending at target_date - 1
        # (because we're predicting target_date)
        input_end = target_date - pd.DateOffset(months=1)

        prices, months_list, infl_list = self._build_initial_window(
            crop_name, region, input_end
        )

        # If target is historical (or present), we can predict directly
        hist_last_date = pd.Timestamp(
            year=months_list[-1][0], month=months_list[-1][1], day=1
        )

        if target_date <= hist_last_date + pd.DateOffset(months=1):
            # Window already ends at target_date - 1, just predict
            crop_idx = self.crop_to_idx[crop_name]
            region_idx = self.region_to_idx[region]
            predicted_price = predict_single(
                self.model,
                price_sequence=prices,
                months=months_list,
                inflation_indices=infl_list,
                crop_idx=crop_idx,
                region_idx=region_idx,
                price_scaler=self.price_scaler,
                inflation_scaler=self.inflation_scaler,
                seq_len=self.seq_len,
                device=self._device,
            )
        else:
            # Future — recursive walk
            predicted_price = self._recursive_forecast(
                crop_name=crop_name,
                region=region,
                start_prices=prices,
                start_months=months_list,
                start_infl=infl_list,
                target_date=target_date,
            )

        predicted_price = round(predicted_price, 2)

        # Confidence interval (± 2 × RMSE)
        margin = 2.0 * self._rmse
        ci = (round(predicted_price - margin, 2), round(predicted_price + margin, 2))

        # Trend
        ref = self._get_reference_price(crop_name, region, target_date)
        if ref is None:
            ref = prices[-1]
        trend_label, trend_pct = calculate_trend(predicted_price, ref)

        return ForecastResult(
            crop_name=crop_name,
            region=region,
            year=year,
            month=month,
            predicted_price=predicted_price,
            confidence_interval=ci,
            trend=trend_label,
            trend_percentage=trend_pct,
        )

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "model_type": "lstm",
            "crops": self.supported_crops,
            "regions": self.supported_regions,
            "seq_len": self.seq_len,
            "validation_rmse": self._rmse,
            "feature_notes": self.metadata.get("feature_notes", []),
        }