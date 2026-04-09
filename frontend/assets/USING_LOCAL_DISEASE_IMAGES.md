# 🎯 Using Local Disease Images - Integration Guide

## Quick Overview

The disease library is now **properly integrated with local images**. Each disease has:
- ✅ Local images (thumb, card, hero sizes)
- ✅ Crop-specific images array
- ✅ Complete disease information
- ✅ Treatment and prevention details

---

## 📚 Files

### Main Files (USE THESE)
- **`diseaseLibraryWithLocalImages.js`** ← **NEW: Use this one!**
  - All 16 diseases with local images integrated
  - Proper mappings between disease names and image files
  - Crop-specific images for each disease
  
### Legacy Files (Optional - can remove)
- `cropLibraryImages.js` - Old Unsplash online images
- `localDiseaseImages.js` - Earlier attempt to load local images

---

## 🚀 How to Use

### Import the Disease Library
```javascript
import { 
  DiseaseImages, 
  getDiseaseImg, 
  getAllDiseases,
  getDiseasesByCategory 
} from '../../assets/diseaseLibraryWithLocalImages';
```

### Example 1: Get a Single Disease
```javascript
// Get disease by name
const disease = getDiseaseImg('Leaf Blight');

console.log(disease.name);           // 'Leaf Blight'
console.log(disease.severity);       // 'High'
console.log(disease.symptoms);       // Array of symptoms
console.log(disease.thumb);          // Image require object
console.log(disease.allImages);      // All crop-specific images
```

### Example 2: Display Disease Image in Component
```javascript
import { Image } from 'react-native';
import { getDiseaseImg } from '../../assets/diseaseLibraryWithLocalImages';

export default function DiseaseCard({ diseaseName }) {
  const disease = getDiseaseImg(diseaseName);
  
  return (
    <View>
      {/* Hero image - full width */}
      <Image 
        source={disease.hero}
        style={{ width: 400, height: 300 }}
      />
      
      {/* Disease info */}
      <Text style={styles.title}>{disease.name}</Text>
      <Text style={styles.category}>{disease.category}</Text>
      <Text style={styles.severity}>Severity: {disease.severity}</Text>
    </View>
  );
}
```

### Example 3: Display Crop-Specific Images
```javascript
// Show all images for a disease (crop variations)
const disease = getDiseaseImg('Rust Disease');

<FlatList
  data={disease.allImages}
  keyExtractor={(item, idx) => idx.toString()}
  renderItem={({ item }) => (
    <View style={styles.cropImageCard}>
      <Image 
        source={item.file}
        style={{ width: 100, height: 100 }}
      />
      <Text>{item.crop}</Text> {/* Rice, Wheat, Bean, etc */}
    </View>
  )}
  scrollEnabled={false}
  numColumns={2}
/>
```

### Example 4: Filter by Category
```javascript
import { getDiseasesByCategory } from '../../assets/diseaseLibraryWithLocalImages';

const fungalDiseases = getDiseasesByCategory('Fungal');
// Returns: [Leaf Blight, Powdery Mildew, Rust Disease, Downy Mildew, Anthracnose, Root Rot]

const pestDiseases = getDiseasesByCategory('Pest');
// Returns: [Aphid Infestation, Whitefly Damage, Thrips Damage, Stem Borer]

const nutrientIssues = getDiseasesByCategory('Nutrient');
// Returns: [Nitrogen Deficiency, Iron Deficiency (Chlorosis)]
```

### Example 5: Complete Disease Screen
```javascript
import { getDiseaseImg } from '../../assets/diseaseLibraryWithLocalImages';

export function DiseaseDetailScreen({ route }) {
  const { diseaseName } = route.params;
  const disease = getDiseaseImg(diseaseName);
  
  return (
    <ScrollView style={styles.container}>
      {/* Hero Image */}
      <Image source={disease.hero} style={styles.heroImage} />
      
      {/* Title & Category */}
      <Text style={styles.title}>{disease.name}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{disease.category}</Text>
        <Text style={styles.severityBadge}>{disease.severity}</Text>
      </View>
      
      {/* Affected Crops */}
      <Text style={styles.subtitle}>Affects:</Text>
      <Text style={styles.body}>{disease.affects.join(', ')}</Text>
      
      {/* Symptoms */}
      <Text style={styles.subtitle}>Symptoms:</Text>
      {disease.symptoms.map((symptom, idx) => (
        <Text key={idx} style={styles.listItem}>• {symptom}</Text>
      ))}
      
      {/* Treatment */}
      <Text style={styles.subtitle}>Treatment:</Text>
      {disease.treatment.map((item, idx) => (
        <Text key={idx} style={styles.listItem}>• {item}</Text>
      ))}
      
      {/* Prevention */}
      <Text style={styles.subtitle}>Prevention:</Text>
      {disease.prevention.map((item, idx) => (
        <Text key={idx} style={styles.listItem}>• {item}</Text>
      ))}
      
      {/* Dosage */}
      <Text style={styles.subtitle}>Dosage & Application:</Text>
      <Text style={styles.body}>{disease.dosage}</Text>
      
      {/* Crop Variations */}
      <Text style={styles.subtitle}>This disease on different crops:</Text>
      <FlatList
        data={disease.allImages}
        horizontal
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.cropCard}>
            <Image source={item.file} style={styles.cropImage} />
            <Text style={styles.cropName}>{item.crop}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}
```

---

## 📋 Available Diseases (16 Total)

### Fungal (6)
- Leaf Blight
- Powdery Mildew
- Rust Disease
- Downy Mildew
- Anthracnose
- Root Rot

### Bacterial (2)
- Bacterial Wilt
- Citrus Canker

### Viral (2)
- Mosaic Virus
- Leaf Curl

### Pest (4)
- Aphid Infestation
- Whitefly Damage
- Thrips Damage
- Stem Borer

### Nutrient (2)
- Nitrogen Deficiency
- Iron Deficiency (Chlorosis)

---

## 🔄 Migration from Old System

### OLD WAY (Unsplash online images):
```javascript
import { getDiseaseImg } from '../../assets/cropLibraryImages';
const img = getDiseaseImg('Leaf Blight');
<Image source={{ uri: img.card.uri }} />  // Online URL
```

### NEW WAY (Local images):
```javascript
import { getDiseaseImg } from '../../assets/diseaseLibraryWithLocalImages';
const disease = getDiseaseImg('Leaf Blight');
<Image source={disease.card} />  // Local require() object
```

---

## 📁 Image Structure
```
assets/
├── diseaseLibraryWithLocalImages.js  ← Main file
├── disease_library/
│   ├── leaf blight/           (rice, wheat, sorghum, maize)
│   ├── powdery mildew/        (grapes, cucumber, chilli, mustard, pea)
│   ├── rust disease/          (coffee, wheat, bean, groundnut, soybean)
│   ├── ... (13 more disease folders)
│   └── iron deficiency(chlorosis)/  (citrus, rice, maize, groundnut, soybean)
```

---

## ✨ Benefits of Local Images

| Feature | Online (Old) | Local (New) |
|---------|-------------|-----------|
| **Internet Required** | ✅ Yes | ❌ No |
| **Loading Speed** | Slow (network) | Fast (bundled) |
| **Image Quality** | Generic stock | Real crop diseases |
| **Crop-Specific** | ❌ No | ✅ Yes (85+ images) |
| **Offline Support** | ❌ No | ✅ Yes |
| **Data Usage** | High | Low (cached) |

---

## 🎨 Example Styled Component
```javascript
import { View, Image, Text, ScrollView, StyleSheet } from 'react-native';
import { getDiseaseImg, getDiseasesByCategory } from '../../assets/diseaseLibraryWithLocalImages';

export function DiseaseLibraryScreen() {
  const allDiseases = getDiseasesByCategory('Fungal');
  
  return (
    <ScrollView style={styles.container}>
      {allDiseases.map((disease) => (
        <View key={disease.nameKey} style={styles.card}>
          {/* Thumbnail */}
          <Image 
            source={disease.thumb} 
            style={styles.thumbnail}
          />
          
          {/* Meta Info */}
          <View style={styles.cardContent}>
            <Text style={styles.title}>{disease.name}</Text>
            <Text style={styles.severity}>{disease.severity}</Text>
            
            {/* Quick Info */}
            <Text style={styles.meta}>
              Affects: {disease.affects.slice(0, 3).join(', ')}...
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { 
    flexDirection: 'row', 
    marginBottom: 12, 
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  thumbnail: { width: 100, height: 100 },
  cardContent: { flex: 1, padding: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  severity: { color: '#666', fontSize: 12 },
  meta: { fontSize: 11, color: '#999', marginTop: 4 },
});
```

---

## 📝 Next Steps

1. ✅ Update `DiseaseLibrary.js` to use new import:
   ```javascript
   import { getDiseaseImg, getDiseasesByCategory } from '../../assets/diseaseLibraryWithLocalImages';
   ```

2. ✅ Update image rendering to use local sources:
   ```javascript
   <Image source={disease.hero} />  // Instead of source={{ uri: ... }}
   ```

3. ✅ Display crop-specific images using `disease.allImages`

4. ✅ Remove or deprecate old `cropLibraryImages.js` after migration

---

**Last Updated**: April 9, 2026  
**Status**: ✅ Local images ready to use!
