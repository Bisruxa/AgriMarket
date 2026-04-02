from pathlib import Path
import json
import pandas as pd

from api.services.price_forecaster_service import PriceForecasterService

def main():
    """
    Runs a quick, local test for the PriceForecasterService.
    """
    model_dir = Path("models/price_forecaster")
    data_dir = Path("data/synthetic")

    model_path = model_dir / "xgboost_price_forecaster.json"
    metadata_path = model_dir / "training_metadata.json"
    data_path = data_dir / "crop_price_data.csv"

    # --- Validation ---
    for p in [model_path, metadata_path, data_path]:
        if not p.exists():
            print(f"Error: Required file not found at {p}")
            print("Please ensure you have run the training script first:")
            print("python .\\scripts\\ml_service\\train_price_forecaster.py")
            return
    # ------------------

    print("Loading PriceForecasterService with pre-trained model...")
    svc = PriceForecasterService(
        model_path=str(model_path),
        metadata_path=str(metadata_path),
        data_path=str(data_path),
    )

    test_crop = svc.get_metadata().get("crops", ["Maize"])[0]
    crop_rows = svc.feature_frame[svc.feature_frame["Crop Name"] == test_crop]
    target_dates = crop_rows["target_date"].dropna().sort_values()
    if target_dates.empty:
        print("No valid target dates found for testing.")
        return

    start_date = target_dates.iloc[0]
    end_date = min(target_dates.iloc[-1], start_date + pd.Timedelta(days=28))

    payload = {
        "crop": test_crop.lower(),
        "start_date": start_date.date().isoformat(),
        "end_date": end_date.date().isoformat(),
    }

    print("\nRunning prediction with payload:\n", json.dumps(payload, indent=2))
    
    try:
        predictions_df = svc.predict(payload)
        
        if predictions_df.empty:
            print("\nNo predictions were generated. The date range might be out of bounds for the feature engineering.")
            return

        # Convert DataFrame to a more readable JSON format for printing
        predictions_df.index = predictions_df.index.strftime('%Y-%m-%d')
        result_json = predictions_df.rename(columns={'prediction': 'price'}).to_json(orient='table', indent=2)
        
        print("\nPrediction Result:")
        print(result_json)

    except ValueError as e:
        print(f"\nAn error occurred during prediction: {e}")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")


if __name__ == "__main__":
    main()
