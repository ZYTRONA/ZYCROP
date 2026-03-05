import React, { useRef, useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Beaker, FileText, ShieldCheck, Zap, Mic, Leaf, AlertTriangle, TrendingUp, Camera, Droplets, Thermometer, BarChart2 } from 'lucide-react-native'
import { useLang } from '../context/LanguageContext'
import LanguageMenu from '../components/LanguageMenu'

const { width } = Dimensions.get('window')

const CARDS = [
  { id: 'soil', labelKey: 'soilLab', subKey: 'soilSub', icon: Beaker, color: '#2e7d32', bg: '#e8f5e9', route: 'SoilLab' },
  { id: 'schemes', labelKey: 'subsidies', subKey: 'schemesSub', icon: FileText, color: '#1565c0', bg: '#e3f2fd', route: 'GovSchemes' },
  { id: 'passport', labelKey: 'passport', subKey: 'passportCard', icon: ShieldCheck, color: '#6a1b9a', bg: '#f3e5f5', route: 'FarmPassport' },
  { id: 'tips', labelKey: 'tips', subKey: 'tipsSub', icon: TrendingUp, color: '#e65100', bg: '#fff3e0', route: null },
]

const EN_TIPS = [
  'High humidity today — inspect Tomato crops for early blight signs.',
  'Onion prices to rise 12% over next week in Coimbatore mandi.',
  'PM-Kusum solar pump scheme deadline: March 31, 2026.',
  'Optimal sowing window for Groundnut begins in 4 days.',
]

const EN_DASH = {
  soilSub: 'NPK · pH Analysis',
  schemesSub: 'AI RAG Search',
  passportCard: 'Digital Records',
  tipsSub: 'XGBoost Forecast',
  voiceSub: 'Speak in Tamil · Hindi · English',
  farmScore: 'Farm Score',
  scoreWeek: '+3 this week',
  weatherFeel: 'Feels 37°C',
  weatherHumidity: 'Humidity',
  weatherWind: 'Wind NE',
  statRisk: 'Risk',
  statHigh: 'High',
  statAccuracy: 'Accuracy',
  statUpdated: 'Updated',
}

function PulseRing({ size, color, delay }) {
  const anim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size, height: size, borderRadius: size / 2,
        borderWidth: 2, borderColor: color,
        opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0.25, 0] }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
      }}
    />
  )
}

function HoverCard({ children, style, onPress }) {
  const scale = useRef(new Animated.Value(1)).current
  const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 80, friction: 6 }).start()
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start()
  return (
    <TouchableOpacity activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  )
}

export default function Dashboard() {
  const navigation = useNavigation()
  const { lang, t, translateText } = useLang()
  const [tipIdx, setTipIdx] = useState(0)
  const tipAnim = useRef(new Animated.Value(1)).current
  const cardAnims = useRef(CARDS.map(() => new Animated.Value(0))).current
  const scrollY = useRef(new Animated.Value(0)).current

  const [dashUI, setDashUI] = useState(EN_DASH)
  const [tips, setTips] = useState(EN_TIPS)

  const heroTranslate = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  })
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [1, 0.75],
    extrapolate: 'clamp',
  })
  const blob1Translate = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  })

  useEffect(() => {
    if (lang === 'en') { setDashUI(EN_DASH); setTips(EN_TIPS); return }
    const dashKeys = Object.keys(EN_DASH)
    Promise.all([
      ...dashKeys.map(k => translateText(EN_DASH[k])),
      ...EN_TIPS.map(tip => translateText(tip)),
    ]).then(results => {
      const out = {}
      dashKeys.forEach((k, i) => { out[k] = results[i] })
      setDashUI(out)
      setTips(results.slice(dashKeys.length))
    })
  }, [lang])

  useEffect(() => {
    Animated.stagger(90, cardAnims.map(a =>
      Animated.spring(a, { toValue: 1, useNativeDriver: true, tension: 55, friction: 8 })
    )).start()
    const int = setInterval(() => {
      Animated.timing(tipAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setTipIdx(i => (i + 1) % EN_TIPS.length)
        Animated.timing(tipAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start()
      })
    }, 4000)
    return () => clearInterval(int)
  }, [])

  return (
    <Animated.ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
    >

      {/* ── Hero with parallax ── */}
      <Animated.View style={[styles.hero, { transform: [{ translateY: heroTranslate }], opacity: heroOpacity }]}>
        <Animated.View style={[styles.blob, { width: 240, height: 240, top: -70, right: -70, transform: [{ translateY: blob1Translate }] }]} />
        <View style={[styles.blob, { width: 120, height: 120, top: 40, left: -40 }]} />

        <View style={styles.heroRow}>
          <View style={styles.flex1}>
            <Text style={styles.greeting}>{t.greeting}</Text>
            <Text style={styles.brand}>{t.brand}</Text>
            <Text style={styles.brandSub}>{t.subBrand}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <View style={styles.scoreRing}>
              <View style={styles.scoreRingFill} />
              <View style={styles.scoreInner}>
                <Text style={styles.scoreNum}>92</Text>
              </View>
            </View>
            <Text style={styles.scoreLabel}>{dashUI.farmScore}</Text>
            <View style={styles.scoreTrend}>
              <TrendingUp color="#69f0ae" size={10} />
              <Text style={styles.scoreTrendTxt}>{dashUI.scoreWeek}</Text>
            </View>
          </View>
          <LanguageMenu />
        </View>

        <Animated.View style={[styles.ticker, { opacity: tipAnim }]}>
          <AlertTriangle color="#fdd835" size={14} />
          <Text style={styles.tickerText} numberOfLines={1}>{tips[tipIdx]}</Text>
        </Animated.View>
      </Animated.View>

      {/* ── Weather Strip ── */}
      <View style={styles.weatherBar}>
        {[
          { icon: Thermometer, color: '#e53935', label: '34°C', sub: dashUI.weatherFeel },
          { icon: Droplets, color: '#1e88e5', label: '78%', sub: dashUI.weatherHumidity },
          { icon: BarChart2, color: '#43a047', label: '14 km/h', sub: dashUI.weatherWind },
        ].map(({ icon: WIcon, color, label, sub }) => (
          <View key={label} style={styles.weatherItem}>
            <View style={[styles.weatherIconWrap, { backgroundColor: color + '18' }]}>
              <WIcon color={color} size={18} />
            </View>
            <Text style={styles.weatherVal}>{label}</Text>
            <Text style={styles.weatherSub}>{sub}</Text>
          </View>
        ))}
      </View>

      {/* ── Voice ── */}
      <View style={styles.voiceArea}>
        <View style={styles.voiceCenter}>
          <PulseRing size={78} color="#1b5e20" delay={0} />
          <PulseRing size={78} color="#1b5e20" delay={700} />
          <TouchableOpacity style={styles.micBtn} activeOpacity={0.85}>
            <Mic color="white" size={34} />
          </TouchableOpacity>
        </View>
        <Text style={styles.voiceLabel}>{t.askAI}</Text>
        <Text style={styles.voiceSub}>{dashUI.voiceSub}</Text>
      </View>

      {/* ── Modules ── */}
      <Text style={styles.sectionLabel}>{t.solutions}</Text>
      <View style={styles.grid}>
        {CARDS.map((card, i) => {
          const Icon = card.icon
          return (
            <Animated.View
              key={card.id}
              style={{
                width: '48%',
                opacity: cardAnims[i],
                transform: [{ translateY: cardAnims[i].interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) }]
              }}
            >
              <HoverCard
                style={styles.card}
                onPress={() => card.route && navigation.navigate(card.route)}
              >
                <View style={[styles.iconBox, { backgroundColor: card.bg }]}>
                  <Icon color={card.color} size={26} />
                </View>
                <Text style={styles.cardLabel}>{t[card.labelKey]}</Text>
                <Text style={styles.cardSub}>{dashUI[card.subKey]}</Text>
                <View style={[styles.cardAccent, { backgroundColor: card.color }]} />
              </HoverCard>
            </Animated.View>
          )
        })}
      </View>

      {/* ── Daily Brief ── */}
      <Text style={styles.sectionLabel}>{t.todaysBrief}</Text>
      <View style={styles.brief}>
        <View style={styles.briefTop}>
          <Leaf color="#2e7d32" size={17} />
          <Text style={styles.briefTitle}>{t.briefTitle}</Text>
          <View style={styles.live}><Text style={styles.liveTxt}>LIVE</Text></View>
        </View>
        <Text style={styles.briefBody}>{t.briefText}</Text>
        <View style={styles.statsRow}>
          {[
            [dashUI.statRisk, dashUI.statHigh, '#ef5350'],
            [dashUI.statAccuracy, '94%', '#43a047'],
            [dashUI.statUpdated, '6:00 AM', '#1b5e20'],
          ].map(([k, v, c]) => (
            <View key={k} style={styles.statCol}>
              <Text style={styles.statVal}>{v}</Text>
              <Text style={[styles.statKey, { color: c }]}>{k}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Scan CTA ── */}
      <HoverCard
        style={styles.cta}
        onPress={() => navigation.getParent()?.navigate('AI Scan')}
      >
        <View style={styles.ctaIcon}><Camera color="white" size={22} /></View>
        <View style={styles.flex1}>
          <Text style={styles.ctaTitle}>{t.quickScanTitle}</Text>
          <Text style={styles.ctaSub}>{t.quickScanSub}</Text>
        </View>
        <Zap color="#fdd835" size={20} />
      </HoverCard>

      <View style={{ height: 36 }} />
    </Animated.ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f0' },
  scroll: {},

  // Hero
  hero: { backgroundColor: '#1b5e20', paddingTop: 58, paddingHorizontal: 22, paddingBottom: 28, overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: '#a5d6a7', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  brand: { color: 'white', fontSize: 36, fontWeight: '900', letterSpacing: -1.5 },
  brandSub: { color: '#c8e6c9', fontSize: 12, marginTop: 2 },
  scoreBadge: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  scoreRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: 6 },
  scoreRingFill: { position: 'absolute', width: 62, height: 62, borderRadius: 31, borderWidth: 3, borderColor: '#69f0ae', borderTopColor: 'transparent', borderRightColor: 'transparent', transform: [{ rotate: '125deg' }] },
  scoreInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  scoreNum: { color: 'white', fontSize: 22, fontWeight: '900' },
  scoreLabel: { color: '#c8e6c9', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  scoreTrend: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  scoreTrendTxt: { color: '#69f0ae', fontSize: 9, fontWeight: '700' },

  // Weather Bar
  weatherBar: {
    flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white',
    marginHorizontal: 20, marginTop: -18, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 10,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14,
  },
  weatherItem: { alignItems: 'center', gap: 4 },
  weatherIconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  weatherVal: { fontSize: 14, fontWeight: '900', color: '#1a1a1a' },
  weatherSub: { fontSize: 10, color: '#aaa', fontWeight: '600' },
  ticker: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginTop: 18,
  },
  tickerText: { color: '#fff9c4', fontSize: 12, flex: 1, fontWeight: '500' },

  // Voice
  voiceArea: { alignItems: 'center', paddingVertical: 32 },
  voiceCenter: { width: 78, height: 78, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  micBtn: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#1b5e20',
    justifyContent: 'center', alignItems: 'center',
    elevation: 12, shadowColor: '#1b5e20', shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 10 }, shadowRadius: 16,
  },
  voiceLabel: { fontWeight: '800', fontSize: 15, color: '#1b5e20' },
  voiceSub: { color: '#999', fontSize: 12, marginTop: 4 },

  // Modules
  sectionLabel: { marginHorizontal: 20, marginTop: 4, marginBottom: 12, fontSize: 10, fontWeight: '900', color: '#aaa', textTransform: 'uppercase', letterSpacing: 1.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 12 },
  card: {
    backgroundColor: 'white', borderRadius: 22, padding: 18,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 5 }, shadowRadius: 10,
    overflow: 'hidden', gap: 8,
  },
  iconBox: { width: 54, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardLabel: { fontWeight: '800', fontSize: 13, color: '#1a1a1a', marginTop: 4 },
  cardSub: { fontSize: 11, color: '#999', fontWeight: '600' },
  cardAccent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },

  // Brief
  brief: {
    marginHorizontal: 20, marginBottom: 14, backgroundColor: 'white',
    borderRadius: 22, padding: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 5 }, shadowRadius: 10,
  },
  briefTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  briefTitle: { fontWeight: '800', fontSize: 15, color: '#1a1a1a', flex: 1 },
  live: { backgroundColor: '#ef5350', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveTxt: { color: 'white', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  briefBody: { color: '#555', lineHeight: 22, fontSize: 14 },
  statsRow: { flexDirection: 'row', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f5f5f5', justifyContent: 'space-around' },
  statCol: { alignItems: 'center', gap: 3 },
  statVal: { fontSize: 16, fontWeight: '900', color: '#1a1a1a' },
  statKey: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },

  // CTA
  cta: {
    marginHorizontal: 20, backgroundColor: '#2e7d32', borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14,
    elevation: 6, shadowColor: '#1b5e20', shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 }, shadowRadius: 14,
  },
  ctaIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  flex1: { flex: 1 },
  ctaTitle: { color: 'white', fontWeight: '800', fontSize: 15 },
  ctaSub: { color: '#c8e6c9', fontSize: 12, marginTop: 2 },
})
