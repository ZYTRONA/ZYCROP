# ZYCROP — AI-Powered Agricultural Intelligence Platform

An offline-capable AI system for crop disease detection, pest identification, soil analysis, and farmer advisory—designed to work without internet after initial setup.

## 🚀 Quick Start (Offline Ready)

### For Your Team

```bash
# Clone the repo
git clone <repo-url>
cd ZYCROP

# Automated setup (macOS/Linux)
bash setup-offline.sh

# OR manual setup
python3.11 -m venv .venv
source .venv/bin/activate
cd backend && pip install -r requirements.txt
python download_models.py
```

**That's it!** All models are now cached locally for offline use.

### Start the Services

```bash
# Terminal 1: MongoDB
docker run -d -p 27017:27017 mongo  # or: mongod

# Terminal 2: Backend API
cd backend && /path/to/.venv/bin/python -m uvicorn main:app --app-dir . --host 0.0.0.0 --port 8888

# Terminal 3: Expo Frontend  
cd frontend && npm start
```

## 📋 What Works Offline

| Feature | Status | Details |
|---------|--------|---------|
| 🌾 **Disease Detection** | ✅ OFFLINE | YOLOv8 + TensorFlow |
| 🔍 **Pest Identification** | ✅ OFFLINE | Computer vision analysis |
| 🧪 **Soil Analysis** | ✅ OFFLINE | HSV color-based classification |
| 🗣️ **Voice Input (STT)** | ✅ OFFLINE | faster-whisper (CPU) |
| 📊 **Farm Logging** | ✅ OFFLINE | Local MongoDB |
| 🌐 **Scheme Finder** | ✅ OFFLINE | Local RAG embeddings |
| 💬 **Chat Bot** | ⚠️ LIMITED | Local Ollama (no internet LLM) |
| 📈 **Market Prices** | ❌ CACHED | Uses cached data only |

## 📚 Documentation

- **[OFFLINE_SETUP_GUIDE.md](OFFLINE_SETUP_GUIDE.md)** — Complete offline setup for teams
- **[backend/DETECTION_SYSTEM_README.md](backend/DETECTION_SYSTEM_README.md)** — AI model architecture
- **[backend/API_EXAMPLES.py](backend/API_EXAMPLES.py)** — API usage examples
- **[INTEGRATION_GUIDE_V2.md](INTEGRATION_GUIDE_V2.md)** — Frontend integration reference

---

# ZYCROP
