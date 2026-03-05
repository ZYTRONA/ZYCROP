import React, { useRef, useEffect } from 'react'
import { View, TouchableOpacity, Animated, StyleSheet, Text } from 'react-native'
import { Mic } from 'lucide-react-native'

export default function VoiceBot({ onSpeechStart }) {
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulse }] }]} />
      <TouchableOpacity style={styles.micBtn} onPress={onSpeechStart}>
        <Mic color="white" size={32} />
      </TouchableOpacity>
      <Text style={styles.botLabel}>Ask Zycrop AI</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 20 },
  pulseCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(27, 94, 32, 0.2)',
  },
  micBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1b5e20',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  botLabel: { marginTop: 10, fontWeight: 'bold', color: '#1b5e20' },
})
