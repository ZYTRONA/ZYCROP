import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AnimatedCard from '../components/AnimatedCard'
import VoiceBot from '../components/VoiceBot'
import { Beaker, FileText, ShieldCheck, Zap } from 'lucide-react-native'

export default function Dashboard() {
  const navigation = useNavigation()

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.brand}>ZYCROP</Text>
        <Text style={styles.tagline}>AI-Powered Farm Assistant</Text>
      </View>

      <VoiceBot onSpeechStart={() => console.log('AI Listening')} />

      <Text style={styles.sectionTitle}>Problem Solutions</Text>

      <View style={styles.grid}>
        <AnimatedCard
          style={styles.menuCard}
          onPress={() => navigation.navigate('SoilLab')}
        >
          <Beaker color="#1b5e20" size={28} />
          <Text style={styles.menuLabel}>Prob 2: Soil Lab</Text>
        </AnimatedCard>

        <AnimatedCard
          style={styles.menuCard}
          onPress={() => navigation.navigate('GovSchemes')}
        >
          <FileText color="#1b5e20" size={28} />
          <Text style={styles.menuLabel}>Prob 4: Subsidies</Text>
        </AnimatedCard>

        <AnimatedCard
          style={styles.menuCard}
          onPress={() => navigation.navigate('FarmPassport')}
        >
          <ShieldCheck color="#1b5e20" size={28} />
          <Text style={styles.menuLabel}>Prob 5: Passport</Text>
        </AnimatedCard>

        <AnimatedCard style={styles.menuCard}>
          <Zap color="#fbc02d" size={28} />
          <Text style={styles.menuLabel}>Quick Tips</Text>
        </AnimatedCard>
      </View>

      <AnimatedCard style={styles.alertCard}>
        <Text style={styles.alertTitle}>AI Morning Brief</Text>
        <Text style={styles.alertBody}>
          High humidity today. Check your Tomato plants for early fungal signs.
        </Text>
      </AnimatedCard>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  header: { marginTop: 50, marginBottom: 10 },
  brand: { fontSize: 28, fontWeight: '900', color: '#1b5e20' },
  tagline: { fontSize: 13, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 20, color: '#333' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'space-between' },
  menuCard: { width: '47%', alignItems: 'center', padding: 20, gap: 10 },
  menuLabel: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: '#1b5e20' },
  alertCard: { marginTop: 25, backgroundColor: '#e8f5e9', borderLeftWidth: 5, borderLeftColor: '#1b5e20' },
  alertTitle: { fontWeight: 'bold', fontSize: 16, color: '#1b5e20', marginBottom: 5 },
  alertBody: { color: '#444', lineHeight: 20 },
})
