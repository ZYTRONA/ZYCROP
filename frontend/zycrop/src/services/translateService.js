/**
 * translateService.js — ZyCrop Translation Engine v6
 * ====================================================
 * Translates each string INDIVIDUALLY (no batch separator tricks).
 * Concurrency: up to 6 requests in parallel.
 * Primary:   Google Translate unofficial endpoint
 * Secondary: MyMemory API
 * Cache:     In-memory Map (instant) + AsyncStorage (persisted)
 *
 * v6 removes the fragile |||ZC||| batch-separator approach that caused
 * separator text to appear literally in the rendered UI.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'

const CACHE_PREFIX = 'zycrop_tx_v6_'   // bump = auto-busts all v5 corrupted caches
const memCache = new Map()              // in-process instant cache
const CONCURRENCY = 6                   // max parallel translation requests

// ── Google Translate: single string ───────────────────────────────────────────
async function _googleSingle(text, tl) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`
  const ctrl = new AbortController()
  const tid = setTimeout(() => ctrl.abort(), 7000)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(tid)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const translated = data?.[0]?.map(c => c?.[0]).filter(Boolean).join('') || ''
    if (!translated) throw new Error('empty')
    return translated
  } catch (e) {
    clearTimeout(tid)
    throw e
  }
}

// ── MyMemory: single string fallback ─────────────────────────────────────────
async function _myMemorySingle(text, tl) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 495))}&langpair=en|${tl}`
  const ctrl = new AbortController()
  const tid = setTimeout(() => ctrl.abort(), 6000)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(tid)
    const data = await res.json()
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText
    }
    throw new Error('bad status')
  } catch (e) {
    clearTimeout(tid)
    throw e
  }
}

// ── Controlled concurrency runner ─────────────────────────────────────────────
async function runWithConcurrency(tasks, limit) {
  const results = new Array(tasks.length)
  let idx = 0
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/** Translate a single string. Cached (memory + disk). Falls back: Google → MyMemory → original. */
export async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string' || targetLang === 'en') return text
  const cacheKey = `${targetLang}:${text}`
  if (memCache.has(cacheKey)) return memCache.get(cacheKey)
  let result = text
  try {
    result = await _googleSingle(text, targetLang)
  } catch {
    try { result = await _myMemorySingle(text, targetLang) } catch {}
  }
  memCache.set(cacheKey, result)
  return result
}

/** Translate all keys in the English translations object. Concurrent, progress-tracked. */
export async function translateAllKeys(enStrings, targetLang, onProgress) {
  const keys = Object.keys(enStrings)
  const result = { ...enStrings }
  let done = 0
  const tasks = keys.map(key => async () => {
    if (key !== 'brand') {
      result[key] = await translateText(enStrings[key], targetLang)
    }
    done++
    if (onProgress) onProgress(done, keys.length)
  })
  await runWithConcurrency(tasks, CONCURRENCY)
  return result
}

/** Translate an array of strings with concurrency + cache. */
export async function translateMany(texts, targetLang) {
  if (!texts?.length || targetLang === 'en') return texts
  return runWithConcurrency(texts.map(text => () => translateText(text, targetLang)), CONCURRENCY)
}

// ── AsyncStorage cache helpers ────────────────────────────────────────────────
export async function getCachedTranslation(lang) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + lang)
    if (raw) {
      const obj = JSON.parse(raw)
      // Reject any cache that contains the old |||ZC||| corruption
      if (Object.values(obj).some(v => typeof v === 'string' && v.includes('|||ZC|||'))) {
        await AsyncStorage.removeItem(CACHE_PREFIX + lang)
        return null
      }
      Object.entries(obj).forEach(([k, v]) => memCache.set(`${lang}:${k}`, v))
      return obj
    }
  } catch {}
  return null
}

export async function cacheTranslation(lang, obj) {
  try { await AsyncStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(obj)) } catch {}
}

export async function clearLangCache(lang) {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + lang)
    for (const k of memCache.keys()) { if (k.startsWith(`${lang}:`)) memCache.delete(k) }
  } catch {}
}

export async function clearAllCaches() {
  try {
    const keys = await AsyncStorage.getAllKeys()
    await AsyncStorage.multiRemove(keys.filter(k => k.startsWith('zycrop_tx_')))
    memCache.clear()
  } catch {}
}
