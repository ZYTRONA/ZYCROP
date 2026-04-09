/**
 * MarketAI.js — Market Intelligence & Price Forecasting (Phase 6)
 * Real-time crop prices, 7-day trend forecasts, and market analytics
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLang } from '../context/LanguageContext';
import { useResponsive } from '../theme/responsive';
import { colors, spacing, radius, textStyle, shadow } from '../theme/tokens';
import { AIButton, ChipFilterRow, StatBox, Badge } from '../components/ui';

// ─── Market Data ─────────────────────────────────────────────
const MARKET_DATA = [
  { crop: 'Rice', price: 2100, change: '+2.5%', unit: 'per 100kg', trend: 'up', today: 2100, yesterday: 2048 },
  { crop: 'Wheat', price: 1950, change: '-0.8%', unit: 'per 100kg', trend: 'down', today: 1950, yesterday: 1966 },
  { crop: 'Tomato', price: 4200, change: '+5.2%', unit: 'per 50kg', trend: 'up', today: 4200, yesterday: 3990 },
  { crop: 'Onion', price: 1800, change: '+1.3%', unit: 'per 100kg', trend: 'up', today: 1800, yesterday: 1776 },
  { crop: 'Cotton', price: 5500, change: '-2.1%', unit: 'per 100kg', trend: 'down', today: 5500, yesterday: 5615 },
  { crop: 'Chili', price: 8900, change: '+3.7%', unit: 'per 50kg', trend: 'up', today: 8900, yesterday: 8580 },
];

// ─── Price Card ──────────────────────────────────────────────
function PriceCard({ item, _responsive, t }) {
  const isUp = item.trend === 'up';
  const _changeColor = isUp ? colors.accent : '#E76F51';
  const variant = isUp ? 'success' : 'warning';

  return (
    <View style={[styles.priceCard, shadow.card]}>
      {/* Top row: Crop name & change badge */}
      <View style={styles.cardTop}>
        <Text style={textStyle.h3()}>{item.crop}</Text>
        <Badge
          label={item.change}
          variant={variant}
          size="sm"
        />
      </View>

      {/* Price display */}
      <View style={styles.priceDisplay}>
        <Text style={[textStyle.h2(), { color: colors.primary, marginBottom: spacing.xs }]}>
          ₹{item.price}
        </Text>
        <Text style={textStyle.bodySmall()}>{item.unit}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={{ flex: 1 }}>
          <Text style={[textStyle.bodySmall(), { color: colors.textMuted }]}>
            {t['marketPrice'] || 'Today'}
          </Text>
          <Text style={[textStyle.h3(), { color: colors.primary }]}>
            ₹{item.today}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[textStyle.bodySmall(), { color: colors.textMuted }]}>
            {t['yesterday'] || 'Yesterday'}
          </Text>
          <Text style={[textStyle.h3(), { color: colors.textSecondary }]}>
            ₹{item.yesterday}
          </Text>
        </View>
      </View>

      {/* Footer: Chart navigation */}
      <TouchableOpacity style={[styles.detailBtn, { borderColor: colors.primary, marginTop: spacing.md }]}>
        <Feather name="trending-up" size={16} color={colors.primary} />
        <Text style={[textStyle.bodySmall({ color: colors.primary, fontWeight: '700' })]}>
          {t['btn_get_7day_forecast'] || 'View 7-Day Forecast'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function MarketAI({ navigation }) {
  const { t } = useLang();
  const responsive = useResponsive();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [market, _setMarket] = useState(MARKET_DATA);
  const [selectedCropIdx, setSelectedCropIdx] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
      setError(null);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setError(null);
    setTimeout(() => {
      setRefreshing(false);
      // Could add API call here
    }, 1500);
  };

  // Filter market data or show all
  const displayedMarket = selectedCropIdx === 0 ? market : [market[selectedCropIdx - 1]];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={10}>
            <Feather name="arrow-left" size={22} color={colors.surface} />
          </TouchableOpacity>
          <Text style={textStyle.h2({ color: colors.surface })}>
            {t['screen_market_title'] || 'Market Prices'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Calculate market stats
  const prices = market.map(m => m.price);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b) / prices.length);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header ──────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.surface} />
        </TouchableOpacity>
        <Text style={textStyle.h2({ color: colors.surface })}>
          {t['screen_market_title'] || 'Market Prices'}
        </Text>
        <Badge label={t['powered_by_local_ai'] || 'AI Powered'} variant="success" size="sm" />
      </View>

      {/* ── Info Banner ─────────────────────────────────── */}
      <View style={[styles.banner, shadow.card]}>
        <MaterialCommunityIcons name="information" size={18} color={colors.info} />
        <Text style={[textStyle.bodySmall({ color: colors.info }), { flex: 1, marginLeft: spacing.sm }]}>
          {t['market_powered_xgboost'] || 'AI-powered prices updated daily. Regional variations may apply.'}
        </Text>
      </View>

      {/* ── Market Stats ────────────────────────────────── */}
      <View style={styles.statsContainer}>
        <StatBox
          label={t['stat_nitrogen'] || 'Average'}
          value={avgPrice}
          unit="₹"
          color={colors.primary}
          style={{ flex: 1 }}
        />
        <StatBox
          label="Highest"
          value={maxPrice}
          unit="₹"
          color={colors.accent}
          style={{ flex: 1 }}
        />
        <StatBox
          label="Lowest"
          value={minPrice}
          unit="₹"
          color={colors.warning}
          style={{ flex: 1 }}
        />
      </View>

      {/* ── Crop Selector ───────────────────────────────– */}
      <View style={{ marginVertical: spacing.md }}>
        <ChipFilterRow
          options={['All Crops', ...market.map(m => m.crop)]}
          selected={selectedCropIdx}
          onSelect={setSelectedCropIdx}
          keyNames={['All Crops', ...market.map(m => m.crop)]}
        />
      </View>

      {/* ── Error Alert ─────────────────────────────────── */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: '#ffebee' }]}>
          <MaterialCommunityIcons name="alert" size={18} color="#c62828" />
          <Text style={[textStyle.bodySmall({ color: '#c62828' }), { flex: 1, marginLeft: spacing.sm }]}>
            {error}
          </Text>
        </View>
      )}

      {/* ── Price List ──────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.pricesGrid}>
          {displayedMarket.map(item => (
            <PriceCard key={item.crop} item={item} responsive={responsive} t={t} />
          ))}
        </View>

        {/* ── Action Buttons ─────────────────────────── */}
        <View style={styles.actionButtons}>
          <AIButton
            label={t['btn_speak_prices'] || 'Hear Prices'}
            onPress={() => {}}
            variant="primary"
            style={{ flex: 1 }}
          />
          <AIButton
            label={t['btn_get_7day_forecast'] || 'Get 7-Day Forecast'}
            onPress={() => {}}
            variant="ghost"
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.disclaimer}>
          <Text style={[textStyle.bodySmall({ color: colors.textMuted }), styles.disclaimerText]}>
            Prices are indicative based on major agricultural markets. Please check with your local agricultural office for accurate pricing in your region.
          </Text>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    backgroundColor: colors.info + '15',
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  pricesGrid: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  priceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  priceDisplay: {
    paddingVertical: spacing.md,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  detailBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  disclaimer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  disclaimerText: {
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.lg,
  },
  errorBanner: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c62828',
  },
});
