"""Train the crop recommender on the cleaned crop recommendation dataset.

The saved artifact is a preprocessing pipeline with an XGBoost classifier, plus
the label encoder and training metadata. The pipeline handles the categorical
soil_color feature directly, so the API can accept raw request values without
manual encoding.
"""

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
    "nitrogen",
    "phosphorus",
    "potassium",
    "temperature",
    "humidity",
    "ph",
    "rainfall",
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

    if "black" in text:
        return "black"
    if "yellow" in text and "brown" in text:
        return "yellowish brown"
    if "reddish gray" in text or ("gray" in text and "red" in text):
        return "reddish gray"
    if "grayish brown" in text or ("gray" in text and "brown" in text):
        return "grayish brown"
    if "dark reddish brown" in text:
        return "dark reddish brown"
    if "red brown" in text or ("reddish" in text and "brown" in text):
        return "red brown"
    if "very dark brown" in text:
        return "very dark brown"
    if "dark brown" in text:
        return "dark brown"
    if "light brown" in text or "lightish brown" in text:
        return "light brown"
    if "dark gray" in text:
        return "dark gray"
    if "light red" in text:
        return "light red"
    if "gray" in text:
        return "gray"
    if "red" in text:
        return "red"
    if "brown" in text:
        return "brown"
    return "other"


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median"))]), NUMERIC_COLUMNS),
            (
                "cat",
                Pipeline(
                    [
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                    ]
                ),
                CATEGORICAL_COLUMNS,
            ),
        ]
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train the crop recommender XGBoost model.")
    parser.add_argument(
        "--data-path",
        default="data/processed/crop_recommendation_dataset.csv",
        help="Path to the cleaned crop recommendation dataset.",
    )
    parser.add_argument(
        "--model-output-dir",
        default="models/crop_recommender",
        help="Directory to save the trained model and metadata.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    data_path = Path(args.data_path)
    output_dir = Path(args.model_output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Loading data from {data_path}")
    data = pd.read_csv(data_path)
    required_columns = NUMERIC_COLUMNS + CATEGORICAL_COLUMNS + [TARGET_COLUMN]
    missing_columns = [column for column in required_columns if column not in data.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns in dataset: {missing_columns}")

    data = data.copy()
    data["soil_color"] = data["soil_color"].map(normalize_soil_color)
    data["crop_name"] = data["crop_name"].astype(str).str.strip().str.lower()

    X = data[NUMERIC_COLUMNS + CATEGORICAL_COLUMNS]
    y = data[TARGET_COLUMN]

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    stratify = y_encoded if pd.Series(y_encoded).value_counts().min() >= 2 else None
    X_train, X_valid, y_train, y_valid = train_test_split(
        X,
        y_encoded,
        test_size=0.2,
        random_state=42,
        stratify=stratify,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            (
                "model",
                xgb.XGBClassifier(
                    objective="multi:softprob",
                    num_class=len(label_encoder.classes_),
                    eval_metric="mlogloss",
                    tree_method="hist",
                    n_estimators=500,
                    max_depth=8,
                    learning_rate=0.05,
                    subsample=0.9,
                    colsample_bytree=0.9,
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )

    print("Training XGBoost pipeline...")
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_valid)
    accuracy = accuracy_score(y_valid, predictions)
    weighted_f1 = f1_score(y_valid, predictions, average="weighted")
    report = classification_report(
        y_valid,
        predictions,
        labels=list(range(len(label_encoder.classes_))),
        target_names=label_encoder.classes_,
        zero_division=0,
    )

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
        "soil_color_categories": sorted(data["soil_color"].dropna().unique().tolist()),
        "feature_notes": [
            "Numeric soil and climate features are passed through unchanged.",
            "soil_color is one-hot encoded inside the saved pipeline.",
            "The model returns top-3 crops through the API service.",
        ],
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    report_path = output_dir / "validation_report.txt"
    report_path.write_text(report, encoding="utf-8")

    print(f"Validation accuracy: {accuracy:.4f}")
    print(f"Weighted F1: {weighted_f1:.4f}")
    print(f"Saved metadata to {metadata_path}")
    print(f"Saved validation report to {report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
