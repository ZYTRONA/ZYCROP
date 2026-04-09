/**
 * LoadingSkeleton.js — Animated placeholder while data loads
 * =========================================================
 */

import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { colors } from '../../theme/tokens'

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
})

export default function LoadingSkeleton({
  width = '100%',
  height = 100,
  borderRadius = 12, // radius.md
  style,
}) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  )
}
