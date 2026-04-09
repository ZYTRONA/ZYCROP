/**
 * WaveformBars.js — Animated Audio Waveform Visualization
 * ========================================================
 * Shows animated bars representing audio levels/waveform
 * Used in: VoiceBotScreen (during recording/playback)
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors } from '../../theme/tokens';

export const WaveformBars = ({
  active = false,
  barCount = 7,
  color = colors.primary,
  height = 40,
  barWidth = 4,
  barGap = 3,
}) => {
  // Create animated values for each bar
  const bars = useRef(
    Array(barCount).fill(0).map(() => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (!active) {
      // Reset to neutral state when not active
      bars.forEach(bar => {
        Animated.timing(bar, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
      return;
    }

    // Create animation loop for active state
    const animations = bars.map((bar, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: Math.random() * 0.7 + 0.3,
            duration: 150 + Math.random() * 150,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0.3,
            duration: 150 + Math.random() * 150,
            useNativeDriver: true,
          }),
        ])
      );
    });

    // Start all animations
    animations.forEach(anim => anim.start());

    // Cleanup: stop animations when component unmounts or active changes
    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [active, bars, barCount]);

  return (
    <View style={[styles.container, { height }]}>
      {bars.map((scaleValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              width: barWidth,
              backgroundColor: color,
              transform: [
                {
                  scaleY: scaleValue,
                },
              ],
            },
            index < barCount - 1 && { marginRight: barGap },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  bar: {
    borderRadius: 2,
  },
});
