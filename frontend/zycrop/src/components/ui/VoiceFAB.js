/**
 * VoiceFAB.js — Floating Voice Action Button
 * States: idle (pulse) | recording (expanding rings) | processing (rotating)
 * Shows language chip above FAB
 * Position: bottom 90 right 20 (above tab bar)
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Text,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors, radius } from '../../theme/tokens';

const STATES = {
  idle: 'idle',
  recording: 'recording',
  processing: 'processing',
};

export const VoiceFAB = ({
  onPress,
  state = STATES.idle,
  position = { bottom: 90, right: 20 },
  onLanguagePress,
  currentLanguage = 'EN',
}) => {
  return (
    <View style={[styles.container, position]}>
      {/* Language Chip */}
      <TouchableOpacity
        onPress={onLanguagePress}
        style={styles.languageChip}
      >
        <Text style={styles.languageText}>{currentLanguage}</Text>
      </TouchableOpacity>

      {/* FAB Button */}
      <FABContent state={state} onPress={onPress} />
    </View>
  );
};

/**
 * FABContent — Animated content based on state
 */
const FABContent = ({ state, onPress }) => {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === STATES.idle) {
      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.15,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else if (state === STATES.processing) {
      // Rotation animation
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotate.start();
      return () => rotate.stop();
    }
  }, [state, pulseScale, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const idleFAB = (
    <Animated.View
      style={[
        styles.fab,
        styles.idleFAB,
        { transform: [{ scale: pulseScale }] },
      ]}
    >
      <MaterialCommunityIcons name="microphone" size={26} color="#FFFFFF" />
      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          { transform: [{ scale: pulseScale }] },
        ]}
      />
    </Animated.View>
  );

  const recordingFAB = (
    <View style={[styles.fab, styles.recordingFAB]}>
      <MaterialCommunityIcons name="microphone" size={26} color="#FFFFFF" />
      {/* Expanding rings */}
      {[0, 1, 2].map((idx) => (
        <ExpandingRing key={idx} delay={idx * 500} />
      ))}
    </View>
  );

  const processingFAB = (
    <Animated.View
      style={[
        styles.fab,
        styles.processingFAB,
        { transform: [{ rotate }] },
      ]}
    >
      <MaterialCommunityIcons
        name="robot-outline"
        size={26}
        color="#FFFFFF"
      />
    </Animated.View>
  );

  const fabContent = {
    [STATES.idle]: idleFAB,
    [STATES.recording]: recordingFAB,
    [STATES.processing]: processingFAB,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.pressable}
    >
      {fabContent[state] || idleFAB}
    </TouchableOpacity>
  );
};

/**
 * ExpandingRing — Single animated ring for recording state
 */
const ExpandingRing = ({ delay }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const expand = Animated.loop(
      Animated.timing(
        Animated.parallel([
          Animated.parallel([scaleAnim, opacityAnim]),
        ]),
        {
          toValue: 1,
          duration: 1500,
          delay,
          useNativeDriver: true,
        }
      )
    );

    const animSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 2.5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );

    const opacitySequence = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );

    setTimeout(() => animSequence.start(), delay);
    setTimeout(() => opacitySequence.start(), delay);

    return () => {
      animSequence.stop();
      opacitySequence.stop();
    };
  }, [delay, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.expandingRing,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
    zIndex: 100,
  },
  languageChip: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  languageText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  pressable: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idleFAB: {
    backgroundColor: '#1B4332',
  },
  recordingFAB: {
    backgroundColor: '#E76F51',
  },
  processingFAB: {
    backgroundColor: '#4895EF',
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#52B788',
    opacity: 0.4,
  },
  expandingRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#E76F51',
  },
});
