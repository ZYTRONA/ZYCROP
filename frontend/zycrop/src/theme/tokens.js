/**
 * tokens.js — ZYCROP Design System v1
 * ====================================
 * Single source of truth for all design values.
 * Used across all screens and components for consistency.
 */

export const colors = {
  // Primary brand color — forest green
  primary: '#1B4332',
  primaryLight: '#2D6A4F',
  
  // Accent — vibrant green for highlights & badges
  accent: '#52B788',
  accentMuted: '#B7E4C7',
  
  // Surfaces
  surface: '#FFFFFF',
  surfaceAlt: '#F4F6F0',
  
  // Text colors
  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#7A7A7A',
  textOnDark: '#FFFFFF',
  
  // Semantic colors
  border: '#D8E4DC',
  warning: '#F4A261',
  danger: '#E76F51',
  info: '#4895EF',
  success: '#52B788',
}

export const typography = {
  fontFamily: undefined, // System default — Expo auto-selects
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    hero: 36,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  full: 999,
}

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  lifted: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
}

// Text Style Helper — creates consistent typography styles
export const textStyle = {
  h1: (overrides = {}) => ({
    fontSize: typography.size.hero,
    fontWeight: typography.weight.bold,
    lineHeight: typography.size.hero * typography.lineHeight.tight,
    color: colors.textPrimary,
    ...overrides,
  }),
  h2: (overrides = {}) => ({
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    lineHeight: typography.size.xl * typography.lineHeight.tight,
    color: colors.textPrimary,
    ...overrides,
  }),
  h3: (overrides = {}) => ({
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.lg * typography.lineHeight.normal,
    color: colors.textPrimary,
    ...overrides,
  }),
  body: (overrides = {}) => ({
    fontSize: typography.size.md,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.md * typography.lineHeight.normal,
    color: colors.textPrimary,
    ...overrides,
  }),
  bodySmall: (overrides = {}) => ({
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
    color: colors.textSecondary,
    ...overrides,
  }),
  label: (overrides = {}) => ({
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.xs * typography.lineHeight.tight,
    color: colors.textMuted,
    ...overrides,
  }),
  caption: (overrides = {}) => ({
    fontSize: typography.size.xs,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.xs * typography.lineHeight.tight,
    color: colors.textMuted,
    ...overrides,
  }),
}

