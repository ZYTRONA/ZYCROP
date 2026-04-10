#!/bin/bash
# setup-offline.sh — Automated offline setup for ZYCROP development
# Run this after cloning the repo to set everything up locally

set -e

echo "=================================="
echo "  ZYCROP Offline Setup"
echo "=================================="
echo ""

# Check Python version
echo "[1/6] Checking Python version..."
python_version=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
if [[ "${python_version}" < "3.11" ]]; then
    echo "❌ Python 3.11+ required (found $python_version)"
    echo "   Install Python 3.11 from https://www.python.org/downloads/"
    exit 1
fi
echo "✅ Python $python_version"
echo ""

# Set up virtual environment
echo "[2/6] Setting up virtual environment..."
if [ ! -d ".venv" ]; then
    python3.11 -m venv .venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
source .venv/bin/activate
echo ""

# Install dependencies
echo "[3/6] Installing dependencies..."
cd backend
pip install -q -r requirements.txt
echo "✅ Dependencies installed"
cd ..
echo ""

# Download models
echo "[4/6] Downloading ML models (5-10 minutes)..."
cd backend
python download_models.py
cd ..
echo ""

# Set up environment files
echo "[5/6] Setting up environment configuration..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created backend/.env (customize if needed)"
else
    echo "✅ backend/.env already exists"
fi
cd ..

cd frontend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created frontend/.env (customize if needed)"
else
    echo "✅ frontend/.env already exists"
fi
cd ..
echo ""

# Check for MongoDB
echo "[6/6] Checking MongoDB..."
if command -v mongosh &> /dev/null; then
    echo "✅ MongoDB CLI installed"
    mongosh --version
elif command -v docker &> /dev/null; then
    echo "✅ Docker available (can run MongoDB in container)"
    docker --version
else
    echo "⚠️  MongoDB not found"
    echo "   Install MongoDB locally: https://www.mongodb.com/try/download/community"
    echo "   OR use Docker: docker pull mongo:latest"
fi
echo ""

echo "=================================="
echo "  ✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start MongoDB (choose one):"
echo "   • Local: mongod"
echo "   • Docker: docker run -d -p 27017:27017 mongo"
echo ""
echo "2. Start backend:"
echo "   cd backend"
echo "   /absolute/path/to/.venv/bin/python -m uvicorn main:app --app-dir . --host 0.0.0.0 --port 8888"
echo ""
echo "3. Start frontend (new terminal):"
echo "   cd frontend"
echo "   npm install  # first time only"
echo "   npm start"
echo ""
echo "4. Verify offline:"
echo "   • Disconnect from internet"
echo "   • All models are cached locally"
echo "   • MongoDB is running locally"
echo ""
