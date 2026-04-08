/**
 * HeroBanner.js — Full-width Hero Image with Overlay & Text
 * Combines ImageBackground with gradient overlay and text content
 * Used by multiple screens for hero sections
 */
import React, { useState } from 'react';
import {
  ImageBackground,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import imageManifest from '../../theme/images';

export const HeroBanner = ({
  imageKey,
  height = 200,
  overlayColor = 'rgba(0,0,0,0.50)',
  title,
  subtitle,
  children,
}) => {
  const [imageError, setImageError] = useState(false);
  const dimensions = useWindowDimensions();
  
  // Get image source from images or fallback
  const getImageSource = () => {
    if (!imageKey) return { uri: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==' };
    
    // Support formats:
    // - "hero.dashboard" (nested structure)
    // - "dashboard" (direct key in hero object)
    const keys = imageKey.split('.');
    
    if (keys.length === 2 && keys[0] === 'hero' && imageManifest.hero?.[keys[1]]) {
      // Format: "hero.dashboard"
      const img = imageManifest.hero[keys[1]];
      return typeof img === 'string' ? { uri: img } : img;
    } else if (imageManifest.hero?.[imageKey]) {
      // Format: "dashboard" (direct hero key)
      const img = imageManifest.hero[imageKey];
      return typeof img === 'string' ? { uri: img } : img;
    } else if (imageManifest.placeholder) {
      // Fallback to placeholder
      const pImg = imageManifest.placeholder;
      return typeof pImg === 'string' ? { uri: pImg } : pImg;
    }
    
    return { uri: 'https://via.placeholder.com/800x400' };
  };

  const imageSource = getImageSource();
  const finalSource = typeof imageSource === 'string' ? { uri: imageSource } : imageSource;

  return (
    <ImageBackground
      source={finalSource}
      onError={() => setImageError(true)}
      style={[styles.container, { height }]}
    >
      {/* Overlay */}
      <View style={[styles.overlay, { backgroundColor: overlayColor }]} />
      
      {/* Content */}
      <View style={styles.content}>
        {title && (
          <Text
            style={styles.title}
            numberOfLines={2}
            allowFontScaling={false}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            style={styles.subtitle}
            numberOfLines={2}
            allowFontScaling={false}
          >
            {subtitle}
          </Text>
        )}
        {children}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 18,
  },
});
