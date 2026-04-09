/**
 * Divider.js — Horizontal divider line
 * ==================================
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors } from '../../theme/tokens'

export default function Divider({ style }) {
  return <View style={[styles.divider, style]} />
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
})
