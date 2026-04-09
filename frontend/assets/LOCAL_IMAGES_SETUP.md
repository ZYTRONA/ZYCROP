# Local Disease Images Integration Guide

## Overview
The frontend now has access to local disease images from the **disease_library** folder in `assets/`. These images provide offline access to disease photographs and can be used instead of (or as a fallback to) the online Unsplash images.

## File Structure
```
frontend/assets/
├── disease_library/           ← Local disease images
│   ├── anthracnose/
│   ├── aphid infestation/
│   ├── bacterial wilt/
│   ├── citrus canker/
│   ├── downy mildew/
│   ├── iron deficiency(chlorosis)/
│   ├── leaf blight/
│   ├── leaf curl/
│   ├── mosaic virus/
│   ├── nitrogen deficiency/
│   ├── powdery mildew/
│   ├── root rot/
│   ├── rust disease/
│   ├── stem borer/
│   ├── thrips damage/
│   └── whitefly damage/
├── localDiseaseImages.js      ← NEW: Local image loader
└── cropLibraryImages.js       ← Original: Unsplash images
```

## Usage Example

### Option 1: Use Local Images Only
```javascript
import { getLocalDiseaseImage } from '../../assets/localDiseaseImages';

// In your component:
const diseaseImage = getLocalDiseaseImage('Leaf Blight');

<Image 
  source={diseaseImage.hero}
  style={styles.image}
/>
```

### Option 2: Mix Local + Online (Recommended)
```javascript
import { getDiseaseImg } from '../../assets/cropLibraryImages';
import { getLocalDiseaseImage } from '../../assets/localDiseaseImages';

// Try local first, fallback to online
const getDiseaseThumbnail = (diseaseName) => {
  const local = getLocalDiseaseImage(diseaseName);
  if (local.available) return local.thumb;
  
  // Fallback to Unsplash
  const online = getDiseaseImg(diseaseName);
  return online.thumb;
};
```

### Option 3: Replace in DiseaseLibrary.js
Edit `/frontend/src/screens/DiseaseLibrary.js`:

```javascript
import { getDiseaseImg } from '../../assets/cropLibraryImages';
import { getLocalDiseaseImage } from '../../assets/localDiseaseImages';

// In the disease item rendering:
const renderDiseaseItem = ({ item }) => {
  // Get local image or fallback to online
  const localImg = getLocalDiseaseImage(item.name);
  const imageSource = localImg.available 
    ? localImg.thumb 
    : getDiseaseImg(item.name).thumb;
  
  return (
    <Image 
      source={imageSource}
      style={styles.thumbnail}
    />
  );
};
```

## Available Functions

### `getLocalDiseaseImage(diseaseName)`
Returns local images for a disease.
```javascript
{
  thumb:     require(...),    // Thumbnail size
  card:      require(...),    // Card size
  hero:      require(...),    // Full screen
  market:    require(...),    // Market card
  available: boolean,         // If images exist locally
  allImages: [require(...)]   // All available images
}
```

### `hasLocalDiseaseImage(diseaseName)`
Check if a disease has local images.
```javascript
if (hasLocalDiseaseImage('Leaf Blight')) {
  // Load from local
}
```

### `getAvailableLocalDiseases()`
Get list of all diseases with local images.
```javascript
const availableDiseases = getAvailableLocalDiseases();
// Returns array of disease names available locally
```

## Available Diseases with Local Images
- Leaf Blight
- Powdery Mildew
- Rust Disease
- Downy Mildew
- Anthracnose
- Root Rot
- Bacterial Wilt
- Citrus Canker
- Mosaic Virus
- Leaf Curl
- Aphid Infestation
- Whitefly Damage
- Thrips Damage
- Stem Borer
- Nitrogen Deficiency
- Iron Deficiency (Chlorosis)

## Benefits
✅ **Offline Support** - Access images without internet  
✅ **Faster Loading** - No network delay  
✅ **Lower Data Usage** - Cached after first bundle  
✅ **Reliable** - No API downtime concerns  
✅ **Full Control** - Use your own image collection  

## Images Per Disease
Each disease folder contains multiple crop-specific images:
- **Leaf Blight**: rice, wheat, sorghum, maize
- **Powdery Mildew**: grapes, cucumber, chilli, mustard, pea
- **Rust Disease**: coffee, wheat, bean, groundnut, soybean
- **And more...** (see folder listing above)

## Migration Path
1. ✅ Local images already set up in `assets/disease_library/`
2. ✅ Loader function created in `localDiseaseImages.js`
3. Next: Import and use in screens where needed
4. Optional: Replace Unsplash references with local

---
**Last Updated**: April 9, 2026
