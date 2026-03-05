import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import AnimatedCard from '../components/AnimatedCard'
import { CreditCard, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react-native'

const LOANS = [
  {
    id: '1',
    bank: 'State Bank of India',
    scheme: 'Kisan Credit Card (KCC)',
    amount: 'Up to ₹3 Lakh',
    rate: '4% p.a. (with interest subvention)',
    eligible: true,
    reason: 'Your Farm Passport score: 87/100. Certified organic status qualifies.',
    docs: ['Aadhaar', 'Land Records', 'Farm Passport QR', 'Crop Insurance Copy'],
  },
  {
    id: '2',
    bank: 'NABARD',
    scheme: 'Agricultural Term Loan',
    amount: 'Up to ₹10 Lakh',
    rate: '7% p.a.',
    eligible: true,
    reason: 'Healthy crop history and soil lab reports strengthen your application.',
    docs: ['Aadhaar', 'Pan Card', 'Land Records', 'Soil Health Card', 'APMC reports'],
  },
  {
    id: '3',
    bank: 'HDFC Bank',
    scheme: 'Agri Gold Loan',
    amount: 'Up to ₹20 Lakh',
    rate: '8.5% p.a.',
    eligible: false,
    reason: 'Insufficient surety. No collateral registered under your Land ID.',
    docs: ['Gold Valuation', 'Aadhaar', 'Land Records'],
  },
  {
    id: '4',
    bank: 'Cooperative Society',
    scheme: 'Short-Term Crop Loan',
    amount: 'Up to ₹1.5 Lakh',
    rate: '0% (subsidised)',
    eligible: true,
    reason: 'District cooperative membership confirmed. Maximum benefit applicable.',
    docs: ['Society MemberID', 'Aadhaar', 'Land Records'],
  },
]

export default function LoanAdvisor() {
  const [expanded, setExpanded] = useState(null)

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Loan Advisor</Text>
      <Text style={styles.subtitle}>Prob 6 — Bank Loan Matching Based on Crop Health</Text>

      {/* Score Card */}
      <AnimatedCard style={styles.scoreCard}>
        <View style={styles.row}>
          <CreditCard color="#1b5e20" size={28} />
          <Text style={styles.scoreLabel}>Farm Credit Score</Text>
        </View>
        <Text style={styles.scoreValue}>87 / 100</Text>
        <Text style={styles.scoreSub}>
          Based on disease history, soil health, yield records, and organic certification.
          You qualify for 3 of 4 loan schemes.
        </Text>
      </AnimatedCard>

      <Text style={styles.sectionTitle}>Matched Loan Schemes</Text>

      {LOANS.map((loan) => (
        <AnimatedCard
          key={loan.id}
          style={[styles.loanCard, loan.eligible ? styles.eligibleCard : styles.ineligibleCard]}
          onPress={() => setExpanded(expanded === loan.id ? null : loan.id)}
        >
          <View style={styles.loanHeader}>
            <View style={styles.flex1}>
              <Text style={styles.bankName}>{loan.bank}</Text>
              <Text style={styles.schemeName}>{loan.scheme}</Text>
            </View>
            {loan.eligible
              ? <CheckCircle color="#2e7d32" size={24} />
              : <XCircle color="#c62828" size={24} />
            }
            {expanded === loan.id ? <ChevronUp color="#888" size={20} /> : <ChevronDown color="#888" size={20} />}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaLabel}>Amount</Text>
              <Text style={styles.metaValue}>{loan.amount}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaLabel}>Interest Rate</Text>
              <Text style={[styles.metaValue, { color: '#1565c0' }]}>{loan.rate}</Text>
            </View>
          </View>

          {expanded === loan.id && (
            <>
              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>AI Analysis</Text>
                <Text style={styles.reasonText}>{loan.reason}</Text>
              </View>
              <Text style={styles.docsLabel}>Required Documents</Text>
              {loan.docs.map((d, i) => (
                <View key={i} style={styles.docRow}>
                  <CheckCircle color="#4caf50" size={14} />
                  <Text style={styles.docText}>{d}</Text>
                </View>
              ))}
              {loan.eligible && (
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => Alert.alert('Apply', `Redirecting to ${loan.bank} loan portal.`)}
                >
                  <Text style={styles.applyText}>Apply via Bank Portal</Text>
                </TouchableOpacity>
              )}
            </>
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
  scoreCard: { backgroundColor: '#e8f5e9', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  scoreLabel: { fontWeight: 'bold', fontSize: 16, color: '#1b5e20' },
  scoreValue: { fontSize: 36, fontWeight: 'bold', color: '#1b5e20', marginBottom: 4 },
  scoreSub: { color: '#555', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  loanCard: { marginBottom: 14, gap: 10 },
  eligibleCard: { borderLeftWidth: 4, borderLeftColor: '#4caf50' },
  ineligibleCard: { borderLeftWidth: 4, borderLeftColor: '#ef5350', opacity: 0.7 },
  loanHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex1: { flex: 1 },
  bankName: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  schemeName: { fontSize: 13, color: '#666', marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 10 },
  metaBadge: { flex: 1, backgroundColor: '#f5f5f5', padding: 10, borderRadius: 10 },
  metaLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  metaValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  reasonBox: { backgroundColor: '#f0f4f8', padding: 12, borderRadius: 10 },
  reasonLabel: { fontWeight: 'bold', color: '#1b5e20', marginBottom: 4 },
  reasonText: { color: '#333', lineHeight: 20 },
  docsLabel: { fontWeight: 'bold', color: '#333', marginBottom: 6, marginTop: 4 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  docText: { color: '#555', fontSize: 13 },
  applyBtn: { backgroundColor: '#1b5e20', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  applyText: { color: 'white', fontWeight: 'bold' },
})
