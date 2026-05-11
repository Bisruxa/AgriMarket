import pandas as pd
import numpy as np
import random
import os
from datetime import datetime, timedelta

# Configuration
START_YEAR = 2015
END_YEAR = 2024
OUTPUT_DIR = '../../data/synthetic'
OUTPUT_FILE = 'crop_price_data.csv'

# Ethiopian Context
REGIONS = ['Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Sidama', 'Somali', 'Benishangul-Gumuz', 'Dire Dawa', 'Harari', 'Afar', 'Gambella']
CROPS = {
    'Teff': {'base': 3500, 'volatility': 0.15},   # Price per Quintal
    'Coffee': {'base': 8500, 'volatility': 0.25}, # Cash crop, volatile
    'Maize': {'base': 1600, 'volatility': 0.10},
    'Wheat': {'base': 2800, 'volatility': 0.12},
    'Sorghum': {'base': 1900, 'volatility': 0.12},
    'Sesame': {'base': 6500, 'volatility': 0.20}, # Export crop
    'Barley': {'base': 2400, 'volatility': 0.10}
}

def get_season(month):
    # Mapping Ethiopian Seasons to Standard Terms
    # Kiremt (Jun-Sep) -> Summer (Wet season)
    # Bega (Oct-Jan) -> Winter (Harvest/Dry)
    # Belg (Feb-May) -> Spring/Autumn (Short rains)
    if month in [6, 7, 8, 9]:
        return 'Summer' 
    elif month in [10, 11, 12, 1]:
        return 'Winter'
    elif month in [2, 3]:
        return 'Spring'
    else:
        return 'Autumn'

def generate_prices():
    data = []
    current_date = datetime(START_YEAR, 1, 1)
    end_date = datetime(END_YEAR, 12, 31)
    
    # Ensure output directory exists
    os.makedirs(os.path.join(os.path.dirname(__file__), OUTPUT_DIR), exist_ok=True)
    
    print("Generating Crop Prices...")
    
    while current_date <= end_date:
        season = get_season(current_date.month)
        
        # Seasonal Economic Logic
        if season == 'Winter': # Harvest time (Bega)
            season_factor = 0.85 # Prices drop due to supply
        elif season == 'Summer': # Rainy season (Kiremt)
            season_factor = 1.25 # Prices rise (transport diff, scarcity)
        else:
            season_factor = 1.05

        # Yearly Inflation Simulation (ETB trend)
        year_offset = current_date.year - START_YEAR
        inflation_factor = 1 + (0.18 * year_offset) # ~18% annual inflation avg

        for region in REGIONS:
            for crop, info in CROPS.items():
                # Random Market Noise
                noise = np.random.normal(0, info['volatility'] * 100)
                
                # Regional Variance (e.g., Coffee cheaper in Oromia/Sidama)
                region_factor = 1.0
                if crop == 'Coffee' and region in ['Oromia', 'Sidama', 'SNNPR']:
                    region_factor = 0.90
                elif crop == 'Teff' and region in ['Amhara', 'Oromia']:
                    region_factor = 0.95
                elif region == 'Somali': # Transport costs increase price
                    region_factor = 1.15

                price = (info['base'] * season_factor * inflation_factor * region_factor) + noise
                price = max(price, 400) # Floor price

                data.append([
                    current_date.strftime('%Y-%m-%d'),
                    crop,
                    region,
                    round(price, 2),
                    season,
                    current_date.year
                ])
        
        current_date += timedelta(days=7) # Weekly Data

    df = pd.DataFrame(data, columns=['Date', 'Crop Name', 'Region', 'Price', 'Season', 'Year'])
    output_path = os.path.join(os.path.dirname(__file__), OUTPUT_DIR, OUTPUT_FILE)
    df.to_csv(output_path, index=False)
    print(f"✅ Saved {len(df)} records to {output_path}")

if __name__ == "__main__":
    generate_prices()