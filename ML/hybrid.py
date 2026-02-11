import json
from pathlib import Path

from config import (
    OUT_USER_RECS,
    OUT_CONTENT_BASED,
    OUT_MOVIES_JSON,
)

# ──────────────────────────────────────────────────────────────
# Hybrid: Weighted combination of all algorithms
# Uses all data (ratings + movies)
# ──────────────────────────────────────────────────────────────

CONTENT_WEIGHT = 0.4
COLLABORATIVE_WEIGHT = 0.4
TFIDF_WEIGHT = 0.2


def run():
    """
    Creates hybrid recommendations by combining:
    - Content-based (Jaccard + Cosine): 40%
    - Collaborative (SVD with Pearson): 40%
    - TF-IDF (Cosine similarity): 20%
    
    Uses all available data from all algorithms.
    """
    print("Hybrid model training started...")
    print(f"→ Combining all algorithms with weighted scores:")
    print(f"   - Content-based (Jaccard+Cosine): {CONTENT_WEIGHT * 100}%")
    print(f"   - Collaborative (SVD+Pearson): {COLLABORATIVE_WEIGHT * 100}%")
    print(f"   - TF-IDF (Cosine): {TFIDF_WEIGHT * 100}%")

    # ── Load all recommendation sources ───────────────────────────
    content_recs = {}
    collab_recs = {}
    tfidf_recs = {}

    # Load content-based recommendations
    if Path(OUT_CONTENT_BASED).exists():
        with open(OUT_CONTENT_BASED, "r", encoding="utf-8") as f:
            content_recs = json.load(f)
        print(f"→ Loaded content-based: {len(content_recs):,} movies")
    else:
        print("⚠️  Content-based recommendations not found")

    # Load collaborative recommendations
    if Path(OUT_USER_RECS).exists():
        with open(OUT_USER_RECS, "r", encoding="utf-8") as f:
            user_data = json.load(f)
            # Extract collaborative recommendations from user data
            for user_id, data in user_data.items():
                if isinstance(data, dict) and "collaborative" in data:
                    for movie_id in data["collaborative"]:
                        if str(movie_id) not in collab_recs:
                            collab_recs[str(movie_id)] = []
        print(f"→ Loaded collaborative: {len(collab_recs):,} movies")
    else:
        print("⚠️  Collaborative recommendations not found")

    # Load TF-IDF recommendations
    tfidf_path = OUT_MOVIES_JSON.replace("movies.json", "tfidf_recommendations.json")
    if Path(tfidf_path).exists():
        with open(tfidf_path, "r", encoding="utf-8") as f:
            tfidf_recs = json.load(f)
        print(f"→ Loaded TF-IDF: {len(tfidf_recs):,} movies")
    else:
        print("⚠️  TF-IDF recommendations not found")

    if not content_recs and not collab_recs and not tfidf_recs:
        print("❌ No recommendation sources available. Run other models first.")
        return

    # ── Combine recommendations with weighted scoring ─────────────
    print("Combining recommendations with weighted scores...")
    hybrid_recs = {}

    # Get all unique movie IDs
    all_movie_ids = set()
    all_movie_ids.update(content_recs.keys())
    all_movie_ids.update(collab_recs.keys())
    all_movie_ids.update(tfidf_recs.keys())

    print(f"→ Processing {len(all_movie_ids):,} unique movies...")

    for movie_id in all_movie_ids:
        movie_id_str = str(movie_id)
        
        # Collect recommendations from each source
        content_list = content_recs.get(movie_id_str, [])
        collab_list = collab_recs.get(movie_id_str, [])
        tfidf_list = tfidf_recs.get(movie_id_str, [])

        # Score each recommended movie
        scores = {}

        # Content-based scores (higher position = higher score)
        for idx, rec_id in enumerate(content_list[:20]):
            score = (20 - idx) * CONTENT_WEIGHT
            scores[rec_id] = scores.get(rec_id, 0) + score

        # Collaborative scores
        for idx, rec_id in enumerate(collab_list[:20]):
            score = (20 - idx) * COLLABORATIVE_WEIGHT
            scores[rec_id] = scores.get(rec_id, 0) + score

        # TF-IDF scores
        for idx, rec_id in enumerate(tfidf_list[:20]):
            score = (20 - idx) * TFIDF_WEIGHT
            scores[rec_id] = scores.get(rec_id, 0) + score

        # Sort by combined score and take top recommendations
        sorted_recs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        hybrid_recs[movie_id_str] = [int(rec_id) for rec_id, _ in sorted_recs[:20]]

    # ── Save hybrid recommendations ───────────────────────────────
    hybrid_output = OUT_MOVIES_JSON.replace("movies.json", "hybrid_recommendations.json")
    print(f"Saving hybrid recommendations to {hybrid_output}...")
    with open(hybrid_output, "w", encoding="utf-8") as f:
        json.dump(hybrid_recs, f, indent=2)

    print(f"✅ Hybrid model complete!")
    print(f"   → {len(hybrid_recs):,} movies with hybrid recommendations")
    print(f"   → Saved to: {hybrid_output}")


if __name__ == "__main__":
    run()