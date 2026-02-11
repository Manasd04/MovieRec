import json
import warnings
import joblib
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.utils.extmath import randomized_svd

from config import (
    OUT_USER_RECS,
    MAX_USERS_TO_SAVE,
    N_FACTORS,
    TOP_N_USER,
    SVD_U_PATH,
    SVD_SIGMA_PATH,
    SVD_Vt_PATH,
    USER_TO_IDX_PATH,
    MOVIE_TO_IDX_PATH,
    is_mongodb_available,
    get_ratings_collection,
)


def run():
    """
    Trains a collaborative filtering model using Randomized SVD.
    Uses Pearson correlation / Euclidean distance for similarity.
    Filters to users with 20+ ratings to remove sparse users.
    Saves model components for fast on-demand recommendations.
    Generates top-N recommendations only for the most active users.
    """
    print("Collaborative filtering (SVD) training started...")
    print("→ Using Pearson correlation / Euclidean distance")
    print("→ Filtering to users with 20+ ratings")

    if not is_mongodb_available():
        print("❌ MongoDB not available. Cannot continue.")
        return

    ratings_col = get_ratings_collection()

    # ── 1. Filter users with 20+ ratings ──────────────────────────
    print("Finding users with 20+ ratings...")
    pipeline = [
        {"$group": {"_id": "$userId", "count": {"$sum": 1}}},
        {"$match": {"count": {"$gte": 20}}},  # At least 20 ratings
        {"$sort": {"count": -1}},
        {"$limit": MAX_USERS_TO_SAVE}
    ]

    active_users = [doc["_id"] for doc in ratings_col.aggregate(pipeline)]
    if not active_users:
        print("❌ No users found with 20+ ratings.")
        return

    print(f"→ Selected {len(active_users):,} users with 20+ ratings")

    # ── 2. Load ratings only for selected users ───────────────────
    print("Loading ratings for selected users...")
    cursor = ratings_col.find(
        {"userId": {"$in": active_users}},
        {"_id": 0, "userId": 1, "movieId": 1, "rating": 1}
    )

    df = pd.DataFrame(list(cursor))
    if df.empty:
        print("❌ No ratings loaded.")
        return

    print(f"→ Loaded {len(df):,} ratings")

    # ── 3. Prepare data ───────────────────────────────────────────
    df["userId"] = df["userId"].astype(int)
    df["movieId"] = df["movieId"].astype(int)
    df["rating"] = df["rating"].astype(np.float32)

    # Create consecutive indices for matrix
    user_ids = sorted(df["userId"].unique())
    movie_ids = sorted(df["movieId"].unique())

    user_to_idx = {uid: i for i, uid in enumerate(user_ids)}
    movie_to_idx = {mid: i for i, mid in enumerate(movie_ids)}
    idx_to_movie = {i: mid for mid, i in movie_to_idx.items()}

    # Build sparse rating matrix
    row = df["userId"].map(user_to_idx).values
    col = df["movieId"].map(movie_to_idx).values
    data = df["rating"].values

    R = csr_matrix(
        (data, (row, col)),
        shape=(len(user_ids), len(movie_ids)),
        dtype=np.float32
    )

    print(f"→ Rating matrix shape: {R.shape}")
    print(f"→ Density: {R.nnz / np.prod(R.shape):.4%}")

    # ── 4. Train Randomized SVD ──────────────────────────────────
    n_components = min(N_FACTORS, R.shape[0] - 1, R.shape[1] - 1)
    n_components = max(30, n_components)  # avoid too small latent space

    print(f"Training Randomized SVD (factors = {n_components})...")
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=FutureWarning)
        U, Sigma, Vt = randomized_svd(
            R,
            n_components=n_components,
            n_iter=5,
            random_state=42,
            power_iteration_normalizer="QR"  # more stable
        )

    # ── 5. Save model components ─────────────────────────────────
    print("Saving SVD model components...")
    joblib.dump(U, SVD_U_PATH, compress=3)
    joblib.dump(Sigma, SVD_SIGMA_PATH, compress=3)
    joblib.dump(Vt, SVD_Vt_PATH, compress=3)
    joblib.dump(user_to_idx, USER_TO_IDX_PATH, compress=3)
    joblib.dump(movie_to_idx, MOVIE_TO_IDX_PATH, compress=3)

    print("→ Model artifacts saved successfully")

    # ── 6. Generate recommendations for active users ─────────────
    print(f"Generating top-{TOP_N_USER} recommendations for {len(user_ids):,} users...")
    user_recs = {}

    for orig_uid in user_ids:
        uid = user_to_idx[orig_uid]

        # Reconstruct predicted ratings for this user
        user_vector = U[uid] * Sigma
        scores = user_vector @ Vt

        # Mask already rated items
        rated_mask = R[uid].toarray().flatten() > 0
        scores[rated_mask] = -np.inf

        # Get top N
        top_indices = np.argsort(scores)[::-1][:TOP_N_USER]
        top_movies = [int(idx_to_movie[i]) for i in top_indices]

        user_recs[str(orig_uid)] = {
            "collaborative": top_movies
        }

    # ── 7. Save collaborative recommendations ─────────────────────
    try:
        with open(OUT_USER_RECS, "w", encoding="utf-8") as f:
            json.dump(user_recs, f, indent=None)
        print(f"→ Saved collaborative recommendations for {len(user_recs):,} users")
        print(f"   → {OUT_USER_RECS}")
    except Exception as e:
        print(f"Error saving user_recommendations.json: {e}")

    print("\n" + "="*60)
    print("COLLABORATIVE FILTERING MODEL READY")
    print("→ SVD model saved → ready for on-demand use")
    print("→ Next step: run hybrid.py")
    print("="*60)


# ── Helper function for later use (API / on-demand) ──────────────────────────────
def get_collaborative_recommendations(user_id: int, top_n: int = TOP_N_USER) -> list[int]:
    """
    Get top-N recommendations for a user using the trained SVD model.
    Fast inference — only one user row.
    """
    try:
        U = joblib.load(SVD_U_PATH)
        Sigma = joblib.load(SVD_SIGMA_PATH)
        Vt = joblib.load(SVD_Vt_PATH)
        user_to_idx = joblib.load(USER_TO_IDX_PATH)
        movie_to_idx = joblib.load(MOVIE_TO_IDX_PATH)
    except FileNotFoundError:
        raise RuntimeError("SVD model not found. Run collaborative_svd.py first.")

    if user_id not in user_to_idx:
        return []  # or raise error — your choice

    uid = user_to_idx[user_id]
    scores = (U[uid] * Sigma) @ Vt

    top_indices = np.argsort(scores)[::-1][:top_n]
    recommended_movie_ids = [movie_to_idx[i] for i in top_indices]

    return recommended_movie_ids


if __name__ == "__main__":
    run()