import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, Animated,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Search, FileCheck, CheckCircle, AlertCircle, ArrowLeft, Zap } from 'lucide-react-native'
import { chatWithGPT, SCHEMES_SYSTEM_PROMPT } from '../services/openaiService'
import { useLang } from '../context/LanguageContext'
import LanguageMenu from '../components/LanguageMenu'

// Fallback local schemes shown before any search
const DEFAULT_SCHEMES = [
  { id: '1', name: 'PM-KISAN', benefit: '₹6,000/year direct income support', eligibility: 'Small & marginal farmers with land records', amount: '₹6,000 per year', deadline: 'Ongoing' },
  { id: '2', name: 'PM-Kusum Scheme', benefit: '60% subsidy on solar pumps', eligibility: 'Land records + water source proof', amount: 'Up to ₹2.5 Lakh', deadline: 'Mar 31, 2026' },
  { id: '3', name: 'Fasal Bima Yojana', benefit: 'Crop insurance at 2% premium', eligibility: 'Loanee & non-loanee farmers', amount: 'Full crop value coverage', deadline: 'Apr 15, 2026' },
  { id: '4', name: 'Uzhavar Sandhai', benefit: 'Free transport to farmer markets', eligibility: 'Tamil Nadu farmers with FarmerID', amount: 'Transport support', deadline: 'Ongoing' },
  { id: '5', name: 'Soil Health Card', benefit: 'Free soil testing & advisory', eligibility: 'All farmers', amount: 'Free service', deadline: 'Ongoing' },
]

function SchemeCard({ item, t, index }) {
  const anim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, {
        toValue: 1, duration: 380,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1, tension: 60, friction: 9,
        delay: index * 70,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 80, friction: 6 }).start()
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start()

  return (
    <Animated.View
      style={[
        styles.schemeCard,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.schemeHeader}>
        <View style={styles.schemeIcon}>
          <FileCheck color="#1b5e20" size={18} />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.schemeName}>{item.name}</Text>
          <Text style={styles.schemeBenefit}>{item.benefit}</Text>
        </View>
      </View>

      <View style={styles.eligRow}>
        <CheckCircle color="#4caf50" size={13} />
        <Text style={styles.eligText}>{item.eligibility}</Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Text style={styles.metaLabel}>{t.amount}</Text>
          <Text style={styles.metaValue}>{item.amount}</Text>
        </View>
        <View style={[styles.metaChip, styles.metaChipAlt]}>
          <Text style={styles.metaLabel}>{t.deadline}</Text>
          <Text style={[styles.metaValue, styles.deadlineVal]}>{item.deadline}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.applyBtn}
        activeOpacity={0.85}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => Alert.alert(t.applyNow, `Opening ${item.name} portal.`)}
      >
        <Zap color="white" size={15} />
        <Text style={styles.applyTxt}>{t.applyNow}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function GovSchemes() {
  const { t, lang, translateText } = useLang()
  const navigation = useNavigation()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [schemes, setSchemes] = useState(DEFAULT_SCHEMES)
  const [searched, setSearched] = useState(false)
  const enSchemesRef = useRef(DEFAULT_SCHEMES)

  // Helper — translates text fields of each scheme object
  const translateSchemes = useCallback(async (rawSchemes) => {
    if (lang === 'en') return rawSchemes
    return Promise.all(rawSchemes.map(async (s) => ({
      ...s,
      benefit: await translateText(s.benefit),
      eligibility: await translateText(s.eligibility),
      amount: await translateText(s.amount),
      deadline: await translateText(s.deadline),
    })))
  }, [lang, translateText])

  // Re-translate displayed schemes whenever the app language changes
  useEffect(() => {
    translateSchemes(enSchemesRef.current).then(setSchemes)
  }, [lang])

  const handleSearch = async () => {
    if (!query.trim()) return
    setError(null)
    setLoading(true)
    setSearched(true)
    try {
      const gptResponse = await chatWithGPT(SCHEMES_SYSTEM_PROMPT, query.trim(), 600)
      const parsed = JSON.parse(gptResponse)
      enSchemesRef.current = parsed
      const translated = await translateSchemes(parsed)
      setSchemes(translated)
    } catch (e) {
      // fallback: filter local list
      const q = query.toLowerCase()
      const filtered = DEFAULT_SCHEMES.filter(
        s => s.name.toLowerCase().includes(q) || s.benefit.toLowerCase().includes(q)
      )
      enSchemesRef.current = filtered
      const translated = await translateSchemes(filtered)
      setSchemes(translated)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.topBar}>
        <View style={[styles.hBlob, { width: 160, height: 160, top: -50, right: -30 }]} />
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
            <ArrowLeft color="white" size={22} />
          </TouchableOpacity>
          <View style={styles.flex1}>
            <Text style={styles.topTitle}>{t.subsidyTitle}</Text>
            <Text style={styles.topSub}>{t.subsidySub}</Text>
          </View>
          <LanguageMenu />
        </View>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchArea}>
        <View style={styles.searchBox}>
          <Search color="#888" size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.schemeSearchPlaceholder}
            placeholderTextColor="#bbb"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="white" size="small" />
            : <Text style={styles.searchBtnTxt}>{t.search}</Text>
          }
        </TouchableOpacity>
      </View>

      {/* ── Error ── */}
      {error && (
        <View style={styles.errorCard}>
          <AlertCircle color="#c62828" size={16} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ── List ── */}
      <FlatList
        data={schemes}
        keyExtractor={item => item.id || item.name}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => <SchemeCard item={item} t={t} index={index} />}
        ListEmptyComponent={
          !loading && <Text style={styles.empty}>{t.noSchemes}</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },

  topBar: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#1b5e20', overflow: 'hidden' },
  hBlob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  flex1: { flex: 1 },
  topTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  topSub: { fontSize: 11, color: '#a5d6a7', marginTop: 2 },

  searchArea: {
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: 'white',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 8,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  searchBtn: {
    backgroundColor: '#1b5e20', paddingHorizontal: 18,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    elevation: 3, shadowColor: '#1b5e20', shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 8,
    minWidth: 70,
  },
  searchBtnTxt: { color: 'white', fontWeight: '800', fontSize: 14 },

  errorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ffebee', margin: 16, padding: 14,
    borderRadius: 14, borderWidth: 1, borderColor: '#ffcdd2',
  },
  errorText: { color: '#c62828', flex: 1, fontSize: 13 },

  list: { padding: 16, gap: 14, paddingBottom: 40 },

  schemeCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 18,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 5 }, shadowRadius: 10,
    gap: 12,
  },
  schemeHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  schemeIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#c8e6c9',
  },
  schemeName: { fontWeight: '900', fontSize: 16, color: '#1b5e20' },
  schemeBenefit: { color: '#388e3c', fontSize: 13, marginTop: 2, fontWeight: '600', lineHeight: 19 },

  eligRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  eligText: { color: '#555', fontSize: 13, flex: 1, lineHeight: 19 },

  metaRow: { flexDirection: 'row', gap: 10 },
  metaChip: {
    flex: 1, backgroundColor: '#f0f4f0', padding: 10, borderRadius: 12,
    borderWidth: 1, borderColor: '#e0e7e0',
  },
  metaChipAlt: { backgroundColor: '#fff8e1', borderColor: '#ffe0b2' },
  metaLabel: { fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' },
  metaValue: { fontSize: 13, fontWeight: '800', color: '#333', marginTop: 3 },
  deadlineVal: { color: '#e65100' },

  applyBtn: {
    backgroundColor: '#1b5e20', padding: 13, borderRadius: 14,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
    elevation: 3, shadowColor: '#1b5e20', shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
  },
  applyTxt: { color: 'white', fontWeight: '800', fontSize: 14 },

  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
})
