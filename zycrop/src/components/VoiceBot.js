import React, { useRef, useEffect, useState } from 'react'
import { View, TouchableOpacity, Animated, StyleSheet, Text } from 'react-native'
import { Mic } from 'lucide-react-native'
import * as Speech from 'expo-speech'

// Intent router → returns a navigation target or null
const resolveIntent = (text) => {
  const t = text.toLowerCase()
  if (t.includes('soil') || t.includes('fertilizer') || t.includes('npk')) return 'SoilLab'
  if (t.includes('market') || t.includes('price') || t.includes('mandi')) return 'MarketAI'
  if (t.includes('scheme') || t.includes('subsidy') || t.includes('government')) return 'GovSchemes'
  if (t.includes('passport') || t.includes('certificate') || t.includes('record')) return 'FarmPassport'
  if (t.includes('loan') || t.includes('credit') || t.includes('bank')) return 'LoanAdvisor'
  if (t.includes('disease') || t.includes('pest') || t.includes('scan')) return 'Pathologist'
  return null
}

export default function VoiceBot({ onSpeechStart, onNavigate }) {
  const pulse = useRef(new Animated.Value(1)).current
  const animRef = useRef(null)
  const [listening, setListening] = useState(false)

  // Pulse only while listening
  useEffect(() => {
    if (listening) {
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.35, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      )
      animRef.current.start()
    } else {
      animRef.current?.stop()
      Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }).start()
    }
    return () => animRef.current?.stop()
  }, [listening])

  const handlePress = () => {
    if (listening) {
      // Stop listening — simulate route
      setListening(false)
      Speech.speak('Opening Soil Lab for you.', { language: 'ta' })
      if (onNavigate) onNavigate('SoilLab')
    } else {
      setListening(true)
      if (onSpeechStart) onSpeechStart()
      // Auto-stop after 4 seconds (speech recognition placeholder)
      setTimeout(() => setListening(false), 4000)
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseCircle,
          { transform: [{ scale: pulse }] },
          listening && styles.pulseActive,
        ]}
      />
      <TouchableOpacity
        style={[styles.micBtn, listening && styles.micBtnActive]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Mic color="white" size={30} />
      </TouchableOpacity>
      <Text style={styles.botLabel}>{listening ? 'Listening...' : 'Ask Zycrop AI'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 16 },
  pulseCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(27, 94, 32, 0.15)',
  },
  pulseActive: { backgroundColor: 'rgba(27, 94, 32, 0.3)' },
  micBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1b5e20',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  micBtnActive: { backgroundColor: '#b71c1c' },
  botLabel: { marginTop: 10, fontWeight: '700', color: '#1b5e20', fontSize: 13 },
})
