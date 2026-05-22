from __future__ import annotations

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


service_factory = ServiceFactory()
