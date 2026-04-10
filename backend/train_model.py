"""
Train MobileNetV2 model for crop disease classification using transfer learning.
Dataset: PlantVillage dataset from /Users/jeeva/Downloads/archive
Outputs: .h5 model, quantized .tflite model, and labels.json
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from sklearn.metrics import confusion_matrix, classification_report
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

# Configuration
DATASET_PATH = "/Users/jeeva/Downloads/archive/New Plant Diseases Dataset(Augmented)/New Plant Diseases Dataset(Augmented)"
BACKEND_PATH = "/Users/jeeva/Documents/ZYCROP/backend"
MODEL_OUTPUT_PATH = os.path.join(BACKEND_PATH, "models", "my_crop_disease.h5")
TFLITE_OUTPUT_PATH = os.path.join(BACKEND_PATH, "models", "my_crop_disease.tflite")
LABELS_OUTPUT_PATH = os.path.join(BACKEND_PATH, "models", "labels.json")

INPUT_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 20
TRAIN_VAL_SPLIT = 0.8
VALIDATION_SPLIT = 1 - TRAIN_VAL_SPLIT  # 0.2 for validation


def get_class_indices(dataset_path):
    """Extract class names from dataset directory structure."""
    classes = []
    train_path = os.path.join(dataset_path, "train")
    
    if os.path.exists(train_path):
        classes = sorted([d for d in os.listdir(train_path) if os.path.isdir(os.path.join(train_path, d))])
    
    print(f"Found {len(classes)} classes:")
    for i, cls in enumerate(classes):
        print(f"  {i}: {cls}")
    
    return classes


def create_train_val_generator(train_path):
    """Create train and validation data generators with augmentation."""
    
    # Training data generator with augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=VALIDATION_SPLIT
    )
    
    # Load train data
    train_generator = train_datagen.flow_from_directory(
        train_path,
        target_size=(INPUT_SIZE, INPUT_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )
    
    # Load validation data
    validation_generator = train_datagen.flow_from_directory(
        train_path,
        target_size=(INPUT_SIZE, INPUT_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )
    
    return train_generator, validation_generator


def create_model(num_classes):
    """Create MobileNetV2 transfer learning model."""
    
    # Load pre-trained MobileNetV2 (ImageNet weights)
    base_model = MobileNetV2(
        input_shape=(INPUT_SIZE, INPUT_SIZE, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model weights initially
    base_model.trainable = False
    
    # Create new model
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model, base_model


def train_model(model, base_model, train_gen, val_gen, num_classes):
    """Train model with transfer learning and fine-tuning."""
    
    # Phase 1: Train only top layers (frozen base)
    print("\n=== Phase 1: Training top layers (frozen base) ===")
    model.compile(
        optimizer=Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-6),
        ModelCheckpoint(MODEL_OUTPUT_PATH, monitor='val_accuracy', save_best_only=True)
    ]
    
    history1 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS // 2,
        callbacks=callbacks,
        verbose=1
    )
    
    # Phase 2: Fine-tune (unfreeze last layers of base model)
    print("\n=== Phase 2: Fine-tuning (unfreezing base model layers) ===")
    base_model.trainable = True
    
    # Only train last 30 layers of MobileNetV2 (lower learning rate for fine-tuning)
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    
    model.compile(
        optimizer=Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    history2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS - (EPOCHS // 2),
        callbacks=callbacks,
        verbose=1
    )
    
    return model, history1, history2


def evaluate_model(model, val_gen, class_names):
    """Generate confusion matrix and classification report."""
    
    # Get predictions
    y_true = []
    y_pred = []
    
    for images, labels in val_gen:
        predictions = model.predict(images)
        y_pred.extend(np.argmax(predictions, axis=1))
        y_true.extend(np.argmax(labels, axis=1))
    
    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    
    # Plot and save confusion matrix
    plt.figure(figsize=(20, 20))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, 
                yticklabels=class_names,
                cbar_kws={'label': 'Count'})
    plt.title('Confusion Matrix - Crop Disease Classification')
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.tight_layout()
    plt.savefig(os.path.join(BACKEND_PATH, 'confusion_matrix.png'), dpi=100)
    print(f"Confusion matrix saved to: {BACKEND_PATH}/confusion_matrix.png")
    
    # Classification Report
    print("\n=== Classification Report ===")
    print(classification_report(y_true, y_pred, target_names=class_names))


def convert_to_tflite(model_path, tflite_path, quantize=True):
    """Convert Keras model to TFLite format with optional quantization."""
    
    print(f"\n=== Converting to TFLite: {tflite_path} ===")
    
    # Load the trained model
    model = keras.models.load_model(model_path)
    
    # Create converter
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    if quantize:
        # Enable quantization for smaller model size
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    # Convert
    tflite_model = converter.convert()
    
    # Save
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)
    
    print(f"TFLite model saved: {tflite_path}")
    
    # Print size comparison
    h5_size = os.path.getsize(model_path) / (1024 * 1024)
    tflite_size = os.path.getsize(tflite_path) / (1024 * 1024)
    print(f"Model size: {h5_size:.2f} MB (H5) -> {tflite_size:.2f} MB (TFLite quantized)")


def save_labels(class_names, labels_path):
    """Save class names to JSON file."""
    
    labels_dict = {str(i): name for i, name in enumerate(class_names)}
    
    with open(labels_path, 'w') as f:
        json.dump(labels_dict, f, indent=2)
    
    print(f"Labels saved to: {labels_path}")


def main():
    """Main training pipeline."""
    
    print("=" * 60)
    print("Crop Disease Classification Model Training")
    print("=" * 60)
    
    # Create output directory
    os.makedirs(os.path.dirname(MODEL_OUTPUT_PATH), exist_ok=True)
    
    # Get class names
    class_names = get_class_indices(DATASET_PATH)
    num_classes = len(class_names)
    
    # Create data generators
    print(f"\n=== Loading dataset from {DATASET_PATH} ===")
    train_path = os.path.join(DATASET_PATH, "train")
    train_gen, val_gen = create_train_val_generator(train_path)
    
    # Create and train model
    print(f"\n=== Creating MobileNetV2 model ({num_classes} classes) ===")
    model, base_model = create_model(num_classes)
    print(model.summary())
    
    print(f"\n=== Starting training ({EPOCHS} epochs) ===")
    model, hist1, hist2 = train_model(model, base_model, train_gen, val_gen, num_classes)
    
    # Save models
    print(f"\n=== Saving models ===")
    model.save(MODEL_OUTPUT_PATH)
    print(f"H5 model saved: {MODEL_OUTPUT_PATH}")
    
    # Convert to TFLite
    convert_to_tflite(MODEL_OUTPUT_PATH, TFLITE_OUTPUT_PATH, quantize=True)
    
    # Save labels
    save_labels(class_names, LABELS_OUTPUT_PATH)
    
    # Evaluate
    print(f"\n=== Evaluating model ===")
    evaluate_model(model, val_gen, class_names)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)
    print(f"✓ H5 Model: {MODEL_OUTPUT_PATH}")
    print(f"✓ TFLite Model: {TFLITE_OUTPUT_PATH}")
    print(f"✓ Labels: {LABELS_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
