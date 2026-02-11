"""
Full ML pipeline (MongoDB-based):
1. Content-Based (TF-IDF + Cosine)
2. Collaborative Filtering (SVD)
3. Hybrid Recommendation

Run:
    python train_models.py
"""

import time
from typing import Callable

from config import is_mongodb_available, close_mongodb_connection
from content_based import run as run_content
from collaborative_svd import run as run_collab
from hybrid import run as run_hybrid


def run_step(name: str, func: Callable[[], None]) -> bool:
    """Run a pipeline step with timing and error handling."""
    print("\n" + "═" * 70)
    print(f" STARTING: {name.upper()} ".center(70))
    print("═" * 70 + "\n")

    start = time.time()
    try:
        func()
        elapsed = time.time() - start
        print(f"\n✓ {name} completed successfully in {elapsed:.1f} seconds")
        return True
    except Exception as e:
        elapsed = time.time() - start
        print(f"\n❌ {name} FAILED after {elapsed:.1f} seconds")
        print(f"   Error: {e}")
        return False
    finally:
        print("-" * 70)


def main():
    print("🚀 Starting complete ML training pipeline")
    print(f"   Current time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   MongoDB available: {'YES' if is_mongodb_available() else 'NO'}")
    print("-" * 70 + "\n")

    if not is_mongodb_available():
        raise RuntimeError("MongoDB is not available. Please start MongoDB.")

    # Step 1: Content-based
    content_ok = run_step("Content-based model (TF-IDF)", run_content)

    # Step 2: Collaborative filtering
    collab_ok = run_step("Collaborative filtering (SVD)", run_collab)

    # Step 3: Hybrid recommendations
    hybrid_ok = run_step("Hybrid recommendation blending", run_hybrid)

    # Close MongoDB connection
    try:
        close_mongodb_connection()
        print("✓ MongoDB connection closed cleanly")
    except Exception as e:
        print(f"Warning: could not close MongoDB connection: {e}")

    # Summary
    print("\n" + "═" * 80)
    print(" TRAINING PIPELINE SUMMARY ".center(80))
    print("═" * 80 + "\n")

    print(f"Content-based model:      {'✅ Success' if content_ok else '❌ Failed'}")
    print(f"Collaborative SVD model:  {'✅ Success' if collab_ok else '❌ Failed'}")
    print(f"Hybrid blending:          {'✅ Success' if hybrid_ok else '❌ Failed'}")

    if content_ok and collab_ok and hybrid_ok:
        print("\n🎉 ALL STEPS COMPLETED SUCCESSFULLY")
        print("   You can now use the trained models in the backend/frontend.")
    else:
        print("\n⚠️ Pipeline completed with errors. Fix failed steps above.")

    print("\n" + "═" * 80)


if __name__ == "__main__":
    main()
