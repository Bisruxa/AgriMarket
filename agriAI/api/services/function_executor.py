from __future__ import annotations
import os
import requests
import json
from typing import Any, Dict, List, Optional
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

EXPRESS_BASE_URL = os.getenv("EXPRESS_BASE_URL", "http://localhost:5000/api").rstrip("/")

_user_context: Dict[str, Any] = {}

def set_user_context(ctx: Optional[Dict[str, Any]]):
    global _user_context
    _user_context = ctx or {}

def get_user_context() -> Dict[str, Any]:
    return _user_context

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


def get_price_trends(crop_name: str, region: Optional[str] = None):
    """Fetch recent price trends from the database (last 6 months)."""
    try:
        path = f"/prices/trends?limit=6"
        if crop_name:
            path += f"&cropName={crop_name}"
        if region:
            path += f"&region={region}"
        data = _call_express(path)
        if isinstance(data, list) and len(data) > 0:
            prices = [{"year": r.get("year"), "month": r.get("month"),
                       "avgPrice": r.get("avgPrice"), "minPrice": r.get("minPrice"),
                       "maxPrice": r.get("maxPrice")} for r in data]
            avg = sum(p.get("avgPrice", 0) or 0 for p in prices) / len(prices)
            recent = prices[-1].get("avgPrice", 0) or 0
            first = prices[0].get("avgPrice", 0) or 0
            change_pct = ((recent - first) / first * 100) if first else 0
            trend = "increasing" if change_pct > 3 else ("decreasing" if change_pct < -3 else "stable")
            ci_lower = round(avg * 0.85, 2)
            ci_upper = round(avg * 1.15, 2)
            return {
                "crop_name": crop_name,
                "region": region or "all",
                "recent_prices": prices,
                "average_price": round(avg, 2),
                "price_range": [round(min(p.get("avgPrice", 0) or 0 for p in prices), 2),
                                round(max(p.get("avgPrice", 0) or 0 for p in prices), 2)],
                "trend": trend,
                "trend_percentage": round(change_pct, 1),
                "confidence_interval": [ci_lower, ci_upper],
                "summary": (
                    f"{crop_name or 'Crops'} in {region or 'all regions'}: "
                    f"avg ETB {avg:.2f}, {trend} trend ({change_pct:+.1f}%), "
                    f"CI: [{ci_lower:.2f} - {ci_upper:.2f}]"
                ),
            }
        return {"message": f"No price data available for {crop_name or 'crops'} in {region or 'any region'}.", "recent_prices": []}
    except Exception as e:
        return {"error": f"Price trends fetch failed: {str(e)}"}


def get_farm_details(farm_id: str):
    """Fetch farm details from the database, or return from cached user context."""
    ctx_farms = _user_context.get("farms", [])
    for farm in ctx_farms:
        if farm.get("id") == farm_id:
            return {
                "farm": farm,
                "soil_data": {
                    "nitrogen": farm.get("nitrogen"),
                    "phosphorus": farm.get("phosphorus"),
                    "potassium": farm.get("potassium"),
                    "ph": farm.get("ph"),
                    "soilType": farm.get("soilType"),
                    "soilColor": farm.get("soilColor"),
                },
                "climate_data": {
                    "temperature": farm.get("temperature"),
                    "humidity": farm.get("humidity"),
                    "rainfall": farm.get("rainfall"),
                },
                "location": {
                    "region": farm.get("region"),
                    "woreda": farm.get("woreda"),
                    "latitude": farm.get("latitude"),
                    "longitude": farm.get("longitude"),
                },
                "summary": (
                    f"Farm '{farm.get('name')}' in {farm.get('region') or 'unknown'}: "
                    f"N={farm.get('nitrogen')}, P={farm.get('phosphorus')}, "
                    f"K={farm.get('potassium')}, pH={farm.get('ph')}"
                ),
            }
    result = _call_express(f"/farms/{farm_id}")
    if result and not result.get("error"):
        farm = result
        return {
            "farm": farm,
            "soil_data": {
                "nitrogen": farm.get("nitrogen"),
                "phosphorus": farm.get("phosphorus"),
                "potassium": farm.get("potassium"),
                "ph": farm.get("ph"),
                "soilType": farm.get("soilType"),
                "soilColor": farm.get("soilColor"),
            },
            "climate_data": {
                "temperature": farm.get("temperature"),
                "humidity": farm.get("humidity"),
                "rainfall": farm.get("rainfall"),
            },
            "location": {
                "region": farm.get("region"),
                "woreda": farm.get("woreda"),
                "latitude": farm.get("latitude"),
                "longitude": farm.get("longitude"),
            },
            "summary": (
                f"Farm '{farm.get('name')}' in {farm.get('region') or 'unknown'}: "
                f"N={farm.get('nitrogen')}, P={farm.get('phosphorus')}, "
                f"K={farm.get('potassium')}, pH={farm.get('ph')}"
            ),
        }
    return {"error": f"Farm not found or inaccessible: {farm_id}"}


def get_user_farms(user_id: Optional[str] = None):
    """List all farms for the current user."""
    ctx_farms = _user_context.get("farms", [])
    if ctx_farms:
        return {
            "farms": ctx_farms,
            "count": len(ctx_farms),
            "summary": f"You have {len(ctx_farms)} farm(s) registered."
        }
    result = _call_express(f"/farms")
    if isinstance(result, list):
        farms = result
        return {
            "farms": farms,
            "count": len(farms),
            "summary": f"You have {len(farms)} farm(s) registered."
        }
    return {"error": "Could not retrieve farms. Please register a farm first.", "farms": []}


def get_weather_forecast(latitude: float, longitude: float):
    """Get 7-day weather forecast from Open-Meteo (free, no API key)."""
    try:
        params = {
            "latitude": latitude, "longitude": longitude,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
            "timezone": "auto", "forecast_days": 7,
        }
        resp = requests.get("https://api.open-meteo.com/v1/forecast", params=params, timeout=10)
        if resp.ok:
            data = resp.json()
            daily = data.get("daily", {})
            days = []
            for i, date in enumerate(daily.get("time", [])):
                days.append({
                    "date": date,
                    "maxTemp": daily.get("temperature_2m_max", [None])[i],
                    "minTemp": daily.get("temperature_2m_min", [None])[i],
                    "precipitation": daily.get("precipitation_sum", [None])[i],
                    "weatherCode": daily.get("weather_code", [None])[i],
                })
            return {
                "location": {"latitude": latitude, "longitude": longitude},
                "forecast": days,
                "summary": f"7-day forecast for {latitude}, {longitude}. "
                           f"Highs: {days[0]['maxTemp']}C - {days[-1]['maxTemp']}C" if days else "No forecast data.",
            }
        return {"error": "Weather API error"}
    except requests.RequestException as e:
        return {"error": f"Weather fetch failed: {str(e)}"}


def get_market_trends(category: Optional[str] = None):
    """Get current market trends and pricing data for agricultural products."""
    path = "/market/trends"
    if category:
        path += f"?category={category}"
    result = _call_express(path)
    if isinstance(result, dict) and result.get("snapshotByCategory"):
        categories = [s.get("category") for s in result.get("snapshotByCategory", [])]
        return {
            "market_data": {
                "snapshot": result.get("snapshotByCategory", []),
                "momentum": result.get("categoryMomentum", []),
            },
            "summary": f"Market trends available for {len(categories)} categories: {', '.join(categories)}" if categories else "Market data available.",
        }
    return {"message": "Market trends currently unavailable.", "market_data": {}}


def get_soil_analysis(region: Optional[str] = None, nitrogen: Optional[float] = None,
                      phosphorus: Optional[float] = None, potassium: Optional[float] = None,
                      ph: Optional[float] = None):
    """Analyze soil data and provide interpretations."""
    info = []
    interpretations = []

    if region:
        info.append(f"Region: {region}")

    if nitrogen is not None:
        info.append(f"Nitrogen (N): {nitrogen}")
        if nitrogen < 40:
            interpretations.append("Nitrogen is LOW. Add compost or urea to improve plant growth.")
        elif nitrogen > 80:
            interpretations.append("Nitrogen is HIGH. Reduce nitrogen fertilizers to avoid excessive foliage.")
        else:
            interpretations.append("Nitrogen is ADEQUATE for most crops.")

    if phosphorus is not None:
        info.append(f"Phosphorus (P): {phosphorus}")
        if phosphorus < 15:
            interpretations.append("Phosphorus is LOW. Add bone meal or phosphate fertilizers.")
        elif phosphorus > 40:
            interpretations.append("Phosphorus is HIGH. Reduce phosphorus application.")
        else:
            interpretations.append("Phosphorus is ADEQUATE.")

    if potassium is not None:
        info.append(f"Potassium (K): {potassium}")
        if potassium < 20:
            interpretations.append("Potassium is LOW. Add potash or wood ash.")
        elif potassium > 50:
            interpretations.append("Potassium is HIGH. Reduce potassium fertilizers.")
        else:
            interpretations.append("Potassium is ADEQUATE.")

    if ph is not None:
        info.append(f"pH: {ph}")
        if ph < 5.5:
            interpretations.append("Soil is too ACIDIC. Add lime to raise pH.")
        elif ph > 7.5:
            interpretations.append("Soil is too ALKALINE. Add sulfur or organic matter.")
        else:
            interpretations.append("Soil pH is NEUTRAL and suitable for most crops.")

    if not info:
        return {"error": "No soil data provided. Please provide at least one parameter."}

    return {
        "soil_data": {
            "nitrogen": nitrogen, "phosphorus": phosphorus,
            "potassium": potassium, "ph": ph, "region": region,
        },
        "interpretations": interpretations,
        "summary": " | ".join(info) + (" | " + " ".join(interpretations) if interpretations else ""),
    }


FUNCTION_REGISTRY = {
    "get_price_trends": {
        "fn": get_price_trends,
        "description": "Get recent price trends and forecasts for agricultural crops from market database",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "crop_name": {"type": "STRING", "description": "Name of the crop (e.g. Teff, Maize, Coffee)"},
                "region": {"type": "STRING", "description": "Region in Ethiopia (e.g. Oromia, Amhara)"},
            },
            "required": ["crop_name"],
        },
    },
    "get_farm_details": {
        "fn": get_farm_details,
        "description": "Get detailed soil and climate data for a specific farm by ID",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "farm_id": {"type": "STRING", "description": "The ID of the farm to look up"},
            },
            "required": ["farm_id"],
        },
    },
    "get_user_farms": {
        "fn": get_user_farms,
        "description": "List all registered farms for the current user with their soil data",
        "parameters": {
            "type": "OBJECT",
            "properties": {},
        },
    },
    "get_weather_forecast": {
        "fn": get_weather_forecast,
        "description": "Get 7-day weather forecast for any location using coordinates",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "latitude": {"type": "NUMBER", "description": "Latitude of the location"},
                "longitude": {"type": "NUMBER", "description": "Longitude of the location"},
            },
            "required": ["latitude", "longitude"],
        },
    },
    "get_market_trends": {
        "fn": get_market_trends,
        "description": "Get current market trends, pricing data, and category momentum for agricultural products",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "category": {"type": "STRING", "description": "Product category filter (e.g. GRAINS, VEGETABLES, FRUITS)"},
            },
        },
    },
    "get_soil_analysis": {
        "fn": get_soil_analysis,
        "description": "Analyze soil nutrients (N, P, K, pH) and provide improvement recommendations",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "region": {"type": "STRING", "description": "Region name in Ethiopia"},
                "nitrogen": {"type": "NUMBER", "description": "Nitrogen level in soil"},
                "phosphorus": {"type": "NUMBER", "description": "Phosphorus level in soil"},
                "potassium": {"type": "NUMBER", "description": "Potassium level in soil"},
                "ph": {"type": "NUMBER", "description": "Soil pH level"},
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
