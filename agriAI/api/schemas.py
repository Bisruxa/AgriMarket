from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class PriceForecastRequest(BaseModel):
    crop_name: str = Field(..., description="Crop name, e.g. Teff")
    region: str = Field(..., description="Region name, e.g. Oromia")
    as_of_date: Optional[date] = Field(
        None,
        description="Optional date (YYYY-MM-DD) to use as the last observed week.",
    )


class PriceForecastResponse(BaseModel):
    crop_name: str
    region: str
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
