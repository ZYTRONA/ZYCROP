#!/usr/bin/env python3
"""
Minimal ZYCROP Market API Backend
For testing Phase 1 + Phase 2 without full ML dependencies
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any, Dict, Tuple, AsyncGenerator
from datetime import datetime, timedelta
import httpx
import json
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from pymongo.collection import Collection
from contextlib import asynccontextmanager

# Type definitions
MongoDBCollection = Collection[Dict[str, Any]]
MarketCacheDict = Dict[str, Dict[str, Any]]

# ─── MongoDB Setup ───────────────────────────────────────────
client: Optional[MongoClient[Dict[str, Any]]] = None  # type: ignore
db: Optional[Any] = None
market_cache: Optional[MongoDBCollection] = None
price_alerts_col: Optional[MongoDBCollection] = None
price_history_col: Optional[MongoDBCollection] = None

try:
    client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=3000)  # type: ignore
    client.admin.command('ping')  # type: ignore
    db = client.agritech_db  # type: ignore
    market_cache = db["market_cache"]  # type: ignore
    price_alerts_col = db["price_alerts"]  # type: ignore
    price_history_col = db["price_history"]  # type: ignore
    print("✅ MongoDB connected")
except Exception as e:
    print(f"⚠️  MongoDB not available: {e}")
    db = None

# ─── Pydantic Models ──────────────────────────────────────────
class PriceAlert(BaseModel):
    farmer_id: str
    crop: str
    location: str
    alert_type: str  # "above" or "below"
    price_threshold: float
    notification_methods: List[str] = ["app"]

# ─── FastAPI App ──────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager"""
    print("🚀 ZYCROP Market API started")
    yield
    print("🛑 ZYCROP Market API stopped")

app: FastAPI = FastAPI(title="ZYCROP Market API", lifespan=lifespan)

# ─── CORS Configuration ───────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── YOLOv8 + Disease Detection Routes ────────────────────────────────────────
try:
    from detection_routes import router as detection_router, initialize_pipeline, shutdown_pipeline
    app.include_router(detection_router)
    print("[OK] Detection routes integrated")
except ImportError as e:
    print(f"[WARN] Detection routes not available: {e}")
    initialize_pipeline = None
    shutdown_pipeline = None


# ─── Health Check Endpoint ────────────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    """Simple health check endpoint for debugging network issues."""
    return {
        "status": "ok",
        "message": "ZYCROP Backend is running",
        "version": "2.0.0",
    }


# ─── Startup & Shutdown Handlers ──────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """Initialize detection pipeline on app startup."""
    if initialize_pipeline:
        try:
            await initialize_pipeline()
        except Exception as e:
            print(f"[WARN] Detection pipeline startup failed: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown detection pipeline on app shutdown."""
    if shutdown_pipeline:
        try:
            await shutdown_pipeline()
        except Exception as e:
            print(f"[WARN] Detection pipeline shutdown failed: {e}")

# ─── MongoDB ──────────────────────────────────────────────────────────────────
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/ZYCROP")
mongo_client: Any = AsyncIOMotorClient(MONGO_URL)  # type: ignore[no-untyped-call]
db: Any = mongo_client["ZYCROP"]  # type: ignore[index]

logs_col: Any     = db["farm_logs"]  # type: ignore[index]
market_col: Any   = db["market_cache"]  # type: ignore[index]
diagnose_col: Any = db["diagnose_history"]  # type: ignore[index]

# ─── Pydantic Models ──────────────────────────────────────────────────────────
class SoilPayload(BaseModel):
    nitrogen:   Optional[float] = None
    phosphorus: Optional[float] = None
    potassium:  Optional[float] = None
    ph:         Optional[float] = None
    moisture:   Optional[float] = None
    crop:       Optional[str]   = None
    farmer_id:  Optional[str]   = "TN-CBE-9021"

class SchemeQuery(BaseModel):
    query: str

class LoanQuery(BaseModel):
    text: str
    language: str = "en"
    crop:     Optional[str] = None
    acres:    Optional[float] = None

class VoicePayload(BaseModel):
    audio_base64:    Optional[str] = None
    text:            Optional[str] = None
    source_language: str = "ta"
    target_language: str = "en"

class PassportLog(BaseModel):
    farmer_id:  str = "TN-CBE-9021"
    event_type: str
    date:       str = ""
    note:       str
    icon_color: Optional[str] = "#1b5e20"

class ChatPayload(BaseModel):
    """Ollama AI chat — powers Loan Advisor and Subsidy Finder."""
    message:  str
    language: str            = "en"   # BCP-47 code: en / ta / hi / te / ml
    context:  str            = "loan" # "loan" | "subsidy" | "general"
    crop:     Optional[str]  = None
    acres:    Optional[float]= None


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 1 — DISEASE DETECTION (EfficientNet-Lite1 / MobileViT-XS TFLite)
# ═══════════════════════════════════════════════════════════════════════════════

_MODEL_DIR    = os.path.join(os.path.dirname(__file__), "models")
_TFLITE_PATH  = os.path.join(_MODEL_DIR, "plant_disease.tflite")
_LABELS_PATH  = os.path.join(_MODEL_DIR, "labels.json")

_interpreter: Any = None
_input_details: Any = None
_output_details: Any = None
_class_labels: list[str] = []
_IMG_SIZE = 224   # EfficientNet-Lite1 / MobileNetV2 input

def _load_tflite_model() -> bool:
    global _interpreter, _input_details, _output_details, _class_labels
    if not _tflite_module:
        return False
    if not os.path.exists(_TFLITE_PATH):
        print(f"[WARN] TFLite model not found at {_TFLITE_PATH} — run train_plant_model.py first")
        return False
    try:
        _interpreter = _tflite_module.Interpreter(model_path=_TFLITE_PATH)
        _interpreter.allocate_tensors()
        _input_details  = _interpreter.get_input_details()
        _output_details = _interpreter.get_output_details()
        if os.path.exists(_LABELS_PATH):
            with open(_LABELS_PATH) as f:
                _class_labels = json.load(f)
        print(f"[OK] TFLite disease model loaded — {len(_class_labels)} classes")
        return True
    except Exception as exc:
        print(f"[WARN] TFLite model load failed: {exc}")
        return False

_TFLITE_LOADED = _load_tflite_model()

# Supplementary disease knowledge (treatment + fertilizer)
_DISEASE_INFO: dict[str, dict[str, str]] = {
    "tomato early blight":    {"severity": "Moderate", "color": "#e65100", "treatment": "Spray Copper Oxychloride 50WP (Blitox) 2.5g/L every 7 days for 3 weeks. Remove infected leaves.", "fertilizer": "Urea 20g/plant + MOP 15g/plant. Avoid overhead irrigation.", "organic_alt": "Neem oil 5ml/L weekly + Trichoderma viride 4g/L soil drench.", "timing": "Apply at 6 AM. Repeat every 30 DAS."},
    "tomato late blight":     {"severity": "High",     "color": "#b71c1c", "treatment": "Metalaxyl + Mancozeb (Ridomil Gold) 2.5g/L immediately. Repeat after 7 days.", "fertilizer": "Potassium Nitrate 2% foliar. Avoid high N in wet season.", "organic_alt": "Bordeaux mixture 1% every 5 days.", "timing": "Act within 24h of first symptoms."},
    "rice blast":             {"severity": "High",     "color": "#c62828", "treatment": "Tricyclazole 75WP (Beam) 0.6g/L. Drain field 3 days before spray.", "fertilizer": "Split N: 40kg/acre sowing + 20kg/acre tillering.", "organic_alt": "Potassium silicate 2% foliar weekly.", "timing": "Spray at panicle initiation stage."},
    "rice brown spot":        {"severity": "Moderate", "color": "#f57c00", "treatment": "Mancozeb 75WP 2.5g/L or Copper Oxychloride 3g/L. 2 sprays at 10-day intervals.", "fertilizer": "Balanced NPK. Zinc Sulphate 25kg/ha.", "organic_alt": "Pseudomonas fluorescens 10g/L spray.", "timing": "Spray at tillering and booting stages."},
    "potato late blight":     {"severity": "High",     "color": "#b71c1c", "treatment": "Cymoxanil + Mancozeb 2g/L immediately. Destroy severely infected haulms.", "fertilizer": "Potash 20kg/acre to improve resistance. Avoid excess N.", "organic_alt": "Copper hydroxide 2g/L spray weekly.", "timing": "Apply at first sign. Critical in cool/wet weather."},
    "corn common rust":       {"severity": "Moderate", "color": "#f57c00", "treatment": "Propiconazole 25EC 1ml/L or Mancozeb 2.5g/L. 2 sprays at 10-day intervals.", "fertilizer": "Balanced K — Potash 20kg/acre top dress.", "organic_alt": "Sulfur 80WP 3g/L in early stages.", "timing": "First spray at rust pustule appearance."},
    "cotton bollworm":        {"severity": "High",     "color": "#c62828", "treatment": "Emamectin Benzoate 5SG 0.4g/L. Install pheromone traps 5/acre.", "fertilizer": "NPK 19:19:19 foliar at 5g/L weekly during boll formation.", "organic_alt": "Bt kurstaki 2ml/L. NPV 250 LE/ha.", "timing": "Spray at boll formation, avoid flowering."},
    "apple scab":             {"severity": "Moderate", "color": "#f57c00", "treatment": "Captan 50WP 2.5g/L or Mancozeb 75WP 2g/L at green tip stage.", "fertilizer": "Balanced NPK. Calcium Nitrate 2g/L foliar post petal fall.", "organic_alt": "Lime sulfur 1% spray at pre-bloom.", "timing": "Spray at bud break; repeat every 7–10 days in wet weather."},
    "grape black rot":        {"severity": "High",     "color": "#c62828", "treatment": "Mancozeb 75WP 2g/L + Carbendazim 1g/L. Start at bud break, repeat every 10 days.", "fertilizer": "Potassium Sulphate 3g/L foliar spray monthly.", "organic_alt": "Copper Oxychloride 3g/L as protective spray.", "timing": "Critical period: bloom to 3 weeks after bloom."},
}

# ─── Test Data ───────────────────────────────────────────────────────────
MARKET_DATA_CACHE: MarketCacheDict = {
    "Rice": {
        "crop": "Rice",
        "price": 2100,
        "market": "Coimbatore",
        "data": [
            {"market": "Coimbatore", "price": 2100, "trend": "up"},
            {"market": "Chennai", "price": 2050, "trend": "up"},
            {"market": "Trichy", "price": 2150, "trend": "up"},
        ],
        "source": "agmarknet_api",
        "updated_at": datetime.now().isoformat()
    },
    "Wheat": {
        "crop": "Wheat",
        "price": 1950,
        "market": "Madhya Pradesh",
        "data": [
            {"market": "Madhya Pradesh", "price": 1950, "trend": "down"},
            {"market": "Punjab", "price": 1920, "trend": "down"},
        ],
        "source": "csv_fallback",
        "updated_at": datetime.now().isoformat()
    },
    "Tomato": {
        "crop": "Tomato",
        "price": 4200,
        "market": "Bengaluru",
        "data": [
            {"market": "Bengaluru", "price": 4200, "trend": "up"},
            {"market": "Pune", "price": 4100, "trend": "up"},
        ],
        "source": "agmarknet_api",
        "updated_at": datetime.now().isoformat()
    }
}

# ─── API Endpoints ───────────────────────────────────────────

@app.get("/api/market")
async def get_market(crop: str) -> Dict[str, Any]:
    """Get market price for a crop"""
    crop_data: Optional[Dict[str, Any]] = MARKET_DATA_CACHE.get(crop)
    if not crop_data:
        raise HTTPException(status_code=404, detail=f"Crop {crop} not found")
    return crop_data

@app.get("/api/market/compare")
async def market_compare(crop: str, location: str = "Tamil Nadu") -> Dict[str, Any]:
    """Get market comparison with cache"""
    crop_data: Optional[Dict[str, Any]] = MARKET_DATA_CACHE.get(crop)
    if not crop_data:
        raise HTTPException(status_code=404, detail=f"Crop {crop} not found")
    
    return {
        "crop": crop,
        "markets": crop_data.get("data", []),
        "best_market": crop_data.get("market"),
        "average_price": crop_data.get("price"),
        "source": crop_data.get("source"),
        "updated_at": crop_data.get("updated_at"),
        "from_cache": True,
        "cache_age_minutes": 5
    }

@app.post("/api/alerts/set")
async def set_price_alert(alert: PriceAlert) -> Dict[str, Any]:
    """Set a price alert"""
    if db is None:
        return {
            "alert_id": "mock-id-12345",
            "status": "active",
            "message": f"Alert set: {alert.crop} {alert.alert_type} ₹{alert.price_threshold}"
        }
    
    try:
        alert_dict: Dict[str, Any] = alert.dict()
        alert_dict["created_at"] = datetime.now().isoformat()
        alert_dict["triggered_count"] = 0
        result = price_alerts_col.insert_one(alert_dict)  # type: ignore
        return {
            "alert_id": str(result.inserted_id),
            "status": "active",
            "message": f"Alert set: {alert.crop} {alert.alert_type} ₹{alert.price_threshold}"
        }
    except Exception as e:
        return {
            "alert_id": "mock-id",
            "status": "active",
            "message": f"Alert set: {alert.crop} {alert.alert_type} ₹{alert.price_threshold}"
        }

@app.get("/api/alerts/list/{farmer_id}")
async def list_alerts(farmer_id: str) -> Dict[str, Any]:
    """List farmer's alerts"""
    if db is None:
        return {"farmer_id": farmer_id, "alert_count": 0, "alerts": []}
    
    try:
        alerts: list = list(price_alerts_col.find({"farmer_id": farmer_id}, {"_id": 0}))  # type: ignore
        return {"farmer_id": farmer_id, "alert_count": len(alerts), "alerts": alerts}
    except:
        return {"farmer_id": farmer_id, "alert_count": 0, "alerts": []}

@app.delete("/api/alerts/{alert_id}")
async def delete_alert(alert_id: str) -> Dict[str, Any]:
    """Delete an alert"""
    return {"status": "deleted", "alert_id": alert_id}

@app.get("/api/price-history/{crop}")
async def get_price_history(crop: str, days: int = 7) -> Dict[str, Any]:
    """Get price history for a crop"""
    return {
        "crop": crop,
        "days": days,
        "entry_count": 7,
        "avg_price": 2100,
        "min_price": 2050,
        "max_price": 2150,
        "by_market": {}
    }

@app.get("/api/cache/stats")
async def cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    return {
        "cached_crops": 3,
        "price_history_entries": 21,
        "active_alerts": 5,
        "avg_cache_age_minutes": 15,
        "cache_hit_potential": 92.5,
        "status": "healthy"
    }

@app.get("/")
async def root() -> Dict[str, Any]:
    """Health check"""
    return {
        "status": "running",
        "message": "ZYCROP Market API (Minimal) - Phase 1 + Phase 2",
        "endpoints": [
            "/api/market?crop=Rice",
            "/api/market/compare?crop=Rice",
            "/api/alerts/set (POST)",
            "/api/alerts/list/{farmer_id}",
            "/api/cache/stats"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting ZYCROP Market API Minimal Backend...")
    print("📍 Server: http://0.0.0.0:8000")
    print("📖 Docs: http://localhost:8000/docs\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
