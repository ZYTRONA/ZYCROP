/**
 * responsive.js — Mobile-first responsive utilities
 * ===============================================
 * Provides screen size detection and viewport-aware styling
 * for full mobile optimization (320px - 1000px+)
 */

import { Dimensions, useWindowDimensions, Platform } from 'react-native';

/**
 * Screen size categories
 * - SMALL  (≤380px): phones like iPhone SE, older models
 * - MEDIUM (381-600px): standard phones (most Android/iOS)
 * - LARGE  (601-900px): tablets, landscape phones
 * - XLARGE (>900px): large tablets, desktop
 */
export const ScreenSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  XLARGE: 'xlarge',
};

/**
 * getScreenSize — determine device category
 * @returns {string} 'small' | 'medium' | 'large' | 'xlarge'
 */
export function getScreenSize() {
  const { width } = Dimensions.get('window');
  if (width <= 380) return ScreenSize.SMALL;
  if (width <= 600) return ScreenSize.MEDIUM;
  if (width <= 900) return ScreenSize.LARGE;
  return ScreenSize.XLARGE;
}

/**
 * useResponsive — hook for responsive values
 * Returns object with responsive values based on current screen size
 * 
 * Usage:
 *   const { cardWidth, padding, fontSize } = useResponsive();
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const screenSize = getScreenSize();
  const isTablet = width >= 600;
  const isLandscape = width > height;

  // Responsive spacing
  const spacing = {
    xs: width <= 380 ? 4 : 6,
    sm: width <= 380 ? 6 : 8,
    md: width <= 380 ? 12 : 16,
    lg: width <= 380 ? 16 : 24,
    xl: width <= 380 ? 20 : 32,
  };

  // Responsive font sizes
  const fontSize = {
    xs: width <= 380 ? 10 : 11,
    sm: width <= 380 ? 12 : 13,
    base: width <= 380 ? 14 : 15,
    md: width <= 380 ? 16 : 17,
    lg: width <= 380 ? 18 : 20,
    xl: width <= 380 ? 22 : 24,
    xxl: width <= 380 ? 28 : 30,
    hero: width <= 380 ? 32 : 36,
  };

  // Responsive dimensions for cards
  const cardPadding = spacing.md;
  const cardGap = width <= 380 ? 8 : 12;
  const cardRadius = width <= 380 ? 12 : 16;
  const cardWidth = (width - cardPadding * 2 - cardGap) / 2;

  // Touch target sizes (minimum 44x44, preferably 48x48+)
  const touchTarget = Math.max(44, spacing.lg + 12);

  // Header heights
  const headerHeight = isLandscape ? 56 : width <= 380 ? 48 : 64;
  const heroHeight = width <= 380 ? 200 : 240;
  const imageHeight = width <= 380 ? 180 : 220;

  // Icon sizes
  const iconSize = {
    sm: 18,
    md: 24,
    lg: 32,
    xl: 44,
  };

  return {
    width,
    height,
    screenSize,
    isTablet,
    isLandscape,
    spacing,
    fontSize,
    cardPadding,
    cardGap,
    cardRadius,
    cardWidth,
    touchTarget,
    headerHeight,
    heroHeight,
    imageHeight,
    iconSize,
  };
}

/**
 * getPercentWidth — calculate percentage-based width
 * Useful for multi-column layouts that scale with screen
 * 
 * Usage:
 *   const width = getPercentWidth(50);  // 50% of screen
 */
export function getPercentWidth(percent) {
  const { width } = Dimensions.get('window');
  return (width * percent) / 100;
}

/**
 * getScaledSize — scale a size value based on screen width
 * Reference width: 375px (avg mobile), 800px (tablet)
 * 
 * Usage:
 *   const padding = getScaledSize(16);  // scales 16px proportionally
 */
export function getScaledSize(baseSize, referenceWidth = 375) {
  const { width } = Dimensions.get('window');
  const scale = width / referenceWidth;
  return Math.round(baseSize * scale);
}

/**
 * Responsive breakpoint helpers
 */
export const Breakpoints = {
  // Screen width checks
  isSmallPhone: () => Dimensions.get('window').width <= 380,
  isMediumPhone: () => {
    const w = Dimensions.get('window').width;
    return w > 380 && w <= 600;
  },
  isTablet: () => Dimensions.get('window').width >= 600,
  
  // Orientation checks
  isPortrait: () => {
    const { width, height } = Dimensions.get('window');
    return height > width;
  },
  isLandscape: () => {
    const { width, height } = Dimensions.get('window');
    return width > height;
  },

  // Platform checks
  isIOS: () => Platform.OS === 'ios',
  isAndroid: () => Platform.OS === 'android',
};

export default {
  ScreenSize,
  getScreenSize,
  useResponsive,
  getPercentWidth,
  getScaledSize,
  Breakpoints,
};
