/**
 * voiceService.js — ZYCROP AI Voice System
 * ==========================================
 * Centralized TTS (Text-to-Speech) service for all screens.
 * Powers voice guidance, result readouts, and scan instructions.
 * Uses expo-speech which works on Android + iOS without any native linking.
 */
import * as Speech from 'expo-speech'

// Map app language codes to BCP-47 locale tags for TTS
const LANG_LOCALE = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ml: 'ml-IN',
}

// Default TTS options
const DEFAULT_OPTIONS = {
  rate:  0.88,
  pitch: 1.0,
}

// ─── Core TTS ────────────────────────────────────────────────────────────────

export const speak = (text, lang = 'en', opts = {}) => {
  if (!text) return
  Speech.stop()
  Speech.speak(String(text), {
    language: LANG_LOCALE[lang] || 'en-IN',
    ...DEFAULT_OPTIONS,
    ...opts,
  })
}

export const stopSpeaking = () => Speech.stop()

export const isSpeaking = () => Speech.isSpeakingAsync()

// ─── Scan Instructions ────────────────────────────────────────────────────────

const SCAN_INSTRUCTIONS = {
  en: 'Point the camera at the diseased leaf. Make sure there is good natural lighting for best results.',
  ta: 'நோயுற்ற இலையை கேமராவில் காட்டுங்கள். சிறந்த முடிவுகளுக்கு நல்ல இயற்கை வெளிச்சம் இருப்பதை உறுதிசெய்யுங்கள்.',
  hi: 'रोगग्रस्त पत्ती पर कैमरा लगाएं। सर्वोत्तम परिणामों के लिए अच्छी प्राकृतिक रोशनी सुनिश्चित करें।',
  te: 'రోగగ్రస్త ఆకు వైపు కెమెరా చూపండి. ఉత్తమ ఫలితాల కోసం మంచి సహజ వెలుతురు ఉండేలా చూసుకోండి.',
  ml: 'രോഗബാധിത ഇലയിൽ ക്യാമറ ചൂണ്ടുക. മികച്ച ഫലങ്ങൾക്ക് നല്ല പ്രകൃതി വെളിച്ചം ഉറപ്പ് വരുത്തുക.',
}

const SOIL_INSTRUCTIONS = {
  en: 'Point the camera at dry soil in natural sunlight for accurate AI soil analysis.',
  ta: 'ஏஐ மண் பகுப்பாய்விற்கு இயற்கை சூரிய ஒளியில் உலர் மண்ணை கேமராவில் காட்டுங்கள்.',
  hi: 'सटीक AI मिट्टी विश्लेषण के लिए प्राकृतिक धूप में सूखी मिट्टी पर कैमरा लगाएं।',
  te: 'ఖచ్చితమైన AI నేల విశ్లేషణ కోసం సహజ సూర్యప్రకాశంలో పొడి నేలపై కెమెరా చూపండి.',
  ml: 'കൃത്യമായ AI മണ്ണ് വിശകലനത്തിനായി സ്വാഭാവിക സൂര്യപ്രകാശത്തിൽ ഉണങ്ങിയ മണ്ണ് കാണിക്കൂ.',
}

const ANALYZING_PHRASES = {
  en: 'AI is analyzing your crop. Please wait.',
  ta: 'ஏஐ உங்கள் பயிரை பகுப்பாய்வு செய்கிறது. சற்று காத்திருங்கள்.',
  hi: 'AI आपकी फसल का विश्लेषण कर रहा है। कृपया प्रतीक्षा करें।',
  te: 'AI మీ పంటను విశ్లేషిస్తోంది. దయచేసి వేచి ఉండండి.',
  ml: 'AI നിങ്ങളുടെ വിള വിശകലനം ചെയ്യുന്നു. ദയവായി കാത്തിരിക്കൂ.',
}

export const speakScanInstruction  = (lang) => speak(SCAN_INSTRUCTIONS[lang] || SCAN_INSTRUCTIONS.en, lang)
export const speakSoilInstruction  = (lang) => speak(SOIL_INSTRUCTIONS[lang] || SOIL_INSTRUCTIONS.en, lang)
export const speakAnalyzing        = (lang) => speak(ANALYZING_PHRASES[lang] || ANALYZING_PHRASES.en, lang)

// ─── Diagnosis Result Readout ──────────────────────────────────────────────

export const speakDiseaseResult = (disease, severity, lang) => {
  const msgs = {
    en: `${disease} detected. Severity is ${severity}. Please check the treatment plan below.`,
    ta: `${disease} கண்டறியப்பட்டது. தீவிரம் ${severity}. கீழே உள்ள சிகிச்சை திட்டத்தை பார்க்கவும்.`,
    hi: `${disease} का पता चला। गंभीरता ${severity} है। कृपया नीचे उपचार योजना देखें।`,
    te: `${disease} గుర్తించబడింది. తీవ్రత ${severity}. దయచేసి క్రింది చికిత్స ప్రణాళికను చూడండి.`,
    ml: `${disease} കണ്ടെത്തി. തീవ്രത ${severity} ആണ്. ദയവായി ചുവടെ ചികിത്സ പദ്ധതി കാണൂ.`,
  }
  speak(msgs[lang] || msgs.en, lang)
}

// ─── Soil Result Readout ──────────────────────────────────────────────────

export const speakSoilResult = (soilType, bestCrop, lang) => {
  const msgs = {
    en: `Soil analysis complete. Your soil type is ${soilType}. Recommended crop is ${bestCrop}.`,
    ta: `மண் பகுப்பாய்வு முடிந்தது. உங்கள் மண் வகை ${soilType}. பரிந்துரைக்கப்பட்ட பயிர் ${bestCrop}.`,
    hi: `मिट्टी विश्लेषण पूर्ण। आपकी मिट्टी का प्रकार ${soilType} है। recommended crop ${bestCrop} है।`,
    te: `నేల విశ్లేషణ పూర్తయింది. మీ నేల రకం ${soilType}. సిఫార్సు చేయబడిన పంట ${bestCrop}.`,
    ml: `മണ്ണ് വിശകലനം പൂർത്തിയായി. നിങ്ങളുടെ മണ്ണ് ഇനം ${soilType} ആണ്. ശുപാർശ ചെയ്ത വിള ${bestCrop}.`,
  }
  speak(msgs[lang] || msgs.en, lang)
}

// ─── Market Price Readout ──────────────────────────────────────────────────

export const speakMarketPrice = (crop, price, trend, lang) => {
  const msgs = {
    en: `Current mandi price for ${crop} is ${price} per quintal. ${trend}`,
    ta: `${crop} தற்போதைய மண்டி விலை குவிண்டலுக்கு ${price}. ${trend}`,
    hi: `${crop} का वर्तमान मंडी मूल्य ${price} प्रति कुंतल है। ${trend}`,
    te: `${crop} ప్రస్తుత మండీ ధర క్వింటాలుకు ${price}. ${trend}`,
    ml: `${crop} ഇപ്പോഴത്തെ മണ്ടി വില ക്വിന്റലിന് ${price} ആണ്. ${trend}`,
  }
  speak(msgs[lang] || msgs.en, lang)
}

// ─── Loan AI Readout ──────────────────────────────────────────────────────

export const speakLoanResponse = (text, lang) => speak(text, lang)

// ─── Dashboard Greeting ───────────────────────────────────────────────────

export const speakDashboardGreeting = (lang) => {
  const msgs = {
    en: 'Welcome to ZYCROP. I am your AI farm assistant. How can I help you today?',
    ta: 'சைக்ரோப்-க்கு வரவேற்கிறோம். நான் உங்கள் ஏஐ பண்ணை உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    hi: 'ZYCROP में आपका स्वागत है। मैं आपका AI कृषि सहायक हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?',
    te: 'ZYCROP కి స్వాగతం. నేను మీ AI వ్యవసాయ సహాయకుడిని. నేను ఈరోజు మీకు ఎలా సహాయపడగలను?',
    ml: 'ZYCROP-ലേക്ക് സ്വാഗതം. ഞാൻ നിങ്ങളുടെ AI കൃഷി സഹായിയാണ്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?',
  }
  speak(msgs[lang] || msgs.en, lang)
}

// ─── Voice Navigation Commands ────────────────────────────────────────────

/**
 * Parse spoken text into a navigation target.
 * Returns screen name or null if no intent recognized.
 */
export const resolveVoiceIntent = (text) => {
  const t = (text || '').toLowerCase().trim()
  if (!t) return null

  // Soil / Fertilizer
  if (/soil|fertilizer|npk|ph|manni|mannu|மண்|मिट्टी|నేల|മണ്ണ്/.test(t)) return 'SoilLab'
  // Market / Price
  if (/market|price|mandi|bazar|விலை|bazaar|दाम|मूल्य|ధర|വില/.test(t)) return 'Market'
  // Subsidy / Schemes
  if (/scheme|subsidy|government|yojana|திட்டம்|योजना|పథకం|പദ്ധതി/.test(t)) return 'GovSchemes'
  // Passport / Records
  if (/passport|record|certificate|சான்று|प्रमाण|రికార్డు|രേഖ/.test(t)) return 'FarmPassport'
  // Loan / Bank
  if (/loan|credit|bank|kcc|கடன்|ऋण|రుణం|വായ്പ/.test(t)) return 'Loans'
  // Disease / Scan
  if (/disease|pest|scan|diagnos|நோய்|रोग|వ్యాధి|രോഗം/.test(t)) return 'AI Scan'
  // Library
  if (/library|encyclopedia|list|நூலகம்|पुस्तकालय|గ్రంథాలయం|ലൈബ്രറി/.test(t)) return 'Library'

  return null
}

// ─── Voice Confirmation ───────────────────────────────────────────────────

export const speakNavigation = (screen, lang) => {
  const screenNames = {
    SoilLab:     { en: 'Soil Lab', ta: 'மண் ஆய்வகம்', hi: 'मिट्टी लैब', te: 'నేల ల్యాబ్', ml: 'മണ്ണ് ലാബ്' },
    Market:      { en: 'Market Prices', ta: 'சந்தை விலைகள்', hi: 'बाजार भाव', te: 'మార్కెట్ ధరలు', ml: 'മാർക്കറ്റ് വില' },
    GovSchemes:  { en: 'Government Schemes', ta: 'அரசு திட்டங்கள்', hi: 'सरकारी योजनाएं', te: 'ప్రభుత్వ పథకాలు', ml: 'സർക്കാർ പദ്ധതികൾ' },
    FarmPassport:{ en: 'Farm Passport', ta: 'பண்ணை பாஸ்போர்ட்', hi: 'फार्म पासपोर्ट', te: 'వ్యవసాయ పాస్‌పోర్ట్', ml: 'ഫാം പാസ്‌പോർട്ട്' },
    Loans:       { en: 'Loan Advisor', ta: 'கடன் உதவியாளர்', hi: 'ऋण सलाहकार', te: 'రుణ సలహాదారు', ml: 'വായ്പ സഹായി' },
    'AI Scan':   { en: 'AI Crop Scanner', ta: 'ஏஐ பயிர் ஸ்கேனர்', hi: 'AI फसल स्कैनर', te: 'AI పంట స్కానర్', ml: 'AI വിള സ്കാനർ' },
    Library:     { en: 'Disease Library', ta: 'நோய் நூலகம்', hi: 'रोग पुस्तकालय', te: 'వ్యాధి గ్రంథాలయం', ml: 'രോഗ ലൈബ്രറി' },
  }
  const name = screenNames[screen]?.[lang] || screenNames[screen]?.en || screen
  const msgs = {
    en: `Opening ${name}.`,
    ta: `${name} திறக்கிறது.`,
    hi: `${name} खोल रहा है।`,
    te: `${name} తెరుస్తోంది.`,
    ml: `${name} തുറക്കുന്നു.`,
  }
  speak(msgs[lang] || msgs.en, lang)
}
