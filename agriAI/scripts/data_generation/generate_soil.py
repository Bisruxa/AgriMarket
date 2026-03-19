import pandas as pd
import numpy as np
import os

OUTPUT_DIR = '../../data/synthetic'
OUTPUT_FILE = 'soil_quality_data.csv'
NUM_SAMPLES_PER_REGION = 1000

REGIONS = ['Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Somali', 'Afar', 'Sidama', 'Gambela']
SOIL_TYPES = ['Clay', 'Loam', 'Sandy', 'Silt', 'Vertisol']

def generate_soil():
    data = []
    
    os.makedirs(os.path.join(os.path.dirname(__file__), OUTPUT_DIR), exist_ok=True)
    print("Generating Soil Data...")

    for region in REGIONS:
        for _ in range(NUM_SAMPLES_PER_REGION):
            # Regional Soil Distribution Probability
            if region in ['Oromia', 'Amhara']: 
                # Highlands have rich Vertisols (Black Cotton) and Loam
                probs = [0.2, 0.3, 0.05, 0.15, 0.3] 
                base_ph = 6.4
            elif region in ['Somali', 'Afar']:
                # Lowlands are sandy/arid
                probs = [0.1, 0.1, 0.6, 0.2, 0.0]
                base_ph = 7.8
            else:
                probs = [0.2, 0.4, 0.2, 0.1, 0.1]
                base_ph = 6.8

            soil = np.random.choice(SOIL_TYPES, p=probs)
            
            # pH Variance
            ph = np.clip(np.random.normal(base_ph, 0.4), 4.5, 9.0)

            # Nutrient Content (N-P-K in mg/kg)
            # Clay/Vertisols hold nutrients better than Sand
            fertility_factor = 0.4 if soil == 'Sandy' else 1.1
            if soil == 'Black Cotton (Vertisol)': fertility_factor = 1.3

            n = int(np.random.normal(60, 15) * fertility_factor)
            p = int(np.random.normal(30, 8) * fertility_factor)
            k = int(np.random.normal(250, 40) * fertility_factor)
            
            # Formatting as string "N: x, P: y, K: z" as requested, 
            # though for ML split columns are usually better. Keeping to spec.
            nutrient_str = f"N: {n}, P: {p}, K: {k}"

            data.append([region, soil, round(ph, 1), nutrient_str])

    df = pd.DataFrame(data, columns=['Region', 'Soil Type', 'pH', 'Nutrient Content'])
    output_path = os.path.join(os.path.dirname(__file__), OUTPUT_DIR, OUTPUT_FILE)
    df.to_csv(output_path, index=False)
    print(f"✅ Saved {len(df)} records to {output_path}")

if __name__ == "__main__":
    generate_soil()