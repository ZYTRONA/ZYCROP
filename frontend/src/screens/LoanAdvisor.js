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
import { translations } from '../constants/translations';

const QUICK_QUESTIONS = [
  'How much KCC loan can I get?',
  'KCC eligibility criteria',
  'NABARD investment loan for irrigation',
  'Interest rate on crop loan',
  'PMFBY crop insurance details',
  'Government subsidy schemes',
  'How to renew KCC?',
  'Loan calculator',
  'What if I default on payment?',
  'NABARD documentation needed',
];

// Offline responses with multilingual support
const OFFLINE_AI = (msg, t) => {
  const m = msg.toLowerCase();
  
  if (m.includes('kcc') || m.includes('kisan credit')) {
    return t.loan_advisor_kcc;
  }
  if (m.includes('nabard') || m.includes('investment') || m.includes('drip') || m.includes('cold storage') || m.includes('machinery')) {
    return t.loan_advisor_nabard;
  }
  if (m.includes('pmfby') || m.includes('crop insurance')) {
    return t.loan_advisor_pmfby;
  }
  if (m.includes('interest') || m.includes('rate') || m.includes('agri rate')) {
    return t.loan_advisor_interest_rates;
  }
  if (m.includes('eligib')) {
    return t.loan_advisor_pmfby;
  }
  if (m.includes('subsidy') || m.includes('scheme') || m.includes('government')) {
    return t.loan_advisor_interest_rates;
  }
  if (m.includes('renew') || m.includes('renewal')) {
    return t.loan_advisor_kcc;
  }
  if (m.includes('default') || m.includes('late payment')) {
    return t.loan_advisor_interest_rates;
  }
  if (m.includes('calculator') || m.includes('calculate') || m.includes('compute')) {
    return t.loan_advisor_interest_rates;
  }
  if (m.includes('calculator') || m.includes('calculate') || m.includes('compute')) {
    return `**Loan Amount Calculator**\n\n🧮 **Step-by-step Calculation:**\n\n**For KCC Loans:**\n1. Find your crop cost per acre (market data)\n2. Multiply by total cultivated acres\n3. Add 20% contingency buffer\n4. Add 10% for post-harvest costs\n\nFormula: (Acre × Cost) + 20% + 10%\n\n**Example Calculation (Paddy - 2 acres):**\n• Paddy cost/acre: ₹18,000\n• 2 acres: ₹18,000 × 2 = ₹36,000\n• Contingency (20%): ₹7,200\n• Post-harvest (10%): ₹3,600\n• **KCC Limit = ₹46,800**\n\n**Interest Calculation:**\nMonthly Interest = (Loan Amount × Rate%) ÷ 12\n\nExample: ₹46,800 @ 7% p.a. for 12 months\n= (46,800 × 7) ÷ 12 = ₹2,730 interest\n= ₹46,800 + ₹2,730 = ₹49,530 total\n\n**After Subsidy (3% + 3%):**\n= Effective rate: 1% p.a.\n= (46,800 × 1) ÷ 12 = ₹390 interest only!\n\n💡 **Savings with Subsidy:** ₹2,730 - ₹390 = ₹2,340 saved!`;
  }
  return t.loan_advisor_default;
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
    { role: 'ai', text: t.loanGreeting }
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
      const langTranslations = translations[lang] || translations.en;
      setMessages(prev => [...prev, { role: 'ai', text: OFFLINE_AI(msg, langTranslations) }]);
      setTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 700);
  }, [input, lang]);

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
  infoCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', minWidth: 100, borderWidth: 1, flex: 1 },
  chatScroll: { flex: 1 },
  quickRow: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, maxHeight: 50 },
  quickQ: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.primary + '12', borderWidth: 1, borderColor: colors.primary + '30' },
  quickQText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, backgroundColor: colors.surface, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  textInput: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 14, maxHeight: 100, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
});
