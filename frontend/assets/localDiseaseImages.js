/**
 * localDiseaseImages.js — ZYCROP Local Disease Image Loader
 *
 * Loads disease images from the local disease_library folder
 * Alternative to online Unsplash images
 *
 * USAGE:
 *   import { getLocalDiseaseImage } from '../assets/localDiseaseImages';
 *   const images = getLocalDiseaseImage('Leaf Blight');
 */

// Map disease names to folder names
const diseaseMap = {
  'Leaf Blight': 'leaf blight',
  'Powdery Mildew': 'powdery mildew',
  'Rust Disease': 'rust disease',
  'Downy Mildew': 'downy mildew',
  'Anthracnose': 'anthracnose',
  'Root Rot': 'root rot',
  'Bacterial Wilt': 'bacterial wilt',
  'Citrus Canker': 'citrus canker',
  'Mosaic Virus': 'mosaic virus',
  'Leaf Curl Virus': 'leaf curl',
  'Leaf Curl': 'leaf curl',
  'Aphid Infestation': 'aphid infestation',
  'Whitefly Damage': 'whitefly damage',
  'Thrips Damage': 'thrips damage',
  'Stem Borer': 'stem borer',
  'Nitrogen Deficiency': 'nitrogen deficiency',
  'Iron Deficiency (Chlorosis)': 'iron deficiency(chlorosis)',
};

// Image files available per disease (using first/best image for each)
const imageFiles = {
  'leaf blight': [
    require('./disease_library/leaf blight/rice leaf blight.webp'),
    require('./disease_library/leaf blight/wheat.jpeg'),
    require('./disease_library/leaf blight/sorghum.jpg'),
    require('./disease_library/leaf blight/maize.webp'),
  ],
  'powdery mildew': [
    require('./disease_library/powdery mildew/grapes.jpg'),
    require('./disease_library/powdery mildew/cucumber.jpg'),
    require('./disease_library/powdery mildew/chilli.webp'),
    require('./disease_library/powdery mildew/mustard.jpg'),
    require('./disease_library/powdery mildew/pea.jpg'),
  ],
  'rust disease': [
    require('./disease_library/rust disease/coffee.avif'),
    require('./disease_library/rust disease/wheat.jpeg'),
    require('./disease_library/rust disease/bean.jpg'),
    require('./disease_library/rust disease/groundnut.jpg'),
    require('./disease_library/rust disease/soybean.jpg'),
  ],
  'downy mildew': [
    require('./disease_library/downy mildew/grapes.png'),
    require('./disease_library/downy mildew/cucumber.webp'),
    require('./disease_library/downy mildew/maize.jpeg'),
    require('./disease_library/downy mildew/onion.jpg'),
    require('./disease_library/downy mildew/spinach.jpg'),
  ],
  'anthracnose': [
    require('./disease_library/anthracnose/bean.jpg'),
    require('./disease_library/anthracnose/chilli.webp'),
    require('./disease_library/anthracnose/cucumber.jpg'),
    require('./disease_library/anthracnose/mango.png'),
    require('./disease_library/anthracnose/papaya.webp'),
  ],
  'root rot': [
    require('./disease_library/root rot/groundnut.jpg'),
    require('./disease_library/root rot/chilli.jpeg'),
    require('./disease_library/root rot/chickpea.png'),
    require('./disease_library/root rot/cotton.jpg'),
    require('./disease_library/root rot/soybean.jpg'),
  ],
  'bacterial wilt': [
    require('./disease_library/bacterial wilt/tomato.webp'),
    require('./disease_library/bacterial wilt/potato.jpg'),
    require('./disease_library/bacterial wilt/chilli.jpg'),
    require('./disease_library/bacterial wilt/brinjal.webp'),
    require('./disease_library/bacterial wilt/tobacco.jpg'),
  ],
  'citrus canker': [
    require('./disease_library/citrus canker/orange.webp'),
    require('./disease_library/citrus canker/lemon.jpg'),
    require('./disease_library/citrus canker/lime.jpg'),
    require('./disease_library/citrus canker/mandarin.jpg'),
  ],
  'mosaic virus': [
    require('./disease_library/mosaic virus/bean.jpg'),
    require('./disease_library/mosaic virus/chilli.webp'),
    require('./disease_library/mosaic virus/cucumber.jpg'),
    require('./disease_library/mosaic virus/groundnut.webp'),
    require('./disease_library/mosaic virus/potato.jpg'),
  ],
  'leaf curl': [
    require('./disease_library/leaf curl/tomato.webp'),
    require('./disease_library/leaf curl/chilli.jpg'),
    require('./disease_library/leaf curl/cotton.jpg'),
    require('./disease_library/leaf curl/papaya.jpg'),
  ],
  'aphid infestation': [
    require('./disease_library/aphid infestation/tomato.jpg'),
    require('./disease_library/aphid infestation/chilli.jpg'),
    require('./disease_library/aphid infestation/cotton.webp'),
    require('./disease_library/aphid infestation/mustard.jpg'),
    require('./disease_library/aphid infestation/potato.webp'),
  ],
  'whitefly damage': [
    require('./disease_library/whitefly damage/chilli.jpg'),
    require('./disease_library/whitefly damage/cucumber.jpg'),
    require('./disease_library/whitefly damage/tomato.jpeg'),
    require('./disease_library/whitefly damage/cotton.jpg'),
    require('./disease_library/whitefly damage/brinjal.webp'),
  ],
  'thrips damage': [
    require('./disease_library/thrips damage/chilli.jpg'),
    require('./disease_library/thrips damage/cotton.jpg'),
    require('./disease_library/thrips damage/rose.jpg'),
    require('./disease_library/thrips damage/groundnut.webp'),
    require('./disease_library/thrips damage/thrips.webp'),
  ],
  'stem borer': [
    require('./disease_library/stem borer/maize.jpg'),
    require('./disease_library/stem borer/rice.jpg'),
    require('./disease_library/stem borer/sorghum.jpg'),
    require('./disease_library/stem borer/sugercane.png'),
  ],
  'nitrogen deficiency': [
    require('./disease_library/nitrogen deficiency/rice.webp'),
    require('./disease_library/nitrogen deficiency/wheat.webp'),
    require('./disease_library/nitrogen deficiency/sugercane.jpg'),
  ],
  'iron deficiency(chlorosis)': [
    require('./disease_library/iron deficiency(chlorosis)/citrus.jpg'),
    require('./disease_library/iron deficiency(chlorosis)/rice.jpg'),
    require('./disease_library/iron deficiency(chlorosis)/maize.jpeg'),
    require('./disease_library/iron deficiency(chlorosis)/groundnut.jpg'),
    require('./disease_library/iron deficiency(chlorosis)/soybean.png'),
  ],
};

/**
 * Get local disease images with fallback to first available image
 * @param {string} diseaseName - Disease name as shown in the app
 * @returns {object} Object with image sources or fallback
 */
export const getLocalDiseaseImage = (diseaseName) => {
  const folderName = diseaseMap[diseaseName];

  if (!folderName || !imageFiles[folderName]) {
    // Return placeholder if disease not found
    return {
      thumb: null,
      card: null,
      hero: null,
      market: null,
      available: false,
    };
  }

  const images = imageFiles[folderName];
  const primaryImage = images[0];

  return {
    thumb: primaryImage,
    card: primaryImage,
    hero: primaryImage,
    market: primaryImage,
    available: true,
    allImages: images,
  };
};

/**
 * Check if local images are available for a disease
 * @param {string} diseaseName - Disease name
 * @returns {boolean}
 */
export const hasLocalDiseaseImage = (diseaseName) => {
  const folderName = diseaseMap[diseaseName];
  return folderName && imageFiles[folderName] ? true : false;
};

/**
 * Get all available disease images in local library
 * @returns {array} Array of available disease names
 */
export const getAvailableLocalDiseases = () => {
  return Object.keys(diseaseMap).filter((name) => hasLocalDiseaseImage(name));
};

export default {
  getLocalDiseaseImage,
  hasLocalDiseaseImage,
  getAvailableLocalDiseases,
};
