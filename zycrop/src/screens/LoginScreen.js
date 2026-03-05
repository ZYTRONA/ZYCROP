import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { Leaf, Shield, TrendingUp, CreditCard, Scan } from 'lucide-react-native'
import { useLang } from '../context/LanguageContext'

export default function LoginScreen({ navigation }) {
  const { t } = useLang()

  const handleLogin = async () => {
    const hardware = await LocalAuthentication.hasHardwareAsync()
    if (!hardware) {
      navigation.navigate('Home')
      return
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t.authPrompt,
    })

    if (result.success) {
      navigation.navigate('Home')
    } else {
      Alert.alert('Error', 'Authentication failed')
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1b5e20" />

      {/* Decorative blobs */}
      <View style={[styles.blob, { width: 360, height: 360, top: -130, right: -110 }]} />
      <View style={[styles.blob, { width: 220, height: 220, top: 130, left: -90 }]} />
      <View style={[styles.blob, { width: 150, height: 150, bottom: 100, right: -50 }]} />
      <View style={[styles.blob, { width: 80, height: 80, bottom: 220, left: 20 }]} />

      {/* Logo section */}
      <View style={styles.logoSection}>
        <View style={styles.logoIconWrap}>
          <Leaf color="white" size={40} />
        </View>
        <Text style={styles.logo}>{t.brand}</Text>
        <Text style={styles.tagline}>{t.subBrand}</Text>
      </View>

      {/* Feature pills */}
      <View style={styles.pillsWrap}>
        {[
          { Icon: Shield, label: 'AI Disease Scan' },
          { Icon: TrendingUp, label: 'Market Prices' },
          { Icon: CreditCard, label: 'Loan Advisor' },
        ].map(({ Icon, label }) => (
          <View key={label} style={styles.pill}>
            <Icon color="#69f0ae" size={13} />
            <Text style={styles.pillTxt}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Login card */}
      <View style={styles.loginCard}>
        <View style={styles.scanIconWrap}>
          <Scan color="#1b5e20" size={34} />
        </View>
        <Text style={styles.loginTitle}>Secure Access</Text>
        <Text style={styles.loginSub}>Use biometrics or PIN to access your farm dashboard</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.88}>
          <Text style={styles.buttonText}>{t.login}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>ZYCROP AI · Built for Indian Farmers</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#1b5e20', paddingHorizontal: 24, overflow: 'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' },

  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.22)', marginBottom: 16,
  },
  logo: { fontSize: 52, fontWeight: '900', color: 'white', letterSpacing: -2, marginBottom: 6 },
  tagline: { fontSize: 13, color: '#a5d6a7', fontWeight: '600', letterSpacing: 0.5, textAlign: 'center' },

  pillsWrap: { flexDirection: 'row', gap: 8, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center' },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.11)',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  pillTxt: { color: 'rgba(255,255,255,0.88)', fontSize: 12, fontWeight: '600' },

  loginCard: {
    width: '100%', backgroundColor: 'white',
    borderRadius: 28, padding: 30, alignItems: 'center', gap: 10,
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 }, shadowRadius: 24,
  },
  scanIconWrap: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#c8e6c9', marginBottom: 6,
  },
  loginTitle: { fontSize: 24, fontWeight: '900', color: '#1a1a1a', marginBottom: 2 },
  loginSub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 8, paddingHorizontal: 8 },
  button: {
    width: '100%', backgroundColor: '#1b5e20',
    paddingVertical: 18, borderRadius: 16, alignItems: 'center',
    elevation: 6, shadowColor: '#1b5e20', shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 6 }, shadowRadius: 14,
  },
  buttonText: { color: 'white', fontWeight: '900', fontSize: 17, letterSpacing: 0.3 },

  version: { position: 'absolute', bottom: 38, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '500' },
})
