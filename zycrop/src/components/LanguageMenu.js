import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, Platform, StatusBar,
} from 'react-native'
import { CheckCircle } from 'lucide-react-native'
import { useLang, LANGUAGES } from '../context/LanguageContext'

/**
 * LanguageMenu — drop-in component for any screen header.
 * Shows a  🌐  globe button. Tap → full-screen language picker modal.
 * After selection the entire app re-renders in the chosen language.
 *
 * Usage:
 *   import LanguageMenu from '../components/LanguageMenu'
 *   // Inside any header row:
 *   <LanguageMenu />
 */
export default function LanguageMenu({ iconColor = 'white' }) {
  const { lang, setLang } = useLang()
  const [visible, setVisible] = useState(false)

  const handleSelect = (code) => {
    if (code !== lang) setLang(code)
    setVisible(false)
  }

  return (
    <>
      <TouchableOpacity
        style={S.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[S.globe, { color: iconColor }]}>🌐</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
        statusBarTranslucent
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={S.backdrop}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        />

        {/* Sheet */}
        <View style={S.sheet}>
          <View style={S.handle} />

          <Text style={S.sheetTitle}>🌐  Choose Language</Text>
          <Text style={S.sheetSub}>
            All text in the app will switch instantly
          </Text>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {LANGUAGES.map((l) => {
              const active = lang === l.code
              return (
                <TouchableOpacity
                  key={l.code}
                  style={[S.row, active && S.rowActive]}
                  onPress={() => handleSelect(l.code)}
                  activeOpacity={0.75}
                >
                  <Text style={S.flag}>{l.flag}</Text>
                  <View style={S.rowTexts}>
                    <Text style={[S.native, active && S.nativeActive]}>
                      {l.native}
                    </Text>
                    <Text style={S.english}>{l.label}</Text>
                  </View>
                  {active && <CheckCircle color="#1b5e20" size={22} />}
                  {!active && <View style={S.radioOuter} />}
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <TouchableOpacity style={S.closeBtn} onPress={() => setVisible(false)}>
            <Text style={S.closeTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  )
}

const S = StyleSheet.create({
  trigger: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  globe: { fontSize: 20 },

  // Modal
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 22, paddingTop: 14, paddingBottom: 32,
    elevation: 30,
    shadowColor: '#000', shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -4 }, shadowRadius: 16,
    maxHeight: '85%',
  },
  handle: {
    width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#ddd', alignSelf: 'center', marginBottom: 18,
  },
  sheetTitle: { fontSize: 20, fontWeight: '900', color: '#1a1a1a', marginBottom: 4 },
  sheetSub: { fontSize: 13, color: '#999', marginBottom: 20, lineHeight: 19 },

  // Language rows
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: 16,
    borderRadius: 18, marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderWidth: 2, borderColor: 'transparent',
  },
  rowActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#1b5e20',
  },
  flag: { fontSize: 28 },
  rowTexts: { flex: 1 },
  native: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  nativeActive: { color: '#1b5e20' },
  english: { fontSize: 12, color: '#888', marginTop: 2, fontWeight: '600' },

  radioOuter: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#ccc',
  },

  closeBtn: {
    marginTop: 12, backgroundColor: '#f0f4f0', borderRadius: 16,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#dce8dc',
  },
  closeTxt: { fontSize: 15, fontWeight: '800', color: '#2e7d32' },
})
