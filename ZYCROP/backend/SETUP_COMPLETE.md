# ✓ SETUP COMPLETE - Next Steps

## Installation Status

- ✅ **Dependencies**: Installed successfully!
- ✅ **Modules**: All verified
- ⏳ **Models**: Ready to download
- ⏳ **Integration**: Ready to integrate

---

## 🚀 Step 1: Download Pre-Trained Models (5 minutes)

**This is REQUIRED before running the backend.**

```bash
cd backend
python download_models.py
```

This downloads:
- YOLOv8 Nano (~12 MB) - Fast, for testing
- YOLOv8 Medium (~49 MB) - Production-grade accuracy

**Time estimate: 2-5 minutes** (depends on internet speed)

---

## 🔧 Step 2: Integrate into main.py (2 minutes)

Add these 8 lines to your existing `main.py`:

### At the TOP - Add Imports
```python
from detection_routes import router as detection_router
from detection_routes import initialize_pipeline, shutdown_pipeline
```

### After Creating FastAPI App - Include Router
```python
app.include_router(detection_router)
```

### In `@app.on_event("startup")` - Initialize Pipeline
```python
@app.on_event("startup")
async def startup_event():
    await initialize_pipeline()
    # ... rest of your startup code
```

### In `@app.on_event("shutdown")` - Cleanup
```python
@app.on_event("shutdown")
async def shutdown_event():
    await shutdown_pipeline()
    # ... rest of your shutdown code
```

---

## ✅ Step 3: Verify Integration (2 minutes)

### Start Backend
```bash
python main.py
```

### In Another Terminal - Test Endpoint
```bash
curl http://localhost:8000/api/pipeline/status | jq
```

**Expected Response:**
```json
{
  "status": "initialized",
  "yolo_loaded": true,
  "classifier_loaded": true,
  "yolo_model": "YOLOv8-m",
  "yolo_conf_threshold": 0.45,
  "disease_conf_threshold": 0.6
}
```

---

## 🧪 Step 4: Test with Sample Image (Optional)

### Test Full Diagnosis
```bash
curl -X POST http://localhost:8000/api/diagnose \
  -F "file=@/path/to/test_leaf.jpg" \
  -F "farmer_id=TN-CBE-9021" | jq
```

### Test Quick Diagnosis
```bash
curl -X POST http://localhost:8000/api/diagnose/quick \
  -F "file=@/path/to/test_leaf.jpg" | jq
```

---

## 📚 Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| `QUICK_REFERENCE.md` | Quick start & checklist | 5 min |
| `DETECTION_SYSTEM_README.md` | Complete technical docs | 15 min |
| `INTEGRATION_GUIDE.md` | Integration walkthrough | 15 min |
| `API_EXAMPLES.py` | 7 code examples | 20 min |

---

## 🆘 Troubleshooting

### Issue: Models won't download
```bash
# Check internet connection
ping google.com

# Manual download
python -c "from ultralytics import YOLO; YOLO('yolov8m.pt')"

# Check cache directory
ls ~/.cache/ultralytics/
```

### Issue: Pipeline still failing
```bash
# Run verification
python verify_setup.py

# Check error logs
tail -f logs/*.log
```

### Issue: Import errors
```bash
# Reinstall packages
pip install -r requirements.txt --force-reinstall

# Verify imports
python -c "from detection import DetectionPipeline; print('OK')"
```

---

## 🎯 Quick Commands Reference

```bash
# Download models (REQUIRED)
python download_models.py

# Verify everything
python verify_setup.py

# Run backend
python main.py

# Test API status
curl http://localhost:8000/api/pipeline/status | jq

# Test with image
curl -X POST http://localhost:8000/api/diagnose \
  -F "file=@test_leaf.jpg" | jq

# View logs
tail -f logs/*.log

# Enable debug mode
export DEBUG=true
python main.py
```

---

## ✨ You're Almost There!

Just 3 more commands:

```bash
# 1. Download models
python download_models.py

# 2. Integrate into main.py (manually - see above)

# 3. Test!
python main.py
curl http://localhost:8000/api/pipeline/status
```

**Then you're ready for Phase 2: Frontend Integration!** 🚀

---

**Status: 90% Complete - Just need model download + main.py integration**

