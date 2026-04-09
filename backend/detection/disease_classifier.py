"""
disease_classifier.py — Disease Detection Classifier
===================================================
TFLite-based disease classification for detected leaves.
Works in conjunction with YOLOv8 detector.
"""

import json
import time
from typing import Any, List, Optional, Tuple
from pathlib import Path

from detection.base import BaseClassifier, ClassificationResult
from config import MODELS, DETECTION_CONFIG
from utils.logger import detection_logger, performance_logger, error_logger

# Lazy imports
_tflite_ok = False
_tflite_module: Any = None
_np_ok = False
np: Any = None

try:
    import tflite_runtime.interpreter as _tflite_module
    _tflite_ok = True
    print("[OK] tflite-runtime available")
except ImportError:
    try:
        import tensorflow as _tf
        _tflite_module = _tf.lite
        _tflite_ok = True
        print("[OK] tensorflow.lite available")
    except ImportError:
        print("[WARN] No TFLite backend available")

try:
    import numpy as np
    _np_ok = True
except ImportError:
    print("[WARN] numpy not available")


class DiseaseClassifier(BaseClassifier):
    """TFLite-based disease classification."""
    
    def __init__(
        self,
        model_path: Optional[str] = None,
        labels_path: Optional[str] = None,
        confidence_threshold: float = 0.60
    ):
        """Initialize disease classifier.
        
        Args:
            model_path: Path to TFLite model file
            labels_path: Path to labels JSON file
            confidence_threshold: Minimum confidence threshold
        """
        super().__init__(
            model_name="DiseaseClassifier",
            model_version="1.0",
            num_classes=38,  # PlantVillage dataset has ~38 classes
            confidence_threshold=confidence_threshold
        )
        
        self.model_path = model_path or MODELS['disease_classifier']['path']
        self.labels_path = labels_path
        self.interpreter: Optional[Any] = None
        self.input_details: Optional[Any] = None
        self.output_details: Optional[Any] = None
        self.input_size = MODELS['disease_classifier']['input_size']
    
    def load(self) -> bool:
        """Load TFLite model.
        
        Returns:
            True if successful
        """
        if not _tflite_ok or _tflite_module is None:
            error_logger.log_error(
                'disease_classifier',
                ImportError("TFLite not available"),
                None
            )
            return False
        
        try:
            start_time = time.time()
            
            # Load model
            model_path = str(self.model_path)
            self.interpreter = _tflite_module.Interpreter(model_path=model_path)
            self.interpreter.allocate_tensors()
            
            # Get input/output details
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
            
            # Load labels if available
            self._load_labels()
            
            duration = time.time() - start_time
            performance_logger.log_performance('disease_classifier', 'model_load', duration)
            
            self.is_loaded = True
            print(f"[OK] Disease classifier loaded in {duration:.2f}s from {model_path}")
            return True
        except Exception as e:
            error_logger.log_error(
                'disease_classifier',
                e,
                {'model_path': str(self.model_path)}
            )
            self.is_loaded = False
            return False
    
    def unload(self) -> None:
        """Unload model to free memory."""
        try:
            self.interpreter = None
            self.input_details = None
            self.output_details = None
            self.is_loaded = False
            print("[OK] Disease classifier unloaded")
        except Exception as e:
            error_logger.log_error('disease_classifier', e, {'operation': 'unload'})
    
    def _load_labels(self) -> None:
        """Load disease labels from JSON file."""
        try:
            if self.labels_path and Path(self.labels_path).exists():
                with open(self.labels_path, 'r') as f:
                    labels_data = json.load(f)
                    if isinstance(labels_data, dict):
                        self.class_names = [labels_data.get(str(i), f"Disease_{i}") 
                                           for i in range(self.num_classes)]
                    elif isinstance(labels_data, list):
                        self.class_names = labels_data[:self.num_classes]
        except Exception as e:
            error_logger.log_error('disease_classifier', e, {'operation': '_load_labels'})
    
    def classify(self, image_array: Any) -> ClassificationResult:
        """Classify image for disease.
        
        Args:
            image_array: Numpy array (H, W, 3) or (224, 224, 3)
            
        Returns:
            ClassificationResult
        """
        if not self.is_loaded or self.interpreter is None:
            return ClassificationResult(
                class_id=-1,
                class_name="Unknown",
                confidence=0.0,
                inference_time=0.0
            )
        
        if not _np_ok:
            return ClassificationResult(
                class_id=-1,
                class_name="Error",
                confidence=0.0,
                inference_time=0.0
            )
        
        try:
            # Preprocess
            processed = self._preprocess(image_array)
            if processed is None:
                return ClassificationResult(
                    class_id=-1,
                    class_name="Preprocessing failed",
                    confidence=0.0,
                    inference_time=0.0
                )
            
            # Set input tensor
            input_data = np.expand_dims(processed, axis=0).astype(np.float32)
            self.interpreter.set_tensor(self.input_details[0]['index'], input_data)
            
            # Run inference
            start_time = time.time()
            self.interpreter.invoke()
            inference_time = time.time() - start_time
            
            # Get output
            output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
            
            # Get predictions
            predictions = output_data[0]
            class_id = int(np.argmax(predictions))
            confidence = float(predictions[class_id])
            
            # Get top-k predictions
            top_k = DETECTION_CONFIG['disease_classifier']['top_k']
            top_indices = np.argsort(predictions)[-top_k:][::-1]
            top_predictions = [
                (self.class_names[idx], float(predictions[idx]))
                for idx in top_indices
            ]
            
            result = ClassificationResult(
                class_id=class_id,
                class_name=self.class_names[class_id],
                confidence=confidence,
                top_k_predictions=top_predictions,
                inference_time=inference_time
            )
            
            # Log
            detection_logger.log_detection(
                model_name=self.model_name,
                image_path="disease_input",
                inference_time=inference_time,
                detections_count=1,
                confidence_scores=[confidence],
                status="success"
            )
            
            return result
        except Exception as e:
            error_logger.log_error('disease_classifier', e, {'operation': 'classify'})
            return ClassificationResult(
                class_id=-1,
                class_name="Error",
                confidence=0.0,
                inference_time=0.0
            )
    
    def _preprocess(self, image_array: Any) -> Optional[Any]:
        """Preprocess image for model.
        
        Args:
            image_array: Input numpy array
            
        Returns:
            Preprocessed array or None on error
        """
        try:
            if not _np_ok:
                return None
            
            # Resize to model input size
            if len(image_array.shape) == 3 and image_array.shape != (self.input_size, self.input_size, 3):
                # Use simple resize - can be improved with PIL
                from PIL import Image
                img = Image.fromarray((image_array * 255).astype('uint8'))
                img = img.resize((self.input_size, self.input_size), Image.Resampling.LANCZOS)
                image_array = np.array(img, dtype=np.float32) / 255.0
            elif len(image_array.shape) == 2:
                # Grayscale - convert to RGB
                from PIL import Image
                img = Image.fromarray((image_array * 255).astype('uint8'))
                img = img.convert('RGB')
                img = img.resize((self.input_size, self.input_size), Image.Resampling.LANCZOS)
                image_array = np.array(img, dtype=np.float32) / 255.0
            
            # Ensure float32 and normalized
            image_array = image_array.astype(np.float32)
            if image_array.max() > 1.5:  # If not normalized
                image_array = image_array / 255.0
            
            return image_array
        except Exception as e:
            error_logger.log_error('disease_classifier', e, {'operation': '_preprocess'})
            return None
    
    def classify_crop(
        self,
        image_array: Any,
        bbox: Optional[Tuple[float, float, float, float]] = None
    ) -> ClassificationResult:
        """Classify a cropped region (from YOLO detection).
        
        Args:
            image_array: Full image as numpy array
            bbox: Normalized bbox (x1, y1, x2, y2) or None for full image
            
        Returns:
            ClassificationResult for the crop
        """
        try:
            if bbox is not None and _np_ok:
                h, w = image_array.shape[:2]
                x1, y1, x2, y2 = bbox
                
                # Convert normalized to pixel coordinates
                x1_px = int(x1 * w)
                y1_px = int(y1 * h)
                x2_px = int(x2 * w)
                y2_px = int(y2 * h)
                
                # Ensure bounds
                x1_px = max(0, x1_px)
                y1_px = max(0, y1_px)
                x2_px = min(w, x2_px)
                y2_px = min(h, y2_px)
                
                # Crop image
                crop = image_array[y1_px:y2_px, x1_px:x2_px]
                return self.classify(crop)
            else:
                return self.classify(image_array)
        except Exception as e:
            error_logger.log_error('disease_classifier', e, {'operation': 'classify_crop'})
            return ClassificationResult(
                class_id=-1,
                class_name="Error",
                confidence=0.0,
                inference_time=0.0
            )
