"""
logger.py — Structured Logging for ZYCROP Detection Pipeline
=============================================================
Provides production-grade logging with JSON formatting and performance metrics.
"""

import json
import logging
import time
from datetime import datetime
from typing import Any, Dict, Optional


class StructuredLogger:
    """Structured logger for detection pipeline with performance metrics."""
    
    def __init__(self, name: str, level: int = logging.INFO):
        """Initialize structured logger.
        
        Args:
            name: Logger name (typically __name__)
            level: Logging level (default: INFO)
        """
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)
        
        # Console handler with JSON formatting
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        
        if not self.logger.handlers:
            self.logger.addHandler(handler)
    
    def log_detection(
        self,
        model_name: str,
        image_path: str,
        inference_time: float,
        detections_count: int,
        confidence_scores: list[float],
        status: str = "success",
        error: Optional[str] = None
    ) -> None:
        """Log detection event with metrics.
        
        Args:
            model_name: Name of the detection model used
            image_path: Path or URI of processed image
            inference_time: Time taken for inference (seconds)
            detections_count: Number of objects detected
            confidence_scores: List of confidence scores
            status: Detection status (success/error/partial)
            error: Error message if any
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": "detection",
            "model": model_name,
            "image_hash": hash(image_path) % 10**8,  # Anonymized
            "metrics": {
                "inference_time_ms": round(inference_time * 1000, 2),
                "detections_count": detections_count,
                "avg_confidence": round(sum(confidence_scores) / len(confidence_scores), 3) if confidence_scores else 0,
                "min_confidence": round(min(confidence_scores), 3) if confidence_scores else 0,
                "max_confidence": round(max(confidence_scores), 3) if confidence_scores else 0,
            },
            "status": status,
            "error": error,
        }
        
        log_message = json.dumps(log_data)
        if status == "success":
            self.logger.info(log_message)
        elif status == "error":
            self.logger.error(log_message)
        else:
            self.logger.warning(log_message)
    
    def log_performance(self, component: str, operation: str, duration: float) -> None:
        """Log performance metrics for operations.
        
        Args:
            component: Component name (e.g., 'yolo_detector', 'classifier')
            operation: Operation name (e.g., 'inference', 'preprocessing')
            duration: Operation duration in seconds
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": "performance",
            "component": component,
            "operation": operation,
            "duration_ms": round(duration * 1000, 2),
        }
        self.logger.info(json.dumps(log_data))
    
    def log_error(self, component: str, error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
        """Log error with context.
        
        Args:
            component: Component where error occurred
            error: Exception object
            context: Additional context information
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": "error",
            "component": component,
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context or {},
        }
        self.logger.error(json.dumps(log_data))


# Global loggers
detection_logger = StructuredLogger("detection_pipeline")
performance_logger = StructuredLogger("performance", logging.DEBUG)
error_logger = StructuredLogger("errors", logging.ERROR)
