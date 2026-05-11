import os

def create_project_structure():
    # Root folders
    # root_dirs = ["frontend", "backend", "agriAI"]
    root_dirs = ["agriAI"]

    # agriAI specific structure
    agri_dirs = [
        "agriAI/data/processed",
        "agriAI/data/raw",
        "agriAI/data/synthetic",
        "agriAI/docs",
        "agriAI/models",
        "agriAI/notebooks",
        "agriAI/scripts/data_generation",
        "agriAI/scripts/ml_service",
    ]

    # Empty files to create inside agriAI
    agri_files = [
        "agriAI/scripts/data_generation/generate_prices.py",
        "agriAI/scripts/data_generation/generate_recs.py",
        "agriAI/scripts/data_generation/generate_soil.py",
        "agriAI/scripts/data_generation/generate_weather.py",
        "agriAI/scripts/data_generation/__init__.py",
        "agriAI/requirements.txt",
        "agriAI/.gitignore",
        "agriAI/README.md",
        "agriAI/.env"  # For storing API keys later
    ]

    print("🚀 Initializing AgriMarket AI Project Structure...\n")

    # 1. Create Root Directories (frontend, backend, agriAI)
    for folder in root_dirs:
        try:
            os.makedirs(folder, exist_ok=True)
            print(f"   📂 Created root directory: {folder}/")
        except OSError as e:
            print(f"   ❌ Error creating {folder}: {e}")

    # 2. Create agriAI Sub-directories
    for folder in agri_dirs:
        try:
            os.makedirs(folder, exist_ok=True)
            print(f"   📂 Created sub-directory:  {folder}/")
        except OSError as e:
            print(f"   ❌ Error creating {folder}: {e}")

    # 3. Create Empty Files
    for file_path in agri_files:
        try:
            # Create file if it doesn't exist
            if not os.path.exists(file_path):
                with open(file_path, 'w') as f:
                    pass 
                print(f"   📄 Created file:           {file_path}")
            else:
                print(f"   ⚠️  File already exists:      {file_path}")
        except OSError as e:
            print(f"   ❌ Error creating file {file_path}: {e}")

    print("\n✅ Project structure created successfully!")

if __name__ == "__main__":
    create_project_structure()