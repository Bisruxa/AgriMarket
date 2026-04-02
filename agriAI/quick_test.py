from pathlib import Path
import json

from api.services.crop_recommender_service import CropRecommenderService


def main():
    model_file = Path("models/crop_recommender/xgboost_crop_recommender.json")
    encoder_file = Path("models/crop_recommender/label_encoder.joblib")

    if not model_file.exists() or not encoder_file.exists():
        print(f"Model or encoder not found. Run scripts/ml_service/train_crop_recommender.py first.")
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

    print("Running prediction with payload:\n", json.dumps(payload, indent=2))
    out = svc.predict(payload)
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
