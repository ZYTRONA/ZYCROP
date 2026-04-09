/**
 * StatBox.js — Statistical Display Box Component
 * =============================================
 * Displays a single statistic with label, value, optional unit, and optional progress indicator
 * Used in: Pathologist, MarketAI, SoilLab, FarmPassport, LoanAdvisor screens
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { colors, typography } from '../../theme/tokens';

const styles = StyleSheet.create({
  container: {
    borderRadius: 18, // radius.lg
    paddingHorizontal: 16, // spacing.md
    paddingVertical: 16, // spacing.md
    borderLeftWidth: 4,
    borderLeftColor: 'inherit',
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
    marginBottom: 8, // spacing.sm
  },
  labelSmall: {
    fontSize: 11, // typography.size.xs
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8, // spacing.sm
  },
  value: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: 4, // spacing.xs
  },
  valueSmall: {
    fontSize: typography.size.lg,
    marginBottom: 8, // spacing.sm
  },
  unit: {
    marginLeft: 4, // spacing.xs
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  unitSmall: {
    fontSize: typography.size.xs,
    marginTop: 8, // spacing.sm
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8, // spacing.sm
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  accentBar: {
    height: 3,
    marginTop: 8, // spacing.sm
    borderRadius: 1.5,
  },
});

export const StatBox = ({
  label,
  value,
  unit = '',
  color = colors.primary,
  progressPct = null,
  style,
}) => {
  const dimensions = useWindowDimensions();
  const isSmallScreen = dimensions.width < 350;

  return (
    <View style={[styles.container, { backgroundColor: color + '10' }, style]}>
      {/* Label */}
      <Text
        style={[
          styles.label,
          isSmallScreen && styles.labelSmall,
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {label}
      </Text>

      {/* Value with Unit */}
      <View style={styles.valueRow}>
        <Text
          style={[
            styles.value,
            isSmallScreen && styles.valueSmall,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
        {unit && (
          <Text
            style={[
              styles.unit,
              isSmallScreen && styles.unitSmall,
            ]}
          >
            {unit}
          </Text>
        )}
      </View>

      {/* Optional Progress Bar */}
      {progressPct !== null && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(Math.max(progressPct, 0), 100)}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      )}

      {/* Colored accent bar */}
      <View
        style={[
          styles.accentBar,
          { backgroundColor: color },
        ]}
      />
    </View>
  );
};
