"""Create a high-quality crop recommendation dataset for Ethiopian agriculture.

This script merges the Kaggle and Mendeley crop recommendation sources, imputes
missing soil color with a supervised classifier, augments the data to at least
20,000 records, and saves both original-scale and scaled training-ready
versions.

The script is designed to run without manual intervention once the input CSVs
are present. It is also tolerant of Windows-style paths when executed in WSL.
"""

from __future__ import annotations

import argparse
import json
import logging
import math
import warnings
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from imblearn.over_sampling import RandomOverSampler, SMOTE
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


LOGGER = logging.getLogger("crop_dataset_builder")

NUMERIC_COLUMNS = [
    "nitrogen",
    "phosphorus",
    "potassium",
    "temperature",
    "humidity",
    "ph",
    "rainfall",
]

TARGET_COLUMNS = NUMERIC_COLUMNS + ["soil_color", "crop_name"]

REALISTIC_RANGES = {
    "nitrogen": (0.0, 250.0),
    "phosphorus": (0.0, 250.0),
    "potassium": (0.0, 250.0),
    "temperature": (-5.0, 45.0),
    "humidity": (0.0, 100.0),
    "ph": (3.0, 10.0),
    "rainfall": (0.0, 4000.0),
}


@dataclass
class ImputationResult:
    model: str
    accuracy: float
    rows_imputed: int
    threshold: float


def configure_logging() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


def resolve_input_path(raw_path: str, fallback: Path | None = None) -> Path:
    """Resolve a user-provided path on both Windows and WSL."""

    path = Path(raw_path)
    if path.exists():
        return path

    if len(raw_path) >= 3 and raw_path[1:3] in (":/", ":\\"):
        drive_letter = raw_path[0].lower()
        remainder = raw_path[3:].replace("\\", "/")
        wsl_path = Path("/mnt") / drive_letter / remainder
        if wsl_path.exists():
            return wsl_path

    if fallback is not None and fallback.exists():
        return fallback

    raise FileNotFoundError(f"Could not resolve input path: {raw_path}")


def normalize_soil_color(value: object) -> object:
    if pd.isna(value):
        return np.nan
    text = str(value).strip().lower()
    if not text:
        return np.nan
    text = text.replace("_", " ").replace("-", " ")
    text = text.replace(";", " ")
    text = " ".join(text.split())

    # Correct common OCR / manual entry mistakes before canonicalizing.
    text = text.replace("reddis", "reddish").replace("redish", "reddish")
    text = text.replace("broown", "brown").replace("darkbrown", "dark brown").replace("lihgtish", "lightish")

    aliases = {
        "reddish brown": "red brown",
        "dark brown": "brown",
        "light brown": "brown",
        "yellow brown": "yellowish brown",
        "lightish brown": "brown",
        "black cotton vertisol": "black cotton",
        "black cotton soil": "black cotton",
        "dark greyish brown": "grayish brown",
        "dark grayish brown": "grayish brown",
        "grayish brown gb": "grayish brown",
        "very dark gray": "gray",
        "dark grayish": "gray",
        "red brown luvisols": "red brown",
        "replacement of inaccessible target red luvisols": "red",
        "reddish brown moist": "red brown",
    }

    text = aliases.get(text, text)

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


def approximate_relative_humidity(
    specific_humidity: pd.Series,
    temperature_c: pd.Series,
    pressure_pa: pd.Series | float,
) -> pd.Series:
    """Approximate relative humidity from specific humidity, temperature, and pressure.

    The Mendeley source exposes QV2M, which is commonly treated as specific humidity.
    If values are already on a relative scale, the result is still clipped to a valid
    0-100% range.
    """

    q = specific_humidity.astype(float).clip(lower=0.0)
    temp_c = temperature_c.astype(float)
    if isinstance(pressure_pa, pd.Series):
        pressure = pressure_pa.astype(float).fillna(101325.0)
    else:
        pressure = pd.Series(float(pressure_pa), index=q.index)

    pressure_hpa = pressure / 100.0
    vapor_pressure_hpa = (q * pressure_hpa) / (0.622 + (0.378 * q)).replace(0, np.nan)
    saturation_vapor_pressure_hpa = 6.112 * np.exp((17.67 * temp_c) / (temp_c + 243.5))
    relative_humidity = 100.0 * vapor_pressure_hpa / saturation_vapor_pressure_hpa
    return relative_humidity.clip(0.0, 100.0).fillna(50.0)


def seasonal_mean(frame: pd.DataFrame, prefix: str) -> pd.Series:
    cols = [col for col in frame.columns if col.startswith(prefix)]
    if not cols:
        return pd.Series(np.nan, index=frame.index)
    numeric = frame[cols].apply(pd.to_numeric, errors="coerce")
    return numeric.mean(axis=1)


def seasonal_sum(frame: pd.DataFrame, prefix: str) -> pd.Series:
    cols = [col for col in frame.columns if col.startswith(prefix)]
    if not cols:
        return pd.Series(np.nan, index=frame.index)
    numeric = frame[cols].apply(pd.to_numeric, errors="coerce")
    return numeric.sum(axis=1)


def load_kaggle_dataset(path: Path) -> pd.DataFrame:
    frame = pd.read_csv(path)
    rename_map = {
        "N": "nitrogen",
        "P": "phosphorus",
        "K": "potassium",
        "temperature": "temperature",
        "humidity": "humidity",
        "ph": "ph",
        "rainfall": "rainfall",
        "label": "crop_name",
    }
    frame = frame.rename(columns=rename_map)
    frame["soil_color"] = np.nan
    frame = frame[TARGET_COLUMNS]
    return coerce_numeric_columns(frame)


def load_mendeley_dataset(path: Path) -> pd.DataFrame:
    frame = pd.read_csv(path)

    output = pd.DataFrame(index=frame.index)
    output["nitrogen"] = pd.to_numeric(frame.get("N"), errors="coerce")
    output["phosphorus"] = pd.to_numeric(frame.get("P"), errors="coerce")
    output["potassium"] = pd.to_numeric(frame.get("K"), errors="coerce")
    output["ph"] = pd.to_numeric(frame.get("Ph"), errors="coerce")
    output["temperature"] = seasonal_mean(frame, "T2M_MAX-")

    qv2m_mean = seasonal_mean(frame, "QV2M-")
    pressure = pd.to_numeric(frame.get("PS"), errors="coerce") if "PS" in frame.columns else pd.Series(101325.0, index=frame.index)
    output["humidity"] = approximate_relative_humidity(qv2m_mean, output["temperature"], pressure)
    output["rainfall"] = seasonal_sum(frame, "PRECTOTCORR-")
    output["soil_color"] = frame.get("Soilcolor", pd.Series(index=frame.index, dtype="object")).map(normalize_soil_color)
    output["crop_name"] = frame.get("label", pd.Series(index=frame.index, dtype="object")).astype(str).str.strip()
    output = output[TARGET_COLUMNS]
    return coerce_numeric_columns(output)


def coerce_numeric_columns(frame: pd.DataFrame) -> pd.DataFrame:
    result = frame.copy()
    for column in NUMERIC_COLUMNS:
        result[column] = pd.to_numeric(result[column], errors="coerce")
    result["soil_color"] = result["soil_color"].map(normalize_soil_color)
    result["crop_name"] = result["crop_name"].astype(str).str.strip().str.lower()
    result.loc[result["crop_name"].isin({"", "nan", "none"}), "crop_name"] = np.nan
    return result


def merge_sources(kaggle_path: Path, mendeley_path: Path) -> pd.DataFrame:
    kaggle = load_kaggle_dataset(kaggle_path)
    mendeley = load_mendeley_dataset(mendeley_path)
    merged = pd.concat([kaggle, mendeley], ignore_index=True)
    merged = merged.dropna(subset=["crop_name"])
    return merged.reset_index(drop=True)


def build_imputation_pipeline() -> Pipeline:
    numeric_features = NUMERIC_COLUMNS
    categorical_features = ["crop_name"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median"))]), numeric_features),
            (
                "cat",
                Pipeline(
                    [
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                    ]
                ),
                categorical_features,
            ),
        ]
    )

    classifier = RandomForestClassifier(
        n_estimators=400,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced_subsample",
    )

    return Pipeline([("preprocessor", preprocessor), ("classifier", classifier)])


def impute_soil_color(frame: pd.DataFrame, threshold: float = 0.6) -> Tuple[pd.DataFrame, ImputationResult]:
    data = frame.copy()
    known_mask = data["soil_color"].notna()
    known_data = data.loc[known_mask].copy()
    missing_mask = ~known_mask

    if known_data.empty:
        raise ValueError("No soil_color values were found in the merged data, so imputation cannot proceed.")

    pipeline = build_imputation_pipeline()
    feature_frame = known_data[NUMERIC_COLUMNS + ["crop_name"]]
    target = known_data["soil_color"].astype(str)

    test_accuracy = float("nan")
    if len(known_data) >= 20 and target.nunique() >= 2:
        try:
            stratify = target if target.value_counts().min() >= 2 else None
            X_train, X_test, y_train, y_test = train_test_split(
                feature_frame,
                target,
                test_size=0.2,
                random_state=42,
                stratify=stratify,
            )
            pipeline.fit(X_train, y_train)
            y_pred = pipeline.predict(X_test)
            test_accuracy = accuracy_score(y_test, y_pred)
        except ValueError:
            pipeline.fit(feature_frame, target)
            test_accuracy = accuracy_score(target, pipeline.predict(feature_frame))
    else:
        pipeline.fit(feature_frame, target)
        test_accuracy = accuracy_score(target, pipeline.predict(feature_frame))

    pipeline.fit(feature_frame, target)

    if missing_mask.any():
        missing_features = data.loc[missing_mask, NUMERIC_COLUMNS + ["crop_name"]]
        probabilities = pipeline.predict_proba(missing_features)
        class_labels = pipeline.named_steps["classifier"].classes_
        best_indices = probabilities.argmax(axis=1)
        best_probabilities = probabilities.max(axis=1)
        predicted_labels = class_labels[best_indices]

        for row_index, probability, predicted in zip(data.index[missing_mask], best_probabilities, predicted_labels):
            if probability < threshold:
                LOGGER.warning(
                    "Low-confidence soil_color imputation for row %s: predicted '%s' with probability %.3f",
                    row_index,
                    predicted,
                    probability,
                )
            data.at[row_index, "soil_color"] = predicted

    data["soil_color"] = data["soil_color"].map(normalize_soil_color)
    data["soil_color"] = data["soil_color"].fillna("brown")
    data["soil_color"] = data["soil_color"].astype(str)

    result = ImputationResult(
        model="RandomForestClassifier",
        accuracy=float(test_accuracy),
        rows_imputed=int(missing_mask.sum()),
        threshold=threshold,
    )
    return data, result


def clip_ranges(frame: pd.DataFrame) -> pd.DataFrame:
    clipped = frame.copy()
    for column, (lower, upper) in REALISTIC_RANGES.items():
        clipped[column] = pd.to_numeric(clipped[column], errors="coerce").clip(lower=lower, upper=upper)

    clipped["temperature"] = clipped["temperature"].clip(lower=-5.0, upper=45.0)
    clipped["humidity"] = clipped["humidity"].clip(lower=0.0, upper=100.0)
    clipped["ph"] = clipped["ph"].clip(lower=3.0, upper=10.0)
    clipped["soil_color"] = clipped["soil_color"].map(normalize_soil_color)
    clipped["crop_name"] = clipped["crop_name"].astype(str).str.strip().str.lower()
    return clipped


def encode_for_smote(frame: pd.DataFrame) -> Tuple[pd.DataFrame, List[str], List[str]]:
    soil_dummies = pd.get_dummies(frame["soil_color"], prefix="soil_color")
    encoded = pd.concat([frame[NUMERIC_COLUMNS + ["crop_name"]].reset_index(drop=True), soil_dummies.reset_index(drop=True)], axis=1)
    soil_columns = list(soil_dummies.columns)
    feature_columns = list(encoded.columns)
    return encoded, feature_columns, soil_columns


def target_class_counts(current_counts: pd.Series, target_total: int) -> Dict[str, int]:
    current_total = int(current_counts.sum())
    multiplier = target_total / max(current_total, 1)
    desired = {label: max(int(count), int(round(count * multiplier))) for label, count in current_counts.items()}

    diff = target_total - sum(desired.values())
    if diff != 0:
        order = sorted(current_counts.index, key=lambda label: current_counts[label], reverse=(diff > 0))
        step = 1 if diff > 0 else -1
        remaining = abs(diff)
        pointer = 0
        while remaining > 0 and order:
            label = order[pointer % len(order)]
            if step < 0 and desired[label] <= current_counts[label]:
                pointer += 1
                if pointer > len(order) * 3:
                    break
                continue
            desired[label] += step
            remaining -= 1
            pointer += 1

    return {label: int(count) for label, count in desired.items()}


def add_gaussian_noise(frame: pd.DataFrame, synthetic_mask: np.ndarray) -> pd.DataFrame:
    noisy = frame.copy()
    if not synthetic_mask.any():
        return noisy

    numeric_std = noisy[NUMERIC_COLUMNS].std(ddof=0).replace(0, np.nan).fillna(0.0)
    for column in NUMERIC_COLUMNS:
        scale = 0.02 * float(numeric_std[column])
        if scale <= 0:
            continue
        noise = np.random.normal(0.0, scale, size=int(synthetic_mask.sum()))
        noisy.loc[synthetic_mask, column] = noisy.loc[synthetic_mask, column].astype(float) + noise
    return noisy


def decode_soil_color(encoded: pd.DataFrame, soil_columns: List[str]) -> pd.Series:
    soil_matrix = encoded[soil_columns].to_numpy(dtype=float)
    best_indices = soil_matrix.argmax(axis=1)
    labels = [soil_columns[index].replace("soil_color_", "") for index in best_indices]
    return pd.Series(labels, index=encoded.index, name="soil_color")


def top_up_dataset(frame: pd.DataFrame, target_total: int) -> pd.DataFrame:
    augmented = frame.copy().reset_index(drop=True)
    attempts = 0
    while len(augmented) < target_total and attempts < 3:
        remaining = target_total - len(augmented)
        sample = augmented.sample(n=remaining, replace=True, random_state=42 + attempts).reset_index(drop=True)
        sample = add_gaussian_noise(sample, np.ones(len(sample), dtype=bool))
        sample["soil_color"] = sample["soil_color"].map(normalize_soil_color).fillna("brown")
        sample = clip_ranges(sample)
        augmented = pd.concat([augmented, sample], ignore_index=True)
        augmented = augmented.drop_duplicates().reset_index(drop=True)
        attempts += 1

    if len(augmented) < target_total:
        warnings.warn(
            f"Top-up could only reach {len(augmented)} rows; the script will continue with the available data.",
            RuntimeWarning,
        )

    return augmented


def augment_dataset(frame: pd.DataFrame, target_total: int = 20_000) -> Tuple[pd.DataFrame, Dict[str, object]]:
    base = clip_ranges(frame).dropna(subset=["crop_name", "soil_color"]).reset_index(drop=True)
    if len(base) >= target_total:
        return base.drop_duplicates().reset_index(drop=True), {
            "method": "none",
            "original_rows": int(len(base)),
            "augmented_rows": 0,
            "target_total": target_total,
        }

    current_counts = base["crop_name"].value_counts().sort_index()
    if current_counts.size < 2:
        LOGGER.warning("Only one crop class is available; falling back to bootstrap augmentation instead of SMOTE.")
        final = top_up_dataset(base, target_total).drop_duplicates().reset_index(drop=True)
        metadata = {
            "method": "bootstrap + gaussian noise",
            "original_rows": int(len(base)),
            "augmented_rows": int(len(final) - len(base)),
            "target_total": int(target_total),
        }
        return final, metadata

    desired_total = max(target_total + 1000, int(math.ceil(target_total * 1.1)))
    sampling_strategy = target_class_counts(current_counts, desired_total)

    encoded, feature_columns, soil_columns = encode_for_smote(base)
    y = base["crop_name"].astype(str)

    min_class_size = int(current_counts.min())
    if min_class_size < 2:
        sampler = RandomOverSampler(sampling_strategy=sampling_strategy, random_state=42)
    else:
        sampler = SMOTE(
            sampling_strategy=sampling_strategy,
            random_state=42,
            k_neighbors=max(1, min(5, min_class_size - 1)),
        )

    resampled_x, resampled_y = sampler.fit_resample(encoded.drop(columns=["crop_name"]), y)
    resampled = pd.DataFrame(resampled_x, columns=[col for col in feature_columns if col != "crop_name"])
    resampled["crop_name"] = resampled_y.astype(str).str.lower().values

    synthetic_mask = np.zeros(len(resampled), dtype=bool)
    synthetic_mask[len(base) :] = True
    resampled = add_gaussian_noise(resampled, synthetic_mask)

    resampled[soil_columns] = resampled[soil_columns].clip(lower=0.0, upper=1.0)
    soil_color = decode_soil_color(resampled, soil_columns)
    final = resampled[NUMERIC_COLUMNS + ["crop_name"]].copy()
    final["soil_color"] = soil_color
    final = clip_ranges(final)
    final = final.drop_duplicates().reset_index(drop=True)

    if len(final) < target_total:
        LOGGER.warning(
            "Deduplication reduced the augmented set to %s rows; topping up with additional noisy bootstrap samples.",
            len(final),
        )
        final = top_up_dataset(final, target_total)

    metadata = {
        "method": "SMOTE + gaussian noise",
        "original_rows": int(len(base)),
        "augmented_rows": int(len(final) - len(base)),
        "target_total": int(target_total),
    }
    return final.drop_duplicates().reset_index(drop=True), metadata


def build_scaled_dataset(frame: pd.DataFrame) -> pd.DataFrame:
    numeric_scaler = StandardScaler()
    scaled_numeric = pd.DataFrame(
        numeric_scaler.fit_transform(frame[NUMERIC_COLUMNS]),
        columns=NUMERIC_COLUMNS,
        index=frame.index,
    )
    soil_one_hot = pd.get_dummies(frame["soil_color"], prefix="soil_color")
    scaled = pd.concat([scaled_numeric, soil_one_hot, frame[["crop_name"]].reset_index(drop=True)], axis=1)
    return scaled


def validate_dataset(frame: pd.DataFrame) -> Dict[str, object]:
    missing_counts = frame.isna().sum().to_dict()
    duplicates = int(frame.duplicated().sum())
    ranges = {
        column: {
            "min": float(frame[column].min()),
            "max": float(frame[column].max()),
        }
        for column in NUMERIC_COLUMNS
    }
    distribution = frame["crop_name"].value_counts().sort_values(ascending=False).to_dict()
    soil_colors = sorted(frame["soil_color"].dropna().astype(str).str.lower().unique().tolist())

    report = {
        "rows": int(len(frame)),
        "columns": list(frame.columns),
        "missing_values": missing_counts,
        "duplicate_rows": duplicates,
        "numeric_ranges": ranges,
        "crop_distribution": distribution,
        "soil_colors": soil_colors,
    }
    return report


def build_metadata(
    imputation: ImputationResult,
    augmentation_info: Dict[str, object],
    final_frame: pd.DataFrame,
) -> Dict[str, object]:
    return {
        "feature_descriptions": {
            "nitrogen": "Soil nitrogen level derived from the source datasets.",
            "phosphorus": "Soil phosphorus level derived from the source datasets.",
            "potassium": "Soil potassium level derived from the source datasets.",
            "temperature": "Annual average temperature in Celsius.",
            "humidity": "Average relative humidity in percent.",
            "ph": "Soil pH.",
            "rainfall": "Annual rainfall in millimeters.",
            "soil_color": "Categorical soil color inferred from source or imputed using Random Forest.",
            "crop_name": "Crop recommendation label.",
        },
        "imputation": asdict(imputation),
        "augmentation": augmentation_info,
        "realistic_range_constraints": REALISTIC_RANGES,
        "final_class_distribution": final_frame["crop_name"].value_counts().sort_values(ascending=False).to_dict(),
        "final_rows": int(len(final_frame)),
    }


def write_outputs(
    final_frame: pd.DataFrame,
    processed_dir: Path,
    metadata: Dict[str, object],
) -> Tuple[Path, Path, Path]:
    processed_dir.mkdir(parents=True, exist_ok=True)

    final_path = processed_dir / "crop_recommendation_dataset.csv"
    scaled_path = processed_dir / "crop_recommendation_dataset_scaled.csv"
    metadata_path = processed_dir / "crop_recommendation_dataset_metadata.json"

    final_frame.to_csv(final_path, index=False)
    build_scaled_dataset(final_frame).to_csv(scaled_path, index=False)

    with metadata_path.open("w", encoding="utf-8") as handle:
        json.dump(metadata, handle, indent=2, ensure_ascii=False)

    return final_path, scaled_path, metadata_path


def print_validation_report(report: Dict[str, object], imputation: ImputationResult, augmentation_info: Dict[str, object]) -> None:
    LOGGER.info("Validation report")
    LOGGER.info("Rows: %s", report["rows"])
    LOGGER.info("Duplicate rows: %s", report["duplicate_rows"])
    LOGGER.info("Soil-color imputation accuracy: %.4f", imputation.accuracy)
    LOGGER.info("Rows imputed: %s", imputation.rows_imputed)
    LOGGER.info("Augmentation method: %s", augmentation_info["method"])
    LOGGER.info("Crop distribution: %s", report["crop_distribution"])
    LOGGER.info("Soil colors: %s", report["soil_colors"])
    for column, bounds in report["numeric_ranges"].items():
        LOGGER.info("%s range: %.3f to %.3f", column, bounds["min"], bounds["max"])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create an Ethiopian crop recommendation dataset.")
    parser.add_argument(
        "--kaggle-path",
        default=r"C:/Users/kalfarm/.config/AgriMarket/agriAI/data/raw/Crop recommendation mini.csv",
        help="Path to the Kaggle crop recommendation CSV.",
    )
    parser.add_argument(
        "--mendeley-path",
        default=r"C:/Users/kalfarm/.config/AgriMarket/agriAI/data/raw/Crop Recommendation detailed.csv",
        help="Path to the Mendeley crop recommendation CSV.",
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Directory where processed outputs will be written. Defaults to agriAI/data/processed.",
    )
    parser.add_argument("--target-rows", type=int, default=20_000, help="Minimum number of final rows.")
    parser.add_argument("--imputation-threshold", type=float, default=0.6, help="Probability threshold for soil-color assignment.")
    return parser.parse_args()


def main() -> int:
    configure_logging()
    args = parse_args()

    script_path = Path(__file__).resolve()
    agri_root = script_path.parents[2]
    default_output = agri_root / "data" / "processed"

    kaggle_path = resolve_input_path(args.kaggle_path, fallback=agri_root / "data" / "raw" / "Crop recommendation mini.csv")
    mendeley_path = resolve_input_path(args.mendeley_path, fallback=agri_root / "data" / "raw" / "Crop Recommendation detailed.csv")
    output_dir = Path(args.output_dir) if args.output_dir else default_output

    LOGGER.info("Loading source datasets")
    merged = merge_sources(kaggle_path, mendeley_path)

    LOGGER.info("Imputing missing soil_color values")
    imputed, imputation = impute_soil_color(merged, threshold=args.imputation_threshold)

    LOGGER.info("Augmenting dataset to at least %s rows", args.target_rows)
    augmented, augmentation_info = augment_dataset(imputed, target_total=args.target_rows)

    augmented = clip_ranges(augmented)
    augmented["soil_color"] = augmented["soil_color"].map(normalize_soil_color).fillna("brown")
    augmented["crop_name"] = augmented["crop_name"].astype(str).str.strip().str.lower()
    augmented = augmented.drop_duplicates().reset_index(drop=True)

    if len(augmented) < args.target_rows:
        LOGGER.info("Performing final top-up to reach the requested minimum row count")
        augmented = top_up_dataset(augmented, args.target_rows)

    augmented = augmented.drop_duplicates().reset_index(drop=True)
    if augmented["soil_color"].isna().any():
        raise ValueError("Validation failed: soil_color still contains missing values after imputation.")

    report = validate_dataset(augmented)
    metadata = build_metadata(imputation, augmentation_info, augmented)
    final_path, scaled_path, metadata_path = write_outputs(augmented, output_dir, metadata)

    print_validation_report(report, imputation, augmentation_info)
    LOGGER.info("Saved final dataset to %s", final_path)
    LOGGER.info("Saved scaled dataset to %s", scaled_path)
    LOGGER.info("Saved metadata to %s", metadata_path)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())