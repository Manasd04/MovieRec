#!/bin/bash
# ══════════════════════════════════════════════════════════════════
# ML Model Training Automation Script (Linux/Mac)
# ══════════════════════════════════════════════════════════════════

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo "ML Model Training - Automated Run"
echo "══════════════════════════════════════════════════════════════════"
echo ""

# Change to ML directory (script directory)
cd "$(dirname "$0")"
echo "Current directory: $(pwd)"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

echo "✓ Python found: $(python3 --version)"
echo ""

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if ! python3 -c "from config import is_mongodb_available; import sys; sys.exit(0 if is_mongodb_available() else 1)" &> /dev/null; then
    echo "❌ ERROR: MongoDB is not available"
    echo "Please start MongoDB service and try again"
    echo ""
    echo "To start MongoDB:"
    echo "  sudo systemctl start mongod    # Linux"
    echo "  brew services start mongodb    # Mac"
    echo ""
    exit 1
fi

echo "✓ MongoDB connection successful"
echo ""

# Run training pipeline
echo "══════════════════════════════════════════════════════════════════"
echo "Starting ML Training Pipeline..."
echo "══════════════════════════════════════════════════════════════════"
echo ""

python3 train_models.py

if [ $? -eq 0 ]; then
    echo ""
    echo "══════════════════════════════════════════════════════════════════"
    echo "✅ Training completed successfully!"
    echo "══════════════════════════════════════════════════════════════════"
    echo ""
    echo "Next steps:"
    echo "1. Restart the backend server to load new recommendations"
    echo "2. Test recommendations at http://localhost:3000/recommendations"
    echo ""
else
    echo ""
    echo "══════════════════════════════════════════════════════════════════"
    echo "❌ Training failed with error code $?"
    echo "══════════════════════════════════════════════════════════════════"
    echo ""
    echo "Please check the error messages above and:"
    echo "1. Verify MongoDB has movie and rating data"
    echo "2. Check ML/config.py settings"
    echo "3. Ensure all Python dependencies are installed"
    echo ""
    exit 1
fi
