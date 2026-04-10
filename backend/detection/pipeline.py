"""
pipeline.py — Detection Pipeline Orchestrator
============================================
Coordinates YOLO leaf detection + disease classification
for complete end-to-end leaf disease analysis.
"""

import time
from dataclasses import dataclass, field
from typing import Any, List, Optional, Dict

from detection.base import Detection, DetectionResult
from detection.tensorflow_leaf_detector import TensorFlowLeafDetector  # NEW: TensorFlow detector
from detection.disease_classifier import DiseaseClassifier
from config import DETECTION_CONFIG
from utils.logger import detection_logger, performance_logger, error_logger

try:
    import numpy as np
    _np_ok = True
except ImportError:
    _np_ok = False
    np: Any = None


@dataclass
class LeafAnalysisResult:
    """Complete analysis result for a leaf in image."""
    detection: Detection  # YOLO detection
    disease_prediction: Optional[Dict[str, Any]] = None
    leaf_index: int = 0
    analysis_time: float = 0.0
    confidence_composite: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'leaf_id': self.leaf_index,
            'location': {
                'bbox': [round(x, 3) for x in self.detection.bbox],
                'area': round(self.detection.area, 4),
            },
            'disease': self.disease_prediction or {},
            'composite_confidence': round(self.confidence_composite, 3),
            'analysis_time_ms': round(self.analysis_time * 1000, 2),
        }


@dataclass
class PipelineResult:
    """Complete pipeline execution result."""
    total_time: float
    detections_count: int
    analyzed_count: int
    leaves: List[LeafAnalysisResult] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    image_info: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictioary."""
        return {
            'total_time_ms': round(self.total_time * 1000, 2),
            'detections_found': self.detections_count,
            'analyzed': self.analyzed_count,
            'leaves': [leaf.to_dict() for leaf in self.leaves],
            'errors': self.errors,
            'image_info': self.image_info,
        }


class DetectionPipeline:
    """Orchestrator for complete leaf disease detection pipeline."""
    
    def __init__(
        self,
        use_tensorflow: bool = True,  # NEW: Use TensorFlow instead of YOLO
        yolo_model_size: str = 'm',
        yolo_conf: Optional[float] = None,
        tf_leaf_conf: Optional[float] = 0.5,  # NEW: TensorFlow threshold
        disease_conf: Optional[float] = None
    ):
        """Initialize pipeline.
        
        Args:
            use_tensorflow: Use TensorFlow leaf detector instead of YOLO (NEW)
            yolo_model_size: YOLO model size (nano, small, medium, large)
            yolo_conf: YOLO confidence threshold override
            tf_leaf_conf: TensorFlow leaf detector threshold (NEW)
            disease_conf: Disease classifier confidence threshold override
        """
        self.use_tensorflow = use_tensorflow
        self.yolo_conf = yolo_conf or DETECTION_CONFIG['yolo']['confidence_threshold']
        self.tf_leaf_conf = tf_leaf_conf
        self.disease_conf = disease_conf or DETECTION_CONFIG['disease_classifier']['confidence_threshold']
        
        # Initialize detectors (NEW: Use TensorFlow by default)
        if self.use_tensorflow:
            self.leaf_detector = TensorFlowLeafDetector(
                model_path="models/leaf_detector.tflite",
                confidence_threshold=self.tf_leaf_conf
            )
        else:
            from detection.yolo_detector import YOLODetector  # Fallback to YOLO
            self.leaf_detector = YOLODetector(
                model_name=yolo_model_size,
                confidence_threshold=self.yolo_conf
            )
        
        self.disease_classifier = DiseaseClassifier(
            confidence_threshold=self.disease_conf
        )
        
        self.is_initialized = False
    
    def initialize(self) -> bool:
        """Initialize all models.
        
        Returns:
            True if all models loaded successfully
        """
        try:
            print("\n[INIT] Initializing Detection Pipeline...")
            print(f"[INFO] Using {'TensorFlow' if self.use_tensorflow else 'YOLO'} leaf detector")
            
            # Load leaf detector (TensorFlow or YOLO)
            detector_ok = self.leaf_detector.load()
            if not detector_ok:
                detector_name = 'TensorFlow' if self.use_tensorflow else 'YOLO'
                error_logger.log_error('pipeline', Exception(f"{detector_name} load failed"), None)
                print(f"[ERROR] {detector_name} detector failed to load")
            
            # Load disease classifier
            classifier_ok = self.disease_classifier.load()
            if not classifier_ok:
                error_logger.log_error('pipeline', Exception("Classifier load failed"), None)
                print("[ERROR] Disease classifier failed to load")
            
            self.is_initialized = detector_ok and classifier_ok
            
            if self.is_initialized:
                print("[OK] Pipeline initialized successfully\n")
            else:
                print("[WARN] Pipeline initialized with errors\n")
            
            return self.is_initialized
        except Exception as e:
            error_logger.log_error('pipeline', e, {'operation': 'initialize'})
            self.is_initialized = False
            return False
    
    def shutdown(self) -> None:
        """Shutdown and cleanup all models."""
        print("[SHUTDOWN] Cleaning up pipeline...")
        if self.leaf_detector:  # UPDATED: Use leaf_detector instead of yolo_detector
            self.leaf_detector.unload()
        if self.disease_classifier:
            self.disease_classifier.unload()
        print("[OK] Pipeline shutdown complete")
    
    def process_image(
        self,
        image_array: Any,
        analyze_all_detections: bool = True,
        max_leaves: Optional[int] = None
    ) -> PipelineResult:
        """Process image through complete pipeline.
        
        Args:
            image_array: Numpy array (H, W, 3)
            analyze_all_detections: Whether to classify all detected leaves
            max_leaves: Maximum leaves to analyze (None = all)
            
        Returns:
            PipelineResult with all detections and classifications
        """
        if not self.is_initialized:
            return PipelineResult(
                total_time=0.0,
                detections_count=0,
                analyzed_count=0,
                errors=["Pipeline not initialized"]
            )
        
        if not _np_ok:
            return PipelineResult(
                total_time=0.0,
                detections_count=0,
                analyzed_count=0,
                errors=["NumPy not available"]
            )
        
        pipeline_start = time.time()
        errors: List[str] = []
        leaves: List[LeafAnalysisResult] = []
        
        try:
            # Get image info
            h, w = image_array.shape[:2]
            image_info = {
                'width': w,
                'height': h,
                'channels': image_array.shape[2] if len(image_array.shape) > 2 else 1,
            }
            
            # ─ Stage 1: Leaf Detection ────────────────────────────────────────
            yolo_start = time.time()
            detector_result = self.leaf_detector.detect(image_array)  # UPDATED: Use leaf_detector
            
            # Unpack
            detections = detector_result.detections
            detections_count = len(detections)
            
            detector_time = time.time() - yolo_start
            
            detector_name = 'TensorFlow' if self.use_tensorflow else 'YOLO'
            performance_logger.log_performance('pipeline', f'{detector_name.lower()}_stage', detector_time)
            print(f"[{detector_name}] Detected {detections_count} potential leaves in {detector_time:.3f}s")
            
            # ─ No leaves detected → Return immediately ─
            if detections_count == 0:
                detector_name = 'TensorFlow' if self.use_tensorflow else 'YOLO'
                print(f"[INFO] No leaves detected by {detector_name}")
                return PipelineResult(
                    total_time=time.time() - pipeline_start,
                    detections_count=0,
                    analyzed_count=0,
                    leaves=[],
                    errors=errors,
                    image_info=image_info
                )
            
            # ─ Stage 2: Disease Classification ────────────────────────────────
            if analyze_all_detections:
                # Limit to max leaves if specified
                to_analyze = detections[:max_leaves] if max_leaves else detections
                
                for leaf_idx, detection in enumerate(to_analyze):
                    try:
                        classify_start = time.time()
                        
                        # Classify this leaf
                        disease_result = self.disease_classifier.classify_crop(
                            image_array,
                            bbox=detection.bbox
                        )
                        classify_time = time.time() - classify_start
                        
                        # Create analysis result
                        analysis = LeafAnalysisResult(
                            detection=detection,
                            disease_prediction={
                                'disease': disease_result.class_name,
                                'confidence': round(disease_result.confidence, 3),
                                'top_predictions': [
                                    {'name': name, 'confidence': round(conf, 3)}
                                    for name, conf in (disease_result.top_k_predictions or [])
                                ],
                                'disease_info': disease_result.disease_info,  # ADDED: Include disease info
                            },
                            leaf_index=leaf_idx,
                            analysis_time=classify_time,
                            confidence_composite=round(
                                (detection.confidence + disease_result.confidence) / 2, 3
                            )
                        )
                        leaves.append(analysis)
                        
                        performance_logger.log_performance(
                            'pipeline',
                            f'disease_classification_leaf_{leaf_idx}',
                            classify_time
                        )
                        
                    except Exception as e:
                        error_msg = f"Classification failed for leaf {leaf_idx}: {str(e)}"
                        errors.append(error_msg)
                        error_logger.log_error('pipeline', e, {'leaf_index': leaf_idx})
                        
                        # Get fallback disease instead of giving up
                        print(f"[FALLBACK] Leaf {leaf_idx} classification failed, using fallback disease")
                        fallback_result = self.disease_classifier._get_fallback_disease()
                        
                        # Create analysis result with fallback disease
                        analysis = LeafAnalysisResult(
                            detection=detection,
                            disease_prediction={
                                'disease': fallback_result.class_name,
                                'confidence': round(fallback_result.confidence, 3),
                                'top_predictions': [
                                    {'name': name, 'confidence': round(conf, 3)}
                                    for name, conf in (fallback_result.top_k_predictions or [])
                                ],
                                'disease_info': fallback_result.disease_info,
                            },
                            leaf_index=leaf_idx,
                            analysis_time=0.0,
                            confidence_composite=round(
                                (detection.confidence + fallback_result.confidence) / 2, 3
                            )
                        )
                        leaves.append(analysis)
                else:
                    # Just use detections
                    leaves = [
                        LeafAnalysisResult(
                            detection=det,
                            leaf_index=idx,
                            confidence_composite=det.confidence
                        )
                        for idx, det in enumerate(detections)
                    ]
            
            # ─ Complete ────────────────────────────────────────────────────────
            total_time = time.time() - pipeline_start
            
            result = PipelineResult(
                total_time=total_time,
                detections_count=detections_count,
                analyzed_count=len(leaves),
                leaves=leaves,
                errors=errors,
                image_info=image_info
            )
            
            print(f"[COMPLETE] Pipeline finished in {total_time:.3f}s - Analyzed {len(leaves)}/{detections_count} leaves")
            
            return result
        except Exception as e:
            error_logger.log_error('pipeline', e, {'operation': 'process_image'})
            total_time = time.time() - pipeline_start
            return PipelineResult(
                total_time=total_time,
                detections_count=0,
                analyzed_count=0,
                leaves=[],
                errors=[str(e)]
            )
