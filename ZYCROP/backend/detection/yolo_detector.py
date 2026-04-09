"""
yolo_detector.py — YOLOv8 Real-Time Leaf Detection
==================================================
Implements YOLOv8 for real-time detection of crop leaves with
optional ONNX/TFLite export for edge deployment.
"""

import time
from typing import Any, List, Optional, Tuple
from pathlib import Path

from detection.base import BaseDetector, Detection, DetectionResult
from config import MODELS, DETECTION_CONFIG, PERFORMANCE
from utils.logger import detection_logger, performance_logger, error_logger

# Lazy imports
_yolo_ok = False
YOLO: Any = None
try:
    from ultralytics import YOLO
    _yolo_ok = True
    print("[OK] YOLOv8 (ultralytics) available")
except ImportError:
    print("[WARN] YOLOv8 not installed — run: pip install ultralytics")

_np_ok = False
np: Any = None
try:
    import numpy as np
    _np_ok = True
except ImportError:
    print("[WARN] numpy not available for YOLOv8")


class YOLODetector(BaseDetector):
    """YOLOv8 detector for leaf/plant detection."""
    
    def __init__(
        self,
        model_name: str = 'yolov8m',
        confidence_threshold: float = 0.45,
        iou_threshold: float = 0.45
    ):
        """Initialize YOLO detector.
        
        Args:
            model_name: YOLO model size (nano, small, medium, large, xlarge)
            confidence_threshold: Minimum confidence for detections
            iou_threshold: IOU threshold for NMS
        """
        super().__init__(
            model_name=f"YOLOv8-{model_name}",
            model_version="8.0+",
            confidence_threshold=confidence_threshold
        )
        
        self.model_size = model_name
        self.iou_threshold = iou_threshold
        self.model: Optional[Any] = None
        self.input_size = MODELS['yolo_detector']['input_size']
        self.target_classes = DETECTION_CONFIG['yolo']['classes']
    
    def load(self) -> bool:
        """Load YOLOv8 model.
        
        Returns:
            True if successful, False otherwise
        """
        if not _yolo_ok:
            error_logger.log_error('yolo_detector', ImportError("YOLOv8 not available"), None)
            return False
        
        try:
            start_time = time.time()
            
            print(f"[INFO] Loading YOLOv8-{self.model_size} model...")
            print(f"[INFO] First run will auto-download model (~{12 if self.model_size == 'n' else 49 if self.model_size == 'm' else 100}MB)...")
            
            # ultralytics auto-downloads to ~/.cache/model; verbose=False reduces output
            self.model = YOLO(f"yolov8{self.model_size}.pt", verbose=False)
            
            duration = time.time() - start_time
            performance_logger.log_performance('yolo_detector', 'model_load', duration)
            
            self.is_loaded = True
            print(f"[OK] YOLOv8 model loaded in {duration:.2f}s")
            return True
        except Exception as e:
            error_logger.log_error('yolo_detector', e, {'model_size': self.model_size})
            print(f"[ERROR] Failed to load YOLOv8: {str(e)}")
            self.is_loaded = False
            return False
    
    def unload(self) -> None:
        """Unload model to free memory."""
        if self.model is not None:
            try:
                del self.model
                self.model = None
                self.is_loaded = False
                print("[OK] YOLOv8 model unloaded")
            except Exception as e:
                error_logger.log_error('yolo_detector', e, {'operation': 'unload'})
    
    def detect(self, image_array: Any) -> DetectionResult:
        """Run detection on image.
        
        Args:
            image_array: Numpy array (H, W, 3)
            
        Returns:
            DetectionResult with bounding boxes
        """
        if not self.is_loaded or self.model is None:
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
            # Get original dimensions
            if len(image_array.shape) == 3:
                h, w, c = image_array.shape
            else:
                h, w = image_array.shape[:2]
                c = 1
            
            original_shape = (h, w)
            
            # Run inference
            start_time = time.time()
            results = self.model(image_array, conf=self.confidence_threshold, iou=self.iou_threshold, verbose=False)
            inference_time = time.time() - start_time
            
            # Extract detections
            detections = self._extract_detections(results[0], original_shape)
            
            # Log detection
            confidence_scores = [d.confidence for d in detections]
            detection_logger.log_detection(
                model_name=self.model_name,
                image_path="yolo_input",
                inference_time=inference_time,
                detections_count=len(detections),
                confidence_scores=confidence_scores,
                status="success"
            )
            
            return DetectionResult(
                image_path="yolo_input",
                detections=detections,
                inference_time=inference_time,
                model_name=self.model_name,
                model_version=self.model_version,
                input_shape=(self.input_size, self.input_size),
                output_shape=None,
                processing_notes=f"Detected {len(detections)} objects"
            )
        except Exception as e:
            error_logger.log_error('yolo_detector', e, {'image_shape': image_array.shape})
            return DetectionResult(
                image_path="unknown",
                detections=[],
                inference_time=0.0,
                model_name=self.model_name,
                model_version=self.model_version,
                input_shape=(0, 0),
                processing_notes=f"Error: {str(e)}"
            )
    
    def _extract_detections(self, result: Any, original_shape: Tuple[int, int]) -> List[Detection]:
        """Extract detections from YOLO result.
        
        Args:
            result: YOLOv8 result object
            original_shape: (height, width) of original image
            
        Returns:
            List of Detection objects
        """
        detections: List[Detection] = []
        
        try:
            if result.boxes is None or len(result.boxes) == 0:
                return detections
            
            # Get prediction boxes
            boxes = result.boxes.xyxy.cpu().numpy()  # (N, 4) - x1, y1, x2, y2
            confidences = result.boxes.conf.cpu().numpy()  # (N,)
            class_ids = result.boxes.cls.cpu().numpy().astype(int)  # (N,)
            
            h, w = original_shape
            
            for box, conf, cls_id in zip(boxes, confidences, class_ids):
                x1, y1, x2, y2 = box
                
                # Normalize coordinates to 0-1
                x1_norm = float(x1) / w
                y1_norm = float(y1) / h
                x2_norm = float(x2) / w
                y2_norm = float(y2) / h
                
                # Ensure bounds
                x1_norm = max(0.0, min(1.0, x1_norm))
                y1_norm = max(0.0, min(1.0, y1_norm))
                x2_norm = max(0.0, min(1.0, x2_norm))
                y2_norm = max(0.0, min(1.0, y2_norm))
                
                # Calculate area
                area = (x2_norm - x1_norm) * (y2_norm - y1_norm)
                
                # Get class name
                class_name = result.names.get(int(cls_id), f"class_{cls_id}")
                
                detection = Detection(
                    class_id=int(cls_id),
                    class_name=str(class_name),
                    confidence=float(conf),
                    bbox=(x1_norm, y1_norm, x2_norm, y2_norm),
                    area=area,
                    metadata={
                        'pixel_bbox': [int(x) for x in [x1, y1, x2, y2]],
                        'model_output': f"yolov8_{self.model_size}"
                    }
                )
                detections.append(detection)
            
            # Sort by confidence (descending)
            detections.sort(key=lambda d: d.confidence, reverse=True)
            
            # Limit to max detections
            max_det = DETECTION_CONFIG['yolo']['max_detections']
            detections = detections[:max_det]
            
            return detections
        except Exception as e:
            error_logger.log_error('yolo_detector', e, {'operation': '_extract_detections'})
            return []
    
    def export_onnx(self, output_path: Optional[Path] = None) -> bool:
        """Export model to ONNX format for faster inference.
        
        Args:
            output_path: Path to save ONNX model
            
        Returns:
            True if successful
        """
        if not self.is_loaded or self.model is None:
            return False
        
        try:
            if output_path is None:
                output_path = Path("models") / f"plant_detector_{self.model_size}.onnx"
            
            print(f"[INFO] Exporting YOLOv8 to ONNX: {output_path}")
            self.model.export(format='onnx', imgsz=self.input_size)
            print(f"[OK] ONNX export completed")
            return True
        except Exception as e:
            error_logger.log_error('yolo_detector', e, {'operation': 'export_onnx'})
            return False
    
    def export_tflite(self, output_path: Optional[Path] = None) -> bool:
        """Export model to TFLite format for mobile deployment.
        
        Args:
            output_path: Path to save TFLite model
            
        Returns:
            True if successful
        """
        if not self.is_loaded or self.model is None:
            return False
        
        try:
            if output_path is None:
                output_path = Path("models") / f"plant_detector_{self.model_size}.tflite"
            
            print(f"[INFO] Exporting YOLOv8 to TFLite: {output_path}")
            self.model.export(format='tflite', imgsz=self.input_size)
            print(f"[OK] TFLite export completed")
            return True
        except Exception as e:
            error_logger.log_error('yolo_detector', e, {'operation': 'export_tflite'})
            return False
