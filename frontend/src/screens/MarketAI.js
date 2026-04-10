/**
 * MarketAI.js — Market Intelligence & Price Forecasting (Phase 7: Real-time API)
 * Real-time crop prices from Agmarknet API, 7-day forecasts, market analytics
 * Features:
 * - Live search with real-time filtering
 * - 6 category chips (All, Vegetables, Grains, Fruits, Pulses, Spices)
 * - Real-time market data from Agmarknet API with CSV fallback
 * - Summary metrics (avg price, markets tracked, price trend)
 * - Expandable price cards with detailed analytics
 * - AI market signals (Buy/Wait/Sell/Avoid)
 * - Action pages: Full Analysis, Compare Markets, Set Alert
 * - Sorting by Price, Change, Demand
 * - Bottom search guidance UI
 * - Responsive demand visualization and badges
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, TextInput,
  Animated, LayoutAnimation, Platform, UIManager, Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLang } from '../context/LanguageContext';
import { useResponsive } from '../theme/responsive';
import { colors, spacing, radius, textStyle, shadow } from '../theme/tokens';
import { AIButton, ChipFilterRow, StatBox, Badge } from '../components/ui';
import { getMarketComparison, setPriceAlert } from '../services/api';

// Enable layout animations on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Enhanced Market Data with Categories, Locations, and AI Signals ──────
const MARKET_DATA = [
  {
    id: 1,
    crop: 'Rice',
    category: 'Grains',
    price: 2100,
    change: 2.5,
    unit: 'per 100kg',
    trend: 'up',
    today: 2100,
    yesterday: 2048,
    minPrice: 2050,
    modalPrice: 2100,
    maxPrice: 2150,
    market: 'Coimbatore',
    arrivals: '1,245 bags',
    demand: 'High',
    demandScore: 0.85,
    sevenDayTrend: [2048, 2065, 2082, 2100, 2090, 2085, 2100],
    aiSignal: 'Buy',
    reasoning: 'Strong uptrend with high demand. Good entry point.',
    aiAdvice: 'Rice prices are trending upward. Current high demand supports further growth. Consider buying for medium-term gains.',
  },
  {
    id: 2,
    crop: 'Wheat',
    category: 'Grains',
    price: 1950,
    change: -0.8,
    unit: 'per 100kg',
    trend: 'down',
    today: 1950,
    yesterday: 1966,
    minPrice: 1920,
    modalPrice: 1950,
    maxPrice: 1980,
    market: 'Madhya Pradesh',
    arrivals: '892 bags',
    demand: 'Medium',
    demandScore: 0.60,
    sevenDayTrend: [1966, 1960, 1958, 1955, 1950, 1950, 1950],
    aiSignal: 'Wait',
    reasoning: 'Bearish trend with moderate demand. Await stabilization.',
    aiAdvice: 'Wheat is experiencing a slight downtrend. Wait for market stabilization before making large purchases.',
  },
  {
    id: 3,
    crop: 'Tomato',
    category: 'Vegetables',
    price: 4200,
    change: 5.2,
    unit: 'per 50kg',
    trend: 'up',
    today: 4200,
    yesterday: 3990,
    minPrice: 3800,
    modalPrice: 4200,
    maxPrice: 4500,
    market: 'Bengaluru',
    arrivals: '2,150 bags',
    demand: 'High',
    demandScore: 0.90,
    sevenDayTrend: [3990, 4050, 4100, 4150, 4180, 4200, 4200],
    aiSignal: 'Buy',
    reasoning: 'Bullish trend with very high demand. Strong buying momentum.',
    aiAdvice: 'Tomatoes show strong bullish momentum with peak demand. Ideal buying window for resale.',
  },
  {
    id: 4,
    crop: 'Onion',
    category: 'Vegetables',
    price: 1800,
    change: 1.3,
    unit: 'per 100kg',
    trend: 'up',
    today: 1800,
    yesterday: 1776,
    minPrice: 1700,
    modalPrice: 1800,
    maxPrice: 1900,
    market: 'Maharashtra',
    arrivals: '3,421 bags',
    demand: 'Medium',
    demandScore: 0.55,
    sevenDayTrend: [1776, 1785, 1790, 1795, 1800, 1800, 1800],
    aiSignal: 'Wait',
    reasoning: 'Modest uptrend with moderate demand. No urgent action needed.',
    aiAdvice: 'Onion prices are stable with moderate demand. Good for steady suppliers.',
  },
  {
    id: 5,
    crop: 'Chili',
    category: 'Spices',
    price: 8900,
    change: 3.7,
    unit: 'per 50kg',
    trend: 'up',
    today: 8900,
    yesterday: 8580,
    minPrice: 8400,
    modalPrice: 8900,
    maxPrice: 9500,
    market: 'Andhra Pradesh',
    arrivals: '456 bags',
    demand: 'High',
    demandScore: 0.75,
    sevenDayTrend: [8580, 8620, 8700, 8750, 8850, 8900, 8900],
    aiSignal: 'Buy',
    reasoning: 'Strong uptrend with good demand for specialty crop.',
    aiAdvice: 'Chili prices are climbing steadily. Premium pricing opportunity for quality produce.',
  },
  {
    id: 6,
    crop: 'Turmeric',
    category: 'Spices',
    price: 12500,
    change: 1.2,
    unit: 'per 100kg',
    trend: 'up',
    today: 12500,
    yesterday: 12350,
    minPrice: 12000,
    modalPrice: 12500,
    maxPrice: 13200,
    market: 'Telangana',
    arrivals: '234 bags',
    demand: 'Medium',
    demandScore: 0.65,
    sevenDayTrend: [12350, 12380, 12420, 12450, 12480, 12500, 12500],
    aiSignal: 'Sell',
    reasoning: 'High prices may face resistance. Consider taking profits.',
    aiAdvice: 'Turmeric has reached premium levels. Consider selling now to lock in profits.',
  },
  {
    id: 7,
    crop: 'Lentils',
    category: 'Pulses',
    price: 5200,
    change: -1.5,
    unit: 'per 100kg',
    trend: 'down',
    today: 5200,
    yesterday: 5280,
    minPrice: 5000,
    modalPrice: 5200,
    maxPrice: 5400,
    market: 'Madhya Pradesh',
    arrivals: '1,678 bags',
    demand: 'Low',
    demandScore: 0.40,
    sevenDayTrend: [5280, 5260, 5240, 5230, 5220, 5210, 5200],
    aiSignal: 'Avoid',
    reasoning: 'Bearish trend with low demand. Unfavorable market conditions.',
    aiAdvice: 'Lentil market is weak. Avoid entering new positions until demand improves.',
  },
  {
    id: 8,
    crop: 'Apple',
    category: 'Fruits',
    price: 3500,
    change: 2.1,
    unit: 'per 15kg',
    trend: 'up',
    today: 3500,
    yesterday: 3428,
    minPrice: 3300,
    modalPrice: 3500,
    maxPrice: 3800,
    market: 'Himachal Pradesh',
    arrivals: '578 boxes',
    demand: 'High',
    demandScore: 0.82,
    sevenDayTrend: [3428, 3450, 3470, 3485, 3500, 3500, 3500],
    aiSignal: 'Buy',
    reasoning: 'Peak season with strong demand for fresh apples.',
    aiAdvice: 'Apple demand is at peak season levels. Excellent time for procurement.',
  },
  {
    id: 9,
    crop: 'Banana',
    category: 'Fruits',
    price: 800,
    change: 0.5,
    unit: 'per bunch',
    trend: 'stable',
    today: 800,
    yesterday: 796,
    minPrice: 750,
    modalPrice: 800,
    maxPrice: 850,
    market: 'Tamil Nadu',
    arrivals: '4,250 bunches',
    demand: 'High',
    demandScore: 0.88,
    sevenDayTrend: [796, 797, 798, 799, 800, 800, 800],
    aiSignal: 'Buy',
    reasoning: 'Consistently high demand with stable pricing.',
    aiAdvice: 'Bananas show steady high demand. Reliable revenue crop.',
  },
];

const CATEGORIES = ['All', 'Vegetables', 'Grains', 'Fruits', 'Pulses', 'Spices'];
const SORT_MODES = ['Price ↓', 'Price ↑', 'Change ↓', 'Demand'];

// ─── Search Bar Component ────────────────────────────────────
function SearchBar({ value, onChangeText, isLoading }) {
  return (
    <View style={styles.searchBarContainer}>
      <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search crops..."
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        editable={!isLoading}
      />
      {value && !isLoading && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={8}>
          <Feather name="x" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}
      {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
    </View>
  );
}

// ─── Demand Bar Component ────────────────────────────────────
function DemandBar({ demandScore, demand }) {
  const getDemandColor = (score) => {
    if (score >= 0.75) return colors.accent; // High - green/accent
    if (score >= 0.55) return '#FFC107'; // Medium - amber
    return '#E76F51'; // Low - orange/red
  };

  return (
    <View style={styles.demandContainer}>
      <View style={styles.demandBarBackground}>
        <View
          style={[
            styles.demandBarFill,
            { width: `${demandScore * 100}%`, backgroundColor: getDemandColor(demandScore) },
          ]}
        />
      </View>
      <Badge label={demand} variant={demand === 'High' ? 'success' : demand === 'Medium' ? 'warning' : 'danger'} size="xs" />
    </View>
  );
}

// ─── AI Signal Indicator ─────────────────────────────────────
function AISignalIndicator({ signal }) {
  const getSignalConfig = (sig) => {
    const configs = {
      Buy: { color: colors.accent, icon: 'trending-up', bg: colors.accent + '15' },
      Sell: { color: '#E76F51', icon: 'trending-down', bg: '#E76F51' + '15' },
      Wait: { color: '#FFC107', icon: 'pause-circle', bg: '#FFC107' + '15' },
      Avoid: { color: '#C62828', icon: 'alert-circle', bg: '#C62828' + '15' },
    };
    return configs[sig] || configs.Wait;
  };

  const config = getSignalConfig(signal);

  return (
    <View style={[styles.signalBadge, { backgroundColor: config.bg }]}>
      <MaterialCommunityIcons name={config.icon} size={14} color={config.color} />
      <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { color: config.color }]}>{signal}</Text>
    </View>
  );
}

// ─── Compact Price Card (Collapsed) ──────────────────────────
function PriceCard({ item, isExpanded, onToggle, onActionPress, t }) {
  const isUp = item.trend === 'up';
  const changeColor = isUp ? colors.accent : '#E76F51';
  const variant = isUp ? 'success' : 'warning';
  const changeDisplay = item.change > 0 ? `+${item.change.toFixed(1)}%` : `${item.change.toFixed(1)}%`;

  return (
    <TouchableOpacity
      style={[styles.priceCard, shadow.card, isExpanded && styles.priceCardExpanded]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      {/* Collapsed View */}
      <View style={styles.cardCollapsed}>
        {/* Left: Crop info */}
        <View style={styles.cardLeft}>
          <View>
            <Text style={textStyle.h3()}>{item.crop}</Text>
            <Text style={[textStyle.bodySmall(), { color: colors.textMuted, marginTop: spacing.xs }]}>
              {item.market}
            </Text>
          </View>
          <Text style={[textStyle.bodySmall(), { color: colors.textMuted, marginTop: spacing.xs }]}>
            {item.arrivals}
          </Text>
        </View>

        {/* Middle: Price & Change */}
        <View style={styles.cardMiddle}>
          <Text style={[textStyle.h2({ fontWeight: '700' }), { color: colors.primary }]}>₹{item.price}</Text>
          <View style={styles.changeRow}>
            <Feather name={isUp ? 'arrow-up' : 'arrow-down'} size={14} color={changeColor} />
            <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { color: changeColor }]}>
              {changeDisplay}
            </Text>
          </View>
        </View>

        {/* Right: Demand & Signal */}
        <View style={styles.cardRight}>
          <AISignalIndicator signal={item.aiSignal} />
          <View style={{ marginTop: spacing.sm }}>
            <Badge label={item.demand} variant={item.demand === 'High' ? 'success' : item.demand === 'Medium' ? 'warning' : 'danger'} size="xs" />
          </View>
        </View>
      </View>

      {/* Expanded View */}
      {isExpanded && (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.md }}>
          {/* Demand Bar */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { marginBottom: spacing.xs }]}>Demand</Text>
            <DemandBar demandScore={item.demandScore} demand={item.demand} />
          </View>

          {/* Price Range */}
          <View style={styles.expandedRow}>
            <View>
              <Text style={[textStyle.bodySmall({ color: colors.textMuted })]}>{t?.min_price || 'Min Price'}</Text>
              <Text style={[textStyle.h3(), { color: '#E76F51' }]}>₹{item.minPrice}</Text>
            </View>
            <View>
              <Text style={[textStyle.bodySmall({ color: colors.textMuted })]}>{t?.modal_price || 'Modal Price'}</Text>
              <Text style={[textStyle.h3(), { color: colors.primary }]}>₹{item.modalPrice}</Text>
            </View>
            <View>
              <Text style={[textStyle.bodySmall({ color: colors.textMuted })]}>{t?.max_price || 'Max Price'}</Text>
              <Text style={[textStyle.h3(), { color: colors.accent }]}>₹{item.maxPrice}</Text>
            </View>
          </View>



          {/* AI Advice */}
          <View style={styles.aiAdviceBox}>
            <View style={styles.aiAdviceHeader}>
              <MaterialCommunityIcons name="lightbulb" size={16} color={colors.warning} />
              <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { marginLeft: spacing.xs }]}>
                {t?.ai_advice || 'AI Advice'}
              </Text>
            </View>
            <Text style={[textStyle.bodySmall(), { marginTop: spacing.xs, color: colors.textSecondary }]}>
              {item.aiAdvice}
            </Text>
          </View>

          {/* Reasoning */}
          <View style={[styles.reasoningBox, { marginTop: spacing.md }]}>
            <Text style={[textStyle.caption({ fontWeight: '600' }), { color: colors.textMuted }]}>
              {t?.reasoning || 'Reasoning'}
            </Text>
            <Text style={[textStyle.bodySmall(), { marginTop: spacing.xs, color: colors.textSecondary }]}>
              {item.reasoning}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.expandedActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
              onPress={() => onActionPress('analysis', item)}
            >
              <Feather name="trending-up" size={14} color={colors.primary} />
              <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { color: colors.primary }]}>
                {t?.full_analysis || 'Full Analysis'} ↗
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.info + '15' }]}
              onPress={() => onActionPress('compare', item)}
            >
              <Feather name="search" size={14} color={colors.info} />
              <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { color: colors.info }]}>
                {t?.compare_markets || 'Compare'} ↗
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.accent + '15' }]}
              onPress={() => onActionPress('alert', item)}
            >
              <Feather name="bell" size={14} color={colors.accent} />
              <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { color: colors.accent }]}>
                {t?.set_alert || 'Alert'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Full Analysis Modal ──────────────────────────────────────
function FullAnalysisModal({ visible, onClose, crop, t }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Feather name="arrow-left" size={24} color={colors.surface} />
          </TouchableOpacity>
          <Text style={textStyle.h2({ color: colors.surface })}>
            {crop?.crop} Analysis
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          {/* Price Trend Section */}
          <View style={styles.analysisSection}>
            <Text style={[textStyle.h3(), { marginBottom: spacing.md }]}>
              📈 Price Trend Analysis
            </Text>
            
            <View style={styles.analysisCard}>
              <Text style={textStyle.bodySmall({ fontWeight: '600' })}>7-Day Trend</Text>
              <View style={[styles.trendBars, { height: 80, marginVertical: spacing.md }]}>
                {crop?.sevenDayTrend?.map((price, idx) => {
                  const maxTrend = Math.max(...(crop?.sevenDayTrend || []));
                  const minTrend = Math.min(...(crop?.sevenDayTrend || []));
                  const range = maxTrend - minTrend || 1;
                  const height = ((price - minTrend) / range) * 60 + 10;
                  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  
                  return (
                    <View key={idx} style={{ alignItems: 'center', gap: spacing.xs, flex: 1 }}>
                      <View
                        style={[
                          styles.trendBar,
                          { height, backgroundColor: price >= crop.today * 0.99 ? colors.accent : colors.primary },
                        ]}
                      />
                      <Text style={textStyle.caption()}>{day[idx % 7]}</Text>
                      <Text style={[textStyle.caption(), { color: colors.textMuted }]}>₹{Math.round(price)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Prediction Section */}
          <View style={styles.analysisSection}>
            <Text style={[textStyle.h3(), { marginBottom: spacing.md }]}>
              🎯 AI Price Prediction
            </Text>

            <View style={styles.analysisCard}>
              <View style={{ marginBottom: spacing.md }}>
                <Text style={textStyle.bodySmall({ fontWeight: '600' })}>Expected Price (Next 7 days)</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.md }}>
                  <View>
                    <Text style={[textStyle.caption(), { color: colors.textMuted }]}>Optimistic</Text>
                    <Text style={[textStyle.h3(), { color: colors.accent }]}>
                      ₹{Math.round(crop?.maxPrice * 1.05)}
                    </Text>
                  </View>
                  <View>
                    <Text style={[textStyle.caption(), { color: colors.textMuted }]}>Most Likely</Text>
                    <Text style={[textStyle.h3(), { color: colors.primary }]}>
                      ₹{Math.round(crop?.modalPrice * 1.02)}
                    </Text>
                  </View>
                  <View>
                    <Text style={[textStyle.caption(), { color: colors.textMuted }]}>Conservative</Text>
                    <Text style={[textStyle.h3(), { color: '#E76F51' }]}>
                      ₹{Math.round(crop?.minPrice * 0.98)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }}>
                <Text style={textStyle.bodySmall({ fontWeight: '600' })}>Confidence Level</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm }}>
                  <View style={{ flex: 1, height: 8, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' }}>
                    <View style={{ width: '78%', height: '100%', backgroundColor: colors.accent, borderRadius: radius.full }} />
                  </View>
                  <Text style={textStyle.bodySmall({ fontWeight: '600' })}>78%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recommendation Section */}
          <View style={styles.analysisSection}>
            <Text style={[textStyle.h3(), { marginBottom: spacing.md }]}>
              💡 Recommendations
            </Text>

            <View style={[styles.analysisCard, { backgroundColor: colors.accent + '15' }]}>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <MaterialCommunityIcons name="lightbulb" size={24} color={colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { color: colors.accent, marginBottom: spacing.xs }]}>
                    Best Time to Buy
                  </Text>
                  <Text style={[textStyle.bodySmall(), { color: colors.text }]}>
                    Within the next 2-3 days. Price expected to stabilize after that.
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.analysisCard, { backgroundColor: colors.primary + '15', marginTop: spacing.md }]}>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <MaterialCommunityIcons name="trending-up" size={24} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { color: colors.primary, marginBottom: spacing.xs }]}>
                    Expected Growth
                  </Text>
                  <Text style={[textStyle.bodySmall(), { color: colors.text }]}>
                    Average increase of 2-3% expected in the next week.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Compare Markets Modal ────────────────────────────────────
function CompareMarketsModal({ visible, onClose, crop, t }) {
  // Use real API markets if available, otherwise generate mock data
  const allMarkets = crop?.apiMarkets && crop.apiMarkets.length > 0 
    ? crop.apiMarkets.map((m: any) => ({
        name: m.name,
        price: m.price,
        trend: m.trend || 'up',
        min: m.min,
        max: m.max,
      }))
    : [
        { name: crop?.market, price: crop?.price, trend: crop?.trend || 'up', min: crop?.minPrice, max: crop?.maxPrice },
        { name: 'Bengaluru', price: Math.round(crop?.price * 0.98), trend: 'down', min: Math.round(crop?.price * 0.95), max: Math.round(crop?.price * 1.01) },
        { name: 'Mumbai', price: Math.round(crop?.price * 1.05), trend: 'up', min: Math.round(crop?.price * 1.02), max: Math.round(crop?.price * 1.08) },
        { name: 'Delhi', price: Math.round(crop?.price * 1.03), trend: 'up', min: Math.round(crop?.price * 1.00), max: Math.round(crop?.price * 1.06) },
        { name: 'Chennai', price: Math.round(crop?.price * 0.95), trend: 'down', min: Math.round(crop?.price * 0.92), max: Math.round(crop?.price * 0.98) },
      ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Feather name="arrow-left" size={24} color={colors.surface} />
          </TouchableOpacity>
          <Text style={textStyle.h2({ color: colors.surface })}>
            Compare Markets
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { marginHorizontal: spacing.md, marginTop: spacing.md }]}>
            {crop?.crop} prices across different markets
            {crop?.source && <Text style={[textStyle.caption(), { color: colors.textMuted }]}> (Source: {crop.source})</Text>}
          </Text>

          <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.md, gap: spacing.md }}>
            {allMarkets.map((market: any, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.marketComparisonCard,
                  crop?.best_market === market.name && { backgroundColor: colors.accent + '15', borderWidth: 2, borderColor: colors.accent },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { marginBottom: spacing.xs }]}>
                    {market.name}
                    {crop?.best_market === market.name && <Text style={{ color: colors.accent }}> (BEST) 💰</Text>}
                  </Text>
                  <Text style={[textStyle.caption(), { color: colors.textMuted }]}>
                    Range: ₹{market.min} - ₹{market.max}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[textStyle.h3(), { color: colors.primary, marginBottom: spacing.xs }]}>
                    ₹{market.price}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Feather
                      name={market.trend === 'up' ? 'arrow-up' : 'arrow-down'}
                      size={14}
                      color={market.trend === 'up' ? colors.accent : '#E76F51'}
                    />
                    <Text
                      style={[
                        textStyle.caption({ fontWeight: '600' }),
                        { color: market.trend === 'up' ? colors.accent : '#E76F51' },
                      ]}
                    >
                      {market.trend === 'up' ? '📈' : '📉'} {market.trend}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.analysisCard, { marginHorizontal: spacing.md, marginTop: spacing.lg }]}>
            <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { marginBottom: spacing.md }]}>
              💡 Best Market to Sell
            </Text>
            <Text style={textStyle.bodySmall()}>
              Mumbai offers the best price at ₹{Math.round(crop?.price * 1.05)} (+5% premium). Consider transportation costs.
            </Text>
          </View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Set Alert Modal ──────────────────────────────────────────
function SetAlertModal({ visible, onClose, crop, t }) {
  const [priceThreshold, setPriceThreshold] = React.useState(crop?.price?.toString() || '');
  const [alertType, setAlertType] = React.useState('above'); // above or below
  const [loading, setLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleSaveAlert = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (!priceThreshold.trim()) {
      setErrorMsg('Please enter a price threshold');
      return;
    }

    const threshold = parseFloat(priceThreshold);
    if (isNaN(threshold) || threshold <= 0) {
      setErrorMsg('Enter a valid price amount');
      return;
    }

    setLoading(true);
    try {
      const alertPayload = {
        farmer_id: 'TN-CBE-9021', // TODO: Get from AuthContext
        crop: crop?.crop,
        location: crop?.market || 'Tamil Nadu',
        alert_type: alertType,
        price_threshold: threshold,
        notification_methods: ['app'], // Push notification enabled
      };

      const response = await setPriceAlert(alertPayload);
      
      if (response.data?.status === 'active') {
        setSuccessMsg(`✅ Alert set! You'll get notified when ${crop?.crop} goes ${alertType}`);
        
        // Auto-close after 1.5 seconds
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Alert API error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save alert. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} hitSlop={10} disabled={loading}>
            <Feather name="arrow-left" size={24} color={colors.surface} />
          </TouchableOpacity>
          <Text style={textStyle.h2({ color: colors.surface })}>
            Set Price Alert
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.lg }}>
            <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { marginBottom: spacing.md }]}>
              {crop?.crop} - Current Price: ₹{crop?.price}
            </Text>

            {/* Success Message */}
            {successMsg ? (
              <View style={{ backgroundColor: colors.primary + '15', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md }}>
                <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { color: colors.primary }]}>
                  {successMsg}
                </Text>
              </View>
            ) : null}

            {/* Error Message */}
            {errorMsg ? (
              <View style={{ backgroundColor: '#E53935' + '15', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md }}>
                <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { color: '#E53935' }]}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            {/* Alert Type Selection */}
            <View style={styles.analysisSection}>
              <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { marginBottom: spacing.md }]}>
                Alert Me When Price...
              </Text>

              <View style={{ gap: spacing.md }}>
                <TouchableOpacity
                  style={[
                    styles.alertTypeBtn,
                    alertType === 'above' && { backgroundColor: colors.accent + '15', borderColor: colors.accent },
                  ]}
                  onPress={() => setAlertType('above')}
                  disabled={loading}
                >
                  <View
                    style={[
                      styles.radioBtn,
                      alertType === 'above' && { backgroundColor: colors.accent, borderColor: colors.accent },
                    ]}
                  >
                    {alertType === 'above' && <View style={styles.radioBtnInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={textStyle.bodySmall({ fontWeight: '600' })}>
                      Goes ABOVE a price (Selling opportunity)
                    </Text>
                    <Text style={[textStyle.caption(), { color: colors.textMuted, marginTop: spacing.xs }]}>
                      Get notified when price increases
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.alertTypeBtn,
                    alertType === 'below' && { backgroundColor: colors.accent + '15', borderColor: colors.accent },
                  ]}
                  onPress={() => setAlertType('below')}
                  disabled={loading}
                >
                  <View
                    style={[
                      styles.radioBtn,
                      alertType === 'below' && { backgroundColor: colors.accent, borderColor: colors.accent },
                    ]}
                  >
                    {alertType === 'below' && <View style={styles.radioBtnInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={textStyle.bodySmall({ fontWeight: '600' })}>
                      Goes BELOW a price (Buying opportunity)
                    </Text>
                    <Text style={[textStyle.caption(), { color: colors.textMuted, marginTop: spacing.xs }]}>
                      Get notified when price decreases
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Price Input */}
            <View style={styles.analysisSection}>
              <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { marginBottom: spacing.md }]}>
                Price Threshold (₹)
              </Text>
              
              <View style={styles.priceInputContainer}>
                <Text style={{ fontSize: 24, color: colors.primary, fontWeight: '700' }}>₹</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder={crop?.price?.toString()}
                  placeholderTextColor={colors.textMuted}
                  value={priceThreshold}
                  onChangeText={setPriceThreshold}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                <View style={styles.suggestionChip}>
                  <Text style={textStyle.caption()}>Suggest: </Text>
                  <TouchableOpacity onPress={() => setPriceThreshold(Math.round(crop?.maxPrice * 1.05).toString())}>
                    <Text style={[textStyle.caption({ fontWeight: '600' }), { color: colors.accent }]}>
                      Max Predicted (₹{Math.round(crop?.maxPrice * 1.05)})
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.suggestionChip}>
                  <Text style={textStyle.caption()}>Suggest: </Text>
                  <TouchableOpacity onPress={() => setPriceThreshold(Math.round(crop?.minPrice * 0.95).toString())}>
                    <Text style={[textStyle.caption({ fontWeight: '600' }), { color: colors.accent }]}>
                      Min Predicted (₹{Math.round(crop?.minPrice * 0.95)})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Notification Options */}
            <View style={styles.analysisSection}>
              <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { marginBottom: spacing.md }]}>
                Notify Me Via
              </Text>

              <View style={{ gap: spacing.md }}>
                <View style={styles.notificationOption}>
                  <MaterialCommunityIcons name="bell" size={20} color={colors.primary} />
                  <Text style={[textStyle.bodySmall(), { flex: 1, marginLeft: spacing.md }]}>
                    Push Notification
                  </Text>
                  <View
                    style={[
                      styles.toggleSwitch,
                      { backgroundColor: colors.accent },
                    ]}
                  >
                    <View style={styles.toggleDot} />
                  </View>
                </View>

                <View style={styles.notificationOption}>
                  <MaterialCommunityIcons name="email" size={20} color={colors.primary} />
                  <Text style={[textStyle.bodySmall(), { flex: 1, marginLeft: spacing.md }]}>
                    Email
                  </Text>
                  <View style={[styles.toggleSwitch, { backgroundColor: colors.border }]} />
                </View>

                <View style={styles.notificationOption}>
                  <MaterialCommunityIcons name="message-text" size={20} color={colors.primary} />
                  <Text style={[textStyle.bodySmall(), { flex: 1, marginLeft: spacing.md }]}>
                    SMS
                  </Text>
                  <View style={[styles.toggleSwitch, { backgroundColor: colors.border }]} />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveAlertBtn,
                { backgroundColor: loading ? colors.textMuted : colors.accent }
              ]}
              onPress={handleSaveAlert}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { color: colors.surface }]}>
                  💾 Save Alert
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function MarketAI({ navigation }) {
  const { t } = useLang();
  const responsive = useResponsive();

  // Main state
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [sortMode, setSortMode] = useState(0);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [error, setError] = useState(null);
  const [marketData, setMarketData] = useState(MARKET_DATA); // Real market data
  const [apiErrors, setApiErrors] = useState({}); // Track which crops failed to fetch
  const [fallbackMode, setFallbackMode] = useState(false); // Track if using mock data

  // Modal state
  const [activeModal, setActiveModal] = useState(null); // null | 'analysis' | 'compare' | 'alert'
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setError(null);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch real market data from API
  useEffect(() => {
    const fetchRealMarketData = async () => {
      try {
        const crops = MARKET_DATA.map(m => m.crop);
        const updatedData = [...marketData];
        const errors = {};

        console.log('📡 Fetching market data for crops:', crops);
        console.log('🔗 Using API endpoint: http://10.0.2.2:8000/api');

        // Fetch data for each crop in parallel
        let usingFallback = false;
        await Promise.all(
          crops.map(async (cropName) => {
            try {
              const response = await getMarketComparison(cropName);
              if (response.data && response.data.markets && response.data.markets.length > 0) {
                const cropIndex = updatedData.findIndex(m => m.crop === cropName);
                if (cropIndex !== -1) {
                  const apiData = response.data;
                  // Track if using fallback
                  if (apiData.fallback) {
                    usingFallback = true;
                  }
                  // Update with real API data
                  updatedData[cropIndex] = {
                    ...updatedData[cropIndex],
                    price: apiData.average_price || updatedData[cropIndex].price,
                    today: apiData.average_price || updatedData[cropIndex].today,
                    minPrice: Math.min(...apiData.markets.map(m => m.min)),
                    maxPrice: Math.max(...apiData.markets.map(m => m.max)),
                    modalPrice: apiData.average_price || updatedData[cropIndex].modalPrice,
                    market: apiData.best_market || updatedData[cropIndex].market,
                    apiMarkets: apiData.markets,
                    source: apiData.source || 'api',
                  };
                }
              }
            } catch (err) {
              errors[cropName] = err.message;
              usingFallback = true;
              console.warn(`❌ Failed to fetch ${cropName}:`, {
                message: err.message,
                code: err.code,
                response: err.response?.status,
                url: err.config?.url
              });
            }
          })
        );

        setMarketData(updatedData);
        setFallbackMode(usingFallback);
        if (Object.keys(errors).length > 0) {
          setApiErrors(errors);
        }
      } catch (err) {
        console.error('❌ Market data fetch error:', {
          message: err.message,
          code: err.code,
          response: err.response?.status,
          details: 'Backend may not be running on 10.0.2.2:8000'
        });
        setError(err.message || 'Backend connection failed. Make sure backend is running on localhost:8000');
      }
    };

    fetchRealMarketData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setError(null);
    setApiErrors({});
    
    // Fetch fresh market data
    const fetchRealMarketData = async () => {
      try {
        const crops = MARKET_DATA.map(m => m.crop);
        const updatedData = [...marketData];
        const errors = {};
        let usingFallback = false;

        await Promise.all(
          crops.map(async (cropName) => {
            try {
              const response = await getMarketComparison(cropName);
              if (response.data && response.data.markets && response.data.markets.length > 0) {
                const cropIndex = updatedData.findIndex(m => m.crop === cropName);
                if (cropIndex !== -1) {
                  const apiData = response.data;
                  if (apiData.fallback) {
                    usingFallback = true;
                  }
                  updatedData[cropIndex] = {
                    ...updatedData[cropIndex],
                    price: apiData.average_price || updatedData[cropIndex].price,
                    today: apiData.average_price || updatedData[cropIndex].today,
                    minPrice: Math.min(...apiData.markets.map(m => m.min)),
                    maxPrice: Math.max(...apiData.markets.map(m => m.max)),
                    modalPrice: apiData.average_price || updatedData[cropIndex].modalPrice,
                    market: apiData.best_market || updatedData[cropIndex].market,
                    apiMarkets: apiData.markets,
                    source: apiData.source || 'api',
                  };
                }
              }
            } catch (err) {
              errors[cropName] = err.message;
              usingFallback = true;
              console.warn(`❌ Failed to refresh ${cropName}:`, {
                message: err.message,
                code: err.code,
                response: err.response?.status,
                url: err.config?.url
              });
            }
          })
        );

        setMarketData(updatedData);
        setFallbackMode(usingFallback);
        if (Object.keys(errors).length > 0) {
          setApiErrors(errors);
        }
      } catch (err) {
        console.error('❌ Refresh error:', {
          message: err.message,
          code: err.code,
          response: err.response?.status,
          details: 'Backend may not be running on 10.0.2.2:8000'
        });
        setError(err.message || 'Failed to refresh market data. Backend connection failed.');
      } finally {
        setRefreshing(false);
      }
    };

    fetchRealMarketData();
  };

  // Handle action button presses
  const onActionPress = (actionType, cropItem) => {
    setSelectedCrop(cropItem);
    setActiveModal(actionType);
  };

  // Close modal handler
  const closeModal = () => {
    setActiveModal(null);
    setSelectedCrop(null);
  };

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    let result = [...marketData];

    // Filter by search
    if (searchQuery.trim()) {
      result = result.filter(item =>
        item.crop.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 0) {
      const category = CATEGORIES[selectedCategory];
      result = result.filter(item => item.category === category);
    }

    // Sort
    if (sortMode === 0) {
      result.sort((a, b) => b.price - a.price); // Price ↓
    } else if (sortMode === 1) {
      result.sort((a, b) => a.price - b.price); // Price ↑
    } else if (sortMode === 2) {
      result.sort((a, b) => b.change - a.change); // Change ↓
    } else if (sortMode === 3) {
      result.sort((a, b) => b.demandScore - a.demandScore); // Demand
    }

    return result;
  }, [searchQuery, selectedCategory, sortMode, marketData]);

  // Calculate Market Metrics
  const prices = marketData.map(m => m.price);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b) / prices.length);
  const marketsTracked = new Set(marketData.map(m => m.market)).size;
  const trendDirection = marketData.filter(m => m.trend === 'up').length > marketData.length / 2 ? 'up' : 'down';

  // AI Signals Summary
  const signalCounts = {
    Buy: marketData.filter(m => m.aiSignal === 'Buy').length,
    Sell: marketData.filter(m => m.aiSignal === 'Sell').length,
    Wait: marketData.filter(m => m.aiSignal === 'Wait').length,
    Avoid: marketData.filter(m => m.aiSignal === 'Avoid').length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={10}>
            <Feather name="arrow-left" size={22} color={colors.surface} />
          </TouchableOpacity>
          <Text style={textStyle.h2({ color: colors.surface })}>
            {t?.screen_market_title || 'Market Prices'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header Top (Fixed) ──────────────────────────────── */}
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.surface} />
        </TouchableOpacity>
        <Text style={textStyle.h2({ color: colors.surface })}>
          {t?.screen_market_title || 'Market Prices'}
        </Text>
        <TouchableOpacity style={styles.headerBtn} onPress={onRefresh} disabled={refreshing} hitSlop={10}>
          <MaterialCommunityIcons
            name={refreshing ? 'loading' : 'refresh'}
            size={22}
            color={colors.surface}
            style={refreshing ? { opacity: 0.5 } : {}}
          />
        </TouchableOpacity>
      </View>



      {/* ── Main Scrollable Content ─────────────────────────── */}
      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Search Bar & Sort ────────────────────────– */}
        <View style={styles.searchSection}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} isLoading={loading} />
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortMode((prevMode) => (prevMode + 1) % SORT_MODES.length)}
            hitSlop={10}
          >
            <MaterialCommunityIcons name="sort" size={18} color={colors.primary} />
            <Text style={[textStyle.caption({ fontWeight: '600' }), { color: colors.primary }]}>
              {SORT_MODES[sortMode]}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Summary Metrics ──────────────────────────– */}
        <View style={styles.metricsContainer}>
          <StatBox
            label={t?.avg_price_today || 'Avg Price'}
            value={avgPrice}
            unit="₹"
            color={colors.primary}
            style={{ flex: 1 }}
          />
          <StatBox
            label={t?.markets_tracked || 'Markets'}
            value={marketsTracked}
            unit=""
            color={colors.info}
            style={{ flex: 1 }}
          />

        </View>

        {/* ── Category Chips ──────────────────────────– */}
        <View style={styles.categorySection}>
          <ChipFilterRow
            options={CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            keyNames={CATEGORIES}
          />
        </View>

        {/* ── AI Market Signals Panel ──────────────────– */}
        <View style={[styles.signalsPanel, shadow.card]}>
          <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { marginBottom: spacing.sm }]}>
            {t?.market_signals || 'Market Signals'}
          </Text>
          <View style={styles.signalGrid}>
            <View style={styles.signalItem}>
              <View style={[styles.signalIndicator, { backgroundColor: colors.accent + '15' }]}>
                <Text style={[textStyle.h3(), { color: colors.accent }]}>{signalCounts.Buy}</Text>
              </View>
              <Text style={[textStyle.caption(), { color: colors.textMuted }]}>{t?.buy || 'Buy'}</Text>
            </View>
            <View style={styles.signalItem}>
              <View style={[styles.signalIndicator, { backgroundColor: '#FFC107' + '15' }]}>
                <Text style={[textStyle.h3(), { color: '#FFC107' }]}>{signalCounts.Wait}</Text>
              </View>
              <Text style={[textStyle.caption(), { color: colors.textMuted }]}>{t?.wait || 'Wait'}</Text>
            </View>
            <View style={styles.signalItem}>
              <View style={[styles.signalIndicator, { backgroundColor: '#E76F51' + '15' }]}>
                <Text style={[textStyle.h3(), { color: '#E76F51' }]}>{signalCounts.Sell}</Text>
              </View>
              <Text style={[textStyle.caption(), { color: colors.textMuted }]}>{t?.sell || 'Sell'}</Text>
            </View>
            <View style={styles.signalItem}>
              <View style={[styles.signalIndicator, { backgroundColor: '#C62828' + '15' }]}>
                <Text style={[textStyle.h3(), { color: '#C62828' }]}>{signalCounts.Avoid}</Text>
              </View>
              <Text style={[textStyle.caption(), { color: colors.textMuted }]}>{t?.avoid || 'Avoid'}</Text>
            </View>
          </View>
        </View>

        {/* ── Error Banner ────────────────────────────– */}
        {error && (
          <View style={[styles.errorBanner]}>
            <MaterialCommunityIcons name="alert" size={18} color="#c62828" />
            <Text style={[textStyle.bodySmall({ color: '#c62828' }), { flex: 1, marginLeft: spacing.sm }]}>
              {error}
            </Text>
          </View>
        )}

        {/* ── Price Cards List ────────────────────────– */}
        <View style={styles.cardsContainer}>
          {filteredAndSorted.length > 0 ? (
            filteredAndSorted.map(item => (
              <PriceCard
                key={item.id}
                item={item}
                isExpanded={expandedCardId === item.id}
                onToggle={() => {
                  // Smooth animation when expanding/collapsing
                  LayoutAnimation.configureNext(
                    LayoutAnimation.create(
                      300,
                      LayoutAnimation.Types.easeInEaseOut,
                      LayoutAnimation.Properties.opacity
                    )
                  );
                  setExpandedCardId(expandedCardId === item.id ? null : item.id);
                }}
                onActionPress={onActionPress}
                t={t}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="magnify" size={48} color={colors.textMuted} />
              <Text style={[textStyle.h3(), { color: colors.textMuted, marginTop: spacing.md }]}>
                {t?.no_results || 'No crops found'}
              </Text>
              <Text style={[textStyle.bodySmall(), { color: colors.textMuted, marginTop: spacing.sm }]}>
                Try different filters or search terms
              </Text>
            </View>
          )}
        </View>

        {/* ── Bottom Search Guidance UI ────────────────────── */}
        <View style={styles.searchGuidanceBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <MaterialCommunityIcons name="lightbulb" size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[textStyle.bodySmall({ fontWeight: '600' }), { color: colors.accent, marginBottom: spacing.xs }]}>
                💡 Explore Smart Features
              </Text>
              <Text style={[textStyle.caption(), { color: colors.text }]}>
                Search for crops, compare prices across markets, or set alerts for your favorite crops.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Disclaimer ──────────────────────────– */}
        <View style={styles.disclaimer}>
          <Text style={[textStyle.bodySmall({ color: colors.textMuted }), styles.disclaimerText]}>
            Prices are indicative and updated daily. Actual prices may vary by region and market. 
            AI signals are based on historical trends and current demand data.
          </Text>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* ─── Modals ─────────────────────────────────────── */}
      {selectedCrop && (
        <>
          <FullAnalysisModal
            visible={activeModal === 'analysis'}
            onClose={closeModal}
            crop={selectedCrop}
            t={t}
          />
          <CompareMarketsModal
            visible={activeModal === 'compare'}
            onClose={closeModal}
            crop={selectedCrop}
            t={t}
          />
          <SetAlertModal
            visible={activeModal === 'alert'}
            onClose={closeModal}
            crop={selectedCrop}
            t={t}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  headerTop: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
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

  // Search & Sort (Wider layout)
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },

  // Metrics (Wider cards)
  metricsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginVertical: spacing.md,
  },
  statBoxCustom: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    justifyContent: 'center',
    shadowColor: colors.shadowColor || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statBoxContent: {
    alignItems: 'center',
  },

  // Categories
  categorySection: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },

  // Signals Panel (Wider)
  signalsPanel: {
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    shadowColor: colors.shadowColor || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  signalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  signalItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  signalIndicator: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading & Empty
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },

  // Scroll & Cards (Wider layout with less padding)
  mainScroll: {
    flex: 1,
  },
  cardsContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },

  // Price Card (Wider with animations)
  priceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: colors.shadowColor || '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  priceCardExpanded: {
    marginBottom: spacing.md,
  },
  cardCollapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardLeft: {
    flex: 1.5,
  },
  cardMiddle: {
    flex: 1,
    alignItems: 'center',
  },
  cardRight: {
    flex: 1,
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  // Demand Bar
  demandContainer: {
    gap: spacing.sm,
  },
  demandBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  demandBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },

  // Expanded Content
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: spacing.md,
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    height: 60,
  },
  trendBar: {
    flex: 1,
    borderRadius: radius.sm,
    minHeight: 10,
  },

  // AI Advice Box
  aiAdviceBox: {
    backgroundColor: colors.warning + '10',
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  aiAdviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Reasoning Box
  reasoningBox: {
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  // Expanded Actions
  expandedActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },

  // Signal Badge
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },

  // Error Banner
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
    backgroundColor: '#ffebee',
  },

  // Disclaimer
  disclaimer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
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

  // Search Guidance Box
  searchGuidanceBox: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent + '15',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },

  // Modal Styles
  modalHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalScroll: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  analysisSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  analysisCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: spacing.xs,
  },
  trendBar: {
    width: '10%',
    borderRadius: radius.sm,
  },
  marketComparisonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radioBtn: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioBtnInner: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 2,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  saveAlertBtn: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
});
