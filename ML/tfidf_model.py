import json
import warnings
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from config import (
    OUT_MOVIES_JSON,
    TFIDF_VECTORIZER_PATH,
    TFIDF_MATRIX_PATH,
    TOP_N_SIMILAR,
    is_mongodb_available,
    get_movies_collection,
)

# ──────────────────────────────────────────────────────────────
# TF-IDF: Cosine similarity (good for text)
# Uses only movies with descriptions/overviews
# ──────────────────────────────────────────────────────────────

MAX_FEATURES = 6500
GENRE_WEIGHT = 3
MAX_OVERVIEW_LENGTH = 1200


def run():
    print("TF-IDF model training started...")
    print("→ Using cosine similarity for text features")
    print("→ Filtering to movies with descriptions/overviews")

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

    # ── Filter to movies with descriptions ───────────────────────
    df["overview"] = df.get("overview", "").fillna("").astype(str).str.strip()
    df = df[df["overview"].str.len() > 20].copy()  # At least 20 characters
    print(f"→ Filtered to {len(df):,} movies with descriptions")

    if df.empty:
        print("❌ No movies remaining after filtering.")
        return

    # ── Prepare text features ────────────────────────────────────
    df["genres"] = df.get("genres", "").fillna("").astype(str).str.strip()
    
    # Truncate very long overviews
    df["overview"] = df["overview"].str[:MAX_OVERVIEW_LENGTH]

    # Weighted combination: repeat genres (genres are more reliable)
    df["text"] = (df["genres"] + " ") * GENRE_WEIGHT + df["overview"]

    # ── Build TF-IDF ─────────────────────────────────────────────
    print("Building TF-IDF with cosine similarity...")
    tfidf = TfidfVectorizer(
        stop_words="english",
        max_features=MAX_FEATURES,
        ngram_range=(1, 2),
        min_df=3,
        dtype=np.float32
    )

    tfidf_matrix = tfidf.fit_transform(df["text"])

    print(f"→ TF-IDF matrix shape: {tfidf_matrix.shape}")
    print(f"→ Vocabulary size: {len(tfidf.get_feature_names_out())}")

    # ── Calculate cosine similarity ──────────────────────────────
    print("Calculating cosine similarity...")
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    print(f"→ Similarity matrix shape: {cosine_sim.shape}")

    # ── Save artifacts ───────────────────────────────────────────
    print("Saving TF-IDF model and matrix...")
    joblib.dump(tfidf, TFIDF_VECTORIZER_PATH, compress=3)
    joblib.dump(tfidf_matrix, TFIDF_MATRIX_PATH, compress=3)

    # ── Generate recommendations ─────────────────────────────────
    print("Generating TF-IDF recommendations...")
    recommendations = {}
    movie_ids = df["movieId"].tolist()

    for idx, movie_id in enumerate(movie_ids):
        # Get similarity scores for this movie
        sim_scores = cosine_sim[idx]
        
        # Get indices of most similar movies (excluding itself)
        similar_indices = np.argsort(sim_scores)[::-1][1:TOP_N_SIMILAR + 1]
        
        # Get movie IDs of similar movies
        similar_movie_ids = [movie_ids[i] for i in similar_indices]
        
        recommendations[str(movie_id)] = similar_movie_ids

    # ── Save TF-IDF recommendations ──────────────────────────────
    tfidf_output = OUT_MOVIES_JSON.replace("movies.json", "tfidf_recommendations.json")
    print(f"Saving TF-IDF recommendations to {tfidf_output}...")
    with open(tfidf_output, "w", encoding="utf-8") as f:
        json.dump(recommendations, f, indent=2)

    print(f"✅ TF-IDF model complete!")
    print(f"   → {len(recommendations):,} movies with recommendations")
    print(f"   → Saved to: {tfidf_output}")


if __name__ == "__main__":
    run()
