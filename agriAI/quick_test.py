from pathlib import Path
import json

from api.services.crop_recommender_service import CropRecommenderService


def main():
    data_file = Path("data/synthetic/crop_recommendation_data.csv")
    if not data_file.exists():
        print(f"{data_file} not found. Run scripts/data_generation/generate_recommendations.py first.")
        return

    svc = CropRecommenderService(model_path=":memory:", data_path=str(data_file))
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
