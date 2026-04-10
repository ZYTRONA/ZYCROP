#!/bin/bash
# setup_leaf_detector.sh — Quick setup for TensorFlow Leaf Detector training

set -e

BACKEND_PATH="$( cd "$(dirname "${BASH_SOURCE[0]}")" && pwd )"
VENV_PATH="${BACKEND_PATH}/../.venv"

echo "================================================"
echo "TensorFlow Leaf Detector - Setup"
echo "================================================"

# Check if venv exists
if [ ! -d "$VENV_PATH" ]; then
    echo "[ERROR] Python venv not found at: $VENV_PATH"
    echo "Please ensure .venv is set up first"
    exit 1
fi

# Activate venv
echo "[SETUP] Activating Python environment..."
source "${VENV_PATH}/bin/activate"

# Check TensorFlow
echo "[CHECK] Verifying TensorFlow installation..."
python -c "import tensorflow as tf; print(f'[OK] TensorFlow {tf.__version__}')" || {
    echo "[WARN] TensorFlow not found, installing..."
    pip install tensorflow
}

# Check disease images
echo "[CHECK] Verifying disease images..."
DISEASE_PATH="${BACKEND_PATH}/../frontend/assets/disease_library"
if [ ! -d "$DISEASE_PATH" ]; then
    echo "[ERROR] Disease images not found at: $DISEASE_PATH"
    exit 1
fi

# Count disease images
IMAGE_COUNT=$(find "$DISEASE_PATH" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.avif" \) | wc -l)
echo "[OK] Found $IMAGE_COUNT disease images"

# Create models directory
mkdir -p "${BACKEND_PATH}/models"

echo ""
echo "================================================"
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Train the model (takes 5-10 minutes):"
echo "   python ${BACKEND_PATH}/train_leaf_detector.py"
echo ""
echo "2. Test the model:"
echo "   python ${BACKEND_PATH}/test_leaf_detector.py"
echo ""
echo "3. Integrate into pipeline (see LEAF_DETECTOR_TRAINING.md)"
echo ""
echo "4. Restart backend and test on phone"
echo ""
