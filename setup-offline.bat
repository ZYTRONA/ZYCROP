@echo off
REM setup-offline.bat — Automated offline setup for ZYCROP development (Windows)
REM Run this after cloning the repo to set everything up locally

setlocal enabledelayedexpansion
set "PYTHON_MIN_VERSION=3.11"

echo.
echo ==================================
echo   ZYCROP Offline Setup (Windows)
echo ==================================
echo.

REM Check Python version
echo [1/6] Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found on PATH
    echo    Install Python 3.11+ from https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo.

REM Set up virtual environment
echo [2/6] Setting up virtual environment...
if not exist ".venv" (
    python -m venv .venv
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)
echo.

REM Install dependencies
echo [3/6] Installing dependencies...
cd backend
pip install -q -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    cd ..
    pause
    exit /b 1
)
echo ✅ Dependencies installed
cd ..
echo.

REM Download models
echo [4/6] Downloading ML models (5-10 minutes)...
cd backend
python download_models.py
cd ..
if errorlevel 1 (
    echo ❌ Model download failed
    pause
    exit /b 1
)
echo.

REM Set up environment files
echo [5/6] Setting up environment configuration...
cd backend
if not exist ".env" (
    copy .env.example .env
    echo ✅ Created backend\.env (customize if needed)
) else (
    echo ✅ backend\.env already exists
)
cd ..

cd frontend
if not exist ".env" (
    copy .env.example .env
    echo ✅ Created frontend\.env (customize if needed)
) else (
    echo ✅ frontend\.env already exists
)
cd ..
echo.

REM Check for MongoDB
echo [6/6] Checking MongoDB...
where mongod >nul 2>&1
if errorlevel 0 (
    echo ✅ MongoDB installed
    mongod --version
) else (
    where docker >nul 2>&1
    if errorlevel 0 (
        echo ✅ Docker available (can run MongoDB in container)
        docker --version
    ) else (
        echo ⚠️  MongoDB not found
        echo    Install MongoDB: https://www.mongodb.com/try/download/community
        echo    OR use Docker: docker pull mongo
    )
)
echo.

echo ==================================
echo   ✅ Setup Complete!
echo ==================================
echo.
echo Next steps:
echo.
echo 1. Start MongoDB (choose one):
echo    • Local: mongod
echo    • Docker: docker run -d -p 27017:27017 mongo
echo.
echo 2. Start backend (new terminal):
echo    cd backend
echo    ..\venv\Scripts\python -m uvicorn main:app --app-dir . --host 0.0.0.0 --port 8888
echo.
echo 3. Start frontend (new terminal):
echo    cd frontend
echo    npm install
echo    npm start
echo.
echo 4. Verify offline:
echo    • Disconnect from internet
echo    • All models are cached locally
echo    • MongoDB is running locally
echo.
pause
