from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import joblib
import pandas as pd
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder

from .base_service import InferenceService


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

    def _load_model(self) -> xgb.XGBClassifier:
        """Loads the XGBoost model from the specified path."""
        model = xgb.XGBClassifier()
        model.load_model(self.model_path)
        return model

    def _load_encoder(self) -> None:
        """Loads the label encoder from the specified path."""
        self.label_encoder = joblib.load(self.encoder_path)

    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Makes a crop recommendation based on the input data."""
        # Create a DataFrame from the input data
        input_df = pd.DataFrame([data])
        
        # Get probabilities for top 3 recommendations
        probabilities = self.model.predict_proba(input_df)[0]
        top3_indices = probabilities.argsort()[-3:][::-1]
        top3_crops = self.label_encoder.inverse_transform(top3_indices)
        top3_probabilities = probabilities[top3_indices]

        recommendations = [
            {"crop": crop, "confidence": f"{prob:.2f}"}
            for crop, prob in zip(top3_crops, top3_probabilities)
        ]

        return {"recommendations": recommendations}

