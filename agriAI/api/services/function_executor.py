from __future__ import annotations
import os
import requests
import json
from typing import Any, Dict, List, Optional
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

EXPRESS_BASE_URL = os.getenv("EXPRESS_BASE_URL", "http://localhost:5000/api").rstrip("/")


def _call_express(path: str, method: str = "GET", body: Optional[Dict] = None) -> Dict:
    url = f"{EXPRESS_BASE_URL}{path}"
    try:
        if method == "GET":
            resp = requests.get(url, timeout=10)
        else:
            resp = requests.post(url, json=body, timeout=10)
        if resp.ok:
            data = resp.json()
            return data.get("data", data)
        return {"error": f"Express API error: {resp.status_code}"}
    except requests.RequestException as e:
        return {"error": f"Failed to reach server: {str(e)}"}


def get_recommended_crops(nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, soil_color="brown"):
    try:
        from .crop_recommender_service import CropRecommenderService
        recommender = CropRecommenderService(
            model_path=os.getenv(
                "RECOMMENDER_MODEL_PATH",
                "models/crop_recommender/xgboost_crop_recommender.joblib"
            ),
            encoder_path=os.getenv(
                "RECOMMENDER_ENCODER_PATH",
                "models/crop_recommender/label_encoder.joblib"
            ),
        )
        result = recommender.predict({
            "nitrogen": nitrogen, "phosphorus": phosphorus,
            "potassium": potassium, "temperature": temperature,
            "humidity": humidity, "ph": ph,
            "rainfall": rainfall, "soil_color": soil_color,
        })
        crops = [r["crop"] for r in result.get("recommendations", [])]
        return {
            "recommendations": result.get("recommendations", []),
            "summary": f"Top recommended crops: {', '.join(crops)}" if crops else "No recommendations available",
        }
    except Exception as e:
        return {"error": f"Crop recommendation failed: {str(e)}"}


def get_price_forecast(crop_name, region, year, month):
    try:
        from .price_forecaster_service import PriceForecasterService
        forecaster = PriceForecasterService(
            model_path=os.getenv(
                "PRICE_MODEL_PATH",
                "models/price_forecaster/xgboost_price_forecaster.json"
            ),
            metadata_path=os.getenv(
                "PRICE_METADATA_PATH",
                "models/price_forecaster/training_metadata.json"
            ),
            data_path=os.getenv(
                "PRICE_DATA_PATH",
                "data/processed/crop_price_history_v2.csv"
            ),
        )
        result = forecaster.predict({
            "crop_name": crop_name, "region": region,
            "year": year, "month": month,
        })
        return {
            "crop_name": result.crop_name,
            "region": result.region,
            "predicted_price": result.predicted_price,
            "confidence_interval": list(result.confidence_interval),
            "trend": result.trend,
            "trend_percentage": result.trend_percentage,
            "summary": (
                f"{crop_name} in {region} for {month}/{year}: "
                f"ETB {result.predicted_price:.2f} ({result.trend} trend, "
                f"{result.trend_percentage:.1f}%)"
            ),
        }
    except Exception as e:
        return {"error": f"Price forecast failed: {str(e)}"}


def get_weather_forecast(latitude, longitude):
    try:
        params = {
            "latitude": latitude, "longitude": longitude,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
            "timezone": "auto", "forecast_days": 7,
        }
        resp = requests.get("https://api.open-meteo.com/v1/forecast", params=params, timeout=10)
        if resp.ok:
            data = resp.json()
            return {
                "location": f"{latitude}, {longitude}",
                "forecast": data.get("daily", {}),
                "summary": f"Weather forecast available for {latitude}, {longitude}",
            }
        return {"error": "Weather API error"}
    except requests.RequestException as e:
        return {"error": f"Weather fetch failed: {str(e)}"}


def get_market_trends(category=None):
    path = "/market/trends"
    if category:
        path += f"?category={category}"
    return _call_express(path)


def get_user_farms(user_id):
    return _call_express(f"/farms")


def get_soil_analysis(region=None, nitrogen=None, phosphorus=None, potassium=None, ph=None):
    info = []
    if region:
        info.append(f"Region: {region}")
    if nitrogen is not None:
        info.append(f"Nitrogen (N): {nitrogen}")
    if phosphorus is not None:
        info.append(f"Phosphorus (P): {phosphorus}")
    if potassium is not None:
        info.append(f"Potassium (K): {potassium}")
    if ph is not None:
        info.append(f"pH: {ph}")

    if not info:
        return {"error": "No soil data provided"}

    return {
        "soil_data": {
            "nitrogen": nitrogen, "phosphorus": phosphorus,
            "potassium": potassium, "ph": ph, "region": region,
        },
        "summary": " | ".join(info),
    }


FUNCTION_REGISTRY = {
    "get_crop_recommendation": {
        "fn": get_recommended_crops,
        "description": "Recommend the best crops to plant based on soil nutrients and climate conditions",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "nitrogen": {"type": "INTEGER", "description": "Nitrogen level in soil"},
                "phosphorus": {"type": "INTEGER", "description": "Phosphorus level in soil"},
                "potassium": {"type": "INTEGER", "description": "Potassium level in soil"},
                "temperature": {"type": "NUMBER", "description": "Temperature in Celsius"},
                "humidity": {"type": "NUMBER", "description": "Humidity percentage"},
                "ph": {"type": "NUMBER", "description": "Soil pH level"},
                "rainfall": {"type": "NUMBER", "description": "Rainfall in mm"},
                "soil_color": {"type": "STRING", "description": "Soil color (e.g. brown, black, red, gray)", "enum": ["brown", "black", "red", "gray"]},
            },
            "required": ["nitrogen", "phosphorus", "potassium", "temperature", "humidity", "ph", "rainfall"],
        },
    },
    "get_price_forecast": {
        "fn": get_price_forecast,
        "description": "Predict future prices for a specific crop in a region",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "crop_name": {"type": "STRING", "description": "Name of the crop"},
                "region": {"type": "STRING", "description": "Region in Ethiopia"},
                "year": {"type": "INTEGER", "description": "Target year"},
                "month": {"type": "INTEGER", "description": "Target month (1-12)"},
            },
            "required": ["crop_name", "region", "year", "month"],
        },
    },
    "get_weather_forecast": {
        "fn": get_weather_forecast,
        "description": "Get 7-day weather forecast for a location",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "latitude": {"type": "NUMBER", "description": "Latitude"},
                "longitude": {"type": "NUMBER", "description": "Longitude"},
            },
            "required": ["latitude", "longitude"],
        },
    },
    "get_market_trends": {
        "fn": get_market_trends,
        "description": "Get current market trends and pricing data for agricultural products",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "category": {"type": "STRING", "description": "Product category to filter by"},
            },
        },
    },
    "get_soil_analysis": {
        "fn": get_soil_analysis,
        "description": "Analyze soil data including nitrogen, phosphorus, potassium, and pH levels",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "region": {"type": "STRING", "description": "Region name"},
                "nitrogen": {"type": "NUMBER", "description": "Nitrogen level"},
                "phosphorus": {"type": "NUMBER", "description": "Phosphorus level"},
                "potassium": {"type": "NUMBER", "description": "Potassium level"},
                "ph": {"type": "NUMBER", "description": "pH level"},
            },
        },
    },
}


def get_tool_definitions() -> List[Dict]:
    tools = []
    for name, reg in FUNCTION_REGISTRY.items():
        tools.append({
            "name": name,
            "description": reg["description"],
            "parameters": reg["parameters"],
        })
    return tools


def execute_function(name: str, args: Dict[str, Any]) -> Dict:
    reg = FUNCTION_REGISTRY.get(name)
    if not reg:
        return {"error": f"Unknown function: {name}"}
    try:
        result = reg["fn"](**args)
        return {"result": result}
    except TypeError as e:
        return {"error": f"Invalid arguments for {name}: {str(e)}"}
    except Exception as e:
        return {"error": f"Function {name} execution failed: {str(e)}"}
