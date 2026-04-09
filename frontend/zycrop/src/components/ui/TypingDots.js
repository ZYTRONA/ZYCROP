/**
 * TypingDots.js — Animated Typing Indicator Component
 * =====================================================
 * Shows animated dots indicating that AI/system is thinking/typing
 * Used in: VoiceBotScreen
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors } from '../../theme/tokens';

export const TypingDots = ({
  color = colors.primary,
  size = 8,
  dotCount = 3,
  gap = 4,
}) => {
  // Create animated values for each dot
  const dots = useRef(
    Array(dotCount).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Create staggered animation for dots
    const animations = Animated.loop(
      Animated.stagger(
        150,
        dots.map(dot =>
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -8,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );

    animations.start();

    return () => animations.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, { gap }]}>
      {dots.map((translateValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              transform: [{ translateY: translateValue }],
            },
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
    paddingVertical: 8,
  },
  dot: {
    borderRadius: 4,
  },
});
