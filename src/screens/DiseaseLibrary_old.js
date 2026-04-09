/**
 * DiseaseLibrary.js — Disease Reference Library
 * Complete disease database with images, symptoms, treatment, and prevention
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
} from '../../assets/cropLibraryImages';

export default function DiseaseLibrary({ navigation }) {
  const { t } = useLang();
  const { spacing: sp } = useResponsive();

  const [searchText, setSearchText] = useState('');
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

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

  const openDiseaseDetail = useCallback(disease => {
    setSelectedDisease(disease);
    setDetailModalVisible(true);
  }, []);

  const closeDiseaseDetail = useCallback(() => {
    setDetailModalVisible(false);
    setTimeout(() => setSelectedDisease(null), 300);
  }, []);

  // LIST ITEM COMPONENT
  const DiseaseListItem = ({ disease }) => {
    const thumbImg = getDiseaseImg(disease.name, 'thumb');

    return (
      <TouchableOpacity
        style={[styles.listItem, shadow.card]}
        onPress={() => openDiseaseDetail(disease)}
        activeOpacity={0.7}
      >
        {/* Thumbnail image */}
        <Image
          source={{ uri: thumbImg.uri }}
          style={styles.thumbnail}
          onError={() => {
            // Fallback to picsum
          }}
        />

        {/* Content */}
        <View style={styles.itemContent}>
          <View style={{ flex: 1 }}>
            <Text style={[textStyle.h3(), { marginBottom: sp.xs, color: colors.textPrimary }]}>
              {disease.name}
            </Text>
            <Text style={[textStyle.bodySmall(), { color: colors.textMuted, marginBottom: sp.sm }]}>
              {disease.pathogen}
            </Text>

            {/* Affects crops */}
            {disease.affects && disease.affects.length > 0 && (
              <Text style={[textStyle.caption(), { color: '#666', marginBottom: sp.xs }]}>
                Affects: {disease.affects.slice(0, 3).join(', ')}
                {disease.affects.length > 3 ? '...' : ''}
              </Text>
            )}
          </View>

          {/* Severity badge */}
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

  // DETAIL MODAL COMPONENT
  const DiseaseDetailModal = () => {
    if (!selectedDisease) return null;

    const heroImg = getDiseaseImg(selectedDisease.name, 'hero');

    return (
      <Modal visible={detailModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.detailContainer}>
          {/* Header */}
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={closeDiseaseDetail} hitSlop={10}>
              <Feather name="x" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={textStyle.h2()} numberOfLines={2}>
              {selectedDisease.name}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.detailScroll}>
            {/* Hero image */}
            <Image
              source={{ uri: heroImg.uri }}
              style={styles.heroImage}
              onError={() => {}}
            />

            {/* Disease basics */}
            <View style={[styles.section, { paddingHorizontal: sp.lg }]}>
              <View style={styles.basicInfoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[textStyle.caption(), { color: colors.textMuted, marginBottom: sp.xs }]}>
                    Category
                  </Text>
                  <Badge label={selectedDisease.category} size="sm" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[textStyle.caption(), { color: colors.textMuted, marginBottom: sp.xs }]}>
                    Severity
                  </Text>
                  <Badge
                    label={selectedDisease.severity}
                    variant={
                      selectedDisease.severity === 'High' || selectedDisease.severity === 'Severe' ? 'danger' :
                      selectedDisease.severity === 'Medium' ? 'warning' : 'info'
                    }
                    size="sm"
                  />
                </View>
              </View>
            </View>

            {/* Pathogen */}
            <View style={[styles.section, { paddingHorizontal: sp.lg }]}>
              <Text style={[textStyle.h3(), { marginBottom: sp.md, fontWeight: '600' }]}>
                Pathogen
              </Text>
              <Text style={[textStyle.body(), { color: colors.textPrimary, lineHeight: 22 }]}>
                {selectedDisease.pathogen}
              </Text>
            </View>

            {/* Affects */}
            {selectedDisease.affects && selectedDisease.affects.length > 0 && (
              <View style={[styles.section, { paddingHorizontal: sp.lg }]}>
                <Text style={[textStyle.h3(), { marginBottom: sp.md, fontWeight: '600' }]}>
                  Affects
                </Text>
                <View style={styles.affectsList}>
                  {selectedDisease.affects.map((crop, idx) => (
                    <Badge key={idx} label={crop} size="sm" />
                  ))}
                </View>
              </View>
            )}

            {/* Symptoms */}
            {selectedDisease.symptoms && selectedDisease.symptoms.length > 0 && (
              <View style={[styles.section, { paddingHorizontal: sp.lg }]}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color={colors.primary} />
                  <Text style={[textStyle.h3(), { marginLeft: sp.md, fontWeight: '600' }]}>
                    Symptoms
                  </Text>
                </View>
                <View style={{ marginTop: sp.md }}>
                  {selectedDisease.symptoms.map((symptom, idx) => (
                    <View key={idx} style={styles.bulletPoint}>
                      <View style={styles.bullet} />
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
                  <MaterialCommunityIcons name="spray-bottle" size={20} color={colors.accent} />
                  <Text style={[textStyle.h3(), { marginLeft: sp.md, fontWeight: '600' }]}>
                    Treatment Plan
                  </Text>
                </View>
                <View style={styles.treatmentBox}>
                  {selectedDisease.treatment.map((treat, idx) => (
                    <View key={idx} style={styles.bulletPoint}>
                      <View style={[styles.bullet, { backgroundColor: colors.accent }]} />
                      <Text style={[textStyle.body(), { flex: 1, color: colors.textPrimary }]}>
                        {treat}
                      </Text>
                    </View>
                  ))}
                </View>
                {selectedDisease.dosage && (
                  <View style={[styles.dosageBox, { marginTop: sp.md }]}>
                    <Text style={[textStyle.caption(), { color: '#666', marginBottom: sp.sm }]}>
                      DOSAGE & APPLICATION
                    </Text>
                    <Text style={[textStyle.body(), { color: colors.textPrimary, lineHeight: 22 }]}>
                      {selectedDisease.dosage}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Prevention */}
            {selectedDisease.prevention && selectedDisease.prevention.length > 0 && (
              <View style={[styles.section, { paddingHorizontal: sp.lg, marginBottom: sp.xl }]}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="shield-check" size={20} color={colors.primary} />
                  <Text style={[textStyle.h3(), { marginLeft: sp.md, fontWeight: '600' }]}>
                    Prevention
                  </Text>
                </View>
                <View style={{ marginTop: sp.md }}>
                  {selectedDisease.prevention.map((prev, idx) => (
                    <View key={idx} style={styles.bulletPoint}>
                      <MaterialCommunityIcons name="check" size={16} color={colors.primary} />
                      <Text style={[textStyle.body(), { flex: 1, marginLeft: sp.sm, color: colors.textPrimary }]}>
                        {prev}
                      </Text>
                    </View>
                  ))}
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
//  STYLES
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

  // List item styles
  listItem: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: '#f0f0f0',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Detail modal styles
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailScroll: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#f0f0f0',
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  basicInfoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 7,
    flexShrink: 0,
  },
  affectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  treatmentBox: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  dosageBox: {
    backgroundColor: '#F0FDF4',
    padding: spacing.lg,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
});

