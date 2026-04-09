/**
 * Badge.js — Multi-variant Pill Badge Component (Updated DESIGN SYSTEM)
 * Replaces simple text status indicators with styled pills
 * Variants: success | danger | warning | info | purple | neutral
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VARIANTS = {
  success: { bg: '#D8F3DC', text: '#1B4332' },
  danger: { bg: '#FFE4E1', text: '#C62828' },
  warning: { bg: '#FFF3CD', text: '#856404' },
  info: { bg: '#E3F2FD', text: '#0D47A1' },
  purple: { bg: '#EDE7F6', text: '#4527A0' },
  neutral: { bg: '#F1EFE8', text: '#4A4A4A' },
};

const SIZE_MAP = {
  sm: { fontSize: 10, paddingH: 8, paddingV: 4 },
  md: { fontSize: 12, paddingH: 12, paddingV: 6 },
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export const Badge = ({ labelKey = '', variant = 'neutral', size = 'md', label, style }) => {
  const displayText = labelKey || label || '';
  const variantStyle = VARIANTS[variant] || VARIANTS.neutral;
  const sizeStyle = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyle.bg,
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
          borderRadius: 999,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: variantStyle.text,
            fontSize: sizeStyle.fontSize,
          },
        ]}
        numberOfLines={1}
      >
        {displayText}
      </Text>
    </View>
  );
};

// Default export for backwards compatibility
export default Badge;
