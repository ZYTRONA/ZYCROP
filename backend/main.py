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
