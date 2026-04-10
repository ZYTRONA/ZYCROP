// @ts-nocheck
/**
 * VoiceBot.js — ZYCROP AI Assistant v3
 * ====================================
 * Smart local AI with scored KB matching + OpenAI GPT fallback + backend Ollama
 * Voice: mic recording → backend Whisper STT (or graceful prompt-to-type fallback)
 * Text:  OpenAI GPT (if key set) → local backend → smart local KB (always works)
 */
import React, { useRef, useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
  TextInput, Animated, Keyboard, KeyboardAvoidingView, Platform,
} from 'react-native'
import * as AudioModule from 'expo-audio'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { useLang } from '../context/LanguageContext'
import { speak, stopSpeaking, speakDashboardGreeting } from '../services/voiceService'
import { sendVoiceAudio, chatAI } from '../services/api'
import { chatWithGPT } from '../services/openaiService'
import { OPENAI_API_KEY } from '../config'

/** @type {any} */
const Audio = AudioModule

// ─── Comprehensive Farming Knowledge Base ────────────────────────────────────
const KB = [
  // Navigation intents
  { p: ['soil', 'npk', 'ph', 'fertilizer', 'fertili', 'மண்', 'मिट्टी', 'నేల', 'mannu', 'mitti', 'nutrient', 'potassium', 'nitrogen', 'phosphoru'], nav: 'SoilLab',
    r: '🌱 Opening Soil Lab! Hold your phone over dry soil — I\'ll analyze NPK balance, pH, and recommend the exact fertilizer dose for your field.' },

  { p: ['market', 'price', 'mandi', 'sell', 'rate', 'விலை', 'बाजार', 'ధర', 'bazar', 'cost', 'kilo', 'rupee', 'profit', 'areca', 'vegetable'], nav: 'Market',
    r: '📈 Opening Market AI! Real-time APMC mandi rates from Coimbatore, Pollachi & Tiruppur with 7-day forecasts. I\'ll tell you the best time to sell.' },

  { p: ['disease', 'scan', 'leaf', 'pest', 'நோய்', 'రోగ', 'blight', 'pathologist', 'diagnose', 'wilt', 'yellow leaf', 'insect', 'camera', 'photo'], nav: 'AI Scan',
    r: '🔬 Opening AI Pathologist! Point your camera at the affected leaf. I can detect 50+ diseases, pests, and nutrient deficiencies in 3 seconds.' },

  { p: ['scheme', 'subsidy', 'government', 'yojana', 'திட்டம்', 'పథకం', 'kusum', 'benefit', 'grant', 'pm kisan', 'pmfby', 'insurance'], nav: 'GovSchemes',
    r: '📋 Opening Government Schemes! I\'ll search PM-Kisan, PM-Kusum, PMFBY, and TN state subsidies — checking your eligibility instantly.' },

  { p: ['loan', 'credit', 'bank', 'kcc', 'கடன்', 'ऋण', 'రుణం', 'finance', 'borrow', 'interest', 'nabard', 'mudra', 'repay'], nav: 'Loans',
    r: '💰 Opening Loan Advisor! Comparing KCC (4% interest), SBI Agri Loan, NABARD Term Loan, and PM-SVANidhi options for your farm size.' },

  { p: ['passport', 'record', 'land', 'patta', 'survey', 'deed', 'certificate', 'பாஸ்போர்ட்', 'document', 'digital', 'qr'], nav: 'FarmPassport',
    r: '🛡️ Opening Farm Passport! Scan your Land Survey Number to fetch TN land records and generate a tamper-proof digital certificate.' },

  { p: ['library', 'encyclopedia', 'learn', 'நூலகம்', 'information', 'browse', 'list disease', 'all disease', 'know about'], nav: 'Library',
    r: '📚 Opening Disease Library! Browse 30+ crop diseases with photos, symptoms, and full treatment guides — works fully offline.' },

  { p: ['calendar', 'plant', 'sow', 'when to', 'season', 'schedule', 'grow', 'cultivation', 'month', 'கலை', 'rabi', 'kharif', 'zaid'], nav: 'Calendar',
    r: '📅 Opening Crop Calendar! What to plant in Tamil Nadu this month — with spray schedules, growth stages, and weather-based warnings.' },

  // Weather
  { p: ['rain', 'rainfall', 'weather', 'humidity', 'temperature', 'forecast', 'wind', 'cloud', 'monsoon', 'climate'], nav: null,
    r: '🌦️ Live weather is always visible at the top of your Home screen — real-time temp, humidity, wind & rain from OpenMeteo GPS data. If 48hr rain forecast > 2mm, hold all fertilizer & chemical sprays!' },

  // ─── Crop Specific Advice ─────────────────────────────────────────────────
  { p: ['cotton', 'kapas', 'பருத்தி', 'bollworm', 'whitefly cotton', 'bt cotton'], nav: null,
    r: '🌿 Cotton advice:\n• Water: 700–1200mm/season. Drip saves 40%.\n• Basal: 2 bags DAP + 1 bag MoP/acre at sowing.\n• Pink bollworm: Use Bt cotton (Bollgard II), spray Emamectin Benzoate 0.4g/L at 45 DAS.\n• Harvest: Dew-free mornings only. Say "open AI scan" to detect bollworm or mite damage.' },

  { p: ['tomato', 'tamatar', 'தக்காளி', 'tomato blight', 'tomato wilt'], nav: null,
    r: '🍅 Tomato tips:\n• Water: 600–900mm. Stake at 30cm height.\n• Blight prevention: Mancozeb 2g/L every 7 days when humidity > 80%.\n• Virus (Leaf Curl): No cure — remove infected plants, control whitefly with Imidacloprid 0.5ml/L.\n• Foliar: 19:19:19 at 5g/L at flowering for yield boost.' },

  { p: ['paddy', 'rice', 'dhan', 'arisi', 'நெல்', 'rice blast', 'leaf folder', 'stem borer', 'bph', 'hopper'], nav: null,
    r: '🌾 Paddy management:\n• Water: 2–5cm at tillering; drain 10 days before harvest.\n• Urea: 50kg/acre in 3 splits (basal, tillering, panicle init).\n• Blast: Tricyclazole 0.6g/L (drain field first).\n• Brown Planthopper: Dinotefuran 0.3g/L at stem base. Avoid excessive N.' },

  { p: ['sugarcane', 'cane', 'கரும்பு', 'ganna', 'jaggery', 'red rot', 'pyrilla'], nav: null,
    r: '🌱 Sugarcane guide:\n• Plant Jan–Feb (spring) or June–July (adsali). Needs 1500–2000mm.\n• Urea: 300kg/acre/year in 3 splits.\n• Red rot: Sett treatment — soak in Carbendazim 1g/L for 30 min before planting.\n• Intercrop Groundnut Mar–Apr for 35–40% extra income.' },

  { p: ['groundnut', 'peanut', 'கடலை', 'moongphali', 'tikka', 'stem rot groundnut'], nav: null,
    r: '🥜 Groundnut advice:\n• Best soil: Red loamy. pH 6–6.5.\n• Gypsum: 200kg/acre at 30 DAS for pod filling.\n• Water: 500–700mm. Needs pod zone to be moist.\n• Tikka leaf spot: Chlorothalonil 2g/L from 30 DAS every 15 days.\n• Stem rot: Carbendazim drench at base.' },

  { p: ['maize', 'corn', 'makka', 'மக்காச்சோளம்', 'fall armyworm', 'leaf blight maize'], nav: null,
    r: '🌽 Maize guide:\n• Hybrid: DKC 9081 / Pioneer 3396 for high yield.\n• Fall Armyworm: Spray Emamectin Benzoate 0.4g/L INTO the whorl at 15 DAS.\n• Apply 100kg DAP + 50kg MOP/acre at sowing. Urea 50kg at knee height.\n• Harvest at 25% moisture for best market price.' },

  { p: ['banana', 'pazham', 'வாழை', 'panama wilt', 'sigatoka', 'bunchy top'], nav: null,
    r: '🍌 Banana tips:\n• Panama wilt: Use Cavendish variety or tissue culture plants. Sanitize cutting tools.\n• Sigatoka: Propiconazole 1ml/L every 15 days from 3rd month.\n• Apply 150g Urea + 150g MOP per plant/month.\n• Denaveling 15 days after last hand emerges improves fruit size by 20%.' },

  { p: ['onion', 'vengayam', 'வெங்காயம்', 'purple blotch', 'downy mildew onion', 'thrips onion'], nav: null,
    r: '🧅 Onion advice:\n• Purple blotch: Mancozeb 2g/L + Carbendazim 1g/L with sticker at 10-day intervals.\n• Thrips: Fipronil 1ml/L or Spinosad 0.3ml/L inside leaf folds.\n• Curing: Dry bulbs 10–15 days in shade before storage to prevent rot.\n• Plant spacing: 10×10cm for small season, 15×10cm for big kharif onion.' },

  { p: ['chili', 'chilli', 'mirchi', 'மிளகாய்', 'capsicum', 'pepper', 'anthracnose', 'broad mite', 'chili wilt'], nav: null,
    r: '🌶️ Chili guide:\n• Anthracnose (fruit rot): Hexaconazole 2ml/L or Azoxystrobin 1ml/L. Remove infected fruits.\n• Broad mite: Spiromesifen 0.5ml/L on leaf undersides.\n• Virus wilt: Control thrips with Imidacloprid. Remove infected plants.\n• High yield tip: Apply 19:19:19 at 5g/L every 15 days from transplanting.' },

  { p: ['wheat', 'gehu', 'கோதுமை', 'rust wheat', 'loose smut', 'yellow rust'], nav: null,
    r: '🌿 Wheat tips:\n• Yellow/Stripe rust: Propiconazole 1ml/L at first pustule sighting.\n• Loose smut: Treat seed with Carboxin 2g/kg before sowing — most effective prevention.\n• Irrigation: Crown root initiation (21 DAS), Tillering (42 DAS), Boot stage (5th water) are critical.\n• Avoid excess N — causes lodging. Use 120:60:40 NPK kg/ha.' },

  // ─── Fertilizer & Soil Topics ─────────────────────────────────────────────
  { p: ['organic', 'natural', 'compost', 'biofertilizer', 'neem', 'jeevamrutha', 'cow dung', 'vermicompost', 'fym'], nav: null,
    r: '🌿 Organic farming:\n• Jeevamrutha: 10L cow dung + 10L cow urine + 2kg jaggery + 2kg pulse flour, ferment 72hrs. Apply 200L/acre.\n• Panchagavya 3% spray boosts immunity and yield.\n• Neem cake 250kg/acre at sowing — controls soil-borne pests naturally.\n• Vermicompost 5 tons/acre raises soil organic matter significantly.' },

  { p: ['dap', 'urea', 'mop', 'potash', 'npk', 'calcium', 'micronutrient', 'zinc', 'boron', 'sulfur'], nav: null,
    r: '💊 Fertilizer guide:\n• DAP (18:46:00): Use at sowing for P & N. 50kg/acre standard.\n• Urea (46%N): Apply in 2–3 splits. Never on wet leaves.\n• MOP (0:0:60 K): Add at transplanting & fruiting. 25–50kg/acre.\n• Zinc deficiency (white stripes): Zinc Sulfate 5kg/acre to soil or 0.5% foliar.\n• Boron (hollow stems): Borax 0.5g/L foliar at flowering.' },

  { p: ['drip', 'sprinkler', 'irrigation', 'water', 'drought', 'flood', 'waterlogging', 'moisture'], nav: null,
    r: '💧 Irrigation tips:\n• Drip saves 40–60% water vs flood — eligible for 90% PM-Kusum subsidy.\n• Sprinkler: Best for groundnut, maize, wheat. Irrigate early morning.\n• Flood irrigation: Suitable for paddy only. 2–5cm standing water at tillering.\n• Drought: Foliar spray of 1% KNO3 (potassium nitrate) reduces water stress.' },

  { p: ['ph', 'acidic', 'alkaline', 'lime', 'gypsum', 'saline', 'salinity', 'sodic'], nav: null,
    r: '⚗️ Soil pH correction:\n• Acidic soil (pH<6): Apply Agricultural Lime (CaCO3) 400–800kg/ha. Re-test after 3 months.\n• Alkaline/Sodic (pH>8): Apply Gypsum 400kg/acre + FYM 5 tons. Leach with excess water.\n• Ideal pH for most crops: 6.0–7.0. Rice tolerates 5.5–7.0.\n• Test soil first — say "open soil lab" for NPK & pH analysis.' },

  // ─── Pest & Disease Management ───────────────────────────────────────────
  { p: ['pesticide', 'insecticide', 'fungicide', 'spray', 'dose', 'dosage', 'chemical', 'how to mix'], nav: null,
    r: '🧪 Spray guidelines:\n• Always add 1–2ml/L sticker (Triton or Sandovit) to improve adhesion.\n• Spray early morning or after 4pm — avoid midday heat.\n• 15 days gap between sprays for resistance management. Rotate between chemical groups.\n• Pre-harvest interval: Check label. Most pesticides need 7–21 days before harvest.\n• Use 200–400L water/acre for full coverage.' },

  { p: ['fungal', 'fungus', 'mold', 'mildew', 'rot', 'blight', 'rust', 'smut', 'powdery', 'downy'], nav: null,
    r: '🍄 Fungal disease management:\n• Preventive: Mancozeb 75WP 2g/L or Copper Oxychloride 3g/L every 10–14 days during humid seasons.\n• Curative: Hexaconazole 1–2ml/L or Propiconazole 1ml/L for systemic action.\n• Soil borne (wilt/rot): Trichoderma viride 4g/kg FYM, drench with Carbendazim 1g/L.\n• Organic: Bordeaux mixture 1% spray for most fungal diseases.' },

  { p: ['worm', 'caterpillar', 'moth', 'borer', 'larva', 'armyworm', 'bollworm'], nav: null,
    r: '🐛 Worm/caterpillar control:\n• First line: Emamectin Benzoate 5SG (Proclaim) 0.4g/L — works on FAW, bollworm, stem borer.\n• Heavy infestation: Chlorantraniliprole 0.4ml/L or Indoxacarb 1ml/L.\n• Resistance mgmt: Rotate between Emamectin → Spinosad → Chlorantraniliprole.\n• Biological: Bt spray 2ml/L weekly. Trichogramma egg cards 50,000/acre for early prevention.' },

  { p: ['mite', 'spider mite', 'red mite', 'broad mite', 'acaricide'], nav: null,
    r: '🕷️ Mite control:\n• Spiromesifen 22.9SC (Oberon) 0.5ml/L — best systemic, covers spider + broad mite.\n• Abamectin 0.5ml/L — fast contact action on undersides.\n• Fenazaquin 10EC 1ml/L — use when Spiromesifen resistant.\n• Important: Rotate chemicals every 2 sprays. Mites develop resistance fast.\n• Organic: Strong jet of water on leaf undersides + Neem oil 5ml/L weekly.' },

  { p: ['aphid', 'greenfly', 'louse', 'sucking pest', 'scale insect', 'mealybug'], nav: null,
    r: '🦗 Sucking pest control:\n• Imidacloprid 17.8SL 0.5ml/L (Confidor) — excellent for aphids, whitefly, thrips.\n• Thiamethoxam 25WG 0.3g/L — systemic, lasts 2–3 weeks.\n• Dimethoate 30EC 1.5ml/L — broad-spectrum, good on aphids.\n• Note: Avoid neonicotinoids during flowering (harms bees). Use Spinosad instead.\n• Organic: NSKE (Neem Seed Kernel Extract) 5% spray weekly.' },

  // ─── Government Schemes ───────────────────────────────────────────────────
  { p: ['pm kisan', 'kisan samman', '6000', 'installment', 'direct transfer'], nav: null,
    r: '💰 PM-KISAN:\n• ₹6,000/year (₹2,000 every 4 months) direct to bank.\n• Eligibility: All farmer families with land records.\n• Register at pmkisan.gov.in or nearest CSC center.\n• Check status: pmkisan.gov.in/beneficiaryStatus.aspx\n• Say "open government schemes" for full eligibility check.' },

  { p: ['pmfby', 'insurance', 'fasal bima', 'crop cover', 'flood loss', 'drought claim'], nav: null,
    r: '🛡️ PMFBY Crop Insurance:\n• Premium: 2% for Kharif, 1.5% for Rabi. Full sum insured.\n• Covers: Drought, flood, hail, pest, disease, cyclone.\n• Register: Through your bank before sowing deadline.\n• Claim process: Report crop loss within 72 hours to local agriculture office.\n• TN state: Additional TN Crop Protection scheme gives up to ₹22,000/ha.' },

  { p: ['solar', 'pm kusum', 'pump', 'solar pump', 'electricity', 'subsidy pump'], nav: null,
    r: '☀️ PM-Kusum Solar Pump Scheme:\n• Subsidy: 60% central + 20–30% state = 80–90% total!\n• Capacity: 3HP to 10HP solar pump.\n• Deadline: March 31, 2026 — apply NOW at pmkusum.mnre.gov.in.\n• Required docs: Land record, water source proof, Aadhaar.\n• Annual saving: ₹30,000–₹70,000 on diesel pump costs.' },

  { p: ['kcc', 'kisan credit', 'crop loan', 'working capital'], nav: null,
    r: '🏦 Kisan Credit Card (KCC):\n• Limit: Up to ₹3,00,000 at just 4% interest (7% - 3% subsidy for timely repayment).\n• Covers: Seeds, fertilizers, pesticides, fuel, labor.\n• Apply at: SBI, PNB, Cooperative banks with land record + cultivation certificate.\n• Renewal: Annual. Revolving credit — withdraw & repay as needed.\n• 0.5ml ATM card given for instant cash access.' },

  { p: ['uzhavar sandhai', 'farmer market', 'direct market', 'tn market'], nav: null,
    r: '🏪 Uzhavar Sandhai (TN):\n• Free permanent stall for TN farmers at weekly markets.\n• Sell directly to consumers — 30–50% more than mandi price!\n• Products: Vegetables, fruits, flowers, processed items.\n• Register: Contact nearest Agriculture Office with FarmerID card.\n• 234 markets operating across Tamil Nadu.' },

  // ─── Loan & Finance ───────────────────────────────────────────────────────
  { p: ['nabard', 'term loan', 'infrastructure', 'godown', 'warehouse', 'cold storage'], nav: null,
    r: '🏗️ NABARD Agricultural Term Loan:\n• Purpose: Farm infrastructure (drip, poly house, godown, agri machinery).\n• Amount: Up to ₹10,00,000 at 7% p.a.\n• Duration: Up to 7 years with 1-year moratorium.\n• Apply: Through District Cooperative Bank or NABARD-linked agency.\n• Subsidy: 25–40% back-ended subsidy available on eligible projects.' },

  { p: ['swanidhi', 'nidhi', 'hawker', 'small loan', 'vendor'], nav: null,
    r: '🛒 PM-SVANidhi (Micro-credit):\n• For street vendors and small farmers: ₹10,000 → ₹20,000 → ₹50,000 in 3 cycles.\n• Interest rate: 7% (subsidized). Ensure timely repayment.\n• Apply via local municipality or nearest bank.\n• Digital payment bonus: Extra cashback on UPI transactions.' },

  // ─── Real-time answers ───────────────────────────────────────────────────
  { p: ['hello', 'hi', 'hai', 'hey', 'நமஸ்காரம்', 'வணக்கம்', 'namaste', 'good morning', 'good evening'], nav: null,
    r: '👋 Hello! I\'m ZyCrop AI — your smart farming assistant.\n\nI can help you with:\n🌱 Soil & fertilizer advice\n📈 Market prices & forecasts\n🔬 Crop disease detection\n📋 Government subsidies\n💰 Agricultural loans\n📅 Crop calendar & schedules\n\nType your question or tap a topic chip below!' },

  { p: ['who are you', 'what are you', 'introduce', 'about zycrop', 'tell me about'], nav: null,
    r: '🤖 I\'m ZyCrop AI — built for Indian farmers by ZYTRONA.\n\n✅ Analyzes soil NPK and pH\n✅ Detects crop diseases via camera (50+ diseases)\n✅ Shows live mandi prices\n✅ Finds subsidies you\'re eligible for\n✅ Guides KCC & NABARD loans\n✅ Works fully offline too!\n\nWhat farming challenge can I solve for you today?' },

  { p: ['thank', 'thanks', 'நன்றி', 'शुक्रिया', 'ధన్యవాదాలు', 'super', 'great', 'good job', 'excellent', 'awesome'], nav: null,
    r: '😊 You\'re welcome! Happy farming — may your crops flourish and your yields be high! 🌿\n\nAsk me anything else — I\'m always here.' },

  { p: ['help', 'what can you do', 'features', 'options', 'menu', 'guide', 'how to use'], nav: null,
    r: '💡 ZyCrop AI can help you:\n\n🎙️ VOICE: Tap the mic and speak in Tamil, Hindi, or English\n✍️ TEXT: Type any farming question below\n\nQuick topics:\n• "Open soil lab" → NPK analysis\n• "Market price" → Live APMC rates\n• "Disease scan" → Camera-based detection\n• "Government schemes" → Subsidy finder\n• "Loan advice" → KCC & NABARD\n• "[Crop name]" → Specific crop guide\n• "Spray [disease]" → Treatment dosage' },

  { p: ['water stress', 'wilting', 'drought stress', 'heat stress', 'sunburn crop'], nav: null,
    r: '🌡️ Stress management:\n• Heat stress (>38°C): Irrigate BEFORE 8AM & AFTER 5PM. Avoid sprays between 10AM–4PM.\n• Water stress: Foliar spray KNO3 1% (13:0:45) reduces transpiration.\n• Wilting after transplant: Shade net 50% + Trichoderma drench 4g/L at root zone.\n• Mulching (paddy straw/plastic): Reduces soil temp by 5°C, saves 40% water.' },

  { p: ['intercrop', 'mixed crop', 'companion', 'border crop', 'relay', 'sequence'], nav: null,
    r: '🌿 Intercropping for TN farmers:\n• Sugarcane + Groundnut (in furrows): +₹15,000–20,000 profit/acre\n• Coconut + Banana (under canopy): Optimal use of space\n• Cotton + Marigold (border): Repels pests naturally\n• Tomato + Coriander (4:1 rows): Reduces aphid pressure\n• Paddy + Azolla: Fixes 25–30kg N/ha naturally, saves urea cost' },

  { p: ['seed treatment', 'seed', 'germination', 'seedling', 'nursery', 'soak seed'], nav: null,
    r: '🌱 Seed preparation tips:\n• Treat with Carbendazim 2g/kg + Thiram 3g/kg before sowing (controls soil-borne fungi).\n• Bio-seed treatment: Trichoderma viride 4g/kg + Pseudomonas fluorescens 10g/kg.\n• KNO3 soak: 3g/L for 6–8hrs boosts germination in poor seed lots.\n• Rhizobium inoculant for legumes (groundnut, soybean, pulses) — fixes atmospheric N.\n• Store seeds below 15°C and 40% RH for maximum viability.' },

  { p: ['post harvest', 'storage', 'grading', 'packing', 'cold room', 'shelf life'], nav: null,
    r: '📦 Post-harvest management:\n• Onion: Cure 10–15 days in shade, store in ventilated bags at <30°C. 3–6 month shelf life.\n• Tomato: Maintain 8–12°C cold storage. Grade A/B/C before packing.\n• Grains (paddy, wheat): Dry to <13% moisture. Use sealed bags + aluminium phosphide 3g/qtl.\n• Banana: Ethylene ripening chamber 100ppm for 24hrs for uniform ripening.\n• Vegetables: Wax coating extends shelf life 2–3x for capsicum, cucumber.' },

  { p: ['yield', 'production', 'output', 'harvest', 'ton per acre', 'quintal', 'how much'], nav: null,
    r: '📊 Typical yield targets (TN conditions):\n• Paddy: 5–6 ton/Ha using SRI method. Conventional: 3.5 ton/Ha.\n• Tomato: 25–35 ton/Ha with hybrid + staking.\n• Sugarcane: 80–120 ton/Ha. Spring planting gives best yield.\n• Groundnut: 1.5–2 ton/Ha (pods). Target 25kg/bag shelling ratio.\n• Cotton: 15–20 quintal/acre seed cotton. Bt hybrid varieties.\n• Banana: 30–40 ton/Ha (Grand Naine variety).\n\nSay "open AI scan" to detect yield-reducing diseases early!' },
]

// ─── Smart scored response engine ────────────────────────────────────────────
function smartResponse(text) {
  if (!text) return null
  const t = text.toLowerCase()

  // Score each KB entry by how many and how long the pattern matches are
  let best = null, bestScore = 0
  for (const entry of KB) {
    let score = 0
    for (const p of entry.p) {
      if (t.includes(p)) {
        score += p.length > 5 ? 4 : p.length > 3 ? 2 : 1
      }
    }
    if (score > bestScore) { bestScore = score; best = entry }
  }
  if (bestScore > 0) return best

  // Generic crop-name detection fallback
  const crops = ['maize','corn','wheat','sorghum','millet','soybean','sunflower','potato','brinjal','cucumber','watermelon','mango','coconut','turmeric','ginger']
  for (const c of crops) {
    if (t.includes(c)) return {
      nav: null,
      r: `🌱 ${c.charAt(0).toUpperCase()+c.slice(1)} guidance:\nFor specific ${c} disease, pest, or fertilizer advice, tap "🔬 Disease Scan" to detect problems visually, or "Open Soil Lab" for NPK recommendations. I\'m continuously expanding my ${c} knowledge — type a more specific question like "${c} blight" or "${c} fertilizer"!`,
    }
  }
  return null
}

// ─── System prompt for GPT / Ollama ───────────────────────────────────────
const AI_SYSTEM_PROMPT = `You are ZyCrop AI, a smart bilingual agricultural assistant for Indian farmers, specialized in Tamil Nadu farming. 
Answer CONCISELY in 3-5 sentences. Always include specific: dosage amounts, product names, timings. 
If about a disease, mention treatment chemical + dose. If about government scheme, mention amount/deadline. 
End with one actionable next step. Language: match user's language (Tamil/Hindi/English).`

// ─── GPT-based response (if key available) ───────────────────────────────────
async function getAIResponse(text) {
  // 1. Try OpenAI GPT
  if (OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE') {
    try {
      return await chatWithGPT(AI_SYSTEM_PROMPT, text, 350)
    } catch {}
  }
  // 2. Return null → caller uses local KB
  return null
}

// ─── Waveform bars shown while recording ──────────────────────────────────────
function Waveform({ listening }) {
  const bars = useRef([...Array(7)].map(() => new Animated.Value(0.3))).current
  useEffect(() => {
    if (!listening) {
      bars.forEach(b => Animated.spring(b, { toValue: 0.3, useNativeDriver: true, tension: 100 }).start())
      return
    }
    const anim = Animated.loop(
      Animated.stagger(80, bars.map(b =>
        Animated.sequence([
          Animated.timing(b, { toValue: 0.9, duration: 360, useNativeDriver: true }),
          Animated.timing(b, { toValue: 0.2, duration: 360, useNativeDriver: true }),
        ])
      ))
    )
    anim.start()
    return () => anim.stop()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening])

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 36 }}>
      {bars.map((b, i) => (
        <Animated.View key={i} style={{
          width: 4, height: 28, borderRadius: 4,
          backgroundColor: i === 3 ? '#69f0ae' : 'rgba(105,240,174,0.5)',
          transform: [{ scaleY: b }],
        }} />
      ))}
    </View>
  )
}

// ─── Typing animation while AI thinks ────────────────────────────────────────
function TypingDots() {
  const dots = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current
  useEffect(() => {
    const anim = Animated.loop(
      Animated.stagger(200, dots.map(d =>
        Animated.sequence([
          Animated.timing(d, { toValue: -7, duration: 280, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0,  duration: 280, useNativeDriver: true }),
        ])
      ))
    )
    anim.start()
    return () => anim.stop()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, padding: 10 }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{
          width: 9, height: 9, borderRadius: 5,
          backgroundColor: '#1b5e20',
          transform: [{ translateY: d }],
        }} />
      ))}
    </View>
  )
}

// ─── QUICK CHIPS shown before any conversation ─────────────────────────────
const CHIPS = [
  { label: '🌱 Soil Lab',        cmd: 'open soil lab' },
  { label: '📈 Market Prices',   cmd: 'show market prices' },
  { label: '🔬 Disease Scan',    cmd: 'scan crop disease' },
  { label: '📋 Gov Schemes',     cmd: 'government schemes' },
  { label: '💰 Loan Advice',     cmd: 'loan advisor kcc' },
  { label: '🍅 Tomato Help',     cmd: 'tomato farming tips' },
  { label: '🌾 Paddy Guide',     cmd: 'paddy rice cultivation' },
  { label: '🧪 Fertilizer Dose', cmd: 'fertilizer dosage npk' },
  { label: '📅 Crop Calendar',   cmd: 'open calendar' },
  { label: '🌿 Organic Farming', cmd: 'organic farming tips' },
]

// ─── Main VoiceBot Component ──────────────────────────────────────────────────
export default function VoiceBot({ onNavigate, style }) {
  const { lang, t } = useLang()
  const scrollRef    = useRef(null)
  const recordingRef = useRef(null)
  const textFieldRef = useRef(null)

  const [showSheet,    setShowSheet]    = useState(false)
  const [conversation, setConversation] = useState([])
  const [isListening,  setIsListening]  = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOnline,     setIsOnline]     = useState(true)
  const [textInput,    setTextInput]    = useState('')
  const [hasMicPerm,   setHasMicPerm]   = useState(null)

  // Floating button pulse rings
  const pulse1  = useRef(new Animated.Value(1)).current
  const pulse2  = useRef(new Animated.Value(1)).current
  const animRef = useRef(null)

  useEffect(() => {
    if (isListening) {
      animRef.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulse1, { toValue: 1.8, duration: 700, useNativeDriver: true }),
            Animated.timing(pulse1, { toValue: 1,   duration: 700, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(350),
            Animated.timing(pulse2, { toValue: 2.2, duration: 700, useNativeDriver: true }),
            Animated.timing(pulse2, { toValue: 1,   duration: 700, useNativeDriver: true }),
          ]),
        ])
      )
      animRef.current.start()
    } else {
      animRef.current?.stop()
      Animated.parallel([
        Animated.spring(pulse1, { toValue: 1, useNativeDriver: true }),
        Animated.spring(pulse2, { toValue: 1, useNativeDriver: true }),
      ]).start()
    }
    return () => animRef.current?.stop()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening])

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120)
  }, [conversation, isProcessing])

  // ── Background online status check (non-blocking) ──────────────────────────
  useEffect(() => {
    const runCheck = async () => {
      try {
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), 3000)
        await fetch('https://clients3.google.com/generate_204', { method: 'HEAD', signal: ctrl.signal })
        clearTimeout(timer)
        setIsOnline(true)
      } catch {
        setIsOnline(false)
      }
    }
    runCheck()
    const interval = setInterval(runCheck, 30000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addMsg = useCallback((role, text, nav = null) => {
    setConversation(prev => [...prev, {
      role, text, nav,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }])
  }, [])

  const checkOnline = async () => {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 4000)
      await fetch('https://clients3.google.com/generate_204', { method: 'HEAD', signal: ctrl.signal })
      clearTimeout(timer)
      setIsOnline(true)
      return true
    } catch {
      setIsOnline(false)
      return false
    }
  }

  const requestMicPerm = async () => {
    try {
      const { granted } = await Audio.requestRecordingPermissionsAsync()
      setHasMicPerm(granted)
      return granted
    } catch { return false }
  }

  // ── Deliver a response using smart local KB + optional AI ─────────────────
  const deliverResponse = async (userText, alreadyAdded = true) => {
    setIsProcessing(true)
    if (alreadyAdded) addMsg('user', userText)

    // Pre-compute KB match instantly (no network)
    const match = smartResponse(userText)

    // 1. Use cached isOnline state — no blocking await here
    if (isOnline) {
      try {
        // 6-second cap on GPT to avoid slow-key hangs
        const aiAnswer = await Promise.race([
          getAIResponse(userText),
          new Promise((_, rej) => setTimeout(() => rej(new Error('t/o')), 6000)),
        ])
        if (aiAnswer) {
          addMsg('ai', aiAnswer, match?.nav || null)
          speak(aiAnswer.split('\n')[0], lang, { rate: 0.9 })
          if (match?.nav) setTimeout(() => { setShowSheet(false); onNavigate?.(match.nav) }, 2500)
          setIsProcessing(false)
          return
        }
      } catch {}

      // 2. Try local backend (Ollama) — 5-second cap so we reach KB fast
      try {
        const res = await Promise.race([
          chatAI(userText, lang, 'general'),
          new Promise((_, rej) => setTimeout(() => rej(new Error('t/o')), 5000)),
        ])
        const aiText = res.data?.response
        if (aiText && aiText.length > 4) {
          addMsg('ai', aiText, match?.nav || null)
          speak(aiText.split('\n')[0], lang, { rate: 0.9 })
          if (match?.nav) setTimeout(() => { setShowSheet(false); onNavigate?.(match.nav) }, 2500)
          setIsProcessing(false)
          return
        }
      } catch {}
    }

    // 3. Smart local KB — always works offline
    if (match) {
      addMsg('ai', match.r, match.nav)
      speak(match.r.split('\n')[0], lang, { rate: 0.9 })
      if (match.nav) setTimeout(() => { setShowSheet(false); onNavigate?.(match.nav) }, 2400)
    } else {
      const fallback = `🤔 I didn't fully understand "${userText.slice(0, 40)}...".\n\nTry asking about:\n• A specific crop (tomato, paddy, cotton...)\n• A disease or pest\n• Market prices, schemes, or loans\n• Or tap one of the quick chips below!`
      addMsg('ai', fallback)
      speak("I didn't fully understand that. Please try asking about a specific crop, disease, or farming topic.", lang, { rate: 0.9 })
    }
    setIsProcessing(false)
  }

  const openAssistant = () => {
    setShowSheet(true)
    if (conversation.length === 0) {
      const greet = '👋 Hello! I\'m ZyCrop AI.\n\nAsk me anything about farming — soil, diseases, market prices, schemes, or loans. Tap the mic to speak, or type below!\n\n💡 Tip: Try "tomato blight treatment" or "KCC loan limit".'
      addMsg('ai', greet)
      speak('Hello! I am ZyCrop AI, your smart farming assistant. Ask me anything about crops, diseases, market prices, or government schemes.', lang, { rate: 0.9 })
    }
  }

  // ── Start mic recording ───────────────────────────────────────────────────
  const startListening = async () => {
    stopSpeaking()
    const granted = hasMicPerm ?? await requestMicPerm()
    if (!granted) {
      addMsg('ai', '⚠️ Microphone permission needed. Please allow it in Settings → Apps → ZyCrop → Permissions.')
      return
    }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
      const { recording } = await Audio.Recording.createAsync({
        android: { extension: '.m4a', outputFormat: 2, audioEncoder: 3, sampleRate: 16000, numberOfChannels: 1, bitRate: 64000 },
        ios: { extension: '.m4a', audioQuality: 0x7f, sampleRate: 16000, numberOfChannels: 1, bitRate: 64000, linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false },
        web: {},
      })
      recordingRef.current = recording
      setIsListening(true)
      setTimeout(() => { if (recordingRef.current) stopAndProcess() }, 9000)
    } catch {
      setIsListening(false)
      addMsg('ai', '⚠️ Could not start microphone. Make sure it\'s not in use by another app.')
    }
  }

  // ── Stop + send to Whisper STT backend ────────────────────────────────────
  const stopAndProcess = async () => {
    setIsListening(false)
    if (!recordingRef.current) return
    let uri = null
    try {
      await recordingRef.current.stopAndUnloadAsync()
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false })
      uri = recordingRef.current.getURI()
      recordingRef.current = null
    } catch {
      recordingRef.current = null
    }

    if (!uri) {
      addMsg('ai', '⚠️ Recording failed. Please type your question below.')
      return
    }

    setIsProcessing(true)
    // Use cached isOnline state — no blocking network call here
    if (isOnline) {
      try {
        // 8-second cap — Whisper on local server should complete in <5s
        const res = await Promise.race([
          sendVoiceAudio(uri, lang, 'general'),
          new Promise((_, rej) => setTimeout(() => rej(new Error('t/o')), 8000)),
        ])
        const { transcription, audio_response_text, ai_response_english } = res.data || {}
        const userText = (transcription || '').trim()
        if (userText) addMsg('user', `🎙️ "${userText}"`)
        const aiText = audio_response_text || ai_response_english
        if (aiText) {
          // Backend gave us a full response — use it
          const match = smartResponse(userText)
          addMsg('ai', aiText, match?.nav || null)
          speak(aiText, lang, { rate: 0.9 })
          if (match?.nav) setTimeout(() => { setShowSheet(false); onNavigate?.(match.nav) }, 2400)
          setIsProcessing(false)
          return
        }
        // Backend responded but no AI text — use transcription with local KB
        if (userText) {
          setIsProcessing(false)
          await deliverResponse(userText, false)
          return
        }
      } catch {}
    }

    // Backend unavailable or STT failed — auto-focus text input for fast typing
    setIsProcessing(false)
    addMsg('ai', '🎙️ Couldn\'t transcribe your voice (server may be off).\n\n✍️ Type your question below — local AI answers instantly!')
    setTimeout(() => textFieldRef.current?.focus(), 350)
  }

  // ── Text input submit ─────────────────────────────────────────────────────
  const handleTextSubmit = async () => {
    const text = textInput.trim()
    if (!text || isProcessing) return
    setTextInput('')
    Keyboard.dismiss()
    await deliverResponse(text)
  }

  const navigateTo = (screen) => { setShowSheet(false); onNavigate?.(screen) }
  const handleMicPress = () => { if (isListening) stopAndProcess(); else startListening() }
  const handleClose    = () => { if (isListening) stopAndProcess(); setShowSheet(false) }

  const renderBubble = (msg, idx) => {
    const isUser = msg.role === 'user'
    return (
      <View key={idx} style={[S.bubbleRow, isUser && S.bubbleRowUser]}>
        {!isUser && (
          <View style={S.aiAvatar}>
            <Text style={{ fontSize: 15 }}>🌱</Text>
          </View>
        )}
        <View style={[S.bubble, isUser ? S.bubbleUser : S.bubbleAI]}>
          <Text style={[S.bubbleTxt, isUser && S.bubbleTxtUser]}>{msg.text}</Text>
          {msg.nav && (
            <TouchableOpacity style={S.navBtn} onPress={() => navigateTo(msg.nav)}>
              <Text style={S.navBtnTxt}>Open {msg.nav.replace(/([A-Z])/g, ' $1').trim()}</Text>
              <MaterialCommunityIcons name="chevron-right" size={13} color="white" />
            </TouchableOpacity>
          )}
          <Text style={[S.bubbleTime, isUser && { color: 'rgba(255,255,255,0.55)' }]}>{msg.time}</Text>
        </View>
      </View>
    )
  }

  const hasKey = OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE'

  return (
    <>
      {/* ── Floating button ── */}
      <View style={[S.container, style]}>
        <Animated.View style={[S.ring, S.ring2, { transform: [{ scale: pulse2 }] }]} />
        <Animated.View style={[S.ring, S.ring1, { transform: [{ scale: pulse1 }] }]} />
        <TouchableOpacity
          style={[S.micBtn, isListening && S.micBtnActive]}
          onPress={showSheet ? handleMicPress : openAssistant}
          onLongPress={() => speakDashboardGreeting(lang)}
          activeOpacity={0.85}
        >
          {isListening
            ? <MaterialCommunityIcons name="microphone-off" size={30} color="white" />
            : <MaterialCommunityIcons name="star-outline" size={26} color="white" />
          }
        </TouchableOpacity>
        <Text style={S.botLabel}>{isListening ? 'Listening...' : (t.askAI || 'Ask ZyCrop AI')}</Text>
        <Text style={S.hintTxt}>Tap to chat · Hold for greeting</Text>
      </View>

      {/* ── Full AI Chat Modal ── */}
      <Modal
        visible={showSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={S.fullScreen}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={S.header}>
            <View style={S.headerLeft}>
              <View style={S.headerAvatar}><Text style={{ fontSize: 22 }}>🌱</Text></View>
              <View>
                <View style={S.headerTitleRow}>
                  <Text style={S.headerTitle}>ZyCrop AI</Text>
                  {hasKey && (
                    <View style={S.gptBadge}><Text style={S.gptBadgeTxt}>GPT</Text></View>
                  )}
                </View>
                <View style={S.statusRow}>
                  {isOnline
                    ? <><MaterialCommunityIcons name="wifi" size={10} color="#69f0ae" /><Text style={S.statusOnline}>Online · Smart AI Active</Text></>
                    : <><MaterialCommunityIcons name="wifi-off" size={10} color="#ff7043" /><Text style={S.statusOffline}>Offline · Local KB</Text></>
                  }
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={S.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Chat area */}
          <ScrollView
            ref={scrollRef}
            style={S.chatArea}
            contentContainerStyle={S.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {conversation.length === 0 && (
              <View style={S.emptyChat}>
                <Text style={{ fontSize: 52 }}>🌾</Text>
                <Text style={S.emptyChatTitle}>ZyCrop AI is ready!</Text>
                <Text style={S.emptyChatTxt}>Tap a quick topic below or type any farming question</Text>
              </View>
            )}
            {conversation.map(renderBubble)}
            {isProcessing && (
              <View style={S.bubbleRow}>
                <View style={S.aiAvatar}><Text style={{ fontSize: 15 }}>🌱</Text></View>
                <View style={[S.bubble, S.bubbleAI, { paddingVertical: 0 }]}>
                  <TypingDots />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Waveform strip while recording */}
          {isListening && (
            <View style={S.waveformBar}>
              <View style={S.recDot} />
              <Waveform listening={isListening} />
              <Text style={S.waveformTxt}>Listening… tap mic to stop</Text>
            </View>
          )}

          {/* Input bar */}
          <View style={S.inputBar}>
            <TextInput
              ref={textFieldRef}
              style={S.textInput}
              placeholder={isListening ? 'Recording...' : 'Ask anything — soil, disease, schemes, loans...'}
              placeholderTextColor="#b0b0b0"
              value={textInput}
              onChangeText={setTextInput}
              editable={!isListening && !isProcessing}
              returnKeyType="send"
              onSubmitEditing={handleTextSubmit}
              multiline={false}
            />
            {textInput.trim().length > 0
              ? (
                <TouchableOpacity
                  style={[S.sendBtn, isProcessing && { opacity: 0.5 }]}
                  onPress={handleTextSubmit}
                  disabled={isProcessing}
                >
                  <MaterialCommunityIcons name="send" size={18} color="white" />
                </TouchableOpacity>
              )
              : (
                <TouchableOpacity
                  style={[S.micBtnSm, isListening && S.micBtnSmActive]}
                  onPress={handleMicPress}
                  disabled={isProcessing}
                >
                  {isListening ? <MaterialCommunityIcons name="microphone-off" size={20} color="white" /> : <MaterialCommunityIcons name="microphone" size={20} color="white" />}
                </TouchableOpacity>
              )
            }
          </View>

          {/* Quick chips */}
          {!isListening && !isProcessing && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={S.chipsScroll}
              contentContainerStyle={S.chipsRow}
            >
              {CHIPS.map(({ label, cmd }) => (
                <TouchableOpacity
                  key={label}
                  style={[S.chip, isProcessing && { opacity: 0.5 }]}
                  onPress={() => {
                    if (isProcessing) return
                    setTimeout(() => deliverResponse(cmd), 80)
                  }}
                  disabled={isProcessing}
                >
                  <Text style={S.chipTxt}>{label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

const S = StyleSheet.create({
  // Floating
  container: { alignItems: 'center', gap: 8 },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 2 },
  ring1: { width: 80, height: 80, borderColor: 'rgba(27,94,32,0.22)' },
  ring2: { width: 80, height: 80, borderColor: 'rgba(27,94,32,0.1)' },
  micBtn: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#1b5e20',
    justifyContent: 'center', alignItems: 'center',
    elevation: 14, shadowColor: '#1b5e20', shadowOpacity: 0.55,
    shadowOffset: { width: 0, height: 10 }, shadowRadius: 18,
  },
  micBtnActive: { backgroundColor: '#c62828', shadowColor: '#c62828' },
  botLabel: { fontWeight: '800', fontSize: 15, color: '#1b5e20' },
  hintTxt: { fontSize: 10, color: '#9e9e9e', fontWeight: '500' },

  // Full screen
  fullScreen: { flex: 1, backgroundColor: '#edf2ed' },

  // Header
  header: {
    backgroundColor: '#0d3314', paddingTop: 52, paddingBottom: 16,
    paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10,
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(105,240,174,0.12)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(105,240,174,0.3)',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  gptBadge: { backgroundColor: 'rgba(105,240,174,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(105,240,174,0.4)' },
  gptBadgeTxt: { color: '#69f0ae', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusOnline: { color: '#69f0ae', fontSize: 10, fontWeight: '700' },
  statusOffline: { color: '#ff7043', fontSize: 10, fontWeight: '700' },
  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center',
  },

  // Chat
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 8, gap: 10 },
  emptyChat: { alignItems: 'center', paddingTop: 52, gap: 10, opacity: 0.75 },
  emptyChatTitle: { fontSize: 18, fontWeight: '900', color: '#1b5e20' },
  emptyChatTxt: { fontSize: 13, color: '#666', fontWeight: '600', textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },

  // Bubbles
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  bubbleRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    borderWidth: 1, borderColor: '#c8e6c9',
  },
  bubble: {
    maxWidth: '78%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 6,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
  },
  bubbleAI: { backgroundColor: 'white', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  bubbleUser: { backgroundColor: '#1b5e20', borderBottomRightRadius: 4 },
  bubbleTxt: { fontSize: 14, color: '#1a1a1a', lineHeight: 22 },
  bubbleTxtUser: { color: 'white' },
  bubbleTime: { fontSize: 10, color: '#bbb', alignSelf: 'flex-end' },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#1b5e20', borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start', marginTop: 2,
  },
  navBtnTxt: { color: 'white', fontSize: 12, fontWeight: '800' },

  // Waveform
  waveformBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#0d3314', paddingHorizontal: 20, paddingVertical: 12,
  },
  recDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ff5252' },
  waveformTxt: { color: '#a5d6a7', fontSize: 12, fontWeight: '600', flex: 1 },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#e8f5e9',
    elevation: 8, shadowColor: '#1b5e20', shadowOpacity: 0.08, shadowOffset: { width: 0, height: -4 }, shadowRadius: 8,
  },
  textInput: {
    flex: 1, backgroundColor: '#f8faf8', borderRadius: 26,
    paddingHorizontal: 18, paddingVertical: 11,
    fontSize: 14, color: '#1a1a1a', fontWeight: '500',
    borderWidth: 1.5, borderColor: '#dce8dc',
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#1b5e20',
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#1b5e20', shadowOpacity: 0.45,
  },
  micBtnSm: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#1b5e20',
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#1b5e20', shadowOpacity: 0.45,
  },
  micBtnSmActive: { backgroundColor: '#c62828', shadowColor: '#c62828' },

  // Chips
  chipsScroll: { backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f0f5f0' },
  chipsRow: { paddingHorizontal: 12, paddingVertical: 9, gap: 8, flexDirection: 'row' },
  chip: {
    backgroundColor: '#e8f5e9', borderRadius: 22,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: '#b9deba',
  },
  chipTxt: { fontSize: 12, fontWeight: '700', color: '#1b5e20' },
})
