# Custom TensorFlow Leaf Detection Model Training Guide

## Overview

This guide explains how to train a custom TensorFlow leaf detection model to replace YOLO in the ZYCROP detection pipeline.

### What You're Training

A **binary classifier** that detects whether an image contains a leaf:
- **Input**: Any image (224×224 pixels)
- **Output**: 
  - Confidence score (0-1) for "contains leaf"
  - Detection if confidence > threshold
  - Full-image bounding box estimation

### Training Data

The model uses:
- **Positive examples**: All disease images from `frontend/assets/disease_library/` (contain leaves)
- **Negative examples**: Synthetically generated backgrounds (no leaves)
  - Random gradients
  - Blurred textures
  - Solid colors
  - Noise patterns

## Quick Start

### Step 1: Train the Model

```bash
cd /Users/jeeva/Documents/ZYCROP/backend

# Activate virtual environment
source ../.venv/bin/activate

# Run training (takes ~5-10 minutes depending on your computer)
python train_leaf_detector.py
```

What happens:
1. Loads all disease images as positive training examples
2. Generates synthetic negative examples (backgrounds)
3. Trains a MobileNetV2-based classifier using transfer learning
4. Exports to TFLite format for mobile deployment
5. Saves model to `models/leaf_detector.tflite`

### Step 2: Test the Trained Model

```bash
# Test on disease images and random backgrounds
python test_leaf_detector.py
```

Expected output:
- ✅ Disease images: Should detect leaves (90%+ accuracy expected)
- ✅ Random backgrounds: Should NOT detect leaves

### Step 3: Integrate into Detection Pipeline

After successful training, update the pipeline to use the TensorFlow detector:

```python
# In detection/pipeline.py, replace:
from detection.yolo_detector import YOLODetector

# With:
from detection.tensorflow_leaf_detector import TensorFlowLeafDetector
```

Then modify the DetectionPipeline initialization in `detection_routes.py`:

```python
# Current (YOLO):
_pipeline = DetectionPipeline(
    yolo_model_size='n',
    yolo_conf=0.15,
    disease_conf=0.30
)

# New (TensorFlow):
_pipeline = DetectionPipeline(
    tf_leaf_detector_path='models/leaf_detector.tflite',
    tf_leaf_conf=0.5,
    disease_conf=0.30
)
```

### Step 4: Restart Backend

```bash
# Restart the FastAPI backend
pkill -f "uvicorn.*8888" || true
sleep 2
cd /Users/jeeva/Documents/ZYCROP/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8888 --workers 1
```

### Step 5: Test on Phone

1. Open Expo app
2. Go to "AI Scan" tab
3. Test with:
   - Leaf images → Should detect and diagnose
   - Non-leaf images → Should show "No leaf detected"

---

## Model Architecture

### Base Model: MobileNetV2
- **Why**: Lightweight, fast, good accuracy
- **Training time**: ~5-10 minutes on CPU
- **Model size**: ~7-10 MB
- **Inference speed**: ~50-100ms per image

### Fine-tuning Strategy
1. Load pre-trained MobileNetV2 (trained on ImageNet)
2. Freeze base layers (transfer learning)
3. Train custom top layers on leaf vs non-leaf data
4. Early stopping to prevent overfitting
5. Learning rate reduction on plateau

### Export to TFLite
- Quantization: Default (8-bit)
- Model size: ~2-3 MB
- Runtime: ~50-100ms on phone

---

## Configuration

Edit these values in `train_leaf_detector.py`:

```python
IMG_SIZE = (224, 224)      # Input image size
BATCH_SIZE = 32            # Batch size for training
EPOCHS = 20                # Maximum training epochs
VALIDATION_SPLIT = 0.2     # 80/20 train/validation split
LEARNING_RATE = 0.001      # Adam optimizer learning rate
```

For detector in detection pipeline:

```python
# In tensorflow_leaf_detector.py
confidence_threshold = 0.5  # Adjust sensitivity (0.3-0.7 recommended)
```

---

## Troubleshooting

### Model doesn't detect leaves reliably

1. **Lower the confidence threshold** (0.5 → 0.3)
   - Makes detection more permissive
   - Might increase false positives

2. **Retrain with more data**
   - Add more disease images if available
   - Increase num_negative_samples in training

3. **Check TFLite export**
   - Ensure model_path points to correct file
   - Verify file size is reasonable (~2-3 MB)

### Training is very slow

1. **Reduce BATCH_SIZE** (32 → 16)
   - Uses less memory
   - Takes longer but still works

2. **Reduce EPOCHS** (20 → 10)
   - Might trade some accuracy for speed
   - Use early stopping (stops automatically)

3. **Use GPU if available**
   ```bash
   # Check TensorFlow GPU availability
   python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
   ```

### False positives (detects non-leaf as leaf)

1. **Increase confidence threshold** (0.5 → 0.7)
   - Makes detection stricter
   - Might miss some real leaves

2. **Add more diverse negatives**
   - Edit create_negative_examples() to include other patterns
   - Add soil, wall textures, etc.

3. **Fine-tune training**
   - Increase EPOCHS (20 → 30)
   - Reduce LEARNING_RATE (0.001 → 0.0005)

---

## Comparing YOLO vs TensorFlow Detector

### YOLO (Current)
- ✅ Precision object detection (bounding boxes)
- ✅ Trained on millions of images
- ✅ Fast inference
- ❌ Generic model (not crop-specific)
- ❌ May have false positives/negatives

### TensorFlow Custom Model (New)
- ✅ Trained on YOUR crop disease data
- ✅ Optimized for leaf detection
- ✅ Lightweight, fast TFLite
- ✅ Full control over training
- ❌ Simple binary classification (no precise bbox)
- ❌ Need good negative examples

---

## File Structure

```
backend/
├── models/
│   ├── my_crop_disease.tflite      # Disease classifier (existing)
│   ├── leaf_detector.tflite        # NEW: Leaf detector (TFLite)
│   └── leaf_detector_weights.h5    # NEW: Keras weights (optional)
├── detection/
│   ├── yolo_detector.py            # YOLO detector (existing)
│   ├── tensorflow_leaf_detector.py  # NEW: TensorFlow detector
│   ├── disease_classifier.py       # Disease classifier (existing)
│   └── pipeline.py                 # Detection pipeline
├── train_leaf_detector.py          # NEW: Training script
├── test_leaf_detector.py           # NEW: Testing script
└── detection_routes.py             # FastAPI endpoints
```

---

## Next Steps After Training

1. **Test on real data**
   - Use phone to capture various leaf conditions
   - Verify accuracy in real-world scenarios

2. **Iterate if needed**
   - Adjust confidence thresholds
   - Retrain with more/different data
   - Fine-tune hyperparameters

3. **Monitor performance**
   - Log predictions vs actual
   - Collect feedback from farmers
   - Improve model over time

4. **Optional: Replace fully**
   - Remove YOLO dependency
   - Reduce backend complexity
   - Smaller Docker image

---

## Training Tips

1. **Ensure good training data**
   - Use various lighting conditions
   - Include different leaf angles
   - Mix of healthy and diseased leaves

2. **Balance dataset**
   - Equal positive/negative examples ideal
   - Script automatically creates negatives
   - Can adjust ratio if needed

3. **Monitor training metrics**
   - Look for loss decreasing
   - Validation accuracy > 90% expected
   - AUC > 0.95 is good

4. **Save model versions**
   - Backup leaf_detector.tflite before retraining
   - Compare different training runs
   - Keep best model

---

## Advanced: Custom Training Data

To add custom leaf/non-leaf images for training:

1. Create folders:
   ```
   backend/data/custom_training/
   ├── leaves/          # Your leaf images
   └── non_leaves/      # Your background images
   ```

2. Modify `train_leaf_detector.py`:
   ```python
   def load_custom_images():
       # Load from custom_training folder
       # Return X, y arrays
   ```

3. Retrain:
   ```bash
   python train_leaf_detector.py
   ```

---

## Support & Debugging

If training fails:

1. **Check TensorFlow installation**
   ```bash
   python -c "import tensorflow as tf; print(tf.__version__)"
   ```

2. **Check disease images exist**
   ```bash
   ls frontend/assets/disease_library/
   ```

3. **Verify model loads**
   ```bash
   python test_leaf_detector.py
   ```

4. **Check backend logs**
   ```bash
   # Look for [ERROR] messages in terminal
   tail -f backend_logs.txt
   ```

---

Good luck training your custom model! 🌿
