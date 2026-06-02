from __future__ import annotations

import os
from typing import Dict

from .base_service import InferenceService
from .crop_recommender_service import CropRecommenderService
from .price_forecaster_service import PriceForecasterService


class ServiceFactory:
    """
    A factory for creating inference services.
    """

    def __init__(self):
        self._services: Dict[str, type[InferenceService]] = {
            "price_forecaster": PriceForecasterService,
            "crop_recommender": CropRecommenderService,
        }

    def get_service(
        self, service_name: str, **kwargs
    ) -> InferenceService:
        """
        Returns an instance of the specified service.
        """
        service = self._services.get(service_name)
        if not service:
            raise ValueError(f"Service '{service_name}' not found.")
        return service(**kwargs)

    def get_price_forecaster(self) -> InferenceService:
        return self.get_service(
            "price_forecaster",
            model_path=os.getenv(
                "PRICE_MODEL_PATH",
                "models/price_forecaster/xgboost_price_forecaster.json",
            ),
            metadata_path=os.getenv(
                "PRICE_METADATA_PATH",
                "models/price_forecaster/training_metadata.json",
            ),
            data_path=os.getenv(
                "PRICE_DATA_PATH",
                "data/processed/crop_price_history_v2.csv",
            ),
        )

    def get_crop_recommender(self) -> InferenceService:
        return self.get_service("crop_recommender")


service_factory = ServiceFactory()
