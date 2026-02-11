@echo off
REM ══════════════════════════════════════════════════════════════════
REM ML Model Training Automation Script (Windows)
REM ══════════════════════════════════════════════════════════════════

echo.
echo ══════════════════════════════════════════════════════════════════
echo ML Model Training - Automated Run
echo ══════════════════════════════════════════════════════════════════
echo.

REM Change to ML directory
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Check if Python is available
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo ✓ Python found
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
python -c "from config import is_mongodb_available; import sys; sys.exit(0 if is_mongodb_available() else 1)" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: MongoDB is not available
    echo Please start MongoDB service and try again
    echo.
    echo To start MongoDB:
    echo   net start MongoDB
    echo.
    pause
    exit /b 1
)

echo ✓ MongoDB connection successful
echo.

REM Run training pipeline
echo ══════════════════════════════════════════════════════════════════
echo Starting ML Training Pipeline...
echo ══════════════════════════════════════════════════════════════════
echo.

python train_models.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ══════════════════════════════════════════════════════════════════
    echo ✅ Training completed successfully!
    echo ══════════════════════════════════════════════════════════════════
    echo.
    echo Next steps:
    echo 1. Restart the backend server to load new recommendations
    echo 2. Test recommendations at http://localhost:3000/recommendations
    echo.
) else (
    echo.
    echo ══════════════════════════════════════════════════════════════════
    echo ❌ Training failed with error code %ERRORLEVEL%
    echo ══════════════════════════════════════════════════════════════════
    echo.
    echo Please check the error messages above and:
    echo 1. Verify MongoDB has movie and rating data
    echo 2. Check ML/config.py settings
    echo 3. Ensure all Python dependencies are installed
    echo.
)

pause
