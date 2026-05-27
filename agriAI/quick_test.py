from pathlib import Path
import json
import sys

from api.services.crop_recommender_service import CropRecommenderService
from api.services.price_forecaster_service import PriceForecasterService


def run_crop_recommender_test() -> None:
    model_file = Path("models/crop_recommender/xgboost_crop_recommender.json")
    encoder_file = Path("models/crop_recommender/label_encoder.joblib")

    if not model_file.exists() or not encoder_file.exists():
        print("[crop-recommender] Missing model or encoder.")
        print("Run: python scripts/ml_service/train_crop_recommender.py")
        return

    svc = CropRecommenderService(model_path=str(model_file), encoder_path=str(encoder_file))
    payload = {
        "nitrogen": 50,
        "phosphorus": 30,
        "potassium": 20,
        "temperature": 25.0,
        "humidity": 60.0,
        "ph": 6.5,
        "rainfall": 100.0,
    }

    print("[crop-recommender] Payload:")
    print(json.dumps(payload, indent=2))
    result = svc.predict(payload)
    print("[crop-recommender] Result:")
    print(json.dumps(result, indent=2))


def run_price_forecaster_test() -> None:
    model_path = Path("models/price_forecaster/xgboost_price_forecaster.json")
    metadata_path = Path("models/price_forecaster/training_metadata.json")
    data_path = Path("data/processed/crop_price_history_v2.csv")

    missing = [p for p in [model_path, metadata_path, data_path] if not p.exists()]
    if missing:
        print("[price-forecaster] Missing required files:")
        for path in missing:
            print(f"  - {path}")
        print("Run: python scripts/data_generation/generate_prices.py")
        print("Then: python scripts/ml_service/train_price_forecaster.py")
        return

    print("[price-forecaster] Loading service …")
    svc = PriceForecasterService.from_env()

    metadata = svc.get_metadata()
    crops = metadata.get("crops", [])
    regions = metadata.get("regions", [])
    print(f"[price-forecaster] Loaded — {len(crops)} crops, {len(regions)} regions, "
          f"RMSE={metadata.get('validation_rmse', '?')}")

    # --- Historical forecast (data exists in 2024) -----------------------
    print("\n── Historical forecast ──")
    payload_hist = {
        "crop_name": crops[0],
        "region": regions[0],
        "year": 2024,
        "month": 6,
    }
    print(json.dumps(payload_hist, indent=2))
    result = svc.predict(payload_hist)
    print(json.dumps(_result_to_dict(result), indent=2))

    # --- Future forecast (recursive) -------------------------------------
    print("\n── Future (recursive) forecast ──")
    payload_future = {
        "crop_name": "Teff (white)",
        "region": "Oromia",
        "year": 2026,
        "month": 10,
    }
    print(json.dumps(payload_future, indent=2))
    try:
        result = svc.predict(payload_future)
        print(json.dumps(_result_to_dict(result), indent=2))
    except Exception as exc:
        print(f"  ⚠  {exc}")


def _result_to_dict(result) -> dict:
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


def main() -> None:
    run_crop_recommender_test()
    print("\n" + "─" * 60 + "\n")
    run_price_forecaster_test()


if __name__ == "__main__":
    main()