from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from .base_service import InferenceService


class CropRecommenderService(InferenceService):
    """
    A service for recommending crops based on soil and weather conditions.
    It uses an XGBoost model to make predictions.
    """

    def __init__(self, model_path: str, data_path: str) -> None:
        self.data_path = Path(data_path)
        self._load_data()
        self._train_model()
        super().__init__(model_path)

    def _load_data(self) -> None:
        """Loads the crop recommendation data from the specified path."""
        self.data = pd.read_csv(self.data_path)

    def _train_model(self) -> None:
        """Trains the XGBoost model."""
        X = self.data.drop("crop", axis=1)
        y = self.data["crop"]

        self.label_encoder = LabelEncoder()
        y_encoded = self.label_encoder.fit_transform(y)

        X_train, _, y_train, _ = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )

        self.model = xgb.XGBClassifier(
            objective="multi:softmax",
            num_class=len(self.label_encoder.classes_),
            eval_metric="mlogloss",
            use_label_encoder=False,
        )
        self.model.fit(X_train, y_train)

    def _load_model(self) -> xgb.XGBClassifier:
        """Returns the trained XGBoost model."""
        return self.model

    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Makes a crop recommendation based on the input data."""
        input_df = pd.DataFrame([data])
        prediction_encoded = self.model.predict(input_df)[0]
        prediction = self.label_encoder.inverse_transform([prediction_encoded])[0]
        
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
