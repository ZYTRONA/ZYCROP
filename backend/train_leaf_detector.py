"""
train_leaf_detector.py — Train Custom TensorFlow Leaf Detection Model
====================================================================
Uses disease images as positive training data to train a lightweight
binary classifier (leaf vs no-leaf) using transfer learning.
Export to TFLite for edge deployment.
"""

import os
import sys
import cv2
import numpy as np
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, applications, optimizers
from sklearn.model_selection import train_test_split
from PIL import Image
import time

# Configuration
DISEASE_IMAGES_PATH = Path(__file__).parent.parent / "frontend" / "assets" / "disease_library"
BACKEND_PATH = Path(__file__).parent
MODEL_OUTPUT_PATH = BACKEND_PATH / "models" / "leaf_detector.tflite"
MODEL_WEIGHTS_PATH = BACKEND_PATH / "models" / "leaf_detector_weights.h5"
DATASET_PATH = BACKEND_PATH / "data" / "leaf_detection_dataset"

# Training parameters
IMG_SIZE = (224, 224)  # Input size for MobileNetV2
BATCH_SIZE = 32
EPOCHS = 20
VALIDATION_SPLIT = 0.2
LEARNING_RATE = 0.001


def load_disease_images():
    """Load all disease images as positive examples (they contain leaves)."""
    print("\n[LOAD] Loading disease images as positive examples...")
    positive_images = []
    positive_labels = []
    
    disease_count = 0
    image_count = 0
    
    # Scan all disease folders
    for disease_folder in sorted(DISEASE_IMAGES_PATH.iterdir()):
        if not disease_folder.is_dir():
            continue
        
        disease_count += 1
        print(f"  └─ {disease_folder.name}/", end=" ")
        
        # Load images from this disease folder
        disease_image_count = 0
        for image_file in disease_folder.glob("*"):
            if image_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.avif', '.webp']:
                try:
                    # Load image
                    img = Image.open(image_file)
                    
                    # Convert to RGB if needed
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    # Resize
                    img = img.resize(IMG_SIZE, Image.Resampling.LANCZOS)
                    
                    # Convert to array
                    img_array = np.array(img, dtype=np.float32) / 255.0
                    
                    positive_images.append(img_array)
                    positive_labels.append(1)  # Label 1 = contains leaf
                    disease_image_count += 1
                    image_count += 1
                except Exception as e:
                    print(f"[WARN] Failed to load {image_file}: {str(e)}")
        
        print(f"{disease_image_count} images")
    
    print(f"[OK] Loaded {image_count} positive examples (contain leaves) from {disease_count} diseases")
    return np.array(positive_images), np.array(positive_labels)


def create_negative_examples(num_negative_samples=200):
    """Create negative examples (no-leaf images) using:
    - Random noise
    - Blurred backgrounds
    - Plain color backgrounds
    """
    print("\n[GENERATE] Creating negative examples (no-leaf backgrounds)...")
    negative_images = []
    
    np.random.seed(42)
    
    # Random gradients and patterns
    for _ in range(num_negative_samples // 4):
        # Random gradient background
        img = np.zeros((224, 224, 3), dtype=np.float32)
        for i in range(3):
            img[:, :, i] = np.linspace(
                np.random.random(),
                np.random.random(),
                224
            ).reshape(1, -1)
        img = np.clip(img, 0, 1)
        negative_images.append(img)
    
    # Blurred textures
    for _ in range(num_negative_samples // 4):
        noise = np.random.normal(0.5, 0.2, (224, 224, 3))
        img = np.clip(noise, 0, 1).astype(np.float32)
        # Apply Gaussian blur
        img_uint8 = (img * 255).astype(np.uint8)
        img_blurred = cv2.GaussianBlur(img_uint8, (31, 31), 0)
        img = img_blurred.astype(np.float32) / 255.0
        negative_images.append(img)
    
    # Solid colors with slight variation
    for _ in range(num_negative_samples // 4):
        # Random soil/background color
        color = np.random.rand(3)
        img = np.ones((224, 224, 3), dtype=np.float32) * color
        # Add slight noise
        noise = np.random.normal(0, 0.05, (224, 224, 3))
        img = np.clip(img + noise, 0, 1)
        negative_images.append(img)
    
    # Remaining: blur of random colors
    remaining = num_negative_samples - len(negative_images)
    for _ in range(remaining):
        color = np.random.rand(3)
        img = np.ones((224, 224, 3), dtype=np.float32) * color
        img_uint8 = (img * 255).astype(np.uint8)
        img_blurred = cv2.GaussianBlur(img_uint8, (21, 21), 0)
        img = img_blurred.astype(np.float32) / 255.0
        negative_images.append(img)
    
    print(f"[OK] Created {len(negative_images)} negative examples (no-leaf backgrounds)")
    return np.array(negative_images)


def build_model():
    """Build transfer learning model using MobileNetV2."""
    print("\n[BUILD] Building transfer learning model...")
    
    # Load pre-trained MobileNetV2
    base_model = applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model layers (transfer learning)
    base_model.trainable = False
    
    # Build custom top layers
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(1, activation='sigmoid')  # Binary classification
    ])
    
    # Compile
    model.compile(
        optimizer=optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='binary_crossentropy',
        metrics=['accuracy', keras.metrics.AUC()]
    )
    
    print(f"[OK] Model built: {model.count_params():,} total parameters")
    return model


def train_model(X_train, y_train, X_val, y_val):
    """Train the model."""
    print("\n[TRAIN] Starting training...")
    
    model = build_model()
    
    # Callbacks
    early_stopping = keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True
    )
    
    reduce_lr = keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=3,
        min_lr=1e-6
    )
    
    # Train
    history = model.fit(
        X_train, y_train,
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        validation_data=(X_val, y_val),
        callbacks=[early_stopping, reduce_lr],
        verbose=1
    )
    
    # Evaluate
    val_loss, val_acc, val_auc = model.evaluate(X_val, y_val, verbose=0)
    print(f"\n[EVAL] Validation - Loss: {val_loss:.4f}, Accuracy: {val_acc:.4f}, AUC: {val_auc:.4f}")
    
    return model, history


def export_tflite(model, output_path):
    """Export model to TensorFlow Lite format."""
    print(f"\n[EXPORT] Converting to TFLite...")
    
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    tflite_model = converter.convert()
    
    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(tflite_model)
    
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"[OK] TFLite model exported: {output_path}")
    print(f"     Size: {size_mb:.2f} MB")


def main():
    """Main training pipeline."""
    print("="*70)
    print("TensorFlow Leaf Detection Model Training")
    print("="*70)
    
    # Load positive examples (disease images with leaves)
    X_positive, y_positive = load_disease_images()
    
    # Create negative examples (backgrounds without leaves)
    X_negative = create_negative_examples(num_negative_samples=max(200, len(X_positive) // 2))
    y_negative = np.zeros(len(X_negative), dtype=np.int32)
    
    # Combine
    X = np.concatenate([X_positive, X_negative])
    y = np.concatenate([y_positive, y_negative])
    
    print(f"\n[DATASET] Total samples: {len(X)}")
    print(f"          Positive (with leaf): {np.sum(y)} ({100*np.sum(y)/len(y):.1f}%)")
    print(f"          Negative (no leaf): {len(y)-np.sum(y)} ({100*(1-np.sum(y)/len(y)):.1f}%)")
    
    # Shuffle
    indices = np.random.permutation(len(X))
    X = X[indices]
    y = y[indices]
    
    # Split
    X_train, X_val, y_train, y_val = train_test_split(
        X, y,
        test_size=VALIDATION_SPLIT,
        random_state=42,
        stratify=y  # Keep class balance
    )
    
    print(f"\n[SPLIT] Train: {len(X_train)}, Validation: {len(X_val)}")
    
    # Train
    model, history = train_model(X_train, y_train, X_val, y_val)
    
    # Save weights
    MODEL_WEIGHTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save(str(MODEL_WEIGHTS_PATH))
    print(f"\n[SAVE] Model weights saved: {MODEL_WEIGHTS_PATH}")
    
    # Export to TFLite
    export_tflite(model, MODEL_OUTPUT_PATH)
    
    print("\n" + "="*70)
    print("✅ Training Complete!")
    print("="*70)
    print(f"\nModel files:")
    print(f"  • TFLite: {MODEL_OUTPUT_PATH}")
    print(f"  • Weights: {MODEL_WEIGHTS_PATH}")
    print(f"\nNext Steps:")
    print(f"  1. Test the model: python test_leaf_detector.py")
    print(f"  2. Update pipeline: Swap YOLO with TensorFlow leaf detector")
    print(f"  3. Restart backend and test on phone")


if __name__ == '__main__':
    main()
