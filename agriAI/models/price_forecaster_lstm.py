"""LSTM price forecasting model.

Architecture
------------
Per-timestep features (4 numeric):
    price_per_kg (scaled), month_sin, month_cos, inflation_index (scaled)
Static embeddings:
    crop_name → 8-dim, region → 4-dim
Sequence:
    2-layer LSTM (hidden=128) → FC head (64 → 1)
Training:
    sequence-to-one — 12-month window predicts month 13.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import StandardScaler


# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------


@dataclass
class LSTMDataBundle:
    train_sequences: np.ndarray       # (N, seq_len, 4)
    train_crop_idx: np.ndarray        # (N,)
    train_region_idx: np.ndarray      # (N,)
    train_targets: np.ndarray         # (N,)
    valid_sequences: np.ndarray
    valid_crop_idx: np.ndarray
    valid_region_idx: np.ndarray
    valid_targets: np.ndarray
    valid_dates: np.ndarray           # (N, 2) — (year, month)
    valid_crop_names: list[str]
    valid_regions: list[str]
    crop_to_idx: dict[str, int]
    region_to_idx: dict[str, int]
    price_scaler: StandardScaler
    inflation_scaler: StandardScaler
    seq_len: int
    metrics: dict[str, float]
    feature_notes: list[str]


# ---------------------------------------------------------------------------
# PyTorch model
# ---------------------------------------------------------------------------


class PriceForecasterLSTM(nn.Module):
    """LSTM that predicts the next-month price from a 12-month window."""

    def __init__(
        self,
        num_crops: int,
        num_regions: int,
        crop_embedding_dim: int = 8,
        region_embedding_dim: int = 4,
        lstm_hidden: int = 128,
        lstm_layers: int = 2,
        dropout: float = 0.2,
    ):
        super().__init__()
        self.crop_embedding = nn.Embedding(num_crops, crop_embedding_dim)
        self.region_embedding = nn.Embedding(num_regions, region_embedding_dim)

        input_dim = 4 + crop_embedding_dim + region_embedding_dim
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=lstm_hidden,
            num_layers=lstm_layers,
            batch_first=True,
            dropout=dropout if lstm_layers > 1 else 0.0,
        )
        self.fc = nn.Sequential(
            nn.Linear(lstm_hidden, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 1),
        )

    def forward(
        self,
        x_numeric: torch.Tensor,
        crop_idx: torch.Tensor,
        region_idx: torch.Tensor,
    ) -> torch.Tensor:
        batch_size, seq_len, _ = x_numeric.shape

        crop_emb = self.crop_embedding(crop_idx)
        region_emb = self.region_embedding(region_idx)

        crop_emb = crop_emb.unsqueeze(1).expand(batch_size, seq_len, -1)
        region_emb = region_emb.unsqueeze(1).expand(batch_size, seq_len, -1)

        combined = torch.cat([x_numeric, crop_emb, region_emb], dim=-1)
        lstm_out, _ = self.lstm(combined)
        last = lstm_out[:, -1, :]

        return self.fc(last).squeeze(-1)


# ---------------------------------------------------------------------------
# Data preparation
# ---------------------------------------------------------------------------


def prepare_lstm_data(
    csv_path: str | Path,
    seq_len: int = 12,
    train_end_date: str = "2023-12-31",
) -> LSTMDataBundle:
    """Build sliding-window sequences from the price CSV.

    Each sample: *seq_len* months of one (crop, region) → price at month +1.
    Features are split by *train_end_date*.
    """
    df = pd.read_csv(csv_path)
    df = df.sort_values(["crop_name", "region", "year", "month"]).reset_index(drop=True)
    df = df.dropna(
        subset=["price_per_kg", "inflation_index", "lag_1m", "lag_3m",
                "lag_6m", "lag_12m", "rolling_3m_avg"]
    )

    crops = sorted(df["crop_name"].unique())
    regions = sorted(df["region"].unique())
    crop_to_idx = {c: i for i, c in enumerate(crops)}
    region_to_idx = {r: i for i, r in enumerate(regions)}

    df["month_sin"] = np.sin(2 * math.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * math.pi * df["month"] / 12)

    price_scaler = StandardScaler()
    inflation_scaler = StandardScaler()
    df["price_scaled"] = price_scaler.fit_transform(df[["price_per_kg"]])
    df["inflation_scaled"] = inflation_scaler.fit_transform(df[["inflation_index"]])

    feature_cols = ["price_scaled", "month_sin", "month_cos", "inflation_scaled"]
    train_cutoff = pd.Timestamp(train_end_date)

    (train_seq, train_crop, train_reg, train_tgt,
     valid_seq, valid_crop, valid_reg, valid_tgt,
     valid_dates, valid_crop_names, valid_region_names) = _build_all_sequences(
        df, feature_cols, crop_to_idx, region_to_idx, seq_len, train_cutoff
    )

    if len(train_seq) == 0 or len(valid_seq) == 0:
        raise ValueError(
            "Time-based split produced empty train or valid set. "
            "Adjust --train-end-date or --seq-len."
        )

    def _n(arr):
        return np.array(arr, dtype=np.float32)

    metrics = {"rmse": 0.0, "mae": 0.0, "mape": 0.0}

    feature_notes = [
        f"LSTM trained on {len(crops)} crops × {len(regions)} regions "
        f"({len(train_seq):,} train / {len(valid_seq):,} valid samples).",
        f"Each sample is a {seq_len}-month price sequence → next-month price.",
        "Month encoded cyclically (sin/cos) so December→January is continuous.",
        "Accuracy improves with more data; synthetic shocks are not features.",
    ]

    return LSTMDataBundle(
        train_sequences=_n(train_seq),
        train_crop_idx=np.array(train_crop, dtype=np.int64),
        train_region_idx=np.array(train_reg, dtype=np.int64),
        train_targets=_n(train_tgt),
        valid_sequences=_n(valid_seq),
        valid_crop_idx=np.array(valid_crop, dtype=np.int64),
        valid_region_idx=np.array(valid_reg, dtype=np.int64),
        valid_targets=_n(valid_tgt),
        valid_dates=np.array(valid_dates, dtype=np.int64),
        valid_crop_names=valid_crop_names,
        valid_regions=valid_region_names,
        crop_to_idx=crop_to_idx,
        region_to_idx=region_to_idx,
        price_scaler=price_scaler,
        inflation_scaler=inflation_scaler,
        seq_len=seq_len,
        metrics=metrics,
        feature_notes=feature_notes,
    )


def _build_all_sequences(
    df: pd.DataFrame,
    feature_cols: list[str],
    crop_to_idx: dict[str, int],
    region_to_idx: dict[str, int],
    seq_len: int,
    train_cutoff: pd.Timestamp,
):
    train_seq, train_crop, train_reg, train_tgt = [], [], [], []
    valid_seq, valid_crop, valid_reg, valid_tgt = [], [], [], []
    valid_dates, valid_crop_names, valid_region_names = [], [], []

    for (_crop_name, _region), group in df.groupby(["crop_name", "region"]):
        group = group.sort_values(["year", "month"])
        values = group[feature_cols].values
        dates = group[["year", "month"]].values
        targets = group["price_per_kg"].values

        c_idx = crop_to_idx[group["crop_name"].iloc[0]]
        r_idx = region_to_idx[group["region"].iloc[0]]

        for i in range(len(values) - seq_len):
            d = pd.Timestamp(year=int(dates[i + seq_len][0]),
                             month=int(dates[i + seq_len][1]), day=1)
            seq = values[i : i + seq_len]
            tgt = targets[i + seq_len]

            if d <= train_cutoff:
                train_seq.append(seq)
                train_crop.append(c_idx)
                train_reg.append(r_idx)
                train_tgt.append(tgt)
            else:
                valid_seq.append(seq)
                valid_crop.append(c_idx)
                valid_reg.append(r_idx)
                valid_tgt.append(tgt)
                valid_dates.append(dates[i + seq_len])
                valid_crop_names.append(group["crop_name"].iloc[0])
                valid_region_names.append(group["region"].iloc[0])

    return (train_seq, train_crop, train_reg, train_tgt,
            valid_seq, valid_crop, valid_reg, valid_tgt,
            valid_dates, valid_crop_names, valid_region_names)


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------


def save_lstm_model(
    output_dir: str | Path,
    model: nn.Module,
    bundle: LSTMDataBundle,
    metrics: dict[str, float],
    train_end_date: str,
    epochs: int,
    learning_rate: float,
    batch_size: int,
) -> None:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    torch.save(
        {
            "model_state_dict": model.state_dict(),
            "price_scaler_mean": bundle.price_scaler.mean_.tolist(),
            "price_scaler_scale": bundle.price_scaler.scale_.tolist(),
            "inflation_scaler_mean": bundle.inflation_scaler.mean_.tolist(),
            "inflation_scaler_scale": bundle.inflation_scaler.scale_.tolist(),
        },
        out / "lstm_price_forecaster.pt",
    )

    metadata = {
        "model_type": "lstm",
        "crops": sorted(bundle.crop_to_idx.keys()),
        "regions": sorted(bundle.region_to_idx.keys()),
        "crop_to_idx": bundle.crop_to_idx,
        "region_to_idx": bundle.region_to_idx,
        "seq_len": bundle.seq_len,
        "lstm_hidden": model.lstm.hidden_size,
        "lstm_layers": model.lstm.num_layers,
        "metrics": metrics,
        "train_end_date": train_end_date,
        "training": {
            "epochs": epochs,
            "learning_rate": learning_rate,
            "batch_size": batch_size,
        },
        "feature_notes": bundle.feature_notes,
    }
    (out / "lstm_training_metadata.json").write_text(
        json.dumps(metadata, indent=2), encoding="utf-8"
    )


def load_lstm_model(
    model_dir: str | Path, device: str = "cpu"
) -> tuple[nn.Module, dict]:
    model_dir = Path(model_dir)
    metadata_path = model_dir / "lstm_training_metadata.json"
    weights_path = model_dir / "lstm_price_forecaster.pt"

    if not metadata_path.exists():
        raise FileNotFoundError(f"Missing metadata: {metadata_path}")
    if not weights_path.exists():
        raise FileNotFoundError(f"Missing weights: {weights_path}")

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    checkpoint = torch.load(weights_path, map_location=device, weights_only=True)

    sd = checkpoint["model_state_dict"]
    lstm_hidden = sd["lstm.weight_hh_l0"].shape[1]
    n_layers = sum(1 for k in sd if k.startswith("lstm.weight_ih_l"))
    lstm_layers = n_layers if n_layers > 0 else 2

    model = PriceForecasterLSTM(
        num_crops=len(metadata["crops"]),
        num_regions=len(metadata["regions"]),
        lstm_hidden=lstm_hidden,
        lstm_layers=lstm_layers,
    )
    model.load_state_dict(sd)
    model.to(device)
    model.eval()

    metadata["lstm_hidden"] = lstm_hidden
    metadata["lstm_layers"] = lstm_layers
    metadata["price_scaler_mean"] = checkpoint.get("price_scaler_mean", [0.0])
    metadata["price_scaler_scale"] = checkpoint.get("price_scaler_scale", [1.0])
    metadata["inflation_scaler_mean"] = checkpoint.get("inflation_scaler_mean", [0.0])
    metadata["inflation_scaler_scale"] = checkpoint.get("inflation_scaler_scale", [1.0])

    return model, metadata


# ---------------------------------------------------------------------------
# Inference helpers
# ---------------------------------------------------------------------------


def build_lstm_input_tensor(
    price_sequence: list[float],
    months: list[tuple[int, int]],
    inflation_indices: list[float],
    crop_idx: int,
    region_idx: int,
    price_scaler: StandardScaler,
    inflation_scaler: StandardScaler,
    seq_len: int,
    device: str = "cpu",
) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
    if len(price_sequence) != seq_len:
        raise ValueError(
            f"price_sequence length {len(price_sequence)} != seq_len {seq_len}"
        )

    x = np.zeros((seq_len, 4), dtype=np.float32)
    for i, ((_y, m), price, infl) in enumerate(
        zip(months, price_sequence, inflation_indices)
    ):
        x[i, 0] = price_scaler.transform([[price]])[0, 0]
        x[i, 1] = math.sin(2 * math.pi * m / 12)
        x[i, 2] = math.cos(2 * math.pi * m / 12)
        x[i, 3] = inflation_scaler.transform([[infl]])[0, 0]

    x_t = torch.from_numpy(x).unsqueeze(0).to(device)
    c_t = torch.tensor([crop_idx], dtype=torch.long, device=device)
    r_t = torch.tensor([region_idx], dtype=torch.long, device=device)
    return x_t, c_t, r_t


def predict_single(
    model: nn.Module,
    price_sequence: list[float],
    months: list[tuple[int, int]],
    inflation_indices: list[float],
    crop_idx: int,
    region_idx: int,
    price_scaler: StandardScaler,
    inflation_scaler: StandardScaler,
    seq_len: int,
    device: str = "cpu",
) -> float:
    x_t, c_t, r_t = build_lstm_input_tensor(
        price_sequence, months, inflation_indices,
        crop_idx, region_idx, price_scaler, inflation_scaler,
        seq_len, device,
    )
    with torch.no_grad():
        return float(model(x_t, c_t, r_t).item())


def calculate_trend(
    predicted_price: float,
    reference_price: float,
    threshold: float = 2.0,
) -> tuple[str, float]:
    if reference_price <= 0:
        return ("stable", 0.0)
    pct = ((predicted_price - reference_price) / reference_price) * 100
    if pct > threshold:
        return ("increasing", round(pct, 1))
    elif pct < -threshold:
        return ("decreasing", round(pct, 1))
    return ("stable", round(pct, 1))