/**
 * FarmPassport.js — Digital Farm Passport (Phase 10)
 * Comprehensive farm data management + biometric security
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, StatusBar, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLang } from '../context/LanguageContext';
import { colors, spacing, radius, textStyle } from '../theme/tokens';
import { useResponsive } from '../theme/responsive';
import { AIButton, Badge, StatBox } from '../components/ui';

// Mock farm data
const FARM_RECORDS = [
  {
    id: 1,
    crop: 'Tomato',
    season: 'Kharif 2024',
    sowDate: 'Jun 15, 2024',
    harvestDate: 'Oct 10, 2024',
    yield: '35 tons/ha',
    status: 'Completed',
    diseases: 'Early Blight',
  },
  {
    id: 2,
    crop: 'Rice',
    season: 'Kharif 2024',
    sowDate: 'Jun 20, 2024',
    harvestDate: 'Nov 5, 2024',
    yield: '60 bags/ha',
    status: 'Completed',
    diseases: 'None',
  },
  {
    id: 3,
    crop: 'Wheat',
    season: 'Rabi 2024',
    sowDate: 'Dec 1, 2024',
    harvestDate: 'Apr 10, 2025',
    yield: 'In progress',
    status: 'Active',
    diseases: 'Monitor for rust',
  },
];

function RecordCard({ record, onPress }) {
  const getStatusBadgeColor = (status) => {
    return status === 'Active' ? 'success' : 'info';
  };

  return (
    <TouchableOpacity
      style={[styles.recordCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.recordHeader}>
        <View style={{ flex: 1 }}>
          <Text style={textStyle.h3()}>{record.crop}</Text>
          <Text style={[textStyle.bodySmall(), { marginTop: spacing.xs, color: colors.textMuted }]}>
            {record.season}
          </Text>
        </View>
        <Badge label={record.status} variant={getStatusBadgeColor(record.status)} />
      </View>

      <View style={[styles.recordInfo, { marginTop: spacing.md, gap: spacing.md }]}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar-range" size={16} color={colors.primary} />
          <Text style={[textStyle.bodySmall(), { marginLeft: spacing.sm }]}>
            {record.sowDate} → {record.harvestDate}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="sprout" size={16} color={colors.primary} />
          <Text style={[textStyle.bodySmall(), { marginLeft: spacing.sm }]}>
            Yield: {record.yield}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RecordDetailsModal({ visible, record, onClose, spacing: sp }) {
  if (!record) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.surfaceAlt }]}>
        <View style={[styles.modalHeader, { paddingHorizontal: sp.md, paddingVertical: sp.md }]}>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={textStyle.h2()}>Farm Record</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={[styles.modalScroll, { paddingHorizontal: sp.md }]}
          contentContainerStyle={{ paddingVertical: sp.md }}
        >
          {/* Main info */}
          <View style={[styles.infoCard, { paddingHorizontal: sp.md, paddingVertical: sp.md }]}>
            <Text style={[textStyle.h3(), { marginBottom: sp.sm }]}>{record.crop}</Text>
            <Text style={[textStyle.bodySmall(), { color: colors.textMuted }]}>{record.season}</Text>
          </View>

          {/* Details */}
          <View style={[styles.section, { marginTop: sp.lg }]}>
            <Text style={[textStyle.h3(), { marginBottom: sp.md }]}>Crop Details</Text>

            <View style={[styles.detailItem, { paddingVertical: sp.md }]}>
              <View style={styles.detailLabel}>
                <Feather name="calendar" size={16} color={colors.primary} />
                <Text style={[textStyle.bodySmall(), { marginLeft: sp.sm }]}>Sow Date</Text>
              </View>
              <Text style={[textStyle.body(), { fontWeight: '700' }]}>{record.sowDate}</Text>
            </View>

            <View
              style={[
                styles.detailItem,
                { paddingVertical: sp.md, borderTopWidth: 1, borderTopColor: colors.border },
              ]}
            >
              <View style={styles.detailLabel}>
                <Feather name="calendar" size={16} color={colors.primary} />
                <Text style={[textStyle.bodySmall(), { marginLeft: sp.sm }]}>Harvest Date</Text>
              </View>
              <Text style={[textStyle.body(), { fontWeight: '700' }]}>{record.harvestDate}</Text>
            </View>

            <View
              style={[
                styles.detailItem,
                { paddingVertical: sp.md, borderTopWidth: 1, borderTopColor: colors.border },
              ]}
            >
              <View style={styles.detailLabel}>
                <Feather name="trending-up" size={16} color={colors.primary} />
                <Text style={[textStyle.bodySmall(), { marginLeft: sp.sm }]}>Yield</Text>
              </View>
              <Text style={[textStyle.body(), { fontWeight: '700', color: colors.accent }]}>
                {record.yield}
              </Text>
            </View>

            <View
              style={[
                styles.detailItem,
                { paddingVertical: sp.md, borderTopWidth: 1, borderTopColor: colors.border },
              ]}
            >
              <View style={styles.detailLabel}>
                <MaterialCommunityIcons name="alert-circle" size={16} color={colors.warning} />
                <Text style={[textStyle.bodySmall(), { marginLeft: sp.sm }]}>Disease Alerts</Text>
              </View>
              <Text style={[textStyle.body(), { fontWeight: '700' }]}>{record.diseases}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.section, { marginTop: sp.lg, marginBottom: sp.xl }]}>
            <AIButton
              label="Edit Record"
              icon="edit"
              onPress={() => {/* Handle edit */}}
              variant="ghost"
              style={{ marginBottom: spacing.sm }}
            />

            <AIButton
              label="Delete Record"
              icon="trash-2"
              onPress={() => {/* Handle delete */}}
              variant="danger"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function FarmPassport({ navigation }) {
  const { t, lang } = useLang();
  const { spacing: sp } = useResponsive();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surfaceAlt }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surfaceAlt} />

      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: sp.md, paddingVertical: sp.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={textStyle.h2()}>{t['screen_farm_passport'] || 'Farm Passport'}</Text>
        <TouchableOpacity hitSlop={10}>
          <Feather name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary stats with StatBox */}
      <View style={[styles.statsContainer, { marginHorizontal: sp.md, marginBottom: sp.lg }]}>
        <StatBox
          label={t['total_records'] || 'Total Records'}
          value={FARM_RECORDS.length}
          unit=""
          color={colors.primary}
        />
        <StatBox
          label={t['active_crops'] || 'Active Crops'}
          value={FARM_RECORDS.filter((r) => r.status === 'Active').length}
          unit=""
          color={colors.accent}
        />
      </View>

      {/* Records list */}
      <FlatList
        data={FARM_RECORDS}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecordCard
            record={item}
            onPress={() => {
              setSelectedRecord(item);
              setModalVisible(true);
            }}
          />
        )}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: sp.md, paddingBottom: sp.xl },
        ]}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />

      {/* Record details modal */}
      <RecordDetailsModal
        visible={modalVisible}
        record={selectedRecord}
        onClose={() => setModalVisible(false)}
        spacing={{ xs: sp.xs, sm: sp.sm, md: sp.md, lg: sp.lg }}
      />
    </SafeAreaView>
  );
}

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
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordInfo: {
    flexDirection: 'column',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalScroll: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  section: {
    marginHorizontal: 0,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
});
