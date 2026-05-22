from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import torch
import xgboost as xgb

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.price_forecaster import (
    load_price_data,
    prepare_training_data,
    regression_metrics,
    save_training_metadata,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train an XGBoost crop price forecaster.")
    parser.add_argument(
        "--data",
        default=str(PROJECT_ROOT / "data" / "synthetic" / "crop_price_data.csv"),
        help="Path to the crop price CSV file.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(PROJECT_ROOT / "models" / "price_forecaster"),
        help="Directory where the model artifacts will be written.",
    )
    parser.add_argument(
        "--train-end-date",
        default="2023-12-31",
        help="Last date included in the training split.",
    )
    parser.add_argument(
        "--forecast-horizon",
        type=int,
        default=1,
        help="Number of weeks ahead to predict.",
    )
    parser.add_argument("--num-round", type=int, default=300, help="Number of boosting rounds.")
    parser.add_argument("--eta", type=float, default=0.05, help="Learning rate.")
    parser.add_argument("--max-depth", type=int, default=6, help="Maximum tree depth.")
    parser.add_argument("--subsample", type=float, default=0.85, help="Row subsampling ratio.")
    parser.add_argument(
        "--colsample-bytree",
        type=float,
        default=0.85,
        help="Column subsampling ratio.",
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    price_data = load_price_data(args.data)
    dataset = prepare_training_data(
        price_data=price_data,
        train_end_date=args.train_end_date,
        forecast_horizon=args.forecast_horizon,
    )

    train_matrix = xgb.DMatrix(dataset.train_x, label=dataset.train_y, feature_names=dataset.feature_columns)
    valid_matrix = xgb.DMatrix(dataset.valid_x, label=dataset.valid_y, feature_names=dataset.feature_columns)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Training on device: {device}")

    params = {
        "objective": "reg:squarederror",
        "eval_metric": "rmse",
        "eta": args.eta,
        "max_depth": args.max_depth,
        "subsample": args.subsample,
        "colsample_bytree": args.colsample_bytree,
        "seed": args.seed,
        "tree_method": "hist",
        "device": device,
    }
    evaluation_sets = [(train_matrix, "train"), (valid_matrix, "valid")]
    booster = xgb.train(
        params=params,
        dtrain=train_matrix,
        num_boost_round=args.num_round,
        evals=evaluation_sets,
        verbose_eval=False,
    )

    predictions = booster.predict(valid_matrix)
    metrics = regression_metrics(dataset.valid_y.to_numpy(), predictions)

    model_path = output_dir / "xgboost_price_forecaster.json"
    metadata_path = output_dir / "training_metadata.json"
    predictions_path = output_dir / "validation_predictions.csv"

    booster.save_model(model_path)
    save_training_metadata(
        output_path=metadata_path,
        metrics=metrics,
        feature_columns=dataset.feature_columns,
        train_rows=dataset.train_rows,
        valid_rows=dataset.valid_rows,
        feature_notes=dataset.feature_notes,
        train_end_date=args.train_end_date,
        forecast_horizon=args.forecast_horizon,
        crops=price_data["Crop Name"].unique().tolist(),
    )

    dataset.valid_context["prediction"] = predictions
    dataset.valid_context.to_csv(predictions_path, index=False)

    print("Training complete.")
    print(f"Model saved to: {model_path}")
    print(f"Metadata saved to: {metadata_path}")
    print(f"Validation predictions saved to: {predictions_path}")
    print("Validation metrics:")
    print(json.dumps(metrics, indent=2))
    print("Feature notes:")
    for note in dataset.feature_notes:
        print(f"- {note}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
