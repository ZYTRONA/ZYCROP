/**
 * Pathologist.js — AI-Powered Crop Disease Detection [UPDATED]
 * Integrated with YOLOv8 + Custom TFLite backend
 * UPDATED: Now displays detailed disease info including cause, symptoms, prevention, treatment
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpoCamera from 'expo-camera';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useLang } from '../context/LanguageContext';
import { colors, spacing, radius, textStyle } from '../theme/tokens';
import { useResponsive } from '../theme/responsive';
import { speakScanInstruction, speakAnalyzing, speakDiseaseResult } from '../services/voiceService';
import { AIButton, ChipFilterRow, Badge } from '../components/ui';
import { BACKEND_API_URL } from '../config';

// ─── Crop categories ──────────────────────────────────────────
const CROPS = [
  'All Crops', 'Apple', 'Blueberry', 'Cherry', 'Corn', 'Grape', 'Orange', 'Peach', 
  'Pepper', 'Potato', 'Raspberry', 'Soybean', 'Squash', 'Strawberry', 'Tomato'
];

// ─── Updated Disease Result Modal Component ────────────────────────────────────
// UPDATED: Now displays detailed disease info with tabs for cause, symptoms, prevention, treatment
function DiseaseResultModal({ visible, disease, onClose, t }) {
  const { spacing: sp } = useResponsive();
  const [activeTab, setActiveTab] = useState('about'); // about, cause, symptoms, prevention, treatment

  if (!disease) return null;

  // Determine severity color
  const severityColor = disease.severity === 'severe' ? '#d32f2f' :
                        disease.severity === 'high' ? '#e65100' :
                        disease.severity === 'moderate' ? '#f57c00' : '#fbc02d';

  // UPDATED: Get disease info from API response
  const diseaseInfo = disease.disease_info || {};
  const isHealthy = disease.disease && disease.disease.toLowerCase().includes('healthy');

  // Tabs for detailed information
  const tabs = [
    { id: 'about', label: 'About', icon: 'information' },
    { id: 'cause', label: 'Cause', icon: 'virus', show: !isHealthy && diseaseInfo.cause },
    { id: 'symptoms', label: 'Symptoms', icon: 'clipboard-list', show: !isHealthy && diseaseInfo.symptoms },
    { id: 'prevention', label: 'Prevention', icon: 'shield-check', show: !isHealthy && diseaseInfo.prevention },
    { id: 'treatment', label: 'Treatment', icon: 'spray-bottle', show: !isHealthy && diseaseInfo.treatment },
  ].filter(tab => tab.show !== false);

  // UPDATED: TTS for disease info - read disease name + cause summary + first prevention tip
  useEffect(() => {
    if (visible && !isHealthy) {
      const ttsText = [
        disease.disease || 'Disease Detected',
        diseaseInfo.cause ? diseaseInfo.cause.substring(0, 100) + '...' : '',
        diseaseInfo.prevention && diseaseInfo.prevention[0] ? 'Prevention: ' + diseaseInfo.prevention[0] : ''
      ].filter(t => t).join('. ');
      
      if (ttsText && speakDiseaseResult) {
        speakDiseaseResult(ttsText).catch(console.error);
      }
    }
  }, [visible, disease]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View style={[styles.tabContent, { paddingHorizontal: sp.md }]}>
            <View style={[styles.infoBox, { backgroundColor: '#F8F9FA', borderLeftColor: severityColor }]}>
              {diseaseInfo.scientific_name && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Scientific Name:</Text>
                  <Text style={styles.infoValue}>{diseaseInfo.scientific_name}</Text>
                </View>
              )}
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Affected Part:</Text>
                <Text style={styles.infoValue}>{diseaseInfo.affected_plant_part || 'Various plant parts'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Severity Level:</Text>
                <View style={styles.severityBadgeContainer}>
                  <Badge 
                    label={diseaseInfo.severity || disease.severity || 'Unknown'} 
                    variant={diseaseInfo.severity === 'severe' ? 'danger' : 
                             diseaseInfo.severity === 'high' ? 'warning' : 'info'}
                    size="md" 
                  />
                </View>
              </View>
            </View>

            {/* Confidence Bar */}
            <View style={[styles.confidenceSection, { marginTop: sp.lg }]}>
              <View style={styles.confidenceHeader}>
                <Text style={[textStyle.bodySmall(), { fontWeight: '600' }]}>Detection Confidence</Text>
                <Text style={[textStyle.bodySmall(), { fontWeight: '700', color: severityColor }]}>
                  {Math.round((disease.confidence || 0) * 100)}%
                </Text>
              </View>
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill, 
                    { 
                      width: `${Math.round((disease.confidence || 0) * 100)}%`,
                      backgroundColor: severityColor 
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        );

      case 'cause':
        return (
          <View style={[styles.tabContent, { paddingHorizontal: sp.md }]}>
            <View style={[styles.card, { backgroundColor: '#FFFFFF', borderLeftColor: '#1976d2', borderLeftWidth: 4 }]}>
              <Text style={[textStyle.body(), { color: colors.textPrimary, lineHeight: 24 }]}>
                {diseaseInfo.cause || 'No cause information available'}
              </Text>
            </View>
          </View>
        );

      case 'symptoms':
        return (
          <View style={[styles.tabContent, { paddingHorizontal: sp.md }]}>
            <View style={[styles.card, { backgroundColor: '#FFFFFF', borderLeftColor: '#f57c00', borderLeftWidth: 4 }]}>
              <Text style={[textStyle.body(), { color: colors.textPrimary, lineHeight: 24 }]}>
                {diseaseInfo.symptoms || 'No symptom information available'}
              </Text>
            </View>
          </View>
        );

      case 'prevention':
        return (
          <View style={[styles.tabContent, { paddingHorizontal: sp.md }]}>
            <View style={[styles.card, { backgroundColor: '#F0FDF4', borderLeftColor: colors.accent, borderLeftWidth: 4 }]}>
              {(diseaseInfo.prevention || []).length > 0 ? (
                diseaseInfo.prevention.map((item, idx) => (
                  <View key={idx} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={[textStyle.body(), { color: colors.textPrimary, lineHeight: 22, flex: 1 }]}>
                      {item}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[textStyle.body(), { color: colors.textPrimary }]}>
                  No prevention measures available
                </Text>
              )}
            </View>
          </View>
        );

      case 'treatment':
        return (
          <View style={[styles.tabContent, { paddingHorizontal: sp.md }]}>
            <View style={[styles.card, { backgroundColor: '#FFF3E0', borderLeftColor: '#d32f2f', borderLeftWidth: 4 }]}>
              {(diseaseInfo.treatment || []).length > 0 ? (
                diseaseInfo.treatment.map((item, idx) => (
                  <View key={idx} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={[textStyle.body(), { color: colors.textPrimary, lineHeight: 22, flex: 1 }]}>
                      {item}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[textStyle.body(), { color: colors.textPrimary }]}>
                  No treatment information available
                </Text>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={[styles.modalHeader, { paddingHorizontal: sp.md }]}>
          <Text style={textStyle.h2()}>
            {isHealthy ? '✓ Plant Appears Healthy' : 'Disease Detected'}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Feather name="x" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          {/* Captured Image */}
          {disease.capturedImage && (
            <View style={styles.diseaseImageContainer}>
              <Image
                source={{ uri: disease.capturedImage }}
                style={styles.diseaseImage}
              />
            </View>
          )}

          {/* Disease Title Card */}
          <View style={[styles.diseaseCard, { marginHorizontal: sp.md, borderLeftColor: severityColor, borderLeftWidth: 4 }]}>
            <View style={styles.diseaseCardContent}>
              <Text style={[textStyle.h2(), { color: '#1A1A1A', fontWeight: '700', marginBottom: sp.sm }]}>
                {disease.disease || 'Unknown Disease'}
              </Text>
              
              {!isHealthy && diseaseInfo.scientific_name && (
                <Text style={[textStyle.bodySmall(), { color: '#666', marginBottom: sp.sm, fontStyle: 'italic' }]}>
                  {diseaseInfo.scientific_name}
                </Text>
              )}

              {disease.crop && (
                <Text style={[textStyle.bodySmall(), { color: '#666', marginBottom: sp.md, fontWeight: '500' }]}>
                  🌱 Crop: {disease.crop}
                </Text>
              )}

              {/* Severity Badge + Confidence Inline */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                {!isHealthy && diseaseInfo.severity && (
                  <Badge 
                    label={diseaseInfo.severity.charAt(0).toUpperCase() + diseaseInfo.severity.slice(1)} 
                    variant={diseaseInfo.severity === 'severe' ? 'danger' : 
                             diseaseInfo.severity === 'high' ? 'warning' : 
                             diseaseInfo.severity === 'moderate' ? 'warning' : 'info'}
                    size="md" 
                  />
                )}
                <Text style={[textStyle.bodySmall(), { fontWeight: '700', color: severityColor }]}>
                  {Math.round((disease.confidence || 0) * 100)}% Confidence
                </Text>
              </View>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
              {tabs.map(tab => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTab === tab.id && styles.tabActive
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={20}
                    color={activeTab === tab.id ? colors.primary : '#999'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[
                    styles.tabLabel,
                    activeTab === tab.id && styles.tabLabelActive
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tab Content */}
          {renderTabContent()}

          <View style={{ height: sp.xl }} />
        </ScrollView>

        {/* Modal Footer */}
        <View style={styles.modalFooter}>
          <AIButton
            label={t['btn_close'] || 'Close'}
            onPress={onClose}
            variant="primary"
            style={{ flex: 1 }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Camera Screen Component ────────────────────────────────────
function CameraScreen({ onClose, selectedCrop, onDetectDisease }) {
  const [permission, requestPermission] = ExpoCamera.useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission, requestPermission]);

  const handleCapture = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert('Error', 'Camera not ready');
        return;
      }

      setAnalyzing(true);
      await speakAnalyzing?.();

      // Capture photo from camera with high quality for backend analysis
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        exif: false,
      });

      // Prepare FormData for multipart upload
      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'leaf_photo.jpg',
      });
      formData.append('farmer_id', 'MOBILE_USER');
      formData.append('analyze_all', 'true');

      // Call backend detection API
      const response = await fetch(`${BACKEND_API_URL}/api/diagnose`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API Error: ${response.status}`);
      }

      const result = await response.json();

      // UPDATED: Build disease object with complete API response
      let detectedDisease = null;

      if (result.primary_disease && result.primary_confidence >= 0.3) {
        // Check if healthy
        const isHealthy = result.primary_disease && result.primary_disease.toLowerCase().includes('healthy');

        detectedDisease = {
          id: result.primary_disease.toLowerCase().replace(/\s+/g, '_'),
          disease: result.primary_disease,
          pathogen: result.disease_info?.scientific_name || 'AI Detected',
          severity: result.disease_info?.severity || 
                   (result.primary_confidence >= 0.8 ? 'high' : 
                    result.primary_confidence >= 0.6 ? 'moderate' : 'mild'),
          confidence: result.primary_confidence,
          color: result.primary_confidence >= 0.8 ? '#d32f2f' :
                 result.primary_confidence >= 0.6 ? '#f57c00' : '#fbc02d',
          crop: selectedCrop !== 'All Crops' ? selectedCrop : 'Unknown',
          capturedImage: photo.uri,
          // UPDATED: Store complete disease info from API
          disease_info: result.disease_info || {
            cause: 'AI Detection Result',
            symptoms: 'See detailed analysis',
            prevention: [],
            treatment: [],
            severity: 'unknown',
            affected_plant_part: 'Detected by AI'
          },
          // Store backend response data
          backendData: result,
        };

        // UPDATED: Handle healthy plant case
        if (isHealthy) {
          detectedDisease.disease_info = {
            cause: 'No disease detected',
            symptoms: 'Plant appears healthy with no visible disease symptoms',
            prevention: ['Continue regular monitoring', 'Maintain good irrigation practices', 'Apply preventive fungicide if needed'],
            treatment: ['No treatment required'],
            severity: 'none',
            affected_plant_part: 'none'
          };
        }
      } else if (result.detections_found > 0) {
        // Fallback: Use first detected leaf's disease info
        const firstLeaf = result.leaves[0];
        if (firstLeaf && firstLeaf.disease) {
          detectedDisease = {
            id: firstLeaf.disease.disease.toLowerCase().replace(/\s+/g, '_'),
            disease: firstLeaf.disease.disease,
            pathogen: firstLeaf.disease.disease_info?.scientific_name || 'AI Detected',
            severity: firstLeaf.disease.disease_info?.severity || 
                     (firstLeaf.composite_confidence >= 0.8 ? 'high' :
                      firstLeaf.composite_confidence >= 0.6 ? 'moderate' : 'mild'),
            confidence: firstLeaf.composite_confidence,
            color: firstLeaf.composite_confidence >= 0.8 ? '#d32f2f' :
                   firstLeaf.composite_confidence >= 0.6 ? '#f57c00' : '#fbc02d',
            crop: selectedCrop !== 'All Crops' ? selectedCrop : 'Unknown',
            capturedImage: photo.uri,
            // UPDATED: Use disease info from API
            disease_info: firstLeaf.disease.disease_info || {
              cause: 'AI Detection Result',
              symptoms: 'See detailed analysis',
              prevention: [],
              treatment: [],
              severity: 'unknown',
              affected_plant_part: 'Detected by AI'
            },
            backendData: result,
          };
        }
      }

      if (detectedDisease) {
        onDetectDisease(detectedDisease);
      } else {
        // No disease detected, show alert
        Alert.alert(
          'Unable to Detect Disease',
          `Leaves detected: ${result.detections_found}\n\nPlease try:\n• Clearer image\n• Better lighting\n• Position leaf in center`
        );
      }

      onClose(); // Close camera after detection
    } catch (error) {
      console.error('Capture error:', error);
      
      // Check if it's a network error
      if (error.message.includes('Network') || error.message.includes('timeout')) {
        Alert.alert(
          'Backend Unavailable',
          'AI detection requires backend connection.\n\nMake sure:\n1. Backend server is running\n2. BACKEND_API_URL in config.js is correct\n3. Network is available'
        );
      } else {
        Alert.alert('Detection Error', error.message || 'Failed to analyze image');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <MaterialCommunityIcons name="camera-off" size={64} color={colors.primary} />
        <Text style={[textStyle.h2(), { marginTop: spacing.lg, marginBottom: spacing.md, textAlign: 'center' }]}>
          Camera Permission Required
        </Text>
        <Text style={[textStyle.body(), { marginBottom: spacing.lg, textAlign: 'center', color: colors.textMuted }]}>
          Please enable camera access to scan leaves
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={() => requestPermission()}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={{ marginTop: spacing.lg }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.cameraScreenWrapper}>
      {/* Live Camera Feed */}
      <ExpoCamera.CameraView
        style={styles.cameraView}
        ref={cameraRef}
        facing="back"
      />

      {/* Top Bar */}
      <View style={styles.cameraTopBar}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.cameraTitle}>Scan Leaf</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Center Guide Frame */}
      <View style={styles.guidFrameContainer}>
        <View style={styles.guideFrame}>
          {analyzing && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Analyzing...</Text>
            </View>
          )}
        </View>
        <Text style={styles.guideText}>Position leaf in frame</Text>
      </View>

      {/* Bottom Bar with Scan Button */}
      <View style={styles.cameraBottomBar}>
        <TouchableOpacity
          style={[styles.captureBtn, analyzing && styles.captureBtnDisabled]}
          onPress={handleCapture}
          disabled={analyzing}
        >
          <MaterialCommunityIcons
            name={analyzing ? 'loading' : 'camera'}
            size={28}
            color="#fff"
          />
          <Text style={styles.captureBtnText}>
            {analyzing ? 'Analyzing...' : 'Scan Leaf'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Main Pathologist Screen ────────────────────────────────────
export default function Pathologist({ navigation }) {
  const { t } = useLang();
  const { spacing: sp } = useResponsive();

  const [selectedCropIdx, setSelectedCropIdx] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [detectedDisease, setDetectedDisease] = useState(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);

  if (showCamera) {
    return (
      <CameraScreen
        onClose={() => setShowCamera(false)}
        selectedCrop={CROPS[selectedCropIdx]}
        onDetectDisease={(disease) => {
          setDetectedDisease(disease);
          setResultModalVisible(true);
          setShowCamera(false);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surfaceAlt} />

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View style={styles.mainHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={textStyle.h1()}>AI Disease Scan</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Crop Selector */}
        <View style={styles.cropSelectorSection}>
          <Text style={[textStyle.body(), { marginBottom: sp.sm, marginLeft: sp.md, fontWeight: '600' }]}>
            Select Crop
          </Text>
          <ChipFilterRow
            items={CROPS}
            selectedIdx={selectedCropIdx}
            onSelect={setSelectedCropIdx}
            scrollEnabled
          />
        </View>

        {/* Scan Button */}
        <View style={[styles.scanButtonContainer, { marginHorizontal: sp.md, marginTop: sp.lg }]}>
          <AIButton
            label="📷 Start Disease Scan"
            onPress={() => setShowCamera(true)}
            variant="primary"
            style={{ width: '100%' }}
          />
        </View>

        {/* Info Section */}
        <View style={[styles.infoSection, { marginHorizontal: sp.md, marginTop: sp.xl }]}>
          <Text style={[textStyle.h3(), { marginBottom: sp.md, fontWeight: '700' }]}>How It Works</Text>
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[textStyle.body(), { fontWeight: '600', marginBottom: 4 }]}>Capture Clear Image</Text>
              <Text style={[textStyle.bodySmall(), { color: '#666' }]}>Position affected leaf in center with good lighting</Text>
            </View>
          </View>
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[textStyle.body(), { fontWeight: '600', marginBottom: 4 }]}>AI Analysis</Text>
              <Text style={[textStyle.bodySmall(), { color: '#666' }]}>Model analyzes image and detects disease patterns</Text>
            </View>
          </View>
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[textStyle.body(), { fontWeight: '600', marginBottom: 4 }]}>Get Treatment</Text>
              <Text style={[textStyle.bodySmall(), { color: '#666' }]}>Receive detailed diagnosis and treatment options</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Disease Result Modal */}
      <DiseaseResultModal
        visible={resultModalVisible}
        disease={detectedDisease}
        onClose={() => {
          setResultModalVisible(false);
          setDetectedDisease(null);
        }}
        t={t}
      />
    </SafeAreaView>
  );
}

// ─── StyleSheet ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Main Screen
  mainContainer: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  cropSelectorSection: {
    marginTop: spacing.lg,
  },
  scanButtonContainer: {
    marginTop: spacing.xl,
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  modalScroll: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  modalFooter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  diseaseImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
    marginBottom: spacing.md,
  },
  diseaseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  diseaseCard: {
    backgroundColor: '#fff',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  diseaseCardContent: {
    flex: 1,
  },

  // Tabs
  tabsContainer: {
    marginVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tabScroll: {
    paddingHorizontal: spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginRight: spacing.md,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabLabelActive: {
    color: colors.primary,
  },
  tabContent: {
    paddingVertical: spacing.md,
    minHeight: 200,
  },

  // Content
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  infoBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
  },
  infoItem: {
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoValue: {
    color: '#666',
    lineHeight: 20,
  },
  severityBadgeContainer: {
    marginTop: spacing.sm,
  },

  // Confidence
  confidenceSection: {
    marginBottom: spacing.md,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Bullet lists
  bulletItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: spacing.sm,
    color: '#666',
  },

  // Camera
  cameraScreenWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraView: {
    flex: 1,
  },
  cameraTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  backBtn: {
    padding: spacing.sm,
  },
  cameraBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureBtnDisabled: {
    opacity: 0.6,
  },
  captureBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  guidFrameContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: '70%',
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
  },
  guideText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.lg,
  },
  loadingText: {
    color: '#fff',
    marginTop: spacing.md,
    fontWeight: '600',
  },
  permissionScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceAlt,
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    width: '100%',
    alignItems: 'center',
  },
});
