import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import AnimatedCard from '../components/AnimatedCard'
import { History, ShieldCheck, Download, Leaf, Droplets, Bug } from 'lucide-react-native'

const LOGS = [
  { icon: Bug, color: '#e53935', date: 'Feb 2026', note: 'Late Blight detected and fully cured.' },
  { icon: Droplets, color: '#1565c0', date: 'Jan 2026', note: 'Soil tested. Carbon: 0.8%. pH: 6.5.' },
  { icon: Leaf, color: '#2e7d32', date: 'Dec 2025', note: 'Certified Organic — no chemicals used.' },
  { icon: Bug, color: '#f57c00', date: 'Nov 2025', note: 'Aphid infestation treated with neem oil.' },
  { icon: Droplets, color: '#0288d1', date: 'Oct 2025', note: 'Drip irrigation installed. Water saved: 35%.' },
]

const farmData = JSON.stringify({
  farmerId: 'TN-CBE-9021',
  farmer: 'Murugan R.',
  district: 'Coimbatore',
  area: '3.5 acres',
  certifiedOrganic: true,
  history: ['Late Blight: Cured', 'Soil Carbon: 0.8%', 'Certified Organic'],
})

export default function FarmPassport() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Land Health Passport</Text>
      <Text style={styles.subtitle}>Prob 5 — Digital Health Record for Bank & Govt</Text>

      {/* Identity Card */}
      <AnimatedCard style={styles.mainCard}>
        <ShieldCheck color="#1b5e20" size={44} />
        <Text style={styles.verifyText}>Certified Organic Status</Text>
        <Text style={styles.id}>Land ID: TN-CBE-9021</Text>
        <Text style={styles.farmer}>Farmer: Murugan R. | 3.5 acres | Coimbatore</Text>
      </AnimatedCard>

      {/* QR Code */}
      <AnimatedCard style={styles.qrCard}>
        <Text style={styles.qrLabel}>Scan for Bank / Government Verification</Text>
        <View style={styles.qrWrapper}>
          <QRCode value={farmData} size={160} />
        </View>
        <Text style={styles.qrSub}>Verifiable digital record — tamper-proof</Text>
      </AnimatedCard>

      {/* History Logs */}
      <Text style={styles.sectionTitle}>History Logs</Text>
      {LOGS.map((l, i) => {
        const Icon = l.icon
        return (
          <View key={i} style={styles.log}>
            <View style={[styles.logIcon, { backgroundColor: l.color + '22' }]}>
              <Icon color={l.color} size={18} />
            </View>
            <View style={styles.logContent}>
              <Text style={styles.logDate}>{l.date}</Text>
              <Text style={styles.logText}>{l.note}</Text>
            </View>
          </View>
        )
      })}

      {/* Export */}
      <TouchableOpacity
        style={styles.downloadBtn}
        onPress={() => Alert.alert('Export', 'Passport PDF exported and ready to share with bank.')}
      >
        <Download color="white" size={20} />
        <Text style={styles.btnText}>Export Passport for Bank</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 50, marginBottom: 4, color: '#1b5e20' },
  subtitle: { fontSize: 12, color: '#888', marginBottom: 20 },
  mainCard: { alignItems: 'center', gap: 8, marginBottom: 16 },
  verifyText: { fontSize: 20, fontWeight: 'bold', color: '#1b5e20' },
  id: { color: '#555', fontWeight: 'bold' },
  farmer: { color: '#888', fontSize: 13 },
  qrCard: { alignItems: 'center', gap: 10, marginBottom: 24 },
  qrLabel: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  qrWrapper: { padding: 12, backgroundColor: 'white', borderRadius: 12, elevation: 2 },
  qrSub: { color: '#888', fontSize: 12 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 14 },
  log: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  logIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logContent: { flex: 1 },
  logDate: { fontSize: 11, color: '#aaa', marginBottom: 2 },
  logText: { fontSize: 14, color: '#333', lineHeight: 20 },
  downloadBtn: { backgroundColor: '#1b5e20', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 24, marginBottom: 40 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
})
