"""
validators.py — Input Validation & Preprocessing
=================================================
Validates image inputs, preprocesses images, and handles data sanitization.
"""

import io
from pathlib import Path
from typing import Optional, Tuple, Any

try:
    import numpy as np
    _np_ok = True
except ImportError:
    _np_ok = False
    np: Any = None

try:
    from PIL import Image
    _pil_ok = True
except ImportError:
    _pil_ok = False
    Image: Any = None


class ImageValidator:
    """Validates and preprocesses images for detection models."""
    
    # Supported formats
    SUPPORTED_FORMATS = {'jpg', 'jpeg', 'png', 'bmp', 'tiff'}
    
    # Size constraints (in bytes)
    MIN_SIZE = 1024  # 1 KB minimum
    MAX_SIZE = 50 * 1024 * 1024  # 50 MB maximum
    
    # Dimension constraints
    MIN_DIMENSION = 64
    MAX_DIMENSION = 4096
    
    @staticmethod
    def validate_image_bytes(image_data: bytes) -> Tuple[bool, Optional[str]]:
        """Validate raw image bytes.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Tuple (is_valid, error_message)
        """
        if not _pil_ok:
            return False, "PIL not available for validation"
        
        # Check size
        if len(image_data) < ImageValidator.MIN_SIZE:
            return False, f"Image too small: {len(image_data)} bytes (min: {ImageValidator.MIN_SIZE})"
        
        if len(image_data) > ImageValidator.MAX_SIZE:
            return False, f"Image too large: {len(image_data)} bytes (max: {ImageValidator.MAX_SIZE})"
        
        # Check format
        try:
            img = Image.open(io.BytesIO(image_data))
            img.load()  # Force load to validate
            fmt = img.format.lower() if img.format else None
            
            if fmt not in ImageValidator.SUPPORTED_FORMATS:
                return False, f"Unsupported format: {fmt}. Supported: {ImageValidator.SUPPORTED_FORMATS}"
            
            # Check dimensions
            width, height = img.size
            if width < ImageValidator.MIN_DIMENSION or height < ImageValidator.MIN_DIMENSION:
                return False, f"Image too small: {width}x{height} (min: {ImageValidator.MIN_DIMENSION})"
            
            if width > ImageValidator.MAX_DIMENSION or height > ImageValidator.MAX_DIMENSION:
                return False, f"Image too large: {width}x{height} (max: {ImageValidator.MAX_DIMENSION})"
            
            return True, None
        except Exception as e:
            return False, f"Invalid image data: {str(e)}"
    
    @staticmethod
    def load_and_validate(image_path: str) -> Tuple[Optional[Any], Optional[str]]:
        """Load and validate image from file path.
        
        Args:
            image_path: Path to image file
            
        Returns:
            Tuple (PIL_Image_object, error_message)
        """
        if not _pil_ok:
            return None, "PIL not available"
        
        try:
            path = Path(image_path)
            
            # Check file exists
            if not path.exists():
                return None, f"File not found: {image_path}"
            
            # Check format
            suffix = path.suffix.lower().lstrip('.')
            if suffix not in ImageValidator.SUPPORTED_FORMATS:
                return None, f"Unsupported format: {suffix}"
            
            # Load image
            img = Image.open(path)
            img.load()  # Force load
            
            # Validate with byte check
            with open(path, 'rb') as f:
                is_valid, error = ImageValidator.validate_image_bytes(f.read())
                if not is_valid:
                    return None, error
            
            return img, None
        except Exception as e:
            return None, f"Failed to load image: {str(e)}"


class ImagePreprocessor:
    """Preprocesses images for detection models."""
    
    @staticmethod
    def resize_image(
        image: Any,
        target_size: Tuple[int, int],
        maintain_aspect: bool = True
    ) -> Optional[Any]:
        """Resize image with optional aspect ratio maintenance.
        
        Args:
            image: PIL Image object
            target_size: Target (width, height)
            maintain_aspect: If True, pad with background; if False, stretch
            
        Returns:
            Resized PIL Image or None on error
        """
        if not _pil_ok:
            return None
        
        try:
            if maintain_aspect:
                # Maintain aspect ratio with padding
                image.thumbnail(target_size, Image.Resampling.LANCZOS)
                # Create new image with padding
                new_image = Image.new('RGB', target_size, color=(128, 128, 128))
                offset = ((target_size[0] - image.width) // 2,
                         (target_size[1] - image.height) // 2)
                new_image.paste(image, offset)
                return new_image
            else:
                # Stretch to target size
                return image.resize(target_size, Image.Resampling.LANCZOS)
        except Exception:
            return None
    
    @staticmethod
    def to_numpy_array(image: Any) -> Optional[Any]:
        """Convert PIL Image to numpy array (normalized 0-1).
        
        Args:
            image: PIL Image object
            
        Returns:
            Normalized numpy array or None on error
        """
        if not _np_ok:
            return None
        
        try:
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy and normalize
            array = np.array(image, dtype=np.float32) / 255.0
            return array
        except Exception:
            return None
    
    @staticmethod
    def preprocess_for_yolo(
        image: Any,
        target_size: Tuple[int, int] = (640, 640)
    ) -> Optional[Tuple[Any, Tuple[int, int]]]:
        """Preprocess image specifically for YOLOv8.
        
        Args:
            image: PIL Image object
            target_size: YOLO model input size
            
        Returns:
            Tuple (numpy_array, original_size) or None on error
        """
        if not _pil_ok or not _np_ok:
            return None
        
        try:
            original_size = image.size
            
            # Resize
            resized = ImagePreprocessor.resize_image(image, target_size, maintain_aspect=True)
            if resized is None:
                return None
            
            # Convert to numpy
            array = ImagePreprocessor.to_numpy_array(resized)
            if array is None:
                return None
            
            return array, original_size
        except Exception:
            return None


class InputSanitizer:
    """Sanitizes and validates user inputs."""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 255) -> str:
        """Sanitize string input.
        
        Args:
            value: Input string
            max_length: Maximum allowed length
            
        Returns:
            Sanitized string
        """
        if not isinstance(value, str):
            return ""
        
        # Remove potentially harmful characters
        sanitized = value.strip()[:max_length]
        return sanitized
    
    @staticmethod
    def validate_confidence_threshold(value: float) -> Tuple[bool, float]:
        """Validate and normalize confidence threshold.
        
        Args:
            value: Confidence threshold value
            
        Returns:
            Tuple (is_valid, normalized_value)
        """
        try:
            conf = float(value)
            if conf < 0.0 or conf > 1.0:
                return False, 0.5
            return True, conf
        except (ValueError, TypeError):
            return False, 0.5
