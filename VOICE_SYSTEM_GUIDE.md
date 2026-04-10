# 🎙️ ZYCROP Voice Assistant System - Implementation Guide

## ✅ What's Been Implemented

### 1. **VoiceChatBubble Component** 
   - Location: `frontend/src/components/ui/VoiceChatBubble.js`
   - Reusable chat bubble with voice readout button
   - Works across all chat-based screens (LoanAdvisor, Pathologist, etc.)
   - Features:
     - ✅ Speak button on AI responses
     - ✅ Automatic text cleaning (removes markdown, keeps readability)
     - ✅ Language support (EN, TA, HI, TE, ML)
     - ✅ Visual feedback (speaking state)
     - ✅ Customizable formatting

### 2. **Enhanced Voice Service**
   - Location: `frontend/src/services/voiceService.js`
   - New domain-specific functions added:
     - `speakLoanAdviceClean()` - For LoanAdvisor responses
     - `speakPathologistFinding()` - For disease detection results
     - `speakTreatmentPlan()` - For pest/disease treatment
     - `speakSoilDetails()` - For soil analysis results
     - `speakSeasonalAdvice()` - For crop calendar
     - `speakFarmCertificate()` - For farm passport

### 3. **Updated LoanAdvisor Screen**
   - Now has voice readout for all AI responses
   - Each AI message shows "Read" button
   - User messages remain text-only (no voice needed)
   - Smooth voice playback with visual indicator

---

## 🎯 How to Add Voice to Other Screens

### For Chat-Based Screens (Pathologist, VoiceBot, Custom AI)

**Step 1: Import VoiceChatBubble**
```javascript
import { VoiceChatBubble } from '../components/ui';
```

**Step 2: Replace your ChatBubble rendering**
```javascript
// OLD:
<ChatBubble msg={msg} />

// NEW:
{msg.role === 'user' ? (
  <UserChatBubble msg={msg} lang={lang} />
) : (
  <VoiceChatBubble
    role="ai"
    text={msg.text}
    lang={lang}
    enableVoice={true}
  />
)}
```

**Step 3: Done!** Voice readout will work automatically.

---

### For Data Display Screens (MarketAI, SoilLab, Dashboard)

**For single data points with "Speak" button:**

```javascript
import { Feather } from '@expo/vector-icons';
import { speak } from '../services/voiceService';

// Add speak button next to data display
<TouchableOpacity
  onPress={() => speak(`The price of ${crop} is ₹${price}`, lang)}
  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
>
  <Feather name="volume-2" size={18} color={colors.primary} />
  <Text>Read Price</Text>
</TouchableOpacity>
```

**For bulk readout (announce all prices):**

```javascript
const readAllPrices = () => {
  const text = marketData
    .map(item => `${item.crop} is ${item.price} rupees`)
    .join('. ');
  speak(text, lang);
};

<TouchableOpacity onPress={readAllPrices}>
  <Text>📢 Read All Prices</Text>
</TouchableOpacity>
```

---

## 📋 Integration Examples by Screen

### **MarketAI.js** - Add voice readout to price cards
```javascript
// In PriceCard component
<View style={styles.cardRight}>
  <TouchableOpacity
    onPress={() => 
      speak(`${item.crop} price is ${item.price} rupees. Trend is ${item.change > 0 ? 'up' : 'down'}`, lang)
    }
  >
    <Feather name="volume-2" size={16} color={colors.primary} />
  </TouchableOpacity>
</View>
```

### **Pathologist.js** (Disease Scanner)
```javascript
// After diagnosis result
<TouchableOpacity
  onPress={() => 
    speakPathologistFinding(disease, severity, confidence, lang)
  }
  style={styles.speakButton}
>
  <MaterialCommunityIcons name="volume-high" size={20} color="#fff" />
  <Text style={{ color: '#fff', fontWeight: '600' }}>Hear Diagnosis</Text>
</TouchableOpacity>
```

### **SoilLab.js** - Announce soil results
```javascript
// After analysis complete
<TouchableOpacity
  onPress={() =>
    speakSoilDetails(nitrogen, phosphorus, potassium, pH, organic, lang)
  }
>
  <Text>🔊 Read Results Aloud</Text>
</TouchableOpacity>
```

### **DiseaseLibrary.js** - Read disease info
```javascript
// In disease detail card
<TouchableOpacity
  onPress={() => speak(disease.treatment, lang, { rate: 0.88 })}
>
  <Feather name="volume-2" size={18} />
  <Text>Read Treatment</Text>
</TouchableOpacity>
```

---

## 🎤 Voice Features Available

### Core Functions (Already Working)
- ✅ `speak(text, lang, options)` - Custom text readout
- ✅ `stopSpeaking()` - Stop current audio
- ✅ `isSpeaking()` - Check if speaking
- ✅ VoiceBot microphone input (speech-to-text)

### Domain-Specific Functions
```javascript
// Disease & Pest
speakPathologistFinding(disease, severity, accuracy, lang)
speakTreatmentPlan(pestName, dosage, frequency, lang)

// Soil Analysis
speakSoilDetails(N, P, K, pH, organic, lang)

// Market
speakMarketPrice(crop, price, trend, lang)

// Loans
speakLoanAdviceClean(text, lang)

// Calendar
speakSeasonalAdvice(month, crop, activity, lang)

// Farm Passport
speakFarmCertificate(area, surveyNo, owner, lang)
```

---

## 🌍 Language Support

All voice functions support **5 languages**:
- 🇬🇧 English (en)
- 🇮🇳 Tamil (ta)
- 🇮🇳 Hindi (hi)
- 🇮🇳 Telugu (te)
- 🇮🇳 Malayalam (ml)

**Usage:**
```javascript
speak(text, 'ta')  // Tamil
speak(text, 'hi')  // Hindi
speak(text, 'en')  // English (default)
```

---

## 🎨 UI/UX Best Practices

### When to Use Voice:
✅ **DO use voice for:**
- Important results (disease diagnosis, loan approval)
- Detailed information (treatment plans, soil reports)
- Educational content (disease symptoms, spray timing)
- Confirmations (navigation, action completion)
- Alert announcements

❌ **DON'T use voice for:**
- Every single field (overwhelming)
- Static UI text (buttons, labels)
- Large data tables (hard to follow aurally)
- Quick status updates (use visual only)

### Recommended Pattern:
```
Data Display + "Read" Button + Auto-Stop Previous Audio
```

---

## 📱 Testing Voice on Your Device

### Test LoanAdvisor Voice (Already Implemented)
1. Open LoanAdvisor screen
2. Ask a question (e.g., "How much KCC loan can I get?")
3. Click **"Read"** button on AI response
4. Hear the answer read aloud
5. Works in all 5 languages automatically

### Test Custom Voice Function
```javascript
import { speak } from './services/voiceService';

// In any component:
<TouchableOpacity onPress={() => speak("Hello farmer", "en")}>
  <Text>Test Voice</Text>
</TouchableOpacity>
```

---

## 📝 Quick Checklist for Adding to a Screen

- [ ] Import `speak` from `voiceService`
- [ ] Import `VoiceChatBubble` for chat screens
- [ ] Get language context: `const { lang } = useLang()`
- [ ] Add speak button with icon (Feather volume-2)
- [ ] Call appropriate speak function
- [ ] Test in app with different languages
- [ ] Verify text sounds natural (test rate: 0.85–0.9)

---

## 🚀 Next Steps You Can Do

1. **Add to MarketAI** - Speak prices when user taps a crop
2. **Add to Pathologist** - Auto-read diagnosis results
3. **Add to SoilLab** - Announce NPK values
4. **Add to DiseaseLibrary** - Read treatment steps
5. **Add to GovSchemes** - Read subsidy details
6. **Add to CropCalendar** - Read seasonal tasks

---

## 📞 Troubleshooting

### Voice not working?
1. Check device volume is not muted
2. Check permissions: Settings → Apps → ZYCROP → Permissions → Microphone/Audio
3. Test with: `speak("Hello", "en")` in browser console

### Text sounds robotic?
- Lower `rate` parameter: `speak(text, lang, { rate: 0.8 })`
- Adjust `pitch`: `speak(text, lang, { pitch: 0.9 })`

### Only English works?
- Ensure device supports regional TTS engines
- Some Android devices may need language pack installation

---

## 📖 File Reference

| File | Purpose |
|------|---------|
| `voiceService.js` | All TTS functions & voice utilities |
| `VoiceChatBubble.js` | Reusable chat bubble with voice button |
| `VoiceFAB.js` | Floating voice action button (Dashboard) |
| `VoiceBot.js` | Speech-to-text & conversation AI |
| `LoanAdvisor.js` | **UPDATED** - Chat with voice readout |

---

## 🎙️ Voice Files Ready to Use

All functions are **production-ready**. Just import and use!

```javascript
// Import what you need
import {
  speak,
  stopSpeaking,
  speakMarketPrice,
  speakDiseaseResult,
  speakSoilDetails,
  speakLoanAdviceClean,
} from '../services/voiceService';

import { VoiceChatBubble } from '../components/ui';
```

---

**Happy farming with voice! 🌾🎤**
