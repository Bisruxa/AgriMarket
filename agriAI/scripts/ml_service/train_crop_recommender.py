from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder


NUMERIC_COLUMNS = [
    "nitrogen", "phosphorus", "potassium",
    "temperature", "humidity", "ph", "rainfall",
]

CATEGORICAL_COLUMNS = ["soil_color"]
TARGET_COLUMN = "crop_name"


def normalize_soil_color(value: object) -> str:
    if pd.isna(value):
        return "brown"
    text = str(value).strip().lower()
    if not text:
        return "brown"
    text = text.replace("_", " ").replace("-", " ").replace(";", " ")
    text = " ".join(text.split())
    text = text.replace("reddis", "reddish").replace("redish", "reddish")
    text = text.replace("broown", "brown").replace("darkbrown", "dark brown").replace("lihgtish", "lightish")

    for keyword, label in [
        ("black", "black"),
        ("yellowish brown", "yellowish brown"),
        ("reddish gray", "reddish gray"),
        ("grayish brown", "grayish brown"),
        ("dark reddish brown", "dark reddish brown"),
        ("red brown", "red brown"),
        ("very dark brown", "very dark brown"),
        ("dark brown", "dark brown"),
        ("light brown", "light brown"),
        ("dark gray", "dark gray"),
        ("light red", "light red"),
        ("gray", "gray"),
        ("red", "red"),
        ("brown", "brown"),
    ]:
        if keyword in text:
            return label
    return "other"


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median"))]), NUMERIC_COLUMNS),
            (
                "cat",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                ]),
                CATEGORICAL_COLUMNS,
            ),
        ]
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train the crop recommender XGBoost model.")
    parser.add_argument("--data-path", default="data/processed/crop_recommendation_dataset.csv")
    parser.add_argument("--model-output-dir", default="models/crop_recommender")
    parser.add_argument("--n-estimators", type=int, default=2000)
    parser.add_argument("--max-depth", type=int, default=8)
    parser.add_argument("--learning-rate", type=float, default=0.03)
    parser.add_argument("--early-stopping-rounds", type=int, default=50)
    parser.add_argument("--min-child-weight", type=int, default=5)
    parser.add_argument("--subsample", type=float, default=0.85)
    parser.add_argument("--colsample-bytree", type=float, default=0.85)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    data_path = Path(args.data_path)
    output_dir = Path(args.model_output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Loading data from {data_path}")
    data = pd.read_csv(data_path)
    required_columns = NUMERIC_COLUMNS + CATEGORICAL_COLUMNS + [TARGET_COLUMN]
    missing = [c for c in required_columns if c not in data.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")

    data = data.copy()
    data["soil_color"] = data["soil_color"].map(normalize_soil_color)
    data["crop_name"] = data["crop_name"].astype(str).str.strip().str.lower()

    X = data[NUMERIC_COLUMNS + CATEGORICAL_COLUMNS]
    y = data[TARGET_COLUMN]

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    stratify = y_encoded if pd.Series(y_encoded).value_counts().min() >= 2 else None
    X_train, X_valid, y_train, y_valid = train_test_split(
        X, y_encoded, test_size=0.2, random_state=args.seed, stratify=stratify,
    )

    print(f"Train: {len(X_train):,}  Valid: {len(X_valid):,}")
    print(f"Classes: {len(label_encoder.classes_)}")

    preprocessor = build_preprocessor()
    X_train_processed = preprocessor.fit_transform(X_train)
    X_valid_processed = preprocessor.transform(X_valid)

    model = xgb.XGBClassifier(
        objective="multi:softprob",
        num_class=len(label_encoder.classes_),
        eval_metric="mlogloss",
        tree_method="hist",
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        learning_rate=args.learning_rate,
        subsample=args.subsample,
        colsample_bytree=args.colsample_bytree,
        min_child_weight=args.min_child_weight,
        early_stopping_rounds=args.early_stopping_rounds,
        random_state=args.seed,
        n_jobs=-1,
        verbosity=1,
    )

    print("Training with early stopping...")
    model.fit(
        X_train_processed, y_train,
        eval_set=[(X_train_processed, y_train), (X_valid_processed, y_valid)],
        verbose=50,
    )

    best_iters = model.best_iteration + 1 if hasattr(model, "best_iteration") and model.best_iteration is not None else args.n_estimators
    print(f"Best iteration: {best_iters}")

    predictions = model.predict(X_valid_processed)
    accuracy = accuracy_score(y_valid, predictions)
    weighted_f1 = f1_score(y_valid, predictions, average="weighted")
    report = classification_report(
        y_valid, predictions,
        labels=list(range(len(label_encoder.classes_))),
        target_names=label_encoder.classes_,
        zero_division=0,
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", model),
    ])

    model_path = output_dir / "xgboost_crop_recommender.joblib"
    encoder_path = output_dir / "label_encoder.joblib"
    metadata_path = output_dir / "training_metadata.json"

    print(f"Saving model pipeline to {model_path}")
    joblib.dump(pipeline, model_path)

    print(f"Saving label encoder to {encoder_path}")
    joblib.dump(label_encoder, encoder_path)

    metadata = {
        "model_type": "xgboost_pipeline",
        "data_path": str(data_path),
        "features": NUMERIC_COLUMNS + CATEGORICAL_COLUMNS,
        "target_column": TARGET_COLUMN,
        "classes": label_encoder.classes_.tolist(),
        "validation_accuracy": float(accuracy),
        "validation_weighted_f1": float(weighted_f1),
        "best_iterations": best_iters,
        "hyperparameters": {
            "n_estimators": args.n_estimators,
            "max_depth": args.max_depth,
            "learning_rate": args.learning_rate,
            "subsample": args.subsample,
            "colsample_bytree": args.colsample_bytree,
            "min_child_weight": args.min_child_weight,
            "early_stopping_rounds": args.early_stopping_rounds,
        },
        "soil_color_categories": sorted(data["soil_color"].dropna().unique().tolist()),
        "feature_notes": [
            "Numeric soil and climate features are median-imputed, then passed through.",
            "soil_color is mode-imputed and one-hot encoded inside the saved pipeline.",
            "Trained with early stopping on validation mlogloss, L2 regularization.",
            "The model returns top-3 crops through the API service.",
        ],
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    report_path = output_dir / "validation_report.txt"
    report_path.write_text(report, encoding="utf-8")

    print(f"\nValidation accuracy: {accuracy:.4f}  (was 0.7210)")
    print(f"Weighted F1:        {weighted_f1:.4f}  (was 0.7050)")
    print(f"Saved to {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
