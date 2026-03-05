import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── Unofficial Google Translate API ────────────────────────────────────────
// Uses the same endpoint as the Python googletrans library — no API key needed
const GTRANS_URL = 'https://translate.googleapis.com/translate_a/single'

// Cache prefix in AsyncStorage
const CACHE_PREFIX = 'zycrop_translation_v3_'

/**
 * Translate a single string from English to target language via Google Translate
 * Falls back to original text on failure
 */
export async function translateText(text, targetLang) {
  if (!text || targetLang === 'en') return text
  try {
    const url = `${GTRANS_URL}?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const data = await res.json()
    // data[0] is an array of translation segments — join them all
    const translated = data?.[0]?.map(chunk => chunk?.[0]).filter(Boolean).join('')
    if (translated) return translated
  } catch {
    // Network error — return original
  }
  return text
}

/**
 * Translate all keys of an English translations object into targetLang.
 * Batches in groups of 20 (Google Translate handles higher concurrency).
 * Returns the translated object.
 */
export async function translateAllKeys(enStrings, targetLang, onProgress) {
  const keys = Object.keys(enStrings)
  const result = {}
  const BATCH = 20

  for (let i = 0; i < keys.length; i += BATCH) {
    const batch = keys.slice(i, i + BATCH)
    const promises = batch.map(async (key) => {
      const val = enStrings[key]
      // Skip brand name — keep as-is
      if (key === 'brand') {
        result[key] = val
        return
      }
      result[key] = await translateText(val, targetLang)
    })
    await Promise.all(promises)
    if (onProgress) onProgress(Math.min(i + BATCH, keys.length), keys.length)
    // Small delay between batches to avoid hitting rate limits
    if (i + BATCH < keys.length) await new Promise(r => setTimeout(r, 150))
  }

  return result
}

/**
 * Get cached translations for a language from AsyncStorage.
 * Returns null if not cached.
 */
export async function getCachedTranslation(lang) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + lang)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

/**
 * Save translated strings to AsyncStorage cache for a language.
 */
export async function cacheTranslation(lang, translatedObj) {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(translatedObj))
  } catch {}
}

/**
 * Clear cached translations for a specific language (for refresh)
 */
export async function clearLangCache(lang) {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + lang)
  } catch {}
}

/**
 * Clear all translation caches
 */
export async function clearAllCaches() {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX))
    await AsyncStorage.multiRemove(cacheKeys)
  } catch {}
}
