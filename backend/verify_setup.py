#!/usr/bin/env python3
"""
verify_setup.py — Verify ZYCROP AI Detection Pipeline Installation
==================================================================

Run this script to verify all components are properly installed and functional.

Usage:
    python verify_setup.py

Output:
    Component status report with instructions for any failures.
"""

import sys
import json
from pathlib import Path
from typing import Tuple, List

# Track results
results: List[Tuple[str, bool, str]] = []


def check_section(name: str) -> None:
    """Print section header."""
    print(f"\n{'='*70}")
    print(f"  {name}")
    print(f"{'='*70}")


def check_item(name: str, condition: bool, error_msg: str = "") -> None:
    """Check and report a single item."""
    status = "✓ OK" if condition else "✗ FAIL"
    results.append((name, condition, error_msg))
    print(f"{status:8} {name}")
    if error_msg and not condition:
        print(f"         {error_msg}")


def check_imports() -> None:
    """Check Python package imports."""
    check_section("Python Dependencies")
    
    deps = [
        ("numpy", "NumPy for numerical operations"),
        ("PIL", "Pillow for image processing"),
        ("fastapi", "FastAPI web framework"),
        ("pydantic", "Pydantic for data validation"),
        ("torch", "PyTorch for YOLOv8"),
        ("ultralytics", "YOLOv8 object detection"),
        ("tflite_runtime", "TFLite for disease classification (optional if TensorFlow available)"),
    ]
    
    for module_name, description in deps:
        try:
            if module_name == "PIL":
                from PIL import Image
            else:
                __import__(module_name)
            check_item(f"{module_name:20} {description}", True)
        except ImportError as e:
            check_item(f"{module_name:20} {description}", False, str(e))


def check_files() -> None:
    """Check required files exist."""
    check_section("Project Files")
    
    base_dir = Path(__file__).parent
    required_files = [
        ("detection/__init__.py", "Detection package init"),
        ("detection/base.py", "Base detector classes"),
        ("detection/yolo_detector.py", "YOLOv8 detector"),
        ("detection/disease_classifier.py", "Disease classifier"),
        ("detection/pipeline.py", "Detection pipeline"),
        ("utils/__init__.py", "Utils package init"),
        ("utils/logger.py", "Structured logging"),
        ("utils/validators.py", "Input validators"),
        ("config.py", "Configuration module"),
        ("detection_routes.py", "FastAPI routes"),
        ("requirements.txt", "Dependencies"),
        ("models/labels.json", "Disease labels (optional)"),
        ("models/plant_disease.tflite", "TFLite model (optional)"),
    ]
    
    for file_path, description in required_files:
        full_path = base_dir / file_path
        exists = full_path.exists()
        check_item(f"{file_path:30} {description}", exists,
                  "" if exists else f"Not found: {full_path}")


def check_config() -> None:
    """Check configuration."""
    check_section("Configuration")
    
    try:
        from config import (
            MODELS, DETECTION_CONFIG, PERFORMANCE, 
            MODEL_DIR, DATA_DIR, LOG_DIR
        )
        
        check_item("Config module imports", True)
        check_item(f"YOLO confidence threshold: {DETECTION_CONFIG['yolo']['confidence_threshold']}", True)
        check_item(f"Disease confidence threshold: {DETECTION_CONFIG['disease_classifier']['confidence_threshold']}", True)
        check_item(f"Device: {PERFORMANCE['device']}", True)
        check_item(f"Model directory: {MODEL_DIR}", MODEL_DIR.exists())
        check_item(f"Data directory: {DATA_DIR}", DATA_DIR.exists())
        check_item(f"Log directory: {LOG_DIR}", LOG_DIR.exists())
    except Exception as e:
        check_item("Config module imports", False, str(e))


def check_models() -> None:
    """Check model availability."""
    check_section("Model Availability")
    
    try:
        from config import MODELS, MODEL_DIR
        
        # Check TFLite model
        tflite_path = MODELS['disease_classifier']['path']
        tflite_exists = Path(tflite_path).exists()
        check_item("Disease classifier (TFLite)", tflite_exists,
                  f"Run: python train_plant_model.py to generate" if not tflite_exists else "")
        
        # Check YOLO availability
        try:
            from ultralytics import YOLO
            print(f"{'✓ OK':8} YOLOv8 loadable")
            results.append(("YOLOv8 loadable", True, ""))
            
            # Note about auto-download on first use
            print(f"{'ℹ INFO':8} YOLOv8 model will auto-download on first use (~49MB)")
        except ImportError as e:
            check_item("YOLOv8 loadable", False, str(e))
    except Exception as e:
        check_item("Model checks", False, str(e))


def check_detector_initialization() -> None:
    """Test actual detector initialization."""
    check_section("Detector Initialization Test")
    
    try:
        from detection.yolo_detector import YOLODetector
        from detection.disease_classifier import DiseaseClassifier
        
        # Test YOLO
        try:
            yolo = YOLODetector(model_name='n')  # Use nano for faster testing
            loaded = yolo.load()
            check_item("YOLOv8 Detector (nano model)", loaded,
                      "Check internet connection if fails. Model auto-downloads ~12MB")
            if loaded:
                yolo.unload()
        except Exception as e:
            check_item("YOLOv8 Detector", False, str(e))
        
        # Test Disease Classifier
        try:
            from config import MODELS
            model_path = MODELS['disease_classifier']['path']
            if Path(model_path).exists():
                classifier = DiseaseClassifier()
                loaded = classifier.load()
                check_item("Disease Classifier TFLite", loaded)
                if loaded:
                    classifier.unload()
            else:
                check_item("Disease Classifier TFLite", False,
                          f"Model not found. Run: python train_plant_model.py")
        except Exception as e:
            check_item("Disease Classifier", False, str(e))
    
    except Exception as e:
        check_item("Detector initialization tests", False, str(e))


def check_pipeline_initialization() -> None:
    """Test full pipeline initialization."""
    check_section("Complete Pipeline Test")
    
    try:
        from detection import DetectionPipeline
        
        pipeline = DetectionPipeline(yolo_model_size='n')  # nano for testing
        initialized = pipeline.initialize()
        
        check_item("DetectionPipeline initialization", initialized)
        
        if initialized:
            check_item("YOLO detector ready", pipeline.yolo_detector.is_ready())
            check_item("Disease classifier ready", pipeline.disease_classifier.is_ready())
            pipeline.shutdown()
        
    except Exception as e:
        check_item("Pipeline initialization", False, str(e))


def print_summary() -> None:
    """Print summary report."""
    check_section("Summary")
    
    total = len(results)
    passed = sum(1 for _, status, _ in results if status)
    failed = total - passed
    
    print(f"\nTotal Checks: {total}")
    print(f"Passed: {passed} {'✓' * min(passed, 20)}")
    print(f"Failed: {failed} {'✗' * min(failed, 20)}")
    
    if failed == 0:
        print("\n✓ ALL CHECKS PASSED - System is ready!")
        return True
    else:
        print("\n✗ Some checks failed - See details above")
        print("\nNext steps:")
        print("1. Install missing dependencies: pip install -r requirements.txt")
        print("2. Generate TFLite model: python train_plant_model.py")
        print("3. Re-run verification: python verify_setup.py")
        return False


def main() -> int:
    """Run all checks."""
    print("\n" + "="*70)
    print("  ZYCROP AI Detection Pipeline - Setup Verification")
    print("="*70)
    
    check_imports()
    check_files()
    check_config()
    check_models()
    check_detector_initialization()
    check_pipeline_initialization()
    
    success = print_summary()
    
    print("\n" + "="*70)
    print("\nFor integration instructions, see: INTEGRATION_GUIDE.md")
    print("For API usage examples, see: API_EXAMPLES.py")
    print("="*70 + "\n")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
