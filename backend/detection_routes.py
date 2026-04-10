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

class DiseaseInfoData(BaseModel):
    """UPDATED: Detailed disease information."""
    cause: Optional[str] = None
    symptoms: Optional[str] = None
    spread: Optional[str] = None
    prevention: Optional[List[str]] = None
    treatment: Optional[List[str]] = None
    severity: Optional[str] = None
    affected_plant_part: Optional[str] = None
    scientific_name: Optional[str] = None


class DiseaseInfo(BaseModel):
    """Disease classification result."""
    disease: str
    confidence: float
    top_predictions: Optional[List[dict]] = None
    disease_info: Optional[DiseaseInfoData] = None  # UPDATED: Detailed disease info


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
    disease_info: Optional[DiseaseInfoData] = None
    source: Optional[str] = "local"  # NEW: Track source - "local", "plantid", or "offline"
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
            use_tensorflow=False,  # UPDATED: Use YOLOv8 instead of TensorFlow
            tf_leaf_conf=0.85,
            disease_conf=0.30
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
        
        # ─ Auto-adjust image size for optimal processing ─────────────────────
        original_size = image_pil.size
        adjusted_image, adjustment_info = ImagePreprocessor.auto_adjust_image_size(
            image_pil,
            max_dimension=1536,  # Resize if larger (optimal for YOLO + memory)
            min_dimension=480    # Don't resize below 480px
        )
        
        if adjusted_image is None:
            raise HTTPException(status_code=400, detail="Failed to process image size")
        
        # Convert to numpy array (keep as uint8 for YOLO - it handles both)
        image_array = np.array(adjusted_image, dtype=np.uint8)
        
        print(f"\n[DIAGNOSE] Processing image from farmer {farmer_id}")
        print(f"           Original size: {original_size}")
        if adjustment_info['was_resized']:
            print(f"           Adjusted to: {adjustment_info['new_size']} (scale: {adjustment_info['scale_factor']:.2f}x)")
        print(f"           Array shape: {image_array.shape}, dtype: {image_array.dtype}")
        print(f"           Value range: [{image_array.min()}-{image_array.max()}]")
        detector_name = 'TensorFlow' if _pipeline.use_tensorflow else 'YOLO'
        print(f"           {detector_name} confidence threshold: {_pipeline.leaf_detector.confidence_threshold}")
        print(f"           Disease confidence threshold: {_pipeline.disease_classifier.confidence_threshold}")
        
        # ─ Run pipeline ────────────────────────────────────────────────────────
        pipeline_result = _pipeline.process_image(
            image_array,
            analyze_all_detections=analyze_all,
            max_leaves=max_leaves
        )
        
        # ─ Build response ──────────────────────────────────────────────────────
        leaves_response = []
        for leaf in pipeline_result.leaves:
            # UPDATED: Build disease info with detailed information
            disease_info_data = None
            if leaf.disease_prediction and 'disease_info' in leaf.disease_prediction:
                disease_info_data = DiseaseInfoData(**leaf.disease_prediction['disease_info'])
            
            disease_info_obj = DiseaseInfo(
                disease=leaf.disease_prediction['disease'],
                confidence=leaf.disease_prediction['confidence'],
                top_predictions=leaf.disease_prediction.get('top_predictions'),
                disease_info=disease_info_data  # UPDATED: Include detailed info
            ) if leaf.disease_prediction else None
            
            # Convert bbox list to dict for location field
            bbox_list = leaf.detection.to_dict()['bbox']
            bbox_data = {
                'x1': bbox_list[0],
                'y1': bbox_list[1],
                'x2': bbox_list[2],
                'y2': bbox_list[3]
            }
            
            leaf_data = LeafDetection(
                leaf_id=leaf.leaf_index,
                location=bbox_data,
                disease=disease_info_obj,
                composite_confidence=leaf.confidence_composite,
                analysis_time_ms=leaf.analysis_time * 1000
            )
            leaves_response.append(leaf_data)
        
        # Get primary disease (highest confidence)
        primary_disease = None
        primary_confidence = None
        primary_disease_info = None
        primary_source = "local"  # NEW: Track source from primary disease
        
        if leaves_response:
            strongest = max([l for l in leaves_response if l.disease], 
                          key=lambda x: x.disease.confidence, 
                          default=None)
            if strongest:
                primary_disease = strongest.disease.disease
                primary_confidence = strongest.disease.confidence
                primary_disease_info = strongest.disease.disease_info
                # NEW: Extract source from backend data if available
                if strongest.disease.disease_info and isinstance(strongest.disease.disease_info, dict):
                    primary_source = strongest.disease.disease_info.get('source', 'local')
        
        total_time = time.time() - start_time
        
        # Handle no-detection case with helpful guidance
        response_status = "no_leaf_detected" if pipeline_result.detections_count == 0 else "success"
        
        # If no leaves detected, add helpful error message
        help_errors = []
        if pipeline_result.detections_count == 0:
            help_errors.append("No leaf detected. Please try:")
            help_errors.append("• Ensure the leaf is clearly visible and centered")
            help_errors.append("• Improve lighting (avoid shadows)")
            help_errors.append("• Capture a close-up of a single leaf")
            help_errors.append("• Keep the leaf within the camera frame")
        
        response = DiagnoseResponse(
            status=response_status,
            total_time_ms=total_time * 1000,
            detections_found=pipeline_result.detections_count,
            analyzed=pipeline_result.analyzed_count,
            leaves=leaves_response,
            primary_disease=primary_disease,
            primary_confidence=primary_confidence,
            disease_info=primary_disease_info,
            source=primary_source,  # NEW: Include source
            errors=help_errors if help_errors else (pipeline_result.errors if pipeline_result.errors else None)
        )
        
        print(f"[COMPLETE] Diagnosis done in {total_time:.2f}s")
        print(f"           Status: {response_status}")
        print(f"           Detections: {pipeline_result.detections_count}, Analyzed: {pipeline_result.analyzed_count}")
        print(f"           Source: {primary_source}")  # NEW: Log source
        if pipeline_result.errors:
            print(f"           Errors: {pipeline_result.errors}")
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        error_logger.log_error('routes', e, {'endpoint': 'diagnose', 'farmer_id': farmer_id})
        total_time = time.time() - start_time
        
        # Better error messaging for debugging
        error_detail = str(e)
        print(f"[ERROR] Diagnosis failed: {error_detail}")
        print(f"[ERROR] Error type: {type(e).__name__}")
        import traceback
        print("[TRACEBACK]")
        traceback.print_exc()
        
        raise HTTPException(
            status_code=500,
            detail=f"Diagnosis failed: {error_detail}"
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
    
    detector_name = 'TensorFlow' if _pipeline.use_tensorflow else 'YOLO'
    return {
        "status": "initialized" if _pipeline.is_initialized else "failed",
        "leaf_detector_loaded": _pipeline.leaf_detector.is_loaded,
        "classifier_loaded": _pipeline.disease_classifier.is_loaded,
        "leaf_detector_model": _pipeline.leaf_detector.model_name,
        "leaf_detector_type": detector_name,
        "leaf_detector_conf_threshold": (_pipeline.tf_leaf_conf if _pipeline.use_tensorflow else _pipeline.yolo_conf),
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
