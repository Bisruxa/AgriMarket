import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

START_YEAR = 2015
END_YEAR = 2024
OUTPUT_DIR = '../../data/synthetic'
OUTPUT_FILE = 'weather_data.csv'

# Regional Climatic Profiles
REGIONS = {
    'Addis Ababa': {'temp': 16, 'rain_mod': 1.1}, # Highland
    'Oromia':      {'temp': 20, 'rain_mod': 1.0}, # Diverse
    'Amhara':      {'temp': 18, 'rain_mod': 1.1}, # Highland
    'Tigray':      {'temp': 22, 'rain_mod': 0.8}, # Semi-arid
    'Somali':      {'temp': 30, 'rain_mod': 0.3}, # Lowland/Hot
    'Afar':        {'temp': 34, 'rain_mod': 0.2}, # Extreme Heat
    'Sidama':      {'temp': 21, 'rain_mod': 1.2}, # Wet/Midland
    'SNNPR':       {'temp': 20, 'rain_mod': 1.1},
    'Gambela':     {'temp': 28, 'rain_mod': 0.9},
}

def get_season(month):
    if month in [6, 7, 8, 9]: return 'Summer' # Kiremt (Rain)
    elif month in [10, 11, 12, 1]: return 'Winter' # Bega (Dry)
    elif month in [2, 3]: return 'Spring' # Belg
    else: return 'Autumn'

def generate_weather():
    data = []
    current_date = datetime(START_YEAR, 1, 1)
    end_date = datetime(END_YEAR, 12, 31)

    os.makedirs(os.path.join(os.path.dirname(__file__), OUTPUT_DIR), exist_ok=True)
    print("Generating Weather Data...")

    while current_date <= end_date:
        season = get_season(current_date.month)
        
        for region, info in REGIONS.items():
            # Temp Fluctuation
            season_temp_adj = -2 if season == 'Winter' else 0
            if season == 'Spring': season_temp_adj = 2
            
            daily_temp = np.random.normal(info['temp'] + season_temp_adj, 2.5)
            
            # Rainfall Logic (mm)
            if season == 'Summer': # Kiremt
                rain = np.random.gamma(shape=2, scale=12) * info['rain_mod'] 
            elif season == 'Spring': # Belg
                rain = np.random.gamma(shape=1, scale=6) * info['rain_mod']
            else: # Dry Season
                rain = np.random.exponential(scale=1.5) * info['rain_mod']
                if rain < 1: rain = 0

            # Humidity Logic
            base_hum = 60 if info['temp'] < 25 else 35
            hum_adj = 25 if season == 'Summer' else -10
            humidity = np.clip(np.random.normal(base_hum + hum_adj, 8), 10, 95)

            data.append([
                current_date.strftime('%Y-%m-%d'),
                region,
                round(daily_temp, 1),
                round(rain, 1),
                round(humidity, 1),
                season
            ])

        current_date += timedelta(days=1)

    df = pd.DataFrame(data, columns=['Date', 'Region', 'Temperature', 'Rainfall', 'Humidity', 'Season'])
    output_path = os.path.join(os.path.dirname(__file__), OUTPUT_DIR, OUTPUT_FILE)
    df.to_csv(output_path, index=False)
    print(f"✅ Saved {len(df)} records to {output_path}")

if __name__ == "__main__":
    generate_weather()