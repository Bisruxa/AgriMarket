import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

# Configuration
START_YEAR = 2015
END_YEAR = 2024
OUTPUT_DIR = '../../data/synthetic'
OUTPUT_FILE = 'input_cost_data.csv'

# Ethiopian Context - Base Costs (ETB)
# Prices are approximated to historical trends (inflating over time)
INPUTS = {
    'Fertilizer (DAP)': {'base': 3000, 'unit': 'Quintal', 'volatility': 0.10}, 
    'Fertilizer (Urea)': {'base': 2800, 'unit': 'Quintal', 'volatility': 0.10},
    'Improved Seeds (Maize)': {'base': 150, 'unit': 'kg', 'volatility': 0.05},
    'Improved Seeds (Wheat)': {'base': 80, 'unit': 'kg', 'volatility': 0.05},
    'Farm Labor': {'base': 150, 'unit': 'Daily Wage', 'volatility': 0.15},
    'Transport Fuel (Diesel)': {'base': 25, 'unit': 'Liter', 'volatility': 0.05} # Historical base
}

REGIONS = ['Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Sidama']

def generate_costs():
    data = []
    current_date = datetime(START_YEAR, 1, 1)
    end_date = datetime(END_YEAR, 12, 31)

    os.makedirs(os.path.join(os.path.dirname(__file__), OUTPUT_DIR), exist_ok=True)
    print("Generating Input Cost Data...")

    while current_date <= end_date:
        month = current_date.month
        
        # Inflation Logic (Costs have risen significantly in ET)
        year_offset = current_date.year - START_YEAR
        inflation_factor = 1 + (0.20 * year_offset) # ~20% yearly inflation on inputs
        
        # Seasonality: Inputs are more expensive during planting (April-June)
        if month in [4, 5, 6]:
            season_factor = 1.15
        elif month in [11, 12, 1]: # Labor expensive during harvest
            season_factor = 1.10
        else:
            season_factor = 1.0

        for region in REGIONS:
            for item, info in INPUTS.items():
                
                # Logic: Labor is cheaper in some regions, Transport deeper in others
                region_mod = 1.0
                if item == 'Farm Labor' and region == 'Addis Ababa': region_mod = 1.5
                
                noise = np.random.normal(0, info['volatility'] * info['base'])
                
                # Specific logic for recent fuel/fertilizer spikes (2022-2024)
                shock_factor = 1.0
                if current_date.year >= 2022 and 'Fertilizer' in item:
                    shock_factor = 1.5 

                cost = (info['base'] * inflation_factor * season_factor * region_mod * shock_factor) + noise
                
                data.append([
                    current_date.strftime('%Y-%m-%d'),
                    region,
                    item,
                    info['unit'],
                    round(cost, 2),
                    current_date.year
                ])

        current_date += timedelta(days=30) # Monthly data is sufficient for inputs

    df = pd.DataFrame(data, columns=['Date', 'Region', 'Input Type', 'Unit', 'Cost', 'Year'])
    output_path = os.path.join(os.path.dirname(__file__), OUTPUT_DIR, OUTPUT_FILE)
    df.to_csv(output_path, index=False)
    print(f"✅ Saved {len(df)} records to {output_path}")

if __name__ == "__main__":
    generate_costs()