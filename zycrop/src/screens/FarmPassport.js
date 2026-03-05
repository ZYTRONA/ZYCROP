import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import QRCode from 'react-native-qrcode-svg'
import AnimatedCard from '../components/AnimatedCard'
import { History, ShieldCheck, Download, Leaf, Droplets, Bug, ArrowLeft, Award } from 'lucide-react-native'
import { useLang } from '../context/LanguageContext'
import LanguageMenu from '../components/LanguageMenu'
import { useFocusEffect } from '@react-navigation/native'
import { getLogs } from '../services/farmLog'

const FARMER_ID = 'TN-CBE-9021'

const farmData = JSON.stringify({
  farmerId: FARMER_ID,
  farmer: 'Murugan R.',
  district: 'Coimbatore',
  area: '3.5 acres',
  certifiedOrganic: true,
})

const EN_FARM_ID = 'Land ID: TN-CBE-9021'
const EN_FARMER_INFO = 'Farmer: Murugan R. | 3.5 acres | Coimbatore'

const getLogMeta = (eventType, iconColor) => {
  const et = (eventType || '').toLowerCase()
  let Icon = Leaf
  if (et.includes('disease') || et.includes('blight') || et.includes('pest') || et.includes('aphid') || et.includes('insect')) {
    Icon = Bug
  } else if (et.includes('soil') || et.includes('irrigation') || et.includes('water') || et.includes('drip')) {
    Icon = Droplets
  }
  return { Icon, color: iconColor || '#2e7d32' }
}

export default function FarmPassport() {
  const { t, lang, translateText } = useLang()
  const navigation = useNavigation()

  const [logs, setLogs] = useState([])
  const [logAnims, setLogAnims] = useState([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [translatedNotes, setTranslatedNotes] = useState([])

  const [farmId, setFarmId] = useState(EN_FARM_ID)
  const [farmerInfo, setFarmerInfo] = useState(EN_FARMER_INFO)

  // Header parallax
  const scrollY = useRef(new Animated.Value(0)).current
  const headerScale = scrollY.interpolate({
    inputRange: [-60, 0],
    outputRange: [1.05, 1],
    extrapolate: 'clamp',
  })

  // Reload logs whenever the screen comes into focus (catches new Pathologist/SoilLab entries)
  useFocusEffect(
    React.useCallback(() => {
      setLogsLoading(true)
      getLogs()
        .then(fetched => {
          const anims = fetched.map(() => ({
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(24),
          }))
          setLogs(fetched)
          setLogAnims(anims)
        })
        .finally(() => setLogsLoading(false))
    }, [])
  )

  // Start stagger entrance animation whenever logAnims array is set
  useEffect(() => {
    if (logAnims.length === 0) return
    Animated.stagger(80, logAnims.map(a =>
      Animated.parallel([
        Animated.timing(a.opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(a.translateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 9 }),
      ])
    )).start()
  }, [logAnims])

  // Translate log notes when language or logs change
  useEffect(() => {
    if (logs.length === 0) return
    if (lang === 'en') {
      setTranslatedNotes(logs.map(l => l.note))
      return
    }
    Promise.all(logs.map(l => translateText(l.note))).then(setTranslatedNotes)
  }, [logs, lang])

  // Translate static header strings
  useEffect(() => {
    if (lang === 'en') {
      setFarmId(EN_FARM_ID)
      setFarmerInfo(EN_FARMER_INFO)
      return
    }
    Promise.all([
      translateText(EN_FARM_ID),
      translateText(EN_FARMER_INFO),
    ]).then(([id, info]) => {
      setFarmId(id)
      setFarmerInfo(info)
    })
  }, [lang])

  return (
    <View style={styles.root}>
      {/* Header */}
      <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
        <View style={[styles.hBlob, { width: 160, height: 160, top: -50, right: -40 }]} />
        <View style={[styles.hBlob, { width: 80, height: 80, top: 30, right: 60 }]} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
          <ArrowLeft color="white" size={22} />
        </TouchableOpacity>
        <View style={styles.flex1}>
          <Text style={styles.headerTitle}>{t.passportTitle}</Text>
          <Text style={styles.headerSub}>{t.passportSub}</Text>
        </View>
        <LanguageMenu />
      </Animated.View>

      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >

        {/* Identity Card */}
        <AnimatedCard style={styles.mainCard}>
          <View style={styles.certBadge}>
            <Award color="#1b5e20" size={14} />
            <Text style={styles.certBadgeTxt}>CERTIFIED ORGANIC</Text>
          </View>
          <View style={styles.shieldWrap}>
            <ShieldCheck color="#1b5e20" size={48} />
          </View>
          <Text style={styles.verifyText}>{t.certifiedOrganic}</Text>
          <Text style={styles.id}>{farmId}</Text>
          <Text style={styles.farmer}>{farmerInfo}</Text>
        </AnimatedCard>

        {/* QR Code */}
        <AnimatedCard style={styles.qrCard}>
          <Text style={styles.qrLabel}>{t.scanForVerification}</Text>
          <View style={styles.qrWrapper}>
            <QRCode value={farmData} size={160} />
          </View>
          <Text style={styles.qrSub}>{t.tamperProof}</Text>
        </AnimatedCard>

        {/* History Logs */}
        <View style={styles.sectionRow}>
          <History color="#1b5e20" size={16} />
          <Text style={styles.sectionTitle}>{t.historyLogs}</Text>
        </View>

        {logsLoading ? (
          <ActivityIndicator color="#1b5e20" size="large" style={{ marginTop: 24 }} />
        ) : logs.length === 0 ? (
          <View style={styles.emptyLogs}>
            <Leaf color="#aaa" size={32} />
            <Text style={styles.emptyLogsTxt}>No farm history yet.</Text>
          </View>
        ) : logs.map((l, i) => {
          const { Icon, color } = getLogMeta(l.event_type, l.icon_color)
          const note = translatedNotes[i] || l.note
          return (
            <Animated.View
              key={l._id || i}
              style={[
                styles.log,
                logAnims[i] ? {
                  opacity: logAnims[i].opacity,
                  transform: [{ translateY: logAnims[i].translateY }],
                } : {},
              ]}
            >
              <View style={[styles.logIcon, { backgroundColor: color + '20' }]}>
                <Icon color={color} size={18} />
              </View>
              <View style={styles.logContent}>
                <Text style={styles.logDate}>{l.date}</Text>
                <Text style={styles.logText}>{note}</Text>
              </View>
            </Animated.View>
          )
        })}

        {/* Export */}
        <TouchableOpacity
          style={styles.downloadBtn}
          activeOpacity={0.85}
          onPress={() => Alert.alert(t.exportPassport, t.exportSuccess)}
        >
          <Download color="white" size={20} />
          <Text style={styles.btnText}>{t.exportPassport}</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f0' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: '#1b5e20', overflow: 'hidden',
  },
  hBlob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  flex1: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 11, color: '#a5d6a7', marginTop: 2 },
  container: { flex: 1 },

  mainCard: { alignItems: 'center', gap: 10, marginBottom: 16 },
  certBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: '#c8e6c9',
  },
  certBadgeTxt: { fontSize: 10, fontWeight: '900', color: '#1b5e20', letterSpacing: 1 },
  shieldWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#c8e6c9',
  },
  verifyText: { fontSize: 20, fontWeight: '900', color: '#1b5e20' },
  id: { color: '#555', fontWeight: '700', fontSize: 14 },
  farmer: { color: '#888', fontSize: 13 },

  qrCard: { alignItems: 'center', gap: 12, marginBottom: 24 },
  qrLabel: { fontWeight: '800', color: '#222', fontSize: 15 },
  qrWrapper: {
    padding: 14, backgroundColor: 'white', borderRadius: 16,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 8,
  },
  qrSub: { color: '#888', fontSize: 12 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1b5e20' },

  emptyLogs: { alignItems: 'center', gap: 10, paddingVertical: 32, opacity: 0.5 },
  emptyLogsTxt: { fontSize: 14, color: '#888', fontWeight: '600' },

  log: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 12,
    backgroundColor: 'white', borderRadius: 16, padding: 14,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 7,
  },
  logIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  logContent: { flex: 1 },
  logDate: { fontSize: 11, color: '#aaa', fontWeight: '700', marginBottom: 3 },
  logText: { fontSize: 14, color: '#333', lineHeight: 20 },

  downloadBtn: {
    backgroundColor: '#1b5e20', padding: 18, borderRadius: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    marginTop: 24,
    elevation: 5, shadowColor: '#1b5e20', shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 }, shadowRadius: 12,
  },
  btnText: { color: 'white', fontWeight: '900', fontSize: 16 },
})
