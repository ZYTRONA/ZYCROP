import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import AnimatedCard from '../components/AnimatedCard'
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react-native'

const CROPS = [
  { id: '1', crop: 'Tomato', current: '₹45/kg', forecast: '₹52/kg', trend: '+15.5%', up: true, advice: 'Hold for 7 days — price expected to peak next week.' },
  { id: '2', crop: 'Onion', current: '₹30/kg', forecast: '₹27/kg', trend: '-10%', up: false, advice: 'Sell immediately — surplus in Nashik markets driving prices down.' },
  { id: '3', crop: 'Rice', current: '₹28/kg', forecast: '₹31/kg', trend: '+10.7%', up: true, advice: 'MSP guaranteed. Hold to capture price gain.' },
  { id: '4', crop: 'Cotton', current: '₹63/kg', forecast: '₹60/kg', trend: '-4.7%', up: false, advice: 'Export demand dropping. Sell within 3 days.' },
  { id: '5', crop: 'Sugarcane', current: '₹3.1/kg', forecast: '₹3.4/kg', trend: '+9.6%', up: true, advice: 'Mill season starting. Prices rising — delay sale by 10 days.' },
]

export default function MarketAI() {
  const [selected, setSelected] = useState(null)

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Market AI</Text>
      <Text style={styles.subtitle}>Prob 3 — LSTM-Based Price Forecasting</Text>

      <AnimatedCard style={styles.modelCard}>
        <View style={styles.row}>
          <BarChart2 color="#1565c0" size={24} />
          <Text style={styles.modelTitle}>AI Forecast Engine</Text>
        </View>
        <Text style={styles.modelText}>
          Powered by LSTM neural network trained on 5 years of APMC data across 120 mandis.
          Accuracy: 91.3% (±3 days window).
        </Text>
      </AnimatedCard>

      <Text style={styles.sectionTitle}>Live Prices & 7-Day Forecast</Text>
      {CROPS.map((item) => (
        <AnimatedCard
          key={item.id}
          style={[styles.cropCard, selected === item.id && styles.selectedCard]}
          onPress={() => setSelected(selected === item.id ? null : item.id)}
        >
          <View style={styles.cropHeader}>
            <Text style={styles.cropName}>{item.crop}</Text>
            <View style={[styles.trendBadge, { backgroundColor: item.up ? '#e8f5e9' : '#ffebee' }]}>
              {item.up ? <TrendingUp color="#2e7d32" size={16} /> : <TrendingDown color="#c62828" size={16} />}
              <Text style={[styles.trendText, { color: item.up ? '#2e7d32' : '#c62828' }]}>{item.trend}</Text>
            </View>
          </View>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Current</Text>
              <Text style={styles.priceValue}>{item.current}</Text>
            </View>
            <View style={styles.arrow}><Text style={styles.arrowText}>→</Text></View>
            <View>
              <Text style={styles.priceLabel}>7-Day Forecast</Text>
              <Text style={[styles.priceValue, { color: item.up ? '#2e7d32' : '#c62828' }]}>{item.forecast}</Text>
            </View>
          </View>
          {selected === item.id && (
            <View style={styles.adviceBox}>
              <Text style={styles.adviceLabel}>AI Advice</Text>
              <Text style={styles.adviceText}>{item.advice}</Text>
            </View>
          )}
        </AnimatedCard>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 50, marginBottom: 4, color: '#1b5e20' },
  subtitle: { fontSize: 12, color: '#888', marginBottom: 20 },
  modelCard: { backgroundColor: '#e3f2fd', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  modelTitle: { fontWeight: 'bold', fontSize: 16, color: '#1565c0' },
  modelText: { color: '#333', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  cropCard: { marginBottom: 12 },
  selectedCard: { borderWidth: 2, borderColor: '#1b5e20' },
  cropHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cropName: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  trendText: { fontWeight: 'bold', fontSize: 13 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  priceValue: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  arrow: { flex: 1, alignItems: 'center' },
  arrowText: { fontSize: 22, color: '#aaa' },
  adviceBox: { marginTop: 14, backgroundColor: '#f0f4f8', padding: 12, borderRadius: 10 },
  adviceLabel: { fontWeight: 'bold', color: '#1b5e20', marginBottom: 4 },
  adviceText: { color: '#333', lineHeight: 20 },
})
