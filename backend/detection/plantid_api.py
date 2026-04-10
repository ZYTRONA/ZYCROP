"""
plantid_api.py — Plant.id API Integration for Disease Classification
=====================================================================
Fallback disease classifier using Plant.id API when local model confidence is low.
"""

import io
import requests
import asyncio
from typing import Optional, Dict, Any
from utils.logger import error_logger, detection_logger


class PlantIDResult:
    """Result from Plant.id API."""
    def __init__(self, class_id: int, class_name: str, confidence: float, 
                 disease_info: Dict[str, Any], inference_time: float = 0.0):
        self.class_id = class_id
        self.class_name = class_name
        self.confidence = confidence
        self.disease_info = disease_info
        self.inference_time = inference_time
        self.top_k_predictions = []


class PlantIDClient:
    """Plant.id API client for disease classification fallback."""
    
    def __init__(self, api_url: str = "http://127.0.0.1:8000/api/diagnose"):
        self.api_url = api_url
        self.timeout = 30  # seconds
        self.available = False
        self._check_availability()
    
    def _check_availability(self):
        """Check if Plant.id API is available."""
        try:
            response = requests.head(self.api_url, timeout=5)
            self.available = response.status_code < 500
            if self.available:
                print(f"[PLANTID] API available at {self.api_url}")
            else:
                print(f"[PLANTID] API returned status {response.status_code}")
        except Exception as e:
            print(f"[PLANTID] API unavailable: {str(e)}")
            self.available = False
    
    def classify_image(self, image_array: Any) -> Optional[PlantIDResult]:
        """
        Classify disease using Plant.id API.
        
        Args:
            image_array: numpy array or image data
            
        Returns:
            PlantIDResult if successful, None otherwise
        """
        if not self.available:
            print("[PLANTID] API is not available, skipping Plant.id call")
            return None
        
        try:
            from PIL import Image
            import numpy as np
            
            # Convert numpy array to image if needed
            if isinstance(image_array, np.ndarray):
                image_pil = Image.fromarray(image_array.astype('uint8'), 'RGB')
            else:
                image_pil = image_array
            
            # Convert to bytes
            img_bytes = io.BytesIO()
            image_pil.save(img_bytes, format='JPEG', quality=85)
            img_bytes.seek(0)
            
            # Prepare multipart form data
            files = {'file': ('image.jpg', img_bytes, 'image/jpeg')}
            data = {
                'farmer_id': 'PLANTID_API',
                'analyze_all': 'true'
            }
            
            # Call Plant.id API
            print(f"[PLANTID] Calling Plant.id API at {self.api_url}")
            response = requests.post(
                self.api_url,
                files=files,
                data=data,
                timeout=self.timeout
            )
            
            if not response.ok:
                print(f"[PLANTID] API returned status {response.status_code}")
                error_logger.log_error('plantid', 
                    Exception(f"Plant.id API status {response.status_code}"),
                    {'api_url': self.api_url})
                return None
            
            result_data = response.json()
            
            # Extract disease from API response
            if not result_data.get('primary_disease'):
                print("[PLANTID] No disease detected in API response")
                return None
            
            disease_name = result_data['primary_disease']
            confidence = result_data.get('primary_confidence', 0.5)
            
            # Extract disease info from response
            disease_info = result_data.get('disease_info', {})
            if not disease_info:
                # If no disease_info in primary, try from leaves
                if result_data.get('leaves') and result_data['leaves'][0].get('disease'):
                    disease_info = result_data['leaves'][0]['disease'].get('disease_info', {})
            
            print(f"[PLANTID] Successfully classified: {disease_name} (confidence: {confidence:.2%})")
            
            # Log this successful Plant.id call
            detection_logger.log_detection(
                model_name='PlantID_API',
                image_path='plantid_api_call',
                inference_time=0.0,
                detections_count=1,
                confidence_scores=[confidence],
                status='success'
            )
            
            return PlantIDResult(
                class_id=0,
                class_name=disease_name,
                confidence=confidence,
                disease_info=disease_info or {
                    'cause': 'Detected via Plant.id API',
                    'symptoms': 'See disease details above',
                    'prevention': [],
                    'treatment': [],
                    'severity': 'Unknown',
                    'affected_plant_part': 'Leaf',
                    'scientific_name': disease_name,
                }
            )
        
        except Exception as e:
            print(f"[PLANTID] Error calling API: {str(e)}")
            error_logger.log_error('plantid', e, {'api_url': self.api_url})
            return None
    
    def is_available(self) -> bool:
        """Check if API is available."""
        return self.available


# Global client instance
_plantid_client: Optional[PlantIDClient] = None


def get_plantid_client() -> PlantIDClient:
    """Get or create Plant.id API client."""
    global _plantid_client
    if _plantid_client is None:
        _plantid_client = PlantIDClient()
    return _plantid_client
