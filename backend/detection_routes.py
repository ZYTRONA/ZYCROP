"""
detection_routes.py — Integrated Detection API Endpoints
========================================================
FastAPI routes using the new structured detection pipeline.
This replaces the old diagnose endpoint with enhanced YOLO + Disease detection.
"""

import io
import time
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any

# Import detection pipeline
from detection import DetectionPipeline
from utils.logger import detection_logger, error_logger
from utils.validators import ImageValidator, ImagePreprocessor

try:
    from PIL import Image
    _pil_ok = True
except ImportError:
    _pil_ok = False

try:
    import numpy as np
    _np_ok = True
except ImportError:
    _np_ok = False


# ─── Response Models ──────────────────────────────────────────────────────────

class DiseaseInfo(BaseModel):
    """Disease classification result."""
    disease: str
    confidence: float
    top_predictions: Optional[List[dict]] = None


class LeafDetection(BaseModel):
    """Single leaf detection with disease info."""
    leaf_id: int
    location: dict
    disease: Optional[DiseaseInfo] = None
    composite_confidence: float
    analysis_time_ms: float


class DiagnoseResponse(BaseModel):
    """Complete diagnosis response."""
    status: str
    total_time_ms: float
    detections_found: int
    analyzed: int
    leaves: List[LeafDetection]
    primary_disease: Optional[str] = None
    primary_confidence: Optional[float] = None
    errors: Optional[List[str]] = None


# ─── Setup Router & Pipeline ─────────────────────────────────────────────────

router = APIRouter(prefix="/api", tags=["detection"])

# Global pipeline instance (initialized at startup)
_pipeline: Optional[DetectionPipeline] = None


async def initialize_pipeline() -> bool:
    """Initialize detection pipeline. Call this during app startup."""
    global _pipeline
    try:
        print("\n[STARTUP] Initializing detection pipeline...")
        _pipeline = DetectionPipeline(
            yolo_model_size='m',  # medium - balance between speed and accuracy
            yolo_conf=0.45,
            disease_conf=0.60
        )
        return _pipeline.initialize()
    except Exception as e:
        error_logger.log_error('routes', e, {'operation': 'initialize_pipeline'})
        return False


async def shutdown_pipeline() -> None:
    """Shutdown pipeline. Call this during app shutdown."""
    global _pipeline
    if _pipeline:
        _pipeline.shutdown()
        _pipeline = None


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/diagnose", response_model=DiagnoseResponse)
async def diagnose_crop_leaf(
    file: UploadFile = File(...),
    farmer_id: str = Query("TN-CBE-9021"),
    analyze_all: bool = Query(True),
    max_leaves: Optional[int] = Query(None),
    confidence_threshold: Optional[float] = Query(None),
) -> DiagnoseResponse:
    """
    AI scan for crop leaf disease detection with YOLO + Disease classification.
    
    Process:
    1. Load and validate image
    2. Run YOLOv8 to detect all leaves/plants in image
    3. Classify disease for each detected leaf
    4. Return structured analysis with bounding boxes and predictions
    
    Args:
        file: Image file (jpg, png, etc.)
        farmer_id: Farmer identifier for tracking
        analyze_all: Whether to classify all detections
        max_leaves: Maximum leaves to analyze (None = all)
        confidence_threshold: Override YOLO confidence threshold
        
    Returns:
        DiagnoseResponse with detections and disease predictions
    """
    
    if not _pipeline or not _pipeline.is_initialized:
        raise HTTPException(status_code=503, detail="Detection pipeline not initialized")
    
    if not _pil_ok or not _np_ok:
        raise HTTPException(status_code=503, detail="Required libraries not available")
    
    start_time = time.time()
    
    try:
        # ─ Load and validate image ─────────────────────────────────────────────
        image_bytes = await file.read()
        
        # Validate
        is_valid, error_msg = ImageValidator.validate_image_bytes(image_bytes)
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"Invalid image: {error_msg}")
        
        # Load image
        image_pil = Image.open(io.BytesIO(image_bytes))
        if image_pil.mode != 'RGB':
            image_pil = image_pil.convert('RGB')
        
        # Convert to numpy array
        image_array = np.array(image_pil, dtype=np.float32) / 255.0
        
        print(f"\n[DIAGNOSE] Processing image from farmer {farmer_id}")
        print(f"           Image size: {image_pil.size}")
        
        # ─ Run pipeline ────────────────────────────────────────────────────────
        pipeline_result = _pipeline.process_image(
            image_array,
            analyze_all_detections=analyze_all,
            max_leaves=max_leaves
        )
        
        # ─ Build response ──────────────────────────────────────────────────────
        leaves_response = []
        for leaf in pipeline_result.leaves:
            leaf_data = LeafDetection(
                leaf_id=leaf.leaf_index,
                location=leaf.detection.to_dict()['bbox'],
                disease=DiseaseInfo(**leaf.disease_prediction) if leaf.disease_prediction else None,
                composite_confidence=leaf.confidence_composite,
                analysis_time_ms=leaf.analysis_time * 1000
            )
            leaves_response.append(leaf_data)
        
        # Get primary disease (highest confidence)
        primary_disease = None
        primary_confidence = None
        if leaves_response:
            strongest = max([l for l in leaves_response if l.disease], 
                          key=lambda x: x.disease.confidence, 
                          default=None)
            if strongest:
                primary_disease = strongest.disease.disease
                primary_confidence = strongest.disease.confidence
        
        total_time = time.time() - start_time
        
        response = DiagnoseResponse(
            status="success",
            total_time_ms=total_time * 1000,
            detections_found=pipeline_result.detections_count,
            analyzed=pipeline_result.analyzed_count,
            leaves=leaves_response,
            primary_disease=primary_disease,
            primary_confidence=primary_confidence,
            errors=pipeline_result.errors if pipeline_result.errors else None
        )
        
        print(f"[COMPLETE] Diagnosis done in {total_time:.2f}s")
        print(f"           Detections: {pipeline_result.detections_count}, Analyzed: {pipeline_result.analyzed_count}")
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        error_logger.log_error('routes', e, {'endpoint': 'diagnose', 'farmer_id': farmer_id})
        total_time = time.time() - start_time
        
        raise HTTPException(
            status_code=500,
            detail=f"Diagnosis failed: {str(e)}"
        )


@router.post("/diagnose/quick")
async def diagnose_quick(
    file: UploadFile = File(...),
    farmer_id: str = Query("TN-CBE-9021"),
) -> dict:
    """
    Quick diagnosis - return only primary disease without individual leaf analysis.
    Faster for real-time scenarios.
    """
    
    response = await diagnose_crop_leaf(
        file=file,
        farmer_id=farmer_id,
        analyze_all=True,
        max_leaves=1,  # Only analyze strongest detection
        confidence_threshold=0.5
    )
    
    return {
        "status": "success",
        "primary_disease": response.primary_disease,
        "confidence": response.primary_confidence,
        "detections": response.detections_found,
        "total_time_ms": response.total_time_ms
    }


@router.get("/pipeline/status")
async def pipeline_status() -> dict:
    """Get pipeline status and model information."""
    
    if not _pipeline:
        return {"status": "not_initialized"}
    
    return {
        "status": "initialized" if _pipeline.is_initialized else "failed",
        "yolo_loaded": _pipeline.yolo_detector.is_loaded,
        "classifier_loaded": _pipeline.disease_classifier.is_loaded,
        "yolo_model": _pipeline.yolo_detector.model_name,
        "yolo_conf_threshold": _pipeline.yolo_conf,
        "disease_conf_threshold": _pipeline.disease_conf,
    }


# Export setup functions for main.py
__all__ = [
    'router',
    'initialize_pipeline',
    'shutdown_pipeline',
    'DiagnoseResponse',
    'LeafDetection',
    'DiseaseInfo',
]
