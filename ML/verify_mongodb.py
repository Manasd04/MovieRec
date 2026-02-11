"""
MongoDB Data Verification Script
Run this to check if your movies and ratings collections are loaded correctly.
"""

from config import (
    is_mongodb_available,
    get_movies_collection,
    get_ratings_collection,
    DB_NAME,
    MOVIES_COLLECTION,
    RATINGS_COLLECTION,
)


def verify_mongodb_data():
    """Verify that MongoDB is connected and contains expected data."""
    print("\n" + "═" * 80)
    print(" MONGODB DATA VERIFICATION ".center(80))
    print("═" * 80 + "\n")

    # 1. Check connection
    if not is_mongodb_available():
        print("❌  MongoDB connection failed!")
        print("    Please check the following:")
        print("    • Is MongoDB server running? (mongod)")
        print("    • Is MONGO_URI correct in your environment / config?")
        print("    • Can you connect using MongoDB Compass / shell?")
        print("\n" + "═" * 80 + "\n")
        return False

    print(f"✓  Connected to MongoDB")
    print(f"   Database: {DB_NAME}\n")

    success = True

    # 2. Movies collection
    movies_col = get_movies_collection()
    if movies_col is None:
        print(f"❌  Cannot access collection: {MOVIES_COLLECTION}")
        success = False
    else:
        try:
            movies_count = movies_col.count_documents({})
            print(f"📽  Collection: {MOVIES_COLLECTION}")
            print(f"    Total documents: {movies_count:,}")

            if movies_count == 0:
                print("    ⚠️  WARNING: Collection is empty")
                print("    → You need to import movies data first")
                success = False
            else:
                # Show a clean sample
                sample = movies_col.find_one({}, {"_id": 0})
                if sample:
                    print("\n    Sample document (first fields):")
                    print("    " + "─" * 70)
                    for key, value in list(sample.items())[:7]:
                        val_str = str(value)[:60] + "..." if len(str(value)) > 60 else str(value)
                        print(f"    {key:<18}: {val_str}")
                    print("    " + "─" * 70)

        except Exception as e:
            print(f"❌  Error reading movies collection: {e}")
            success = False

    print()  # spacing

    # 3. Ratings collection
    ratings_col = get_ratings_collection()
    if ratings_col is None:
        print(f"❌  Cannot access collection: {RATINGS_COLLECTION}")
        success = False
    else:
        try:
            ratings_count = ratings_col.count_documents({})
            print(f"⭐  Collection: {RATINGS_COLLECTION}")
            print(f"    Total documents: {ratings_count:,}")

            if ratings_count == 0:
                print("    ⚠️  WARNING: Collection is empty")
                print("    → You need to import ratings data first")
                success = False
            else:
                # Show a clean sample
                sample = ratings_col.find_one({}, {"_id": 0})
                if sample:
                    print("\n    Sample document:")
                    print("    " + "─" * 70)
                    for key, value in sample.items():
                        print(f"    {key:<18}: {value}")
                    print("    " + "─" * 70)

        except Exception as e:
            print(f"❌  Error reading ratings collection: {e}")
            success = False

    # 4. Final summary
    print("\n" + "═" * 80)

    if success:
        print("✅  VERIFICATION PASSED")
        print(f"    You have {movies_count:,} movies and {ratings_count:,} ratings")
        print("    Ready to train recommendation models")
        print("    → Next step: python train_content_based.py  (or your training script)")
    elif movies_count > 0 and ratings_count == 0:
        print("⚠️  PARTIAL SUCCESS")
        print("    Movies are loaded, but ratings collection is empty")
        print("    → You can run content-based recommendations")
        print("    → But collaborative filtering & hybrid will not work")
    else:
        print("❌  VERIFICATION FAILED")
        print("    One or both collections are missing or empty")
        print("    → Please import your data (CSV → MongoDB) first")

    print("═" * 80 + "\n")

    return success


if __name__ == "__main__":
    verify_mongodb_data()