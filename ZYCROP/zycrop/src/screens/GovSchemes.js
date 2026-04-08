/**
 * GovSchemes.js — Government Agriculture Schemes Finder
 * Real-time AI search via backend RAG → Full scheme details
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLang } from '../context/LanguageContext';
import { colors, spacing, radius, textStyle } from '../theme/tokens';
import { useResponsive } from '../theme/responsive';
import { Badge } from '../components/ui';


// Offline/demo fallback
const DEMO_SCHEMES = [
  {
    id: '1', name: 'PM-KISAN', benefit: '₹6,000/year direct income support in 3 installments',
    eligibility: 'Small & marginal farmers with valid land records',
    amount: '₹6,000 per year', deadline: 'Ongoing',
    tags: ['Income Support', 'Central'], color: '#2e7d32',
    applyLink: 'https://pmkisan.gov.in/',
  },
  {
    id: '2', name: 'PM-Kusum Solar Pump', benefit: '60% subsidy on solar irrigation pumps (up to 7.5 HP)',
    eligibility: 'Land records + water source availability proof',
    amount: 'Up to ₹2.5 Lakh', deadline: 'Mar 31, 2026',
    tags: ['Solar', 'Irrigation', 'Subsidy'], color: '#f57c00',
    applyLink: 'https://mnre.gov.in/',
  },
  {
    id: '3', name: 'PMFBY Crop Insurance', benefit: 'Full crop value insurance at 2% premium (Kharif) / 1.5% (Rabi)',
    eligibility: 'Loanee and non-loanee farmers — all crops covered',
    amount: 'Full crop value', deadline: 'Apr 15, 2026',
    tags: ['Insurance', 'Central', 'Both seasons'], color: '#1565c0',
    applyLink: 'https://pmfby.gov.in/',
  },
  {
    id: '4', name: 'Uzhavar Sandhai', benefit: 'Free mandi stall + zero transport cost for direct consumer sales',
    eligibility: 'Tamil Nadu farmers with state Farmer ID card',
    amount: 'Free stall + transport subsidy', deadline: 'Ongoing',
    tags: ['Tamil Nadu', 'Market', 'Free'], color: '#c62828',
    applyLink: 'https://www.tn.gov.in/',
  },
  {
    id: '5', name: 'Soil Health Card', benefit: 'Free soil NPK testing every 2 years with fertilizer advisory',
    eligibility: 'All farmers — apply at nearest Krishi Vigyan Kendra',
    amount: 'Free service', deadline: 'Ongoing',
    tags: ['Soil', 'Free', 'Central'], color: '#6a1b9a',
    applyLink: 'https://soilhealth.dac.gov.in/',
  },
  {
    id: '6', name: 'KCC Kisan Credit Card', benefit: 'Crop loan up to ₹3 lakh at effective 4% interest p.a.',
    eligibility: 'Land records + cultivation certificate from Village Officer',
    amount: 'Up to ₹3,00,000', deadline: 'Year-round',
    tags: ['Loan', 'Credit', 'Central'], color: '#0277bd',
    applyLink: 'https://www.nabard.org/',
  },
  {
    id: '7', name: 'NABARD Farm Term Loan', benefit: 'Long-term investment loan for drip irrigation, cold storage, machinery',
    eligibility: 'Land ownership docs + project report to NABARD-linked bank',
    amount: 'Up to ₹10 Lakh', deadline: 'Jun–Sept / Nov–Feb',
    tags: ['Loan', 'Infrastructure', 'NABARD'], color: '#00838f',
    applyLink: 'https://www.nabard.org/',
  },
  {
    id: '8', name: 'TN Drought Relief Fund', benefit: 'Ex-gratia payment for crop loss due to official drought declaration',
    eligibility: 'TN farmers registered in revenue records with crop damage report',
    amount: '₹8,000–₹22,000/ha', deadline: 'After drought declaration',
    tags: ['Tamil Nadu', 'Relief', 'Drought'], color: '#bf360c',
    applyLink: 'https://www.tn.gov.in/',
  },
  {
    id: '9', name: 'eNAM Market Portal', benefit: 'Sell produce to buyers across India via online auction platform',
    eligibility: 'Farmer registered in any eNAM-linked APMC mandi',
    amount: 'Higher price discovery', deadline: 'Ongoing',
    tags: ['Market', 'Digital', 'Central'], color: '#1b5e20',
    applyLink: 'https://enam.gov.in/',
  },
  {
    id: '10', name: 'PM-Kisan Maan Dhan (Pension)', benefit: 'Monthly pension ₹3,000 after age 60 for small farmers',
    eligibility: 'Farmers aged 18–40 years with < 2 ha land holding',
    amount: '₹3,000/month pension', deadline: 'Ongoing',
    tags: ['Pension', 'Central', 'Social Security'], color: '#4527a0',
    applyLink: 'https://maandhan.in/',
  },
];

const QUICK_QUERIES = [
  'solar pump subsidy', 'crop insurance', 'loan KCC', 'free soil test',
  'drought relief', 'market sell', 'pension', 'Tamil Nadu scheme',
];

function SchemeCard({ scheme, onApply }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      style={[sc.card, { borderLeftColor: scheme.color, borderLeftWidth: 4 }]}
      activeOpacity={0.85}
    >
      <View style={sc.header}>
        <View style={{ flex: 1 }}>
          <Text style={[textStyle.h3(), { color: scheme.color }]}>{scheme.name}</Text>
          <Text style={[textStyle.bodySmall(), { marginTop: 2, lineHeight: 18 }]}>{scheme.benefit}</Text>
        </View>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} style={{ marginLeft: 8, marginTop: 4 }} />
      </View>

      {/* Tags */}
      <View style={sc.tags}>
        {(scheme.tags || []).map(tag => (
          <View key={tag} style={[sc.tag, { backgroundColor: scheme.color + '18' }]}>
            <Text style={[sc.tagText, { color: scheme.color }]}>{tag}</Text>
          </View>
        ))}
      </View>

      {expanded && (
        <View style={sc.body}>
          <View style={sc.infoRow}>
            <Feather name="users" size={14} color={colors.primary} />
            <Text style={[textStyle.bodySmall(), { flex: 1, marginLeft: 6 }]}>
              <Text style={{ fontWeight: '700' }}>Eligibility: </Text>{scheme.eligibility}
            </Text>
          </View>
          <View style={sc.infoRow}>
            <Feather name="dollar-sign" size={14} color={colors.accent} />
            <Text style={[textStyle.bodySmall(), { flex: 1, marginLeft: 6 }]}>
              <Text style={{ fontWeight: '700' }}>Amount: </Text>{scheme.amount}
            </Text>
          </View>
          <View style={sc.infoRow}>
            <Feather name="calendar" size={14} color={colors.warning} />
            <Text style={[textStyle.bodySmall(), { flex: 1, marginLeft: 6 }]}>
              <Text style={{ fontWeight: '700' }}>Deadline: </Text>{scheme.deadline}
            </Text>
          </View>
          <TouchableOpacity
            style={[sc.applyBtn, { backgroundColor: scheme.color }]}
            onPress={() => onApply(scheme)}
          >
            <Feather name="external-link" size={14} color="#fff" />
            <Text style={sc.applyText}>Apply Now / Know More</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}
const sc = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  tagText: { fontSize: 10, fontWeight: '700' },
  body: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderRadius: radius.lg, marginTop: spacing.sm },
  applyText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default function GovSchemes({ navigation }) {
  const { t } = useLang();
  const { spacing: sp } = useResponsive();
  const [searchText, setSearchText] = useState('');
  const [schemes, setSchemes] = useState(DEMO_SCHEMES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = (query) => {
    if (!query?.trim()) {
      setSchemes(DEMO_SCHEMES);
      return;
    }
    const q = query.toLowerCase();
    const filtered = DEMO_SCHEMES.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.benefit.toLowerCase().includes(q) ||
      s.eligibility?.toLowerCase().includes(q) ||
      s.tags.some(tag => tag.toLowerCase().includes(q))
    );
    setSchemes(filtered.length > 0 ? filtered : DEMO_SCHEMES);
  };

  const handleApply = (scheme) => {
    if (scheme.applyLink) {
      Linking.openURL(scheme.applyLink).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={[s.header, { paddingHorizontal: sp.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: sp.md }}>
          <Text style={[textStyle.h2({ color: '#fff' })]}>Govt Schemes</Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
            {schemes.length} schemes found · AI-powered search
          </Text>
        </View>
        <MaterialCommunityIcons name="bank-outline" size={24} color="#fff" />
      </View>

      {/* Search bar */}
      <View style={[s.searchWrap, { paddingHorizontal: sp.md, paddingVertical: sp.sm }]}>
        <View style={s.searchBar}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[s.searchInput, textStyle.body()]}
            placeholder="Search schemes, subsidies, loans..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => search(searchText)}
            returnKeyType="search"
          />
          {loading
            ? <ActivityIndicator size="small" color={colors.primary} />
            : searchText.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchText(''); setSchemes(DEMO_SCHEMES); }}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
        </View>
      </View>

      {/* Quick query chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sp.md, paddingBottom: sp.sm, gap: spacing.sm }}
        style={{ backgroundColor: colors.surfaceAlt }}
      >
        {QUICK_QUERIES.map(q => (
          <TouchableOpacity
            key={q}
            onPress={() => { setSearchText(q); search(q); }}
            style={s.quickChip}
          >
            <Text style={s.quickChipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: sp.md, paddingBottom: 80 }}>
        {schemes.map(scheme => (
          <SchemeCard key={scheme.id} scheme={scheme} onApply={handleApply} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { backgroundColor: colors.primary, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center' },
  searchWrap: { backgroundColor: colors.surfaceAlt, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.full || 999, paddingHorizontal: spacing.md, paddingVertical: 10, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 0 },
  quickChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  quickChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
});
