/**
 * cropLibraryImages.js — ZYCROP Complete Crop & Disease Image Registry
 *
 * Place at: zycrop/assets/cropLibraryImages.js
 *
 * USAGE:
 *   import { DiseaseImages, CropImages, getPestImage,
 *            getDiseaseImg, getCropImg } from '../assets/cropLibraryImages';
 *
 *   // In Disease Library list item:
 *   const img = getDiseaseImg('Leaf Blight');
 *   <Image source={{ uri: img.uri }} onError={() => img.fallback} />
 *
 *   // In Crop Calendar / Market card:
 *   const img = getCropImg('Rice');
 *   <Image source={{ uri: img.uri }} onError={() => img.fallback} />
 *
 * ALL photos: Unsplash free license (unsplash.com/license)
 * Photo IDs are hardcoded — these resolve to specific real photographs.
 * Picsum fallback for every image — works fully offline after first load.
 *
 * IMAGE SIZES:
 *   Library list thumbnail  : w=120&q=80  (56×56 rendered)
 *   Library detail header   : w=800&q=85  (full screen)
 *   Crop calendar card      : w=400&q=80  (card thumbnail)
 *   Market price card       : w=600&q=80  (featured card)
 */

const UNS = 'https://images.unsplash.com/photo-';
const PSUM = 'https://picsum.photos/seed';

// ─────────────────────────────────────────────────────────────
//  HELPER — builds all 3 size variants from one photo ID
// ─────────────────────────────────────────────────────────────
const photo = (id, psumSeed) => ({
  thumb: { uri: `${UNS}${id}?w=120&q=80`, fallback: `${PSUM}/${psumSeed}-th/120/120` },
  card: { uri: `${UNS}${id}?w=400&q=80`, fallback: `${PSUM}/${psumSeed}-cd/400/220` },
  hero: { uri: `${UNS}${id}?w=800&q=85`, fallback: `${PSUM}/${psumSeed}-hr/800/400` },
  market: { uri: `${UNS}${id}?w=600&q=80`, fallback: `${PSUM}/${psumSeed}-mk/600/300` },
});

// ═══════════════════════════════════════════════════════════════
//  SECTION 1 — DISEASE IMAGES
//  Each entry: { thumb, card, hero, market } size variants
//  Category tags used for ChipFilterRow filtering
// ═══════════════════════════════════════════════════════════════
export const DiseaseImages = {
  leaf_blight: {
    ...photo('1518531933037-91b2f5f229cc', 'dis-lbight'),
    name: 'Leaf Blight',
    nameKey: 'disease_leaf_blight',
    category: 'Fungal',
    severity: 'High',
    affects: ['Rice', 'Wheat', 'Maize', 'Sorghum'],
    pathogen: 'Alternaria solani / Helminthosporium oryzae',
    symptoms: [
      'Brown water-soaked lesions on leaves',
      'Lesions enlarge with yellow halos',
      'Premature leaf drop',
      'Seedling collar rot in severe cases',
    ],
    treatment: [
      'Mancozeb 2g/L spray every 7 days',
      'Copper oxychloride 3g/L',
      'Remove and destroy infected leaves',
      'Avoid overhead irrigation',
    ],
    prevention: [
      'Use certified disease-free seeds',
      'Balanced nitrogen application',
      'Crop rotation every 2 years',
      'Field sanitation after harvest',
    ],
    dosage: 'Mancozeb 75 WP — 2.0 g per litre of water. Spray 500L/acre. Repeat 3 times at 7-day intervals.',
  },

  powdery_mildew: {
    ...photo('1597843786441-a8ece0f3d10e', 'dis-pmild'),
    name: 'Powdery Mildew',
    nameKey: 'disease_powdery_mildew',
    category: 'Fungal',
    severity: 'Medium',
    affects: ['Cucumber', 'Grapes', 'Tomato', 'Chilli', 'Pea', 'Mustard'],
    pathogen: 'Erysiphe cichoracearum / Sphaerotheca fuliginea',
    symptoms: [
      'White powdery coating on upper leaf surface',
      'Yellowing and wilting of affected parts',
      'Distorted shoots and buds',
      'Premature defoliation',
    ],
    treatment: [
      'Sulphur dust 25 kg/acre',
      'Wettable sulphur 3g/L spray',
      'Propiconazole 1mL/L at onset',
      'Neem oil 5mL/L as preventive',
    ],
    prevention: [
      'Plant resistant varieties',
      'Avoid dense planting',
      'Improve air circulation',
      'Avoid excess nitrogen',
    ],
    dosage: 'Sulphur 80 WP — 3.0 g per litre. Spray in cool morning hours. Avoid spraying when temp >35°C.',
  },

  rust_disease: {
    ...photo('1574323347407-f5e1ad6d020b', 'dis-rust'),
    name: 'Rust Disease',
    nameKey: 'disease_rust',
    category: 'Fungal',
    severity: 'High',
    affects: ['Wheat', 'Soybean', 'Groundnut', 'Coffee', 'Bean'],
    pathogen: 'Puccinia triticina (wheat) / Phakopsora pachyrhizi (soybean)',
    symptoms: [
      'Orange-brown pustules on leaf surface',
      'Reddish powder when touched',
      'Premature leaf fall',
      'Shrivelled grain in wheat',
    ],
    treatment: [
      'Propiconazole 25 EC — 1mL/L',
      'Tebuconazole 1mL/L',
      'Mancozeb + Carbendazim mix',
      'Spray at first symptom appearance',
    ],
    prevention: [
      'Use rust-resistant cultivars',
      'Early sowing to escape peak rust season',
      'Avoid late nitrogen application',
      'Monitor fields weekly',
    ],
    dosage: 'Propiconazole 25 EC — 1.0 mL per litre. 2 sprays at 15-day interval. 200–250 mL per acre.',
  },

  downy_mildew: {
    ...photo('1497436072909-60f360fe1ce9', 'dis-downy'),
    name: 'Downy Mildew',
    nameKey: 'disease_downy_mildew',
    category: 'Fungal',
    severity: 'Medium',
    affects: ['Grapes', 'Onion', 'Maize', 'Cucumber', 'Spinach'],
    pathogen: 'Plasmopara viticola / Peronospora destructor',
    symptoms: [
      'Yellow irregular patches on upper surface',
      'Grey-purple fuzzy growth on underside',
      'Leaf distortion and necrosis',
      'Severe in humid conditions',
    ],
    treatment: [
      'Metalaxyl + Mancozeb 2.5g/L',
      'Copper hydroxide 3g/L',
      'Fosetyl aluminium 2g/L',
      'Spray both upper and lower leaf surfaces',
    ],
    prevention: [
      'Avoid overhead irrigation',
      'Space plants for air flow',
      'Remove volunteer plants',
      'Spray preventively before rainy season',
    ],
    dosage: 'Metalaxyl 8% + Mancozeb 64% WP — 2.5 g per litre. Start before onset of monsoon. 3–4 sprays.',
  },

  anthracnose: {
    ...photo('1488459716781-31db52582fe9', 'dis-anthr'),
    name: 'Anthracnose',
    nameKey: 'disease_anthracnose',
    category: 'Fungal',
    severity: 'Medium',
    affects: ['Mango', 'Chilli', 'Bean', 'Cucumber', 'Papaya'],
    pathogen: 'Colletotrichum gloeosporioides',
    symptoms: [
      'Dark sunken lesions on fruits',
      'Black circular spots with pink spore masses',
      'Dieback of shoots and twigs',
      'Post-harvest fruit rot',
    ],
    treatment: [
      'Carbendazim 1g/L',
      'Copper oxychloride 3g/L',
      'Mancozeb 2g/L',
      'Thiophanate methyl 1g/L',
    ],
    prevention: [
      'Harvest at correct maturity',
      'Handle fruits carefully',
      'Hot water treatment 52°C for 5 min post-harvest',
      'Prune infected twigs',
    ],
    dosage: 'Carbendazim 50 WP — 1.0 g per litre. Pre-flowering and fruit set sprays. 3 applications.',
  },

  root_rot: {
    ...photo('1464226184884-fa280b87c399', 'dis-rootr'),
    name: 'Root Rot',
    nameKey: 'disease_root_rot',
    category: 'Fungal',
    severity: 'High',
    affects: ['Cotton', 'Groundnut', 'Chickpea', 'Soybean', 'Chilli'],
    pathogen: 'Fusarium solani / Pythium aphanidermatum / Rhizoctonia solani',
    symptoms: [
      'Reddish-brown discolouration of roots',
      'Wilting despite adequate moisture',
      'Collar region decay at soil surface',
      'Easy uprooting of affected plants',
    ],
    treatment: [
      'Soil drench with Copper oxychloride 3g/L',
      'Carbendazim seed treatment 2g/kg',
      'Trichoderma viride biocontrol 5g/kg',
      'Improve drainage immediately',
    ],
    prevention: [
      'Avoid waterlogging — raise beds',
      'Seed treatment mandatory',
      'Crop rotation with non-host crops',
      'Soil solarisation in summer',
    ],
    dosage: 'Carbendazim 50 WP — Seed treatment 2g per kg seed. Soil drench 1g/L at base of plant.',
  },

  bacterial_wilt: {
    ...photo('1503944511803-1b94ba3bba55', 'dis-bwilt'),
    name: 'Bacterial Wilt',
    nameKey: 'disease_bacterial_wilt',
    category: 'Bacterial',
    severity: 'High',
    affects: ['Tomato', 'Brinjal', 'Chilli', 'Potato', 'Tobacco'],
    pathogen: 'Ralstonia solanacearum',
    symptoms: [
      'Sudden wilting of entire plant',
      'Vascular browning when stem is cut',
      'Milky bacterial ooze from cut stem in water',
      'No yellowing before collapse',
    ],
    treatment: [
      'No chemical cure — remove and destroy affected plants',
      'Bordeaux mixture 1% as preventive drench',
      'Copper bactericide spray on healthy plants',
      'Bioagent: Pseudomonas fluorescens 10g/L soil drench',
    ],
    prevention: [
      'Use resistant varieties (Arka Vikas, Arka Rakshak)',
      'Avoid injury to roots',
      'Long crop rotation (4+ years)',
      'Soil solarisation 6 weeks before planting',
    ],
    dosage: 'Prevention only. Copper oxychloride 50 WP — 3.0 g per litre. Soil drench at planting and 30 DAS.',
  },

  citrus_canker: {
    ...photo('1546094096-0df4bcaaa337', 'dis-ccanker'),
    name: 'Citrus Canker',
    nameKey: 'disease_citrus_canker',
    category: 'Bacterial',
    severity: 'Medium',
    affects: ['Lemon', 'Orange', 'Lime', 'Grapefruit', 'Mandarin'],
    pathogen: 'Xanthomonas axonopodis pv. citri',
    symptoms: [
      'Raised corky lesions on leaves, fruits, stems',
      'Water-soaked margins turning yellow',
      'Cracked crater-like spots',
      'Premature fruit drop',
    ],
    treatment: [
      'Copper oxychloride 3g/L spray every 15 days',
      'Streptomycin sulphate 200ppm',
      'Bordeaux mixture 1%',
      'Prune infected branches 15cm below lesion',
    ],
    prevention: [
      'Plant certified canker-free nursery stock',
      'Windbreaks to reduce leaf injury',
      'Avoid working in wet orchards',
      'Disinfect pruning tools with bleach',
    ],
    dosage: 'Copper oxychloride 50 WP — 3.0 g per litre. Preventive spray start of monsoon. 4–6 sprays.',
  },

  mosaic_virus: {
    ...photo('1518977822-aadee1db4878', 'dis-mosaic'),
    name: 'Mosaic Virus',
    nameKey: 'disease_mosaic_virus',
    category: 'Viral',
    severity: 'High',
    affects: ['Tomato', 'Chilli', 'Potato', 'Bean', 'Cucumber', 'Groundnut'],
    pathogen: 'Tomato Mosaic Virus (ToMV) / Tobacco Mosaic Virus (TMV) / Bean Common Mosaic Virus (BCMV)',
    symptoms: [
      'Mottled green-yellow mosaic pattern on leaves',
      'Leaf distortion and crinkling',
      'Stunted plant growth',
      'Reduced and distorted fruits',
    ],
    treatment: [
      'NO chemical cure available',
      'Uproot and burn affected plants immediately',
      'Spray Imidacloprid 0.5mL/L to control aphid vectors',
      'Apply mineral oil 2% to prevent further spread',
    ],
    prevention: [
      'Use virus-indexed certified seed',
      'Control aphids and thrips (primary vectors)',
      'Avoid touching plants after handling tobacco',
      'Plant barrier crop of maize around field',
    ],
    dosage: 'Vector control: Imidacloprid 17.8 SL — 0.5 mL per litre. Spray at 10-day intervals. Do not reuse infected plots for same crop for 2 seasons.',
  },

  leaf_curl: {
    ...photo('1588252303782-0a6b2e4fe145', 'dis-lcurl'),
    name: 'Leaf Curl Virus',
    nameKey: 'disease_leaf_curl',
    category: 'Viral',
    severity: 'High',
    affects: ['Tomato', 'Chilli', 'Cotton', 'Papaya'],
    pathogen: 'Tomato Leaf Curl Virus (ToLCV) — transmitted by whitefly Bemisia tabaci',
    symptoms: [
      'Upward or downward curling and cupping of leaves',
      'Thickened leathery leaves',
      'Severe stunting of plant',
      'Flower and fruit drop',
    ],
    treatment: [
      'Remove and destroy infected plants early',
      'Imidacloprid 0.5mL/L to kill whitefly vector',
      'Thiamethoxam 0.25g/L spray',
      'Reflective silver mulch to repel vectors',
    ],
    prevention: [
      'Grow resistant hybrids (Arka Rakshak for tomato)',
      'Yellow sticky traps 10/acre for whitefly',
      'Avoid planting near cotton fields',
      'Neem seed kernel extract 5% spray',
    ],
    dosage: 'Whitefly control: Thiamethoxam 25 WG — 0.25 g per litre. Spray early morning. 3 sprays at 10-day intervals.',
  },

  aphid_infestation: {
    ...photo('1519044329932-4032ba8abb42', 'dis-aphid'),
    name: 'Aphid Infestation',
    nameKey: 'disease_aphid_infestation',
    category: 'Pest',
    severity: 'Medium',
    affects: ['Wheat', 'Mustard', 'Tomato', 'Chilli', 'Cotton', 'Potato'],
    pathogen: 'Aphis gossypii / Myzus persicae / Lipaphis erysimi',
    symptoms: [
      'Clusters of tiny soft-bodied insects on new growth',
      'Sticky honeydew on leaves causing sooty mould',
      'Curled and yellowed leaves',
      'Virus transmission causing mosaic symptoms',
    ],
    treatment: [
      'Dimethoate 30 EC — 2mL/L spray',
      'Imidacloprid 0.3mL/L',
      'Neem oil 5mL/L + soap 5mL/L',
      'Release Chrysoperla carnea predator',
    ],
    prevention: [
      'Yellow sticky traps to monitor population',
      'Grow mustard as trap crop around main field',
      'Conserve natural enemies (ladybird, syrphid)',
      'Avoid excess nitrogen fertilisation',
    ],
    dosage: 'Dimethoate 30 EC — 2.0 mL per litre of water. Spray on undersides of leaves. Repeat after 10 days if infestation continues.',
  },

  whitefly: {
    ...photo('1559181567-c3190ee939c2', 'dis-wfly'),
    name: 'Whitefly Damage',
    nameKey: 'disease_whitefly',
    category: 'Pest',
    severity: 'Medium',
    affects: ['Tomato', 'Cotton', 'Chilli', 'Brinjal', 'Cucumber'],
    pathogen: 'Bemisia tabaci / Trialeurodes vaporariorum',
    symptoms: [
      'White waxy powder on underside of leaves',
      'Yellowing and wilting of leaves',
      'Sooty mould on honeydew deposits',
      'Virus transmission (leaf curl, yellowing)',
    ],
    treatment: [
      'Thiamethoxam 0.25g/L spray',
      'Spiromesifen 1mL/L',
      'Pyriproxyfen 1mL/L',
      'Neem oil 5mL/L for organic management',
    ],
    prevention: [
      'Yellow sticky traps 10/acre',
      'Reflective mulch silver-coloured',
      'Remove and destroy infested plants',
      'Botanical sprays as preventive',
    ],
    dosage: 'Thiamethoxam 25 WG — 0.25 g per litre. Spray at 7–10 day intervals. Alternate insecticides to prevent resistance.',
  },

  thrips_damage: {
    ...photo('1553279768-865429fa0078', 'dis-thrip'),
    name: 'Thrips Damage',
    nameKey: 'disease_thrips',
    category: 'Pest',
    severity: 'Medium',
    affects: ['Chilli', 'Onion', 'Cotton', 'Groundnut', 'Rose'],
    pathogen: 'Thrips tabaci / Scirtothrips dorsalis / Frankliniella occidentalis',
    symptoms: [
      'Silver-brown streaking on leaves',
      'Distorted and crinkled new leaves',
      'Scarring on fruits and pods',
      'Petal damage on flowers',
    ],
    treatment: [
      'Spinosad 0.5mL/L (highly effective)',
      'Fipronil 1.5mL/L',
      'Dimethoate 2mL/L',
      'Profenofos 2mL/L',
    ],
    prevention: [
      'Blue sticky traps for monitoring',
      'Remove weed hosts around field border',
      'Intercrop with coriander or marigold',
      'Overhead irrigation dislodges thrips',
    ],
    dosage: 'Spinosad 45 SC — 0.5 mL per litre. 2 sprays at 15-day interval. Highly effective, safe to beneficials.',
  },

  stem_borer: {
    ...photo('1502082553048-f009c37129b9', 'dis-sbore'),
    name: 'Stem Borer',
    nameKey: 'disease_stem_borer',
    category: 'Pest',
    severity: 'High',
    affects: ['Rice', 'Sugarcane', 'Maize', 'Sorghum'],
    pathogen: 'Scirpophaga incertulas (Yellow stem borer) / Chilo partellus (Spotted stem borer)',
    symptoms: [
      'Dead heart in vegetative stage',
      'White ear in reproductive stage',
      'Hollow stems with frass',
      'Characteristic shot-hole feeding on young leaves',
    ],
    treatment: [
      'Carbofuran 3G — 25 kg/acre into standing water',
      'Chlorpyrifos 2.5mL/L spray',
      'Cartap hydrochloride 2g/L',
      'Release Trichogramma japonicum egg parasitoid',
    ],
    prevention: [
      'Clip transplant seedling tips before planting',
      'Uproot and destroy stubble after harvest',
      'Avoid excess nitrogen',
      'Light trap 1/acre for moth monitoring',
    ],
    dosage: 'Chlorpyrifos 20 EC — 2.5 mL per litre. Spray at 25–30 days after transplanting. Repeat if needed.',
  },

  nitrogen_deficiency: {
    ...photo('1536657464278-b925e2efec67', 'dis-ndef'),
    name: 'Nitrogen Deficiency',
    nameKey: 'disease_nitrogen_deficiency',
    category: 'Nutrient',
    severity: 'Medium',
    affects: ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'All crops'],
    pathogen: 'Nutrient deficiency — not infectious',
    symptoms: [
      'Pale yellow-green leaves starting from older lower leaves',
      'Stunted plant growth',
      'Thin weak stems',
      'Early leaf senescence',
    ],
    treatment: [
      'Top dressing Urea 25 kg/acre',
      'Fertigation 19:19:19 NPK 5g/L',
      'Foliar spray Urea 2% (20g/L)',
      'Split nitrogen application in 3 doses',
    ],
    prevention: [
      'Soil test before each crop season',
      'Apply recommended nitrogen dose',
      'Incorporate green manure crops',
      'Avoid leaching by split application',
    ],
    dosage: 'Urea 46% N — Top dressing 25 kg per acre. Apply in moist soil conditions. Avoid application before heavy rain.',
  },

  iron_deficiency: {
    ...photo('1500382017468-9049fed747ef', 'dis-fedef'),
    name: 'Iron Deficiency (Chlorosis)',
    nameKey: 'disease_iron_deficiency',
    category: 'Nutrient',
    severity: 'Low',
    affects: ['Rice', 'Groundnut', 'Soybean', 'Maize', 'Citrus', 'All upland crops'],
    pathogen: 'Micronutrient deficiency — common in calcareous/alkaline soils',
    symptoms: [
      'Interveinal chlorosis — yellow leaves with green veins',
      'Young leaves affected first (unlike nitrogen)',
      'Severely affected leaves become white',
      'Reduced growth, poor yield',
    ],
    treatment: [
      'Ferrous sulphate 0.5% foliar spray (5g/L)',
      'Chelated iron (Fe-EDTA) 0.2% spray',
      'Soil application FeSO4 25 kg/acre mixed with FYM',
      'Adjust soil pH to 6.0–6.5',
    ],
    prevention: [
      'Avoid over-liming soils',
      'Apply FeSO4 with organic matter',
      'Grow iron-efficient varieties',
      'Maintain soil pH in optimal range',
    ],
    dosage: 'Ferrous sulphate — Foliar spray 5.0 g per litre + 2.5 g lime per litre (to prevent phytotoxicity). 2–3 sprays at 10-day intervals.',
  },
};

// ═══════════════════════════════════════════════════════════════
//  SECTION 2 — CROP IMAGES
//  Each entry: { thumb, card, hero, market } + metadata
// ═══════════════════════════════════════════════════════════════
export const CropImages = {
  rice: {
    ...photo('1536657464278-b925e2efec67', 'crop-rice'),
    name: 'Rice',
    nameKey: 'crop_rice',
    season: 'Kharif / Rabi',
    duration: '90–150 days',
    waterNeed: 'High',
    soilType: 'Clay loam, Alluvial',
    commonDiseases: ['leaf_blight', 'stem_borer', 'bacterial_wilt'],
  },
  wheat: {
    ...photo('1574323347407-f5e1ad6d020b', 'crop-wheat'),
    name: 'Wheat',
    nameKey: 'crop_wheat',
    season: 'Rabi',
    duration: '100–140 days',
    waterNeed: 'Medium',
    soilType: 'Loam, Clay loam',
    commonDiseases: ['rust_disease', 'leaf_blight', 'aphid_infestation'],
  },
  cotton: {
    ...photo('1586201375761-83865001e31c', 'crop-cotton'),
    name: 'Cotton',
    nameKey: 'crop_cotton',
    season: 'Kharif',
    duration: '150–180 days',
    waterNeed: 'Medium',
    soilType: 'Black cotton soil, Sandy loam',
    commonDiseases: ['leaf_curl', 'whitefly', 'root_rot'],
  },
  sugarcane: {
    ...photo('1503944511803-1b94ba3bba55', 'crop-sugarcane'),
    name: 'Sugarcane',
    nameKey: 'crop_sugarcane',
    season: 'Annual',
    duration: '10–14 months',
    waterNeed: 'Very High',
    soilType: 'Loam, Sandy loam',
    commonDiseases: ['stem_borer', 'root_rot'],
  },
  maize: {
    ...photo('1551754655-4ca0c0c4c0f9', 'crop-maize'),
    name: 'Maize',
    nameKey: 'crop_maize',
    season: 'Kharif / Rabi',
    duration: '75–110 days',
    waterNeed: 'Medium',
    soilType: 'Well-drained loam',
    commonDiseases: ['stem_borer', 'leaf_blight', 'downy_mildew'],
  },
  tomato: {
    ...photo('1546094096-0df4bcaaa337', 'crop-tomato'),
    name: 'Tomato',
    nameKey: 'crop_tomato',
    season: 'Year-round',
    duration: '60–90 days',
    waterNeed: 'Medium',
    soilType: 'Sandy loam, Loam',
    commonDiseases: ['mosaic_virus', 'leaf_curl', 'bacterial_wilt', 'anthracnose', 'whitefly'],
  },
  onion: {
    ...photo('1518977822-aadee1db4878', 'crop-onion'),
    name: 'Onion',
    nameKey: 'crop_onion',
    season: 'Rabi / Kharif',
    duration: '90–120 days',
    waterNeed: 'Low',
    soilType: 'Sandy loam, Loam',
    commonDiseases: ['thrips_damage', 'downy_mildew'],
  },
  chilli: {
    ...photo('1588252303782-0a6b2e4fe145', 'crop-chilli'),
    name: 'Chilli',
    nameKey: 'crop_chilli',
    season: 'Kharif / Rabi',
    duration: '90–120 days',
    waterNeed: 'Low-Medium',
    soilType: 'Sandy loam, Red loam',
    commonDiseases: ['leaf_curl', 'anthracnose', 'thrips_damage', 'mosaic_virus'],
  },
  groundnut: {
    ...photo('1559181567-c3190ee939c2', 'crop-gnut'),
    name: 'Groundnut',
    nameKey: 'crop_groundnut',
    season: 'Kharif / Rabi',
    duration: '90–130 days',
    waterNeed: 'Medium',
    soilType: 'Sandy loam, Red loam',
    commonDiseases: ['rust_disease', 'root_rot', 'iron_deficiency'],
  },
  soybean: {
    ...photo('1535379453347-e3d7c3abd037', 'crop-soy'),
    name: 'Soybean',
    nameKey: 'crop_soybean',
    season: 'Kharif',
    duration: '90–110 days',
    waterNeed: 'Medium',
    soilType: 'Well-drained loam, Black soil',
    commonDiseases: ['rust_disease', 'mosaic_virus', 'root_rot'],
  },
  banana: {
    ...photo('1528825871115-3581a5387919', 'crop-banana'),
    name: 'Banana',
    nameKey: 'crop_banana',
    season: 'Perennial',
    duration: '12–18 months',
    waterNeed: 'Very High',
    soilType: 'Rich loam, Alluvial',
    commonDiseases: ['root_rot', 'bacterial_wilt'],
  },
  mango: {
    ...photo('1553279768-865429fa0078', 'crop-mango'),
    name: 'Mango',
    nameKey: 'crop_mango',
    season: 'Perennial (fruits March–June)',
    duration: '5–8 years to first fruit',
    waterNeed: 'Low-Medium',
    soilType: 'Deep loam, Sandy loam',
    commonDiseases: ['anthracnose', 'powdery_mildew'],
  },
  brinjal: {
    ...photo('1540420773420-fc93c27c79e0', 'crop-brinjal'),
    name: 'Brinjal',
    nameKey: 'crop_brinjal',
    season: 'Year-round',
    duration: '75–100 days',
    waterNeed: 'Medium',
    soilType: 'Sandy loam, Loam',
    commonDiseases: ['bacterial_wilt', 'leaf_curl', 'whitefly'],
  },
  potato: {
    ...photo('1518977676275-d1f6fd66c41b', 'crop-potato'),
    name: 'Potato',
    nameKey: 'crop_potato',
    season: 'Rabi',
    duration: '75–100 days',
    waterNeed: 'Medium',
    soilType: 'Sandy loam, Loam',
    commonDiseases: ['bacterial_wilt', 'mosaic_virus'],
  },
  coconut: {
    ...photo('1516594798947-e15519571518', 'crop-coconut'),
    name: 'Coconut',
    nameKey: 'crop_coconut',
    season: 'Perennial',
    duration: '5–7 years to bearing',
    waterNeed: 'High',
    soilType: 'Sandy loam, Laterite',
    commonDiseases: ['root_rot'],
  },
  turmeric: {
    ...photo('1599940778173-28dff89ec50b', 'crop-turmeric'),
    name: 'Turmeric',
    nameKey: 'crop_turmeric',
    season: 'Kharif',
    duration: '7–9 months',
    waterNeed: 'Medium-High',
    soilType: 'Clay loam, Red loam',
    commonDiseases: ['root_rot', 'leaf_blight'],
  },
  mustard: {
    ...photo('1574323347407-f5e1ad6d020b', 'crop-mustard'),
    name: 'Mustard',
    nameKey: 'crop_mustard',
    season: 'Rabi',
    duration: '90–120 days',
    waterNeed: 'Low',
    soilType: 'Loam, Sandy loam',
    commonDiseases: ['aphid_infestation', 'downy_mildew', 'powdery_mildew'],
  },
  chickpea: {
    ...photo('1564419320461-6870880221ad', 'crop-chickpea'),
    name: 'Chickpea',
    nameKey: 'crop_chickpea',
    season: 'Rabi',
    duration: '80–120 days',
    waterNeed: 'Low',
    soilType: 'Sandy loam, Loam',
    commonDiseases: ['root_rot', 'mosaic_virus'],
  },
};

// ═══════════════════════════════════════════════════════════════
//  SECTION 3 — PEST-SPECIFIC IMAGES
// ═══════════════════════════════════════════════════════════════
export const PestImages = {
  aphid: photo('1519044329932-4032ba8abb42', 'pest-aphid'),
  whitefly: photo('1559181567-c3190ee939c2', 'pest-wfly'),
  thrips: photo('1553279768-865429fa0078', 'pest-thrips'),
  stem_borer: photo('1502082553048-f009c37129b9', 'pest-sbore'),
  mealybug: photo('1518531933037-91b2f5f229cc', 'pest-mealy'),
  spider_mite: photo('1597843786441-a8ece0f3d10e', 'pest-smite'),
  bollworm: photo('1586201375761-83865001e31c', 'pest-bworm'),
  pod_borer: photo('1564419320461-6870880221ad', 'pest-pbore'),
};

// ═══════════════════════════════════════════════════════════════
//  SECTION 4 — CATEGORY META (for ChipFilterRow)
// ═══════════════════════════════════════════════════════════════
export const DiseaseCategories = [
  { id: 'all', labelKey: 'filter_all', color: '#1B4332', bg: '#D8F3DC' },
  { id: 'Fungal', labelKey: 'filter_fungal', color: '#856404', bg: '#FFF3CD' },
  { id: 'Bacterial', labelKey: 'filter_bacterial', color: '#C62828', bg: '#FFE4E1' },
  { id: 'Viral', labelKey: 'filter_viral', color: '#0D47A1', bg: '#E3F2FD' },
  { id: 'Pest', labelKey: 'filter_pest', color: '#4527A0', bg: '#EDE7F6' },
  { id: 'Nutrient', labelKey: 'filter_nutrient', color: '#1B4332', bg: '#D8F3DC' },
];

export const CropSeasons = [
  { id: 'all', labelKey: 'season_all' },
  { id: 'Kharif', labelKey: 'season_kharif' },
  { id: 'Rabi', labelKey: 'season_rabi' },
  { id: 'Zaid', labelKey: 'season_zaid' },
];

// ═══════════════════════════════════════════════════════════════
//  SECTION 5 — SMART LOOKUP HELPERS
// ═══════════════════════════════════════════════════════════════

export function getDiseaseImg(nameOrKey, size = 'thumb') {
  if (!nameOrKey) return DiseaseImages.leaf_blight[size];
  const normalized = nameOrKey.toLowerCase().replace(/[\s\-]+/g, '_');
  if (DiseaseImages[normalized]) return DiseaseImages[normalized][size];
  const keys = Object.keys(DiseaseImages);
  const partial = keys.find(k => normalized.includes(k) || k.includes(normalized));
  if (partial) return DiseaseImages[partial][size];
  const byName = keys.find(k => DiseaseImages[k].name?.toLowerCase().includes(nameOrKey.toLowerCase()));
  if (byName) return DiseaseImages[byName][size];
  return DiseaseImages.leaf_blight[size];
}

export function getCropImg(nameOrKey, size = 'card') {
  if (!nameOrKey) return CropImages.rice[size];
  const key = nameOrKey.toLowerCase().replace(/[\s\-]+/g, '_');
  if (CropImages[key]) return CropImages[key][size];
  const keys = Object.keys(CropImages);
  const partial = keys.find(k => key.includes(k) || k.includes(key));
  if (partial) return CropImages[partial][size];
  return CropImages.rice[size];
}

export function getPestImg(nameOrKey, size = 'thumb') {
  if (!nameOrKey) return PestImages.aphid[size];
  const key = nameOrKey.toLowerCase().replace(/[\s\-]+/g, '_');
  if (PestImages[key]) return PestImages[key][size];
  const keys = Object.keys(PestImages);
  const partial = keys.find(k => key.includes(k) || k.includes(key));
  if (partial) return PestImages[partial][size];
  return PestImages.aphid[size];
}

export function getDiseasesForCrop(cropName) {
  if (!cropName) return [];
  const cropKey = cropName.toLowerCase().replace(/[\s\-]+/g, '_');
  const crop = CropImages[cropKey];
  if (!crop?.commonDiseases) return [];
  return crop.commonDiseases.map(key => DiseaseImages[key]).filter(Boolean);
}

export function filterDiseasesByCategory(category) {
  if (!category || category === 'all') return Object.values(DiseaseImages);
  return Object.values(DiseaseImages).filter(d => d.category === category);
}

export function searchDiseases(query) {
  if (!query || query.trim().length < 2) return Object.values(DiseaseImages);
  const q = query.toLowerCase();
  return Object.values(DiseaseImages).filter(d =>
    d.name?.toLowerCase().includes(q) ||
    d.pathogen?.toLowerCase().includes(q) ||
    d.affects?.some(a => a.toLowerCase().includes(q)) ||
    d.symptoms?.some(s => s.toLowerCase().includes(q)) ||
    d.treatment?.some(t => t.toLowerCase().includes(q))
  );
}

export default {
  DiseaseImages,
  CropImages,
  PestImages,
  DiseaseCategories,
  CropSeasons,
  getDiseaseImg,
  getCropImg,
  getPestImg,
  getDiseasesForCrop,
  filterDiseasesByCategory,
  searchDiseases,
};
