"""
config.py — Centralized Configuration for ZYCROP AI
===================================================
Single source of truth for all environment variables and model configurations.
"""

import os
from pathlib import Path
from typing import Optional

# ─── Environment Detection ────────────────────────────────────────────────────
DEBUG_MODE = os.getenv('DEBUG', 'false').lower() == 'true'
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')  # development, staging, production

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
MODEL_DIR = BASE_DIR / 'models'
DATA_DIR = BASE_DIR / 'data'
LOG_DIR = BASE_DIR / 'logs'

# Create directories
MODEL_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

# ─── Detection Model Paths ────────────────────────────────────────────────────
MODELS = {
    'disease_classifier': {
        'path': MODEL_DIR / 'plant_disease.tflite',
        'type': 'tflite',
        'input_size': 224,
        'description': 'MobileNetV2 for disease classification'
    },
    'yolo_detector': {
        'model_name': 'yolov8m',  # nano, small, medium, large, xlarge
        'description': 'YOLOv8 Medium for leaf detection',
        'input_size': 640,
        'framework': 'torch',  # Will be exported to ONNX/TFLite
    }
}

# ─── Detection Configuration ──────────────────────────────────────────────────
DETECTION_CONFIG = {
    'yolo': {
        'confidence_threshold': float(os.getenv('YOLO_CONF', 0.45)),
        'iou_threshold': float(os.getenv('YOLO_IOU', 0.45)),
        'max_detections': int(os.getenv('YOLO_MAX_DETECTIONS', 100)),
        'classes': ['leaf', 'fruit', 'flower', 'stem'],  # Classes to detect
    },
    'disease_classifier': {
        'confidence_threshold': float(os.getenv('DISEASE_CONF', 0.60)),
        'top_k': 5,  # Return top 5 predictions
    },
    'pipeline': {
        'max_inference_time': float(os.getenv('MAX_INFERENCE_TIME', 5.0)),  # seconds
        'batch_size': int(os.getenv('BATCH_SIZE', 1)),
        'skip_no_detections': True,  # Skip disease classification if no leaves detected
    }
}

# ─── Performance & Resource Configuration ─────────────────────────────────────
PERFORMANCE = {
    'num_workers': int(os.getenv('NUM_WORKERS', 4)),
    'device': os.getenv('DEVICE', 'cpu'),  # cpu, cuda, mps
    'use_tensorrt': os.getenv('USE_TENSORRT', 'false').lower() == 'true',
    'use_onnx': os.getenv('USE_ONNX', 'false').lower() == 'true',
    'cache_predictions': True,
    'cache_ttl_seconds': int(os.getenv('CACHE_TTL', 3600)),  # 1 hour
}

# ─── API Configuration ────────────────────────────────────────────────────────
API = {
    'base_url': os.getenv('API_BASE_URL', 'http://localhost:8000'),
    'api_prefix': '/api',
    'request_timeout': int(os.getenv('REQUEST_TIMEOUT', 30)),
    'max_upload_size': int(os.getenv('MAX_UPLOAD_SIZE', 50 * 1024 * 1024)),  # 50 MB
}

# ─── Database Configuration ──────────────────────────────────────────────────
DATABASE = {
    'mongodb_url': os.getenv('MONGODB_URL', 'mongodb://localhost:27017'),
    'db_name': os.getenv('DB_NAME', 'zycrop_ai'),
}

# ─── Image Processing ────────────────────────────────────────────────────────
IMAGE_PROCESSING = {
    'max_dimension': 4096,
    'min_dimension': 64,
    'supported_formats': {'jpg', 'jpeg', 'png', 'bmp', 'tiff'},
}

# ─── Logging Configuration ──────────────────────────────────────────────────
LOGGING = {
    'level': 'DEBUG' if DEBUG_MODE else 'INFO',
    'format': 'json' if ENVIRONMENT == 'production' else 'text',
    'log_dir': LOG_DIR,
}

# ─── RAG & Knowledge Base ────────────────────────────────────────────────────
RAG_CONFIG = {
    'use_sentence_transformers': True,
    'model_name': 'all-MiniLM-L6-v2',  # Small, fast embeddings
    'embedding_dim': 384,
}

# ─── Disease Knowledge Base ──────────────────────────────────────────────────
DISEASE_KNOWLEDGE = {
    'knowledge_file': DATA_DIR / 'disease_knowledge.json',
    'minimum_similarity': 0.7,
}


def get_model_path(model_name: str) -> Optional[Path]:
    """Get full path for a model.
    
    Args:
        model_name: Model key from MODELS dict
        
    Returns:
        Full path or None if not found
    """
    if model_name not in MODELS:
        return None
    
    model_config = MODELS[model_name]
    return model_config.get('path')


def get_detection_threshold(model_type: str) -> float:
    """Get confidence threshold for a model type.
    
    Args:
        model_type: 'yolo' or 'disease_classifier'
        
    Returns:
        Confidence threshold value
    """
    return DETECTION_CONFIG.get(model_type, {}).get('confidence_threshold', 0.5)


def print_config() -> None:
    """Print current configuration (for debugging)."""
    print("\n" + "="*60)
    print("ZYCROP AI Configuration")
    print("="*60)
    print(f"Environment: {ENVIRONMENT}")
    print(f"Debug Mode: {DEBUG_MODE}")
    print(f"Device: {PERFORMANCE['device']}")
    print(f"Model Dir: {MODEL_DIR}")
    print(f"YOLO Conf Threshold: {DETECTION_CONFIG['yolo']['confidence_threshold']}")
    print(f"Disease Conf Threshold: {DETECTION_CONFIG['disease_classifier']['confidence_threshold']}")
    print("="*60 + "\n")
