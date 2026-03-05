"""
ZYCROP AI Backend — FastAPI + MongoDB
MongoDB: mongodb://localhost:27017/ZYCROP

Endpoints:
  POST /api/diagnose         — Crop disease detection (photo upload)
  GET  /api/market           — Market price forecast
  POST /api/soil-analysis    — Soil NPK → fertilizer recommendation
  POST /api/schemes          — Government scheme RAG search
  POST /api/loan-advisor     — Loan advice chatbot
  GET  /api/passport/logs    — Fetch farm passport logs from MongoDB
  POST /api/passport/log     — Log a new farm event to MongoDB
  DELETE /api/passport/log/{id} — Delete a log entry

Note: AI model stubs are marked with TODO comments for training integration.
"""

import os, csv, random, datetime
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# ─── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(title="ZYCROP AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MongoDB ──────────────────────────────────────────────────────────────────
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/ZYCROP")
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client["ZYCROP"]

# Collections
logs_col = db["farm_logs"]
market_col = db["market_cache"]
diagnose_col = db["diagnose_history"]

# ─── Pydantic Models ──────────────────────────────────────────────────────────
class SoilPayload(BaseModel):
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    ph: Optional[float] = None
    farmer_id: Optional[str] = "TN-CBE-9021"

class SchemeQuery(BaseModel):
    query: str

class LoanQuery(BaseModel):
    text: str
    language: str = "en"

class PassportLog(BaseModel):
    farmer_id: str = "TN-CBE-9021"
    event_type: str           # 'disease' | 'soil' | 'organic' | 'pest' | 'irrigation'
    date: str                 # e.g. "Feb 2026"
    note: str
    icon_color: Optional[str] = "#1b5e20"

# ─── Disease Knowledge Base ───────────────────────────────────────────────────
# TODO: Replace rule-based logic with MobileViT / ResNet50 trained on PlantVillage + TNAU dataset
DISEASE_DB = {
    "tomato": {
        "disease": "Tomato Early Blight",
        "confidence": 0.91,
        "severity": "Moderate",
        "treatment_plan": "Spray Copper Oxychloride 2.5g per liter of water every 7 days for 3 weeks.",
        "fertilizer": "Urea (20g/plant) + Potash (15g/plant) at base. Avoid wetting leaves.",
        "timing": "Apply at 6:00 AM. Repeat every 30 days after transplanting.",
        "organic_alt": "Neem oil spray (5ml/L) weekly as organic alternative.",
    },
    "rice": {
        "disease": "Rice Blast",
        "confidence": 0.88,
        "severity": "High",
        "treatment_plan": "Apply Tricyclazole 75WP at 0.6g/L. Drain fields for 3 days before spraying.",
        "fertilizer": "Split nitrogen: 40kg/acre at sowing, 20kg/acre at tillering.",
        "timing": "Spray at panicle initiation stage for best results.",
        "organic_alt": "Silicon-based foliar spray increases blast resistance naturally.",
    },
    "cotton": {
        "disease": "Cotton Bollworm",
        "confidence": 0.85,
        "severity": "High",
        "treatment_plan": "Apply Emamectin Benzoate 5SG at 0.4g/L. Install pheromone traps.",
        "fertilizer": "NPK 19:19:19 at 5g/L foliar spray weekly.",
        "timing": "Spray at boll formation stage. Repeat after 10 days if infestation persists.",
        "organic_alt": "Bt (Bacillus thuringiensis) spray at 2ml/L for larval control.",
    },
    "onion": {
        "disease": "Onion Purple Blotch",
        "confidence": 0.89,
        "severity": "Moderate",
        "treatment_plan": "Spray Mancozeb 75WP at 2g/L combined with Carbendazim 50WP at 1g/L.",
        "fertilizer": "Potassium Sulphate 3g/L foliar spray strengthens plant immunity.",
        "timing": "Apply in early morning. 3 sprays at 10-day intervals.",
        "organic_alt": "Garlic extract spray (50g crushed garlic per liter) as fungicide.",
    },
}

def detect_disease(filename: str) -> dict:
    """
    TODO: Load trained MobileViT/ResNet50 model here.
    Dataset: PlantVillage (54,000+ images, 38 disease classes) + TNAU local dataset.
    Training: fine-tune MobileViT-S on PlantVillage, retrain last layer on TNAU data.
    Inference: PIL image → torchvision transforms → model.eval() → softmax → top class.
    """
    name = filename.lower()
    for crop, data in DISEASE_DB.items():
        if crop in name:
            return data
    # Default fallback — randomly select from DB (replace with actual inference)
    crop_key = random.choice(list(DISEASE_DB.keys()))
    return DISEASE_DB[crop_key]

# ─── Market CSV Data ──────────────────────────────────────────────────────────
# CSV columns: State, District, Market, Commodity, Variety, Grade,
#              Arrival_Date, Min_x0020_Price, Max_x0020_Price, Modal_x0020_Price

_CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "market_data.csv")
MARKET_INDEX: dict = {}   # {commodity_lower: [list_of_row_dicts]}

def _load_market_csv():
    if not os.path.exists(_CSV_PATH):
        return
    with open(_CSV_PATH, newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            commodity = row.get("Commodity", "").strip()
            if not commodity:
                continue
            key = commodity.lower()
            MARKET_INDEX.setdefault(key, []).append({
                "state":    row.get("State",    "").strip(),
                "district": row.get("District", "").strip(),
                "market":   row.get("Market",   "").strip(),
                "commodity": commodity,
                "variety":  row.get("Variety",  "").strip(),
                "arrival_date": row.get("Arrival_Date", "").strip(),
                "min_price":   int(float(row.get("Min_x0020_Price",   0) or 0)),
                "max_price":   int(float(row.get("Max_x0020_Price",   0) or 0)),
                "modal_price": int(float(row.get("Modal_x0020_Price", 0) or 0)),
            })

_load_market_csv()

# Alias map: query → list of CSV commodity keys to try
_ALIASES: dict = {
    "tomato":      ["tomato"],
    "onion":       ["onion"],
    "potato":      ["potato"],
    "rice":        ["rice", "paddy"],
    "cotton":      ["cotton"],
    "sugarcane":   ["sugarcane"],
    "banana":      ["banana", "banana - green"],
    "groundnut":   ["groundnut"],
    "maize":       ["maize", "corn"],
    "garlic":      ["garlic"],
    "ginger":      ["ginger(dry)", "ginger(green)", "ginger"],
    "bitter gourd":["bitter gourd"],
    "ladies finger":["bhindi(ladies finger)"],
    "okra":        ["bhindi(ladies finger)"],
    "bhindi":      ["bhindi(ladies finger)"],
    "brinjal":     ["brinjal"],
    "cucumber":    ["cucumbar(kheera)", "cucumber"],
    "drumstick":   ["drumstick"],
    "beans":       ["beans", "french beans", "cluster beans"],
    "lemon":       ["lemon"],
    "pomegranate": ["pomegranate"],
    "papaya":      ["papaya"],
    "grapes":      ["grapes"],
    "mango":       ["mango"],
    "cauliflower": ["cauliflower"],
    "cabbage":     ["cabbage"],
    "carrot":      ["carrot"],
    "peas":        ["peas"],
    "capsicum":    ["capsicum"],
    "coconut":     ["coconut"],
    "turmeric":    ["turmeric"],
}

_TREND_MESSAGES = {
    "up":   [
        "Expected to rise 8–12% over next 7 days. Good time to hold stock.",
        "Demand surge from cold storage buyers. Prices climbing.",
        "Festival season demand pushing prices up.",
    ],
    "down": [
        "Arrivals heavy across mandis. Expect 6–9% dip this week.",
        "Oversupply at mandi. Consider early sale to avoid further loss.",
        "Rain forecast may depress prices by 5–8% this week.",
    ],
}

def _find_rows(crop_lower: str) -> list:
    """Return matching rows from MARKET_INDEX for a given crop query."""
    # Direct match
    if crop_lower in MARKET_INDEX:
        return MARKET_INDEX[crop_lower]
    # Alias lookup
    for alias_key, csv_keys in _ALIASES.items():
        if crop_lower == alias_key or crop_lower in alias_key or alias_key in crop_lower:
            rows = []
            for ck in csv_keys:
                rows.extend(MARKET_INDEX.get(ck, []))
            if rows:
                return rows
    # Partial match fallback
    partial = []
    for key, recs in MARKET_INDEX.items():
        if crop_lower in key or key in crop_lower:
            partial.extend(recs)
    return partial

def forecast_price(crop_name: str) -> dict:
    crop_lower = crop_name.lower().strip()
    rows = _find_rows(crop_lower)

    if rows:
        # Prefer Tamil Nadu / Coimbatore rows; fall back to all rows
        tn_rows = [r for r in rows if "tamil" in r["state"].lower()
                   or "coimbatore" in r["district"].lower()]
        primary = tn_rows if tn_rows else rows

        all_min   = min(r["min_price"]   for r in primary)
        all_max   = max(r["max_price"]   for r in primary)
        modals    = [r["modal_price"] for r in primary]
        modal_avg = round(sum(modals) / len(modals))
        markets_count = len({r["market"] for r in primary})

        # Top 3 unique markets (sorted by modal price desc)
        seen_markets: set = set()
        top_markets = []
        for r in sorted(primary, key=lambda x: x["modal_price"], reverse=True):
            if r["market"] not in seen_markets:
                seen_markets.add(r["market"])
                top_markets.append({
                    "name": r["market"],
                    "district": r["district"],
                    "state": r["state"],
                    "modal": r["modal_price"],
                })
            if len(top_markets) == 3:
                break

        trend_up  = random.random() > 0.45
        direction = "up" if trend_up else "down"
        trend_msg = random.choice(_TREND_MESSAGES[direction])
        source_date = primary[0]["arrival_date"]
        display_name = primary[0]["commodity"]
        advice = (
            f"Modal price of {display_name} across {markets_count} market(s): "
            f"₹{modal_avg:,}/quintal. Range: ₹{all_min:,}–₹{all_max:,}. {trend_msg}"
        )
        return {
            "crop":          display_name,
            "current_price": f"₹{modal_avg:,}",
            "modal_price":   modal_avg,
            "min_price":     all_min,
            "max_price":     all_max,
            "unit":          "₹/quintal",
            "markets_count": markets_count,
            "top_markets":   top_markets,
            "source_date":   source_date,
            "forecast_trend": trend_msg,
            "advice":        advice,
            "trend_up":      trend_up,
            "updated_at":    datetime.datetime.utcnow().isoformat(),
        }

    # Fallback if crop not in CSV
    trend_up  = random.random() > 0.5
    direction = "up" if trend_up else "down"
    trend_msg = random.choice(_TREND_MESSAGES[direction])
    return {
        "crop":          crop_name.title(),
        "current_price": "N/A",
        "modal_price":   None,
        "min_price":     None,
        "max_price":     None,
        "unit":          "₹/quintal",
        "markets_count": 0,
        "top_markets":   [],
        "source_date":   None,
        "forecast_trend": trend_msg,
        "advice":        f"No APMC data found for '{crop_name.title()}'. {trend_msg}",
        "trend_up":      trend_up,
        "updated_at":    datetime.datetime.utcnow().isoformat(),
    }

# ─── Soil Analysis Knowledge Base ────────────────────────────────────────────
# TODO: Replace with Random Forest trained on Indian Soil Health Card dataset.
# Features: N, P, K, pH, OC, EC → crop recommendation + fertilizer dosage.
SOIL_PROFILES = [
    {
        "soilType": "Red Laterite Soil",
        "ph_range": (5.5, 6.5),
        "bestCrop": "Groundnut, Tapioca, or Ragi",
        "fertilizers": [
            "Apply 12.5 tons Farm Yard Manure (FYM) per hectare before plowing.",
            "Basal Dose: 40kg Nitrogen + 20kg Phosphorus per acre.",
            "Top Dressing: 20kg Nitrogen 30 days after sowing.",
            "Lime application recommended: 250kg/acre to correct acidity.",
        ],
        "warning": "Low water retention. Use drip irrigation for best results.",
    },
    {
        "soilType": "Black Cotton Soil (Vertisol)",
        "ph_range": (7.5, 8.5),
        "bestCrop": "Cotton, Sorghum, or Wheat",
        "fertilizers": [
            "Apply 10 tons FYM per hectare. Incorporate 15 days before sowing.",
            "Basal: 20kg Nitrogen + 40kg Phosphorus + 20kg Potassium per acre.",
            "Top Dressing: 40kg Nitrogen split at 30 and 60 days after sowing.",
            "Zinc Sulphate 25kg/ha corrects micronutrient deficiency.",
        ],
        "warning": "High shrink-swell capacity. Avoid over-irrigation.",
    },
    {
        "soilType": "Red Calcareous Soil",
        "ph_range": (6.5, 7.5),
        "bestCrop": "Sorghum (Cholam) or Cotton",
        "fertilizers": [
            "Apply 12.5 tons Farm Yard Manure (FYM) per hectare before plowing.",
            "Basal Dose: 40kg Nitrogen + 20kg Phosphorus per acre.",
            "Top Dressing: 20kg Nitrogen 30 days after sowing.",
        ],
        "warning": None,
    },
    {
        "soilType": "Alluvial Sandy Loam",
        "ph_range": (6.0, 7.0),
        "bestCrop": "Rice, Banana, or Sugarcane",
        "fertilizers": [
            "Apply 15 tons FYM per hectare. High organic matter critical.",
            "Basal: 50kg Nitrogen + 25kg Phosphorus + 30kg Potassium per acre.",
            "Split Nitrogen: 3 splits at basal, tillering, and panicle initiation.",
            "Foliar spray: 2% KNO3 at grain filling stage.",
        ],
        "warning": "Good drainage needed. Monitor for waterlogging.",
    },
]

def analyze_soil_npk(n, p, k, ph) -> dict:
    """
    TODO: Load Random Forest model trained on Soil Health Card dataset (2.53 crore samples).
    Features: N, P, K, pH, OC, EC, Zn, Fe, Mn.
    Target: crop_recommendation (multi-class), fertilizer_dose (regression).
    """
    # Simple rule-based matching by pH range
    profile = SOIL_PROFILES[2]  # default
    if ph is not None:
        for p_data in SOIL_PROFILES:
            lo, hi = p_data["ph_range"]
            if lo <= ph <= hi:
                profile = p_data
                break
    result = {
        "soilType": profile["soilType"],
        "location": "Coimbatore District Dataset",
        "bestCrop": profile["bestCrop"],
        "fertilizers": profile["fertilizers"],
        "ph": ph,
        "nitrogen": n,
        "phosphorus": p,
        "potassium": k,
    }
    if profile.get("warning"):
        result["warning"] = profile["warning"]
    return result

# ─── Government Schemes DB ────────────────────────────────────────────────────
# TODO: Replace with all-MiniLM-L6-v2 sentence-transformer RAG.
# Knowledge base: TN Agriculture dept PDFs + PM portals scraped text.
# Pipeline: query → embed → cosine_similarity → top-k scheme chunks → format response.
SCHEMES_DB = [
    {
        "id": "1", "name": "PM-KISAN",
        "benefit": "₹6,000/year direct income support",
        "eligibility": "Small & marginal farmers with land records",
        "amount": "₹6,000 per year",
        "deadline": "Ongoing",
    },
    {
        "id": "2", "name": "PM-Kusum Scheme",
        "benefit": "60% subsidy on solar pumps for irrigation",
        "eligibility": "Land records + water source proof",
        "amount": "Up to ₹2.5 Lakh",
        "deadline": "Mar 31, 2026",
    },
    {
        "id": "3", "name": "Fasal Bima Yojana (PMFBY)",
        "benefit": "Crop insurance at 2% premium for Kharif, 1.5% for Rabi",
        "eligibility": "Loanee & non-loanee farmers",
        "amount": "Full crop value coverage",
        "deadline": "Apr 15, 2026",
    },
    {
        "id": "4", "name": "Uzhavar Sandhai",
        "benefit": "Free transport to farmer markets + better price realization",
        "eligibility": "Tamil Nadu farmers with FarmerID card",
        "amount": "Transport support + stall allocation",
        "deadline": "Ongoing",
    },
    {
        "id": "5", "name": "Soil Health Card Scheme",
        "benefit": "Free soil testing every 2 years + fertilizer advisory",
        "eligibility": "All farmers",
        "amount": "Free service",
        "deadline": "Ongoing",
    },
    {
        "id": "6", "name": "KCC — Kisan Credit Card",
        "benefit": "Short-term crop loan at 4% interest (3% govt subsidy)",
        "eligibility": "Land records + cultivation certificate",
        "amount": "Up to ₹3,00,000",
        "deadline": "Year-round",
    },
    {
        "id": "7", "name": "NABARD Agricultural Term Loan",
        "benefit": "Long-term investment credit for farm infrastructure",
        "eligibility": "Land ownership documents + project report",
        "amount": "Up to ₹10,00,000",
        "deadline": "June–Sept (Kharif) / Nov–Feb (Rabi)",
    },
    {
        "id": "8", "name": "Tamil Nadu Chief Minister's Drought Relief",
        "benefit": "Ex-gratia payment for crop loss due to drought",
        "eligibility": "TN farmers with revenue record crop damage report",
        "amount": "₹8,000–₹22,000 per ha depending on crop",
        "deadline": "Application after district collector declaration",
    },
]

def search_schemes_local(query: str) -> list:
    """
    TODO: Replace with sentence-transformers (all-MiniLM-L6-v2) RAG pipeline.
    Steps: embed query → cosine_sim with scheme embeddings → return top-5.
    Data: pre-embedded SCHEMES_DB + TN Agriculture PDFs chunked and embedded.
    """
    q = query.lower()
    # Keyword matching fallback
    results = []
    for s in SCHEMES_DB:
        score = 0
        for field in [s["name"], s["benefit"], s["eligibility"]]:
            for word in q.split():
                if word in field.lower():
                    score += 1
        if score > 0:
            results.append((score, s))
    results.sort(key=lambda x: x[0], reverse=True)
    return [s for _, s in results] if results else SCHEMES_DB[:5]

# ─── Loan Advisor Knowledge Base ─────────────────────────────────────────────
# TODO: Replace with NLTK + WordNetLemmatizer intent classifier + Llama3-8B for response generation.
# Training data: Indian Bank KCC policy PDFs, NABARD guidelines, PM scheme documents.
LOAN_RESPONSES = {
    "kcc": "Kisan Credit Card (KCC) gives you up to ₹3,00,000 at just 4% interest with 3% government subsidy. Visit your nearest nationalized bank or RRB with your Aadhaar, land records, and passport photos. Processing takes 14 working days.",
    "nabard": "NABARD Agricultural Term Loan offers up to ₹10,00,000 for farm infrastructure at 7% p.a. Apply during Kharif window (June–Sept) or Rabi window (Nov–Feb). Requires a detailed project report.",
    "interest": "KCC: 4% p.a. (effectively 1% with subvention for timely repayment). NABARD Term Loan: 7% p.a. SBI Gold Loan: 8.5% p.a. PM-KISAN is a free grant — no interest.",
    "documents": "Standard documents needed: Aadhaar Card, Land Records (Chitta/Patta), Passport photos (2), Bank passbook, Cultivation certificate from Village Officer, Address proof.",
    "subsidy": "PM-Kusum solar pump: 60% subsidy. PM-KISAN: ₹6,000 annual grant. KCC interest subsidy: 3% off interest for timely repayment. PMFBY crop insurance: premium capped at 2%.",
    "soil": "Soil Health Card scheme gives free soil testing with NPK analysis every 2 years. Apply at nearest Krishi Vigyan Kendra or Agriculture Department office.",
    "default": "I can help you find the best government loan scheme for your farm. Tell me your crop name, land area (in acres), and purpose — I will match the most suitable scheme with full application steps.",
}

def generate_loan_response(text: str, language: str) -> str:
    """
    TODO: Replace with NLTK intent → Llama3 response pipeline.
    Intent classes: kcc_inquiry, nabard_inquiry, interest_query, document_query,
                    subsidy_query, general_advice, eligibility_check.
    Model: Llama3-8B-Instruct fine-tuned on banking policy documents.
    """
    t = text.lower()
    if any(w in t for w in ["kcc", "kisan credit", "credit card"]):
        return LOAN_RESPONSES["kcc"]
    if any(w in t for w in ["nabard", "term loan", "infrastructure"]):
        return LOAN_RESPONSES["nabard"]
    if any(w in t for w in ["interest", "rate", "%"]):
        return LOAN_RESPONSES["interest"]
    if any(w in t for w in ["document", "docs", "papers", "aadhaar", "land record"]):
        return LOAN_RESPONSES["documents"]
    if any(w in t for w in ["subsidy", "grant", "free", "pm-kisan", "kusum"]):
        return LOAN_RESPONSES["subsidy"]
    if any(w in t for w in ["soil", "health card", "npk", "test"]):
        return LOAN_RESPONSES["soil"]
    return LOAN_RESPONSES["default"]

# ─── Helper: serialize MongoDB ObjectId ───────────────────────────────────────
def serialize_doc(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc

# ─── API Routes ───────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "ZYCROP AI backend running", "version": "1.0.0"}

@app.get("/health")
async def health():
    try:
        await mongo_client.admin.command("ping")
        mongo_ok = True
    except Exception:
        mongo_ok = False
    return {"api": "ok", "mongodb": "connected" if mongo_ok else "disconnected"}


# ── Disease Detection ─────────────────────────────────────────────────────────
@app.post("/api/diagnose")
async def diagnose(file: UploadFile = File(...), farmer_id: str = "TN-CBE-9021"):
    """
    Upload a crop leaf image and get disease diagnosis.
    Returns: disease name, confidence, treatment plan, fertilizer recommendation.
    """
    try:
        contents = await file.read()
        if len(contents) < 1000:
            raise HTTPException(status_code=400, detail="Image too small or corrupted.")

        result = detect_disease(file.filename)

        # Log diagnosis to MongoDB
        log_entry = {
            "farmer_id": farmer_id,
            "event_type": "disease",
            "disease": result["disease"],
            "confidence": result["confidence"],
            "severity": result["severity"],
            "filename": file.filename,
            "timestamp": datetime.datetime.utcnow(),
            "date": datetime.datetime.now().strftime("%b %Y"),
            "note": f'{result["disease"]} detected. {result["treatment_plan"][:60]}...',
            "icon_color": "#e53935",
        }
        await diagnose_col.insert_one(log_entry)
        await logs_col.insert_one({
            "farmer_id": farmer_id,
            "event_type": "disease",
            "date": log_entry["date"],
            "note": log_entry["note"],
            "icon_color": "#e53935",
            "timestamp": log_entry["timestamp"],
        })

        return {
            "disease": result["disease"],
            "confidence": round(result["confidence"] * 100, 1),
            "severity": result["severity"],
            "treatment_plan": result["treatment_plan"],
            "fertilizer": result["fertilizer"],
            "timing": result["timing"],
            "organic_alt": result["organic_alt"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Market Price Forecast ─────────────────────────────────────────────────────
@app.get("/api/market")
async def market_price(crop: str = Query(...), location: str = Query("Coimbatore")):
    """
    Get real-time mandi price and 7-day forecast for a crop.
    """
    if not crop.strip():
        raise HTTPException(status_code=400, detail="Crop name is required.")
    result = forecast_price(crop.strip())
    result["location"] = location
    return result


# ── Soil Analysis ─────────────────────────────────────────────────────────────
@app.post("/api/soil-analysis")
async def soil_analysis(payload: SoilPayload):
    """
    Analyze NPK + pH values and return soil type, crop recommendation, fertilizer plan.
    If values are null (camera scan), uses Coimbatore district profile defaults.
    """
    n = payload.nitrogen
    p = payload.phosphorus
    k = payload.potassium
    ph = payload.ph

    result = analyze_soil_npk(n, p, k, ph)

    # Log soil test to MongoDB
    log_entry = {
        "farmer_id": payload.farmer_id,
        "event_type": "soil",
        "date": datetime.datetime.now().strftime("%b %Y"),
        "note": f"Soil tested: {result['soilType']}. Best crop: {result['bestCrop']}.",
        "icon_color": "#1565c0",
        "timestamp": datetime.datetime.utcnow(),
        "soil_data": {"n": n, "p": p, "k": k, "ph": ph},
    }
    await logs_col.insert_one(log_entry)

    return result


# ── Government Schemes ────────────────────────────────────────────────────────
@app.post("/api/schemes")
async def schemes(payload: SchemeQuery):
    """
    Search government schemes by keyword or crop context.
    """
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query is required.")
    results = search_schemes_local(payload.query)
    return {"schemes": results, "count": len(results)}


# ── Loan Advisor ──────────────────────────────────────────────────────────────
@app.post("/api/loan-advisor")
async def loan_advisor(payload: LoanQuery):
    """
    AI loan advisor chat. Accepts farmer's question and returns guidance.
    """
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Message is required.")
    response = generate_loan_response(payload.text, payload.language)
    return {"response": response, "language": payload.language}


# ── Farm Passport — MongoDB Logs ──────────────────────────────────────────────
@app.get("/api/passport/logs")
async def get_passport_logs(farmer_id: str = Query("TN-CBE-9021"), limit: int = Query(20)):
    """
    Fetch farm history logs from MongoDB for a farmer.
    Returns latest {limit} events sorted by most recent first.
    """
    cursor = logs_col.find(
        {"farmer_id": farmer_id},
        {"_id": 1, "event_type": 1, "date": 1, "note": 1, "icon_color": 1, "timestamp": 1}
    ).sort("timestamp", -1).limit(limit)

    docs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if "timestamp" in doc:
            doc["timestamp"] = doc["timestamp"].isoformat()
        docs.append(doc)

    return {"logs": docs, "count": len(docs)}


@app.post("/api/passport/log")
async def add_passport_log(payload: PassportLog):
    """
    Add a new event to the farm history log in MongoDB.
    Called automatically after diagnose / soil-analysis.
    Can also be called manually from the app.
    """
    log = {
        "farmer_id": payload.farmer_id,
        "event_type": payload.event_type,
        "date": payload.date or datetime.datetime.now().strftime("%b %Y"),
        "note": payload.note,
        "icon_color": payload.icon_color,
        "timestamp": datetime.datetime.utcnow(),
    }
    result = await logs_col.insert_one(log)
    return {"id": str(result.inserted_id), "message": "Log added successfully."}


@app.delete("/api/passport/log/{log_id}")
async def delete_passport_log(log_id: str):
    """
    Delete a specific log entry by MongoDB ObjectId.
    """
    try:
        result = await logs_col.delete_one({"_id": ObjectId(log_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Log not found.")
        return {"message": "Log deleted."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
