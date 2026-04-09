import axios from 'axios'

// ─── API Configuration ───────────────────────────────────────
// For Android emulator (local machine): use 10.0.2.2
// For physical device on LAN: use actual machine IP (e.g., 192.168.x.x)
// For production: use your deployed backend URL
const BASE_URL = 'http://10.0.2.2:8000/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request/Response interceptors for global error logging ──────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message || 'Network error'
    console.error('API Error:', msg, err.code)
    return Promise.reject(new Error(msg))
  }
)

/**
 * POST /api/diagnose
 * Sends leaf image as multipart/form-data
 * Returns: { disease, confidence, severity, treatment_plan, fertilizer, timing, organic_alt }
 */
export const uploadImage = async (imageUri, farmerId = 'TN-CBE-9021') => {
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

/**
 * POST /api/soil-analyze-image
 * Sends soil photo for vision-based HSV color classification.
 * Returns: { soilType, npk, topCrops, fertilizers[], organicFertilizers[], waterLitersPerAcrePerDay, warning }
 */
export const uploadImageForSoil = async (imageUri, farmerId = 'TN-CBE-9021') => {
  const formData = new FormData()
  formData.append('file', { uri: imageUri, name: 'soil.jpg', type: 'image/jpeg' })
  formData.append('farmer_id', farmerId)
  return apiClient.post('/soil-analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
}

/**
 * POST /api/pest-detect
 * Sends plant photo for color-pattern pest identification.
 * Returns: { pestName, scientificName, severity, damagePattern, treatment_plan, organic_alt, prevention, spray_schedule }
 */
export const uploadImageForPest = async (imageUri, farmerId = 'TN-CBE-9021', crop = '') => {
  const formData = new FormData()
  formData.append('file', { uri: imageUri, name: 'plant.jpg', type: 'image/jpeg' })
  formData.append('farmer_id', farmerId)
  formData.append('crop', crop)
  return apiClient.post('/pest-detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
}

/**
 * POST /api/nutrient-detect
 * Sends leaf photo for HSV-based nutrient deficiency detection.
 * Returns: { nutrient, symptoms, severity, cause, correction_chemical, correction_organic, prevention }
 */
export const uploadImageForNutrient = async (imageUri, farmerId = 'TN-CBE-9021') => {
  const formData = new FormData()
  formData.append('file', { uri: imageUri, name: 'leaf.jpg', type: 'image/jpeg' })
  formData.append('farmer_id', farmerId)
  return apiClient.post('/nutrient-detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
}

/**
 * GET /api/market?crop=name&location=Coimbatore
 * Returns: { crop, current_price, unit, forecast_trend, advice, trend_up, updated_at }
 */
export const getMarketPrice = (crop) =>
  apiClient.get('/market', { params: { crop, location: 'Coimbatore' } })

/**
 * POST /api/soil-analysis
 * Body: { nitrogen, phosphorus, potassium, ph, farmer_id }
 * Returns: { soilType, location, bestCrop, fertilizers[], warning? }
 */
export const analyzeSoil = (payload) =>
  apiClient.post('/soil-analysis', payload)

/**
 * POST /api/schemes
 * Body: { query: string }
 * Returns: { schemes: Array<{ id, name, benefit, eligibility, amount, deadline }>, count }
 */
export const searchSchemes = (query) =>
  apiClient.post('/schemes', { query })

/**
 * POST /api/loan-advisor
 * Body: { text: string, language: 'en' | 'ta' | 'hi' }
 * Returns: { response: string, language: string }
 */
export const getLoanAdvice = (message, lang = 'en') =>
  apiClient.post('/loan-advisor', { text: message, language: lang })

/**
 * GET /api/passport/logs?farmer_id=TN-CBE-9021&limit=20
 * Returns: { logs: Array<{ _id, event_type, date, note, icon_color, timestamp }>, count }
 */
export const getPassportLogs = (farmerId = 'TN-CBE-9021', limit = 20) =>
  apiClient.get('/passport/logs', { params: { farmer_id: farmerId, limit } })

/**
 * POST /api/passport/log
 * Body: { farmer_id, event_type, date, note, icon_color }
 * Returns: { id: string, message: string }
 */
export const addPassportLog = (log) =>
  apiClient.post('/passport/log', log)

/**
 * DELETE /api/passport/log/:id
 * Returns: { message: string }
 */
export const deletePassportLog = (logId) =>
  apiClient.delete(`/passport/log/${logId}`)

/**
 * POST /api/voice/translate  — STT + translation (faster-whisper → IndicTrans2 → Bhashini fallback)
 * Body: { text?, audio_base64?, source_language, target_language }
 * Returns: { transcription, translated_text, intent, mode }
 */
export const voiceTranslate = (text, sourceLang = 'ta', targetLang = 'en') =>
  apiClient.post('/voice/translate', {
    text,
    source_language: sourceLang,
    target_language: targetLang,
  })

/**
 * POST /api/voice  — Full audio pipeline: faster-whisper STT + IndicTrans2 + Ollama LLM
 * Accepts: multipart/form-data with 'audio' field (WAV/MP3/M4A)
 * Params:  src_lang (ta/hi/en), tgt_lang (en), context (loan/subsidy/general)
 * Returns: { transcription, language, english_text, ai_response_english,
 *            audio_response_text, stt_model, nmt_model, llm_model }
 * Usage: App speaks audio_response_text via expo-speech (react-native-tts compatible)
 */
export const sendVoiceAudio = async (audioUri, srcLang = 'ta', context = 'loan') => {
  const formData = new FormData()
  formData.append('audio', {
    uri:  audioUri,
    name: 'voice.wav',
    type: 'audio/wav',
  })
  return apiClient.post(`/voice?src_lang=${srcLang}&context=${context}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 40000, // Whisper + Ollama can take ~10s on first run
  })
}

/**
 * POST /api/chat  — Ollama qwen2.5:0.5b AI chat (Loan Advisor + Subsidy Finder)
 * Body: { message, language, context, crop?, acres? }
 * Returns: { response, model, language, intent }
 * Falls back to keyword-intent response if Ollama is not running.
 */
export const chatAI = (message, lang = 'en', context = 'loan', crop = null, acres = null) =>
  apiClient.post('/chat', { message, language: lang, context, crop, acres })

/**
 * GET /api/schemes?q=query
 * Returns: { schemes, count, model }
 */
export const searchSchemesGet = (query, topK = 5) =>
  apiClient.get('/schemes', { params: { q: query, top_k: topK } })

/**
 * GET /api/land-lookup?survey_number=TN-CBE-1234
 * Returns: { survey_number, owner_name, district, village, taluk, extent, land_type,
 *             crops, encumbrance, patta_number, registered_date }
 */
export const landLookup = (surveyNumber) =>
  apiClient.get('/land-lookup', { params: { survey_number: surveyNumber } })

/**
 * POST /api/pest-alert/report
 * Body: { crop, disease, pincode, lat?, lon? }
 * Returns: { status, outbreak, count, message }
 */
export const reportPestAlert = (payload) =>
  apiClient.post('/pest-alert/report', payload)

/**
 * GET /api/pest-alert/nearby?pincode=641001
 * Returns: { pincode, clusters: [{ disease, crop, pincode, reports, severity, color, bg }], total }
 */
export const getNearbyPestAlerts = (pincode) =>
  apiClient.get('/pest-alert/nearby', { params: { pincode } })

export default apiClient
