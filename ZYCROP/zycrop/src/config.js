// ─── ZYCROP API Configuration ────────────────────────────────────────────────
// Backend API for YOLOv8 + Disease Detection
// Development: Replace with your machine IP (e.g., http://192.168.1.100:8000)
// Update this to match your backend server address
export const BACKEND_API_URL = 'http://127.0.0.1:8000'

// Paste your OpenAI API key below (starts with sk-)
// Get one at: https://platform.openai.com/api-keys
export const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'

// Model: gpt-4o-mini is fast & cheap; use gpt-3.5-turbo as fallback
export const OPENAI_MODEL = 'gpt-4o-mini'
