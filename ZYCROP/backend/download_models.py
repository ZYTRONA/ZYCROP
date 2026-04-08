#!/usr/bin/env python3
"""
download_models.py — Pre-download YOLOv8 models
=============================================

Run this once after installation to download models for offline use.

Usage:
    python download_models.py

This will download:
    - YOLOv8 Nano (~12 MB) - for testing/development
    - YOLOv8 Medium (~49 MB) - for production use
"""

import sys
from pathlib import Path

print("\n" + "="*70)
print("  ZYCROP AI - Downloading Models")
print("="*70 + "\n")

# Download YOLOv8 models
try:
    print("[1/2] Downloading YOLOv8 Nano model (~12 MB)...")
    from ultralytics import YOLO
    model_nano = YOLO('yolov8n.pt', verbose=False)
    print("[OK] YOLOv8 Nano downloaded\n")
except Exception as e:
    print(f"[WARNING] Failed to download YOLOv8 Nano: {e}\n")
    sys.exit(1)

try:
    print("[2/2] Downloading YOLOv8 Medium model (~49 MB)...")
    print("      (This is used in production)")
    model_medium = YOLO('yolov8m.pt', verbose=False)
    print("[OK] YOLOv8 Medium downloaded\n")
except Exception as e:
    print(f"[WARNING] Failed to download YOLOv8 Medium: {e}\n")
    # Don't exit - nano is enough for testing

print("="*70)
print("✓ Model download complete!")
print("="*70)
print("\nModels are cached in: ~/.cache/ultralytics/")
print("Models are now ready for offline use.\n")
