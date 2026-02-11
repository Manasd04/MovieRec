# ML Environment Setup Guide

This guide will help you set up the Python environment and dependencies required to run the machine learning recommendation algorithms.

## Prerequisites

- **Python 3.8 or higher** - [Download Python](https://www.python.org/downloads/)
- **MongoDB 4.0 or higher** - [Download MongoDB](https://www.mongodb.com/try/download/community)
- **Node.js** (already installed for the backend)

## Step 1: Verify Python Installation

Open a terminal/command prompt and verify Python is installed:

```bash
python --version
# or
python3 --version
```

You should see Python 3.8 or higher. If not, install Python from the link above.

## Step 2: Install Python Dependencies

Navigate to the ML directory and install the required packages:

```bash
cd "c:\ML Project\ML"
pip install -r requirements.txt
```

This will install:
- `pandas` - Data manipulation and analysis
- `numpy` - Numerical computing
- `scikit-learn` - Machine learning algorithms (TF-IDF, SVD)
- `scipy` - Scientific computing
- `pymongo` - MongoDB driver for Python
- `joblib` - Model serialization

### Troubleshooting Installation

**If you get "pip not found":**
```bash
python -m pip install -r requirements.txt
```

**If you want to use a virtual environment (recommended):**
```bash
# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Step 3: Set Up MongoDB

### Install MongoDB

1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. MongoDB should start automatically as a service

### Verify MongoDB is Running

**Windows:**
```bash
# Check if MongoDB service is running
sc query MongoDB

# If not running, start it
net start MongoDB
```

**Mac/Linux:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# If not running, start it
sudo systemctl start mongod
```

### Test MongoDB Connection

```bash
# Open MongoDB shell
mongosh
# or for older versions
mongo

# You should see a connection message
# Type 'exit' to close the shell
```

## Step 4: Import Movie Data into MongoDB

The ML scripts need movie and rating data in MongoDB. You have two options:

### Option A: Import from Existing Data

If you already have movie data in `backend/data/movies.json`, create a simple import script:

```bash
cd "c:\ML Project\backend"
node scripts/mongodb_import.js
```

> **Note**: We'll create this script in the next step if it doesn't exist.

### Option B: Manual Import (if you have CSV files)

If you have CSV files with movie and rating data:

```bash
# Import movies
mongoimport --db movie_recommendation --collection movies --type csv --headerline --file path/to/movies.csv

# Import ratings
mongoimport --db movie_recommendation --collection ratings --type csv --headerline --file path/to/ratings.csv
```

## Step 5: Configure ML Scripts

Check the configuration in `ML/config.py`:

```python
# MongoDB connection (default)
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "movie_recommendation"
```

If your MongoDB is running on a different host/port, update these values.

## Step 6: Verify Everything Works

Test that all components are working:

```bash
cd "c:\ML Project\ML"

# Test MongoDB connection
python -c "from config import is_mongodb_available; print('MongoDB available:', is_mongodb_available())"

# Test imports
python -c "import pandas, numpy, sklearn, scipy, pymongo; print('All imports successful!')"
```

You should see:
```
MongoDB available: True
All imports successful!
```

## Step 7: Train the Models

Now you're ready to train the recommendation models:

```bash
cd "c:\ML Project\ML"
python train_models.py
```

This will:
1. Load movie and rating data from MongoDB
2. Train the content-based model (TF-IDF)
3. Train the collaborative filtering model (SVD)
4. Generate hybrid recommendations
5. Save models to `ML/models/` directory
6. Save recommendations to `backend/data/` directory

### Expected Output

You should see progress messages like:

```
══════════════════════════════════════════════════════════════════
MongoDB connection: ✓ Available
══════════════════════════════════════════════════════════════════

══════════════════════════════════════════════════════════════════
[1/3] Content-Based Filtering (TF-IDF + Cosine Similarity)
══════════════════════════════════════════════════════════════════
Loaded 5000 movies from MongoDB
Building TF-IDF matrix...
Computing similarity matrix...
Saved content_based.json (5000 movies)
✓ Completed in 12.3s

══════════════════════════════════════════════════════════════════
[2/3] Collaborative Filtering (SVD)
══════════════════════════════════════════════════════════════════
Loaded 100000 ratings from MongoDB
Building user-movie matrix...
Running SVD decomposition...
Saved user recommendations
✓ Completed in 8.7s

══════════════════════════════════════════════════════════════════
[3/3] Hybrid Recommendations
══════════════════════════════════════════════════════════════════
Combining collaborative and content-based results...
✓ Completed in 2.1s

══════════════════════════════════════════════════════════════════
Pipeline completed successfully in 23.1s
══════════════════════════════════════════════════════════════════
```

## Step 8: Verify Output Files

Check that the following files were created:

### Recommendation Files (used by backend)
- `backend/data/content_based.json` - Movie-to-movie recommendations
- `backend/data/user_recommendations.json` - User personalized recommendations

### Model Files (used for incremental updates)
- `ML/models/tfidf_vectorizer.joblib`
- `ML/models/tfidf_matrix.joblib`
- `ML/models/svd_U.joblib`
- `ML/models/svd_Sigma.joblib`
- `ML/models/svd_Vt.joblib`
- `ML/models/user_to_idx.joblib`
- `ML/models/movie_to_idx.joblib`

## Troubleshooting

### "MongoDB connection failed"

**Problem**: `is_mongodb_available()` returns `False`

**Solutions**:
1. Check MongoDB is running: `sc query MongoDB` (Windows) or `sudo systemctl status mongod` (Linux/Mac)
2. Verify connection string in `ML/config.py`
3. Check firewall settings aren't blocking port 27017

### "No movies found in database"

**Problem**: MongoDB is running but no data is loaded

**Solutions**:
1. Import movie data using `mongoimport` or the import script
2. Verify database name matches `config.py` (default: `movie_recommendation`)
3. Check collection names: `movies` and `ratings`

### "Memory Error during SVD"

**Problem**: Not enough RAM for large datasets

**Solutions**:
1. Reduce `N_FACTORS` in `ML/config.py` (default: 50, try 20)
2. Reduce `MAX_USERS_TO_SAVE` in `ML/config.py`
3. Process data in batches

### "Import Error: No module named 'sklearn'"

**Problem**: scikit-learn not installed correctly

**Solution**:
```bash
pip install --upgrade scikit-learn
```

### "Permission denied" when saving files

**Problem**: No write permissions to output directories

**Solutions**:
1. Run terminal as administrator (Windows)
2. Check folder permissions
3. Verify paths in `ML/config.py` are correct

## Next Steps

Once the models are trained and recommendation files are generated:

1. **Restart the backend server** to load the new recommendation files
2. **Test the recommendations** in the frontend at `/recommendations`
3. **Set up automation** to retrain models periodically (see `ML_PIPELINE_GUIDE.md`)

## Retraining Models

You should retrain the models when:
- New movies are added to the database
- New user ratings are collected
- You want to update recommendations (recommended: weekly or monthly)

Simply run:
```bash
cd "c:\ML Project\ML"
python train_models.py
```

The backend will automatically use the updated recommendation files (you may need to restart the server or implement hot-reloading).

## Getting Help

If you encounter issues not covered here:

1. Check the full error message and stack trace
2. Verify all prerequisites are installed correctly
3. Review `ML/config.py` for configuration issues
4. Check MongoDB logs for database-related errors
5. Consult the `ML_PIPELINE_GUIDE.md` for algorithm-specific details
