from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
import pandas as pd

from .base_service import InferenceService


EXPECTED_FEATURES = [
    "nitrogen",
    "phosphorus",
    "potassium",
    "temperature",
    "humidity",
    "ph",
    "rainfall",
    "soil_color",
]


class CropRecommenderService(InferenceService):
    """
    A service for recommending crops based on soil and weather conditions.
    It loads a pre-trained XGBoost model to make predictions.
    """

    def __init__(self, model_path: str, encoder_path: str) -> None:
        self.encoder_path = Path(encoder_path)
        self._load_encoder()
        # The base class __init__ will call _load_model
        super().__init__(model_path)

    def _load_model(self) -> Any:
        """Loads the saved inference pipeline or legacy model from disk."""
        model_path = Path(self.model_path)
        suffix = model_path.suffix.lower()
        if suffix in {".joblib", ".pkl"}:
            return joblib.load(model_path)

        import xgboost as xgb

        model = xgb.XGBClassifier()
        model.load_model(model_path)
        return model

    def _load_encoder(self) -> None:
        """Loads the label encoder from the specified path."""
        self.label_encoder = joblib.load(self.encoder_path)

    @staticmethod
    def _normalize_soil_color(value: object) -> str:
        if pd.isna(value):
            return "brown"

        text = str(value).strip().lower()
        if not text:
            return "brown"

        text = text.replace("_", " ").replace("-", " ").replace(";", " ")
        text = " ".join(text.split())
        text = text.replace("reddis", "reddish").replace("redish", "reddish")
        text = text.replace("broown", "brown").replace("darkbrown", "dark brown").replace("lihgtish", "lightish")

        if "black" in text:
            return "black"
        if "yellow" in text and "brown" in text:
            return "yellowish brown"
        if "reddish gray" in text or ("gray" in text and "red" in text):
            return "reddish gray"
        if "grayish brown" in text or ("gray" in text and "brown" in text):
            return "grayish brown"
        if "dark reddish brown" in text:
            return "dark reddish brown"
        if "red brown" in text or ("reddish" in text and "brown" in text):
            return "red brown"
        if "very dark brown" in text:
            return "very dark brown"
        if "dark brown" in text:
            return "dark brown"
        if "light brown" in text or "lightish brown" in text:
            return "light brown"
        if "dark gray" in text:
            return "dark gray"
        if "light red" in text:
            return "light red"
        if "gray" in text:
            return "gray"
        if "red" in text:
            return "red"
        if "brown" in text:
            return "brown"
        return "other"

    def _prepare_input(self, data: Dict[str, Any]) -> pd.DataFrame:
        frame = pd.DataFrame([data])
        if "soil_color" not in frame.columns:
            frame["soil_color"] = "brown"

        frame["soil_color"] = frame["soil_color"].map(self._normalize_soil_color)
        for column in EXPECTED_FEATURES:
            if column == "soil_color":
                continue
            frame[column] = pd.to_numeric(frame[column], errors="coerce")

        return frame[EXPECTED_FEATURES]

    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Makes a crop recommendation based on the input data."""
        input_df = self._prepare_input(data)

        probabilities = self.model.predict_proba(input_df)[0]
        top3_indices = np.argsort(probabilities)[-3:][::-1]
        top3_crops = self.label_encoder.inverse_transform(top3_indices)
        top3_probabilities = probabilities[top3_indices]

        recommendations = [
            {"crop": str(crop), "confidence": f"{float(prob):.2f}"}
            for crop, prob in zip(top3_crops, top3_probabilities)
        ]

        return {"recommendations": recommendations}

