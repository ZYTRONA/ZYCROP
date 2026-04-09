/**
 * ChipFilterRow.js — Horizontal Scrollable Chip Filter Component
 * For filtering by category, crop, disease, etc.
 * Active: primary bg + white text
 * Inactive: white bg + border + primary text
 */
import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

/**
 * Individual chip extracted as a proper component so useRef follows Rules of Hooks
 */
const Chip = ({ label, isActive, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
      >
        <Text
          style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ChipFilterRow = ({
  options = [],
  selected = 0,
  onSelect,
  keyNames = [],
}) => {
  const chipLabels = keyNames.length === options.length ? keyNames : options;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
    >
      {options.map((option, index) => (
        <Chip
          key={index}
          label={chipLabels[index] || option}
          isActive={index === selected}
          onPress={() => onSelect && onSelect(index, options[index])}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 0,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#1B4332',
    borderColor: '#1B4332',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1B4332',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#1B4332',
  },
});
