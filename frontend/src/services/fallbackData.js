/**
 * Comprehensive Fallback Mock Data - Real Indian Market Prices
 * Used when backend is unreachable
 * All prices in INR per 100kg (standard agricultural unit)
 */

export const FALLBACK_MARKET_DATA = {
  // ── Cereals ──────────────────────────────────────────
  Rice: {
    crop: 'Rice',
    markets: [
      { market: 'Coimbatore', price: 2100, trend: 'up', min: 2050, max: 2150 },
      { market: 'Chennai', price: 2050, trend: 'up', min: 2020, max: 2080 },
      { market: 'Trichy', price: 2150, trend: 'stable', min: 2130, max: 2180 },
      { market: 'Bangalore', price: 2080, trend: 'up', min: 2050, max: 2110 },
    ],
    best_market: 'Trichy',
    average_price: 2095,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Wheat: {
    crop: 'Wheat',
    markets: [
      { market: 'Coimbatore', price: 1850, trend: 'down', min: 1820, max: 1880 },
      { market: 'Chennai', price: 1900, trend: 'stable', min: 1880, max: 1920 },
      { market: 'Trichy', price: 1880, trend: 'down', min: 1850, max: 1910 },
      { market: 'Bangalore', price: 1875, trend: 'stable', min: 1850, max: 1900 },
    ],
    best_market: 'Chennai',
    average_price: 1876,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Maize: {
    crop: 'Maize',
    markets: [
      { market: 'Coimbatore', price: 1650, trend: 'up', min: 1620, max: 1680 },
      { market: 'Chennai', price: 1700, trend: 'up', min: 1680, max: 1720 },
      { market: 'Trichy', price: 1675, trend: 'stable', min: 1650, max: 1700 },
      { market: 'Bangalore', price: 1680, trend: 'up', min: 1660, max: 1700 },
    ],
    best_market: 'Chennai',
    average_price: 1676,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },

  // ── Vegetables (Price per kg) ────────────────────────
  Tomato: {
    crop: 'Tomato',
    markets: [
      { market: 'Coimbatore', price: 45, trend: 'up', min: 40, max: 50 },
      { market: 'Chennai', price: 50, trend: 'up', min: 48, max: 55 },
      { market: 'Trichy', price: 42, trend: 'stable', min: 40, max: 45 },
      { market: 'Bangalore', price: 48, trend: 'up', min: 43, max: 52 },
    ],
    best_market: 'Chennai',
    average_price: 46,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Onion: {
    crop: 'Onion',
    markets: [
      { market: 'Coimbatore', price: 25, trend: 'stable', min: 22, max: 28 },
      { market: 'Chennai', price: 28, trend: 'up', min: 26, max: 30 },
      { market: 'Trichy', price: 24, trend: 'down', min: 22, max: 26 },
      { market: 'Bangalore', price: 26, trend: 'stable', min: 24, max: 28 },
    ],
    best_market: 'Chennai',
    average_price: 26,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Potato: {
    crop: 'Potato',
    markets: [
      { market: 'Coimbatore', price: 18, trend: 'down', min: 16, max: 20 },
      { market: 'Chennai', price: 22, trend: 'stable', min: 20, max: 24 },
      { market: 'Trichy', price: 20, trend: 'down', min: 18, max: 22 },
      { market: 'Bangalore', price: 21, trend: 'stable', min: 19, max: 23 },
    ],
    best_market: 'Chennai',
    average_price: 20,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Chili: {
    crop: 'Chili',
    markets: [
      { market: 'Coimbatore', price: 120, trend: 'up', min: 110, max: 130 },
      { market: 'Chennai', price: 130, trend: 'up', min: 125, max: 135 },
      { market: 'Trichy', price: 115, trend: 'stable', min: 110, max: 120 },
      { market: 'Bangalore', price: 125, trend: 'up', min: 120, max: 130 },
    ],
    best_market: 'Chennai',
    average_price: 122,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Carrot: {
    crop: 'Carrot',
    markets: [
      { market: 'Coimbatore', price: 35, trend: 'stable', min: 32, max: 38 },
      { market: 'Chennai', price: 40, trend: 'up', min: 38, max: 42 },
      { market: 'Trichy', price: 36, trend: 'stable', min: 34, max: 38 },
      { market: 'Bangalore', price: 38, trend: 'up', min: 36, max: 40 },
    ],
    best_market: 'Chennai',
    average_price: 37,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Broccoli: {
    crop: 'Broccoli',
    markets: [
      { market: 'Coimbatore', price: 55, trend: 'up', min: 50, max: 60 },
      { market: 'Chennai', price: 65, trend: 'up', min: 60, max: 70 },
      { market: 'Trichy', price: 58, trend: 'stable', min: 55, max: 62 },
      { market: 'Bangalore', price: 62, trend: 'up', min: 58, max: 66 },
    ],
    best_market: 'Chennai',
    average_price: 60,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },

  // ── Spices ────────────────────────────────────────
  Turmeric: {
    crop: 'Turmeric',
    markets: [
      { market: 'Coimbatore', price: 6500, trend: 'stable', min: 6300, max: 6700 },
      { market: 'Chennai', price: 6800, trend: 'up', min: 6600, max: 7000 },
      { market: 'Trichy', price: 6600, trend: 'stable', min: 6400, max: 6800 },
      { market: 'Bangalore', price: 6700, trend: 'stable', min: 6500, max: 6900 },
    ],
    best_market: 'Chennai',
    average_price: 6650,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Coriander: {
    crop: 'Coriander',
    markets: [
      { market: 'Coimbatore', price: 5200, trend: 'down', min: 5000, max: 5400 },
      { market: 'Chennai', price: 5500, trend: 'stable', min: 5300, max: 5700 },
      { market: 'Trichy', price: 5300, trend: 'down', min: 5100, max: 5500 },
      { market: 'Bangalore', price: 5400, trend: 'stable', min: 5200, max: 5600 },
    ],
    best_market: 'Chennai',
    average_price: 5350,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Cumin: {
    crop: 'Cumin',
    markets: [
      { market: 'Coimbatore', price: 8900, trend: 'up', min: 8700, max: 9100 },
      { market: 'Chennai', price: 9200, trend: 'up', min: 9000, max: 9400 },
      { market: 'Trichy', price: 9000, trend: 'stable', min: 8800, max: 9200 },
      { market: 'Bangalore', price: 9100, trend: 'up', min: 8900, max: 9300 },
    ],
    best_market: 'Chennai',
    average_price: 9050,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },

  // ── Pulses ────────────────────────────────────────
  Lentils: {
    crop: 'Lentils',
    markets: [
      { market: 'Coimbatore', price: 3800, trend: 'up', min: 3700, max: 3900 },
      { market: 'Chennai', price: 3900, trend: 'up', min: 3800, max: 4000 },
      { market: 'Trichy', price: 3750, trend: 'stable', min: 3650, max: 3850 },
      { market: 'Bangalore', price: 3850, trend: 'up', min: 3750, max: 3950 },
    ],
    best_market: 'Chennai',
    average_price: 3825,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Chick_Pea: {
    crop: 'Chick Pea',
    markets: [
      { market: 'Coimbatore', price: 4200, trend: 'stable', min: 4100, max: 4300 },
      { market: 'Chennai', price: 4400, trend: 'up', min: 4300, max: 4500 },
      { market: 'Trichy', price: 4250, trend: 'stable', min: 4150, max: 4350 },
      { market: 'Bangalore', price: 4350, trend: 'up', min: 4250, max: 4450 },
    ],
    best_market: 'Chennai',
    average_price: 4300,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Pigeon_Pea: {
    crop: 'Pigeon Pea',
    markets: [
      { market: 'Coimbatore', price: 5100, trend: 'up', min: 5000, max: 5200 },
      { market: 'Chennai', price: 5300, trend: 'up', min: 5200, max: 5400 },
      { market: 'Trichy', price: 5150, trend: 'stable', min: 5050, max: 5250 },
      { market: 'Bangalore', price: 5250, trend: 'up', min: 5150, max: 5350 },
    ],
    best_market: 'Chennai',
    average_price: 5200,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },

  // ── Fruits ────────────────────────────────────────
  Apple: {
    crop: 'Apple',
    markets: [
      { market: 'Coimbatore', price: 180, trend: 'stable', min: 170, max: 190 },
      { market: 'Chennai', price: 200, trend: 'up', min: 190, max: 210 },
      { market: 'Trichy', price: 185, trend: 'stable', min: 175, max: 195 },
      { market: 'Bangalore', price: 195, trend: 'up', min: 185, max: 205 },
    ],
    best_market: 'Chennai',
    average_price: 190,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Banana: {
    crop: 'Banana',
    markets: [
      { market: 'Coimbatore', price: 35, trend: 'down', min: 30, max: 40 },
      { market: 'Chennai', price: 40, trend: 'stable', min: 38, max: 42 },
      { market: 'Trichy', price: 38, trend: 'stable', min: 35, max: 40 },
      { market: 'Bangalore', price: 39, trend: 'stable', min: 36, max: 42 },
    ],
    best_market: 'Chennai',
    average_price: 38,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Mango: {
    crop: 'Mango',
    markets: [
      { market: 'Coimbatore', price: 85, trend: 'up', min: 75, max: 95 },
      { market: 'Chennai', price: 95, trend: 'up', min: 85, max: 105 },
      { market: 'Trichy', price: 90, trend: 'steady', min: 80, max: 100 },
      { market: 'Bangalore', price: 92, trend: 'up', min: 82, max: 102 },
    ],
    best_market: 'Chennai',
    average_price: 91,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Papaya: {
    crop: 'Papaya',
    markets: [
      { market: 'Coimbatore', price: 28, trend: 'stable', min: 25, max: 31 },
      { market: 'Chennai', price: 32, trend: 'up', min: 30, max: 34 },
      { market: 'Trichy', price: 30, trend: 'stable', min: 27, max: 33 },
      { market: 'Bangalore', price: 31, trend: 'up', min: 28, max: 34 },
    ],
    best_market: 'Chennai',
    average_price: 30,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Orange: {
    crop: 'Orange',
    markets: [
      { market: 'Coimbatore', price: 52, trend: 'up', min: 48, max: 56 },
      { market: 'Chennai', price: 58, trend: 'up', min: 54, max: 62 },
      { market: 'Trichy', price: 55, trend: 'stable', min: 51, max: 59 },
      { market: 'Bangalore', price: 56, trend: 'up', min: 52, max: 60 },
    ],
    best_market: 'Chennai',
    average_price: 55,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
  Grapes: {
    crop: 'Grapes',
    markets: [
      { market: 'Coimbatore', price: 120, trend: 'stable', min: 110, max: 130 },
      { market: 'Chennai', price: 135, trend: 'up', min: 125, max: 145 },
      { market: 'Trichy', price: 128, trend: 'stable', min: 118, max: 138 },
      { market: 'Bangalore', price: 132, trend: 'up', min: 122, max: 142 },
    ],
    best_market: 'Chennai',
    average_price: 129,
    source: 'fallback_mock',
    updated_at: new Date().toISOString(),
    from_cache: false,
    cache_age_minutes: 0,
  },
};

/**
 * Get fallback market data for a crop
 */
export const getFallbackMarketData = (crop) => {
  return (
    FALLBACK_MARKET_DATA[crop] || {
      crop,
      markets: [],
      best_market: 'Unknown',
      average_price: 0,
      source: 'fallback_mock',
      from_cache: false,
    }
  );
};
