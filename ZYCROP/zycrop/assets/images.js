/**
 * images.js — ZYCROP Complete Image Asset Registry
 * 
 * Place this file at: zycrop/assets/images.js
 * 
 * USAGE:
 *   import { AppImages, useAppImage } from '../assets/images';
 *   
 *   // Option A — direct URL object (pass as source prop)
 *   <Image source={AppImages.hero.dashboard} />
 *   
 *   // Option B — hook with auto-fallback (recommended)
 *   const { source, onError } = useAppImage('dashboard_hero');
 *   <Image source={source} onError={onError} />
 * 
 * ALL images are:
 *   - Free to use (Unsplash license / Picsum)
 *   - No API key required
 *   - Served over HTTPS
 *   - Picsum fallback for every image if Unsplash is unreachable
 * 
 * CATEGORIES:
 *   hero          — full-width screen hero banners (800×400)
 *   card          — feature card thumbnails (400×220)
 *   disease       — disease reference images (300×300)
 *   crop          — specific crop images (300×300)
 *   soil          — soil type reference images (300×300)
 *   pest          — pest reference images (300×300)
 *   market        — commodity/market images (400×220)
 *   onboarding    — onboarding / login screens (800×600)
 *   icon          — small icon-sized images (80×80)
 */

import { useState } from 'react';

// ─── Base URLs ────────────────────────────────────────────────
const UNS  = 'https://images.unsplash.com/photo-';
const PSUM = 'https://picsum.photos/seed';

// ─── Image Registry ───────────────────────────────────────────
export const AppImages = {

  // ════════════════════════════════════════════
  // HERO BANNERS  (use as ImageBackground, height 220–260)
  // ════════════════════════════════════════════
  hero: {
    // Dashboard — lush green paddy field at golden hour
    dashboard: {
      uri:      `${UNS}1500382017468-9049fed747ef?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-dash/800/400`,
    },
    // AI Scan — extreme close-up of a diseased leaf
    scan: {
      uri:      `${UNS}1416879595882-3373a0480b5b?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-scan/800/400`,
    },
    // Soil Lab — dark rich loam soil texture
    soil: {
      uri:      `${UNS}1464226184884-fa280b87c399?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-soil/800/400`,
    },
    // Market — colourful vegetable market
    market: {
      uri:      `${UNS}1488459716781-31db52582fe9?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-mkt/800/400`,
    },
    // Government Schemes — rural community meeting
    schemes: {
      uri:      `${UNS}1593113598332-cd288d649433?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-sch/800/400`,
    },
    // Loan Advisor — hands exchanging money / finance
    loans: {
      uri:      `${UNS}1554224155-6726b3ff858f?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-loan/800/400`,
    },
    // Crop Calendar — seasonal planting overview, aerial field
    calendar: {
      uri:      `${UNS}1502082553048-f009c37129b9?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-cal/800/400`,
    },
    // Disease Library — botanical leaf encyclopedia
    library: {
      uri:      `${UNS}1530836369250-ef72a3f5cda8?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-lib/800/400`,
    },
    // Farm Passport — aerial drone shot of a farm
    passport: {
      uri:      `${UNS}1499529112087-3cb3b73cec95?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-pass/800/400`,
    },
    // Login / Onboarding — farmer looking at sunrise horizon
    login: {
      uri:      `${UNS}1625246333195-12dde9b27ee1?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-login/800/600`,
    },
    // Voice Bot — abstract sound wave / microphone
    voice: {
      uri:      `${UNS}1478737270239-2f02b77fc618?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-voice/800/400`,
    },
    // Pathologist — microscope / disease analysis
    pathologist: {
      uri:      `${UNS}1576091160550-112173c7e324?w=800&q=80`,
      fallback: `${PSUM}/zc-hero-path/800/400`,
    },
  },

  // ════════════════════════════════════════════
  // FEATURE CARD THUMBNAILS  (height 110, full width of card)
  // ════════════════════════════════════════════
  card: {
    scan:     { uri: `${UNS}1416879595882-3373a0480b5b?w=400&q=75`, fallback: `${PSUM}/zc-card-scan/400/220` },
    soil:     { uri: `${UNS}1464226184884-fa280b87c399?w=400&q=75`, fallback: `${PSUM}/zc-card-soil/400/220` },
    market:   { uri: `${UNS}1488459716781-31db52582fe9?w=400&q=75`, fallback: `${PSUM}/zc-card-mkt/400/220` },
    library:  { uri: `${UNS}1530836369250-ef72a3f5cda8?w=400&q=75`, fallback: `${PSUM}/zc-card-lib/400/220` },
    schemes:  { uri: `${UNS}1593113598332-cd288d649433?w=400&q=75`, fallback: `${PSUM}/zc-card-sch/400/220` },
    loans:    { uri: `${UNS}1554224155-6726b3ff858f?w=400&q=75`,    fallback: `${PSUM}/zc-card-loan/400/220` },
    calendar: { uri: `${UNS}1502082553048-f009c37129b9?w=400&q=75`, fallback: `${PSUM}/zc-card-cal/400/220` },
    passport: { uri: `${UNS}1499529112087-3cb3b73cec95?w=400&q=75`, fallback: `${PSUM}/zc-card-pass/400/220` },
    fertilizer:{ uri:`${UNS}1416879595882-3373a0480b5b?w=400&q=75`, fallback: `${PSUM}/zc-card-fert/400/220` },
    weather:  { uri: `${UNS}1504608524841-42584120d336?w=400&q=75`, fallback: `${PSUM}/zc-card-wthr/400/220` },
    pathologist: { uri: `${UNS}1576091160550-112173c7e324?w=400&q=75`, fallback: `${PSUM}/zc-card-path/400/220` },
  },

  // ════════════════════════════════════════════
  // DISEASE REFERENCE  (square 300×300, shown in Library cards)
  // ════════════════════════════════════════════
  disease: {
    // Leaf blight — brown patch on green leaf
    leaf_blight: {
      uri:      `${UNS}1518531933037-91b2f5f229cc?w=300&q=80`,
      fallback: `${PSUM}/zc-dis-blight/300/300`,
    },
    // Powdery mildew — white powdery coating on leaves
    powdery_mildew: {
      uri:      `${UNS}1597843786441-a8ece0f3d10e?w=300&q=80`,
      fallback: `${PSUM}/zc-dis-mildew/300/300`,
    },
    // Root rot — decaying plant roots
    root_rot: {
      uri:      `${UNS}1464226184884-fa280b87c399?w=300&q=80`,
      fallback: `${PSUM}/zc-dis-rootrot/300/300`,
    },
    // Rust fungus — orange rust spots on wheat
    rust: {
      uri:      `${UNS}1530836369250-ef72a3f5cda8?w=300&q=80`,
      fallback: `${PSUM}/zc-dis-rust/300/300`,
    },
    // Mosaic virus — mottled discoloured leaves
    mosaic_virus: {
      uri:      `${UNS}1416879595882-3373a0480b5b?w=300&q=80`,
      fallback: `${PSUM}/zc-dis-mosaic/300/300`,
    },
    // Aphid infestation — tiny green insects on stems
    aphids: {
      uri:      `${UNS}1518531933037-91b2f5f229cc?w=300&q=80`,
      fallback: `${PSUM}/zc-dis-aphids/300/300`,
    },
    // Bacterial wilt — wilted yellowing plant
    bacterial_wilt: {
      uri:      `${UNS}1503944511803-1b94ba3bba55?w=300&q=80`,
      fallback: `${PSUM}/zc-dis-bwilt/300/300`,
    },
    // Anthracnose — dark sunken lesions on fruits
    anthracnose: {
      uri:      `${UNS}1488459716781-31db52582fe9?w=300&q=80`,
      fallback: `${PSUM}/zc-dis-anthr/300/300`,
    },
    // Downy mildew — yellow patches, grey underside
    downy_mildew: {
      uri:      `${UNS}1497436072909-60f360fe1ce9?w=300&q=80`,
      fallback: `${PSUM}/zc-dis-downy/300/300`,
    },
    // Stem borer — larva damage on rice stem
    stem_borer: {
      uri:      `${UNS}1502082553048-f009c37129b9?w=300&q=80`,
      fallback: `${PSUM}/zc-dis-sborer/300/300`,
    },
    // Generic fallback for unknown disease
    unknown: {
      uri:      `${UNS}1530836369250-ef72a3f5cda8?w=300&q=80`,
      fallback: `${PSUM}/zc-dis-unknown/300/300`,
    },
  },

  // ════════════════════════════════════════════
  // CROPS  (shown in Calendar, Library, Market cards)
  // ════════════════════════════════════════════
  crop: {
    rice: {
      uri:      `${UNS}1536657464278-b925e2efec67?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-rice/300/300`,
    },
    wheat: {
      uri:      `${UNS}1574323347407-f5e1ad6d020b?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-wheat/300/300`,
    },
    cotton: {
      uri:      `${UNS}1586201375761-83865001e31c?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-cotton/300/300`,
    },
    sugarcane: {
      uri:      `${UNS}1503944511803-1b94ba3bba55?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-cane/300/300`,
    },
    maize: {
      uri:      `${UNS}1551754655-4ca0c0c4c0f9?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-maize/300/300`,
    },
    tomato: {
      uri:      `${UNS}1546094096-0df4bcaaa337?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-tomato/300/300`,
    },
    onion: {
      uri:      `${UNS}1518977822-aadee1db4878?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-onion/300/300`,
    },
    chilli: {
      uri:      `${UNS}1588252303782-0a6b2e4fe145?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-chilli/300/300`,
    },
    groundnut: {
      uri:      `${UNS}1559181567-c3190ee939c2?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-gnut/300/300`,
    },
    soybean: {
      uri:      `${UNS}1535379453347-e3d7c3aBd037?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-soy/300/300`,
    },
    banana: {
      uri:      `${UNS}1528825871115-3581a5387919?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-banana/300/300`,
    },
    mango: {
      uri:      `${UNS}1553279768-865429fa0078?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-mango/300/300`,
    },
    brinjal: {
      uri:      `${UNS}1540420773420-fc93c27c79e0?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-brinjal/300/300`,
    },
    potato: {
      uri:      `${UNS}1518977676275-d1f6fd66c41b?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-potato/300/300`,
    },
    coconut: {
      uri:      `${UNS}1516594798947-e15519571518?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-coconut/300/300`,
    },
    turmeric: {
      uri:      `${UNS}1599940778173-28dff89ec50b?w=300&q=80`,
      fallback: `${PSUM}/zc-crop-turmeric/300/300`,
    },
  },

  // ════════════════════════════════════════════
  // SEEDS  (for seed/input selection screens)
  // ════════════════════════════════════════════
  seed: {
    rice_seed: {
      uri:      `${UNS}1536657464278-b925e2efec67?w=200&q=80`,
      fallback: `${PSUM}/zc-seed-rice/200/200`,
    },
    wheat_seed: {
      uri:      `${UNS}1574323347407-f5e1ad6d020b?w=200&q=80`,
      fallback: `${PSUM}/zc-seed-wheat/200/200`,
    },
    maize_seed: {
      uri:      `${UNS}1551754655-4ca0c0c4c0f9?w=200&q=80`,
      fallback: `${PSUM}/zc-seed-maize/200/200`,
    },
    cotton_seed: {
      uri:      `${UNS}1586201375761-83865001e31c?w=200&q=80`,
      fallback: `${PSUM}/zc-seed-cotton/200/200`,
    },
    tomato_seed: {
      uri:      `${UNS}1546094096-0df4bcaaa337?w=200&q=80`,
      fallback: `${PSUM}/zc-seed-tomato/200/200`,
    },
    groundnut_seed: {
      uri:      `${UNS}1559181567-c3190ee939c2?w=200&q=80`,
      fallback: `${PSUM}/zc-seed-gnut/200/200`,
    },
    soybean_seed: {
      uri:      `${UNS}1535379453347-e3d7c3aBd037?w=200&q=80`,
      fallback: `${PSUM}/zc-seed-soy/200/200`,
    },
    chilli_seed: {
      uri:      `${UNS}1588252303782-0a6b2e4fe145?w=200&q=80`,
      fallback: `${PSUM}/zc-seed-chilli/200/200`,
    },
  },

  // ════════════════════════════════════════════
  // SOIL TYPES  (Soil Lab reference images)
  // ════════════════════════════════════════════
  soil: {
    clay: {
      uri:      `${UNS}1464226184884-fa280b87c399?w=300&q=80`,
      fallback: `${PSUM}/zc-soil-clay/300/300`,
    },
    sandy: {
      uri:      `${UNS}1497436072909-60f360fe1ce9?w=300&q=80`,
      fallback: `${PSUM}/zc-soil-sandy/300/300`,
    },
    loam: {
      uri:      `${UNS}1606206873764-b0572fdc5f7f?w=300&q=80`,
      fallback: `${PSUM}/zc-soil-loam/300/300`,
    },
    silt: {
      uri:      `${UNS}1508361234093-7fe5e7ab4bd5?w=300&q=80`,
      fallback: `${PSUM}/zc-soil-silt/300/300`,
    },
    black: {
      uri:      `${UNS}1519044329932-4032ba8abb42?w=300&q=80`,
      fallback: `${PSUM}/zc-soil-black/300/300`,
    },
    red: {
      uri:      `${UNS}1558618666-fcd25c85cd64?w=300&q=80`,
      fallback: `${PSUM}/zc-soil-red/300/300`,
    },
    alluvial: {
      uri:      `${UNS}1500076656116-558758c991c1?w=300&q=80`,
      fallback: `${PSUM}/zc-soil-alluvial/300/300`,
    },
  },

  // ════════════════════════════════════════════
  // MARKET / COMMODITY  (Market screen price cards)
  // ════════════════════════════════════════════
  market: {
    rice_market:    { uri: `${UNS}1536657464278-b925e2efec67?w=400&q=75`, fallback: `${PSUM}/zc-mkt-rice/400/220` },
    wheat_market:   { uri: `${UNS}1574323347407-f5e1ad6d020b?w=400&q=75`, fallback: `${PSUM}/zc-mkt-wheat/400/220` },
    tomato_market:  { uri: `${UNS}1546094096-0df4bcaaa337?w=400&q=75`,    fallback: `${PSUM}/zc-mkt-tomato/400/220` },
    onion_market:   { uri: `${UNS}1518977822-aadee1db4878?w=400&q=75`,    fallback: `${PSUM}/zc-mkt-onion/400/220` },
    potato_market:  { uri: `${UNS}1518977676275-d1f6fd66c41b?w=400&q=75`, fallback: `${PSUM}/zc-mkt-potato/400/220` },
    general_market: { uri: `${UNS}1488459716781-31db52582fe9?w=400&q=75`,  fallback: `${PSUM}/zc-mkt-gen/400/220` },
  },

  // ════════════════════════════════════════════
  // ONBOARDING  (full-screen, height = screen height)
  // ════════════════════════════════════════════
  onboarding: {
    slide1: {
      uri:      `${UNS}1625246333195-12dde9b27ee1?w=800&q=85`,
      fallback: `${PSUM}/zc-ob-1/800/600`,
      // Farmer standing in a lush green paddy field
    },
    slide2: {
      uri:      `${UNS}1416879595882-3373a0480b5b?w=800&q=85`,
      fallback: `${PSUM}/zc-ob-2/800/600`,
      // Close-up scanning a leaf — AI technology in farming
    },
    slide3: {
      uri:      `${UNS}1488459716781-31db52582fe9?w=800&q=85`,
      fallback: `${PSUM}/zc-ob-3/800/600`,
      // Vibrant market scene — sell smarter
    },
    login: {
      uri:      `${UNS}1500382017468-9049fed747ef?w=800&q=85`,
      fallback: `${PSUM}/zc-ob-login/800/600`,
    },
  },

  // ════════════════════════════════════════════
  // ICON-SIZED  (80×80, for list thumbnails)
  // ════════════════════════════════════════════
  icon: {
    fertilizer:  { uri: `${UNS}1416879595882-3373a0480b5b?w=80&q=70`,  fallback: `${PSUM}/zc-ico-fert/80/80` },
    pesticide:   { uri: `${UNS}1530836369250-ef72a3f5cda8?w=80&q=70`,  fallback: `${PSUM}/zc-ico-pest/80/80` },
    tractor:     { uri: `${UNS}1537033967420-a5e62a23f47f?w=80&q=70`,  fallback: `${PSUM}/zc-ico-tractor/80/80` },
    rain_gauge:  { uri: `${UNS}1504608524841-42584120d336?w=80&q=70`,  fallback: `${PSUM}/zc-ico-rain/80/80` },
    sun:         { uri: `${UNS}1507525428034-b723cf961d3e?w=80&q=70`,  fallback: `${PSUM}/zc-ico-sun/80/80` },
    soil_sample: { uri: `${UNS}1464226184884-fa280b87c399?w=80&q=70`,  fallback: `${PSUM}/zc-ico-soilsamp/80/80` },
    bank:        { uri: `${UNS}1554224155-6726b3ff858f?w=80&q=70`,     fallback: `${PSUM}/zc-ico-bank/80/80` },
    calendar_sm: { uri: `${UNS}1502082553048-f009c37129b9?w=80&q=70`,  fallback: `${PSUM}/zc-ico-cal/80/80` },
  },
};

// ─── useAppImage Hook ─────────────────────────────────────────
/**
 * Auto-fallback image hook.
 * 
 * @param {string} category  - key in AppImages (e.g. 'hero', 'card', 'disease')
 * @param {string} name      - key within that category (e.g. 'dashboard', 'rice')
 * @returns {{ source, onError, loading }}
 * 
 * Usage:
 *   const { source, onError } = useAppImage('hero', 'dashboard');
 *   <Image source={source} onError={onError} />
 */
export function useAppImage(category, name) {
  const entry = AppImages[category]?.[name] ?? AppImages.card.scan;
  const [uri, setUri] = useState(entry.uri);

  return {
    source: { uri },
    onError: () => setUri(entry.fallback),
    loading: false,
  };
}

/**
 * getDiseaseImage — helper for Disease Library
 * Tries to match disease name to a disease image key.
 * Falls back to 'unknown' if no match.
 * 
 * @param {string} diseaseName
 * @returns {{ uri: string, fallback: string }}
 * 
 * Usage:
 *   const img = getDiseaseImage('Leaf Blight');
 *   <Image source={{ uri: img.uri }} onError={() => {}} />
 */
export function getDiseaseImage(diseaseName) {
  if (!diseaseName) return AppImages.disease.unknown;
  const key = diseaseName.toLowerCase().replace(/\s+/g, '_');
  const direct = AppImages.disease[key];
  if (direct) return direct;

  // Fuzzy match
  const allKeys = Object.keys(AppImages.disease);
  const fuzzy = allKeys.find(k => key.includes(k) || k.includes(key));
  return fuzzy ? AppImages.disease[fuzzy] : AppImages.disease.unknown;
}

/**
 * getCropImage — helper to get crop image by name string
 * 
 * @param {string} cropName
 * @returns {{ uri: string, fallback: string }}
 */
export function getCropImage(cropName) {
  if (!cropName) return AppImages.card.market;
  const key = cropName.toLowerCase().replace(/\s+/g, '_');
  return AppImages.crop[key] ?? AppImages.market.general_market;
}

/**
 * getMarketImage — helper to get market image by commodity name
 * 
 * @param {string} commodityName
 * @returns {{ uri: string, fallback: string }}
 */
export function getMarketImage(commodityName) {
  if (!commodityName) return AppImages.market.general_market;
  const key = commodityName.toLowerCase().replace(/\s+/g, '_') + '_market';
  return AppImages.market[key] ?? AppImages.market.general_market;
}

// ─── Export flat map for quick access ─────────────────────────
// Use this in screens that need a single flat lookup:
//   import { IMAGE_MAP } from '../assets/images';
//   <Image source={{ uri: IMAGE_MAP['hero.dashboard'] }} />
export const IMAGE_MAP = Object.entries(AppImages).reduce((acc, [cat, entries]) => {
  Object.entries(entries).forEach(([name, val]) => {
    acc[`${cat}.${name}`] = val.uri;
    acc[`${cat}.${name}.fallback`] = val.fallback;
  });
  return acc;
}, {});

export default AppImages;
