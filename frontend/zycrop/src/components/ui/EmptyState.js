/**
 * EmptyState.js — Empty State / No Data Component
 * ===============================================
 * Displays a friendly message when there's no data to show
 * Used in: GovSchemes, SoilLab, DiseaseLibrary screens
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography } from '../../theme/tokens';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // spacing.lg
    paddingVertical: 32, // spacing.xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 16, // spacing.md
    padding: 16, // spacing.md
    backgroundColor: colors.surface,
    borderRadius: 18, // radius.lg
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    marginBottom: 8, // spacing.sm
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: typography.size.md,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: 4, // spacing.xs
    textAlign: 'center',
    lineHeight: 18,
  },
  descriptionSmall: {
    fontSize: typography.size.xs,
    marginBottom: 16, // spacing.md
  },
  actionContainer: {
    marginTop: 16, // spacing.md
    width: '100%',
  },
});

export const EmptyState = ({
  icon = 'inbox',
  title = 'No Data Found',
  description = 'Try again later or check back soon.',
  action = null,
  style,
}) => {
  const dimensions = useWindowDimensions();
  const isSmallScreen = dimensions.width < 350;

  return (
    <View style={[styles.container, style]}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <MaterialIcons
          name={icon}
          size={isSmallScreen ? 48 : 64}
          color={colors.textMuted}
        />
      </View>

      {/* Title */}
      <Text
        style={[
          styles.title,
          isSmallScreen && styles.titleSmall,
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        style={[
          styles.description,
          isSmallScreen && styles.descriptionSmall,
        ]}
        numberOfLines={3}
      >
        {description}
      </Text>

      {/* Action (if provided) */}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};
