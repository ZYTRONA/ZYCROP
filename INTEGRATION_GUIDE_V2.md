# ZYCROP AI Model Integration Guide
## Crop Disease Detection System Setup & Deployment

**Last Updated:** April 9, 2026  
**Version:** 2.0

---

## 📋 Overview

This guide covers the complete integration of a custom-trained MobileNetV2 crop disease detection model into your ZYCROP smart farming app. The integration includes:

- ✅ Training pipeline for custom crop disease classification
- ✅ Disease information database with detailed diagnostics
- ✅ Updated REST API endpoints with enhanced disease info
- ✅ Enhanced React Native UI with tabbed disease details
- ✅ Complete configuration management

---

## 📦 Deliverables

### 1. **train_model.py** 
**Location:** `backend/train_model.py`

**Purpose:** Complete training pipeline for MobileNetV2 transfer learning model

**Key Features:**
- Load PlantVillage dataset (38 crop disease classes)
- Transfer learning with ImageNet-pretrained weights
- Two-phase training (frozen base → fine-tuning)
- Data augmentation (rotation, flip, zoom, brightness)
- Automatic model saving (.h5 + quantized .tflite)
- Confusion matrix and classification report generation
- Model size optimization (typically 10-15 MB quantized)

**Usage:**
```bash
cd backend
python train_model.py
```

**Expected Outputs:**
- `backend/models/my_crop_disease.h5` — Full Keras model
- `backend/models/my_crop_disease.tflite` — Quantized TFLite model (mobile-friendly)
- `backend/models/labels.json` — Class labels mapping
- `backend/confusion_matrix.png` — Training evaluation visualization

**Configuration:**
```python
DATASET_PATH = "/Users/jeeva/Downloads/archive"  # Adjust to your dataset
EPOCHS = 20  # Training epochs
BATCH_SIZE = 32
INPUT_SIZE = 224  # MobileNetV2 input size
```

---

### 2. **disease_info.json**
**Location:** `backend/data/disease_info.json`

**Purpose:** Centralized disease information database for result enrichment

**Structure (per disease):**
```json
{
  "Tomato___Early_blight": {
    "disease_name": "Early Blight",
    "crop": "Tomato",
    "scientific_name": "Alternaria solani",
    "cause": "Fungal infection caused by...",
    "symptoms": "Dark brown spots with concentric rings...",
    "spread": "Spreads through infected soil and water splash...",
    "impact": "Can reduce yield by 20-30%...",
    "prevention": ["Rotate crops every season", "Use disease-free seeds"],
    "treatment": ["Apply Mancozeb fungicide", "Remove infected leaves"],
    "severity": "moderate",
    "affected_plant_part": "leaves"
  }
}
```

**Coverage:** All 38 PlantVillage dataset classes  
**Fields:** cause, symptoms, spread, impact, prevention, treatment, severity, scientific name

**Usage:** Automatically loaded by the backend and included in API responses

---

### 3. **disease_classifier.py** (UPDATED)
**Location:** `backend/detection/disease_classifier.py`

**Changes Made:**
- ✅ Updated to load custom TFLite model from `models/my_crop_disease.tflite`
- ✅ Loads labels from `models/labels.json`
- ✅ Added `_load_disease_info()` method to load disease database
- ✅ Updated `classify()` method to return disease_info in results
- ✅ Extended `ClassificationResult` to include disease details

**Key Methods:**
```python
disease_classifier = DiseaseClassifier(
    model_path="models/my_crop_disease.tflite",
    labels_path="models/labels.json",
    disease_info_path="data/disease_info.json"
)

result = disease_classifier.classify(image_array)
# Returns: class_id, confidence, disease_info (cause, symptoms, prevention, treatment, severity)
```

---

### 4. **detection_routes.py** (UPDATED)
**Location:** `backend/detection_routes.py`

**API Changes:**

#### Endpoint: `POST /api/diagnose`

**Enhanced Response Structure:**
```json
{
  "status": "success",
  "detections_found": 1,
  "primary_disease": "Tomato Early Blight",
  "primary_confidence": 0.94,
  "disease_info": {
    "cause": "Fungal infection caused by Alternaria solani...",
    "symptoms": "Dark brown spots with concentric rings...",
    "prevention": ["Rotate crops yearly", "Use disease-free seeds"],
    "treatment": ["Apply Mancozeb fungicide", "Remove infected leaves"],
    "severity": "moderate",
    "affected_plant_part": "leaves",
    "scientific_name": "Alternaria solani"
  },
  "leaves": [
    {
      "leaf_id": 1,
      "location": { "x1": 100, "y1": 150, "x2": 300, "y2": 400 },
      "disease": {
        "disease": "Tomato Early Blight",
        "confidence": 0.94,
        "top_predictions": [...],
        "disease_info": { ... }
      },
      "composite_confidence": 0.91,
      "analysis_time_ms": 523
    }
  ]
}
```

**New Response Models:**
- `DiseaseInfoData` — Contains cause, symptoms, prevention, treatment, severity
- Updated `DiseaseInfo` — Now includes `disease_info` field
- Updated `DiagnoseResponse` — Top-level `disease_info` for primary disease

**Backward Compatibility:** All existing fields maintained; new fields are additions

---

### 5. **config.py** (UPDATED)
**Location:** `backend/config.py`

**New Configuration Entries Added:**

```python
# UPDATED: Custom model and disease info paths  
MY_MODEL_PATH = MODEL_DIR / 'my_crop_disease.tflite'
DISEASE_INFO_PATH = DATA_DIR / 'disease_info.json'
MY_MODEL_INPUT_SIZE = 224
MY_MODEL_CONFIDENCE_THRESHOLD = 0.60

# In MODELS dict:
'custom_disease_classifier': {
    'path': MODEL_DIR / 'my_crop_disease.tflite',
    'labels_path': MODEL_DIR / 'labels.json',
    'type': 'tflite',
    'input_size': 224,
    'description': 'Custom MobileNetV2 trained on user dataset'
}
```

---

### 6. **Pathologist.js** (UPDATED)
**Location:** `frontend/src/screens/Pathologist_UPDATED.js`  
**⚠️ Action Required:** Replace existing `Pathologist.js` with this file

**Major Updates:**

#### UI Enhancements:
- ✅ **Tabbed Interface** — About | Cause | Symptoms | Prevention | Treatment
- ✅ **Severity Badge** — Color-coded (green=mild, orange=moderate, red=severe)
- ✅ **Confidence Visualization** — Progress bar showing AI confidence
- ✅ **Bullet Lists** — Formatted prevention/treatment steps
- ✅ **Scientific Name** — Display Alternaria solani, etc.
- ✅ **Affected Parts** — Show which plant parts are affected
- ✅ **Healthy Detection** — Special handling for "healthy" predictions

#### Functional Improvements:
```javascript
const diseaseInfo = disease.disease_info || {};  // From API
const tabs = [
  { id: 'about', label: 'About', icon: 'information' },
  { id: 'cause', label: 'Cause', icon: 'virus', show: !isHealthy },
  { id: 'symptoms', label: 'Symptoms', icon: 'clipboard-list' },
  { id: 'prevention', label: 'Prevention', icon: 'shield-check' },
  { id: 'treatment', label: 'Treatment', icon: 'spray-bottle' }
];
```

#### Text-to-Speech (TTS):
- Reads disease name + cause summary + first prevention tip
- Triggered when modal becomes visible

#### Healthy Plant Handling:
```javascript
const isHealthy = result.primary_disease?.toLowerCase().includes('healthy');
if (isHealthy) {
  detectedDisease.disease_info = {
    cause: 'No disease detected',
    symptoms: 'Plant appears healthy',
    prevention: ['Continue monitoring', 'Maintain irrigation'],
    treatment: ['No treatment required']
  };
}
```

---

## 🚀 Installation & Setup

### Step 1: Prepare Dataset

Ensure dataset is in the correct format:
```
/Users/jeeva/Downloads/archive/
├── train/
│   ├── Apple___Apple_scab/
│   │   ├── img1.jpg
│   │   ├── img2.jpg
│   │   └── ...
│   ├── Apple___Black_rot/
│   ├── Tomato___Early_blight/
│   └── ... (38 classes total)
└── val/ (optional, or script splits automatically)
```

**Dataset Details:**
- **Format:** JPG/PNG images
- **Classes:** 38 crop disease classes
- **Training Split:** 80/20 (train/validation)
- **Total Images:** ~14,000

### Step 2: Install Dependencies

```bash
# Backend dependencies
pip install tensorflow>=2.12.0
pip install pillow opencv-python
pip install scikit-learn matplotlib seaborn

# Verify TFLite support
python -c "import tensorflow.lite as tflite; print('TFLite OK')"
```

### Step 3: Train the Model

```bash
cd backend
python train_model.py

# Training takes ~2-4 hours on CPU (GPU: ~30 min)
# Output: my_crop_disease.tflite (~12 MB), labels.json, confusion_matrix.png
```

### Step 4: Verify Model Files

```bash
ls -lah backend/models/
# Should show:
# -rw-r--r--  my_crop_disease.tflite (12 MB)
# -rw-r--r--  labels.json (1 KB)

ls -lah backend/data/
# Should show:
# -rw-r--r--  disease_info.json (50 KB)
```

### Step 5: Update Frontend

```bash
# Navigate to frontend directory
cd frontend/src/screens

# Backup original
cp Pathologist.js Pathologist_backup.js

# Use updated version
cp ../../../Pathologist_UPDATED.js Pathologist.js
```

### Step 6: Start Backend

```bash
cd backend
python main.py

# Server runs on http://localhost:8000
# Test: curl http://localhost:8000/api/pipeline/status
```

### Step 7: Start Frontend

```bash
cd frontend
npm start
# Scan using Expo Go or native build
```

---

## 🧪 Testing

### Unit Test: Backend Model Loading
```python
from detection.disease_classifier import DiseaseClassifier

clf = DiseaseClassifier(
    model_path="models/my_crop_disease.tflite",
    labels_path="models/labels.json",
    disease_info_path="data/disease_info.json"
)

# Should load without errors
print(clf.class_names)  # 38 classes
print(clf.disease_info)  # 38 disease entries
```

### Integration Test: API Endpoint
```bash
# Test /api/diagnose with sample image
curl -X POST http://localhost:8000/api/diagnose \
  -F "file=@test_leaf.jpg" \
  -F "farmer_id=TEST_USER" \
  -F "analyze_all=true" \
  | jq '.disease_info'

# Expected output includes: cause, symptoms, prevention, treatment, severity
```

### UI Test: React Native
1. Open Pathologist screen
2. Click "Start Disease Scan"
3. Capture leaf image
4. Verify:
   - Disease name displays
   - Confidence percentage shown
   - Tabs are clickable
   - Prevention/treatment render as bullet lists
   - TTS reads disease info

---

## 📊 Expected Performance

### Model Metrics (MobileNetV2)
- **Accuracy:** ~92-95% on validation set (depending on data quality)
- **Model Size:** 12-15 MB (TFLite quantized)
- **Inference Time:** ~200-300ms (CPU backend)
- **Memory Usage:** ~50-100 MB (peak during inference)

### API Performance
- **Response Time:** 800ms-1.5s (including YOLO detection)
- **Throughput:** ~40-60 requests/minute (single endpoint)
- **Latency:** <2s for real-time mobile scenarios

---

## ⚙️ Configuration Guide

### Adjust Training Parameters

Edit `backend/train_model.py`:
```python
EPOCHS = 30  # More epochs = higher accuracy (but slower training)
BATCH_SIZE = 16  # Smaller batch = less memory, but slower
INPUT_SIZE = 224  # Don't change (MobileNetV2 standard)
TRAIN_VAL_SPLIT = 0.9  # 90% train, 10% val
```

### Adjust Inference Confidence

Edit `backend/config.py`:
```python
MY_MODEL_CONFIDENCE_THRESHOLD = 0.70  # Only report if confidence > 70%
```

### Use Different Model Architecture

Edit `backend/train_model.py` (line ~85):
```python
# Option 1: EfficientNetB0 (better accuracy, slightly slower)
base_model = EfficientNetB0(input_shape=(224, 224, 3), weights='imagenet')

# Option 2: MobileNetV3 (faster)
from tensorflow.keras.applications import MobileNetV3Small
base_model = MobileNetV3Small(input_shape=(224, 224, 3), weights='imagenet')
```

---

## 🐛 Troubleshooting

### Issue: TFLite model not found
```
FileNotFoundError: models/my_crop_disease.tflite
```
**Solution:** Run training script first: `python train_model.py`

### Issue: Out of memory during training
```
ResourceExhaustedError: OOM when allocating tensor
```
**Solution:** Reduce BATCH_SIZE to 8 or 16 in train_model.py

### Issue: API returns "Disease info not loaded"
```json
{ "disease_info": {} }
```
**Solution:** Verify `backend/data/disease_info.json` exists and is valid JSON:
```bash
python -c "import json; json.load(open('backend/data/disease_info.json'))" && echo "Valid JSON"
```

### Issue: Frontend doesn't show disease info tabs
```
disease_info is undefined or null
```
**Solution:** Ensure API response includes `disease_info`:
```bash
curl http://localhost:8000/api/diagnose -F "file=@test.jpg" | jq '.disease_info'
```

---

## 📝 API Reference

### POST /api/diagnose
**Request:**
```
multipart/form-data:
  - file (required): Image file
  - farmer_id (optional): Farmer identifier
  - analyze_all (optional): Boolean, analyze all detections
```

**Response:**
```json
{
  "status": "success",
  "detections_found": 1,
  "analyzed": 1,
  "total_time_ms": 1234,
  "primary_disease": "Tomato Early Blight",
  "primary_confidence": 0.94,
  "disease_info": {
    "cause": "...",
    "symptoms": "...",
    "prevention": [...],
    "treatment": [...],
    "severity": "moderate",
    "scientific_name": "Alternaria solani",
    "affected_plant_part": "leaves"
  },
  "leaves": [...]
}
```

---

## 🔄 Update Procedure

### To Retrain Model with New Data
```bash
# 1. Add new images to dataset
# 2. Re-run training
python backend/train_model.py

# 3. Verify new model works
# 4. Restart backend server (models auto-reload)
```

### To Add New Disease Class
```bash
# 1. Add disease folder to dataset: dataset/train/NewCrop___NewDisease/
# 2. Add entries to disease_info.json for the new class
# 3. Retrain model: python backend/train_model.py
# New class will be added automatically
```

---

## 📚 Files Modified/Created

| File | Type | Change |
|------|------|--------|
| `backend/train_model.py` | NEW | Complete training pipeline |
| `backend/data/disease_info.json` | NEW | Disease information database |
| `backend/detection/disease_classifier.py` | MODIFIED | Added disease info loading |
| `backend/detection/base.py` | MODIFIED | Added disease_info to ClassificationResult |
| `backend/detection_routes.py` | MODIFIED | Added disease_info to API response |
| `backend/config.py` | MODIFIED | Added custom model configuration |
| `frontend/src/screens/Pathologist.js` | MODIFIED | Full UI redesign with tabs |

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error messages in `backend/logs/`
3. Test with curl: `curl http://localhost:8000/api/pipeline/status`
4. Check model files exist: `ls -la backend/models/`

---

**Version:** 2.0  
**Updated:** April 9, 2026  
**Status:** ✅ Ready for Production
