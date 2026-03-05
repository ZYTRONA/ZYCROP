import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
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
      <Text style={styles.logo}>{t.brand}</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t.login}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1b5e20' },
  logo: { fontSize: 48, fontWeight: 'bold', color: 'white', marginBottom: 50 },
  button: { backgroundColor: 'white', paddingHorizontal: 50, paddingVertical: 15, borderRadius: 10 },
  buttonText: { color: '#1b5e20', fontWeight: 'bold', fontSize: 18 }
})
