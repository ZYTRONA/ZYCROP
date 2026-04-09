"""
base.py — Abstract Detection Interface
======================================
Defines the base interface for all detection models.
Ensures consistent API across different detectors.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Any
import time


@dataclass
class Detection:
    """Represents a single detection result."""
    class_id: int
    class_name: str
    confidence: float
    bbox: tuple[float, float, float, float]  # (x1, y1, x2, y2)
    area: float  # Bounding box area
    metadata: Optional[dict[str, Any]] = None
    
    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            'class_id': self.class_id,
            'class_name': self.class_name,
            'confidence': round(self.confidence, 3),
            'bbox': [round(x, 2) for x in self.bbox],
            'area': round(self.area, 2),
            'metadata': self.metadata or {},
        }


@dataclass
class DetectionResult:
    """Complete detection result for an image."""
    image_path: str
    detections: List[Detection]
    inference_time: float  # seconds
    model_name: str
    model_version: str
    input_shape: tuple[int, int]
    output_shape: Optional[tuple[int, ...]] = None
    processing_notes: Optional[str] = None
    
    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for API response."""
        return {
            'model': self.model_name,
            'version': self.model_version,
            'inference_time_ms': round(self.inference_time * 1000, 2),
            'detections_count': len(self.detections),
            'detections': [d.to_dict() for d in self.detections],
            'input_shape': self.input_shape,
            'processing_notes': self.processing_notes,
        }


@dataclass
class ClassificationResult:
    """Result from disease classification."""
    class_id: int
    class_name: str
    confidence: float
    top_k_predictions: Optional[List[tuple[str, float]]] = None
    inference_time: float = 0.0
    
    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            'disease': self.class_name,
            'confidence': round(self.confidence, 3),
            'inference_time_ms': round(self.inference_time * 1000, 2),
            'top_predictions': [
                {'name': name, 'confidence': round(conf, 3)}
                for name, conf in (self.top_k_predictions or [])
            ],
        }


class BaseDetector(ABC):
    """Abstract base class for detection models."""
    
    def __init__(
        self,
        model_name: str,
        model_version: str,
        confidence_threshold: float = 0.5
    ):
        """Initialize detector.
        
        Args:
            model_name: Name of the model
            model_version: Version string
            confidence_threshold: Minimum confidence for detections
        """
        self.model_name = model_name
        self.model_version = model_version
        self.confidence_threshold = confidence_threshold
        self.is_loaded = False
    
    @abstractmethod
    def load(self) -> bool:
        """Load model weights. Returns True if successful."""
        pass
    
    @abstractmethod
    def unload(self) -> None:
        """Unload model to free memory."""
        pass
    
    @abstractmethod
    def detect(self, image_array: Any) -> DetectionResult:
        """Run detection on image.
        
        Args:
            image_array: Numpy array (H, W, 3) or (1, H, W, 3)
            
        Returns:
            DetectionResult object
        """
        pass
    
    def preprocess(self, image_array: Any) -> Optional[Any]:
        """Preprocess image for model. Override if needed."""
        return image_array
    
    def postprocess(self, raw_output: Any) -> List[Detection]:
        """Postprocess model output. Override if needed."""
        return []
    
    def set_confidence_threshold(self, threshold: float) -> None:
        """Dynamically set confidence threshold.
        
        Args:
            threshold: Value between 0 and 1
        """
        if 0.0 <= threshold <= 1.0:
            self.confidence_threshold = threshold
    
    def is_ready(self) -> bool:
        """Check if model is ready for inference."""
        return self.is_loaded


class BaseClassifier(ABC):
    """Abstract base class for classification models."""
    
    def __init__(
        self,
        model_name: str,
        model_version: str,
        num_classes: int,
        confidence_threshold: float = 0.5
    ):
        """Initialize classifier.
        
        Args:
            model_name: Name of the model
            model_version: Version string
            num_classes: Number of output classes
            confidence_threshold: Minimum confidence threshold
        """
        self.model_name = model_name
        self.model_version = model_version
        self.num_classes = num_classes
        self.confidence_threshold = confidence_threshold
        self.class_names: List[str] = [f"class_{i}" for i in range(num_classes)]
        self.is_loaded = False
    
    @abstractmethod
    def load(self) -> bool:
        """Load model weights. Returns True if successful."""
        pass
    
    @abstractmethod
    def unload(self) -> None:
        """Unload model to free memory."""
        pass
    
    @abstractmethod
    def classify(self, image_array: Any) -> ClassificationResult:
        """Run classification on image.
        
        Args:
            image_array: Numpy array
            
        Returns:
            ClassificationResult object
        """
        pass
    
    def set_class_names(self, names: List[str]) -> None:
        """Set class names.
        
        Args:
            names: List of class name strings
        """
        if len(names) == self.num_classes:
            self.class_names = names
    
    def is_ready(self) -> bool:
        """Check if model is ready for inference."""
        return self.is_loaded
