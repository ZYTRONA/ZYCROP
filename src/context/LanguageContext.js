import React, {
  createContext, useState, useContext, useEffect, useCallback, useRef,
} from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Modal, Animated } from 'react-native'
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
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [pulse])

  return (
    <Modal visible transparent animationType="fade">
      <View style={S.overlay}>
        {/* Decorative blobs */}
        <View style={S.blob1} />
        <View style={S.blob2} />
        <View style={S.card}>
          <Animated.Text style={[S.flag, { transform: [{ scale: pulse }] }]}>
            {langObj?.flag ?? '🌐'}
          </Animated.Text>
          <View style={S.badge}>
            <Text style={S.badgeTxt}>AI TRANSLATING</Text>
          </View>
          <Text style={S.title}>Switching to</Text>
          <Text style={S.langName}>{langObj?.native ?? lang}</Text>
          <Text style={S.sub}>Translating all screens in real-time...</Text>
          <View style={S.barWrap}>
            <Animated.View style={[S.barFill, { width: `${pct}%` }]} />
            <View style={[S.barGlow, { left: `${Math.max(0, pct - 6)}%` }]} />
          </View>
          <View style={S.pctRow}>
            <ActivityIndicator color="#69f0ae" size="small" />
            <Text style={S.pct}>{pct}% complete</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState('en')
  const [t, setT] = useState(translations.en)
  const [loading, setLoading] = useState(false)
  const [targetLang, setTargetLang] = useState('en')
  const [progress, setProgress] = useState(0)
  const [progressTotal, setProgressTotal] = useState(0)

  // Restore saved language on boot
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_KEY)
        if (saved && LANGUAGES.some(l => l.code === saved)) {
          await applyLang(saved, false)
        }
      } catch {}
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setTargetLang(code)
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
    <LanguageContext.Provider value={{ lang, currentLanguage: lang, setLang: changeLang, setLanguage: changeLang, t, loading, translateText }}>
      {loading && (
        <LangLoadingOverlay lang={targetLang} progress={progress} total={progressTotal} />
      )}
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)

const S = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#071a09',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blob1: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(46,125,50,0.22)', top: -80, right: -80,
  },
  blob2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(27,94,32,0.18)', bottom: 40, left: -60,
  },
  card: {
    backgroundColor: '#0d2e10',
    borderRadius: 32,
    padding: 36,
    alignItems: 'center',
    width: 300,
    gap: 12,
    elevation: 30,
    borderWidth: 1,
    borderColor: 'rgba(105,240,174,0.15)',
    shadowColor: '#69f0ae',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
  },
  flag: { fontSize: 64, marginBottom: 4 },
  badge: {
    backgroundColor: 'rgba(105,240,174,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(105,240,174,0.3)',
  },
  badgeTxt: {
    color: '#69f0ae',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: { fontSize: 14, fontWeight: '600', color: '#a5d6a7', letterSpacing: 0.5 },
  langName: { fontSize: 30, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5, marginTop: -4 },
  sub: { fontSize: 12, color: '#558b2f', textAlign: 'center', lineHeight: 19 },
  barWrap: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
    position: 'relative',
  },
  barFill: { height: '100%', backgroundColor: '#69f0ae', borderRadius: 3 },
  barGlow: {
    position: 'absolute',
    width: 20,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
  },
  pctRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  pct: { fontSize: 13, fontWeight: '700', color: '#69f0ae' },
})
