# ✅ Team Setup Checklist for ZYCROP Offline Development

Use this checklist to ensure your team's setup is complete and ready for offline operation.

## Before Cloning the Repo

- [ ] **Python 3.11+** installed (`python3 --version`)
- [ ] **Git** installed and configured
- [ ] **Docker** installed (for MongoDB) OR MongoDB local installation planned
- [ ] **Node.js & npm** installed (version 16+)
- [ ] At least **5 GB free disk space** (for models)

---

## After Cloning the Repo

### Backend Setup

- [ ] **Virtual environment created** 
  ```bash
  python3.11 -m venv .venv
  source .venv/bin/activate  # macOS/Linux
  # or .venv\Scripts\activate  # Windows
  ```

- [ ] **Dependencies installed**
  ```bash
  cd backend && pip install -r requirements.txt
  ```

- [ ] **Models downloaded**
  ```bash
  python download_models.py
  # Check ~/.cache/ultralytics/ and ~/.cache/huggingface/ for cached files
  ```

- [ ] **`.env` file created in `backend/` folder**
  ```bash
  cp .env.example .env
  ```

- [ ] **`.env` values are correct**
  - `MONGO_URL=mongodb://localhost:27017/ZYCROP` (local)
  - Leave `OPENAI_API_KEY` blank (no chat for offline mode)
  - Leave `BHASHINI_API_KEY` blank (offline translation only)

### Frontend Setup

- [ ] **Dependencies installed**
  ```bash
  cd frontend && npm install
  ```

- [ ] **`.env` file created**
  ```bash
  cp .env.example .env
  ```

- [ ] **Backend URL correct in `.env`**
  - Set `EXPO_PUBLIC_BACKEND_API_URL` to your development machine's LAN IP
  - Example: `http://192.168.1.100:8888` (not localhost from phone!)

### Database Setup

- [ ] **MongoDB running locally**
  
  Option 1 - Docker (Recommended):
  ```bash
  docker run -d --name zycrop-mongo -p 27017:27017 mongo
  ```
  
  Option 2 - Local installation:
  ```bash
  mongod  # macOS/Linux
  ```

- [ ] **MongoDB is reachable**
  ```bash
  mongosh  # should open MongoDB shell without errors
  # then type: exit
  ```

---

## First Time Run

### Terminal 1 — Start MongoDB
```bash
# If Docker:
docker start zycrop-mongo

# If local:
mongod
```

### Terminal 2 — Start Backend API
```bash
cd backend
/path/to/.venv/bin/python -m uvicorn main:app \
  --app-dir . --host 0.0.0.0 --port 8888
```

**Expected Output:**
```
[OK] tensorflow.lite loaded as TFLite backend
[OK] sentence-transformers available
[OK] YOLOv8 (ultralytics) available
...
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8888
```

### Terminal 3 — Start Expo
```bash
cd frontend
npm start
```

**Expected Output:**
```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Terminal 4 — Test Backend Health (Optional)
```bash
curl http://localhost:8888/docs
# Should return FastAPI docs HTML (200 response)
```

---

## Offline Readiness Check

Before disconnecting from the internet, verify:

- [ ] Backend is running without errors
- [ ] Expo Metro bundler is running
- [ ] MongoDB is running locally
- [ ] Can scan leaf and get disease results
- [ ] Downloaded models exist:
  - `~/.cache/ultralytics/models/detect/yolov8n.pt` (12 MB)
  - `~/.cache/ultralytics/models/detect/yolov8m.pt` (49 MB)
  - `~/.cache/huggingface/hub/sentence-transformers*` (70 MB)
  - `~/.cache/faster_whisper/` (75 MB)
  - `~/nltk_data/` (NLTK corpora)

---

## Daily Usage (When Everything Is Set Up)

```bash
# Terminal 1
docker start zycrop-mongo  # Or: mongod

# Terminal 2
cd backend && /path/to/.venv/bin/python -m uvicorn main:app \
  --app-dir . --host 0.0.0.0 --port 8888

# Terminal 3
cd frontend && npm start
```

**Done!** Your team can now develop offline.

---

## Troubleshooting

### "Module not found"
```bash
source .venv/bin/activate
pip install -r requirements.txt --force-reinstall
```

### "MongoDB connection refused"
```bash
# Make sure MongoDB is running:
docker ps | grep zycrop-mongo
# or
mongosh  # test connection
```

### "Image too large" when scanning
- Ensure frontend is updated: `git pull origin main`
- Camera should capture max 4096x4096 pixels

### "Network request failed" on scan
- Check backend is running: `curl http://localhost:8888/docs`
- Check EXPO_PUBLIC_BACKEND_API_URL in frontend/.env is correct (not localhost!)
- Phone and Mac should be on same WiFi

### "Models won't download"
```bash
cd backend
python download_models.py
# Check caches:
ls ~/.cache/ultralytics/
ls ~/.cache/huggingface/
```

---

## Team Communication

When inviting teammates:

1. **Share this entire repo** (they get all docs)
2. **Share this checklist** — they follow it step-by-step
3. **Share the OFFLINE_SETUP_GUIDE.md** — they read it if they hit issues
4. **Provide your network IP** — so they can set correct BACKEND_API_URL
5. **Confirm MongoDB is running** before they start their session

---

## Monitoring & Logs

Keep these commands handy:

```bash
# Backend health
curl http://localhost:8888/docs

# Backend logs (from backend terminal, look for errors)
# Any "[ERROR]" or "[WARN]" messages need attention

# MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Expo logs  
# Check phone's Expo Go app for error messages

# Clear all caches if needed
rm -rf ~/.cache/ultralytics/
rm -rf ~/.cache/huggingface/
rm -rf ~/.cache/faster_whisper/
# Then re-run: python download_models.py
```

---

**Last Updated:** April 2026  
**Status:** ✅ Fully Offline Tested
