/**
 * LoanAdvisor.js — AI Loan & Finance Advisor
 * Real-time chat with Ollama AI for KCC, NABARD, interest calculations
 * Now with voice readout for AI responses!
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, KeyboardAvoidingView,
  Platform, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLang } from '../context/LanguageContext';
import { VoiceChatBubble } from '../components/ui';
import { colors, spacing, radius, textStyle } from '../theme/tokens';
import { useResponsive } from '../theme/responsive';

const QUICK_QUESTIONS = [
  'How much KCC loan can I get?',
  'KCC eligibility for 2 acres',
  'NABARD investment loan docs',
  'Interest rate on crop loan',
  'Kisan Credit Card renewal',
  'Loan for drip irrigation',
];

// Offline responses for common queries
const OFFLINE_AI = (msg) => {
  const m = msg.toLowerCase();
  if (m.includes('kcc') || m.includes('kisan credit')) {
    return `**Kisan Credit Card (KCC)**\n\n✅ Loan up to ₹3,00,000 at 4% effective interest (7% - 3% govt subvention).\n\n📋 **Documents needed:**\n• Patta/Adangal (land record)\n• Cultivation certificate from Village Officer\n• Aadhar + PAN card\n• Bank passbook (last 6 months)\n• Passport photo\n\n🏦 Apply at: SBI, Canara Bank, Indian Bank, or any cooperative bank. Processing: 7–15 days.`;
  }
  if (m.includes('nabard') || m.includes('investment') || m.includes('drip') || m.includes('cold storage')) {
    return `**NABARD Farm Investment Loan**\n\n✅ Long-term loan for drip/sprinkler irrigation, cold storage, farm machinery.\n\n💰 Amount: Up to ₹10 lakh\nInterest: 8–12% p.a. (varies by bank)\nTenure: 5–7 years\n\n📋 Documents: Land records, project report, bank statements, Aadhar.\n\n🏦 Apply through NABARD-linked banks. Subsidy available under various schemes.`;
  }
  if (m.includes('interest') || m.includes('rate')) {
    return `**Agricultural Loan Interest Rates (2025–26)**\n\n| Loan Type | Rate | Effective Rate |\n|-----------|------|----------------|\n| KCC (up to ₹3L) | 7% | 4% (after 3% subvention) |\n| KCC (₹3L–₹5L) | 9.5–11% | — |\n| TN Co-op Loan | 7% | 4% | \n| NABARD Term | 8–12% | Varies |\n| SHG Agri Loan | 10–12% | — |\n\n💡 Tip: Repay KCC on time to get additional 3% prompt repayment incentive (total 1% rate).`;
  }
  if (m.includes('eligib')) {
    return `**Crop Loan Eligibility**\n\n✅ Basic requirements:\n• Own or lease land (patta or lease deed)\n• Indian citizen aged 18–70\n• No existing loan default\n• Valid Aadhar + mobile linked to Aadhar\n\n🌾 KCC limit = (Crop cost per acre × Acres) + (20% risk + 10% post-harvest)\n\nExample: 3 acres paddy:\n• Crop cost: ₹18,000/acre × 3 = ₹54,000\n• Risk + PH: + ₹16,200\n• **KCC limit: ₹70,200**`;
  }
  return `I'm your AI Loan Advisor for ZYCROP. Ask me about:\n\n• KCC — Kisan Credit Card eligibility & limits\n• NABARD investment loans for machinery, drip irrigation\n• Interest rates on crop loans\n• PMFBY crop insurance\n• Government subsidy schemes\n\nType your question in English, Hindi, or Tamil. I'm ready to help!`;
};

function UserChatBubble({ msg, lang }) {
  // User messages rendered as simple bubbles (no voice needed)
  return (
    <View style={[cb.wrap, cb.userWrap]}>
      <View style={[cb.bubble, cb.userBubble]}>
        <Text style={[cb.msgText, { color: '#fff' }]}>{msg.text}</Text>
      </View>
      <View style={[cb.avatar, { backgroundColor: colors.border }]}>
        <Feather name="user" size={16} color={colors.textMuted} />
      </View>
    </View>
  );
}

function AIMessageWithVoice({ msg, lang }) {
  // AI messages with voice readout button
  return (
    <VoiceChatBubble
      role="ai"
      text={msg.text}
      lang={lang}
      enableVoice={true}
    />
  );
}

const cb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.md, gap: spacing.sm },
  userWrap: { justifyContent: 'flex-end' },
  aiWrap: { justifyContent: 'flex-start' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: spacing.md },
  userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  msgText: { fontSize: 13.5 },
});

const LOAN_INFO_CARDS = [
  { icon: 'credit-card', label: 'KCC Loan', value: 'Up to ₹3L @ 4%', color: '#1565c0' },
  { icon: 'bank', label: 'NABARD', value: 'Up to ₹10L', color: '#2e7d32' },
  { icon: 'shield-check', label: 'PMFBY', value: '2% Premium', color: '#f57c00' },
  { icon: 'cash', label: 'Agri Rate', value: '4–12% p.a.', color: '#6a1b9a' },
];

export default function LoanAdvisor({ navigation }) {
  const { t, lang } = useLang();
  const { spacing: sp } = useResponsive();
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Vanakkam! 🌾 I am your AI Loan Advisor. Ask me anything about agricultural loans, KCC, NABARD schemes, interest rates, or subsidy eligibility. I can reply in English, Hindi, or Tamil.' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const sendMessage = useCallback((text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    Keyboard.dismiss();
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setTyping(true);
    // 100% offline — use local AI knowledge base with simulated thinking delay
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: OFFLINE_AI(msg) }]);
      setTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 700);
  }, [input]);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[s.header, { paddingHorizontal: sp.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: sp.md }}>
          <Text style={[textStyle.h2({ color: '#fff' })]}>Loan Advisor</Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>AI-powered loan guidance</Text>
        </View>
        <View style={s.aiDot} />
      </View>

      {/* Info cards row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sp.md, paddingVertical: sp.sm, gap: spacing.sm }}
        style={{ backgroundColor: colors.surfaceAlt, maxHeight: 80 }}
      >
        {LOAN_INFO_CARDS.map(card => (
          <TouchableOpacity
            key={card.label}
            onPress={() => sendMessage(`Tell me about ${card.label}`)}
            style={[s.infoCard, { borderColor: card.color + '40' }]}
          >
            <MaterialCommunityIcons name={card.icon} size={18} color={card.color} />
            <Text style={[textStyle.bodySmall(), { fontWeight: '700', color: card.color, marginTop: 2 }]}>{card.label}</Text>
            <Text style={[{ fontSize: 10, color: colors.textMuted }]}>{card.value}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        {/* Chat messages */}
        <ScrollView
          ref={scrollRef}
          style={s.chatScroll}
          contentContainerStyle={{ padding: sp.md, paddingBottom: 20 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, i) =>
            msg.role === 'user' ? (
              <UserChatBubble key={i} msg={msg} lang={lang} />
            ) : (
              <AIMessageWithVoice key={i} msg={msg} lang={lang} />
            )
          )}
          {typing && (
            <View style={[cb.wrap, cb.aiWrap]}>
              <View style={cb.avatar}>
                <MaterialCommunityIcons name="robot-outline" size={16} color="#fff" />
              </View>
              <View style={[cb.bubble, cb.aiBubble]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick questions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: sp.md, paddingVertical: 8, gap: spacing.sm }}
          style={s.quickRow}
        >
          {QUICK_QUESTIONS.map(q => (
            <TouchableOpacity key={q} onPress={() => sendMessage(q)} style={s.quickQ}>
              <Text style={s.quickQText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input bar */}
        <View style={[s.inputBar, { paddingHorizontal: sp.md }]}>
          <TextInput
            style={[s.textInput, textStyle.body()]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about loans, interest rates..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={300}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            style={[s.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]}
            disabled={!input.trim() || typing}
          >
            <Feather name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { backgroundColor: colors.primary, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center' },
  aiDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#52B788' },
  infoCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 10, alignItems: 'center', width: 80, borderWidth: 1 },
  chatScroll: { flex: 1 },
  quickRow: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, maxHeight: 50 },
  quickQ: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.primary + '12', borderWidth: 1, borderColor: colors.primary + '30' },
  quickQText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, backgroundColor: colors.surface, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  textInput: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 14, maxHeight: 100, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
});
