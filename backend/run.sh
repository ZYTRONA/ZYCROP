#!/bin/bash
# Run ZYCROP backend server
cd "$(dirname "$0")"

VENV_PATH="../.venv"

if [ ! -d "$VENV_PATH" ]; then
  echo "Error: Virtual environment not found at $VENV_PATH"
  exit 1
fi

# Suppress TensorFlow and PyTorch verbose logging
export TF_CPP_MIN_LOG_LEVEL=2
export TF_ENABLE_ONEDNN_OPTS=1
export PYTHONWARNINGS="ignore::UserWarning"

echo "✨ Starting ZYCROP AI Backend..."
echo "📍 API running on http://localhost:8888"
echo "📖 Docs available at http://localhost:8888/docs"
echo ""

$VENV_PATH/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8888 --workers 1 2>&1 | grep -v "^I0000\|^WARNING: All log\|^To enable the following"
