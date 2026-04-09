import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Modal,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLang } from '../context/LanguageContext';
import { VoiceFAB } from '../components/ui';
import { speak } from '../services/voiceService';


// ─── Constants ────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

const COLORS = {
  primary:      '#1B4332',
  primaryLight: '#2D6A4F',
  accent:       '#52B788',
  accentMuted:  '#D8F3DC',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F4F6F0',
  border:       '#D8E4DC',
  textPrimary:  '#1A1A1A',
  textSecondary:'#4A4A4A',
  textMuted:    '#7A7A7A',
  warning:      '#F4A261',
  danger:       '#E76F51',
  info:         '#4895EF',
  gold:         '#D4A017',
};

// ─── Image URLs ───────────────────────────────────────────────
const IMG = {
  hero:     'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  scan:     'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=75',
  soil:     'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=75',
  market:   'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=75',
  schemes:  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=75',
  loans:    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=75',
  calendar: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=75',
  library:  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=75',
  passport: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=400&q=75',
  weather:  'https://images.unsplash.com/photo-1504608524841-42584120d336?w=300&q=70',
};

// Fallback if Unsplash is unreachable
const FALLBACK = {
  hero:     'https://picsum.photos/seed/farm-hero/800/400',
  scan:     'https://picsum.photos/seed/leaf-scan/400/200',
  soil:     'https://picsum.photos/seed/soil-lab/400/200',
  market:   'https://picsum.photos/seed/market-ai/400/200',
  schemes:  'https://picsum.photos/seed/gov-schemes/400/200',
  loans:    'https://picsum.photos/seed/loan-adv/400/200',
  calendar: 'https://picsum.photos/seed/crop-cal/400/200',
  library:  'https://picsum.photos/seed/disease-lib/400/200',
  passport: 'https://picsum.photos/seed/farm-pass/400/200',
  weather:  'https://picsum.photos/seed/weather-bg/300/150',
};

// ─── Sub-components ───────────────────────────────────────────

/** A single feature card — with background image only, no icons */
function FeatureCard({ labelKey, icon, iconLib, onPress, accentColor, imageKey }) {
  const { t } = useLang();
  const scale = useRef(new Animated.Value(1)).current;
  const [imageError, setImageError] = useState(false);

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  const bg = accentColor || COLORS.primary;
  
  // Get image URL, fallback to solid color if not available
  const imageUrl = imageKey ? (IMG[imageKey] || FALLBACK[imageKey]) : null;

  return (
    <Animated.View style={[styles.featureCard, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.featureCardInner}
      >
        {/* Background Image or Solid Color */}
        {imageUrl && !imageError ? (
          <ImageBackground
            source={{ uri: imageUrl }}
            onError={() => setImageError(true)}
            resizeMode="cover"
            style={[styles.featureImageWrap, { backgroundColor: bg }]}
          >
            {/* Subtle overlay for readability */}
            <View style={styles.featureImageOverlay} />
          </ImageBackground>
        ) : (
          <View style={[styles.featureImageWrap, { backgroundColor: bg }]}>
            <View style={[styles.featureImageOverlay, { backgroundColor: 'rgba(0,0,0,0.15)' }]} />
          </View>
        )}
        {/* Label */}
        <View style={styles.featureLabel}>
          <Text style={styles.featureLabelText} numberOfLines={2}>
            {t[labelKey] || labelKey}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/** Weather stat pill */
function WeatherStat({ icon, value, unit, label }) {
  return (
    <View style={styles.weatherStat}>
      <Feather name={icon} size={16} color={COLORS.accent} />
      <Text style={styles.weatherStatValue}>{value}<Text style={styles.weatherStatUnit}>{unit}</Text></Text>
      <Text style={styles.weatherStatLabel}>{label}</Text>
    </View>
  );
}

/** Farm score ring — simple circular indicator */
function ScoreRing({ score }) {
  const color = score >= 75 ? COLORS.accent : score >= 50 ? COLORS.warning : COLORS.danger;
  return (
    <View style={styles.scoreRing}>
      <View style={[styles.scoreRingInner, { borderColor: color }]}>
        <Text style={[styles.scoreValue, { color }]}>{score}</Text>
        <Text style={styles.scoreLabel}>score</Text>
      </View>
    </View>
  );
}

// ─── Navigation Helper ────────────────────────────────────────
const safeNavigate = (navigation, tabName) => {
  try {
    const parent = navigation?.getParent?.();
    if (parent && parent.navigate) {
      parent.navigate(tabName);
    } else {
      console.warn(`Could not navigate to ${tabName} - parent not available, attempting direct navigate`);
      navigation?.navigate?.(tabName);
    }
  } catch (e) {
    console.error(`Navigation to ${tabName} failed:`, e.message);
  }
};

const safeNavigateNested = (navigation, screenName) => {
  try {
    if (navigation?.navigate) {
      navigation.navigate(screenName);
    } else {
      console.error(`Cannot navigate to ${screenName} - navigation prop missing`);
    }
  } catch (e) {
    console.error(`Navigation to ${screenName} failed:`, e.message);
  }
};

// ─── Feature data ─────────────────────────────────────────────
const makeFeatures = (navigation) => [
  {
    id: 'scan',
    imageKey: 'scan',
    labelKey: 'feature_ai_scan',
    icon: 'aperture',
    iconLib: 'feather',
    accentColor: '#2D6A4F',
    onPress: () => safeNavigate(navigation, 'AI Scan'),
  },
  {
    id: 'soil',
    imageKey: 'soil',
    labelKey: 'feature_soil_lab',
    icon: 'thermometer',
    iconLib: 'feather',
    accentColor: '#795548',
    onPress: () => safeNavigateNested(navigation, 'SoilLab'),
  },
  {
    id: 'market',
    imageKey: 'market',
    labelKey: 'feature_market',
    icon: 'trending-up',
    iconLib: 'feather',
    accentColor: '#1565C0',
    onPress: () => safeNavigate(navigation, 'Market'),
  },
  {
    id: 'library',
    imageKey: 'library',
    labelKey: 'feature_library',
    icon: 'book-open',
    iconLib: 'feather',
    accentColor: '#6A1B9A',
    onPress: () => safeNavigate(navigation, 'Library'),
  },
  {
    id: 'schemes',
    imageKey: 'schemes',
    labelKey: 'feature_schemes',
    icon: 'shield',
    iconLib: 'feather',
    accentColor: '#00695C',
    onPress: () => safeNavigateNested(navigation, 'GovSchemes'),
  },
  {
    id: 'loans',
    imageKey: 'loans',
    labelKey: 'feature_loans',
    icon: 'credit-card',
    iconLib: 'feather',
    accentColor: '#4527A0',
    onPress: () => safeNavigate(navigation, 'Loans'),
  },
  {
    id: 'calendar',
    imageKey: 'calendar',
    labelKey: 'feature_calendar',
    icon: 'calendar',
    iconLib: 'feather',
    accentColor: '#E65100',
    onPress: () => safeNavigate(navigation, 'Calendar'),
  },
  {
    id: 'passport',
    imageKey: 'passport',
    labelKey: 'feature_passport',
    icon: 'map',
    iconLib: 'feather',
    accentColor: '#1B4332',
    onPress: () => safeNavigateNested(navigation, 'FarmPassport'),
  },
];

// ─── Main Component ───────────────────────────────────────────
export default function Dashboard({ navigation }) {
  const { t, lang, currentLanguage, setLanguage } = useLang();

  const [weather, setWeather] = useState(null);
  const [farmScore, setFarmScore] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [heroImgSrc, setHeroImgSrc] = useState(IMG.hero);
  const [loadingInsight, setLoadingInsight] = useState(true);
  
  // ── Phase 3 Enhancements ───
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'recording' | 'processing'
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [_farmLocked, _setFarmLocked] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setWeather({ temp: 28, humidity: 72, rain: 4 });
      setFarmScore(81);
      setAiInsight(t['briefText'] || 'Your crops are looking healthy today. Monitor humidity levels over the next 48 hours.');
      setLoadingInsight(false);
    }, 1200);
  }, [t, lang]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const features = makeFeatures(navigation);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Language Menu Modal ────────────────────────– */}
      <Modal
        visible={showLanguageMenu}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
      >
        <TouchableOpacity
          style={styles.languageModalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageMenu(false)}
        >
          <View style={styles.languageMenuSheet}>
            <View style={styles.languageMenuHandle} />
            <Text style={styles.languageMenuTitle}>Select Language</Text>
            {['en', 'ta', 'hi', 'te', 'ml'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.languageMenuItem}
                onPress={() => {
                  setLanguage(lang);
                  setShowLanguageMenu(false);
                }}
              >
                <Text style={currentLanguage === lang ? styles.languageMenuItemActive : styles.languageMenuItemText}>
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >

        {/* ── HERO BANNER ─────────────────────────────── */}
        <ImageBackground
          source={{ uri: IMG.hero }}
          resizeMode="cover"
          style={styles.hero}
          onError={() => console.log('Hero image failed to load')}
        >
          {/* Dark overlay */}
          <View style={[styles.heroOverlay, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />

          {/* Header row + indicators */}
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroGreeting}>{t['greeting'] || 'Hello, Farmer'}</Text>
              <Text style={styles.heroDate}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            </View>
            {/* Right side: lock indicator + language chip + notification */}
            <View style={styles.heroActions}>
              {_farmLocked && (
                <TouchableOpacity style={styles.lockIndicator}>
                  <Feather name="lock" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.languageChip}
                onPress={() => setShowLanguageMenu(true)}
              >
                <Text style={styles.languageChipText}>
                  {currentLanguage?.toUpperCase() || 'EN'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroBellBtn} onPress={() => {}}>
                <Feather name="bell" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Farm score + weather row */}
          <View style={styles.heroStats}>
            {farmScore !== null ? (
              <ScoreRing score={farmScore} />
            ) : (
              <ActivityIndicator color="#fff" />
            )}

            <View style={styles.weatherRow}>
              {weather ? (
                <>
                  <WeatherStat icon="sun" value={weather.temp} unit="°C" label={t['weatherTemp'] || 'Temp'} />
                  <WeatherStat icon="droplet" value={weather.humidity} unit="%" label={t['weatherHumidity'] || 'Humidity'} />
                  <WeatherStat icon="cloud-rain" value={weather.rain} unit="mm" label={t['weatherRain'] || 'Rain'} />
                </>
              ) : (
                [0,1,2].map(i => (
                  <View key={i} style={styles.weatherStatSkeleton} />
                ))
              )}
            </View>
          </View>
        </ImageBackground>

        {/* ── AI INSIGHT CARD ──────────────────────────── */}
        <View style={styles.insightCard}>
          <View style={styles.insightAccent} />
          <View style={styles.insightBody}>
            <View style={styles.insightHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="robot-outline" size={18} color={COLORS.primary} />
                <Text style={styles.insightTitle}>{t['todaysBrief'] || 'AI BRIEF'}</Text>
              </View>
              {!loadingInsight && (
                <TouchableOpacity
                  onPress={() => {
                    speak(aiInsight, currentLanguage);
                  }}
                >
                  <Feather name="volume-2" size={18} color={COLORS.accent} />
                </TouchableOpacity>
              )}
            </View>
            {loadingInsight ? (
              <>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: '70%' }]} />
              </>
            ) : (
              <Text style={styles.insightText}>{aiInsight}</Text>
            )}
          </View>
        </View>

        {/* ── SECTION HEADER ───────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t['solutions'] || 'Smart Solutions'}</Text>
        </View>

        {/* ── FEATURE GRID (2-column, side by side) ────── */}
        <View style={styles.featureGrid}>
          {features.map((item) => (
            <FeatureCard
              key={item.id}
              imageKey={item.imageKey}
              labelKey={item.labelKey}
              icon={item.icon}
              iconLib={item.iconLib}
              onPress={item.onPress}
              accentColor={item.accentColor}
            />
          ))}
          {/* If odd number of features, add an empty spacer to keep grid even */}
          {features.length % 2 !== 0 && (
            <View style={[styles.featureCard, { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]} />
          )}
        </View>

        {/* ── BOTTOM PADDING ──────────────────────────── */}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── VOICE FAB ───────────────────────────────── */}
      <VoiceFAB
        state={voiceState}
        onPress={() => {
          // Toggle voice input
          if (voiceState === 'idle') {
            setVoiceState('recording');
            // Start recording logic here
          } else if (voiceState === 'recording') {
            setVoiceState('processing');
            // End recording + process
          } else {
            setVoiceState('idle');
          }
        }}
        onLanguagePress={() => setShowLanguageMenu(true)}
        currentLanguage={currentLanguage}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
  },
  scroll: {
    flex: 1,
  },

  // Hero
  hero: {
    width: '100%',
    height: 240,
    justifyContent: 'space-between',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 50, 30, 0.55)',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroGreeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  heroDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  heroBellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Language menu modal
  languageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  languageMenuSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  languageMenuHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8E4DC',
    alignSelf: 'center',
    marginBottom: 20,
  },
  languageMenuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  languageMenuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  languageMenuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  languageMenuItemActive: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Hero actions - removed duplicate heroHeader definition above
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  languageChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },

  // Score ring
  scoreRing: {
    width: 72,
    height: 72,
  },
  scoreRingInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: -2,
  },

  // Weather
  weatherRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherStat: {
    alignItems: 'center',
    gap: 2,
  },
  weatherStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  weatherStatUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.8)',
  },
  weatherStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
  },
  weatherStatSkeleton: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // AI Insight card
  insightCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  insightAccent: {
    width: 4,
    backgroundColor: COLORS.primary,
  },
  insightBody: {
    flex: 1,
    padding: 14,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#E8EDE8',
    borderRadius: 6,
    marginBottom: 6,
    width: '90%',
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },

  // ── FEATURE GRID — 2-column side-by-side layout ──
  featureGrid: {
    flexDirection: 'row',          // horizontal direction = side by side
    flexWrap: 'wrap',              // wrap to next row after 2 cards
    paddingHorizontal: CARD_PADDING,
    gap: CARD_GAP,
  },
  featureCard: {
    width: CARD_WIDTH,             // exactly half screen minus gaps
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: CARD_GAP,
  },
  featureCardInner: {
    flex: 1,
  },
  featureImageWrap: {
    width: '100%',
    height: 106,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  featureImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  featureLabel: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 56,
    justifyContent: 'center',
  },
  featureLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
});

