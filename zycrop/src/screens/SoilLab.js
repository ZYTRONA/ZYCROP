import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import AnimatedCard from '../components/AnimatedCard'
import { Beaker, Droplets, Thermometer, AlertCircle } from 'lucide-react-native'

const NPK_DATA = [
  { label: 'Nitrogen (N)', value: 'Low', color: '#f44336', bar: 0.25 },
  { label: 'Phosphorus (P)', value: 'Optimal', color: '#4caf50', bar: 0.65 },
  { label: 'Potassium (K)', value: 'High', color: '#ff9800', bar: 0.85 },
]

export default function SoilLab() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Soil Health Analyzer</Text>
      <Text style={styles.subtitle}>Prob 2 — Chemical Dosage & Fertilizer Prescription</Text>

      {/* NPK Bars */}
      <AnimatedCard style={styles.npkCard}>
        <Text style={styles.cardTitle}>NPK Levels</Text>
        {NPK_DATA.map((n) => (
          <View key={n.label} style={styles.npkRow}>
            <Text style={styles.npkLabel}>{n.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${n.bar * 100}%`, backgroundColor: n.color }]} />
            </View>
            <Text style={[styles.npkValue, { color: n.color }]}>{n.value}</Text>
          </View>
        ))}
      </AnimatedCard>

      {/* Soil Info */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>pH</Text>
          <Text style={styles.statValue}>6.5</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>Organic Carbon</Text>
          <Text style={styles.statValue}>0.8%</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>EC</Text>
          <Text style={styles.statValue}>0.4 dS/m</Text>
        </View>
      </View>

      {/* Fertilizer Prescription */}
      <AnimatedCard style={styles.actionCard}>
        <View style={styles.row}>
          <Beaker color="#1b5e20" size={24} />
          <Text style={styles.actionTitle}>Fertilizer Prescription</Text>
        </View>
        <Text style={styles.actionText}>
          • Apply 45 kg of Urea per acre to correct Nitrogen deficiency.{'\n'}
          • Add lime (15 kg/acre) to neutralize acidity (pH 6.5).{'\n'}
          • Reduce potash application — levels already high.{'\n'}
          • Next test recommended: 30 days.
        </Text>
        <View style={[styles.row, { marginTop: 12 }]}>
          <AlertCircle color="#f57c00" size={18} />
          <Text style={styles.warning}>Avoid over-application — risk of soil salinity.</Text>
        </View>
      </AnimatedCard>

      {/* Moisture & Irrigation */}
      <AnimatedCard style={styles.sensorCard}>
        <View style={styles.row}>
          <Droplets color="#0277bd" size={24} />
          <Text style={styles.sensorTitle}>Moisture Level: 22%</Text>
        </View>
        <Text style={styles.sensorSub}>Recommendation: Schedule drip irrigation for 6:00 PM today. Duration: 45 min.</Text>

        <View style={[styles.row, { marginTop: 12 }]}>
          <Thermometer color="#e53935" size={24} />
          <Text style={styles.sensorTitle}>Soil Temp: 28°C</Text>
        </View>
        <Text style={styles.sensorSub}>Optimal temperature for germination. Proceed with sowing.</Text>
      </AnimatedCard>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 50, marginBottom: 4, color: '#1b5e20' },
  subtitle: { fontSize: 12, color: '#888', marginBottom: 20 },
  npkCard: { marginBottom: 16 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 14, color: '#333' },
  npkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  npkLabel: { width: 120, fontSize: 13, color: '#555' },
  barTrack: { flex: 1, height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  npkValue: { width: 55, fontSize: 12, fontWeight: 'bold', textAlign: 'right' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statChip: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 12, alignItems: 'center', elevation: 2 },
  statLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#1b5e20' },
  actionCard: { backgroundColor: '#fff9c4', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  actionTitle: { fontWeight: 'bold', color: '#1b5e20', fontSize: 16 },
  actionText: { lineHeight: 24, color: '#333' },
  warning: { color: '#f57c00', fontSize: 13, flex: 1 },
  sensorCard: { gap: 4, marginBottom: 30 },
  sensorTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  sensorSub: { color: '#555', lineHeight: 20, marginBottom: 4, marginLeft: 34 },
})
