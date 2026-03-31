from __future__ import annotations

import os
from typing import Any, Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    CropRecommendationRequest,
    CropRecommendationResponse,
    MetadataResponse,
    PriceForecastRequest,
    PriceForecastResponse,
)
from .services.service_factory import service_factory

load_dotenv()

app = FastAPI(title="AgriAI Service", version="0.2.0")

# Configure CORS
allowed_origins = os.getenv("AGRIAI_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def load_all_services() -> None:
    """
    Load all registered services on application startup.
    """
    app.state.price_service = service_factory.get_service(
        "price_forecaster",
        model_path=os.getenv("PRICE_MODEL_PATH", "models/price_forecaster/xgboost_price_forecaster.json"),
        metadata_path=os.getenv("PRICE_METADATA_PATH", "models/price_forecaster/training_metadata.json"),
        data_path=os.getenv("PRICE_DATA_PATH", "data/synthetic/crop_price_data.csv"),
    )
    app.state.recommender_service = service_factory.get_service(
        "crop_recommender",
        model_path=os.getenv("RECOMMENDER_MODEL_PATH", "models/crop_recommender/xgboost_crop_recommender.json"),
        data_path=os.getenv("RECOMMENDER_DATA_PATH", "data/synthetic/crop_recommendation_data.csv"),
    )
    print("All AI services loaded.")


@app.get("/health")
def health_check() -> Dict[str, str]:
    """
    Health check endpoint.
    """
    return {"status": "ok", "service": "AgriAI"}


@app.get("/price-forecaster/metadata", response_model=MetadataResponse)
def get_price_forecaster_metadata() -> Dict[str, Any]:
    """
    Get metadata for the price forecasting model.
    """
    service = app.state.price_service
    meta = service.get_metadata()
    return {
        "model_type": "price_forecaster",
        "model_version": meta.get("model_version", "v1"),
        "crops": meta.get("crops", []),
    }


@app.post("/predict/price", response_model=List[PriceForecastResponse])
def predict_price(request: PriceForecastRequest) -> List[Dict[str, Any]]:
    """
    Endpoint for crop price forecasting.
    """
    try:
        service = app.state.price_service
        predictions = service.predict(request.dict())
        if predictions.empty:
            return []
        # Convert timestamp to date string
        predictions.index = predictions.index.strftime('%Y-%m-%d')
        return [{"date": idx, "price": row.prediction} for idx, row in predictions.iterrows()]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


@app.post("/recommend/crop", response_model=CropRecommendationResponse)
def recommend_crop(request: CropRecommendationRequest) -> Dict[str, Any]:
    """
    Endpoint for crop recommendations.
    """
    try:
        service = app.state.recommender_service
        recommendations = service.predict(request.dict())
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")



@app.post("/predict/price", response_model=PriceForecastResponse)
def predict_price(payload: PriceForecastRequest) -> dict:
    service = app.state.price_service
    try:
        return service.predict_price(
            crop_name=payload.crop_name,
            region=payload.region,
            as_of_date=payload.as_of_date,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
