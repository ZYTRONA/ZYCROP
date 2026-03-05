"""
train_plant_model.py — ZYCROP Disease Detection Model
=======================================================
Trains a MobileNetV2 model on PlantVillage dataset and exports
a TFLite model ready to bundle in the React Native app.

Requirements:
    pip install tensorflow tensorflow-datasets Pillow numpy

Usage:
    python train_plant_model.py

Output:
    backend/models/plant_disease.tflite   — copy to zycrop/src/assets/
    backend/models/labels.json            — copy to zycrop/src/assets/
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

# ─── Config ──────────────────────────────────────────────────────────────────
IMG_SIZE    = 224
BATCH_SIZE  = 32
EPOCHS      = 15
FINE_TUNE_EPOCHS = 10
MODEL_DIR   = os.path.join(os.path.dirname(__file__), 'models')
TFLITE_PATH = os.path.join(MODEL_DIR, 'plant_disease.tflite')
LABELS_PATH = os.path.join(MODEL_DIR, 'labels.json')

os.makedirs(MODEL_DIR, exist_ok=True)

# ─── Load PlantVillage via tensorflow_datasets ────────────────────────────────
print('\n[1/6] Loading PlantVillage dataset via tensorflow_datasets...')
print('      (First run will download ~800MB — subsequent runs use cache)')

try:
    import tensorflow_datasets as tfds
    (ds_train_raw, ds_val_raw), ds_info = tfds.load(
        'plant_village',
        split=['train[:80%]', 'train[80%:]'],
        as_supervised=True,
        with_info=True,
    )
    NUM_CLASSES = ds_info.features['label'].num_classes
    CLASS_NAMES = ds_info.features['label'].names
    print(f'      Loaded {NUM_CLASSES} disease classes.')
except ImportError:
    raise SystemExit(
        '\n[ERROR] tensorflow_datasets not installed.\n'
        'Run: pip install tensorflow-datasets\n'
    )

# ─── Preprocessing ────────────────────────────────────────────────────────────
def preprocess(image, label):
    image = tf.image.resize(image, [IMG_SIZE, IMG_SIZE])
    image = tf.cast(image, tf.float32) / 255.0
    return image, label

def augment(image, label):
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_flip_up_down(image)
    image = tf.image.random_brightness(image, 0.2)
    image = tf.image.random_contrast(image, 0.8, 1.2)
    image = tf.clip_by_value(image, 0.0, 1.0)
    return image, label

print('\n[2/6] Building data pipelines...')
AUTOTUNE = tf.data.AUTOTUNE

ds_train = (
    ds_train_raw
    .map(preprocess, num_parallel_calls=AUTOTUNE)
    .map(augment, num_parallel_calls=AUTOTUNE)
    .shuffle(1000)
    .batch(BATCH_SIZE)
    .prefetch(AUTOTUNE)
)

ds_val = (
    ds_val_raw
    .map(preprocess, num_parallel_calls=AUTOTUNE)
    .batch(BATCH_SIZE)
    .prefetch(AUTOTUNE)
)

# ─── Build Model ─────────────────────────────────────────────────────────────
print('\n[3/6] Building MobileNetV2 transfer learning model...')

base_model = MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet',
)
base_model.trainable = False  # Freeze for initial training

inputs    = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x         = base_model(inputs, training=False)
x         = layers.GlobalAveragePooling2D()(x)
x         = layers.Dense(256, activation='relu')(x)
x         = layers.Dropout(0.4)(x)
outputs   = layers.Dense(NUM_CLASSES, activation='softmax')(x)
model     = Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy'],
)
model.summary()

# ─── Phase 1: Train top layers ────────────────────────────────────────────────
print('\n[4/6] Phase 1 — Training classification head (frozen base)...')

callbacks = [
    EarlyStopping(patience=4, restore_best_weights=True, monitor='val_accuracy'),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-6),
]

history1 = model.fit(
    ds_train,
    validation_data=ds_val,
    epochs=EPOCHS,
    callbacks=callbacks,
    verbose=1,
)

# ─── Phase 2: Fine-tune last 30 layers of base ───────────────────────────────
print('\n[5/6] Phase 2 — Fine-tuning last 30 layers of MobileNetV2...')

base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy'],
)

history2 = model.fit(
    ds_train,
    validation_data=ds_val,
    epochs=FINE_TUNE_EPOCHS,
    callbacks=callbacks,
    verbose=1,
)

# ─── Export to TFLite ─────────────────────────────────────────────────────────
print('\n[6/6] Converting to TFLite with int8 quantization...')

# Representative dataset for full-integer quantization
def representative_data_gen():
    for images, _ in ds_val.take(100):
        for img in images:
            yield [tf.expand_dims(img, axis=0)]

converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.representative_dataset = representative_data_gen
converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS_INT8,
    tf.lite.OpsSet.TFLITE_BUILTINS,
]
converter.inference_input_type  = tf.uint8
converter.inference_output_type = tf.uint8

tflite_model = converter.convert()

with open(TFLITE_PATH, 'wb') as f:
    f.write(tflite_model)

# Save class labels
with open(LABELS_PATH, 'w') as f:
    json.dump(CLASS_NAMES, f, indent=2)

size_kb = os.path.getsize(TFLITE_PATH) / 1024
print(f'\n✓ TFLite model saved: {TFLITE_PATH}  ({size_kb:.0f} KB)')
print(f'✓ Labels saved:       {LABELS_PATH}')
print(f'  Classes: {NUM_CLASSES}')

# ─── Quick smoke-test ─────────────────────────────────────────────────────────
print('\nRunning quick inference smoke-test on 3 validation samples...')

interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
interpreter.allocate_tensors()
inp  = interpreter.get_input_details()[0]
out  = interpreter.get_output_details()[0]

correct = 0
sample_count = 0
for images, labels in ds_val.take(1):  # 1 batch
    for img, lbl in zip(images[:3], labels[:3]):
        img_uint8 = (img.numpy() * 255).astype(np.uint8)
        interpreter.set_tensor(inp['index'], np.expand_dims(img_uint8, axis=0))
        interpreter.invoke()
        pred = np.argmax(interpreter.get_tensor(out['index']))
        match = '✓' if pred == lbl.numpy() else '✗'
        print(f'  {match}  True: {CLASS_NAMES[lbl.numpy()]:40s}  Pred: {CLASS_NAMES[pred]}')
        if pred == lbl.numpy():
            correct += 1
        sample_count += 1

print(f'\nSmoke-test accuracy: {correct}/{sample_count}')

# ─── Next steps ───────────────────────────────────────────────────────────────
print("""
Next steps to integrate into React Native:
  1. Copy backend/models/plant_disease.tflite → zycrop/src/assets/plant_disease.tflite
  2. Copy backend/models/labels.json          → zycrop/src/assets/labels.json
  3. Install: npx expo install expo-camera @tensorflow/tfjs @tensorflow/tfjs-react-native
  4. In Pathologist.js, replace detectDisease() with TFLite inference:

     import * as tf from '@tensorflow/tfjs'
     import '@tensorflow/tfjs-react-native'
     import { bundleResourceIO } from '@tensorflow/tfjs-react-native'
     import { decodeJpeg } from '@tensorflow/tfjs-react-native'

     const modelJson = require('../assets/plant_disease.tflite')
     // Use TFLite delegate via expo-task-manager or tfjs-tflite plugin
""")
