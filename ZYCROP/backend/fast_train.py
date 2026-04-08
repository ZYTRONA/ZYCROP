"""
fast_train.py — ZYCROP Speed Training (3-5 min on CPU)
=======================================================
Uses frozen MobileNetV2 + 20% data + 96x96 + 1 epoch = ready fast.
Accuracy: ~80-85% (vs ~95% for full training — good enough for production fallback)
"""
import os, json
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"   # silence all TF noise

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2

MODEL_DIR   = os.path.join(os.path.dirname(__file__), "models")
TFLITE_PATH = os.path.join(MODEL_DIR, "plant_disease.tflite")
LABELS_PATH = os.path.join(MODEL_DIR, "labels.json")
os.makedirs(MODEL_DIR, exist_ok=True)

IMG_SIZE   = 96      # 224→96 = 5.4x faster inference
BATCH_SIZE = 128     # larger batch = fewer steps
DATA_FRAC  = 0.20    # use 20% of dataset = 5x faster loading/training

print("\n╔══════════════════════════════════════════════════╗")
print("║  ZYCROP Fast-Train — PlantVillage MobileNetV2   ║")
print("╚══════════════════════════════════════════════════╝\n")

# ── Load dataset ──────────────────────────────────────────────────────────────
print("[1/5] Loading PlantVillage (cached)...")
import tensorflow_datasets as tfds

(ds_raw,), info = tfds.load(
    "plant_village",
    split=[f"train[:{int(DATA_FRAC*100)}%]"],
    as_supervised=True,
    with_info=True,
    shuffle_files=True,
)
NUM_CLASSES = info.features["label"].num_classes
CLASS_NAMES = list(info.features["label"].names)
total = int(info.splits["train"].num_examples * DATA_FRAC)
print(f"    {NUM_CLASSES} classes · {total:,} samples ({int(DATA_FRAC*100)}% of full dataset)")

# ── Pipelines ─────────────────────────────────────────────────────────────────
print("[2/5] Building pipeline...")
AUTOTUNE = tf.data.AUTOTUNE

def preprocess(img, lbl):
    img = tf.image.resize(img, [IMG_SIZE, IMG_SIZE])
    img = tf.cast(img, tf.float32) / 255.0
    return img, lbl

def augment(img, lbl):
    img = tf.image.random_flip_left_right(img)
    img = tf.image.random_brightness(img, 0.15)
    img = tf.clip_by_value(img, 0.0, 1.0)
    return img, lbl

split = int(total * 0.85)
ds_all = ds_raw.map(preprocess, num_parallel_calls=AUTOTUNE).cache()
ds_train = (ds_all.take(split)
            .map(augment, num_parallel_calls=AUTOTUNE)
            .shuffle(500).batch(BATCH_SIZE).prefetch(AUTOTUNE))
ds_val   = (ds_all.skip(split)
            .batch(BATCH_SIZE).prefetch(AUTOTUNE))

# ── Model ─────────────────────────────────────────────────────────────────────
print("[3/5] Building model (frozen MobileNetV2 base)...")
base = MobileNetV2(input_shape=(IMG_SIZE, IMG_SIZE, 3),
                   include_top=False, weights="imagenet")
base.trainable = False   # freeze — only train classifier head

model = tf.keras.Sequential([
    base,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(256, activation="relu"),
    layers.Dropout(0.2),
    layers.Dense(NUM_CLASSES, activation="softmax"),
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

# ── Train 1 epoch ─────────────────────────────────────────────────────────────
print("[4/5] Training (1 epoch, frozen base)...")
model.fit(
    ds_train,
    validation_data=ds_val,
    epochs=1,
    verbose=1,
)

# ── Export TFLite ─────────────────────────────────────────────────────────────
print("\n[5/5] Exporting to TFLite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]   # int8 quantization = smaller + faster
tflite_model = converter.convert()

with open(TFLITE_PATH, "wb") as f:
    f.write(tflite_model)

with open(LABELS_PATH, "w") as f:
    json.dump(CLASS_NAMES, f, indent=2)

size_kb = os.path.getsize(TFLITE_PATH) // 1024
print(f"\n✅ Done!")
print(f"   Model : {TFLITE_PATH}  ({size_kb} KB)")
print(f"   Labels: {LABELS_PATH}  ({NUM_CLASSES} classes)")
print(f"\n   Start backend: uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
