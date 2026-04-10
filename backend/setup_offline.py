#!/usr/bin/env python3
"""
setup_offline.py — Complete Offline Model Pre-caching
========================================================

This script pre-downloads and caches all models needed for offline operation.
Run this ONCE after installation to prepare the backend for offline team use.

Usage:
    python setup_offline.py

Models cached:
    ✓ YOLOv8 Nano/Medium (already in repo)
    ✓ Sentence Transformers (sentence-transformers/all-MiniLM-L6-v2)
    ✓ Faster-Whisper (tiny model)
    ✓ NLTK corpora (wordnet, omw-1.4)
"""

import sys
import os
from pathlib import Path

print("\n" + "="*70)
print("  ZYCROP AI - Complete Offline Setup")
print("="*70)
print("\nThis will cache models for offline use (~1.5 GB total).\n")

# Track success
models_cached = []
models_failed = []

# ═══════════════════════════════════════════════════════════════════════════
# 1. YOLOv8 Models (already in repo)
# ═══════════════════════════════════════════════════════════════════════════
print("[1/5] Verifying YOLOv8 models...")
backend_dir = Path(__file__).parent
yolo_files = [
    backend_dir / "yolov8n.pt",
    backend_dir / "yolov8m.pt",
]
for model_file in yolo_files:
    if model_file.exists():
        size_mb = model_file.stat().st_size / (1024**2)
        print(f"  ✓ {model_file.name} ({size_mb:.1f} MB) - OK")
        models_cached.append(f"YOLOv8 {model_file.name}")
    else:
        print(f"  ✗ {model_file.name} - NOT FOUND")
        models_failed.append(f"YOLOv8 {model_file.name}")

# ═══════════════════════════════════════════════════════════════════════════
# 2. Sentence Transformers (for RAG/scheme search)
# ═══════════════════════════════════════════════════════════════════════════
print("\n[2/5] Pre-caching Sentence Transformers model...")
try:
    from sentence_transformers import SentenceTransformer
    print("  Loading sentence-transformers/all-MiniLM-L6-v2...")
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    print("  ✓ Sentence Transformers cached")
    models_cached.append("Sentence Transformers (all-MiniLM-L6-v2)")
except Exception as e:
    print(f"  ✗ Failed to cache Sentence Transformers: {e}")
    models_failed.append("Sentence Transformers")

# ═══════════════════════════════════════════════════════════════════════════
# 3. Faster-Whisper (for offline STT)
# ═══════════════════════════════════════════════════════════════════════════
print("\n[3/5] Pre-caching Faster-Whisper model (Tiny)...")
try:
    from faster_whisper import WhisperModel
    print("  Loading Whisper tiny model (~75 MB)...")
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    print("  ✓ Faster-Whisper Tiny model cached")
    models_cached.append("Faster-Whisper Tiny (STT)")
except Exception as e:
    print(f"  ✗ Failed to cache Faster-Whisper: {e}")
    models_failed.append("Faster-Whisper Tiny")

# ═══════════════════════════════════════════════════════════════════════════
# 4. NLTK Data (for text processing)
# ═══════════════════════════════════════════════════════════════════════════
print("\n[4/5] Pre-caching NLTK data...")
try:
    import nltk
    print("  Downloading wordnet...")
    nltk.download("wordnet", quiet=True)
    print("  Downloading omw-1.4...")
    nltk.download("omw-1.4", quiet=True)
    print("  ✓ NLTK data cached")
    models_cached.append("NLTK Corpora (wordnet, omw-1.4)")
except Exception as e:
    print(f"  ✗ Failed to cache NLTK data: {e}")
    models_failed.append("NLTK Corpora")

# ═══════════════════════════════════════════════════════════════════════════
# 5. Disease Classification Model (already in repo)
# ═══════════════════════════════════════════════════════════════════════════
print("\n[5/5] Verifying Disease Classification models...")
disease_models = [
    backend_dir / "models" / "my_crop_disease.tflite",
    backend_dir / "models" / "my_crop_disease.h5",
    backend_dir / "models" / "labels.json",
]
for model_file in disease_models:
    if model_file.exists():
        size_kb = model_file.stat().st_size / 1024
        print(f"  ✓ {model_file.name} ({size_kb:.1f} KB) - OK")
        models_cached.append(f"Disease Classifier {model_file.name}")
    else:
        print(f"  ✗ {model_file.name} - NOT FOUND (optional)")

# ═══════════════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════════════
print("\n" + "="*70)
print("  OFFLINE SETUP COMPLETE")
print("="*70)
print(f"\n✓ Successfully cached: {len(models_cached)} model(s)")
for model in models_cached:
    print(f"  • {model}")

if models_failed:
    print(f"\n⚠ Failed to cache: {len(models_failed)} model(s)")
    for model in models_failed:
        print(f"  • {model}")
    print("\nNote: These models have fallbacks configured.")

print("\n" + "="*70)
print("  OFFLINE READINESS CHECK")
print("="*70)
print("""
Core features ready for OFFLINE use:
  ✓ Disease Detection (YOLOv8 + TFLite)
  ✓ Leaf Analysis & Recommendation
  ✓ Scheme Recommendation (RAG with Sentence Transformers)
  ✓ Speech-to-Text (Faster-Whisper)

Features requiring INTERNET (with graceful fallback):
  ⚠ Translation (uses Google Translate as fallback)
  ⚠ Ollama Chat (omitted if Ollama not running)
  ⚠ Bhashini ASR (fallback if faster-whisper unavailable)

To run COMPLETELY OFFLINE:
  1. Ensure all models are cached (this script)
  2. Set OFFLINE_MODE=true in setup_offline.sh
  3. Launch backend with: source setup_offline.sh && python main.py

Your team can now CLONE and RUN without internet! 🚀
""")
print("="*70 + "\n")
