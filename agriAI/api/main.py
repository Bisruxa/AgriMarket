from __future__ import annotations

import os
from typing import Any, Dict

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    CropRecommendationRequest,
    CropRecommendationResponse,
    PriceForecastRequest,
    PriceForecastResponse,
    PriceForecasterMetadataResponse,
)
from .services.service_factory import service_factory

load_dotenv()

app = FastAPI(title="AgriAI Service", version="0.3.0")

allowed_origins = os.getenv("AGRIAI_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def load_all_services() -> None:
    try:
        app.state.price_service = service_factory.get_service(
            "price_forecaster",
            model_path=os.getenv(
                "PRICE_MODEL_PATH", "models/price_forecaster/xgboost_price_forecaster.json"
            ),
            metadata_path=os.getenv(
                "PRICE_METADATA_PATH", "models/price_forecaster/training_metadata.json"
            ),
            data_path=os.getenv("PRICE_DATA_PATH", "data/processed/crop_price_history_v2.csv"),
        )
        print("✅  PriceForecasterService loaded.")
    except Exception as exc:
        app.state.price_service = None
        print(f"⚠️  PriceForecasterService failed to load: {exc}")

    try:
        app.state.recommender_service = service_factory.get_service(
            "crop_recommender",
            model_path=os.getenv(
                "RECOMMENDER_MODEL_PATH",
                "models/crop_recommender/xgboost_crop_recommender.joblib",
            ),
            encoder_path=os.getenv(
                "RECOMMENDER_ENCODER_PATH", "models/crop_recommender/label_encoder.joblib"
            ),
        )
        print("✅  CropRecommenderService loaded.")
    except Exception as exc:
        app.state.recommender_service = None
        print(f"⚠️  CropRecommenderService failed to load: {exc}")


@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok", "service": "AgriAI"}


# ── Price Forecaster ────────────────────────────────────────────────────


@app.get(
    "/price-forecaster/metadata",
    response_model=PriceForecasterMetadataResponse,
)
def get_price_forecaster_metadata() -> Dict[str, Any]:
    if app.state.price_service is None:
        raise HTTPException(status_code=503, detail="Price forecaster service is not available.")
    meta = app.state.price_service.get_metadata()
    return {
        "model_type": "price_forecaster",
        "crops": meta.get("crops", []),
        "regions": meta.get("regions", []),
        "forecast_horizon_months": meta.get("forecast_horizon_months", 1),
        "validation_rmse": meta.get("validation_rmse", 0.0),
        "feature_notes": meta.get("feature_notes"),
    }


@app.post(
    "/predict/price",
    response_model=PriceForecastResponse,
)
def predict_price(request: PriceForecastRequest) -> Dict[str, Any]:
    if app.state.price_service is None:
        raise HTTPException(status_code=503, detail="Price forecaster service is not available.")
    try:
        result = app.state.price_service.predict(request.model_dump())
        return {
            "crop_name": result.crop_name,
            "region": result.region,
            "year": result.year,
            "month": result.month,
            "predicted_price": result.predicted_price,
            "confidence_interval": list(result.confidence_interval),
            "trend": result.trend,
            "trend_percentage": result.trend_percentage,
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {exc}"
        ) from exc


# ── Crop Recommender ────────────────────────────────────────────────────


@app.post("/recommend/crop", response_model=CropRecommendationResponse)
def recommend_crop(request: CropRecommendationRequest) -> Dict[str, Any]:
    try:
        return app.state.recommender_service.predict(request.model_dump())
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {exc}"
        ) from exc