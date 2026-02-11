import json
import warnings
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MultiLabelBinarizer

from config import (
    OUT_MOVIES_JSON,
    OUT_CONTENT_BASED,
    TFIDF_VECTORIZER_PATH,
    TFIDF_MATRIX_PATH,
    TOP_N_SIMILAR,
    is_mongodb_available,
    get_movies_collection,
)

# ──────────────────────────────────────────────────────────────
# Content-Based: Jaccard similarity for genres + cosine for numeric features
# Uses only popular movies (vote_count > 100)
# ──────────────────────────────────────────────────────────────

MIN_VOTE_COUNT = 100  # Only use popular movies


def jaccard_similarity(set1, set2):
    """Calculate Jaccard similarity between two sets"""
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union > 0 else 0.0


def run():
    print("Content-based model training started...")
    print("→ Using Jaccard similarity for genres + cosine for numeric features")
    print(f"→ Filtering to popular movies (vote_count > {MIN_VOTE_COUNT})")

    if not is_mongodb_available():
        print("❌ MongoDB not available. Cannot continue.")
        return

    movies_col = get_movies_collection()
    print("Loading movies from MongoDB...")

    df = pd.DataFrame(list(movies_col.find({}, {"_id": 0})))
    if df.empty:
        print("❌ No movies found in collection.")
        return

    print(f"→ Loaded {len(df):,} movies")

    # ── Filter to popular movies only ────────────────────────────
    df["vote_count"] = pd.to_numeric(df.get("vote_count", 0), errors="coerce").fillna(0)
    df = df[df["vote_count"] > MIN_VOTE_COUNT].copy()
    print(f"→ Filtered to {len(df):,} popular movies (vote_count > {MIN_VOTE_COUNT})")

    if df.empty:
        print("❌ No movies remaining after filtering.")
        return

    # ── Prepare features ─────────────────────────────────────────
    df["genres"] = df.get("genres", "").fillna("").astype(str).str.strip()
    df["vote_average"] = pd.to_numeric(df.get("vote_average", 0), errors="coerce").fillna(0)
    df["popularity"] = pd.to_numeric(df.get("popularity", 0), errors="coerce").fillna(0)

    # Parse genres into sets for Jaccard similarity
    df["genre_set"] = df["genres"].apply(lambda x: set(x.split()) if x else set())

    # Normalize numeric features for cosine similarity
    numeric_features = df[["vote_average", "vote_count", "popularity"]].values
    # Min-max normalization
    from sklearn.preprocessing import MinMaxScaler
    scaler = MinMaxScaler()
    numeric_normalized = scaler.fit_transform(numeric_features)

    # ── Build similarity matrix ──────────────────────────────────
    print("Building hybrid similarity matrix (Jaccard + Cosine)...")
    n_movies = len(df)
    similarity_matrix = np.zeros((n_movies, n_movies), dtype=np.float32)

    movie_ids = df["movieId"].tolist()
    genre_sets = df["genre_set"].tolist()

    # Calculate combined similarity
    for i in range(n_movies):
        for j in range(i, n_movies):
            # Jaccard similarity for genres (weight: 0.6)
            jaccard_sim = jaccard_similarity(genre_sets[i], genre_sets[j])
            
            # Cosine similarity for numeric features (weight: 0.4)
            cosine_sim = cosine_similarity(
                numeric_normalized[i:i+1],
                numeric_normalized[j:j+1]
            )[0][0]
            
            # Weighted combination
            combined_sim = 0.6 * jaccard_sim + 0.4 * cosine_sim
            
            similarity_matrix[i, j] = combined_sim
            similarity_matrix[j, i] = combined_sim

    print(f"→ Similarity matrix shape: {similarity_matrix.shape}")

    # ── Generate recommendations ─────────────────────────────────
    print("Generating recommendations...")
    recommendations = {}

    for idx, movie_id in enumerate(movie_ids):
        # Get similarity scores for this movie
        sim_scores = similarity_matrix[idx]
        
        # Get indices of most similar movies (excluding itself)
        similar_indices = np.argsort(sim_scores)[::-1][1:TOP_N_SIMILAR + 1]
        
        # Get movie IDs of similar movies
        similar_movie_ids = [movie_ids[i] for i in similar_indices]
        
        recommendations[str(movie_id)] = similar_movie_ids

    # ── Save outputs ─────────────────────────────────────────────
    print("Saving content-based recommendations...")
    with open(OUT_CONTENT_BASED, "w", encoding="utf-8") as f:
        json.dump(recommendations, f, indent=2)

    print("Saving movies.json...")
    movies_data = df.to_dict(orient="records")
    with open(OUT_MOVIES_JSON, "w", encoding="utf-8") as f:
        json.dump(movies_data, f, indent=2)

    print(f"✅ Content-based model complete!")
    print(f"   → {len(recommendations):,} movies with recommendations")
    print(f"   → Saved to: {OUT_CONTENT_BASED}")
    print(f"   → Movies saved to: {OUT_MOVIES_JSON}")


if __name__ == "__main__":
    run()