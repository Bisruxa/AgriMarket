from __future__ import annotations

from datetime import date
from typing import List

from pydantic import BaseModel, Field


class PriceForecastRequest(BaseModel):
    crop: str = Field(..., description="The crop to forecast prices for.")
    start_date: date = Field(..., description="Forecast window start date.")
    end_date: date = Field(..., description="Forecast window end date.")


class PriceForecastResponse(BaseModel):
    date: date
    price: float


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
