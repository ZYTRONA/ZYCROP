/**
 * images.js — ZYCROP Image Manifest v2
 * ====================================
 * Single source of truth for all image assets.
 * Uses Picsum.photos for reliable, consistent images.
 * Exports both default (for HeroBanner) and named (for legacy code).
 */

import { useState } from 'react';

// ─── Verified Unsplash URLs (specific photo IDs, not generic search) ───────
const HERO_IMAGES = {
  dashboard: {
    uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    fallback: 'https://picsum.photos/seed/farm-hero/800/400',
  },
  scan: {
    uri: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    fallback: 'https://picsum.photos/seed/leaf-scan/800/400',
  },
  soil: {
    uri: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    fallback: 'https://picsum.photos/seed/soil-lab/800/400',
  },
  market: {
    uri: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
    fallback: 'https://picsum.photos/seed/market-ai/800/400',
  },
  schemes: {
    uri: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
    fallback: 'https://picsum.photos/seed/gov-schemes/800/400',
  },
  loans: {
    uri: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    fallback: 'https://picsum.photos/seed/loan-adv/800/400',
  },
  calendar: {
    uri: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80',
    fallback: 'https://picsum.photos/seed/crop-cal/800/400',
  },
  library: {
    uri: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80',
    fallback: 'https://picsum.photos/seed/disease-lib/800/400',
  },
  passport: {
    uri: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=800&q=80',
    fallback: 'https://picsum.photos/seed/farm-pass/800/400',
  },
  pathologist: {
    uri: 'https://images.unsplash.com/photo-1576091160550-112173c7e324?w=800&q=80',
    fallback: 'https://picsum.photos/seed/pathologist/800/400',
  },
  voice: {
    uri: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
    fallback: 'https://picsum.photos/seed/voice-bot/800/400',
  },
  login: {
    uri: 'https://images.unsplash.com/photo-1625246333195-12dde9b27ee1?w=800&q=85',
    fallback: 'https://picsum.photos/seed/login-hero/800/600',
  },
};

const CARD_IMAGES = {
  scan: {
    uri: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=75',
    fallback: 'https://picsum.photos/seed/card-scan/400/220',
  },
  soil: {
    uri: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=75',
    fallback: 'https://picsum.photos/seed/card-soil/400/220',
  },
  market: {
    uri: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=75',
    fallback: 'https://picsum.photos/seed/card-market/400/220',
  },
  schemes: {
    uri: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=75',
    fallback: 'https://picsum.photos/seed/card-schemes/400/220',
  },
  loans: {
    uri: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=75',
    fallback: 'https://picsum.photos/seed/card-loans/400/220',
  },
  calendar: {
    uri: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=75',
    fallback: 'https://picsum.photos/seed/card-calendar/400/220',
  },
  library: {
    uri: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=75',
    fallback: 'https://picsum.photos/seed/card-library/400/220',
  },
  passport: {
    uri: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=400&q=75',
    fallback: 'https://picsum.photos/seed/card-passport/400/220',
  },
  pathologist: {
    uri: 'https://images.unsplash.com/photo-1576091160550-112173c7e324?w=400&q=75',
    fallback: 'https://picsum.photos/seed/card-pathologist/400/220',
  },
  weather: {
    uri: 'https://images.unsplash.com/photo-1504608524841-42584120d336?w=400&q=75',
    fallback: 'https://picsum.photos/seed/card-weather/400/220',
  },
};

const DISEASE_IMAGES = {
  leaf_blight: {
    uri: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=300&q=80',
    fallback: 'https://picsum.photos/seed/disease-blight/300/300',
  },
  powdery_mildew: {
    uri: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300&q=80',
    fallback: 'https://picsum.photos/seed/disease-mildew/300/300',
  },
  root_rot: {
    uri: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=300&q=80',
    fallback: 'https://picsum.photos/seed/disease-rootrot/300/300',
  },
  rust: {
    uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099145?w=300&q=80',
    fallback: 'https://picsum.photos/seed/disease-rust/300/300',
  },
  early_blight: {
    uri: 'https://images.unsplash.com/photo-1585518419759-7dd710a81cd1?w=300&q=80',
    fallback: 'https://picsum.photos/seed/disease-eblight/300/300',
  },
  late_blight: {
    uri: 'https://images.unsplash.com/photo-1577720643272-265f434e898a?w=300&q=80',
    fallback: 'https://picsum.photos/seed/disease-lblight/300/300',
  },
  anthracnose: {
    uri: 'https://images.unsplash.com/photo-1549399542-7e3f8b83ad69?w=300&q=80',
    fallback: 'https://picsum.photos/seed/disease-anthracnose/300/300',
  },
};

// ─── Placeholder / Loading State ────────────────────────────────────────
const PLACEHOLDER = {
  uri: 'https://picsum.photos/seed/placeholder/400/300',
  fallback: 'https://picsum.photos/seed/placeholder-alt/400/300',
};

// ─── Default Export (for HeroBanner component) ──────────────────────────
const imageManifest = {
  hero: HERO_IMAGES,
  card: CARD_IMAGES,
  disease: DISEASE_IMAGES,
  placeholder: PLACEHOLDER,
  // Legacy aliases for VoiceBotScreen compatibility
  hero_voice: HERO_IMAGES.voice,
  placeholder_1200: PLACEHOLDER,
};

// ─── Named Export (for backward compatibility) ────────────────────────────
export const images = {
  // Hero images with flat structure
  heroVoice: HERO_IMAGES.voice,
  dashboardHero: HERO_IMAGES.dashboard,
  scanHero: HERO_IMAGES.scan,
  soilHero: HERO_IMAGES.soil,
  marketHero: HERO_IMAGES.market,
  schemesHero: HERO_IMAGES.schemes,
  loanHero: HERO_IMAGES.loans,
  calendarHero: HERO_IMAGES.calendar,
  libraryHero: HERO_IMAGES.library,
  passportHero: HERO_IMAGES.passport,
  pathologistHero: HERO_IMAGES.pathologist,
  loginHero: HERO_IMAGES.login,
  
  // Card images
  scanCard: CARD_IMAGES.scan,
  soilCard: CARD_IMAGES.soil,
  marketCard: CARD_IMAGES.market,
  schemesCard: CARD_IMAGES.schemes,
  loansCard: CARD_IMAGES.loans,
  calendarCard: CARD_IMAGES.calendar,
  libraryCard: CARD_IMAGES.library,
  passportCard: CARD_IMAGES.passport,
  weatherCard: CARD_IMAGES.weather,
  pathologistCard: CARD_IMAGES.pathologist,
  
  // Disease images
  leafBlight: DISEASE_IMAGES.leaf_blight,
  powderyMildew: DISEASE_IMAGES.powdery_mildew,
  rootRot: DISEASE_IMAGES.root_rot,
  rust: DISEASE_IMAGES.rust,
  earlyBlight: DISEASE_IMAGES.early_blight,
  lateBlight: DISEASE_IMAGES.late_blight,
  anthracnose: DISEASE_IMAGES.anthracnose,
  
  // Nested structure for HeroBanner compatibility
  hero: HERO_IMAGES,
  card: CARD_IMAGES,
  disease: DISEASE_IMAGES,
  
  // Placeholders
  placeholder: PLACEHOLDER,
  placeholder_1200: PLACEHOLDER,
};

/**
 * useImage — React hook for image management with automatic fallback
 * @param {string} key - Key from images manifest
 * @returns { Object } { source: { uri }, onError: fn }
 */
export function useImage(key) {
  const entry = images[key] ?? (
    (typeof key === 'string' && images[key.split('.')[1]]) || 
    images.placeholder
  );
  const [src, setSrc] = useState((entry?.uri) || (entry) || (images.placeholder?.uri));

  return {
    source: { uri: typeof src === 'string' ? src : src.uri },
    onError: () => setSrc((entry?.fallback) || (entry) || (images.placeholder?.fallback)),
  };
}

// ─── Default Export (for HeroBanner) ────────────────────────────────────────
export default imageManifest;
