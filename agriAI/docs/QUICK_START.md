Quick Start — AgriAI
=====================

**Purpose**: Minimal steps to verify the AI microservice locally (recommender + price forecaster). Install heavy/optional packages later as needed.

**Minimal required packages**: `fastapi`, `uvicorn[standard]`, `python-dotenv`, `pandas`, `numpy`, `scikit-learn`, `xgboost`.

**1. Activate your project venv (PowerShell)**

```powershell
cd AgriMarket\agriAI
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
```

**2. Verify the essential packages are installed (run in the same venv)**

```powershell
python -c "import pandas; print('pandas', pandas.__version__)"
python -c "import numpy; print('numpy', numpy.__version__)"
python -c "import sklearn; import sklearn; print('scikit-learn', sklearn.__version__)"
python -c "import xgboost; print('xgboost', xgboost.__version__)"  # may fail on Windows; see notes below
```

If `xgboost` import fails, try:
```powershell
python -m pip install xgboost
# or if pip wheel fails on Windows, use conda:
# conda install -c conda-forge xgboost
```

**3. Generate synthetic recommendation data (if missing)**

```powershell
python .\scripts\data_generation\generate_recommendations.py
Test-Path .\data\synthetic\crop_recommendation_data.csv
```

**4. Quick local (no-server) smoke test**

```powershell
python quick_test.py
```

Expect: JSON output with `recommendations` (top 3 crops + confidence). If it errors, review the stack trace — most common is a missing package.

**5. Run the API service**

```powershell
python -m uvicorn api.main:app --reload --port 8001
```

**6. Smoke-test endpoints (PowerShell examples)**

Health check:
```powershell
Invoke-RestMethod http://127.0.0.1:8001/health
```

Crop recommendation:
```powershell
$body = @{
  nitrogen = 50; phosphorus = 30; potassium = 20;
  temperature = 25.0; humidity = 60.0; ph = 6.5; rainfall = 100.0
} | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:8001/recommend/crop -Method POST -Body $body -ContentType 'application/json'
```

Price prediction (only works if model + metadata are present):
```powershell
$body = @{ crop = 'maize'; start_date = '2025-01-01'; end_date = '2025-02-01' } | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:8001/predict/price -Method POST -Body $body -ContentType 'application/json'
```

**Notes & troubleshooting**
- Use `python -m pip install ...` to ensure the correct interpreter is used.
- `xgboost` can be heavy on Windows; use conda if pip fails.
- If you hit a port or permission error, pick another port: `--port 8002`.
- Check logs for tracebacks — missing modules are the most common issue.

**Next steps (optional)**
- Create pinned versions in `requirements.txt` once everything is stable.
- Add a Dockerfile/docker-compose for reproducible runs.
- Add tests for endpoints and model outputs.
