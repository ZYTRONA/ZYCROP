"""
API_EXAMPLES.py — Usage Examples for ZYCROP AI Detection Endpoints
==================================================================

Examples showing how to use the new structured detection API.

## NEW ENDPOINTS:

POST /api/diagnose        - Full analysis with all detections
POST /api/diagnose/quick  - Fast analysis returning only primary disease
GET  /api/pipeline/status - Check pipeline readiness

═══════════════════════════════════════════════════════════════════════════════
"""

import requests  # type: ignore
import json
from pathlib import Path

# API Configuration
BASE_URL = "http://localhost:8000"
FARMER_ID = "TN-CBE-9021"

# ─── EXAMPLE 1: Full Diagnosis with All Detections ───────────────────────────

def example_full_diagnosis(image_path: str) -> dict:
    """
    Run complete diagnosis on an image.
    
    Returns all detected leaves with disease predictions and bounding boxes.
    
    Args:
        image_path: Path to image file (jpg, png)
        
    Returns:
        API response with full analysis
    """
    
    print("\n" + "="*70)
    print("EXAMPLE 1: Full Diagnosis")
    print("="*70)
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        params = {
            'farmer_id': FARMER_ID,
            'analyze_all': True,  # Analyze all detected leaves
            'max_leaves': None,   # No limit
        }
        
        response = requests.post(
            f"{BASE_URL}/api/diagnose",
            files=files,
            params=params,
            timeout=30
        )
    
    result = response.json()
    
    print(f"\nStatus: {result['status']}")
    print(f"Total Time: {result['total_time_ms']:.2f}ms")
    print(f"Detections Found: {result['detections_found']}")
    print(f"Analyzed: {result['analyzed']}")
    print(f"Primary Disease: {result.get('primary_disease', 'N/A')}")
    print(f"Confidence: {result.get('primary_confidence', 0):.3f}")
    
    if result['leaves']:
        print(f"\nLeaf Analysis:")
        for leaf in result['leaves']:
            print(f"\n  Leaf #{leaf['leaf_id']}:")
            print(f"    Location: bbox {leaf['location']}")
            if leaf['disease']:
                print(f"    Disease: {leaf['disease']['disease']}")
                print(f"    Confidence: {leaf['disease']['confidence']:.3f}")
            print(f"    Composite Confidence: {leaf['composite_confidence']:.3f}")
            print(f"    Analysis Time: {leaf['analysis_time_ms']:.2f}ms")
    
    if result.get('errors'):
        print(f"\nErrors: {result['errors']}")
    
    return result


# ─── EXAMPLE 2: Quick Diagnosis (Fast Mode) ──────────────────────────────────

def example_quick_diagnosis(image_path: str) -> dict:
    """
    Run quick diagnosis for real-time scenarios.
    
    Returns only the primary disease without individual leaf analysis.
    Much faster for mobile/real-time use cases.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Quick API response with primary disease only
    """
    
    print("\n" + "="*70)
    print("EXAMPLE 2: Quick Diagnosis (Fast Mode)")
    print("="*70)
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        params = {'farmer_id': FARMER_ID}
        
        response = requests.post(
            f"{BASE_URL}/api/diagnose/quick",
            files=files,
            params=params,
            timeout=30
        )
    
    result = response.json()
    
    print(f"\nStatus: {result['status']}")
    print(f"Primary Disease: {result['primary_disease']}")
    print(f"Confidence: {result['confidence']:.3f}")
    print(f"Detections Found: {result['detections']}")
    print(f"Total Time: {result['total_time_ms']:.2f}ms")
    
    return result


# ─── EXAMPLE 3: Custom Confidence Thresholds ──────────────────────────────────

def example_custom_thresholds(image_path: str) -> dict:
    """
    Run diagnosis with custom confidence thresholds.
    
    Lower thresholds = more detections but possibly with false positives.
    Higher thresholds = fewer detections but more reliable.
    
    Args:
        image_path: Path to image file
        
    Returns:
        API response with custom thresholds applied
    """
    
    print("\n" + "="*70)
    print("EXAMPLE 3: Custom Confidence Thresholds")
    print("="*70)
    print("Using lower threshold = more detections (confidence >= 0.3)")
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        params = {
            'farmer_id': FARMER_ID,
            'analyze_all': True,
            'confidence_threshold': 0.3,  # Lower threshold for more detections
            'max_leaves': 10,             # Limit to 10 most confident
        }
        
        response = requests.post(
            f"{BASE_URL}/api/diagnose",
            files=files,
            params=params,
            timeout=30
        )
    
    result = response.json()
    
    print(f"\nDetections with lower threshold: {result['detections_found']}")
    print(f"Successfully analyzed: {result['analyzed']}")
    
    return result


# ─── EXAMPLE 4: Pipeline Status Check ─────────────────────────────────────────

def example_check_pipeline_status() -> dict:
    """
    Check if the detection pipeline is ready.
    
    Useful before sending requests to verify system health.
    
    Returns:
        Pipeline status information
    """
    
    print("\n" + "="*70)
    print("EXAMPLE 4: Pipeline Status Check")
    print("="*70)
    
    response = requests.get(
        f"{BASE_URL}/api/pipeline/status",
        timeout=10
    )
    
    result = response.json()
    
    print(f"\nPipeline Status: {result['status']}")
    print(f"YOLO Loaded: {result.get('yolo_loaded', False)}")
    print(f"Classifier Loaded: {result.get('classifier_loaded', False)}")
    print(f"YOLO Model: {result.get('yolo_model', 'N/A')}")
    print(f"YOLO Confidence Threshold: {result.get('yolo_conf_threshold', 'N/A')}")
    print(f"Disease Confidence Threshold: {result.get('disease_conf_threshold', 'N/A')}")
    
    return result


# ─── EXAMPLE 5: Batch Processing ──────────────────────────────────────────────

def example_batch_processing(image_dir: str) -> list:
    """
    Process multiple images efficiently.
    
    Demonstrates best practices for batch image processing.
    
    Args:
        image_dir: Directory containing image files
        
    Returns:
        List of results for all images
    """
    
    print("\n" + "="*70)
    print("EXAMPLE 5: Batch Processing")
    print("="*70)
    
    image_files = list(Path(image_dir).glob('*.jpg')) + list(Path(image_dir).glob('*.png'))
    print(f"Found {len(image_files)} images to process")
    
    results = []
    for image_path in image_files:
        print(f"\nProcessing: {image_path.name}")
        try:
            result = example_quick_diagnosis(str(image_path))  # Use quick mode for batch
            results.append({
                'image': image_path.name,
                'disease': result.get('primary_disease'),
                'confidence': result.get('confidence'),
                'time_ms': result.get('total_time_ms')
            })
        except Exception as e:
            print(f"  Error: {e}")
    
    # Print summary
    print("\n" + "="*70)
    print("Batch Processing Summary")
    print("="*70)
    for r in results:
        print(f"{r['image']:40} → {r['disease']:30} ({r['confidence']:.3f}) {r['time_ms']:.0f}ms")
    
    return results


# ─── EXAMPLE 6: Frontend Integration (React Native) ─────────────────────────────

def example_frontend_integration() -> str:
    """
    Example code for integrating with React Native frontend.
    
    Returns:
        JavaScript code snippet
    """
    
    js_code = """
// React Native / JavaScript Integration Example
// File: zycrop/src/services/api.js

import axios from 'axios'

const BASE_URL = 'http://10.0.2.2:8000/api'  // Android emulator

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// New improved endpoint
export const diagnoseCropLeaf = async (imageUri, farmerId = 'TN-CBE-9021') => {
  const formData = new FormData()
  formData.append('file', {
    uri: imageUri,
    name: 'leaf.jpg',
    type: 'image/jpeg',
  })
  formData.append('farmer_id', farmerId)
  
  return apiClient.post('/diagnose', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
}

// Quick diagnosis for real-time scenarios
export const diagnoseCropLeafQuick = async (imageUri, farmerId = 'TN-CBE-9021') => {
  const formData = new FormData()
  formData.append('file', {
    uri: imageUri,
    name: 'leaf.jpg',
    type: 'image/jpeg',
  })
  formData.append('farmer_id', farmerId)
  
  return apiClient.post('/diagnose/quick', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 10000,
  })
}

// Check pipeline status before processing
export const checkPipelineStatus = () => {
  return apiClient.get('/pipeline/status')
}

// Usage in component:
// const response = await diagnoseCropLeaf(imageUri)
// response.data.leaves.forEach(leaf => {
//   console.log(`Leaf ${leaf.leaf_id}: ${leaf.disease.disease} (${leaf.disease.confidence})`)
// })
"""
    
    print("\n" + "="*70)
    print("EXAMPLE 6: Frontend Integration (React Native)")
    print("="*70)
    print(js_code)
    
    return js_code


# ─── EXAMPLE 7: Error Handling ────────────────────────────────────────────────

def example_error_handling(image_path: str) -> None:
    """
    Demonstrate proper error handling for API calls.
    
    Args:
        image_path: Path to image file
    """
    
    print("\n" + "="*70)
    print("EXAMPLE 7: Error Handling")
    print("="*70)
    
    try:
        # Check pipeline first
        response = requests.get(f"{BASE_URL}/api/pipeline/status", timeout=5)
        status = response.json()
        
        if status['status'] != 'initialized':
            print(f"Error: Pipeline not ready. Status: {status['status']}")
            return
        
        print("✓ Pipeline ready. Processing image...")
        
        # Process image
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(
                f"{BASE_URL}/api/diagnose/quick",
                files=files,
                params={'farmer_id': FARMER_ID},
                timeout=30
            )
        
        # Check HTTP status
        response.raise_for_status()
        
        result = response.json()
        
        # Check for API-level errors
        if result.get('status') != 'success':
            print(f"Error: {result.get('detail', 'Unknown error')}")
            return
        
        print(f"✓ Success: {result['primary_disease']}")
        
    except requests.exceptions.Timeout:
        print("Error: Request timeout. Pipeline might be stuck.")
    except requests.exceptions.ConnectionError:
        print("Error: Cannot connect to backend. Is it running on http://localhost:8000?")
    except requests.exceptions.HTTPError as e:
        print(f"Error: HTTP {e.response.status_code} - {e.response.text}")
    except json.JSONDecodeError:
        print("Error: Invalid JSON response from server")
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}")


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    """Run all examples."""
    
    print("\n" + "="*70)
    print("  ZYCROP AI Detection API - Usage Examples")
    print("="*70)
    
    # Check if backend is running
    try:
        r = requests.get(f"{BASE_URL}/api/pipeline/status", timeout=2)
        print("✓ Backend is running")
    except:
        print("✗ Backend is not running!")
        print("  Start it with: python main.py")
        return
    
    # Sample image (use your own)
    sample_image = "test_leaf.jpg"
    
    if not Path(sample_image).exists():
        print(f"\n✗ Sample image not found: {sample_image}")
        print("  Please provide a test image to run examples.")
        return
    
    # Run examples
    print("\nRunning examples...\n")
    
    try:
        example_check_pipeline_status()
        example_full_diagnosis(sample_image)
        example_quick_diagnosis(sample_image)
        example_custom_thresholds(sample_image)
        example_error_handling(sample_image)
        example_frontend_integration()
    except Exception as e:
        print(f"\nError during examples: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
