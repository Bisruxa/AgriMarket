"""Train a PyTorch LSTM for crop price forecasting.

Usage
-----
    python scripts/ml_service/train_price_forecaster_lstm.py
    python scripts/ml_service/train_price_forecaster_lstm.py --epochs 100 --lr 0.001
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import torch
from torch.utils.data import DataLoader, TensorDataset

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.price_forecaster_lstm import (
    PriceForecasterLSTM,
    prepare_lstm_data,
    save_lstm_model,
)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Train LSTM crop price forecaster.")
    p.add_argument(
        "--data",
        default=str(PROJECT_ROOT / "data" / "processed" / "crop_price_history_v2.csv"),
        help="Path to the crop price CSV.",
    )
    p.add_argument(
        "--output-dir",
        default=str(PROJECT_ROOT / "models" / "price_forecaster_lstm"),
        help="Directory for model artifacts.",
    )
    p.add_argument(
        "--train-end-date", default="2023-12-31",
        help="Last date in the training split.",
    )
    p.add_argument("--seq-len", type=int, default=12,
                   help="Months of history per sample.")
    p.add_argument("--epochs", type=int, default=80,
                   help="Training epochs.")
    p.add_argument("--batch-size", type=int, default=256,
                   help="Mini-batch size.")
    p.add_argument("--lr", type=float, default=0.001,
                   help="Learning rate.")
    p.add_argument("--lstm-hidden", type=int, default=128,
                   help="LSTM hidden size.")
    p.add_argument("--lstm-layers", type=int, default=2,
                   help="LSTM layers.")
    p.add_argument("--dropout", type=float, default=0.2,
                   help="Dropout rate.")
    p.add_argument("--seed", type=int, default=42,
                   help="Random seed.")
    p.add_argument("--no-cuda", action="store_true",
                   help="Force CPU even if CUDA is available.")
    return p.parse_args()


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------


def main() -> int:
    args = parse_args()

    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    device = "cuda" if (torch.cuda.is_available() and not args.no_cuda) else "cpu"
    print(f"Device: {device}")

    # --- Data -----------------------------------------------------------
    print("Loading data …")
    bundle = prepare_lstm_data(
        csv_path=args.data,
        seq_len=args.seq_len,
        train_end_date=args.train_end_date,
    )
    print(f"  Train: {len(bundle.train_sequences):,} samples")
    print(f"  Valid: {len(bundle.valid_sequences):,} samples")

    train_ds = TensorDataset(
        torch.from_numpy(bundle.train_sequences),
        torch.from_numpy(bundle.train_crop_idx),
        torch.from_numpy(bundle.train_region_idx),
        torch.from_numpy(bundle.train_targets),
    )
    valid_ds = TensorDataset(
        torch.from_numpy(bundle.valid_sequences),
        torch.from_numpy(bundle.valid_crop_idx),
        torch.from_numpy(bundle.valid_region_idx),
        torch.from_numpy(bundle.valid_targets),
    )
    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)
    valid_loader = DataLoader(valid_ds, batch_size=args.batch_size, shuffle=False)

    # --- Model ----------------------------------------------------------
    model = PriceForecasterLSTM(
        num_crops=len(bundle.crop_to_idx),
        num_regions=len(bundle.region_to_idx),
        lstm_hidden=args.lstm_hidden,
        lstm_layers=args.lstm_layers,
        dropout=args.dropout,
    ).to(device)

    print(f"  Params: {sum(p.numel() for p in model.parameters()):,}")

    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode="min", factor=0.5, patience=8
    )
    criterion = torch.nn.MSELoss()

    # --- Train ----------------------------------------------------------
    best_loss = float("inf")
    best_state = None
    patience_counter = 0
    early_stop_patience = 15

    for epoch in range(1, args.epochs + 1):
        model.train()
        train_loss = 0.0
        for x_n, c_i, r_i, y in train_loader:
            x_n, c_i, r_i, y = (
                x_n.to(device), c_i.to(device), r_i.to(device), y.to(device)
            )
            optimizer.zero_grad()
            pred = model(x_n, c_i, r_i)
            loss = criterion(pred, y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * x_n.size(0)

        train_loss /= len(train_loader.dataset)  # type: ignore[operator]

        # Validation
        model.eval()
        valid_loss = 0.0
        all_preds, all_actuals = [], []
        with torch.no_grad():
            for x_n, c_i, r_i, y in valid_loader:
                x_n, c_i, r_i, y = (
                    x_n.to(device), c_i.to(device), r_i.to(device), y.to(device)
                )
                pred = model(x_n, c_i, r_i)
                loss = criterion(pred, y)
                valid_loss += loss.item() * x_n.size(0)
                all_preds.append(pred.cpu().numpy())
                all_actuals.append(y.cpu().numpy())

        valid_loss /= len(valid_loader.dataset)  # type: ignore[operator]
        scheduler.step(valid_loss)

        if epoch % 10 == 0 or epoch == 1:
            print(
                f"  Epoch {epoch:3d}/{args.epochs}  "
                f"train_loss={train_loss:.4f}  valid_loss={valid_loss:.4f}  "
                f"lr={optimizer.param_groups[0]['lr']:.2e}"
            )

        if valid_loss < best_loss:
            best_loss = valid_loss
            best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}
            patience_counter = 0
        else:
            patience_counter += 1

        if patience_counter >= early_stop_patience:
            print(f"  Early stopping at epoch {epoch}")
            break

    # Restore best weights
    model.load_state_dict(best_state)

    # --- Metrics --------------------------------------------------------
    all_preds_arr = np.concatenate(all_preds)
    all_actuals_arr = np.concatenate(all_actuals)
    errors = all_preds_arr - all_actuals_arr

    mae = float(np.mean(np.abs(errors)))
    rmse = float(np.sqrt(np.mean(np.square(errors))))
    denom = np.where(all_actuals_arr == 0, np.nan, np.abs(all_actuals_arr))
    mape = float(np.nanmean(np.abs(errors) / denom) * 100)

    metrics = {"mae": round(mae, 4), "rmse": round(rmse, 4), "mape": round(mape, 4)}

    # --- Save -----------------------------------------------------------
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    save_lstm_model(
        output_dir=output_dir,
        model=model,
        bundle=bundle,
        metrics=metrics,
        train_end_date=args.train_end_date,
        epochs=args.epochs,
        learning_rate=args.lr,
        batch_size=args.batch_size,
    )

    # Save per-sample validation predictions for analysis
    preds_df = _save_validation_predictions(
        output_dir, bundle, all_preds_arr, all_actuals_arr
    )

    print("\nTraining complete.")
    print(f"  Model:    {output_dir / 'lstm_price_forecaster.pt'}")
    print(f"  Metadata: {output_dir / 'lstm_training_metadata.json'}")
    print(f"  Preds:    {output_dir / 'lstm_validation_predictions.csv'}")
    print(f"  Metrics:  {json.dumps(metrics, indent=2)}")
    print(f"  Samples:  {len(preds_df):,}")
    return 0


def _save_validation_predictions(
    output_dir: Path,
    bundle,
    preds: np.ndarray,
    actuals: np.ndarray,
):
    import pandas as pd

    df = pd.DataFrame(
        {
            "year": bundle.valid_dates[:, 0],
            "month": bundle.valid_dates[:, 1],
            "crop_name": bundle.valid_crop_names,
            "region": bundle.valid_regions,
            "prediction": np.round(preds, 2),
            "actual": np.round(actuals, 2),
        }
    )
    df["error"] = (df["prediction"] - df["actual"]).round(2)
    df.to_csv(output_dir / "lstm_validation_predictions.csv", index=False)
    return df


if __name__ == "__main__":
    raise SystemExit(main())