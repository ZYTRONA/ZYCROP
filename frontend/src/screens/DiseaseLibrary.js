/**
 * DiseaseLibrary.js — Disease Reference Library (ENHANCED UI)
 * Complete disease database with images, symptoms, treatment, and prevention
 * ENHANCED: Better visual design, improved UX, complete information display
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLang } from '../context/LanguageContext';
import { useResponsive } from '../theme/responsive';
import { colors, spacing, radius, shadow, textStyle } from '../theme/tokens';
import { ChipFilterRow, Badge, EmptyState } from '../components/ui';
import {
  filterDiseasesByCategory,
  searchDiseases,
  getDiseaseImg,
} from '../../assets/diseaseLibraryWithLocalImages';

// Category icon mapping
const CATEGORY_ICONS = {
  Fungal: 'mushroom',
  Bacterial: 'bacteria',
  Viral: 'virus',
  Pest: 'bug',
  Nutrient: 'flask-empty',
};

const CATEGORY_COLORS = {
  Fungal: '#8B4513',
  Bacterial: '#C41E3A',
  Viral: '#9370DB',
  Pest: '#FF8C00',
  Nutrient: '#DAA520',
};

export default function DiseaseLibrary({ navigation }) {
  const { t } = useLang();
  const { spacing: sp } = useResponsive();

  const [searchText, setSearchText] = useState('');
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set()); // Track failed images

  // Handle image load errors - fallback to picsum
  const handleImageError = (imageName, sizeType) => {
    const key = `${imageName}-${sizeType}`;
    setFailedImages(prev => new Set([...prev, key]));
  };

  // Get image with fallback
  const getImageSource = (imageName, sizeType = 'thumb') => {
    const img = getDiseaseImg(imageName, sizeType);
    const key = `${imageName}-${sizeType}`;
    const shouldUseFallback = failedImages.has(key);
    return {
      uri: shouldUseFallback ? img.fallback : img.uri,
      fallback: img.fallback,
    };
  };

  // Disease categories for filtering
  const DISEASE_CATEGORIES = useMemo(
    () => [
      { id: 'all', label: t['filter_all'] || 'All' },
      { id: 'Fungal', label: t['filter_fungal'] || 'Fungal' },
      { id: 'Bacterial', label: t['filter_bacterial'] || 'Bacterial' },
      { id: 'Viral', label: t['filter_viral'] || 'Viral' },
      { id: 'Pest', label: t['filter_pest'] || 'Pest' },
      { id: 'Nutrient', label: t['filter_nutrient'] || 'Nutrient' },
    ],
    [t]
  );

  // Filter diseases based on category and search text
  const filteredDiseases = useMemo(() => {
    const selectedCategory = DISEASE_CATEGORIES[selectedCategoryIdx].id;
    let diseases = filterDiseasesByCategory(selectedCategory);

    if (searchText.trim().length >= 2) {
      diseases = searchDiseases(searchText);
      if (selectedCategory !== 'all') {
        diseases = diseases.filter(d => d.category === selectedCategory);
      }
    }

    return diseases;
  }, [searchText, selectedCategoryIdx, DISEASE_CATEGORIES]);

  const openDiseaseDetail = useCallback((disease) => {
    setSelectedDisease(disease);
    setDetailModalVisible(true);
  }, []);

  const closeDiseaseDetail = useCallback(() => {
    setDetailModalVisible(false);
    setTimeout(() => setSelectedDisease(null), 300);
  }, []);

  // ────────────────────────────────────────
  // LIST ITEM COMPONENT (Enhanced)
  // ────────────────────────────────────────
  const DiseaseListItem = ({ disease }) => {
    const categoryColor = CATEGORY_COLORS[disease.category] || colors.primary;

    return (
      <TouchableOpacity
        style={[styles.listItem, shadow.card]}
        onPress={() => openDiseaseDetail(disease)}
        activeOpacity={0.7}
      >
        {/* Colored category indicator bar */}
        <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />

        {/* Thumbnail image with category badge */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource(disease.name, 'thumb')}
            style={styles.thumbnail}
            onError={() => handleImageError(disease.name, 'thumb')}
          />
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <MaterialCommunityIcons
              name={CATEGORY_ICONS[disease.category] || 'alert-circle'}
              size={12}
              color="#fff"
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.itemContent}>
          <View style={{ flex: 1 }}>
            <Text style={[textStyle.h3(), { marginBottom: sp.xs, color: colors.textPrimary, fontWeight: '600' }]}>
              {disease.name}
            </Text>
            <Text style={[textStyle.bodySmall(), { color: colors.textMuted, marginBottom: sp.sm }]}>
              {disease.pathogen}
            </Text>

            {/* Affects crops - with better display */}
            {disease.affects && disease.affects.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: sp.xs, marginBottom: sp.sm }}>
                <MaterialCommunityIcons name="sprout" size={12} color={colors.accent} />
                <Text style={[textStyle.caption(), { color: '#666', flex: 1 }]}>
                  {disease.affects.slice(0, 2).join(', ')}
                  {disease.affects.length > 2 ? ` +${disease.affects.length - 2}` : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Severity badge - improved */}
          <Badge
            label={disease.severity}
            variant={
              disease.severity === 'High' || disease.severity === 'Severe' ? 'danger' :
              disease.severity === 'Medium' ? 'warning' : 'info'
            }
            size="sm"
          />
        </View>

        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  // ────────────────────────────────────────
  // DETAIL MODAL COMPONENT (Enhanced)
  // ────────────────────────────────────────
  const DiseaseDetailModal = () => {
    if (!selectedDisease) return null;

    const categoryColor = CATEGORY_COLORS[selectedDisease.category] || colors.primary;

    return (
      <Modal visible={detailModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.detailContainer}>
          {/* Header with category color accent */}
          <View style={[styles.detailHeader, { borderBottomColor: categoryColor, borderBottomWidth: 3 }]}>
            <TouchableOpacity onPress={closeDiseaseDetail} hitSlop={10}>
              <Feather name="x" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Badge
                label={selectedDisease.category}
                variant={selectedDisease.category === 'Fungal' ? 'neutral' : selectedDisease.category === 'Bacterial' ? 'danger' : 'info'}
                size="md"
              />
            </View>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.detailScroll}>
            {/* Hero image */}
            <View style={styles.heroImageContainer}>
              <Image
                source={getImageSource(selectedDisease.name, 'hero')}
                style={styles.heroImage}
                onError={() => handleImageError(selectedDisease.name, 'hero')}
              />
              <View style={[styles.heroOverlay, { backgroundColor: categoryColor }]} />
            </View>

            {/* Disease Title & Basics Section */}
            <View style={[styles.section, { paddingHorizontal: sp.lg, paddingTop: sp.lg }]}>
              <Text style={[textStyle.h2(), { marginBottom: sp.md, color: colors.textPrimary, fontWeight: '700' }]}>
                {selectedDisease.name}
              </Text>

              <View style={styles.infoGrid}>
                {/* Category */}
                <View style={[styles.infoCard, { borderLeftColor: categoryColor }]}>
                  <MaterialCommunityIcons name={CATEGORY_ICONS[selectedDisease.category]} size={20} color={categoryColor} />
                  <View style={{ marginLeft: sp.md }}>
                    <Text style={[textStyle.caption(), { color: colors.textMuted }]}>Category</Text>
                    <Text style={[textStyle.body(), { fontWeight: '600', color: colors.textPrimary }]}>
                      {selectedDisease.category}
                    </Text>
                  </View>
                </View>

                {/* Severity */}
                <View style={[styles.infoCard, { borderLeftColor: '#d32f2f' }]}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color="#d32f2f" />
                  <View style={{ marginLeft: sp.md }}>
                    <Text style={[textStyle.caption(), { color: colors.textMuted }]}>Severity</Text>
                    <Text style={[textStyle.body(), { fontWeight: '600', color: colors.textPrimary }]}>
                      {selectedDisease.severity}
                    </Text>
                  </View>
                </View>

                {/* Pathogen */}
                <View style={[styles.infoCard, { borderLeftColor: colors.primary, flex: 0 }]}>
                  <MaterialCommunityIcons name="microscope" size={20} color={colors.primary} />
                  <View style={{ marginLeft: sp.md }}>
                    <Text style={[textStyle.caption(), { color: colors.textMuted }]}>Pathogen</Text>
                    <Text style={[textStyle.bodySmall(), { fontWeight: '600', color: colors.textPrimary, maxWidth: 120 }]}>
                      {selectedDisease.pathogen}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Affected Crops */}
            {selectedDisease.affects && selectedDisease.affects.length > 0 && (
              <View style={[styles.section, { paddingHorizontal: sp.lg }]}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="leaf" size={20} color={colors.accent} />
                  <Text style={[textStyle.h3(), { marginLeft: sp.md, fontWeight: '600', color: colors.textPrimary }]}>
                    Affected Crops
                  </Text>
                </View>
                <View style={styles.cropsContainer}>
                  {selectedDisease.affects.map((crop, idx) => (
                    <View key={idx} style={styles.cropTag}>
                      <Text style={[textStyle.bodySmall(), { color: colors.primary, fontWeight: '500' }]}>
                        {crop}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Symptoms */}
            {selectedDisease.symptoms && selectedDisease.symptoms.length > 0 && (
              <View style={[styles.section, { paddingHorizontal: sp.lg }]}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.primary} />
                  <Text style={[textStyle.h3(), { marginLeft: sp.md, fontWeight: '600', color: colors.textPrimary }]}>
                    Symptoms
                  </Text>
                </View>
                <View style={{ marginTop: sp.md }}>
                  {selectedDisease.symptoms.map((symptom, idx) => (
                    <View key={idx} style={styles.bulletPoint}>
                      <View style={styles.bulletMarker} />
                      <Text style={[textStyle.body(), { flex: 1, color: colors.textPrimary }]}>
                        {symptom}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Treatment */}
            {selectedDisease.treatment && selectedDisease.treatment.length > 0 && (
              <View style={[styles.section, { paddingHorizontal: sp.lg }]}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="spray-bottle" size={20} color={colors.primary} />
                  <Text style={[textStyle.h3(), { marginLeft: sp.md, fontWeight: '600', color: colors.textPrimary }]}>
                    Treatment
                  </Text>
                </View>
                <View style={[styles.contentBox, { borderLeftColor: colors.primary, backgroundColor: '#F8FAFC', marginTop: sp.md }]}>
                  {selectedDisease.treatment.map((treat, idx) => (
                    <View key={idx} style={[styles.bulletPoint, { marginBottom: idx < selectedDisease.treatment.length - 1 ? sp.md : 0 }]}>
                      <MaterialCommunityIcons name="check" size={16} color={colors.primary} />
                      <Text style={[textStyle.body(), { flex: 1, marginLeft: sp.sm, color: colors.textPrimary }]}>
                        {treat}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Prevention */}
            {selectedDisease.prevention && selectedDisease.prevention.length > 0 && (
              <View style={[styles.section, { paddingHorizontal: sp.lg }]}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="shield-check" size={20} color={colors.accent} />
                  <Text style={[textStyle.h3(), { marginLeft: sp.md, fontWeight: '600', color: colors.textPrimary }]}>
                    Prevention
                  </Text>
                </View>
                <View style={[styles.contentBox, { borderLeftColor: colors.accent, backgroundColor: '#F0FDF4', marginTop: sp.md }]}>
                  {selectedDisease.prevention.map((prev, idx) => (
                    <View key={idx} style={[styles.bulletPoint, { marginBottom: idx < selectedDisease.prevention.length - 1 ? sp.md : 0 }]}>
                      <MaterialCommunityIcons name="check" size={16} color={colors.accent} />
                      <Text style={[textStyle.body(), { flex: 1, marginLeft: sp.sm, color: colors.textPrimary }]}>
                        {prev}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Dosage */}
            {selectedDisease.dosage && (
              <View style={[styles.section, { paddingHorizontal: sp.lg, marginBottom: sp.xl }]}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="flask-outline" size={20} color="#8B4513" />
                  <Text style={[textStyle.h3(), { marginLeft: sp.md, fontWeight: '600', color: colors.textPrimary }]}>
                    Dosage & Application
                  </Text>
                </View>
                <View style={[styles.contentBox, { borderLeftColor: '#8B4513', backgroundColor: '#FFF8DC', marginTop: sp.md }]}>
                  <Text style={[textStyle.body(), { color: colors.textPrimary, lineHeight: 24 }]}>
                    {selectedDisease.dosage}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surfaceAlt }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surfaceAlt} />

      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: sp.lg, paddingVertical: sp.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={textStyle.h1()}>{t['screen_library_title'] || 'Disease Library'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, { paddingHorizontal: sp.lg, paddingVertical: sp.md }]}>
        <Feather name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t['placeholder_search_disease'] || 'Search diseases...'}
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Feather name="x" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category filter */}
      <View style={{ marginBottom: sp.lg, paddingHorizontal: 0 }}>
        <ChipFilterRow
          items={DISEASE_CATEGORIES.map(c => c.label)}
          selectedIdx={selectedCategoryIdx}
          onSelect={setSelectedCategoryIdx}
          containerStyle={{ paddingHorizontal: sp.lg }}
        />
      </View>

      {/* Diseases list */}
      {filteredDiseases.length > 0 ? (
        <FlatList
          data={filteredDiseases}
          keyExtractor={item => item.id || item.name}
          renderItem={({ item }) => <DiseaseListItem disease={item} />}
          contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: sp.xl }}
          scrollEnabled
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="alert-circle"
            title={t['emptylibrary_title'] || 'No diseases found'}
            description={t['emptylibrary_desc'] || 'Try searching with a different term'}
          />
        </View>
      )}

      {/* Detail modal */}
      <DiseaseDetailModal />
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STYLES (Enhanced)
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: '#eee',
    marginHorizontal: spacing.lg,
  },
  searchIcon: {
    marginRight: spacing.md,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: colors.textPrimary,
    outlineStyle: 'none',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  // Enhanced list item styles
  listItem: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryBar: {
    width: 4,
    height: '100%',
  },
  imageContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
    backgroundColor: '#f0f0f0',
  },
  categoryBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
  },

  // Detail modal styles (Enhanced)
  detailContainer: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  detailScroll: {
    flex: 1,
  },
  heroImageContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.1,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoGrid: {
    gap: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cropTag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  bulletMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 8,
    flexShrink: 0,
  },
  contentBox: {
    padding: spacing.lg,
    borderRadius: radius.md,
    borderLeftWidth: 4,
  },
});
