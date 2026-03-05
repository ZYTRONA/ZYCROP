import axios from 'axios'

// ─── Replace with your machine's LAN IP when running the FastAPI server ───────
const BASE_URL = 'http://10.81.17.1:8000/api'

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

export default apiClient
