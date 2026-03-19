import pandas as pd
import numpy as np
import os

OUTPUT_DIR = '../../data/synthetic'
OUTPUT_FILE = 'crop_recommendation_data.csv'
NUM_SAMPLES = 8000

def get_recommendation(row):
    soil = row['Soil Type']
    temp = row['Temp_Cat']
    rain = row['Rain_Cat']
    
    # Agronomic Logic Rules for Ethiopia
    if soil == 'Black Cotton (Vertisol)' and rain == 'High':
        return 'Teff' # Teff thrives in waterlogged Vertisols
    elif soil == 'Loam' and temp == 'Moderate' and rain in ['Moderate', 'High']:
        return 'Coffee' # Ideal coffee conditions
    elif soil == 'Sandy' and temp == 'High':
        return 'Sesame' # Heat/Drought tolerant
    elif temp == 'High' and rain == 'Low':
        return 'Sorghum' # Very hardy
    elif soil == 'Loam' and rain == 'High':
        return 'Maize'
    elif temp == 'Cool':
        return 'Wheat' # High-altitude crop
    elif soil == 'Clay' and rain == 'Moderate':
        return 'Chickpeas'
    else:
        return 'Barley' # Fallback

def generate_recs():
    data = []
    
    regions = ['Oromia', 'Amhara', 'SNNPR', 'Somali', 'Tigray', 'Sidama']
    soil_types = ['Clay', 'Loam', 'Sandy', 'Black Cotton (Vertisol)']
    
    os.makedirs(os.path.join(os.path.dirname(__file__), OUTPUT_DIR), exist_ok=True)
    print("Generating Recommendation Data...")
    
    for _ in range(NUM_SAMPLES):
        region = np.random.choice(regions)
        soil = np.random.choice(soil_types)
        
        # Climate varies by region logic
        if region in ['Somali', 'Tigray']:
            temp_cat = np.random.choice(['High', 'Moderate'], p=[0.7, 0.3])
            rain_cat = np.random.choice(['Low', 'Moderate'], p=[0.7, 0.3])
        else:
            temp_cat = np.random.choice(['Moderate', 'Cool', 'High'], p=[0.5, 0.3, 0.2])
            rain_cat = np.random.choice(['Moderate', 'High', 'Low'], p=[0.5, 0.4, 0.1])
            
        row = {'Soil Type': soil, 'Temp_Cat': temp_cat, 'Rain_Cat': rain_cat}
        rec = get_recommendation(row)
        
        # Add 5% noise (human error/experimental farming)
        if np.random.random() < 0.05:
            rec = np.random.choice(['Maize', 'Sorghum', 'Teff'])

        climate_desc = f"{temp_cat} Temp, {rain_cat} Rain"
        
        data.append([region, soil, climate_desc, rec])

    df = pd.DataFrame(data, columns=['Region', 'Soil Type', 'Climate', 'Recommended Crop'])
    output_path = os.path.join(os.path.dirname(__file__), OUTPUT_DIR, OUTPUT_FILE)
    df.to_csv(output_path, index=False)
    print(f"✅ Saved {len(df)} records to {output_path}")

if __name__ == "__main__":
    generate_recs()