# Movie Recommendation System - ML Pipeline

Python-based machine learning pipeline for generating movie recommendations using multiple algorithms.

## 🤖 Algorithms

### 1. Content-Based Filtering
- **Similarity**: Jaccard (genres) + Cosine (numeric features)
- **Data**: Popular movies (vote_count > 100)
- **Features**: Genres, ratings, popularity
- **Output**: `content_based.json`

### 2. TF-IDF Model
- **Similarity**: Cosine similarity on text
- **Data**: Movies with descriptions/overviews
- **Features**: Movie descriptions, genres
- **Output**: `tfidf_recommendations.json`

### 3. Collaborative Filtering (SVD)
- **Similarity**: Pearson correlation / Euclidean distance
- **Data**: Users with 20+ ratings
- **Method**: Singular Value Decomposition
- **Output**: `user_recommendations.json`

### 4. Hybrid Model
- **Combination**: Content (40%) + Collaborative (40%) + TF-IDF (20%)
- **Data**: All available data
- **Output**: `hybrid_recommendations.json`

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- MongoDB (for data import)
- pip (Python package manager)

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Edit `config.py` to customize:
- MongoDB connection settings
- Number of recommendations
- Model parameters
- File paths

### Training Models

```bash
# Run all models
python train_models.py

# Or use automation scripts
# Windows:
run_training.bat
# Linux/Mac:
./run_training.sh
```

## 📁 Project Structure

```
ML/
├── config.py                  # Configuration settings
├── content_based.py           # Content-based filtering
├── tfidf_model.py            # TF-IDF model
├── collaborative_svd.py       # SVD collaborative filtering
├── hybrid.py                  # Hybrid model
├── train_models.py            # Main training script
├── verify_mongodb.py          # MongoDB verification
├── requirements.txt           # Python dependencies
├── setup_ml_environment.md    # Setup guide
├── run_training.bat          # Windows automation
├── run_training.sh           # Linux/Mac automation
├── data/                     # Input data
│   ├── movies.csv
│   └── ratings.csv
└── models/                   # Trained models
    ├── *.pkl
    └── *.joblib
```

## 🔧 Configuration Options

### config.py

```python
# MongoDB settings
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "movie_recommendations"

# Recommendation settings
TOP_N_SIMILAR = 20
TOP_N_USER = 20
MAX_USERS_TO_SAVE = 5000

# Model parameters
N_FACTORS = 50  # SVD factors
```

## 📊 Data Requirements

### Movies Data
- **Required fields**: movieId, title, genres
- **Optional fields**: overview, vote_average, vote_count, popularity
- **Format**: CSV or MongoDB collection

### Ratings Data (for collaborative filtering)
- **Required fields**: userId, movieId, rating
- **Format**: CSV or MongoDB collection

## 🎯 Training Pipeline

1. **Content-Based**
   - Filters to popular movies (vote_count > 100)
   - Calculates Jaccard similarity for genres
   - Calculates cosine similarity for numeric features
   - Combines with 60/40 weighting

2. **TF-IDF**
   - Filters to movies with descriptions
   - Builds TF-IDF matrix from text
   - Calculates cosine similarity
   - Generates recommendations

3. **Collaborative (SVD)**
   - Filters to users with 20+ ratings
   - Builds user-item rating matrix
   - Applies SVD decomposition
   - Generates user recommendations

4. **Hybrid**
   - Loads all recommendation sources
   - Applies weighted scoring
   - Combines and ranks results

## 📈 Monitoring

Check ML model status via backend API:

```bash
curl http://localhost:3001/api/ml/status
```

Returns:
- File modification times
- Number of movies/users
- Retraining recommendations

## 🔄 Retraining

Retrain models when:
- New movies are added
- User ratings change significantly
- Data is older than 7 days

```bash
# Automated retraining
python train_models.py
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Verify MongoDB connection
python verify_mongodb.py
```

### Missing Dependencies
```bash
# Reinstall all dependencies
pip install -r requirements.txt --force-reinstall
```

### Memory Issues
- Reduce `MAX_USERS_TO_SAVE` in config.py
- Reduce `TOP_N_SIMILAR` for fewer recommendations
- Use sparse matrices for large datasets

## 📚 Documentation

- **Setup Guide**: `setup_ml_environment.md`
- **Pipeline Guide**: `../ML_PIPELINE_GUIDE.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details
