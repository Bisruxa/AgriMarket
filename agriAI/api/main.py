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

app = FastAPI(title="AgriAI Service", version="0.2.1")

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
    app.state.price_service = service_factory.get_service(
        "price_forecaster",
        model_path=os.getenv(
            "PRICE_MODEL_PATH", "models/price_forecaster/xgboost_price_forecaster.json"
        ),
        metadata_path=os.getenv(
            "PRICE_METADATA_PATH", "models/price_forecaster/training_metadata.json"
        ),
        data_path=os.getenv("PRICE_DATA_PATH", "data/synthetic/crop_price_data.csv"),
    )
    app.state.recommender_service = service_factory.get_service(
        "crop_recommender",
        model_path=os.getenv(
            "RECOMMENDER_MODEL_PATH",
            "models/crop_recommender/xgboost_crop_recommender.json",
        ),
        encoder_path=os.getenv(
            "RECOMMENDER_ENCODER_PATH", "models/crop_recommender/label_encoder.joblib"
        ),
    )


@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok", "service": "AgriAI"}


@app.get("/price-forecaster/metadata", response_model=MetadataResponse)
def get_price_forecaster_metadata() -> Dict[str, Any]:
    meta = app.state.price_service.get_metadata()
    return {
        "model_type": "price_forecaster",
        "model_version": meta.get("model_version", "v1"),
        "crops": meta.get("crops", []),
    }


@app.post("/predict/price", response_model=List[PriceForecastResponse])
def predict_price(request: PriceForecastRequest) -> List[Dict[str, Any]]:
    try:
        predictions = app.state.price_service.predict(request.model_dump())
        if predictions.empty:
            return []

        formatted = []
        for idx, row in predictions.iterrows():
            formatted.append({
                "date": idx.date().isoformat(),
                "price": float(row["prediction"]),
            })
        return formatted
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {exc}") from exc


@app.post("/recommend/crop", response_model=CropRecommendationResponse)
def recommend_crop(request: CropRecommendationRequest) -> Dict[str, Any]:
    try:
        return app.state.recommender_service.predict(request.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {exc}") from exc
