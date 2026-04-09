#!/usr/bin/env bash
# ─── ZYCROP — one-shot training setup ────────────────────────────────────────
# Run this AFTER Python 3.12 finishes building:
#   bash /run/media/aadhiasarana/E/ZYCROP/ZYCROP/backend/setup_and_train.sh
set -e

BACKEND="/run/media/aadhiasarana/E/ZYCROP/ZYCROP/backend"
PYTHON312="$HOME/.pyenv/versions/3.12.13/bin/python3.12"
VENV="$BACKEND/.venv312"

echo "======================================================="
echo " ZYCROP — Disease Detection Model Training Setup"
echo "======================================================="

# ── 1. Verify Python 3.12 ─────────────────────────────────────────────────────
if [[ ! -f "$PYTHON312" ]]; then
  echo "[ERROR] Python 3.12.13 not found at $PYTHON312"
  echo "        Wait for pyenv build to finish and re-run."
  exit 1
fi
echo "[OK] Python 3.12.13: $($PYTHON312 --version)"

# ── 2. Create venv ────────────────────────────────────────────────────────────
if [[ ! -d "$VENV" ]]; then
  echo "[1/4] Creating virtual environment..."
  "$PYTHON312" -m venv "$VENV"
fi
echo "[OK] venv: $VENV"

# ── 3. Install packages ───────────────────────────────────────────────────────
echo "[2/4] Installing packages (tensorflow ~2GB, may take 10-20 min)..."
"$VENV/bin/pip" install --upgrade pip --quiet
"$VENV/bin/pip" install \
  tensorflow==2.18.0 \
  tensorflow-datasets \
  Pillow \
  numpy \
  --quiet

echo "[OK] Packages installed."

# ── 4. Train ──────────────────────────────────────────────────────────────────
echo "[3/4] Training plant disease model on PlantVillage dataset..."
echo "      First run downloads dataset (~800 MB). Training: ~30-60 min on CPU."
echo ""
cd "$BACKEND"
"$VENV/bin/python" train_plant_model.py

echo ""
echo "[4/4] Training complete!"
echo "      Model saved at: $BACKEND/models/plant_disease.tflite"
echo "      Labels saved at: $BACKEND/models/labels.json"
echo ""
echo "══ NEXT STEPS ══════════════════════════════════════════"
echo " Start the backend server:"
echo "   cd $BACKEND && $VENV/bin/pip install fastapi uvicorn motor httpx faster-whisper sentence-transformers scikit-learn Pillow tflite-runtime"
echo "   $VENV/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
echo "========================================================"
