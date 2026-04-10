/**
 * VoiceChatBubble.js — Chat Bubble with Voice Readout Button
 * =========================================================
 * Displays a chat message with optional "speak" button
 * Used in: LoanAdvisor, Pathologist, custom chat screens
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { colors, spacing, radius, textStyle } from '../../theme/tokens';

const LANG_LOCALE = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ml: 'ml-IN',
};

export const VoiceChatBubble = ({
  role = 'ai', // 'user' | 'ai'
  text = '',
  lang = 'en',
  enableVoice = true, // User can disable voice per session
  onSpeak, // Optional callback after speak
  formatText = null, // Optional custom text formatter
}) => {
  const isUser = role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Clean text for TTS (remove markdown, special chars)
  const cleanTextForSpeech = (rawText) => {
    return rawText
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\n/g, ' ') // Convert newlines to spaces
      .replace(/•/g, 'bullet') // Replace bullets
      .replace(/[^\w\s।।₹\-]/g, '') // Keep only alphanumeric + ₹ and dash
      .trim();
  };

  const handleSpeak = async () => {
    try {
      // Stop current speech if any
      await Speech.stop();
      setIsSpeaking(true);

      const cleanText = cleanTextForSpeech(text);
      if (!cleanText) {
        setIsSpeaking(false);
        return;
      }

      // Speak with language-specific settings
      await Speech.speak(cleanText, {
        language: LANG_LOCALE[lang] || 'en-IN',
        rate: 0.9,
        pitch: 1.0,
      });

      onSpeak?.();
    } catch (error) {
      console.log('Voice readout error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Default text formatter (handles markdown)
  const DefaultFormatter = () => {
    const lines = text.split('\n');
    return (
      <>
        {lines.map((line, i) => {
          if (!line.trim()) return <Text key={i}>{'\n'}</Text>;

          const isBullet =
            line.trim().startsWith('•') || line.trim().startsWith('-');
          const parts = line.split('**');

          return (
            <Text
              key={i}
              style={[
                styles.msgText,
                { color: isUser ? '#fff' : colors.textPrimary },
                isBullet && { paddingLeft: 8, marginLeft: 8 },
              ]}
            >
              {parts.map((part, j) => (
                <Text key={j} style={j % 2 === 1 ? { fontWeight: '800' } : {}}>
                  {part}
                </Text>
              ))}
              {i < lines.length - 1 && '\n'}
            </Text>
          );
        })}
      </>
    );
  };

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      {/* AI Avatar */}
      {!isUser && (
        <View style={styles.aiAvatar}>
          <MaterialCommunityIcons
            name="robot-outline"
            size={16}
            color="#fff"
          />
        </View>
      )}

      {/* Message Bubble */}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {/* Text Content */}
        {formatText ? formatText(text) : <DefaultFormatter />}

        {/* Voice Button (AI messages only) */}
        {!isUser && enableVoice && (
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleSpeak}
            disabled={isSpeaking}
            activeOpacity={0.7}
          >
            {isSpeaking ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather name="volume-2" size={14} color={colors.primary} />
            )}
            <Text style={styles.voiceButtonText}>
              {isSpeaking ? 'Speaking...' : 'Read'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* User Avatar */}
      {isUser && (
        <View style={[styles.userAvatar, { backgroundColor: colors.border }]}>
          <Feather name="user" size={16} color={colors.textMuted} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    padding: spacing.md,
    paddingBottom: spacing.sm + 4, // Extra space for voice button
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  msgText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.primary + '10',
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  voiceButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
});
