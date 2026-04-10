# 🚀 OFFLINE SETUP GUIDE FOR ZYCROP

This guide ensures the backend runs **completely offline** without requiring internet connection after initial setup.

---

## 📋 Prerequisites

1. **Python 3.11** (TensorFlow wheels not available for 3.14)
2. **MongoDB** (local instance for farms database)
3. **Git** (already have if you cloned this repo)

---

## ⚙️ Step 1: Set Up Python Virtual Environment

```bash
# Navigate to project root
cd ZYCROP

# Create virtual environment with Python 3.11
python3.11 -m venv .venv

# Activate it
source .venv/bin/activate  # macOS/Linux
# or
.venv\Scripts\activate  # Windows
```

---

## 📦 Step 2: Install Backend Dependencies

```bash
cd backend

# Install all required packages
pip install -r requirements.txt --quiet
```

**What gets installed:**
- FastAPI, Uvicorn (web server)
- TensorFlow 2.21 + Keras
- PyTorch + Torchvision (YOLOv8)
- Ultralytics YOLOv8
- faster-whisper (offline speech-to-text)
- ctranslate2 (offline translation)
- sentence-transformers (embeddings)
- Motor (async MongoDB driver)

---

## 🤖 Step 3: Pre-Download ML Models (IMPORTANT FOR OFFLINE USE)

Run this script to download all models **once**:

```bash
python download_models.py
```

**Models Downloaded:**
- ✅ YOLOv8 Nano (~12 MB) - Fast detection
- ✅ YOLOv8 Medium (~49 MB) - Production accuracy
- ✅ TensorFlow/TFLite disease classifier (already in `models/`)
- ✅ Sentence-Transformers embedding model (~70 MB)
- ✅ faster-whisper tiny model (~75 MB) - Offline STT
- ✅ NLTK data - Offline NLP

**Cache Locations:**
```
~/.cache/ultralytics/        # YOLOv8 models
~/.cache/huggingface/        # Sentence-transformers
~/.cache/faster_whisper/     # Whisper STT model
~/nltk_data/                 # NLTK corpora
```

⏱ **Total Download Time:** 5-10 minutes (one time only)

---

## 🗄️ Step 4: Set Up MongoDB Locally

### Option A: Using Docker (Recommended)

```bash
# Pull MongoDB Docker image
docker pull mongo:latest

# Run MongoDB on port 27017
docker run -d --name zycrop-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=ZYCROP \
  mongo:latest

# Verify it's running
docker ps | grep zycrop-mongo
```

### Option B: Install MongoDB Locally

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

**Windows:**
- Download: https://www.mongodb.com/try/download/community
- Run installer and follow setup wizard

### Verify MongoDB is Running

```bash
mongosh  # opens MongoDB shell
> db.version()
6.0.0  # or similar
> exit
```

---

## 🔐 Step 5: Configure Environment Variables

Create `.env` file in `backend/` folder:

```bash
cd backend
cp .env.example .env
```

The `.env` file should contain:

```env
# ─── MongoDB (local instance) ────────────────────────────────────────
MONGO_URL=mongodb://localhost:27017/ZYCROP

# ─── API Keys (optional, for online features) ────────────────────────
# Only needed if you want to use these services:
# Leave empty for pure offline operation

OPENAI_API_KEY=
BHASHINI_API_URL=
BHASHINI_API_KEY=

# ─── Backend Server ──────────────────────────────────────────────────
BACKEND_PORT=8888
BACKEND_HOST=0.0.0.0
```

---

## ✅ Step 6: Verify Everything Works Offline

### Check Python Environment

```bash
cd backend
python verify_setup.py
```

**Expected Output:**
```
✅ TensorFlow available
✅ YOLOv8 models cached
✅ sentence-transformers available
✅ faster-whisper available
✅ MongoDB reachable
[OK] All systems ready for offline operation
```

### Test Backend Startup

```bash
/path/to/.venv/bin/python -m uvicorn main:app \
  --app-dir /Users/jeeva/Documents/ZYCROP/backend \
  --host 0.0.0.0 --port 8888 --workers 1
```

**Expected Output:**
```
[OK] tensorflow.lite loaded as TFLite backend
[OK] sentence-transformers available
[OK] YOLOv8 (ultralytics) available
[OK] Detection routes integrated
[OK] Pipeline initialized successfully
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8888
```

---

## 🎯 Step 7: Run Full Stack Offline

### Terminal 1 - Start MongoDB
```bash
# If using Docker:
docker start zycrop-mongo

# Or if local installation:
mongod
```

### Terminal 2 - Start Backend
```bash
cd backend
# Using the absolute path as shown above
/full/path/to/.venv/bin/python -m uvicorn main:app \
  --app-dir /Users/jeeva/Documents/ZYCROP/backend \
  --host 0.0.0.0 --port 8888 --workers 1
```

### Terminal 3 - Start Frontend  
```bash
cd frontend
npm install  # first time only
npm start
```

---

## 🔌 OFFLINE OPERATION CHECKLIST

Before disconnecting from internet, ensure:

- [ ] YOLOv8 models downloaded (check `~/.cache/ultralytics/`)
- [ ] Sentence-transformers model cached (check `~/.cache/huggingface/`)
- [ ] faster-whisper model cached (check `~/.cache/faster_whisper/`)
- [ ] NLTK data available (check `~/nltk_data/`)
- [ ] MongoDB running locally (not cloud-based)
- [ ] TensorFlow models in `backend/models/`
- [ ] `.env` configured with `MONGO_URL=mongodb://localhost:27017/ZYCROP`

---

## 🚨 What Works OFFLINE

| Feature | Status | Notes |
|---------|--------|-------|
| 🌾 Disease Detection | ✅ OFFLINE | YOLO + TFLite classifier |
| 🔍 Leaf Analysis | ✅ OFFLINE | YOLOv8 + embeddings |
| 💬 Farm Logging | ✅ OFFLINE | Local MongoDB |
| 🌐 Voice Input (STT) | ✅ OFFLINE | faster-whisper |
| 🗣️ Translation | ✅ OFFLINE | IndicTrans2 (if installed) |
| 📊 Market Prices | ❌ NEEDS INTERNET | Cached data only |
| 🏦 Loan Advisor | ⚠️ LIMITED | Ollama LLM only, no OpenAI |
| 📱 Scheme Search | ✅ OFFLINE | Local RAG embeddings |

---

## 🧠 Memory Cache Optimization

First run downloads large models. Subsequent runs use cache:

```bash
# After first successful run, all models are cached:
~/.cache/ultralytics/models/detect/yolov8n.pt   (12 MB)
~/.cache/ultralytics/models/detect/yolov8m.pt   (49 MB)
~/.cache/huggingface/hub/sentence-transformers (70 MB)  
~/.cache/faster_whisper/                         (75 MB)

# Clear cache if needed:
rm -rf ~/.cache/ultralytics/
rm -rf ~/.cache/huggingface/
rm -rf ~/.cache/faster_whisper/
python download_models.py  # Re-download
```

---

## 🆘 Troubleshooting Offline Issues

### "Module not found: tensorflow"
```bash
# Reinstall in virtual environment
source .venv/bin/activate
pip install tensorflow==2.16.0 --no-cache-dir
```

### "MongoDB connection refused"
```bash
# Make sure MongoDB is running
docker ps | grep zycrop-mongo
# or
mongosh  # test connection
```

### "Model file not found: yolov8m.pt"
```bash
# Re-run download script
cd backend && python download_models.py
```

### "Sentence-transformers model not cached"
```bash
# Force re-download
pip install sentence-transformers --no-cache-dir --force-reinstall
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

---

## 📚 Next Steps

1. **Run the full stack** following Step 7 above
2. **Test disease detection** with a leaf image
3. **Verify offline operation** by disconnecting internet
4. **Share this guide** with your team

---

## 💡 For Your Team

Copy this entire guide to your team along with the cloned repo. They should:

1. Follow Steps 1-6 above
2. Ensure all models are downloaded before going offline
3. Keep MongoDB running for farm logging
4. Use `.env` file for any customization

**No API keys required for core functionality!**

---

## ⚡ Quick Start Commands (After Setup)

```bash
# Start everything
terminal-1: docker start zycrop-mongo
terminal-2: cd backend && /path/to/.venv/bin/python -m uvicorn main:app --app-dir . --host 0.0.0.0 --port 8888
terminal-3: cd frontend && npm start

# Stop everything
pkill -f uvicorn
docker stop zycrop-mongo
```

---

**Last Updated:** April 2026
**Status:** ✅ Fully Offline Ready
