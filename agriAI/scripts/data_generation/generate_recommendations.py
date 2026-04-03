import pandas as pd
import numpy as np

def generate_crop_recommendations(output_path, num_samples=1000):
    """
    Generates synthetic data for crop recommendations.
    """
    np.random.seed(42)
    
    data = {
        'nitrogen': np.random.randint(0, 150, num_samples),
        'phosphorus': np.random.randint(0, 150, num_samples),
        'potassium': np.random.randint(0, 150, num_samples),
        'temperature': np.random.uniform(10, 40, num_samples),
        'humidity': np.random.uniform(30, 100, num_samples),
        'ph': np.random.uniform(3, 10, num_samples),
        'rainfall': np.random.uniform(20, 300, num_samples),
        'crop': np.random.choice([
            'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas',
            'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate',
            'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple',
            'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee'
        ], num_samples)
    }
    
    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"Generated {num_samples} samples for crop recommendation at {output_path}")

if __name__ == "__main__":
    generate_crop_recommendations('data/synthetic/crop_recommendation_data.csv')
