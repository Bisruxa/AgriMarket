from __future__ import annotations

from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class PriceForecastRequest(BaseModel):
    crop: str = Field(..., description="The crop to forecast prices for.")
    start_date: date = Field(..., description="The start date of the forecast.")
    end_date: date = Field(..., description="The end date of the forecast.")


class PriceForecastResponse(BaseModel):
    prediction: float


class MetadataResponse(BaseModel):
    model_type: str
    model_version: str
    crops: List[str]


class CropRecommendationRequest(BaseModel):
    nitrogen: int
    phosphorus: int
    potassium: int
    temperature: float
    humidity: float
    ph: float
    rainfall: float


class CropRecommendation(BaseModel):
    crop: str
    confidence: str


class CropRecommendationResponse(BaseModel):
    recommendations: List[CropRecommendation]

    as_of_date: date
    forecast_date: date
    forecast_horizon_weeks: int
    predicted_price: float
    model_version: str


class MetadataResponse(BaseModel):
    available_crops: list[str]
    available_regions: list[str]
    forecast_horizon_weeks: int
    feature_notes: list[str]
    model_version: str
