"""Normalize soil_color values in the already-generated crop recommendation dataset.

This utility is a post-processing step for the processed CSVs that already exist
under agriAI/data/processed. It collapses noisy soil-color strings into a small,
realistic set of canonical categories, rewrites the scaled dataset, and refreshes
the metadata JSON with the updated soil-color distribution.
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from sklearn.preprocessing import StandardScaler


NUMERIC_COLUMNS = [
    "nitrogen",
    "phosphorus",
    "potassium",
    "temperature",
    "humidity",
    "ph",
    "rainfall",
]


def normalize_soil_color(value: object) -> str:
    if pd.isna(value):
        return "other"

    text = str(value).strip().lower()
    if not text:
        return "other"

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


def build_scaled_dataset(frame: pd.DataFrame) -> pd.DataFrame:
    numeric_scaler = StandardScaler()
    scaled_numeric = pd.DataFrame(
        numeric_scaler.fit_transform(frame[NUMERIC_COLUMNS]),
        columns=NUMERIC_COLUMNS,
        index=frame.index,
    )
    soil_one_hot = pd.get_dummies(frame["soil_color"], prefix="soil_color")
    return pd.concat([scaled_numeric, soil_one_hot, frame[["crop_name"]].reset_index(drop=True)], axis=1)


def main() -> int:
    root = Path(__file__).resolve().parents[2]
    processed_dir = root / "data" / "processed"

    dataset_path = processed_dir / "crop_recommendation_dataset.csv"
    scaled_path = processed_dir / "crop_recommendation_dataset_scaled.csv"
    metadata_path = processed_dir / "crop_recommendation_dataset_metadata.json"

    frame = pd.read_csv(dataset_path)
    frame["soil_color"] = frame["soil_color"].map(normalize_soil_color)
    frame["crop_name"] = frame["crop_name"].astype(str).str.strip().str.lower()
    frame = frame.drop_duplicates().reset_index(drop=True)
    frame.to_csv(dataset_path, index=False)

    build_scaled_dataset(frame).to_csv(scaled_path, index=False)

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    metadata["soil_color_distribution"] = frame["soil_color"].value_counts().sort_values(ascending=False).to_dict()
    metadata["soil_color_categories"] = sorted(frame["soil_color"].dropna().unique().tolist())
    metadata["final_rows"] = int(len(frame))
    metadata_path.write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Normalized {len(frame)} rows and refreshed scaled dataset + metadata at {processed_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())