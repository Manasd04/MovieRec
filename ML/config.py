import os
from pymongo import MongoClient

# ──────────────────────────────────────────────────────────────
# Directories and file paths
# ──────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, '..', 'backend', 'data')
CACHE_DIR = os.path.join(BASE_DIR, 'cache')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

os.makedirs(BACKEND_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

# Output files
OUT_MOVIES_JSON       = os.path.join(BACKEND_DIR, 'movies.json')
OUT_CONTENT_BASED     = os.path.join(BACKEND_DIR, 'content_based.json')
OUT_USER_RECS         = os.path.join(BACKEND_DIR, 'user_recommendations.json')

# Model artifacts (for on-demand inference)
TFIDF_VECTORIZER_PATH = os.path.join(MODEL_DIR, 'tfidf_vectorizer.joblib')
TFIDF_MATRIX_PATH     = os.path.join(MODEL_DIR, 'tfidf_matrix.joblib')

SVD_U_PATH            = os.path.join(MODEL_DIR, 'svd_U.joblib')
SVD_SIGMA_PATH        = os.path.join(MODEL_DIR, 'svd_Sigma.joblib')
SVD_Vt_PATH           = os.path.join(MODEL_DIR, 'svd_Vt.joblib')
USER_TO_IDX_PATH      = os.path.join(MODEL_DIR, 'user_to_idx.joblib')
MOVIE_TO_IDX_PATH     = os.path.join(MODEL_DIR, 'movie_to_idx.joblib')

# ──────────────────────────────────────────────────────────────
# MongoDB configuration
# ──────────────────────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "movie_recommendation"
MOVIES_COLLECTION = "movies"
RATINGS_COLLECTION = "rating"

client = None
db = None

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()  # Force connection test
    db = client[DB_NAME]
    print("✓ MongoDB connected")
except Exception as e:
    print("❌ MongoDB connection failed:", e)
    client = None
    db = None

def is_mongodb_available():
    """Check if MongoDB connection is active."""
    return db is not None

def get_movies_collection():
    """Get movies collection if connected."""
    return db[MOVIES_COLLECTION] if is_mongodb_available() else None

def get_ratings_collection():
    """Get ratings collection if connected."""
    return db[RATINGS_COLLECTION] if is_mongodb_available() else None

def close_mongodb_connection():
    """Safely close MongoDB client."""
    global client
    if client:
        try:
            client.close()
            print("MongoDB connection closed")
        except Exception as e:
            print("Warning: Error closing MongoDB connection:", e)
        finally:
            client = None
            db = None  # optional - clear reference

# ──────────────────────────────────────────────────────────────
# ML / Recommendation parameters
# ──────────────────────────────────────────────────────────────
CONTENT_WEIGHT         = 0.6
COLLAB_WEIGHT          = 0.4
N_FACTORS              = 50
TOP_N_SIMILAR          = 20
TOP_N_USER             = 20
MAX_USERS_TO_SAVE      = 20000

# Hybrid-specific tuning
TOP_N_COLLAB_SEEDS     = 8
TOP_N_CONTENT_PER_SEED = 12