/**
 * AIButton.js — AI-powered Action Button with Robot Icon & States
 * Three variants: primary (filled), ghost (outlined), danger (red)
 * Always shows robot-outline icon + animated loading dots
 * Press animation: scale 0.96 ↔ 1.0
 */
import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Animated,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const VARIANTS = {
  primary: {
    bg: '#1B4332',
    text: '#FFFFFF',
    icon: '#FFFFFF',
    borderColor: 'transparent',
  },
  ghost: {
    bg: 'transparent',
    text: '#1B4332',
    icon: '#1B4332',
    borderColor: '#1B4332',
  },
  danger: {
    bg: '#E76F51',
    text: '#FFFFFF',
    icon: '#FFFFFF',
    borderColor: 'transparent',
  },
};

export const AIButton = ({
  labelKey = '',
  label = '',
  onPress,
  loading = false,
  variant = 'primary',
  icon: _Icon,
  style,
  disabled = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const displayText = labelKey || label || '';

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading || disabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          {
            backgroundColor: variantStyle.bg,
            borderColor: variantStyle.borderColor,
            borderWidth: variant === 'ghost' ? 1.5 : 0,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <MaterialCommunityIcons name="robot" size={18} color={variantStyle.icon} />
        <View style={styles.labelContainer}>
          {loading ? (
            <AnimatedDots color={variantStyle.text} />
          ) : (
            <Text
              style={[styles.label, { color: variantStyle.text }]}
              numberOfLines={1}
            >
              {displayText}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * AnimatedDot — single dot extracted as a proper component to follow Rules of Hooks
 */
const AnimatedDot = ({ color, delay }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      ])
    );
    const timer = setTimeout(() => animate.start(), delay);
    return () => {
      clearTimeout(timer);
      animate.stop();
    };
  }, [opacity, delay]);

  return (
    <Animated.View style={[styles.dot, { backgroundColor: color, opacity }]} />
  );
};

/**
 * AnimatedDots — 3 staggered dots while loading
 */
const AnimatedDots = ({ color = '#FFFFFF' }) => (
  <View style={styles.dotsContainer}>
    <AnimatedDot color={color} delay={0} />
    <AnimatedDot color={color} delay={200} />
    <AnimatedDot color={color} delay={400} />
  </View>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
    width: '100%',
  },
  labelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
