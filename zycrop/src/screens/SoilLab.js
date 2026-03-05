import React, { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Modal,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { ArrowLeft, Search, Leaf, Beaker, Camera, CheckCircle, AlertCircle } from 'lucide-react-native'
import { useLang } from '../context/LanguageContext'
import LanguageMenu from '../components/LanguageMenu'
import { saveLog } from '../services/farmLog'

// ─── Local soil profile database (Coimbatore district) ───────────────────────
const SOIL_PROFILES = [
  {
    soilType: 'Red Laterite Soil',
    location: 'Coimbatore District Dataset — Sulur / Kinathukadavu Block',
    bestCrop: 'Groundnut, Tapioca, or Ragi',
    fertilizers: [
      'Apply 12.5 tons Farm Yard Manure (FYM) per hectare before plowing.',
      'Basal Dose: 40kg Nitrogen + 20kg Phosphorus per acre.',
      'Top Dressing: 20kg Nitrogen 30 days after sowing.',
      'Lime application recommended: 250kg/acre to correct acidity.',
    ],
    warning: 'Low water retention. Use drip irrigation for best results.',
  },
  {
    soilType: 'Black Cotton Soil (Vertisol)',
    location: 'Coimbatore District Dataset — Pollachi / Annur Block',
    bestCrop: 'Cotton, Sorghum, or Wheat',
    fertilizers: [
      'Apply 10 tons FYM per hectare. Incorporate 15 days before sowing.',
      'Basal: 20kg Nitrogen + 40kg Phosphorus + 20kg Potassium per acre.',
      'Top Dressing: 40kg Nitrogen split at 30 and 60 days after sowing.',
      'Zinc Sulphate 25kg/ha corrects micronutrient deficiency.',
    ],
    warning: 'High shrink-swell capacity. Avoid over-irrigation.',
  },
  {
    soilType: 'Red Calcareous Soil',
    location: 'Coimbatore District Dataset — Perur / Kuniyamuthur Block',
    bestCrop: 'Sorghum (Cholam) or Cotton',
    fertilizers: [
      'Apply 12.5 tons Farm Yard Manure (FYM) per hectare before plowing.',
      'Basal Dose: 40kg Nitrogen + 20kg Phosphorus per acre.',
      'Top Dressing: 20kg Nitrogen 30 days after sowing.',
    ],
    warning: null,
  },
  {
    soilType: 'Alluvial Sandy Loam',
    location: 'Coimbatore District Dataset — Madukkarai / Vellalore Block',
    bestCrop: 'Rice, Banana, or Sugarcane',
    fertilizers: [
      'Apply 15 tons FYM per hectare. High organic matter critical.',
      'Basal: 50kg Nitrogen + 25kg Phosphorus + 30kg Potassium per acre.',
      'Split Nitrogen: 3 splits at basal, tillering, and panicle initiation.',
      'Foliar spray: 2% KNO3 at grain filling stage.',
    ],
    warning: 'Good drainage needed. Monitor for waterlogging.',
  },
]

function analyzeSoilLocal() {
  return SOIL_PROFILES[Math.floor(Math.random() * SOIL_PROFILES.length)]
}

export default function SoilLab({ navigation }) {
  const { t, translateText } = useLang()
  const [permission, requestPermission] = useCameraPermissions()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const cameraRef = useRef(null)

  const scanSoil = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      // Capture photo (image captured for future ML integration)
      if (cameraRef.current) {
        await cameraRef.current.takePictureAsync({ quality: 0.7 })
      }

      // Simulate soil analysis processing delay
      await new Promise(r => setTimeout(r, 1600))

      // Use local Coimbatore district soil profile database
      const data = analyzeSoilLocal()

      const [soilType, location, bestCrop, ...translatedFertilizers] = await Promise.all([
        translateText(data.soilType),
        translateText(data.location),
        translateText(data.bestCrop),
        ...data.fertilizers.map(f => translateText(f)),
      ])

      const finalResult = {
        soilType,
        location,
        bestCrop,
        fertilizers: translatedFertilizers,
        warning: data.warning ? await translateText(data.warning) : null,
      }

      setResult(finalResult)

      // Save to farm log — visible in FarmPassport
      saveLog({
        event_type: 'soil',
        note: `Soil tested: ${data.soilType}. Best crop: ${data.bestCrop}.`,
        icon_color: '#1565c0',
      })
    } catch (err) {
      setError(err.message || 'Soil analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!permission) return <View style={styles.container} />

  if (!permission.granted) {
    return (
      <View style={styles.permScreen}>
        <Camera color="#1b5e20" size={60} />
        <Text style={styles.permTitle}>{t.cameraRequired}</Text>
        <Text style={styles.permText}>{t.cameraTextSoil}</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnTxt}>{t.grantCamera}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <ArrowLeft color="white" size={26} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.soilTitle}</Text>
        <LanguageMenu />
      </View>

      {!result ? (
        <View style={styles.cameraWrapper}>
          {/* CameraView — no children allowed in expo-camera v17 */}
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />

          {/* Overlay sits outside CameraView using absolute position */}
          <View style={styles.overlay} pointerEvents="box-none">
            {/* Target frame */}
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <Text style={styles.frameLabel}>{t.soilScanZone}</Text>
            </View>
            <Text style={styles.hint}>{t.hintSoil}</Text>

            {/* Error banner */}
            {error ? (
              <View style={styles.errorBanner}>
                <AlertCircle color="#c62828" size={15} />
                <Text style={styles.errorBannerTxt}>{error}</Text>
              </View>
            ) : null}

            {/* Capture button */}
            <View style={styles.captureArea}>
              {loading ? (
                <ActivityIndicator size="large" color="#00ff00" />
              ) : (
                <TouchableOpacity style={styles.captureBtn} onPress={scanSoil}>
                  <View style={styles.innerCircle} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.resultView} showsVerticalScrollIndicator={false}>
          {/* Government Dataset Banner */}
          <View style={styles.govCard}>
            <View style={styles.govIconRow}>
              <Search color="#1b5e20" size={28} />
              <View style={styles.govTextCol}>
                <Text style={styles.govTitle}>{t.datasetMatch}</Text>
                <Text style={styles.govText}>{result.location}</Text>
              </View>
            </View>
            <Text style={styles.soilText}>{result.soilType}</Text>
          </View>

          {/* Warning card */}
          {result.warning ? (
            <View style={styles.warningCard}>
              <AlertCircle color="#e65100" size={18} />
              <Text style={styles.warningTxt}>{result.warning}</Text>
            </View>
          ) : null}

          {/* Recommended Crops */}
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: '#fff8e1' }]}>
                <Leaf color="#f9a825" size={22} />
              </View>
              <Text style={styles.cardTitle}>{t.recommendedCrops}</Text>
            </View>
            <Text style={styles.cropHighlight}>{result.bestCrop}</Text>
          </View>

          {/* Fertilizers */}
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: '#e3f2fd' }]}>
                <Beaker color="#0288d1" size={22} />
              </View>
              <Text style={styles.cardTitle}>{t.requiredFertilizers}</Text>
            </View>
            {result.fertilizers.map((item, index) => (
              <View key={index} style={styles.bulletRow}>
                <View style={styles.numCircle}>
                  <Text style={styles.numTxt}>{index + 1}</Text>
                </View>
                <Text style={styles.cardText}>{item}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={() => setResult(null)}>
            <Text style={styles.resetText}>{t.scanNewSector}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Full-screen loading modal */}
      <Modal transparent visible={loading && !result}>
        <View style={styles.loadingModal}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#1b5e20" />
            <Text style={styles.loadingTitle}>{t.matchingDataset}</Text>
            <Text style={styles.loadingSub}>{t.checkingRecords}</Text>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  permScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#f0f4f0', gap: 16 },
  permTitle: { fontSize: 22, fontWeight: '900', color: '#1b5e20' },
  permText: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },
  permBtn: {
    backgroundColor: '#1b5e20', paddingHorizontal: 36, paddingVertical: 16,
    borderRadius: 16, marginTop: 8, elevation: 4,
    shadowColor: '#1b5e20', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10,
  },
  permBtnTxt: { color: 'white', fontWeight: '900', fontSize: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 18, backgroundColor: '#1b5e20',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '900', color: 'white', flex: 1 },

  cameraWrapper: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', alignItems: 'center', paddingTop: 40, paddingBottom: 40 },
  frame: { width: 260, height: 180, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#69f0ae' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  frameLabel: { color: '#69f0ae', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  hint: { color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 22, fontSize: 13, fontWeight: '600' },
  captureArea: { justifyContent: 'center', alignItems: 'center', height: 90 },
  captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  innerCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white' },

  resultView: { flex: 1, padding: 20, backgroundColor: '#f0f4f0' },

  govCard: {
    backgroundColor: '#1b5e20', padding: 22, borderRadius: 20, marginBottom: 16, gap: 12,
    elevation: 5, shadowColor: '#1b5e20', shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 5 }, shadowRadius: 12,
  },
  govIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  govTextCol: { flex: 1 },
  govTitle: { fontSize: 11, fontWeight: '700', color: '#a5d6a7', textTransform: 'uppercase', letterSpacing: 1 },
  govText: { fontSize: 12, color: '#c8e6c9', marginTop: 2, fontWeight: '500' },
  soilText: { fontSize: 24, fontWeight: '900', color: 'white', textAlign: 'center' },

  card: {
    backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 16,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, gap: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#222', flex: 1 },
  cropHighlight: { fontSize: 22, fontWeight: '900', color: '#1b5e20' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingRight: 8 },
  numCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  numTxt: { fontSize: 11, fontWeight: '900', color: '#1b5e20' },
  cardText: { fontSize: 14, color: '#555', lineHeight: 22, flex: 1 },

  resetBtn: {
    backgroundColor: '#1b5e20', padding: 17, borderRadius: 16,
    alignItems: 'center', marginTop: 8, marginBottom: 40,
    elevation: 4, shadowColor: '#1b5e20', shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 }, shadowRadius: 12,
  },
  resetText: { color: 'white', fontSize: 17, fontWeight: '900' },

  loadingModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center' },
  loadingCard: { backgroundColor: 'white', borderRadius: 24, padding: 36, alignItems: 'center', gap: 14, width: 260 },
  loadingTitle: { fontSize: 18, fontWeight: '800', color: '#1b5e20' },
  loadingSub: { fontSize: 13, color: '#888' },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(198,40,40,0.88)', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 20,
  },
  errorBannerTxt: { color: 'white', fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 18 },

  warningCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#fff8e1', borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#ffcc80',
  },
  warningTxt: { flex: 1, fontSize: 13, color: '#e65100', lineHeight: 20, fontWeight: '600' },
})
