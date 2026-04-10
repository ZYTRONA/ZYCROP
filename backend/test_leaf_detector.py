"""
test_leaf_detector.py — Test TensorFlow Leaf Detection Model
===========================================================
Tests the trained leaf detector model on various images.
"""

import os
import sys
import numpy as np
from pathlib import Path
from PIL import Image

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from detection.tensorflow_leaf_detector import TensorFlowLeafDetector


def test_on_disease_images():
    """Test detector on disease images (should detect leaves)."""
    print("\n" + "="*70)
    print("Testing on Disease Images (Should Detect Leaves)")
    print("="*70)
    
    detector = TensorFlowLeafDetector(
        model_path="models/leaf_detector.tflite",
        confidence_threshold=0.5
    )
    
    if not detector.load():
        print("[ERROR] Failed to load model")
        return
    
    disease_path = Path(__file__).parent.parent / "frontend" / "assets" / "disease_library"
    
    test_count = 0
    detected_count = 0
    
    for disease_folder in sorted(disease_path.iterdir())[:3]:  # Test first 3 diseases
        if not disease_folder.is_dir():
            continue
        
        print(f"\n{disease_folder.name}/")
        
        for image_file in list(disease_folder.glob("*"))[:2]:  # Test 2 images per disease
            if image_file.suffix.lower() not in ['.jpg', '.jpeg', '.png', '.avif']:
                continue
            
            try:
                # Load image
                img = Image.open(image_file)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize for detector
                img_resized = img.resize((224, 224), Image.Resampling.LANCZOS)
                img_array = np.array(img_resized, dtype=np.float32) / 255.0
                
                # Detect
                result = detector.detect(img_array)
                
                detected = len(result.detections) > 0
                confidence = result.detections[0].confidence if detected else 0.0
                
                status = "✅ DETECTED" if detected else "❌ MISSED"
                print(f"  {image_file.name}: {status} (conf: {confidence:.3f})")
                
                test_count += 1
                if detected:
                    detected_count += 1
            except Exception as e:
                print(f"  {image_file.name}: ERROR - {str(e)}")
    
    print(f"\n[RESULT] Detected {detected_count}/{test_count} disease images")
    if detected_count > 0:
        print(f"         Accuracy: {100*detected_count/test_count:.1f}%")
    
    detector.unload()


def test_on_random_noise():
    """Test detector on random noise (should NOT detect leaves)."""
    print("\n" + "="*70)
    print("Testing on Random Backgrounds (Should NOT Detect Leaves)")
    print("="*70)
    
    detector = TensorFlowLeafDetector(
        model_path="models/leaf_detector.tflite",
        confidence_threshold=0.5
    )
    
    if not detector.load():
        print("[ERROR] Failed to load model")
        return
    
    # Create test images: random noise, gradients, solid colors
    test_cases = {
        "Random Noise": np.random.rand(224, 224, 3).astype(np.float32),
        "Solid Background": np.ones((224, 224, 3), dtype=np.float32) * 0.5,
        "Gradient": np.tile(np.linspace(0, 1, 224).reshape(1, -1, 1), (224, 1, 3)).astype(np.float32),
    }
    
    detected_count = 0
    
    for name, img_array in test_cases.items():
        result = detector.detect(img_array)
        detected = len(result.detections) > 0
        confidence = result.detections[0].confidence if detected else 0.0
        
        status = "✅ DETECTED" if detected else "✅ CORRECT"
        print(f"{name:20s}: {status} (conf: {confidence:.3f})")
        
        if detected:
            detected_count += 1
    
    print(f"\n[RESULT] Detected {detected_count}/3 background images (should be 0)")
    
    detector.unload()


def main():
    """Run all tests."""
    print("\n" + "="*70)
    print("TensorFlow Leaf Detector - Model Testing")
    print("="*70)
    
    model_path = Path(__file__).parent / "models" / "leaf_detector.tflite"
    
    if not model_path.exists():
        print(f"\n[ERROR] Model not found: {model_path}")
        print("\nTo train the model, run:")
        print("  python train_leaf_detector.py")
        sys.exit(1)
    
    test_on_disease_images()
    test_on_random_noise()
    
    print("\n" + "="*70)
    print("✅ Testing Complete!")
    print("="*70)


if __name__ == '__main__':
    main()
