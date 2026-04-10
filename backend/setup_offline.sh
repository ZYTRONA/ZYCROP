#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# setup_offline.sh — ZYCROP AI Backend Offline Configuration
# ═══════════════════════════════════════════════════════════════════════════
#
# This script sets up and runs the ZYCROP backend in OFFLINE mode for 
# team collaboration without internet dependency.
#
# Usage:
#   source setup_offline.sh    # Load variables
#   python setup_offline.py    # Cache all models (run ONCE)
#   ./run.sh                   # Or: python -m uvicorn main:app ...
#
# ═══════════════════════════════════════════════════════════════════════════

set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="${BACKEND_DIR}/../.venv"

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ZYCROP AI Backend - Offline Setup"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Check Python & Virtual Environment
# ─────────────────────────────────────────────────────────────────────────────
if [ ! -d "$VENV_PATH" ]; then
    echo "❌ Virtual environment not found at: $VENV_PATH"
    echo ""
    echo "Please create it first:"
    echo "  cd $(dirname "$BACKEND_DIR")"
    echo "  python3.11 -m venv .venv"
    echo "  .venv/bin/pip install --upgrade pip"
    echo "  cd backend"
    echo "  ../.venv/bin/pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
source "$VENV_PATH/bin/activate"
echo "✓ Virtual environment activated: $VENV_PATH"

# ─────────────────────────────────────────────────────────────────────────────
# Offline Configuration
# ─────────────────────────────────────────────────────────────────────────────
export OFFLINE_MODE=true
export DISABLE_GOOGLE_TRANSLATE=false  # Set to 'true' for zero-internet operation
export DISABLE_OLLAMA=true             # Set to 'false' if Ollama is running locally
export DISABLE_BHASHINI=true           # Use local STT (faster-whisper) instead

export TF_CPP_MIN_LOG_LEVEL=2           # Reduce TensorFlow verbosity
export TF_ENABLE_ONEDNN_OPTS=1
export PYTHONWARNINGS="ignore::UserWarning"

echo "✓ Offline mode variables configured"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Check Model Files
# ─────────────────────────────────────────────────────────────────────────────
echo "Checking cached models..."

check_file() {
    local file=$1
    local name=$2
    if [ -f "$file" ]; then
        local size=$(du -h "$file" | cut -f1)
        echo "  ✓ $name ($size)"
        return 0
    else
        echo "  ✗ $name (missing - run: python setup_offline.py)"
        return 1
    fi
}

check_file "$BACKEND_DIR/yolov8n.pt" "YOLOv8 Nano"
check_file "$BACKEND_DIR/yolov8m.pt" "YOLOv8 Medium"
check_file "$BACKEND_DIR/models/my_crop_disease.tflite" "Disease Classifier (TFLite)"
check_file "$BACKEND_DIR/models/my_crop_disease.h5" "Disease Classifier (Keras)"
check_file "$BACKEND_DIR/models/labels.json" "Disease Labels"

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Pre-cache Models (if running for first time)
# ─────────────────────────────────────────────────────────────────────────────
read -p "Pre-cache ML models for offline operation? (y/n) [y]: " -n 1 -r CACHE_MODELS
CACHE_MODELS=${CACHE_MODELS:-y}
echo ""

if [[ $CACHE_MODELS =~ ^[Yy]$ ]]; then
    echo "Caching models (this may take 2-3 minutes on first run)..."
    python "$BACKEND_DIR/setup_offline.py"
    echo ""
fi

# ─────────────────────────────────────────────────────────────────────────────
# Server Ready
# ─────────────────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✓ OFFLINE SETUP READY"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Environment variables set:"
echo "  OFFLINE_MODE=$OFFLINE_MODE"
echo "  DISABLE_OLLAMA=$DISABLE_OLLAMA"
echo "  DISABLE_BHASHINI=$DISABLE_BHASHINI"
echo ""
echo "To start backend:"
echo "  ./run.sh"
echo "  OR"
echo "  python -m uvicorn main:app --host 0.0.0.0 --port 8888 --workers 1"
echo ""
echo "API will be available at: http://localhost:8888/docs"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
