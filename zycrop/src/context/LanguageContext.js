import React, {
  createContext, useState, useContext, useEffect, useCallback,
} from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { translations } from '../constants/translations'
import {
  translateAllKeys, getCachedTranslation, cacheTranslation,
} from '../services/translateService'

// ─── Languages config ────────────────────────────────────────────────────────
export const LANGUAGES = [
  { code: 'en', label: 'English',   native: 'English',  flag: '🇬🇧' },
  { code: 'ta', label: 'Tamil',     native: 'தமிழ்',    flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi',     native: 'हिंदी',     flag: '🇮🇳' },
  { code: 'te', label: 'Telugu',    native: 'తెలుగు',   flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
]

const LANG_KEY = 'zycrop_lang_v2'
const LanguageContext = createContext()

function LangLoadingOverlay({ lang, progress, total }) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0
  const langObj = LANGUAGES.find(l => l.code === lang)
  return (
    <Modal visible transparent animationType="fade">
      <View style={S.overlay}>
        <View style={S.card}>
          <Text style={S.flag}>{langObj?.flag ?? '🌐'}</Text>
          <Text style={S.title}>Loading {langObj?.native ?? lang}</Text>
          <Text style={S.sub}>AI is translating the app...</Text>
          <View style={S.barWrap}>
            <View style={[S.barFill, { width: `${pct}%` }]} />
          </View>
          <Text style={S.pct}>{pct}%</Text>
          <ActivityIndicator color="#1b5e20" style={{ marginTop: 8 }} />
        </View>
      </View>
    </Modal>
  )
}

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState('en')
  const [t, setT] = useState(translations.en)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressTotal, setProgressTotal] = useState(0)

  // Restore saved language on boot
  useEffect(() => {
    ;(async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_KEY)
        if (saved && LANGUAGES.some(l => l.code === saved)) {
          await applyLang(saved, false)
        }
      } catch {}
    })()
  }, [])

  const applyLang = useCallback(async (code, persist = true) => {
    if (persist) {
      try { await AsyncStorage.setItem(LANG_KEY, code) } catch {}
    }

    // Fast path: built-in static translations
    if (translations[code]) {
      setT(translations[code])
      setLangState(code)
      return
    }

    // Check AsyncStorage cache (for dynamically translated languages)
    const cached = await getCachedTranslation(code)
    if (cached) {
      setT(cached)
      setLangState(code)
      return
    }

    // AI translation via MyMemory API
    setLoading(true)
    setProgress(0)
    const enKeys = translations.en
    const total = Object.keys(enKeys).length
    setProgressTotal(total)
    try {
      const translated = await translateAllKeys(enKeys, code, (done, all) => {
        setProgress(done)
        setProgressTotal(all)
      })
      await cacheTranslation(code, translated)
      setT(translated)
      setLangState(code)
    } catch {
      setT(translations.en)
      setLangState('en')
    } finally {
      setLoading(false)
    }
  }, [])

  const changeLang = useCallback((code) => applyLang(code, true), [applyLang])

  // Translate a single dynamic string (API responses) to current app language
  const translateText = useCallback(async (text) => {
    if (!text || lang === 'en') return text
    try {
      const { translateText: apiTx } = await import('../services/translateService')
      return await apiTx(text, lang)
    } catch {
      return text
    }
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t, loading, translateText }}>
      {loading && (
        <LangLoadingOverlay lang={lang} progress={progress} total={progressTotal} />
      )}
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)

const S = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 32, alignItems: 'center', width: 280, gap: 10, elevation: 20 },
  flag: { fontSize: 48, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '900', color: '#1a1a1a' },
  sub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  barWrap: { width: '100%', height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  barFill: { height: '100%', backgroundColor: '#1b5e20', borderRadius: 4 },
  pct: { fontSize: 13, fontWeight: '700', color: '#1b5e20' },
})
