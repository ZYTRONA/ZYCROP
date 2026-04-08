#!/bin/bash
# Run ZYCROP backend server
cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt -q

echo "Starting ZYCROP AI backend on http://0.0.0.0:8000"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
