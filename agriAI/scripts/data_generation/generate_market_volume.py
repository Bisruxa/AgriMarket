import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

# Configuration
START_YEAR = 2018 # Trade data is often more recent
END_YEAR = 2024
OUTPUT_DIR = '../../data/synthetic'
OUTPUT_FILE = 'market_volume_data.csv'

# Major Ethiopian Markets
MARKETS = {
    'Addis Ababa (Ehil Berenda)': {'size': 'Large', 'region': 'Addis Ababa'},
    'Shashemene Market': {'size': 'Medium', 'region': 'Oromia'},
    'Bahir Dar Market': {'size': 'Medium', 'region': 'Amhara'},
    'Mekelle Market': {'size': 'Medium', 'region': 'Tigray'},
    'Hawassa Market': {'size': 'Medium', 'region': 'Sidama'},
    'Dire Dawa Market': {'size': 'Large', 'region': 'Dire Dawa'}
}

CROPS = ['Teff', 'Coffee', 'Maize', 'Wheat', 'Sesame']

def generate_volume():
    data = []
    current_date = datetime(START_YEAR, 1, 1)
    end_date = datetime(END_YEAR, 12, 31)

    os.makedirs(os.path.join(os.path.dirname(__file__), OUTPUT_DIR), exist_ok=True)
    print("Generating Market Volume Data...")

    while current_date <= end_date:
        month = current_date.month
        
        # Seasonality: Harvest time (Oct-Jan) = High Volume
        if month in [10, 11, 12, 1]:
            season_factor = 1.4
            demand_status = 'High Supply'
        elif month in [6, 7, 8]: # Kiremt (Rainy) = Low Volume, transport difficult
            season_factor = 0.6
            demand_status = 'Low Supply'
        else:
            season_factor = 1.0
            demand_status = 'Balanced'

        for mkt_name, mkt_info in MARKETS.items():
            for crop in CROPS:
                
                # Base volume (Quintals traded per week)
                base_vol = 5000 if mkt_info['size'] == 'Large' else 2000
                if crop == 'Coffee': base_vol *= 0.6 # Coffee is lower volume but high value
                
                # Random fluctuations
                vol_noise = np.random.normal(0, 200)
                
                actual_vol = (base_vol * season_factor) + vol_noise
                actual_vol = max(actual_vol, 0)

                data.append([
                    current_date.strftime('%Y-%m-%d'),
                    mkt_name,
                    mkt_info['region'],
                    crop,
                    int(actual_vol), # Volume in Quintals
                    demand_status
                ])

        current_date += timedelta(days=7) # Weekly Data

    df = pd.DataFrame(data, columns=['Date', 'Market', 'Region', 'Crop', 'Volume_Quintals', 'Supply_Status'])
    output_path = os.path.join(os.path.dirname(__file__), OUTPUT_DIR, OUTPUT_FILE)
    df.to_csv(output_path, index=False)
    print(f"✅ Saved {len(df)} records to {output_path}")

if __name__ == "__main__":
    generate_volume()