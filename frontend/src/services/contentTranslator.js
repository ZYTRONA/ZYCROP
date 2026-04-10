/**
 * contentTranslator.js
 * Service to translate disease, crop, and other dynamic content
 * Provides fallback to English if translation not available
 */

// ═════════════════════════════════════════════════════════════════
// TAMIL DISEASE CONTENT TRANSLATIONS
// ═════════════════════════════════════════════════════════════════
const tamilDiseaseTranslations = {
  'Leaf Blight': {
    name: 'இலை நோய்',
    symptoms: [
      'இலைகளில் நீர் நிறைந்த பழுப்பு நிற வீக்கம்',
      'வீக்கம் பரவி மஞ்சள் மூடிய ஆக மாறும்',
      'இலைகள் முன்னே உதிரும்',
      'கடுமையான நோய்க்கு இளம் தண்டு கறுக்கம்',
    ],
    treatment: [
      'மான்கோசேப் 2 கிராம்/லிட்டர் ஒவ்வொரு 7 நாட்களுக்கு தெளிக்க',
      'செப்பு ஆக்சிக்குளோரைடு 3 கிராம்/லிட்டர்',
      'நோய்படிய இலைகளை அகற்றி தீக்கு வைக்க',
      'மேலே தண்ணீர் தெளிப்பு தவிர்க்க',
    ],
    prevention: [
      'சான்றளிக்கப்பட்ட நோய়-நீங்கிய விதை உபயோகம்',
      'சரியான அளவு உரம் பிரயோகம்',
      'ஒவ்வொரு 2 ஆண்டுக்கு ஒரு முறை பயிர் சுழற்சி',
      'அறுவடை முிறு வயல் பாக்க சுத்தம்',
    ],
  },

  'Powdery Mildew': {
    name: 'வெள்ளைப் பூஞ்சை',
    symptoms: [
      'இலை, தண்டு மற்றும் பூவில் வெள்ளை பூஞ்சை',
      'பாதிக்கப்பட்ட பகுதி மஞ்சளாக மாறும்',
      'இலை சுருட்டிக் குருடும்',
      'இளம் பூ சிம்ம்',
    ],
    treatment: [
      'கந்தக வேலி 25 கிலோ/ஹெக்டேர்',
      'சல்ফர் 40% உ.பி 2 கிராம்/லிட்டர் தெளிக்க',
      'பொட்டாசியம் பைக்கார்பனேட் 1% தெளிக்க',
      'திரிகோடெர்மா புஞ்சை நாசினி தெளிக்க',
    ],
    prevention: [
      'நல்ல காற்றோட்டம் வேண்டும்',
      'மேலே தண்ணீர் தெளிப்பு தவிர்க்க',
      'மோசமான பகுதிகளை அகற்றி தீக்கு வைக்க',
      'நோய் எதிர்ப்பு ரகம் பயன்படுத்த',
    ],
  },

  'Rust Disease': {
    name: 'பழுப்பு நோய்',
    symptoms: [
      'இலையில் சிவப்பு பழுப்பு புள்ளி தெரிவர',
      'அளவு விரிந்து மசாலா போல் பொடி வெளியாகும்',
      'கீழே தெல்லு நிற புள்ளி',
      'தீவிரமான நோயில் இலை மார்தல் தடுக்கப்பட்டு கறுக்கும்',
    ],
    treatment: [
      'ப்ரொபிகோனசோல் 25% ஆ 0.5 எம்எல்/லிட்டர் தெளிக்க',
      'ஹெக்ச கோனசோல் 5% எஸ்.சி 1 எம்எல்/லிட்டர்',
      'மான்கோசேப் 2% தெளிக்க',
      'வயல் தண்ணி நேர்த்தி செய்ய',
    ],
    prevention: [
      'நோய் எதிர்ப்பு ரக விதை செய்ய',
      'ஒவ்வொரு 2-3 ஆண்டுக்கு பயிர் சுழற்சி',
      'வயல் ஓரம் சுத்தம் செய்ய',
      'நோய்-நீங்கிய விதை பயன்படுத்த',
    ],
  },

  'Downy Mildew': {
    name: 'கீழ் பூஞ்சை நோய்',
    symptoms: [
      'இலை மேலே மஞ்சள் நிற புள்ளி',
      'கீழ் பகுதியில் வெள்ளை பூஞ்சை',
      'பூ பாறு சீர் நீங்கும்',
      'கொசுக்கள் விழுந்து போவல்',
    ],
    treatment: [
      'மெட்டலக்ஸைல் + மான்கோசேப் 2.5 கிராம் தெளிக்க',
      'ஃபோசெட்டில்-ஏ.எல் 80% தெளிக்க',
      'செப்பு புஞ்சை நாசினி 1% தெளிக்க',
      'பொர்டோ கலவை 1% தெளிக்க',
    ],
    prevention: [
      'நல்ல சாய்வு வயல் அமைப்பு',
      'எளிமையான தண்ணீர் பாக்க நிர்ப்பாக',
      'மோசமான கொசுக்களை அகற்றி தீக்கு வைக்க',
      'வயல் ஈர நிலை கூறு நிர்ப்பாக',
    ],
  },
};

// ═════════════════════════════════════════════════════════════════
// TAMIL CROP SCHEDULE TRANSLATIONS (Key crops)
// ═════════════════════════════════════════════════════════════════
const tamilCropTranslations = {
  'Tomato': { name: 'தக்காளி', season: 'கார் + ரபி', description: 'பாக்க மசாலை பயிர்' },
  'Wheat': { name: 'கோதுமை', season: 'ரபி', description: 'தானிய பயிர்' },
  'Rice': { name: 'அரிசி', season: 'கார்', description: 'முக்கிய தானிய பயிர்' },
  'Cotton': { name: 'பருத்தி', season: 'கார்', description: 'ஆடை பயிர்' },
  'Chili': { name: 'மிளகாய்', season: 'கார் + ரபி', description: 'மசாலை பயிர்' },
  'Onion': { name: 'வெங்காயம்', season: 'ரபி', description: 'ஈய பயிர்' },
  'Potato': { name: 'உருளைக்கிழங்கு', season: 'ரபி', description: 'நிலக்கடல் பயிர்' },
  'Groundnut': { name: 'நிலக்கடல்', season: 'கார் + ரபி', description: 'எண்ணெய் பயிர்' },
  'Maize': { name: 'சோளம்', season: 'கார்/ரபி/வசந்தம்', description: 'தானிய பயிர்' },
  'Soybean': { name: 'சோயாபீன்', season: 'கார்', description: 'எண்ணெய் பயிர்' },
  'Sugarcane': { name: 'கரும்பு', season: 'ஆண்டு முழுவதும்', description: 'தெனை பயிர்' },
  'Banana': { name: 'வாழை', season: 'ஆண்டு முழுவதும்', description: 'பழ பயிர்' },
};

// ═════════════════════════════════════════════════════════════════
// PUBLIC API
// ═════════════════════════════════════════════════════════════════

/**
 * Translate disease content to specified language
 * @param {string} diseaseName - English disease name
 * @param {string} lang - Language code (e.g., 'ta' for Tamil)
 * @returns {object} Translated disease data or original if not available
 */
export const translateDiseaseContent = (disease, lang) => {
  // Only translate if language is Tamil and translation exists
  if (lang !== 'ta') {
    return disease; // Return original for other languages
  }

  const tamilTranslation = tamilDiseaseTranslations[disease.name];
  if (!tamilTranslation) {
    return disease; // Return original if no Tamil translation
  }

  // Merge Tamil translation with original disease data
  return {
    ...disease,
    name: tamilTranslation.name || disease.name,
    symptoms: tamilTranslation.symptoms || disease.symptoms,
    treatment: tamilTranslation.treatment || disease.treatment,
    prevention: tamilTranslation.prevention || disease.prevention,
  };
};

/**
 * Translate crop content to specified language
 * @param {string} cropName - English crop name
 * @param {string} lang - Language code (e.g., 'ta' for Tamil)
 * @returns {object} Translation object or null if not available
 */
export const translateCropContent = (cropName, lang) => {
  if (lang !== 'ta') {
    return null; // Return null for other languages
  }

  return tamilCropTranslations[cropName] || null;
};

/**
 * Get translated disease name
 */
export const getTranslatedDiseaseName = (englishName, lang) => {
  if (lang === 'ta' && tamilDiseaseTranslations[englishName]) {
    return tamilDiseaseTranslations[englishName].name;
  }
  return englishName;
};

/**
 * Get translated crop name
 */
export const getTranslatedCropName = (englishName, lang) => {
  if (lang === 'ta' && tamilCropTranslations[englishName]) {
    return tamilCropTranslations[englishName].name;
  }
  return englishName;
};
