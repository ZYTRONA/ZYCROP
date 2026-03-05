import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Camera, CheckCircle, AlertTriangle } from 'lucide-react-native'
import AnimatedCard from '../components/AnimatedCard'

const MOCK_RESULT = {
  disease: 'Late Blight (Phytophthora infestans)',
  confidence: '94.2%',
  severity: 'Moderate',
  remedy: 'Apply Mancozeb 75% WP at 2.5 g/L. Remove infected leaves immediately. Spray every 7 days.',
  preventive: 'Ensure proper drainage. Avoid overhead irrigation. Use certified disease-free seeds.',
}

export default function Pathologist() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  if (!permission) return <View />

  if (!permission.granted) {
    return (
      <View style={styles.permContainer}>
        <Text style={styles.permText}>Camera access is needed for crop scanning.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Camera Viewfinder */}
      <View style={styles.cameraWrapper}>
        <CameraView style={styles.camera} facing="back" />
        {/* Overlay frame */}
        <View style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.hint}>Point camera at crop leaf</Text>
        </View>
        <TouchableOpacity style={styles.scanBtn} onPress={() => setScanned(true)}>
          <Camera color="white" size={24} />
          <Text style={styles.scanBtnText}>Diagnose Now</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView style={styles.results} contentContainerStyle={{ gap: 12 }}>
        {scanned ? (
          <>
            <AnimatedCard style={styles.diseaseCard}>
              <View style={styles.row}>
                <AlertTriangle color="#f57c00" size={24} />
                <Text style={styles.diseaseName}>{MOCK_RESULT.disease}</Text>
              </View>
              <Text style={styles.confidence}>Confidence: {MOCK_RESULT.confidence}</Text>
              <Text style={styles.severity}>Severity: {MOCK_RESULT.severity}</Text>
            </AnimatedCard>

            <AnimatedCard style={styles.remedyCard}>
              <Text style={styles.cardLabel}>Remedy</Text>
              <Text style={styles.cardText}>{MOCK_RESULT.remedy}</Text>
            </AnimatedCard>

            <AnimatedCard style={styles.preventCard}>
              <View style={styles.row}>
                <CheckCircle color="#2e7d32" size={20} />
                <Text style={styles.cardLabel}>Preventive Measures</Text>
              </View>
              <Text style={styles.cardText}>{MOCK_RESULT.preventive}</Text>
            </AnimatedCard>
          </>
        ) : (
          <Text style={styles.waitText}>Capture an image to get AI diagnosis.</Text>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  permContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  permText: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#333' },
  permBtn: { backgroundColor: '#1b5e20', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  permBtnText: { color: 'white', fontWeight: 'bold' },
  cameraWrapper: { height: 300, position: 'relative' },
  camera: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  frame: { width: 200, height: 200, borderWidth: 2, borderColor: '#76ff03', borderRadius: 12 },
  hint: { color: 'white', marginTop: 10, fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 6 },
  scanBtn: { position: 'absolute', bottom: 16, alignSelf: 'center', backgroundColor: '#1b5e20', flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, elevation: 4 },
  scanBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  results: { flex: 1, padding: 16 },
  diseaseCard: { backgroundColor: '#fff3e0' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  diseaseName: { fontWeight: 'bold', fontSize: 15, color: '#e65100', flex: 1, flexWrap: 'wrap' },
  confidence: { color: '#555', marginBottom: 4 },
  severity: { color: '#f57c00', fontWeight: 'bold' },
  remedyCard: { backgroundColor: '#e8f5e9' },
  preventCard: { backgroundColor: '#f9fbe7' },
  cardLabel: { fontWeight: 'bold', fontSize: 15, color: '#1b5e20', marginBottom: 6 },
  cardText: { color: '#333', lineHeight: 22 },
  waitText: { textAlign: 'center', color: '#888', marginTop: 20 },
})
