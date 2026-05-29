from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


# ── Price Forecaster ──────────────────────────────────────────────────────


class PriceForecastRequest(BaseModel):
    crop_name: str = Field(..., description="Crop to forecast (e.g. 'Teff (white)').")
    region: str = Field(..., description="Region (e.g. 'Oromia').")
    year: int = Field(..., description="Target year.", ge=2015)
    month: int = Field(..., description="Target month (1–12).", ge=1, le=12)


class PriceForecastResponse(BaseModel):
    crop_name: str
    region: str
    year: int
    month: int
    predicted_price: float
    confidence_interval: List[float]  # [lower, upper]
    trend: str  # "increasing" | "decreasing" | "stable"
    trend_percentage: float


class PriceForecasterMetadataResponse(BaseModel):
    model_type: str
    crops: List[str]
    regions: List[str]
    forecast_horizon_months: int
    validation_rmse: float
    feature_notes: Optional[List[str]] = None


# ── Crop Recommender ──────────────────────────────────────────────────────


class CropRecommendationRequest(BaseModel):
    nitrogen: int
    phosphorus: int
    potassium: int
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    soil_color: Optional[str] = Field(
        default="brown",
        description="Optional soil color category. Defaults to brown if omitted.",
    )


class CropRecommendation(BaseModel):
    crop: str
    confidence: str


class CropRecommendationResponse(BaseModel):
    recommendations: List[CropRecommendation]


# ── Shared ────────────────────────────────────────────────────────────────


class MetadataResponse(BaseModel):
    model_type: str
    model_version: str
    crops: List[str]


class ChatRequest(BaseModel):
    message: str = Field(..., description="User's message")
    conversation_history: Optional[List[Dict[str, str]]] = Field(default=[], description="Previous conversation messages")
    user_id: Optional[str] = Field(default=None, description="User identifier for context")


class FunctionCallInfo(BaseModel):
    name: str
    args: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    text: str
    functionCalls: Optional[List[FunctionCallInfo]] = Field(default=[])