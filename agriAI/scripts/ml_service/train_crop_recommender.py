import os
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

def train_and_save_model(data_path, model_output_dir):
    """
    Trains a crop recommendation model and saves it to a file.
    """
    print("Loading data...")
    data = pd.read_csv(data_path)

    print("Preparing data...")
    X = data.drop("crop", axis=1)
    y = data["crop"]

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    X_train, _, y_train, _ = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42
    )

    print("Training XGBoost model...")
    model = xgb.XGBClassifier(
        objective="multi:softprob",
        num_class=len(label_encoder.classes_),
        eval_metric="mlogloss",
        # Add GPU support if available
        # tree_method='hist',
        # device='cuda'
    )
    model.fit(X_train, y_train)

    os.makedirs(model_output_dir, exist_ok=True)
    
    model_path = os.path.join(model_output_dir, "xgboost_crop_recommender.json")
    encoder_path = os.path.join(model_output_dir, "label_encoder.joblib")

    print(f"Saving model to {model_path}")
    model.save_model(model_path)

    print(f"Saving label encoder to {encoder_path}")
    joblib.dump(label_encoder, encoder_path)

    print("Model and encoder saved successfully.")

if __name__ == "__main__":
    train_and_save_model(
        "data/synthetic/crop_recommendation_data.csv",
        "models/crop_recommender"
    )
