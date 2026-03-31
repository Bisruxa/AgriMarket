from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from api.schemas import MetadataResponse, PriceForecastRequest, PriceForecastResponse
from api.services.price_forecaster_service import PriceForecasterService


app = FastAPI(title="AgriAI Service", version="0.1.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("AGRIAI_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]

if allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.on_event("startup")
def load_services() -> None:
    app.state.price_service = PriceForecasterService.from_env()


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "agriAI"}


@app.get("/metadata", response_model=MetadataResponse)
def get_metadata() -> dict:
    service = app.state.price_service
    return {
        "available_crops": service.available_crops,
        "available_regions": service.available_regions,
        "forecast_horizon_weeks": service.forecast_horizon_weeks,
        "feature_notes": service.feature_notes,
        "model_version": service.model_version,
    }


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
