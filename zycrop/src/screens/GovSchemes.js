import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import AnimatedCard from '../components/AnimatedCard'
import { Search, FileCheck, CheckCircle } from 'lucide-react-native'

const SCHEMES = [
  {
    id: '1',
    name: 'PM-Kusum Scheme',
    benefit: '60% Subsidy on Solar Pumps',
    eligibility: 'Land records + water source proof',
    amount: 'Up to ₹2.5 Lakh',
    deadline: 'Mar 31, 2026',
  },
  {
    id: '2',
    name: 'PM-KISAN',
    benefit: '₹6,000/year direct income support',
    eligibility: 'Small & marginal farmers with land records',
    amount: '₹6,000 per year',
    deadline: 'Ongoing',
  },
  {
    id: '3',
    name: 'Uzhavar Sandhai',
    benefit: 'Free transport to local farmer markets',
    eligibility: 'Tamil Nadu farmers with FarmerID',
    amount: 'Transport support',
    deadline: 'Ongoing',
  },
  {
    id: '4',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    benefit: 'Crop insurance at 2% premium',
    eligibility: 'Loanee & non-loanee farmers',
    amount: 'Full crop value coverage',
    deadline: 'Apr 15, 2026',
  },
  {
    id: '5',
    name: 'Soil Health Card Scheme',
    benefit: 'Free soil testing & fertilizer advisory',
    eligibility: 'All farmers — no restriction',
    amount: 'Free service',
    deadline: 'Ongoing',
  },
]

export default function GovSchemes() {
  const [query, setQuery] = useState('')

  const filtered = SCHEMES.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.benefit.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subsidy Finder</Text>
      <Text style={styles.subtitle}>Prob 4 — RAG-Based Gov Scheme Search</Text>

      <View style={styles.searchBox}>
        <Search color="#888" size={20} />
        <TextInput
          placeholder="Ask AI about local schemes..."
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#aaa"
        />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.map((s) => (
          <AnimatedCard key={s.id} style={styles.schemeCard}>
            <View style={styles.header}>
              <FileCheck color="#1b5e20" size={20} />
              <Text style={styles.schemeName}>{s.name}</Text>
            </View>
            <Text style={styles.benefit}>{s.benefit}</Text>

            <View style={styles.row}>
              <CheckCircle color="#4caf50" size={14} />
              <Text style={styles.eligText}>{s.eligibility}</Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaLabel}>Amount</Text>
                <Text style={styles.metaValue}>{s.amount}</Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaLabel}>Deadline</Text>
                <Text style={styles.metaValue}>{s.deadline}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => Alert.alert('Apply', `Navigating to ${s.name} application portal.`)}
            >
              <Text style={styles.btnText}>Apply Now</Text>
            </TouchableOpacity>
          </AnimatedCard>
        ))}

        {filtered.length === 0 && (
          <Text style={styles.empty}>No schemes found. Try a different keyword.</Text>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 50, marginBottom: 4, color: '#1b5e20' },
  subtitle: { fontSize: 12, color: '#888', marginBottom: 16 },
  searchBox: { flexDirection: 'row', backgroundColor: 'white', padding: 14, borderRadius: 12, alignItems: 'center', gap: 10, marginBottom: 16, elevation: 2 },
  input: { flex: 1, color: '#333' },
  list: { gap: 14, paddingBottom: 30 },
  schemeCard: { gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  schemeName: { fontSize: 17, fontWeight: 'bold', color: '#1b5e20', flex: 1 },
  benefit: { color: '#2e7d32', fontWeight: 'bold', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eligText: { color: '#555', fontSize: 13, flex: 1 },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  metaChip: { flex: 1, backgroundColor: '#f0f4f8', padding: 10, borderRadius: 10 },
  metaLabel: { fontSize: 11, color: '#888' },
  metaValue: { fontSize: 13, fontWeight: 'bold', color: '#333', marginTop: 2 },
  applyBtn: { backgroundColor: '#1b5e20', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  btnText: { color: 'white', fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40 },
})
