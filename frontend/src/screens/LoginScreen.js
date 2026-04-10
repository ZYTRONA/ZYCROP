/**
 * LoginScreen.js — ZYCROP Login/Onboarding
 * Full-screen hero image + floating bottom card
 * Biometric + Phone number + Language selector + SDG badges
 */
import React, { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ImageBackground,
} from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useLang } from '../context/LanguageContext'
import { AIButton, Badge } from '../components/ui'

const COLORS = {
  primary: '#1B4332',
  primaryLight: '#2D6A4F',
  accent: '#52B788',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F6F0',
  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#7A7A7A',
  textOnDark: '#FFFFFF',
  border: '#D8E4DC',
}

const LANGUAGES = [
  { code: 'en', name: 'EN' },
  { code: 'ta', name: 'TA' },
  { code: 'hi', name: 'HI' },
  { code: 'te', name: 'TE' },
  { code: 'ml', name: 'ML' },
]

const HERO_IMAGE = 'https://images.unsplash.com/photo-1625246333195-12dde9b27ee1?w=800&q=85'

export default function LoginScreen({ navigation }) {
  const { t, setLanguage, currentLanguage } = useLang()
  const [phone, setPhone] = useState('')
  const [selectedLang, setSelectedLang] = useState(
    LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0]
  )

  const cardTranslateY = useRef(new Animated.Value(300)).current
  const logoOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(cardTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start()

    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start()
  }, [cardTranslateY, logoOpacity])

  const handleBiometricLogin = async () => {
    try {
      const hardware = await LocalAuthentication.hasHardwareAsync()
      if (!hardware) {
        navigation.replace('MainTabs')
        return
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t['btn_biometric_login'] || 'Use Fingerprint to Login',
        fallbackLabel: 'Use PIN',
      })

      if (result.success) {
        navigation.replace('MainTabs')
      }
    } catch (error) {
      Alert.alert('Error', 'Authentication failed')
    }
  }

  const handlePhoneLogin = () => {
    if (phone.length >= 10) {
      navigation.replace('MainTabs')
    } else {
      Alert.alert('Invalid', 'Please enter a valid 10-digit phone number')
    }
  }

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang)
    setLanguage(lang.code)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ImageBackground
        source={{ uri: HERO_IMAGE }}
        resizeMode="cover"
        style={styles.heroBackground}
      >
        <View style={styles.overlay} />

        <View style={styles.heroContent}>
          <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
            <View style={styles.logoIconWrap}>
              <MaterialCommunityIcons
                name="leaf-maple"
                size={32}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.appName}>ZYCROP</Text>
            <Text style={styles.tagline}>
              {t['login_tagline'] || 'Your AI farming partner'}
            </Text>
          </Animated.View>
        </View>
      </ImageBackground>

      <Animated.View
        style={[
          styles.floatingCard,
          { transform: [{ translateY: cardTranslateY }] },
        ]}
      >
        <View style={styles.handle} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle} numberOfLines={1}>
            {t['login'] || 'Login'}
          </Text>

          <AIButton
            label={t['btn_biometric_login'] || 'Login with Fingerprint'}
            onPress={handleBiometricLogin}
            variant="primary"
            style={styles.biometricButton}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={styles.phoneInputWrap}>
            <MaterialCommunityIcons name="phone" size={18} color={COLORS.textMuted} />
            <TextInput
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              style={styles.phoneInput}
              maxLength={10}
            />
          </View>
          {phone.length >= 10 && (
            <AIButton
              label={t['btn_phone_login'] || 'Continue with Phone'}
              onPress={handlePhoneLogin}
              variant="ghost"
              style={{ marginTop: 12 }}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t['language'] || 'Language'}
          </Text>
          <View style={styles.languageRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleLanguageChange(lang)}
                style={[
                  styles.languagePill,
                  selectedLang.code === lang.code && styles.languagePillActive,
                ]}
              >
                <Text
                  style={[
                    styles.languagePillText,
                    selectedLang.code === lang.code && styles.languagePillTextActive,
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sdgRow}>
          <Badge label="SDG 2" variant="success" size="sm" style={styles.sdgBadge} />
          <Badge label="SDG 9" variant="info" size="sm" style={styles.sdgBadge} />
          <Badge label="SDG 13" variant="success" size="sm" style={styles.sdgBadge} />
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  heroBackground: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textOnDark,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  floatingCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  handle: {
    width: 32,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  biometricButton: {
    marginBottom: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  languagePill: {
    flex: 1,
    minWidth: '18%',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languagePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  languagePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  languagePillTextActive: {
    color: COLORS.textOnDark,
  },
  sdgRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 8,
  },
  sdgBadge: {
    flex: 0,
  },
})
