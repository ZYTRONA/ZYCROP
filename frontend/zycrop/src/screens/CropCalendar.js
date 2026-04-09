/**
 * CropCalendar.js — Full Agronomic Calendar for 10 Major Crops
 * Week-by-week cultivation schedules with NPK, pest alerts, and harvest data
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLang } from '../context/LanguageContext';
import { colors, spacing, radius, textStyle, shadow } from '../theme/tokens';
import { ChipFilterRow, Badge } from '../components/ui';

// ─── Full 10-Crop Dataset ────────────────────────────────────
const CROPS = [
  {
    name: 'Tomato', icon: 'food-apple', color: '#e53935',
    season: 'Kharif + Rabi', sow: 'Jun–Jul / Oct–Nov', harvest: 'Sep–Oct / Jan–Mar',
    duration: '120–150 days', spacing: '60×45 cm', waterMM: '600–1200 mm',
    npk: 'N:100 P:50 K:50 kg/ha', yield: '25–35 t/ha',
    schedule: [
      { phase: 'Nursery', days: 'Day 0–25', type: 'sow', title: 'Seed Sowing & Treatment', desc: 'Sow in raised nursery beds. Treat seeds with Thiram 2g/kg. Use 100g seed/acre. Maintain 25–30°C.' },
      { phase: 'Nursery', days: 'Day 10–25', type: 'fertilize', title: 'Seedling Nutrition', desc: '19:19:19 NPK at 2g/L foliar spray weekly. Apply Pseudomonas fluorescens 10g/L drench at day 15.' },
      { phase: 'Land Prep', days: 'Day 20–28', type: 'spray', title: 'Field Preparation', desc: 'Apply FYM 25 t/ha + Lime 500 kg/ha if pH < 6. Deep plough 2× before transplanting.' },
      { phase: 'Transplant', days: 'Day 25–30', type: 'sow', title: 'Transplanting', desc: 'Transplant at 5-leaf stage. 60×45 cm spacing. Drip irrigation mandatory. Drench with Trichoderma 4g/L.' },
      { phase: 'Vegetative', days: 'Day 30–45', type: 'fertilize', title: 'Basal + First Top Dress', desc: 'Basal: DAP 125 kg/acre + MOP 50 kg/acre. At 30 DAS: Urea 20 kg/acre. Zinc Sulphate 25 kg/ha.' },
      { phase: 'Vegetative', days: 'Day 40–50', type: 'spray', title: 'Preventive Spray', desc: 'Mancozeb 75WP 2g/L + Imidacloprid 1ml/L to prevent early blight + whitefly. Repeat at 10 DAS.' },
      { phase: 'Flowering', days: 'Day 50–70', type: 'fertilize', title: 'Flowering Boost', desc: 'Potassium Nitrate 1% foliar (1g/100 ml). Boron 0.2% foliar spray at first flower bud. Stop N fertilization.' },
      { phase: 'Fruiting', days: 'Day 70–90', type: 'spray', title: 'Fruit Set Protection', desc: 'Cypermethrin 1ml/L for fruit borer. Copper Oxychloride 2.5g/L for blight. Apply at 7-day intervals.' },
      { phase: 'Harvest', days: 'Day 90–120', type: 'harvest', title: 'First Harvest', desc: 'Harvest when 50% colour break (pink stage). Pick every 3–4 days. Grading: Grade A > 4 cm diameter.' },
    ],
    pests: ['Early Blight (Alternaria)', 'Late Blight (Phytophthora)', 'Tomato Fruit Borer', 'Whitefly (TYLCV vector)'],
  },
  {
    name: 'Rice', icon: 'grain', color: '#f57c00',
    season: 'Kharif', sow: 'Jun–Jul', harvest: 'Oct–Nov',
    duration: '110–140 days', spacing: '20×10 cm', waterMM: '1200–1500 mm',
    npk: 'N:120 P:60 K:60 kg/ha', yield: '5–7 t/ha',
    schedule: [
      { phase: 'Pre-Sowing', days: 'Day 0', type: 'sow', title: 'Seed Treatment', desc: 'Soak seeds in Tricyclazole 0.6g/L for 24 h. Sun-dry for 2 h. Treat with Trichoderma viride 4g/kg seed.' },
      { phase: 'Nursery', days: 'Day 0–20', type: 'sow', title: 'Nursery Bed Sowing', desc: 'Wet bed nursery: 30 kg seed/acre nursery area. Basal: DAP 50 kg/ha nursery. Drain water at night.' },
      { phase: 'Land Prep', days: 'Day 15–20', type: 'fertilize', title: 'Puddling + Basal Fertilizer', desc: 'Puddle field thoroughly. Apply FYM 5 t/ha. Basal NPK: 40:40:20 kg/acre (DAP + MOP) before transplanting.' },
      { phase: 'Transplant', days: 'Day 20–25', type: 'sow', title: 'Transplanting', desc: 'Transplant 25-day seedlings: 2–3 per hill, 20×10 cm spacing. Water depth 3–5 cm. Apply Zinc Sulphate 25 kg/ha.' },
      { phase: 'Active Tillering', days: 'Day 40', type: 'fertilize', title: 'Nitrogen Top Dress 1', desc: 'Urea 20 kg/acre broadcast at active tillering (40 DAS). Drain field before application.' },
      { phase: 'Max Tillering', days: 'Day 55', type: 'spray', title: 'Disease + Pest Management', desc: 'Tricyclazole 0.6g/L for blast. Monocrotophos 1.6ml/L for BPH. Monitor for stem borer weekly.' },
      { phase: 'Panicle Init.', days: 'Day 60', type: 'fertilize', title: 'Nitrogen Top Dress 2', desc: 'Urea 10 kg/acre at panicle initiation. MOP 10 kg/acre. Critical: apply on dry soil then irrigate.' },
      { phase: 'Heading', days: 'Day 75–85', type: 'spray', title: 'Neck Blast Prevention', desc: 'Tricyclazole 75WP 0.6g/L spray at flag leaf emergence. Critical stage! Repeat at heading.' },
      { phase: 'Grain Fill', days: 'Day 90–100', type: 'spray', title: 'Grain Fill Protection', desc: 'Maintain 2.5 cm water. Avoid stress. Milky stage: do not drain field. Monitor for sheath blight.' },
      { phase: 'Harvest', days: 'Day 110–130', type: 'harvest', title: 'Harvest Time', desc: 'Harvest at 80% grain maturity (golden). Moisture < 22%. Mechanized harvesting preferred. Dry to 14% before storage.' },
    ],
    pests: ['Rice Blast (Magnaporthe)', 'Brown Plant Hopper (BPH)', 'Stem Borer', 'Sheath Blight'],
  },
  {
    name: 'Cotton', icon: 'flower-outline', color: '#6a1b9a',
    season: 'Kharif', sow: 'May–Jun', harvest: 'Nov–Feb',
    duration: '160–200 days', spacing: '90×60 cm', waterMM: '700–1200 mm',
    npk: 'N:180 P:90 K:90 kg/ha', yield: '25–30 quintals/ha (seed cotton)',
    schedule: [
      { phase: 'Pre-Sowing', days: 'Day 0', type: 'sow', title: 'Seed Preparation', desc: 'Use Bt hybrid varieties (RCH-2, Bunny Bt). Treat seeds with Thiamethoxam 70WS 3g/kg + Trichoderma 4g/kg.' },
      { phase: 'Land Prep', days: 'Day 0–5', type: 'fertilize', title: 'Basal Fertilization', desc: 'FYM 12.5 t/ha. DAP 187.5 kg/ha + MOP 150 kg/ha + Zinc Sulphate 25 kg/ha incorporated in soil.' },
      { phase: 'Sowing', days: 'Day 5', type: 'sow', title: 'Direct Sowing', desc: '90×60 cm spacing. 2 seeds/hole at 2–3 cm depth. Thin to 1 plant at 15 DAS. Maintain moisture after sowing.' },
      { phase: 'Vegetative', days: 'Day 30', type: 'fertilize', title: 'First Top Dress (N)', desc: 'Urea 65 kg/acre at 30 DAS. Side dress in furrows. Irrigate within 24h. Install yellow sticky traps.' },
      { phase: 'Square Stage', days: 'Day 45', type: 'spray', title: 'Sucking Pest Management', desc: 'Imidacloprid 0.3ml/L or Acetamiprid 0.5g/L for jassid + thrips + aphid. Neem oil 5ml/L as preventive.' },
      { phase: 'Flowering', days: 'Day 60', type: 'fertilize', title: 'Second Top Dress', desc: 'Urea 32.5 kg/acre + Potash 25 kg/acre at squaring. Micronutrient mix: Boron 0.2% + Zinc 0.5% foliar.' },
      { phase: 'Boll Formation', days: 'Day 75', type: 'spray', title: 'Bollworm Management', desc: 'Bt spray: Bacillus thuringiensis 2ml/L. Pheromone traps: 5/acre. If > 2 bollworms/plant → Emamectin 0.4g/L.' },
      { phase: 'Boll Maturation', days: 'Day 100–120', type: 'spray', title: 'Final Protection', desc: 'Stop irrigation 30 days before harvest. Ethephon 1500 ppm to hasten boll opening if needed.' },
      { phase: 'Harvest', days: 'Day 160–200', type: 'harvest', title: 'Picking Season', desc: 'Pick fully opened bolls every 15–20 days. 4–6 pickings per season. Moisture < 8% for storage. Grade by staple length.' },
    ],
    pests: ['American Bollworm (Helicoverpa)', 'Pink Bollworm', 'Cotton Jassid', 'Mealy Bug', 'Whitefly'],
  },
  {
    name: 'Wheat', icon: 'barley', color: '#f9a825',
    season: 'Rabi', sow: 'Nov–Dec', harvest: 'Mar–Apr',
    duration: '120–150 days', spacing: '22.5 cm rows', waterMM: '450–650 mm',
    npk: 'N:120 P:60 K:40 kg/ha', yield: '45–50 quintals/ha',
    schedule: [
      { phase: 'Land Prep', days: 'Day 0', type: 'sow', title: 'Field Preparation', desc: 'Plough 2× to 20 cm depth. Planking after each plough. FYM 10 t/ha + DAP 26 kg/acre + MOP 17 kg/acre as basal.' },
      { phase: 'Sowing', days: 'Day 5–10', type: 'sow', title: 'Seed Treatment & Sowing', desc: 'Treat seed: Carboxin 75WP 2.5g/kg for smut. Sow by seed drill: 22.5 cm rows, 2–3 cm depth. 100 kg seed/ha.' },
      { phase: 'CRI Stage', days: 'Day 20–21', type: 'fertilize', title: '1st Irrigation + N', desc: 'Crown Root Initiation (CRI) irrigation at 20–21 DAS. Urea top dress: 65 kg/ha in furrows.' },
      { phase: 'Tillering', days: 'Day 40–45', type: 'fertilize', title: '2nd Irrigation + Weed Control', desc: 'Pre-emergence: Clodinafop 0.9 kg a.i/ha for grassy weeds. 2nd irrigation. Split N: remaining 30 kg/ha.' },
      { phase: 'Jointing', days: 'Day 60–65', type: 'spray', title: '3rd Irrigation + Yellow Rust Watch', desc: '3rd irrigation. Monitor for yellow rust: orange-yellow stripes on leaves. Propiconazole 1ml/L if detected.' },
      { phase: 'Heading', days: 'Day 80–85', type: 'spray', title: '4th Irrigation + Leaf Rust Spray', desc: '4th irrigation at heading stage. Critical for grain fill. Hexaconazole 5SC 1ml/L for rust. Aphid: Thiamethoxam 0.5g/L.' },
      { phase: 'Grain Fill', days: 'Day 95–100', type: 'fertilize', title: '5th Irrigation (Last)', desc: 'Last irrigation at dough stage. Stop irrigation at grain maturity. Do not apply fertilizer after jointing.' },
      { phase: 'Harvest', days: 'Day 120–150', type: 'harvest', title: 'Harvesting', desc: 'Harvest when grain moisture 20–25%. Combine harvester preferred. Thresh immediately. Sun-dry to 12%. Secure storage.' },
    ],
    pests: ['Yellow Rust (Puccinia striiformis)', 'Leaf Rust', 'Aphids', 'Karnal Bunt', 'Powdery Mildew'],
  },
  {
    name: 'Onion', icon: 'circle-slice-8', color: '#5d4037',
    season: 'Rabi (Kharif also)', sow: 'Oct–Nov (Rabi)', harvest: 'Feb–Mar',
    duration: '100–130 days', spacing: '15×10 cm', waterMM: '350–550 mm',
    npk: 'N:100 P:50 K:50 kg/ha', yield: '25–30 t/ha',
    schedule: [
      { phase: 'Nursery', days: 'Day 0–40', type: 'sow', title: 'Raised Bed Nursery', desc: 'Raised bed 1m wide. Treat seed with Thiram 3g/kg. 8–10 kg seed/acre nursery. Drip irrigation 2× daily.' },
      { phase: 'Land Prep', days: 'Day 35–40', type: 'fertilize', title: 'Basal Fertilizer', desc: 'FYM/compost 25 t/ha. DAP 100 kg/ha + MOP 100 kg/ha as basal. Raised beds 150 cm wide for transplanting.' },
      { phase: 'Transplant', days: 'Day 40–45', type: 'sow', title: 'Transplanting', desc: '40-day old seedlings. 15×10 cm spacing. 3.5 lakh plants/ha. Transplant in evening. Irrigate immediately.' },
      { phase: 'Vegetative', days: 'Day 50–60', type: 'fertilize', title: 'N Top Dressing', desc: 'Urea 50 kg/ha at 30 DAS + 50 kg/ha at 45 DAS. Sulphur 20 kg/ha boosts flavour and storage.' },
      { phase: 'Bulbing', days: 'Day 60–90', type: 'spray', title: 'Thrips + Downy Mildew Control', desc: 'Fipronil 1ml/L for thrips (major pest). Metalaxyl + Mancozeb 2.5g/L for downy mildew. Repeat 10-day intervals.' },
      { phase: 'Curing', days: 'Day 95–100', type: 'harvest', title: 'Stop Irrigation + Curing', desc: 'Stop irrigation 15 days before harvest. At 50% neck fall → harvest. Cure in field 7–10 days. Grade and store.' },
      { phase: 'Harvest', days: 'Day 100–130', type: 'harvest', title: 'Lifting & Storage', desc: 'Lift bulbs manually or mechanically. Grading: Export ≥ 55mm, A grade 45–55mm. Store at 30°C, 65–70% RH.' },
    ],
    pests: ['Thrips (Thrips tabaci)', 'Purple Blotch (Alternaria)', 'Downy Mildew', 'Basal Rot (Fusarium)'],
  },
  {
    name: 'Banana', icon: 'food', color: '#fdd835',
    season: 'Year-round', sow: 'Jun–Jul / Feb–Mar', harvest: '10–15 months',
    duration: '300–360 days', spacing: '1.8×1.8 m', waterMM: '1800–2500 mm',
    npk: 'N:200 P:100 K:300 kg/ha', yield: '40–50 t/ha (Cavendish)',
    schedule: [
      { phase: 'Planting', days: 'Month 1', type: 'sow', title: 'Sucker/TC Plant', desc: 'Use virus-indexed TC plants or sword suckers (1.5–2 kg). Pit size: 60×60×60 cm. Fill with FYM + topsoil.' },
      { phase: 'Establishment', days: 'Month 1–3', type: 'fertilize', title: 'Establishment Nutrition', desc: 'N:P:K split: Month 1: 50g N + 30g P + 75g K/plant applied in split around drip circle.' },
      { phase: 'Vegetative', days: 'Month 3–6', type: 'fertilize', title: 'Rapid Growth Phase', desc: 'Month 3–6: 100g N + 50g P + 150g K/plant quarterly. Magnesium Sulphate 50g/plant. Weekly drip fertigation.' },
      { phase: 'Shooting', days: 'Month 6–9', type: 'spray', title: 'Sigatoka + Panama Wilt Watch', desc: 'Propiconazole 1ml/L fortnightly for Sigatoka. Remove infected leaves. Inspect roots for Fusarium head.' },
      { phase: 'Bunch Initiation', days: 'Month 9', type: 'fertilize', title: 'Potash Boost', desc: 'MOP 200g/plant at bunch emergence. MgSO4 50g/plant foliar. Bunch covering with white polyethylene bag.' },
      { phase: 'Bunch Dev.', days: 'Month 10–12', type: 'spray', title: 'Bunch Protection', desc: 'Bag bunches with blue polythene to protect from insects and sunscald. Prop stems to prevent lodging.' },
      { phase: 'Harvest', days: 'Month 11–15', type: 'harvest', title: 'Harvesting', desc: 'Harvest at 75% maturity (3/4 round fingers). Cut bunch with 30cm stalk. Handle carefully to avoid bruising.' },
    ],
    pests: ['Yellow Sigatoka (Mycosphaerella)', 'Panama Wilt (Fusarium)', 'Banana Weevil', 'Mealybug', 'Nematodes'],
  },
  {
    name: 'Groundnut', icon: 'food-variant', color: '#bf8d20',
    season: 'Kharif + Rabi', sow: 'Jun–Jul / Dec–Jan', harvest: 'Sep–Oct / Mar–Apr',
    duration: '90–130 days', spacing: '30×10 cm', waterMM: '500–700 mm',
    npk: 'N:25 P:50 K:75 kg/ha', yield: '1.5–2.5 t/ha (kernels)',
    schedule: [
      { phase: 'Pre-Sowing', days: 'Day 0', type: 'sow', title: 'Seed Preparation', desc: 'Decorticate 2 days before sowing. Treat with Rhizobium inoculant + Trichoderma 4g/kg. Sun-dry for 2h.' },
      { phase: 'Land Prep', days: 'Day 0', type: 'fertilize', title: 'Basal Fertilizer', desc: 'Gypsum 500 kg/ha broadcast. DAP 100 kg/ha + MOP 150 kg/ha as basal. Deep plough 30 cm.' },
      { phase: 'Sowing', days: 'Day 5', type: 'sow', title: 'Direct Sowing', desc: '30×10 cm spacing. 2–3 seeds/hill at 4–5 cm depth. Shelling percentage > 72%. Seed rate: 80–100 kg/ha.' },
      { phase: 'Flowering', days: 'Day 25–35', type: 'spray', title: 'Early Tikka + Weed Control', desc: 'Mancozeb 75WP 2g/L at first ticka symptoms. Pre-emergence: Pendimethalin 1kg a.i/ha. Hand weed at 30 DAS.' },
      { phase: 'Pegging', days: 'Day 35–60', type: 'fertilize', title: 'Gypsum Top Dress', desc: '250 kg/ha gypsum at pegging stage (CRITICAL for pod fill and calcium). Avoid deep tillage — breaks pegs.' },
      { phase: 'Pod Fill', days: 'Day 60–80', type: 'spray', title: 'Tikka Leaf Spot Control', desc: 'Chlorothalonil 2g/L for late leaf spot. Monitor for pod borers. Avoid waterlogging during pod formation.' },
      { phase: 'Harvest', days: 'Day 90–130', type: 'harvest', title: 'Digging', desc: 'Test maturity: scrape inner shell — dark brown markings. Dig when 75% pods mature. Dry in windrows 5–7 days.' },
    ],
    pests: ['Tikka Leaf Spot (Early + Late)', 'Stem Rot (Sclerotium)', 'Aphid', 'Thrips', 'Leaf Miner'],
  },
  {
    name: 'Maize', icon: 'corn', color: '#ff8f00',
    season: 'Kharif / Rabi / Spring', sow: 'Jun–Jul / Oct–Nov / Feb', harvest: '90–110 days after sowing',
    duration: '90–120 days', spacing: '60×25 cm', waterMM: '550–750 mm',
    npk: 'N:150 P:75 K:75 kg/ha', yield: '6–10 t/ha',
    schedule: [
      { phase: 'Sowing', days: 'Day 0', type: 'sow', title: 'Seed Treatment & Sowing', desc: 'Use hybrid seed (DKC 9141, P3522). Treat: Thiram 2g/kg + Imidacloprid 1g/kg. 60×25 cm, 2 cm depth.' },
      { phase: 'Emergence', days: 'Day 7–10', type: 'spray', title: 'Herbicide Window', desc: 'Pre-emergence: Atrazine 1kg a.i/ha. Post-emergence at V3: Tembotrione 120g a.i/ha for broad + narrow weeds.' },
      { phase: 'V5–V6', days: 'Day 25–30', type: 'fertilize', title: 'First N Top Dress', desc: 'Urea 65 kg/ha at knee-high stage. Side dress in furrows. Zinc Sulphate 25 kg/ha. Thinning to 1 plant/hole.' },
      { phase: 'V8–V10', days: 'Day 45–50', type: 'fertilize', title: 'Second N Top Dress', desc: 'Urea 65 kg/ha at pre-tassel. Critical! Irrigation immediately after application. Monitor for FAW.' },
      { phase: 'Tasseling', days: 'Day 55–65', type: 'spray', title: 'Fall Armyworm Control', desc: 'FAW (Spodoptera frugiperda): Emamectin 0.4g/L or Chlorantraniliprole 0.4ml/L into whorl. Pheromone traps 5/acre.' },
      { phase: 'Silking', days: 'Day 65–75', type: 'spray', title: 'Rust + Blight Watch', desc: 'Common rust: Propiconazole 1ml/L. Turcicum leaf blight: Mancozeb 2.5g/L. Apply at silking. 4th irrigation.' },
      { phase: 'Dough Stage', days: 'Day 85', type: 'harvest', title: 'Maturity Check', desc: 'Black layer formation at kernel base = maturity. Moisture 26–28%. No irrigation needed.' },
      { phase: 'Harvest', days: 'Day 90–120', type: 'harvest', title: 'Shelling & Drying', desc: 'Mechanized combine at 25% moisture. Dry to 12–14% before storage. Store in hermetic bags.' },
    ],
    pests: ['Fall Armyworm (FAW)', 'Stem Borer', 'Common Rust', 'Turcicum Blight', 'Downy Mildew'],
  },
  {
    name: 'Sugarcane', icon: 'grass', color: '#2e7d32',
    season: 'Year-round (Main: Oct–Mar plant)', sow: 'Oct–Nov (Adsali: Jul)', harvest: '10–16 months',
    duration: '300–450 days', spacing: '90–120 cm row', waterMM: '1500–2500 mm',
    npk: 'N:275 P:112 K:112 kg/ha', yield: '80–120 t/ha cane',
    schedule: [
      { phase: 'Sett Prep', days: 'Day 0', type: 'sow', title: 'Sett Treatment', desc: 'Use 3-bud setts (25–30 cm). Treat with Aresin 0.18% + Bavistin 0.1% for 30 min. Air-dry before planting.' },
      { phase: 'Planting', days: 'Day 5', type: 'sow', title: 'Furrow Planting', desc: 'Furrow 30 cm deep, 90cm spacing. Apply FYM 25 t/ha in furrow. Place setts end-to-end. Cover with 5 cm soil.' },
      { phase: 'Germination', days: 'Day 15–45', type: 'fertilize', title: 'Germination Nutrition', desc: 'Urea 50 kg/ha at 30 DAS. Zinc Sulphate 25 kg/ha. Earthup at 45 DAS to support stalks.' },
      { phase: 'Tillering', days: 'Day 60–120', type: 'fertilize', title: 'Main N Applications', desc: 'N split: 60 DAS: 75 kg/ha, 90 DAS: 75 kg/ha. Potash: 112 kg/ha at 90 DAS. Phosphate as basal.' },
      { phase: 'Grand Growth', days: 'Month 4–8', type: 'spray', title: 'Internode Elongation', desc: 'Ethrel 250 ppm spray for elongation. Trash mulching between rows. Irrigation every 8–10 days. Monitor top borer.' },
      { phase: 'Maturation', days: 'Month 9–12', type: 'spray', title: 'Ripening Management', desc: 'Stop irrigation 30 days before harvest. Glyphosate 0.5% as ripener (if allowed). Ethephon 2.5ml/L spray.' },
      { phase: 'Harvest', days: 'Month 10–16', type: 'harvest', title: 'Cane Cutting', desc: 'Cut at ground level. Remove dry leaves (trashing). Brix > 18 for high sugar content. Mill within 24h.' },
    ],
    pests: ['Top Shoot Borer (Scirpophaga)', 'Internode Borer', 'Scale Insect', 'Red Rot (Colletotrichum)', 'Smut'],
  },
  {
    name: 'Chili', icon: 'fire', color: '#c62828',
    season: 'Kharif + Rabi', sow: 'Jun–Jul / Oct–Nov', harvest: '150–180 days',
    duration: '150–180 days', spacing: '60×30 cm', waterMM: '600–900 mm',
    npk: 'N:120 P:60 K:60 kg/ha', yield: '15–25 q/ha (dry chili)',
    schedule: [
      { phase: 'Nursery', days: 'Day 0–30', type: 'sow', title: 'Nursery Sowing', desc: 'Raised bed nursery. 500g seed/acre. Treat seed with Thiram 2g/kg + Imidacloprid 4ml/kg. Spray Imidacloprid 0.3ml/L at 15 DAS for thrips.' },
      { phase: 'Nursery Mgmt', days: 'Day 15–30', type: 'fertilize', title: 'Nursery Top Dress', desc: 'DAP 2g/L + Urea 2g/L foliar at 15 and 25 DAS. Spray Mancozeb 2g/L for damping off.' },
      { phase: 'Transplant', days: 'Day 30–35', type: 'sow', title: 'Transplanting', desc: '30-day old seedlings. 60×30 cm raising beds. Plant in cool evening. Drench with Trichoderma 4g/L + Pseudomonas 10g/L.' },
      { phase: 'Vegetative', days: 'Day 45–60', type: 'fertilize', title: 'First N Top Dress', desc: 'Urea 25 kg/acre + MOP 15 kg/acre at 45 DAS. Spray: Imidacloprid 0.3ml/L + Mancozeb 2g/L combined.' },
      { phase: 'Flowering', days: 'Day 60–75', type: 'spray', title: 'Flower Drop Prevention', desc: 'Plano-fix 4ml/L foliar at bud stage. Boron 0.2% foliar for fruit set. Avoid water stress during flowering.' },
      { phase: 'Fruiting', days: 'Day 75–100', type: 'spray', title: 'Anthracnose + Mite Control', desc: 'Carbendazim 1g/L + Mancozeb 2g/L for anthracnose. Dicofol 2.5ml/L for mite infestation. Weekly spray.' },
      { phase: 'Harvest', days: 'Day 90–120+', type: 'harvest', title: 'Green/Red Harvest', desc: 'Green: start at 75-80 DAS. Red (dry): allow full red color. Sun-dry 7–10 days (8% moisture for storage).' },
    ],
    pests: ['Thrips', 'Chili Fruit Borer', 'Yellow Mite', 'Anthracnose (Colletotrichum)', 'Powdery Mildew'],
  },
];

const TASK_COLORS = {
  sow:      { bg: '#e8f5e9', icon: 'seed-outline',    color: '#2e7d32', badge: 'success' },
  fertilize:{ bg: '#fff3e0', icon: 'water-outline',   color: '#f57c00', badge: 'warning' },
  spray:    { bg: '#e3f2fd', icon: 'spray',            color: '#1565c0', badge: 'info' },
  harvest:  { bg: '#fce4ec', icon: 'content-cut',     color: '#c2185b', badge: 'danger' },
};

function CropInfoCard({ crop }) {
  return (
    <View style={ci.card}>
      {[
        { icon: 'calendar-range', label: 'Season',   value: crop.season },
        { icon: 'seed-outline',   label: 'Sowing',   value: crop.sow },
        { icon: 'scissors-cutting', label: 'Harvest', value: crop.harvest },
        { icon: 'clock-outline',  label: 'Duration', value: crop.duration },
        { icon: 'ruler',          label: 'Spacing',  value: crop.spacing },
        { icon: 'water',          label: 'Water',    value: crop.waterMM },
        { icon: 'flask-outline',  label: 'NPK',      value: crop.npk },
        { icon: 'chart-bar',      label: 'Yield',    value: crop.yield },
      ].map(({ icon, label, value }) => (
        <View key={label} style={ci.row}>
          <MaterialCommunityIcons name={icon} size={16} color={colors.primary} />
          <Text style={[textStyle.bodySmall(), ci.label]}>{label}</Text>
          <Text style={[textStyle.body(), ci.value]} numberOfLines={1}>{value}</Text>
        </View>
      ))}
    </View>
  );
}
const ci = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: colors.border + '40' },
  label: { color: colors.textMuted, width: 68, marginLeft: spacing.sm, fontSize: 12 },
  value: { flex: 1, fontWeight: '600', fontSize: 13 },
});

function TaskCard({ task }) {
  const { bg, icon, color, badge } = TASK_COLORS[task.type] || TASK_COLORS.sow;
  return (
    <View style={[tc.card, { backgroundColor: bg }]}>
      <View style={[tc.icon, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={tc.content}>
        <View style={tc.header}>
          <Text style={[textStyle.body(), { fontWeight: '700', color, flex: 1 }]}>{task.title}</Text>
          <Badge label={task.type} variant={badge} size="sm" />
        </View>
        <Text style={[textStyle.bodySmall(), { color: colors.textMuted, marginVertical: 2 }]}>
          {task.days} · {task.phase}
        </Text>
        <Text style={[textStyle.body(), { fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginTop: 4 }]}>
          {task.desc}
        </Text>
      </View>
    </View>
  );
}
const tc = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row', gap: spacing.md, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3 },
  icon: { width: 48, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 },
});

function PestSection({ pests, color }) {
  return (
    <View style={ps.card}>
      <View style={ps.header}>
        <MaterialCommunityIcons name="bug" size={18} color={color} />
        <Text style={[textStyle.h3(), { marginLeft: spacing.sm }]}>Common Threats</Text>
      </View>
      {pests.map((p, i) => (
        <View key={i} style={ps.row}>
          <View style={[ps.dot, { backgroundColor: color }]} />
          <Text style={[textStyle.bodySmall(), { flex: 1 }]}>{p}</Text>
        </View>
      ))}
    </View>
  );
}
const ps = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

export default function CropCalendar({ navigation }) {
  const { t } = useLang();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const crop = CROPS[selectedIdx];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={10}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <Text style={[textStyle.h2({ color: '#fff' })]}>Crop Calendar</Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 }}>
            Full agronomic schedule · {CROPS.length} crops
          </Text>
        </View>
      </View>

      {/* Crop selector chips */}
      <View style={s.chipsWrap}>
        <ChipFilterRow
          options={CROPS.map(c => c.name)}
          selected={selectedIdx}
          onSelect={setSelectedIdx}
          keyNames={CROPS.map(c => c.name)}
        />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Crop identity header */}
        <View style={[s.cropBanner, { backgroundColor: crop.color + '18', borderColor: crop.color + '30' }]}>
          <MaterialCommunityIcons name={crop.icon} size={40} color={crop.color} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[textStyle.h2(), { color: crop.color }]}>{crop.name}</Text>
            <Text style={[textStyle.bodySmall(), { color: colors.textMuted }]}>{crop.season}</Text>
          </View>
          <View>
            <Text style={[textStyle.bodySmall(), { color: colors.textMuted, textAlign: 'right' }]}>Yield target</Text>
            <Text style={[textStyle.body(), { fontWeight: '700', color: crop.color, textAlign: 'right' }]}>{crop.yield}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.md }}>
          {/* Quick info */}
          <Text style={[textStyle.h3(), s.sectionLabel]}>Crop Overview</Text>
          <CropInfoCard crop={crop} />

          {/* Schedule */}
          <Text style={[textStyle.h3(), s.sectionLabel]}>Cultivation Schedule</Text>
          {crop.schedule.map((task, i) => <TaskCard key={i} task={task} />)}

          {/* Pest threats */}
          <Text style={[textStyle.h3(), s.sectionLabel]}>Pest & Disease Alerts</Text>
          <PestSection pests={crop.pests} color={crop.color} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, marginLeft: spacing.sm },
  chipsWrap: { backgroundColor: colors.primary, paddingBottom: spacing.md },
  scroll: { flex: 1 },
  cropBanner: { margin: spacing.md, borderRadius: radius.xl || 24, padding: spacing.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  sectionLabel: { marginBottom: spacing.sm, marginTop: spacing.sm },
});
