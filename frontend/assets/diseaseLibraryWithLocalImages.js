/**
 * diseaseLibraryWithLocalImages.js
 * 
 * Complete disease database with LOCAL IMAGE INTEGRATION
 * Each disease has proper image associations from the disease_library folder
 * 
 * USAGE:
 *   import { DiseaseImages, getDiseaseImg } from '../assets/diseaseLibraryWithLocalImages';
 *   const disease = DiseaseImages.leaf_blight;
 *   const img = getDiseaseImg('Leaf Blight');
 */

// ═══════════════════════════════════════════════════════════════
//  LOCAL IMAGE MAPPING
//  Maps disease names to actual local image files
// ═══════════════════════════════════════════════════════════════
export const localImages = {
  // Leaf Blight - 4 crop-specific images
  'Leaf Blight': {
    primary: require('./disease_library/leaf blight/rice leaf blight.webp'),
    images: [
      { file: require('./disease_library/leaf blight/rice leaf blight.webp'), crop: 'Rice' },
      { file: require('./disease_library/leaf blight/wheat.jpeg'), crop: 'Wheat' },
      { file: require('./disease_library/leaf blight/sorghum.jpg'), crop: 'Sorghum' },
      { file: require('./disease_library/leaf blight/maize.webp'), crop: 'Maize' },
    ],
  },

  // Powdery Mildew - 5+ crop-specific images
  'Powdery Mildew': {
    primary: require('./disease_library/powdery mildew/grapes.jpg'),
    images: [
      { file: require('./disease_library/powdery mildew/grapes.jpg'), crop: 'Grapes' },
      { file: require('./disease_library/powdery mildew/cucumber.jpg'), crop: 'Cucumber' },
      { file: require('./disease_library/powdery mildew/chilli.webp'), crop: 'Chilli' },
      { file: require('./disease_library/powdery mildew/mustard.jpg'), crop: 'Mustard' },
      { file: require('./disease_library/powdery mildew/pea.jpg'), crop: 'Pea' },
    ],
  },

  // Rust Disease - 5+ crop-specific images
  'Rust Disease': {
    primary: require('./disease_library/rust disease/coffee.avif'),
    images: [
      { file: require('./disease_library/rust disease/coffee.avif'), crop: 'Coffee' },
      { file: require('./disease_library/rust disease/wheat.jpeg'), crop: 'Wheat' },
      { file: require('./disease_library/rust disease/bean.jpg'), crop: 'Bean' },
      { file: require('./disease_library/rust disease/groundnut.jpg'), crop: 'Groundnut' },
      { file: require('./disease_library/rust disease/soybean.jpg'), crop: 'Soybean' },
    ],
  },

  // Downy Mildew - 5 crop-specific images
  'Downy Mildew': {
    primary: require('./disease_library/downy mildew/grapes.png'),
    images: [
      { file: require('./disease_library/downy mildew/grapes.png'), crop: 'Grapes' },
      { file: require('./disease_library/downy mildew/cucumber.webp'), crop: 'Cucumber' },
      { file: require('./disease_library/downy mildew/maize.jpeg'), crop: 'Maize' },
      { file: require('./disease_library/downy mildew/onion.jpg'), crop: 'Onion' },
      { file: require('./disease_library/downy mildew/spinach.jpg'), crop: 'Spinach' },
    ],
  },

  // Anthracnose - 5 crop-specific images
  'Anthracnose': {
    primary: require('./disease_library/anthracnose/bean.jpg'),
    images: [
      { file: require('./disease_library/anthracnose/bean.jpg'), crop: 'Bean' },
      { file: require('./disease_library/anthracnose/chilli.webp'), crop: 'Chilli' },
      { file: require('./disease_library/anthracnose/cucumber.jpg'), crop: 'Cucumber' },
      { file: require('./disease_library/anthracnose/mango.png'), crop: 'Mango' },
      { file: require('./disease_library/anthracnose/papaya.webp'), crop: 'Papaya' },
    ],
  },

  // Root Rot - 5 crop-specific images
  'Root Rot': {
    primary: require('./disease_library/root rot/groundnut.jpg'),
    images: [
      { file: require('./disease_library/root rot/groundnut.jpg'), crop: 'Groundnut' },
      { file: require('./disease_library/root rot/chilli.jpeg'), crop: 'Chilli' },
      { file: require('./disease_library/root rot/chickpea.png'), crop: 'Chickpea' },
      { file: require('./disease_library/root rot/cotton.jpg'), crop: 'Cotton' },
      { file: require('./disease_library/root rot/soybean.jpg'), crop: 'Soybean' },
    ],
  },

  // Bacterial Wilt - 5 crop-specific images
  'Bacterial Wilt': {
    primary: require('./disease_library/bacterial wilt/tomato.webp'),
    images: [
      { file: require('./disease_library/bacterial wilt/tomato.webp'), crop: 'Tomato' },
      { file: require('./disease_library/bacterial wilt/potato.jpg'), crop: 'Potato' },
      { file: require('./disease_library/bacterial wilt/chilli.jpg'), crop: 'Chilli' },
      { file: require('./disease_library/bacterial wilt/brinjal.webp'), crop: 'Brinjal' },
      { file: require('./disease_library/bacterial wilt/tobacco.jpg'), crop: 'Tobacco' },
    ],
  },

  // Citrus Canker - 4 crop-specific images
  'Citrus Canker': {
    primary: require('./disease_library/citrus canker/orange.webp'),
    images: [
      { file: require('./disease_library/citrus canker/orange.webp'), crop: 'Orange' },
      { file: require('./disease_library/citrus canker/lemon.jpg'), crop: 'Lemon' },
      { file: require('./disease_library/citrus canker/lime.jpg'), crop: 'Lime' },
      { file: require('./disease_library/citrus canker/mandarin.jpg'), crop: 'Mandarin' },
    ],
  },

  // Mosaic Virus - 6 crop-specific images
  'Mosaic Virus': {
    primary: require('./disease_library/mosaic virus/bean.jpg'),
    images: [
      { file: require('./disease_library/mosaic virus/bean.jpg'), crop: 'Bean' },
      { file: require('./disease_library/mosaic virus/chilli.webp'), crop: 'Chilli' },
      { file: require('./disease_library/mosaic virus/cucumber.jpg'), crop: 'Cucumber' },
      { file: require('./disease_library/mosaic virus/groundnut.webp'), crop: 'Groundnut' },
      { file: require('./disease_library/mosaic virus/potato.jpg'), crop: 'Potato' },
      { file: require('./disease_library/mosaic virus/tomato.jpg'), crop: 'Tomato' },
    ],
  },

  // Leaf Curl - 4 crop-specific images
  'Leaf Curl': {
    primary: require('./disease_library/leaf curl/tomato.webp'),
    images: [
      { file: require('./disease_library/leaf curl/tomato.webp'), crop: 'Tomato' },
      { file: require('./disease_library/leaf curl/chilli.jpg'), crop: 'Chilli' },
      { file: require('./disease_library/leaf curl/cotton.jpg'), crop: 'Cotton' },
      { file: require('./disease_library/leaf curl/papaya.jpg'), crop: 'Papaya' },
    ],
  },

  // Aphid Infestation - 5+ crop-specific images
  'Aphid Infestation': {
    primary: require('./disease_library/aphid infestation/tomato.jpg'),
    images: [
      { file: require('./disease_library/aphid infestation/tomato.jpg'), crop: 'Tomato' },
      { file: require('./disease_library/aphid infestation/chilli.jpg'), crop: 'Chilli' },
      { file: require('./disease_library/aphid infestation/cotton.webp'), crop: 'Cotton' },
      { file: require('./disease_library/aphid infestation/mustard.jpg'), crop: 'Mustard' },
      { file: require('./disease_library/aphid infestation/potato.webp'), crop: 'Potato' },
    ],
  },

  // Whitefly Damage - 5 crop-specific images
  'Whitefly Damage': {
    primary: require('./disease_library/whitefly damage/chilli.jpg'),
    images: [
      { file: require('./disease_library/whitefly damage/chilli.jpg'), crop: 'Chilli' },
      { file: require('./disease_library/whitefly damage/cucumber.jpg'), crop: 'Cucumber' },
      { file: require('./disease_library/whitefly damage/tomato.jpeg'), crop: 'Tomato' },
      { file: require('./disease_library/whitefly damage/cotton.jpg'), crop: 'Cotton' },
      { file: require('./disease_library/whitefly damage/brinjal.webp'), crop: 'Brinjal' },
    ],
  },

  // Thrips Damage - 5 crop-specific images
  'Thrips Damage': {
    primary: require('./disease_library/thrips damage/chilli.jpg'),
    images: [
      { file: require('./disease_library/thrips damage/chilli.jpg'), crop: 'Chilli' },
      { file: require('./disease_library/thrips damage/cotton.jpg'), crop: 'Cotton' },
      { file: require('./disease_library/thrips damage/rose.jpg'), crop: 'Rose' },
      { file: require('./disease_library/thrips damage/groundnut.webp'), crop: 'Groundnut' },
      { file: require('./disease_library/thrips damage/thrips.webp'), crop: 'Thrips' },
    ],
  },

  // Stem Borer - 4 crop-specific images
  'Stem Borer': {
    primary: require('./disease_library/stem borer/maize.jpg'),
    images: [
      { file: require('./disease_library/stem borer/maize.jpg'), crop: 'Maize' },
      { file: require('./disease_library/stem borer/rice.jpg'), crop: 'Rice' },
      { file: require('./disease_library/stem borer/sorghum.jpg'), crop: 'Sorghum' },
      { file: require('./disease_library/stem borer/sugercane.png'), crop: 'Sugarcane' },
    ],
  },

  // Nitrogen Deficiency - 3 crop-specific images
  'Nitrogen Deficiency': {
    primary: require('./disease_library/nitrogen deficiency/rice.webp'),
    images: [
      { file: require('./disease_library/nitrogen deficiency/rice.webp'), crop: 'Rice' },
      { file: require('./disease_library/nitrogen deficiency/wheat.webp'), crop: 'Wheat' },
      { file: require('./disease_library/nitrogen deficiency/sugercane.jpg'), crop: 'Sugarcane' },
    ],
  },

  // Iron Deficiency (Chlorosis) - 5 crop-specific images
  'Iron Deficiency (Chlorosis)': {
    primary: require('./disease_library/iron deficiency(chlorosis)/citrus.jpg'),
    images: [
      { file: require('./disease_library/iron deficiency(chlorosis)/citrus.jpg'), crop: 'Citrus' },
      { file: require('./disease_library/iron deficiency(chlorosis)/rice.jpg'), crop: 'Rice' },
      { file: require('./disease_library/iron deficiency(chlorosis)/maize.jpeg'), crop: 'Maize' },
      { file: require('./disease_library/iron deficiency(chlorosis)/groundnut.jpg'), crop: 'Groundnut' },
      { file: require('./disease_library/iron deficiency(chlorosis)/soybean.png'), crop: 'Soybean' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
//  DISEASE DATA — Complete information for all diseases
// ═══════════════════════════════════════════════════════════════
export const DiseaseImages = {
  leaf_blight: {
    thumb: localImages['Leaf Blight'].primary,
    card: localImages['Leaf Blight'].primary,
    hero: localImages['Leaf Blight'].primary,
    market: localImages['Leaf Blight'].primary,
    allImages: localImages['Leaf Blight'].images,
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
    thumb: localImages['Powdery Mildew'].primary,
    card: localImages['Powdery Mildew'].primary,
    hero: localImages['Powdery Mildew'].primary,
    market: localImages['Powdery Mildew'].primary,
    allImages: localImages['Powdery Mildew'].images,
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
    thumb: localImages['Rust Disease'].primary,
    card: localImages['Rust Disease'].primary,
    hero: localImages['Rust Disease'].primary,
    market: localImages['Rust Disease'].primary,
    allImages: localImages['Rust Disease'].images,
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
    thumb: localImages['Downy Mildew'].primary,
    card: localImages['Downy Mildew'].primary,
    hero: localImages['Downy Mildew'].primary,
    market: localImages['Downy Mildew'].primary,
    allImages: localImages['Downy Mildew'].images,
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
    thumb: localImages['Anthracnose'].primary,
    card: localImages['Anthracnose'].primary,
    hero: localImages['Anthracnose'].primary,
    market: localImages['Anthracnose'].primary,
    allImages: localImages['Anthracnose'].images,
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
    thumb: localImages['Root Rot'].primary,
    card: localImages['Root Rot'].primary,
    hero: localImages['Root Rot'].primary,
    market: localImages['Root Rot'].primary,
    allImages: localImages['Root Rot'].images,
    name: 'Root Rot',
    nameKey: 'disease_root_rot',
    category: 'Fungal',
    severity: 'High',
    affects: ['Cotton', 'Groundnut', 'Chickpea', 'Soybean', 'Chilli'],
    pathogen: 'Fusarium solani / Pythium aphanidermatum / Rhizoctonia solani',
    symptoms: [
      'Wilting despite adequate water',
      'Brown discoloration of roots and collar',
      'Stunted growth',
      'Sudden plant collapse',
    ],
    treatment: [
      'Trichoderma harzianum 2g/L',
      'Pseudomonas fluorescens 2g/L',
      'Copper oxychloride 3g/L',
      'Carbendazim 0.5g/L soil drench',
    ],
    prevention: [
      'Well-drained soil',
      'Crop rotation every 2-3 years',
      'Seed treatment with fungicides',
      'Avoid waterlogging',
    ],
    dosage: 'Trichoderma 2.5% WP — 2.0 g per litre. Soil drench at 100 mL per plant before symptoms.',
  },

  bacterial_wilt: {
    thumb: localImages['Bacterial Wilt'].primary,
    card: localImages['Bacterial Wilt'].primary,
    hero: localImages['Bacterial Wilt'].primary,
    market: localImages['Bacterial Wilt'].primary,
    allImages: localImages['Bacterial Wilt'].images,
    name: 'Bacterial Wilt',
    nameKey: 'disease_bacterial_wilt',
    category: 'Bacterial',
    severity: 'High',
    affects: ['Tomato', 'Potato', 'Chilli', 'Brinjal', 'Tobacco'],
    pathogen: 'Ralstonia solanacearum',
    symptoms: [
      'Sudden wilting of leaves despite soil moisture',
      'Yellowing and drying of leaves',
      'Brown discoloration in xylem vessels',
      'Mushy stems when pressed',
    ],
    treatment: [
      'No chemical cure — prevention is key',
      'Remove and destroy infected plants',
      'Do not replant solanaceous crops for 2-3 years',
      'Apply biocontrol agents (Bacillus subtilis)',
    ],
    prevention: [
      'Use resistant varieties',
      'Use certified disease-free seeds',
      'Control insect vectors (flea beetles)',
      'Avoid working in wet fields',
    ],
    dosage: 'Prevention only. Resistant varieties + insect vector control is critical.',
  },

  citrus_canker: {
    thumb: localImages['Citrus Canker'].primary,
    card: localImages['Citrus Canker'].primary,
    hero: localImages['Citrus Canker'].primary,
    market: localImages['Citrus Canker'].primary,
    allImages: localImages['Citrus Canker'].images,
    name: 'Citrus Canker',
    nameKey: 'disease_citrus_canker',
    category: 'Bacterial',
    severity: 'Medium',
    affects: ['Orange', 'Lemon', 'Lime', 'Mandarin', 'Grapefruits'],
    pathogen: 'Xanthomonas axonopodis',
    symptoms: [
      'Yellow halos around brown pustules on leaves',
      'Corky lesions on fruit',
      'Lesions on young twigs',
      'Leaf drop in severe infections',
    ],
    treatment: [
      'Bordeaux mixture 1% spray',
      'Copper hydroxide 3g/L',
      'Streptomycin 100 ppm (if available)',
      'Remove infected plant parts',
    ],
    prevention: [
      'Use canker-free nursery stock',
      'Quarantine infected areas',
      'Remove wild hosts near orchard',
      'Avoid moving infected plant material',
    ],
    dosage: 'Bordeaux 1% — Spray at onset and repeat at 15-day intervals.',
  },

  mosaic_virus: {
    thumb: localImages['Mosaic Virus'].primary,
    card: localImages['Mosaic Virus'].primary,
    hero: localImages['Mosaic Virus'].primary,
    market: localImages['Mosaic Virus'].primary,
    allImages: localImages['Mosaic Virus'].images,
    name: 'Mosaic Virus',
    nameKey: 'disease_mosaic_virus',
    category: 'Viral',
    severity: 'Medium',
    affects: ['Potato', 'Cucumber', 'Groundnut', 'Bean', 'Chilli', 'Tomato'],
    pathogen: 'Plant Virus (PVX, PVY, CMV, AMV)',
    symptoms: [
      'Yellow or light green mosaic pattern on leaves',
      'Leaf distortion and curling',
      'Mottling of leaf surface',
      'Stunted growth',
    ],
    treatment: [
      'No chemical treatment available',
      'Spray insecticides to control aphids',
      'Remove and destroy infected plants',
      'Sanitize tools and hands',
    ],
    prevention: [
      'Plant certified virus-free seed',
      'Control insect vectors (aphids, whiteflies)',
      'Mulching to reduce insect populations',
      'Avoid smoking in field',
    ],
    dosage: 'Neem oil 5mL/L to control aphid vectors. Spray at 15-day intervals.',
  },

  leaf_curl_virus: {
    thumb: localImages['Leaf Curl'].primary,
    card: localImages['Leaf Curl'].primary,
    hero: localImages['Leaf Curl'].primary,
    market: localImages['Leaf Curl'].primary,
    allImages: localImages['Leaf Curl'].images,
    name: 'Leaf Curl',
    nameKey: 'disease_leaf_curl',
    category: 'Viral',
    severity: 'High',
    affects: ['Tomato', 'Chilli', 'Cotton', 'Papaya'],
    pathogen: 'Whitefly-transmitted Begomovirus',
    symptoms: [
      'Leaf curling and distortion',
      'Purple veins on leaf underside',
      'Stunted plant growth',
      'No fruit set on affected plants',
    ],
    treatment: [
      'No cure — focus on vector control',
      'Spray insecticides for whitefly control',
      'Remove severely infected plants',
      'Apply yellow sticky traps',
    ],
    prevention: [
      'Grow resistant varieties',
      'Control whitefly population',
      'Use crop covers during seedling stage',
      'Remove weeds that harbor virus',
    ],
    dosage: 'Neem oil 5mL/L or Imidacloprid 0.5mL/L for whitefly. Spray at 10-day intervals.',
  },

  aphid_infestation: {
    thumb: localImages['Aphid Infestation'].primary,
    card: localImages['Aphid Infestation'].primary,
    hero: localImages['Aphid Infestation'].primary,
    market: localImages['Aphid Infestation'].primary,
    allImages: localImages['Aphid Infestation'].images,
    name: 'Aphid Infestation',
    nameKey: 'disease_aphid_infestation',
    category: 'Pest',
    severity: 'Medium',
    affects: ['Tomato', 'Chilli', 'Cotton', 'Mustard', 'Potato'],
    pathogen: 'Aphis gossypii / Lipaphis pseudobrassicae (insect pest)',
    symptoms: [
      'Sticky residue (honeydew) on leaves',
      'Yellowing and wilting of leaves',
      'Sooty mold on leaves',
      'Stunted growth and flower drop',
    ],
    treatment: [
      'Neem oil 5mL/L spray',
      'Imidacloprid 0.5mL/L',
      'Spray insecticidal soap',
      'Hand removal for light infestations',
    ],
    prevention: [
      'Reflective mulches to deter aphids',
      'Grow resistant crop varieties',
      'Encourage natural enemies',
      'Remove weeds that harbor aphids',
    ],
    dosage: 'Neem oil 5mL/L — Spray when aphids first appear. Repeat at 10-day intervals.',
  },

  whitefly_damage: {
    thumb: localImages['Whitefly Damage'].primary,
    card: localImages['Whitefly Damage'].primary,
    hero: localImages['Whitefly Damage'].primary,
    market: localImages['Whitefly Damage'].primary,
    allImages: localImages['Whitefly Damage'].images,
    name: 'Whitefly Damage',
    nameKey: 'disease_whitefly_damage',
    category: 'Pest',
    severity: 'Medium',
    affects: ['Chilli', 'Cucumber', 'Tomato', 'Cotton', 'Brinjal'],
    pathogen: 'Bemisia tabaci (insect pest)',
    symptoms: [
      'Yellowing of lower leaves',
      'White insects on leaf underside',
      'Sticky honeydew coating leaves',
      'Sooty mold growth',
    ],
    treatment: [
      'Neem oil 5mL/L spray',
      'Imidacloprid 0.5mL/L',
      'Yellow sticky traps',
      'Spray spinosad if available',
    ],
    prevention: [
      'Yellow sticky traps in field',
      'Mulching with silver/aluminum film',
      'Encourage parasitoids and predators',
      'Remove alternate hosts (weeds)',
    ],
    dosage: 'Neem oil 5mL/L — Spray starting at low population. Repeat every 10 days.',
  },

  thrips_damage: {
    thumb: localImages['Thrips Damage'].primary,
    card: localImages['Thrips Damage'].primary,
    hero: localImages['Thrips Damage'].primary,
    market: localImages['Thrips Damage'].primary,
    allImages: localImages['Thrips Damage'].images,
    name: 'Thrips Damage',
    nameKey: 'disease_thrips_damage',
    category: 'Pest',
    severity: 'Low',
    affects: ['Chilli', 'Cotton', 'Groundnut', 'Rose'],
    pathogen: 'Scirtothrips dorsalis / Thrips tabaci (insect pest)',
    symptoms: [
      'Silvery streaks on leaves',
      'Bronzing of leaves and flowers',
      'Stippled leaf surface',
      'Flower distortion in severe cases',
    ],
    treatment: [
      'Neem oil 5mL/L spray',
      'Imidacloprid 0.5mL/L',
      'Spinosad spray if available',
      'Blue sticky traps',
    ],
    prevention: [
      'Blue sticky traps in field',
      'Encourage natural enemies',
      'Remove host weeds',
      'Monitor regularly',
    ],
    dosage: 'Imidacloprid 70% WS — 0.5 mL per litre. Spray when thrips first detected.',
  },

  stem_borer: {
    thumb: localImages['Stem Borer'].primary,
    card: localImages['Stem Borer'].primary,
    hero: localImages['Stem Borer'].primary,
    market: localImages['Stem Borer'].primary,
    allImages: localImages['Stem Borer'].images,
    name: 'Stem Borer',
    nameKey: 'disease_stem_borer',
    category: 'Pest',
    severity: 'High',
    affects: ['Maize', 'Rice', 'Sorghum', 'Sugarcane'],
    pathogen: 'Chilo partellus (insect pest)',
    symptoms: [
      'Entrance hole in stem with dark frass',
      'Dead heart symptom in early growth',
      'White ear syndrome in corn',
      'Lodging in advanced stages',
    ],
    treatment: [
      'Remove and destroy infested plant parts',
      'Spray quinalphos 1.5mL/L',
      'Install light traps to attract moths',
      'Hand-pick egg masses',
    ],
    prevention: [
      'Crop rotation (avoid Poaceae)',
      'Field sanitation (remove crop residue)',
      'Deep plowing after harvest',
      'Release Trichogramma parasitoids',
    ],
    dosage: 'Quinalphos 1.5% — 1.5 mL per litre. Spray at 20 and 35 days after planting.',
  },

  nitrogen_deficiency: {
    thumb: localImages['Nitrogen Deficiency'].primary,
    card: localImages['Nitrogen Deficiency'].primary,
    hero: localImages['Nitrogen Deficiency'].primary,
    market: localImages['Nitrogen Deficiency'].primary,
    allImages: localImages['Nitrogen Deficiency'].images,
    name: 'Nitrogen Deficiency',
    nameKey: 'disease_nitrogen_deficiency',
    category: 'Nutrient',
    severity: 'Medium',
    affects: ['Rice', 'Wheat', 'Sugarcane', 'Maize', 'Vegetables'],
    pathogen: 'Nutritional disorder',
    symptoms: [
      'Yellowing starting from older leaves',
      'Pale green / light yellow color',
      'Stunted growth and reduced tillering',
      'Poor grain development',
    ],
    treatment: [
      'Apply nitrogenous fertilizer immediately',
      'Urea 2-3% solution foliar spray',
      'Neem coated urea for slow release',
      'Repeat spray at 15-day intervals',
    ],
    prevention: [
      'Soil testing before planting',
      'Apply recommended N dose',
      'Time application to growth stage',
      'Use organic matter for soil health',
    ],
    dosage: 'Urea 2-3% foliar spray (20-25g urea per litre water). Spray twice at 15-day interval.',
  },

  iron_deficiency: {
    thumb: localImages['Iron Deficiency (Chlorosis)'].primary,
    card: localImages['Iron Deficiency (Chlorosis)'].primary,
    hero: localImages['Iron Deficiency (Chlorosis)'].primary,
    market: localImages['Iron Deficiency (Chlorosis)'].primary,
    allImages: localImages['Iron Deficiency (Chlorosis)'].images,
    name: 'Iron Deficiency (Chlorosis)',
    nameKey: 'disease_iron_deficiency_chlorosis',
    category: 'Nutrient',
    severity: 'Medium',
    affects: ['Citrus', 'Rice', 'Maize', 'Groundnut', 'Soybean'],
    pathogen: 'Nutritional disorder (Fe unavailable)',
    symptoms: [
      'Yellowing of younger leaves while veins remain green',
      'Interveinal chlorosis develops',
      'Leaf distortion in severe cases',
      'Reduced growth and yield',
    ],
    treatment: [
      'Foliar spray with FeSO₄ 0.5%',
      'Iron chelate spray (DTPA iron)',
      'Soil application of iron sulfate',
      'Lower soil pH if alkaline',
    ],
    prevention: [
      'Maintain soil pH 6.0-7.0',
      'Avoid waterlogging',
      'Apply organic matter (compost)',
      'Use Fe-fortified seeds if available',
    ],
    dosage: 'FeSO₄ 0.5% (5g per litre) + Citric acid. Spray on young leaves. Repeat every 7-10 days.',
  },
};

// ═══════════════════════════════════════════════════════════════
//  EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get disease by name with optional size type
 * @param {string} name - Disease name (e.g., 'Leaf Blight')
 * @param {string} sizeType - Image size ('thumb', 'card', 'hero', 'market')
 * @returns {object|array} Disease data or image sources based on parameters
 */
export const getDiseaseImg = (name, sizeType = null) => {
  // Find disease by name
  const foundDisease = Object.values(DiseaseImages).find((d) => d.name === name);
  const disease = foundDisease || DiseaseImages.leaf_blight;

  // Validate disease exists
  if (!disease) {
    console.warn(`Disease not found: ${name}, using Leaf Blight as fallback`);
    disease = DiseaseImages.leaf_blight;
  }

  // If sizeType is specified, return just that image source (require result)
  if (sizeType) {
    const imageSource = disease[sizeType] || disease.thumb;
    if (!imageSource) {
      console.warn(`Image not found for disease: ${name}, sizeType: ${sizeType}`);
      return disease.thumb;
    }
    return imageSource;
  }

  // Otherwise return the full disease object
  return disease;
};

/**
 * Get all diseases with local images
 * @returns {array} Array of all disease objects
 */
export const getAllDiseases = () => {
  return Object.values(DiseaseImages);
};

/**
 * Search diseases by category
 * @param {string} category - Category ('Fungal', 'Bacterial', 'Viral', 'Pest', 'Nutrient')
 * @returns {array} Array of diseases in category
 */
export const getDiseasesByCategory = (category) => {
  return Object.values(DiseaseImages).filter((d) => d.category === category);
};

/**
 * Filter diseases by category (alias for getDiseasesByCategory)
 * @param {string} category - Category or 'all'
 * @returns {array} Array of diseases in category
 */
export function filterDiseasesByCategory(category) {
  if (!category || category === 'all') return Object.values(DiseaseImages);
  return Object.values(DiseaseImages).filter(d => d.category === category);
}

/**
 * Search diseases by query
 * @param {string} query - Search query
 * @returns {array} Array of matching diseases
 */
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
  getDiseaseImg,
  getAllDiseases,
  getDiseasesByCategory,
  filterDiseasesByCategory,
  searchDiseases,
  localImages,
};
