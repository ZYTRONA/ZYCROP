"""
tensorflow_leaf_detector.py — TensorFlow Binary Leaf Detector
===========================================================
Detects whether an image contains a leaf using a TensorFlow model.
Outputs bounding box of the detected leaf region.
"""

import time
from typing import Any, List, Optional, Tuple
from pathlib import Path

from detection.base import BaseDetector, Detection, DetectionResult
from config import MODELS, DETECTION_CONFIG, PERFORMANCE
from utils.logger import detection_logger, performance_logger, error_logger

# Lazy imports
_tf_ok = False
_np_ok = False
tf: Any = None
np: Any = None

try:
    import tensorflow as tf
    _tf_ok = True
    print("[OK] TensorFlow available")
except ImportError:
    print("[WARN] TensorFlow not installed — run: pip install tensorflow")

try:
    import numpy as np
    _np_ok = True
except ImportError:
    print("[WARN] numpy not available")


class TensorFlowLeafDetector(BaseDetector):
    """TensorFlow-based leaf detection model."""
    
    def __init__(
        self,
        model_path: str = "models/leaf_detector.tflite",
        confidence_threshold: float = 0.5
    ):
        """Initialize TensorFlow leaf detector.
        
        Args:
            model_path: Path to TFLite model file
            confidence_threshold: Minimum confidence for leaf detection
        """
        super().__init__(
            model_name="TensorFlow-LeafDetector",
            model_version="1.0",
            confidence_threshold=confidence_threshold
        )
        
        self.model_path = model_path
        self.interpreter: Optional[Any] = None
        self.input_details: Optional[list] = None
        self.output_details: Optional[list] = None
    
    def load(self) -> bool:
        """Load TFLite model.
        
        Returns:
            True if successful, False otherwise
        """
        if not _tf_ok:
            error_logger.log_error('tf_leaf_detector', ImportError("TensorFlow not available"), None)
            return False
        
        try:
            start_time = time.time()
            
            model_file = Path(self.model_path)
            if not model_file.exists():
                raise FileNotFoundError(f"Model not found: {self.model_path}")
            
            print(f"[INFO] Loading TFLite leaf detector from {self.model_path}...")
            
            # Load TFLite model
            self.interpreter = tf.lite.Interpreter(
                model_path=str(self.model_path)
            )
            self.interpreter.allocate_tensors()
            
            # Get input/output details
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
            
            duration = time.time() - start_time
            performance_logger.log_performance('tf_leaf_detector', 'model_load', duration)
            
            self.is_loaded = True
            print(f"[OK] TensorFlow leaf detector loaded in {duration:.2f}s")
            return True
        except Exception as e:
            error_logger.log_error('tf_leaf_detector', e, {'model_path': self.model_path})
            print(f"[ERROR] Failed to load TFLite model: {str(e)}")
            self.is_loaded = False
            return False
    
    def unload(self) -> None:
        """Unload model to free memory."""
        if self.interpreter is not None:
            try:
                del self.interpreter
                self.interpreter = None
                self.is_loaded = False
                print("[OK] TensorFlow leaf detector unloaded")
            except Exception as e:
                error_logger.log_error('tf_leaf_detector', e, {'operation': 'unload'})
    
    def detect(self, image_array: Any) -> DetectionResult:
        """Run leaf detection on image.
        
        Args:
            image_array: Numpy array (H, W, 3), values in [0, 255] or [0, 1]
            
        Returns:
            DetectionResult with leaf detections
        """
        if not self.is_loaded or self.interpreter is None:
            return DetectionResult(
                image_path="unknown",
                detections=[],
                inference_time=0.0,
                model_name=self.model_name,
                model_version=self.model_version,
                input_shape=(0, 0),
                processing_notes="Model not loaded"
            )
        
        if not _np_ok:
            return DetectionResult(
                image_path="unknown",
                detections=[],
                inference_time=0.0,
                model_name=self.model_name,
                model_version=self.model_version,
                input_shape=(0, 0),
                processing_notes="NumPy not available"
            )
        
        try:
            # Get image dimensions
            if len(image_array.shape) == 3:
                h, w, c = image_array.shape
            else:
                h, w = image_array.shape[:2]
                c = 1
            
            original_shape = (h, w)
            
            # Prepare input: normalize to [0, 1] if needed
            input_data = image_array.copy()
            if input_data.dtype == np.uint8:
                input_data = input_data.astype(np.float32) / 255.0
            
            # Ensure float32
            if input_data.dtype != np.float32:
                input_data = input_data.astype(np.float32)
            
            # Resize to model input size (224x224)
            from PIL import Image
            
            # Convert to uint8 temporarily for PIL
            img_uint8 = (input_data * 255).astype(np.uint8) if input_data.max() <= 1 else input_data.astype(np.uint8)
            img_pil = Image.fromarray(img_uint8)
            img_resized = img_pil.resize((224, 224), Image.Resampling.LANCZOS)
            input_array = np.array(img_resized, dtype=np.float32) / 255.0
            
            # Add batch dimension
            input_array = np.expand_dims(input_array, axis=0)
            
            # Run inference
            start_time = time.time()
            self.interpreter.set_tensor(self.input_details[0]['index'], input_array)
            self.interpreter.invoke()
            inference_time = time.time() - start_time
            
            # Get output (confidence for "leaf" class)
            output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
            leaf_confidence = float(output_data[0][0])
            
            performance_logger.log_performance('tf_leaf_detector', 'inference', inference_time)
            
            detections = []
            
            # If confidence above threshold, create a detection
            if leaf_confidence >= self.confidence_threshold:
                # Create a full-image detection (we don't have precise bbox)
                # Use the full image as the detection region
                detection = Detection(
                    class_id=0,
                    class_name="Leaf",
                    confidence=leaf_confidence,
                    bbox=(0.0, 0.0, 1.0, 1.0),  # Normalized bbox (full image)
                    area=float(h * w),
                    metadata={
                        'model': 'TensorFlow',
                        'confidence_raw': leaf_confidence
                    }
                )
                detections.append(detection)
            
            return DetectionResult(
                image_path="unknown",
                detections=detections,
                inference_time=inference_time,
                model_name=self.model_name,
                model_version=self.model_version,
                input_shape=original_shape,
                processing_notes=f"Leaf confidence: {leaf_confidence:.3f}"
            )
        except Exception as e:
            error_logger.log_error('tf_leaf_detector', e, {'input_shape': image_array.shape})
            print(f"[ERROR] Inference failed: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return DetectionResult(
                image_path="unknown",
                detections=[],
                inference_time=0.0,
                model_name=self.model_name,
                model_version=self.model_version,
                input_shape=(0, 0),
                processing_notes=f"Error: {str(e)}"
            )
    
    def set_confidence_threshold(self, threshold: float) -> None:
        """Set confidence threshold for detections.
        
        Args:
            threshold: Value between 0 and 1
        """
        if 0.0 <= threshold <= 1.0:
            self.confidence_threshold = threshold
            print(f"[INFO] TensorFlow leaf detector threshold: {threshold:.2f}")
