"""
detection package — Structured detection pipeline
"""

from .base import BaseDetector, BaseClassifier, Detection, DetectionResult, ClassificationResult
from .yolo_detector import YOLODetector
from .disease_classifier import DiseaseClassifier
from .pipeline import DetectionPipeline, PipelineResult

__all__ = [
    'BaseDetector',
    'BaseClassifier',
    'Detection',
    'DetectionResult',
    'ClassificationResult',
    'YOLODetector',
    'DiseaseClassifier',
    'DetectionPipeline',
    'PipelineResult',
]
