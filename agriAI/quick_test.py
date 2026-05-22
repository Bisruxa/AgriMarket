from pathlib import Path
import json

from api.services.crop_recommender_service import CropRecommenderService
from api.services.price_forecaster_service import PriceForecasterService


def run_crop_recommender_test():
    model_file = Path("models/crop_recommender/xgboost_crop_recommender.json")
    encoder_file = Path("models/crop_recommender/label_encoder.joblib")

    if not model_file.exists() or not encoder_file.exists():
        print("[crop-recommender] Missing model or encoder.")
        print("Run: python .\\scripts\\ml_service\\train_crop_recommender.py")
        return None

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
    return result


def run_price_forecaster_test():
    model_path = Path("models/price_forecaster/xgboost_price_forecaster.json")
    metadata_path = Path("models/price_forecaster/training_metadata.json")
    data_path = Path("data/synthetic/crop_price_data.csv")

    missing = [p for p in [model_path, metadata_path, data_path] if not p.exists()]
    if missing:
        print("[price-forecaster] Missing required files:")
        for path in missing:
            print(f"- {path}")
        print("Run: python .\\scripts\\ml_service\\train_price_forecaster.py")
        return None

    svc = PriceForecasterService(
        model_path=str(model_path),
        metadata_path=str(metadata_path),
        data_path=str(data_path),
    )

    crops = svc.get_metadata().get("crops", [])
    if not crops:
        print("[price-forecaster] No crops in metadata.")
        return None

    crop = crops[0]
    crop_rows = svc.feature_frame[svc.feature_frame["Crop Name"] == crop]
    target_dates = crop_rows["target_date"].dropna().sort_values()

    if target_dates.empty:
        print("[price-forecaster] No target dates available for test payload.")
        return None

    # start_date = target_dates.iloc[0].date().isoformat()
    start_date = "2026-01-01"
    end_idx = min(3, len(target_dates) - 1)
    # end_date = target_dates.iloc[end_idx].date().isoformat()
    end_date = "2026-01-21"

    payload = {
        "crop": crop.lower(),
        "start_date": "2016-01-08",
        "end_date": "2016-02-05"
    }

    print("[price-forecaster] Payload:")
    print(json.dumps(payload, indent=2))

    predictions_df = svc.predict(payload)
    if predictions_df.empty:
        print("[price-forecaster] No predictions returned.")
        return []

    rows = []
    for idx, row in predictions_df.iterrows():
        rows.append({
            "date": idx.date().isoformat(),
            "price": float(row["prediction"]),
        })

    print("[price-forecaster] Result:")
    print(json.dumps(rows, indent=2))
    return rows


def main():
    run_crop_recommender_test()
    print("\n" + "-" * 60 + "\n")
    run_price_forecaster_test()


if __name__ == "__main__":
    main()
