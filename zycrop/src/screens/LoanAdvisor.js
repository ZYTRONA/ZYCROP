import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Dimensions,
} from 'react-native'
import {
  Send, Zap, Mic, Volume2, Search, Leaf,
  CheckCircle, FileText, AlertTriangle, ArrowLeft,
  BarChart2, CreditCard, AlertCircle, FileCheck, Home,
} from 'lucide-react-native'
import * as Speech from 'expo-speech'
import { chatWithGPT, LOAN_SYSTEM_PROMPT } from '../services/openaiService'
import { useLang } from '../context/LanguageContext'
import LanguageMenu from '../components/LanguageMenu'

const { width } = Dimensions.get('window')

// ─── Loan Database ──────────────────────────────────────────────────────────
const LOAN_SCHEMES = {
  kcc: {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    bank: 'All Nationalized Banks + RRBs',
    interest: '4% p.a.',
    interestNote: 'with 3% govt subsidy',
    maxAmount: '₹3,00,000',
    tenure: '1 year (renewable up to 5 yrs)',
    collateral: 'Nil up to ₹1.6 Lakh',
    processingFee: '0.5% of loan amount',
    disbursalDays: '14 working days',
    applicationWindow: 'Year-round',
    badge: 'MOST POPULAR',
    color: '#1b5e20',
    bg: '#e8f5e9',
    documents: [
      'Aadhaar Card (original + photocopy)',
      'Land ownership records — Chitta / Patta / 7/12 extract',
      'Passport size photos (2 copies)',
      'Bank passbook / cancelled cheque',
      'Cultivation certificate from Village Officer',
      'Address proof (Voter ID / Driving Licence)',
    ],
    steps: [
      'Visit nearest nationalized bank or RRB branch',
      'Collect KCC application form (Form KCC-1)',
      'Fill form with crop details, land area & location',
      'Submit form with all verified documents',
      'Bank officer visits field for land verification',
      'Tahsildar confirms land ownership digitally',
      'Credit limit sanctioned — KCC card issued',
      'First withdrawal credited within 14 working days',
    ],
    importantDates: [
      { label: 'Application', value: 'Year-round' },
      { label: 'Crop insurance deadline', value: 'Before sowing' },
      { label: 'Repayment period', value: '12 months after disbursal' },
      { label: 'Renewal', value: 'Annual — no new documents needed' },
    ],
    tip: 'KCC holders get automatic coverage under PMFBY crop insurance at 2% premium.',
  },
  nabard_term: {
    id: 'nabard_term',
    name: 'NABARD Agricultural Term Loan',
    bank: 'Cooperative Banks & Regional Rural Banks',
    interest: '7% p.a.',
    interestNote: 'Subvention available for timely repayment',
    maxAmount: '₹10,00,000',
    tenure: '5–7 years',
    collateral: 'Land mortgage above ₹1 Lakh',
    processingFee: '1% of loan amount',
    disbursalDays: '21 working days',
    applicationWindow: 'June–Sept (Kharif) / Nov–Feb (Rabi)',
    badge: 'HIGH AMOUNT',
    color: '#1565c0',
    bg: '#e3f2fd',
    documents: [
      'Aadhaar Card + PAN Card',
      'Land ownership records (notarized)',
      'Soil Health Card',
      'Detailed project report (bank format)',
      '6-month bank statement',
      'Two guarantors with land proof',
    ],
    steps: [
      'Contact nearest cooperative bank / RRB',
      'Request NABARD term loan project report format',
      'Prepare project report with projected income details',
      'Submit application with all documents',
      'Bank sends field verification team within 7 days',
      'Technical appraisal by NABARD-trained officer',
      'Loan sanctioned — mortgage deed executed',
      'Amount disbursed in approved tranches',
    ],
    importantDates: [
      { label: 'Kharif window', value: 'June – September' },
      { label: 'Rabi window', value: 'November – February' },
      { label: 'Repayment starts', value: '6 months after disbursal' },
      { label: 'Max tenure', value: '7 years from sanction date' },
    ],
    tip: 'Apply at least 45 days before sowing season to ensure timely disbursal.',
  },
  pm_kisan: {
    id: 'pm_kisan',
    name: 'PM-KISAN Direct Income Support',
    bank: 'Direct to Aadhaar-linked bank account',
    interest: 'Zero — this is a grant',
    interestNote: 'Not a loan — free income support',
    maxAmount: '₹6,000 / year',
    tenure: 'Ongoing (3 installments × ₹2,000)',
    collateral: 'None required',
    processingFee: 'Free',
    disbursalDays: 'Auto-credited every 4 months',
    applicationWindow: 'Year-round via PM-KISAN portal',
    badge: 'ZERO INTEREST',
    color: '#e65100',
    bg: '#fff3e0',
    documents: [
      'Aadhaar Card (must be linked to bank)',
      'Land records in your name',
      'Active bank account number + IFSC',
      'Mobile number for OTP verification',
    ],
    steps: [
      'Open pmkisan.gov.in on browser',
      'Click "New Farmer Registration"',
      'Select Rural / Urban Farmer',
      'Enter 12-digit Aadhaar number',
      'Fill state, district, sub-district, village details',
      'Upload land records (scanned copy)',
      'Submit — receive registration number via SMS',
      '₹2,000 credited automatically every 4 months',
    ],
    importantDates: [
      { label: 'April installment', value: 'April 1 – July 31' },
      { label: 'August installment', value: 'August 1 – November 30' },
      { label: 'December installment', value: 'December 1 – March 31' },
      { label: 'Status check', value: 'pmkisan.gov.in/beneficiarystatus' },
    ],
    tip: 'Ensure your Aadhaar is seeded to your bank account before applying.',
  },
  sbi_agri: {
    id: 'sbi_agri',
    name: 'SBI Agri Gold Loan',
    bank: 'State Bank of India',
    interest: '8.5% p.a.',
    interestNote: 'Against gold jewellery pledge',
    maxAmount: '₹50,00,000',
    tenure: '12 months (renewable)',
    collateral: 'Gold ornaments',
    processingFee: '0.50% min ₹500',
    disbursalDays: 'Same day after gold valuation',
    applicationWindow: 'Year-round',
    badge: 'INSTANT',
    color: '#f57c00',
    bg: '#fff8e1',
    documents: [
      'Aadhaar Card',
      'PAN Card',
      'Gold ornaments / jewellery',
      'Passport photo',
      'Address proof',
    ],
    steps: [
      'Visit SBI branch with gold jewellery',
      'Fill agri gold loan application form',
      'Bank valuates gold jewellery on-spot',
      'Up to 75% of gold value sanctioned',
      'Sign pledge agreement',
      'Cash / account credit same day',
      'Repay within 12 months to reclaim gold',
    ],
    importantDates: [
      { label: 'Application', value: 'Any working day' },
      { label: 'Repayment due', value: '12 months from disbursal' },
      { label: 'Gold auction warning', value: 'After 90-day default notice' },
    ],
    tip: 'Fastest way to get emergency funds. Gold returned immediately on full repayment.',
  },
}

// ─── Recommendation Engine ───────────────────────────────────────────────────
function recommendScheme(crop, acres, purpose) {
  const a = parseFloat(acres) || 0
  if (purpose === 'emergency') return LOAN_SCHEMES.sbi_agri
  if (a <= 0.5) return LOAN_SCHEMES.pm_kisan
  if (a <= 3) return LOAN_SCHEMES.kcc
  return LOAN_SCHEMES.nabard_term
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function WaveBar({ delay }) {
  const anim = useRef(new Animated.Value(0.3)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])
  return <Animated.View style={[S.waveBar, { transform: [{ scaleY: anim }] }]} />
}

function Waveform() {
  return (
    <View style={S.waveform}>
      {[0, 100, 200, 100, 0].map((d, i) => <WaveBar key={i} delay={d} />)}
    </View>
  )
}

function AnalyzingStep({ label, done, active }) {
  const anim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      ).start()
    } else {
      anim.stopAnimation()
    }
  }, [active])
  return (
    <View style={S.stepRow}>
      {done ? (
        <CheckCircle color="#43a047" size={18} />
      ) : (
        <Animated.View style={{ opacity: active ? anim : 0.25 }}>
          <View style={S.stepDot} />
        </Animated.View>
      )}
      <Text style={[S.stepLabel, done && S.stepDone, active && S.stepActive]}>{label}</Text>
    </View>
  )
}

const ANALYZE_STEPS = [
  'Reading crop profile...',
  'Checking eligibility criteria...',
  'Matching government schemes...',
  'Calculating loan limits...',
  'Generating your prescription...',
]

// ─── All translatable UI strings (English source) ────────────────────────────
const EN_UI = {
  fillDetails: 'Fill details to get your loan plan',
  formTitle: 'Tell us about your farm',
  formSub: 'We will match the best government loan scheme instantly',
  cropLabel: 'Crop Name',
  cropPlaceholder: 'e.g. Tomato, Rice, Cotton, Onion...',
  landLabel: 'Land Size',
  acresUnit: 'Acres',
  locationLabel: 'District / Location',
  locationPlaceholder: 'e.g. Coimbatore, Pune, Warangal...',
  purposeLabel: 'Loan Purpose',
  getPlan: 'Get My Loan Plan',
  chatLink: 'Or chat with AI for quick advice',
  analyzingHeader: 'AI is processing your request...',
  matchingScheme: 'Matching Best Scheme',
  askMore: 'Ask AI More',
  applyBank: 'Apply at Bank',
  backLink: 'Try different crop / land size',
  askAnything: 'Ask anything about your loan',
  importantDates: 'Important Dates',
  requiredDocs: 'Required Documents',
  stepByStep: 'Step-by-Step Application',
  statInterest: 'Interest',
  statAmount: 'Max Amount',
  statTenure: 'Tenure',
  disbursal: 'Disbursal',
  applyWindow: 'Apply Window',
  collateral: 'Collateral',
  processingFee: 'Processing Fee',
  purposeProd: 'Crop Production',
  purposeEquip: 'Equipment / Tools',
  purposeIrr: 'Irrigation',
  purposeEmerg: 'Emergency Funds',
  step1: 'Reading crop profile...',
  step2: 'Checking eligibility criteria...',
  step3: 'Matching government schemes...',
  step4: 'Calculating loan limits...',
  step5: 'Generating your prescription...',
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LoanAdvisor() {
  const { lang, t, translateText } = useLang()

  // Flow: 'form' | 'analyzing' | 'prescription' | 'chat'
  const [step, setStep] = useState('form')
  const [crop, setCrop] = useState('')
  const [acres, setAcres] = useState('')
  const [location, setLocation] = useState('')
  const [purpose, setPurpose] = useState('production')
  const [prescription, setPrescription] = useState(null)
  const [analyzeStep, setAnalyzeStep] = useState(0)
  const [focusedField, setFocusedField] = useState(null)
  const prescriptionAnim = useRef(new Animated.Value(0)).current

  // Chat state
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const scrollRef = useRef(null)
  const micScale = useRef(new Animated.Value(1)).current
  const listenTimer = useRef(null)
  const isFirstChat = useRef(true)

  // ── Translated UI strings ──
  const [ui, setUi] = useState(EN_UI)
  useEffect(() => {
    if (lang === 'en') { setUi(EN_UI); return }
    const keys = Object.keys(EN_UI)
    Promise.all(keys.map(k => translateText(EN_UI[k]))).then(vals => {
      const out = {}
      keys.forEach((k, i) => { out[k] = vals[i] })
      setUi(out)
    })
  }, [lang])

  // Derived from translated ui
  const analyzeSteps = [ui.step1, ui.step2, ui.step3, ui.step4, ui.step5]
  const purposes = [
    { id: 'production', label: ui.purposeProd },
    { id: 'equipment', label: ui.purposeEquip },
    { id: 'irrigation', label: ui.purposeIrr },
    { id: 'emergency', label: ui.purposeEmerg },
  ]

  // Prescription reveal animation
  useEffect(() => {
    if (step === 'prescription') {
      prescriptionAnim.setValue(0)
      Animated.spring(prescriptionAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }).start()
    }
  }, [step])

  // Chat greeting when entering chat step
  useEffect(() => {
    if (step === 'chat' && isFirstChat.current) {
      isFirstChat.current = false
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMessages([{ id: 1, text: t.loanGreeting, sender: 'ai', time }])
    }
  }, [step, lang])

  // Run analyzing animation then show prescription
  const runAnalysis = () => {
    if (!crop.trim() || !acres.trim() || !location.trim()) return
    setStep('analyzing')
    setAnalyzeStep(0)
    let i = 0
    const interval = setInterval(async () => {
      i++
      setAnalyzeStep(i)
      if (i >= analyzeSteps.length) {
        clearInterval(interval)
        const raw = recommendScheme(crop, acres, purpose)
        // Translate prescription text fields when not in English
        if (lang !== 'en') {
          const [interestNote, tenure, collateral, processingFee, disbursalDays,
            applicationWindow, tip, ...otherTranslations] = await Promise.all([
            translateText(raw.interestNote),
            translateText(raw.tenure),
            translateText(raw.collateral),
            translateText(raw.processingFee),
            translateText(raw.disbursalDays),
            translateText(raw.applicationWindow),
            translateText(raw.tip),
            ...raw.documents.map(d => translateText(d)),
          ])
          const translatedDocs = otherTranslations.slice(0, raw.documents.length)
          const translatedSteps = await Promise.all(raw.steps.map(s => translateText(s)))
          const translatedDates = await Promise.all(
            raw.importantDates.map(async ({ label, value }) => ({
              label: await translateText(label),
              value: await translateText(value),
            }))
          )
          setPrescription({
            ...raw,
            interestNote, tenure, collateral, processingFee,
            disbursalDays, applicationWindow, tip,
            documents: translatedDocs,
            steps: translatedSteps,
            importantDates: translatedDates,
          })
        } else {
          setPrescription(raw)
        }
        setTimeout(() => setStep('prescription'), 400)
      }
    }, 550)
  }

  // TTS
  const speakText = (text) => {
    const localeMap = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN' }
    Speech.stop()
    Speech.speak(text, { language: localeMap[lang] || 'en-IN', pitch: 1.0, rate: 0.92 })
  }

  // Mic pulse
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micScale, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(micScale, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start()
    } else {
      micScale.stopAnimation()
      Animated.timing(micScale, { toValue: 1, duration: 200, useNativeDriver: true }).start()
    }
  }, [isListening])

  const sendMessage = async (textToSend) => {
    const trimmed = (textToSend || input).trim()
    if (!trimmed) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { id: Date.now(), text: trimmed, sender: 'user', time }])
    setInput('')
    setTyping(true)
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120)
    try {
      const raw = await chatWithGPT(LOAN_SYSTEM_PROMPT, trimmed)
      const replyText = await translateText(raw)
      setMessages(prev => [...prev, { id: Date.now() + 1, text: replyText, sender: 'ai', time }])
      if (voiceMode) speakText(replyText)
    } catch {
      const reply = t.loanFallback6
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'ai', time }])
      if (voiceMode) speakText(reply)
    } finally {
      setTyping(false)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120)
    }
  }

  const handleMic = () => {
    if (isListening) {
      clearTimeout(listenTimer.current)
      setIsListening(false)
      if (input.trim()) sendMessage(input.trim())
    } else {
      setIsListening(true)
      setVoiceMode(true)
      listenTimer.current = setTimeout(() => {
        setIsListening(false)
        if (!input.trim()) setInput('What documents do I need?')
      }, 4000)
    }
  }

  // ── Header ──
  const Header = ({ showBack, onBack, subtitle }) => (
    <View style={S.header}>
      <View style={[S.hBlob, { width: 180, height: 180, top: -60, right: -50 }]} />
      <View style={[S.hBlob, { width: 90, height: 90, top: 30, right: 80 }]} />
      <View style={S.hRow}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={S.backBtn}>
            <ArrowLeft color="white" size={22} />
          </TouchableOpacity>
        )}
        <View style={S.avatarWrap}>
          <CreditCard color="white" size={20} />
        </View>
        <View style={S.flex1}>
          <Text style={S.hTitle}>{t.loanTitle}</Text>
          <Text style={S.hSub}>{subtitle || t.loanSub}</Text>
        </View>
        {step === 'chat' && (
          <TouchableOpacity
            style={[S.voiceToggle, voiceMode && S.voiceToggleOn]}
            onPress={() => { setVoiceMode(v => !v); Speech.stop() }}
          >
            <Volume2 color={voiceMode ? '#1b5e20' : '#999'} size={16} />
          </TouchableOpacity>
        )}
        <LanguageMenu />
      </View>
    </View>
  )

  // ── FORM STEP ──
  if (step === 'form') {
    return (
      <KeyboardAvoidingView style={S.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Header subtitle={ui.fillDetails} />
        <ScrollView contentContainerStyle={S.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <Text style={S.formHeading}>{ui.formTitle}</Text>
          <Text style={S.formSub}>{ui.formSub}</Text>

          {/* Crop */}
          <View style={[S.fieldCard, focusedField === 'crop' && S.fieldCardFocused]}>
            <View style={S.fieldLabel}>
              <Leaf color="#1b5e20" size={16} />
              <Text style={S.fieldLabelTxt}>{ui.cropLabel}</Text>
            </View>
            <TextInput
              style={S.fieldInput}
              placeholder={ui.cropPlaceholder}
              placeholderTextColor="#bbb"
              value={crop}
              onChangeText={setCrop}
              onFocus={() => setFocusedField('crop')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Land Size */}
          <View style={[S.fieldCard, focusedField === 'acres' && S.fieldCardFocused]}>
            <View style={S.fieldLabel}>
              <Home color="#1565c0" size={16} />
              <Text style={S.fieldLabelTxt}>{ui.landLabel}</Text>
            </View>
            <View style={S.fieldRow}>
              <TextInput
                style={[S.fieldInput, S.flex1]}
                placeholder="e.g. 2.5"
                placeholderTextColor="#bbb"
                value={acres}
                onChangeText={setAcres}
                keyboardType="decimal-pad"
                onFocus={() => setFocusedField('acres')}
                onBlur={() => setFocusedField(null)}
              />
              <View style={S.unitBadge}><Text style={S.unitTxt}>{ui.acresUnit}</Text></View>
            </View>
          </View>

          {/* Location */}
          <View style={[S.fieldCard, focusedField === 'location' && S.fieldCardFocused]}>
            <View style={S.fieldLabel}>
              <Search color="#e65100" size={16} />
              <Text style={S.fieldLabelTxt}>{ui.locationLabel}</Text>
            </View>
            <TextInput
              style={S.fieldInput}
              placeholder={ui.locationPlaceholder}
              placeholderTextColor="#bbb"
              value={location}
              onChangeText={setLocation}
              onFocus={() => setFocusedField('location')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Loan Purpose */}
          <View style={S.fieldCard}>
            <View style={S.fieldLabel}>
              <Zap color="#f57c00" size={16} />
              <Text style={S.fieldLabelTxt}>{ui.purposeLabel}</Text>
            </View>
            <View style={S.purposeGrid}>
              {purposes.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[S.purposeChip, purpose === p.id && S.purposeActive]}
                  onPress={() => setPurpose(p.id)}
                >
                  <Text style={[S.purposeTxt, purpose === p.id && S.purposeActiveTxt]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[S.submitBtn, (!crop.trim() || !acres.trim() || !location.trim()) && S.submitDim]}
            onPress={runAnalysis}
            disabled={!crop.trim() || !acres.trim() || !location.trim()}
            activeOpacity={0.85}
          >
            <BarChart2 color="white" size={20} />
            <Text style={S.submitTxt}>{ui.getPlan}</Text>
            <Send color="white" size={18} />
          </TouchableOpacity>

          {/* AI Chat link */}
          <TouchableOpacity style={S.chatLink} onPress={() => setStep('chat')}>
            <Zap color="#1b5e20" size={14} />
            <Text style={S.chatLinkTxt}>{ui.chatLink} →</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // ── ANALYZING STEP ──
  if (step === 'analyzing') {
    return (
      <View style={S.container}>
        <Header subtitle={ui.analyzingHeader} />
        <View style={S.analyzeCenter}>
          <View style={S.analyzeCard}>
            <ActivityIndicator color="#1b5e20" size="large" />
            <Text style={S.analyzeTitle}>{ui.matchingScheme}</Text>
            <Text style={S.analyzeSub}>for {crop} · {acres} acres · {location}</Text>
            <View style={S.analyzeSteps}>
              {analyzeSteps.map((s, i) => (
                <AnalyzingStep
                  key={i}
                  label={s}
                  done={i < analyzeStep}
                  active={i === analyzeStep}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    )
  }

  // ── PRESCRIPTION STEP ──
  if (step === 'prescription' && prescription) {
    const P = prescription
    return (
      <View style={S.container}>
        <Header
          showBack
          onBack={() => setStep('form')}
          subtitle={`Best match for ${crop} · ${acres} acres`}
        />
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={S.rxScroll}
          style={{
            opacity: prescriptionAnim,
            transform: [{ translateY: prescriptionAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
          }}
        >

          {/* Scheme Hero */}
          <View style={[S.rxHero, { backgroundColor: P.color }]}>
            <View style={S.rxBadge}><Text style={S.rxBadgeTxt}>{P.badge}</Text></View>
            <Text style={S.rxSchemeName}>{P.name}</Text>
            <Text style={S.rxBank}>{P.bank}</Text>

            {/* Stats Row */}
            <View style={S.rxStats}>
              {[
                { label: ui.statInterest, value: P.interest },
                { label: ui.statAmount, value: P.maxAmount },
                { label: ui.statTenure, value: P.tenure },
              ].map(({ label, value }) => (
                <View key={label} style={S.rxStat}>
                  <Text style={S.rxStatVal}>{value}</Text>
                  <Text style={S.rxStatKey}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Details */}
          <View style={S.rxSection}>
            {[
              { icon: Zap, color: '#1565c0', label: ui.disbursal, value: P.disbursalDays },
              { icon: AlertTriangle, color: '#e65100', label: ui.applyWindow, value: P.applicationWindow },
              { icon: AlertCircle, color: '#6a1b9a', label: ui.collateral, value: P.collateral },
              { icon: FileText, color: '#2e7d32', label: ui.processingFee, value: P.processingFee },
            ].map(({ icon: Icon, color, label, value }) => (
              <View key={label} style={S.detailRow}>
                <View style={[S.detailIcon, { backgroundColor: color + '18' }]}>
                  <Icon color={color} size={16} />
                </View>
                <View style={S.flex1}>
                  <Text style={S.detailLabel}>{label}</Text>
                  <Text style={S.detailValue}>{value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Important Dates */}
          <View style={S.card}>
            <View style={S.cardHeader}>
              <FileCheck color="#1b5e20" size={17} />
              <Text style={S.cardTitle}>{ui.importantDates}</Text>
            </View>
            {P.importantDates.map(({ label, value }) => (
              <View key={label} style={S.dateRow}>
                <Text style={S.dateLabel}>{label}</Text>
                <Text style={S.dateValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Documents Checklist */}
          <View style={S.card}>
            <View style={S.cardHeader}>
              <FileText color="#1565c0" size={17} />
              <Text style={S.cardTitle}>{ui.requiredDocs}</Text>
            </View>
            {P.documents.map((doc, i) => (
              <View key={i} style={S.docRow}>
                <View style={S.docNum}><Text style={S.docNumTxt}>{i + 1}</Text></View>
                <Text style={S.docTxt}>{doc}</Text>
              </View>
            ))}
          </View>

          {/* Application Steps */}
          <View style={S.card}>
            <View style={S.cardHeader}>
              <CheckCircle color="#2e7d32" size={17} />
              <Text style={S.cardTitle}>{ui.stepByStep}</Text>
            </View>
            {P.steps.map((s, i) => (
              <View key={i} style={S.appStep}>
                <View style={[S.appStepNum, { backgroundColor: P.color }]}>
                  <Text style={S.appStepNumTxt}>{i + 1}</Text>
                </View>
                <Text style={S.appStepTxt}>{s}</Text>
              </View>
            ))}
          </View>

          {/* Tip Box */}
          <View style={S.tipBox}>
            <Zap color="#f57c00" size={16} />
            <Text style={S.tipTxt}>{P.tip}</Text>
          </View>

          {/* Note on interest */}
          <View style={[S.tipBox, { backgroundColor: '#e3f2fd', borderColor: '#90caf9' }]}>
            <AlertCircle color="#1565c0" size={16} />
            <Text style={[S.tipTxt, { color: '#1565c0' }]}>
              Interest rate: {P.interest} — {P.interestNote}
            </Text>
          </View>

          {/* CTAs */}
          <View style={S.ctaRow}>
            <TouchableOpacity style={[S.ctaBtn, { backgroundColor: P.color }]} activeOpacity={0.85}>
              <CreditCard color="white" size={18} />
              <Text style={S.ctaBtnTxt}>{ui.applyBank}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={S.ctaBtnOutline} onPress={() => setStep('chat')} activeOpacity={0.85}>
              <Zap color="#1b5e20" size={18} />
              <Text style={S.ctaBtnOutlineTxt}>{ui.askMore}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={S.backLink} onPress={() => setStep('form')}>
            <Text style={S.backLinkTxt}>← {ui.backLink}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      </View>
    )
  }

  // ── CHAT STEP ──
  return (
    <KeyboardAvoidingView style={S.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header
        showBack
        onBack={() => setStep(prescription ? 'prescription' : 'form')}
        subtitle={ui.askAnything}
      />

      <ScrollView
        ref={scrollRef}
        style={S.chat}
        contentContainerStyle={S.chatContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(msg => (
          <View key={msg.id} style={[S.msgRow, msg.sender === 'user' ? S.userRow : S.aiRow]}>
            {msg.sender === 'ai' && (
              <View style={S.aiDot}><Zap color="#1b5e20" size={13} /></View>
            )}
            <View style={S.bubbleCol}>
              <View style={[S.bubble, msg.sender === 'user' ? S.userBubble : S.aiBubble]}>
                <Text style={[S.msgText, msg.sender === 'user' ? S.uText : S.aText]}>{msg.text}</Text>
              </View>
              <View style={[S.metaRow, msg.sender === 'user' && { alignSelf: 'flex-end' }]}>
                <Text style={S.timeStamp}>{msg.time}</Text>
                {msg.sender === 'ai' && voiceMode && (
                  <TouchableOpacity onPress={() => speakText(msg.text)} style={S.speakBtn}>
                    <Volume2 color="#1b5e20" size={12} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
        {typing && (
          <View style={[S.msgRow, S.aiRow]}>
            <View style={S.aiDot}><Zap color="#1b5e20" size={13} /></View>
            <View style={[S.bubble, S.aiBubble, S.typeBubble]}>
              <ActivityIndicator size="small" color="#1b5e20" />
              <Text style={S.typeText}>{t.aiTyping}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {isListening && (
        <View style={S.listeningBar}>
          <Waveform />
          <Text style={S.listenText}>{t.listeningText}</Text>
          <Waveform />
        </View>
      )}

      <View style={S.inputBar}>
        <TextInput
          style={S.input}
          placeholder={isListening ? t.listeningText : t.loanPlaceholder}
          placeholderTextColor={isListening ? '#43a047' : '#bbb'}
          value={input}
          onChangeText={setInput}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage()}
          multiline
          editable={!isListening}
        />
        <Animated.View style={{ transform: [{ scale: micScale }] }}>
          <TouchableOpacity style={[S.micBtn, isListening && S.micBtnActive]} onPress={handleMic}>
            <Mic color="white" size={20} />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity
          style={[S.sendBtn, (!input.trim() || isListening) && S.sendDim]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || typing || isListening}
        >
          <Send color="white" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  flex1: { flex: 1 },

  // Header
  header: { backgroundColor: '#1b5e20', paddingTop: 54, paddingHorizontal: 20, paddingBottom: 18, overflow: 'hidden' },
  hBlob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' },
  hRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  avatarWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  hTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  hSub: { color: '#a5d6a7', fontSize: 11, marginTop: 2 },
  voiceToggle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  voiceToggleOn: { backgroundColor: '#c8e6c9' },

  // Form
  formScroll: { padding: 20, paddingTop: 24 },
  formHeading: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginBottom: 6 },
  formSub: { fontSize: 13, color: '#888', marginBottom: 24, lineHeight: 20 },
  fieldCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, gap: 10, borderWidth: 1.5, borderColor: 'transparent' },
  fieldCardFocused: { borderColor: '#1b5e20', elevation: 4, shadowOpacity: 0.1 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldLabelTxt: { fontWeight: '800', fontSize: 13, color: '#333' },
  fieldInput: { backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#222' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unitBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  unitTxt: { color: '#1b5e20', fontWeight: '800', fontSize: 14 },
  purposeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  purposeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f5f5f5', borderWidth: 1.5, borderColor: 'transparent' },
  purposeActive: { backgroundColor: '#e8f5e9', borderColor: '#1b5e20' },
  purposeTxt: { fontSize: 13, fontWeight: '600', color: '#777' },
  purposeActiveTxt: { color: '#1b5e20', fontWeight: '800' },
  submitBtn: { backgroundColor: '#1b5e20', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 17, gap: 10, marginTop: 8, elevation: 4, shadowColor: '#1b5e20', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10 },
  submitDim: { backgroundColor: '#a5d6a7', elevation: 0 },
  submitTxt: { color: 'white', fontSize: 17, fontWeight: '900' },
  chatLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18 },
  chatLinkTxt: { color: '#1b5e20', fontSize: 13, fontWeight: '600' },

  // Analyzing
  analyzeCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  analyzeCard: { backgroundColor: 'white', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', gap: 14, elevation: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14 },
  analyzeTitle: { fontSize: 20, fontWeight: '900', color: '#1a1a1a' },
  analyzeSub: { fontSize: 13, color: '#888', textAlign: 'center' },
  analyzeSteps: { width: '100%', gap: 14, marginTop: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#ccc' },
  stepLabel: { fontSize: 14, color: '#aaa', flex: 1 },
  stepDone: { color: '#43a047', fontWeight: '600' },
  stepActive: { color: '#1b5e20', fontWeight: '700' },

  // Prescription
  rxScroll: { paddingBottom: 20 },
  rxHero: { paddingTop: 24, paddingHorizontal: 22, paddingBottom: 28 },
  rxBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  rxBadgeTxt: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  rxSchemeName: { color: 'white', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  rxBank: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 20 },
  rxStats: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 16, padding: 16, justifyContent: 'space-around' },
  rxStat: { alignItems: 'center', gap: 4 },
  rxStatVal: { color: 'white', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  rxStatKey: { color: 'rgba(255,255,255,0.65)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  rxSection: { margin: 16, backgroundColor: 'white', borderRadius: 18, padding: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, gap: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  detailLabel: { fontSize: 11, color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  detailValue: { fontSize: 14, color: '#222', fontWeight: '700', marginTop: 2 },

  card: { marginHorizontal: 16, marginBottom: 14, backgroundColor: 'white', borderRadius: 18, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#1a1a1a' },

  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  dateLabel: { fontSize: 13, color: '#777', fontWeight: '600', flex: 1 },
  dateValue: { fontSize: 13, color: '#1b5e20', fontWeight: '800', textAlign: 'right', flex: 1 },

  docRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  docNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  docNumTxt: { fontSize: 11, fontWeight: '900', color: '#1b5e20' },
  docTxt: { fontSize: 14, color: '#555', flex: 1, lineHeight: 21 },

  appStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  appStepNum: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  appStepNumTxt: { color: 'white', fontSize: 12, fontWeight: '900' },
  appStepTxt: { fontSize: 14, color: '#444', flex: 1, lineHeight: 22 },

  tipBox: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff8e1', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: '#ffe082' },
  tipTxt: { fontSize: 13, color: '#795548', flex: 1, lineHeight: 20, fontWeight: '600' },

  ctaRow: { flexDirection: 'row', marginHorizontal: 16, gap: 12, marginTop: 8, marginBottom: 8 },
  ctaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 14, elevation: 4 },
  ctaBtnTxt: { color: 'white', fontWeight: '800', fontSize: 15 },
  ctaBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 14, borderWidth: 2, borderColor: '#1b5e20', backgroundColor: 'white' },
  ctaBtnOutlineTxt: { color: '#1b5e20', fontWeight: '800', fontSize: 15 },
  backLink: { alignItems: 'center', paddingVertical: 12 },
  backLinkTxt: { color: '#888', fontSize: 13 },

  // Chat
  chat: { flex: 1 },
  chatContent: { padding: 16, gap: 16, paddingBottom: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  aiRow: { alignSelf: 'flex-start', maxWidth: '88%' },
  userRow: { alignSelf: 'flex-end', maxWidth: '82%', justifyContent: 'flex-end' },
  aiDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  bubbleCol: { gap: 4, flex: 1 },
  bubble: { padding: 14, borderRadius: 20 },
  aiBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
  userBubble: { backgroundColor: '#1b5e20', borderBottomRightRadius: 4, alignSelf: 'flex-end' },
  msgText: { fontSize: 15, lineHeight: 23 },
  aText: { color: '#222' },
  uText: { color: 'white' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeStamp: { fontSize: 10, color: '#bbb' },
  speakBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center' },
  typeBubble: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13 },
  typeText: { color: '#888', fontSize: 13 },

  listeningBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#e8f5e9', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#c8e6c9' },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 28 },
  waveBar: { width: 4, height: 22, borderRadius: 3, backgroundColor: '#1b5e20' },
  listenText: { color: '#2e7d32', fontSize: 13, fontWeight: '700' },

  inputBar: { flexDirection: 'row', padding: 12, paddingHorizontal: 14, backgroundColor: 'white', alignItems: 'flex-end', gap: 10, elevation: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: -3 }, shadowRadius: 8 },
  input: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, fontSize: 15, color: '#333', maxHeight: 120, lineHeight: 22 },
  micBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#43a047', justifyContent: 'center', alignItems: 'center' },
  micBtnActive: { backgroundColor: '#c62828' },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1b5e20', justifyContent: 'center', alignItems: 'center' },
  sendDim: { backgroundColor: '#a5d6a7' },
})
