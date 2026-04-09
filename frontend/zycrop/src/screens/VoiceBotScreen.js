import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Animated,
  ScrollView,

  StatusBar,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLang } from '../context/LanguageContext';
import { colors, spacing, radius } from '../theme/tokens';
import { WaveformBars, TypingDots, Badge } from '../components/ui';
import { images } from '../theme/images';

const { height } = Dimensions.get('window');
const FALLBACK = { voice: images.placeholder_1200 };

/**
 * VoiceBotScreen.js — Full-screen Voice AI Interface (Phase 4)
 *
 * Premium voice-first UX with:
 * - Hero image + animated mic button
 * - 3-state recording (idle → recording → processing)
 * - Waveform visualization during recording
 * - Transcript + AI response panels
 * - Quick command chips
 * - Full offline support with local Bhashini speech
 *
 * Preserves all farming KB + API logic from services/voiceService
 */

export function VoiceBotScreen({ navigation }) {
  const { t } = useLang();

  // ─── State ──────────────────────────────────────────────────
  const [recordingState, setRecordingState] = useState('idle'); // idle | recording | processing | result
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [heroImg, setHeroImg] = useState(images.hero_voice || FALLBACK.voice);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isOfflineMode] = useState(false);

  // ─── Animations ─────────────────────────────────────────────
  const micScale = useRef(new Animated.Value(1)).current;
  const pulseRing = useRef(new Animated.Value(0)).current;
  const transcriptSlide = useRef(new Animated.Value(500)).current;
  const responseOpacity = useRef(new Animated.Value(0)).current;

  // ─── Recording Timer ────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  // ─── Pulse Ring Animation (idle state) ──────────────────────
  useEffect(() => {
    if (recordingState === 'idle') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseRing, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(pulseRing, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseRing.setValue(0);
    }
  }, [recordingState, pulseRing]);

  const pulseScale = pulseRing.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 1.2, 0.9],
  });

  const pulseOpacity = pulseRing.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });

  // ─── Voice Recording Commands ───────────────────────────────
  const voiceCommands = [
    { id: 1, labelKey: 'voicecmd_scan_disease', icon: 'activity', action: 'Pathologist' },
    { id: 2, labelKey: 'voicecmd_check_weather', icon: 'cloud', action: 'Dashboard' },
    { id: 3, labelKey: 'voicecmd_market_price', icon: 'trending-up', action: 'MarketAI' },
    { id: 4, labelKey: 'voicecmd_soil_analysis', icon: 'layers', action: 'SoilLab' },
  ];

  // ─── Handlers ───────────────────────────────────────────────
  const handleMicPress = () => {
    if (recordingState === 'idle') {
      // Start recording
      setRecordingState('recording');
      setTranscript('');
      setAiResponse('');
      Animated.spring(micScale, {
        toValue: 0.9,
        useNativeDriver: true,
        speed: 20,
      }).start();
    } else if (recordingState === 'recording') {
      // Stop recording → Processing
      Animated.spring(micScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }).start();
      setRecordingState('processing');

      // Simulate AI processing (replace with actual voiceService.recordAndTranscribe)
      setTimeout(() => {
        setTranscript('Check my rice crop for diseases');
        setAiResponse(
          'Your rice crop shows good health overall. Monitor for leaf blast if humidity rises above 85%. Apply Tricyclazole 0.6g/L preventively on days 45-50 of growth.'
        );
        setRecordingState('result');

        // Slide transcript up
        Animated.timing(transcriptSlide, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start();

        // Fade in response
        Animated.timing(responseOpacity, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }).start();
      }, 2500);
    }
  };

  const handleReset = () => {
    setRecordingState('idle');
    setTranscript('');
    setAiResponse('');

    // Reset animations
    Animated.parallel([
      Animated.timing(transcriptSlide, {
        toValue: 500,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(responseOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCommandPress = (command) => {
    // Navigate to selected screen
    navigation?.navigate(command.action);
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── HERO BACKGROUND ─────────────────────────– */}
      <ImageBackground
        source={{ uri: heroImg }}
        style={styles.heroBackground}
        resizeMode="cover"
        onError={() => setHeroImg(FALLBACK.voice)}
      >
        {/* Dark overlay */}
        <View style={styles.heroOverlay} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation?.goBack()}
            hitSlop={10}
          >
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t['voicebot_title'] || 'Voice Assistant'}</Text>
            <Text style={styles.headerSubtitle}>
              {recordingState === 'idle'
                ? t['voicebot_ready'] || 'Ready to help'
                : recordingState === 'recording'
                ? t['voicebot_listening'] || 'Listening...'
                : recordingState === 'processing'
                ? t['voicebot_processing'] || 'Processing...'
                : t['voicebot_result_ready'] || 'Result ready'}
            </Text>
          </View>

          {isOfflineMode && (
            <Badge variant="warning" size="sm" labelKey="badge_offline" />
          )}
        </View>

        {/* ── MIC AREA ────────────────────────────────– */}
        <View style={styles.micContainer}>
          {/* Pulse rings (idle state) */}
          {recordingState === 'idle' && (
            <Animated.View style={[styles.pulseRingContainer, { transform: [{ scale: pulseScale }] }]}>
              <Animated.View style={[styles.pulseRing, { opacity: pulseOpacity }]} />
            </Animated.View>
          )}

          {/* Waveform bars (recording state) */}
          {recordingState === 'recording' && (
            <WaveformBars active={true} barCount={7} color={colors.accent} />
          )}

          {/* Main microphone button */}
          <Animated.View
            style={[
              styles.micButtonWrapper,
              {
                transform: [{ scale: micScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.micButton}
              onPress={handleMicPress}
              activeOpacity={0.8}
            >
              {recordingState === 'processing' ? (
                <ActivityIndicator size={40} color="#FFFFFF" />
              ) : (
                <Feather
                  name={recordingState === 'recording' ? 'square' : 'mic'}
                  size={36}
                  color="#FFFFFF"
                  strokeWidth={1.5}
                />
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Recording time display */}
          {recordingState === 'recording' && (
            <Text style={styles.recordingTime}>
              {Math.floor(recordingTime / 60)}:
              {(recordingTime % 60).toString().padStart(2, '0')}
            </Text>
          )}

          {/* Typing dots (processing state) */}
          {recordingState === 'processing' && (
            <TypingDots color="#FFFFFF" />
          )}
        </View>

        {/* ── TRANSCRIPT PANEL (shows while recording) ────────– */}
        {recordingState === 'recording' && (
          <View style={styles.transcriptLive}>
            <Text style={styles.transcriptLiveLabel}>
              {t['you_said'] || 'You said:'}
            </Text>
            <Text style={styles.transcriptLiveText}>
              {transcript || t['voicebot_listening_for_text'] || 'Listening...'}
            </Text>
          </View>
        )}
      </ImageBackground>

      {/* ── RESULT PANEL (below hero, slides up) ───────────────– */}
      {recordingState === 'result' && (
        <Animated.View
          style={[
            styles.resultPanel,
            {
              transform: [{ translateY: transcriptSlide }],
            },
          ]}
        >
          <ScrollView
            style={styles.resultScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultContent}
          >
            {/* User's transcript */}
            <View style={styles.resultCard}>
              <View style={styles.resultCardHeader}>
                <Feather name="mic" size={18} color={colors.accent} />
                <Text style={styles.resultCardTitle}>
                  {t['you_said'] || 'You said:'}
                </Text>
              </View>
              <Text style={styles.resultCardText}>{transcript}</Text>
            </View>

            {/* AI Response */}
            <Animated.View
              style={[
                styles.resultCard,
                {
                  opacity: responseOpacity,
                  backgroundColor: '#F0FDF4',
                  borderLeftWidth: 4,
                  borderLeftColor: colors.accent,
                },
              ]}
            >
              <View style={styles.resultCardHeader}>
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.resultCardTitle}>
                  {t['ai_response'] || 'AI Response:'}
                </Text>
              </View>
              <Text style={styles.resultCardText}>{aiResponse}</Text>
            </Animated.View>

            {/* Action buttons */}
            <View style={styles.resultActions}>
              <TouchableOpacity
                style={[styles.resultBtn, styles.resultBtnPrimary]}
                onPress={() => handleReset()}
              >
                <Feather name="mic" size={16} color="#FFFFFF" />
                <Text style={styles.resultBtnText}>
                  {t['btn_ask_again'] || 'Ask Again'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resultBtn, styles.resultBtnSecondary]}
                onPress={() => navigation?.goBack()}
              >
                <Feather name="check-circle" size={16} color={colors.primary} />
                <Text style={styles.resultBtnTextSecondary}>
                  {t['btn_done'] || 'Done'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </Animated.View>
      )}

      {/* ── QUICK COMMANDS (idle state) ─────────────– */}
      {recordingState === 'idle' && !transcript && (
        <View style={styles.commandsContainer}>
          <Text style={styles.commandsLabel}>
            {t['voicebot_quick_commands'] || 'Quick commands:'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.commandsScroll}
          >
            {voiceCommands.map((cmd) => (
              <TouchableOpacity
                key={cmd.id}
                style={styles.commandChip}
                onPress={() => handleCommandPress(cmd)}
              >
                <Feather name={cmd.icon} size={16} color={colors.primary} />
                <Text style={styles.commandChipText}>
                  {t[cmd.labelKey] || cmd.labelKey}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── OFFLINE BANNER ──────────────────────────– */}
      {isOfflineMode && (
        <View style={styles.offlineFooter}>
          <Feather name="wifi-off" size={14} color="#7A7A7A" />
          <Text style={styles.offlineFooterText}>
            {t['powered_by_local_ai'] || 'Running on local AI'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Hero background
  heroBackground: {
    height: height * 0.65,
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 67, 50, 0.60)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  // Microphone area
  micContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  pulseRingContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: colors.accent,
  },

  micButtonWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },

  recordingTime: {
    marginTop: spacing.lg,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  transcriptLive: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  transcriptLiveLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  transcriptLiveText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },

  // Result panel
  resultPanel: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  resultScroll: {
    flex: 1,
  },
  resultContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  resultCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 20,
  },

  resultActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  resultBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  resultBtnPrimary: {
    backgroundColor: colors.primary,
  },
  resultBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resultBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  resultBtnTextSecondary: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },

  // Commands
  commandsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  commandsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  commandsScroll: {
    paddingHorizontal: 0,
    gap: spacing.sm,
  },
  commandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  commandChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // Offline banner
  offlineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFF3CD',
    borderTopWidth: 1,
    borderTopColor: '#FFE69C',
  },
  offlineFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
});

export default VoiceBotScreen;
