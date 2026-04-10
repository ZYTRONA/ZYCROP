import { NativeModules, Platform } from 'react-native'

// ─── ZYCROP API Configuration ────────────────────────────────────────────────
// Backend API for YOLOv8 + Disease Detection
// In Expo dev, derive host IP from Metro bundle URL so phone + backend stay in sync.
const getDevServerHost = () => {
  const scriptURL = NativeModules?.SourceCode?.scriptURL || ''
  const match = scriptURL.match(/https?:\/\/([^/:]+)/)
  return match?.[1] || null
}

const devHost = getDevServerHost()
const defaultLanBackendUrl = 'http://10.145.74.160:8888'
const devBackendUrl = devHost
  ? `http://${devHost}:8888`
  : Platform.OS === 'android'
    ? defaultLanBackendUrl
    : 'http://127.0.0.1:8888'

export const BACKEND_API_URL =
  process.env.EXPO_PUBLIC_BACKEND_API_URL || devBackendUrl

// Paste your OpenAI API key below (starts with sk-)
// Get one at: https://platform.openai.com/api-keys
export const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'

// Model: gpt-4o-mini is fast & cheap; use gpt-3.5-turbo as fallback
export const OPENAI_MODEL = 'gpt-4o-mini'
