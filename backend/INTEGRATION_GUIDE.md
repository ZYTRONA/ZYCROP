"""
INTEGRATION_GUIDE.md — YOLOv8 Detection Pipeline Integration
===========================================================

This guide explains how to integrate the new structured detection pipeline
into your ZYCROP FastAPI backend.

## Table of Contents
1. Architecture Overview
2. Setup Instructions
3. Integration Steps
4. Migration from Old Endpoint
5. Configuration
6. Testing & Debugging
7. Production Deployment

═══════════════════════════════════════════════════════════════════════════════

## 1. Architecture Overview

### NEW PIPELINE FLOW:
Input Image
    ↓
[ImageValidator] - Validate size, format, dimensions
    ↓
[YOLOv8 Detector] - Detect leaves/plants (with bounding boxes)
    ↓
[Disease Classifier] - Classify disease for each leaf
    ↓
Output: Structured analysis with locations + predictions

### KEY MODULES:
- detection/base.py          : Abstract interfaces for all detectors
- detection/yolo_detector.py : YOLOv8 real-time object detection
- detection/disease_classifier.py : MobileNetV2 disease classification
- detection/pipeline.py      : Orchestration & coordination
- detection_routes.py        : FastAPI endpoints using pipeline
- utils/logger.py           : Production-grade structured logging
- utils/validators.py       : Input validation & preprocessing
- config.py                 : Centralized configuration

═══════════════════════════════════════════════════════════════════════════════

## 2. Setup Instructions

### Step 1: Install Dependencies
pip install -r requirements.txt

(Already includes ultralytics, torch, torchvision for YOLOv8)

### Step 2: Download YOLO Model (optional - auto-downloads first run)
python -c "from ultralytics import YOLO; YOLO('yolov8m.pt')"

This downloads ~49 MB YOLOv8 Medium model to ~/.cache/

### Step 3: Verify Installation
python backend/verification_script.py

This will test all components and show readiness status.

═══════════════════════════════════════════════════════════════════════════════

## 3. Integration Steps

### Option A: MINIMAL INTEGRATION (Add to existing main.py)

In your main.py FastAPI app, add these imports at the top:

```python
from detection_routes import router as detection_router
from detection_routes import initialize_pipeline, shutdown_pipeline

app = FastAPI(title="ZYCROP AI", version="2.0.0")

# Add detection routes
app.include_router(detection_router)

# Startup event
@app.on_event("startup")
async def startup_event():
    # ... your existing startup code ...
    # Initialize pipeline
    await initialize_pipeline()

# Shutdown event  
@app.on_event("shutdown")
async def shutdown_event():
    # ... your existing shutdown code ...
    # Cleanup pipeline
    await shutdown_pipeline()
```

This automatically adds:
- POST /api/diagnose        - Full analysis with all detections
- POST /api/diagnose/quick  - Fast analysis with primary disease only
- GET  /api/pipeline/status - Check pipeline readiness

### Option B: FULL MIGRATION (Replace old endpoint)

See section "Migration from Old Endpoint" below.

═══════════════════════════════════════════════════════════════════════════════

## 4. Migration from Old Endpoint

### OLD ENDPOINT (to be deprecated):
```
POST /api/diagnose
Input:  { image: file, farmer_id: string }
Output: { disease, confidence, severity, treatment_plan, ... }
```

### NEW ENDPOINT (improved):
```
POST /api/diagnose
Input:  { 
  image: file, 
  farmer_id: string,
  analyze_all: bool = true,
  max_leaves: int = null,
  confidence_threshold: float = null
}
Output: { 
  status: string,
  total_time_ms: float,
  detections_found: int,
  analyzed: int,
  leaves: [
    {
      leaf_id: int,
      location: { bbox: [x1,y1,x2,y2], area: float },
      disease: { disease: string, confidence: float, top_predictions: [] },
      composite_confidence: float,
      analysis_time_ms: float
    }
  ],
  primary_disease: string,
  primary_confidence: float,
  errors: []
}
```

### BENEFITS OF MIGRATION:
✓ Real-time leaf localization (bounding boxes showing WHERE the disease is)
✓ Analyzes MULTIPLE leaves in single image
✓ Per-leaf confidence scores
✓ Performance metrics for each detection
✓ Structured error handling
✓ Extensible for future models

### BACKEND INTEGRATION CHECKLIST:
- [ ] Update requirements.txt ✓ (Already done!)
- [ ] Copy detection/ folder to backend
- [ ] Copy utils/ folder to backend
- [ ] Copy config.py to backend
- [ ] Copy detection_routes.py to backend
- [ ] Add startup/shutdown handlers in main.py (see Option A above)
- [ ] Test with sample image
- [ ] Update React Native frontend (see below)

═══════════════════════════════════════════════════════════════════════════════

## 5. Configuration

All configuration in config.py. Key settings:

```python
# YOLO Detection Thresholds
DETECTION_CONFIG['yolo']['confidence_threshold'] = 0.45  # Lower = more detections
DETECTION_CONFIG['yolo']['iou_threshold'] = 0.45        # NMS threshold
DETECTION_CONFIG['yolo']['max_detections'] = 100        # Max objects per image

# Disease Classification
DETECTION_CONFIG['disease_classifier']['confidence_threshold'] = 0.60
DETECTION_CONFIG['disease_classifier']['top_k'] = 5  # Return top 5 predictions

# Pipeline
DETECTION_CONFIG['pipeline']['max_inference_time'] = 5.0  # seconds timeout
DETECTION_CONFIG['pipeline']['skip_no_detections'] = True # Skip classification if no leaves

# Performance
PERFORMANCE['device'] = 'cpu'  # 'cpu' or 'cuda' (if GPU available)
PERFORMANCE['use_tensorrt'] = False  # Requires NVIDIA libs
PERFORMANCE['use_onnx'] = False  # Use ONNX Runtime (optional)

# Models
MODELS['yolo_detector']['model_name'] = 'yolov8m'  # nano, small, medium, large, xlarge
# Smaller = faster but less accurate
# Larger = slower but more accurate
```

### Environment Variables (Optional Override):
```bash
export YOLO_CONF=0.5
export DISEASE_CONF=0.65
export DEVICE=cuda  # Use GPU if available
export MAX_INFERENCE_TIME=3.0
export DEBUG=true
```

═══════════════════════════════════════════════════════════════════════════════

## 6. Testing & Debugging

### Quick Test Script:
```python
# test_pipeline.py
from pathlib import Path
from PIL import Image
import numpy as np
from detection import DetectionPipeline

# Initialize
pipeline = DetectionPipeline(yolo_model_size='m')
if not pipeline.initialize():
    print("Pipeline initialization failed!")
    exit(1)

# Load image
img = Image.open("test_leaf.jpg").convert('RGB')
image_array = np.array(img, dtype=np.float32) / 255.0

# Process
result = pipeline.process_image(image_array)

# Print results
print(f"Detections: {result.detections_count}")
print(f"Analyzed: {result.analyzed_count}")
for leaf in result.leaves:
    print(f"  Leaf {leaf.leaf_index}: {leaf.disease_prediction}")

pipeline.shutdown()
```

### Debug Mode:
Set DEBUG=true in environment to see detailed logs:
```bash
DEBUG=true ENVIRONMENT=development python main.py
```

### Common Issues:

1. YOLO model download fails:
   - Check internet connection
   - Manual download: python -c "from ultralytics import YOLO; YOLO('yolov8m.pt')"

2. Out of memory:
   - Use smaller model: yolov8n (nano) instead of yolov8l (large)
   - Reduce image resolution in preprocessing
   - Use GPU: export DEVICE=cuda

3. Pipeline not initializing:
   - Check model paths in config.py
   - Verify plant_disease.tflite exists in backend/models/
   - Check logs: grep "ERROR" logs/*.log

═══════════════════════════════════════════════════════════════════════════════

## 7. Production Deployment

### Pre-Production Checklist:
- [ ] Load test with production image volume
- [ ] Profile inference time distribution
- [ ] Configure error alerting
- [ ] Set up model monitoring
- [ ] Test on target hardware (your server specs)

### Performance Optimization:

1. Model Selection:
   - Development: yolov8m (medium) - good balance
   - Production (speed): yolov8n (nano) - super fast
   - Production (accuracy): yolov8l (large) - best accuracy

2. Quantization (faster inference):
   - ONNX Runtime: set USE_ONNX=true
   - TFLite: export both models to TFLite
   - Note: Requires retraining with quantization

3. Batch Processing:
   For processing multiple images, collect into batch:
   - Load pipeline once
   - Process ~10-20 images sequentially
   - Unload pipeline

### Example Production Setup:
```python
# Using gunicorn with 4 workers (one pipeline per worker)
# gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app

# Each worker initializes its own pipeline on startup
# Handles concurrent requests efficiently
```

### Monitoring & Metrics:
All operations log to structured JSON:
- detection_logger: Detection event metrics
- performance_logger: Inference time, model load time
- error_logger: Failures and exceptions

Query logs to track:
- Average inference time per leaf
- Detection success rate
- Error frequency
- Model load time

═══════════════════════════════════════════════════════════════════════════════

## 8. Next Steps

### PHASE 2: Frontend Integration
Update React Native app to:
1. Display leaf bounding boxes on camera feed
2. Show per-leaf disease predictions
3. Render confidence scores
4. Add performance stats UI

See: FRONTEND_INTEGRATION.md

### PHASE 3: Advanced Features
- Real-time streaming (WebSocket for live preview)
- Leaf counting analytics
- Disease severity mapping
- Recommendation engine based on disease + crop type

═══════════════════════════════════════════════════════════════════════════════

For questions or issues, see:
- Config Reference: config.py
- Logger Details: utils/logger.py
- Detection Pipeline: detection/pipeline.py
- API Examples: detection_routes.py
"""


# ─── INTEGRATION TEST SCRIPT ──────────────────────────────────────────────────

if __name__ == "__main__":
    print(__doc__)
    
    print("\n" + "="*80)
    print("INTEGRATION READY")
    print("="*80)
    print("\nTo integrate into main.py:")
    print("1. Add to imports: from detection_routes import router, initialize_pipeline, shutdown_pipeline")
    print("2. Add to app: app.include_router(router)")
    print("3. Add to @app.on_event('startup'): await initialize_pipeline()")
    print("4. Add to @app.on_event('shutdown'): await shutdown_pipeline()")
    print("\nNew endpoints available:")
    print("  POST /api/diagnose        - Full analysis")
    print("  POST /api/diagnose/quick  - Fast analysis")
    print("  GET  /api/pipeline/status - Check status")
    print("\n" + "="*80 + "\n")
