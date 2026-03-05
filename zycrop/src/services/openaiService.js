/**
 * openaiService.js
 * Direct OpenAI GPT calls from React Native (no backend server needed).
 */
import { OPENAI_API_KEY, OPENAI_MODEL } from '../config'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

/**
 * Send a chat message to OpenAI GPT.
 * @param {string} systemPrompt  - System-level instruction for the model
 * @param {string} userMessage   - The user's actual query
 * @param {number} maxTokens     - Max tokens in response (default 400)
 * @returns {Promise<string>}    - Model response text
 */
export async function chatWithGPT(systemPrompt, userMessage, maxTokens = 400) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    throw new Error('OpenAI API key not configured. Open src/config.js and paste your key.')
  }

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `OpenAI error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices[0].message.content.trim()
}

// ─── System prompts ───────────────────────────────────────────────────────────

export const LOAN_SYSTEM_PROMPT = `You are ZYCROP's agricultural loan advisor for Indian farmers.
You have expert knowledge of these government schemes:
- KCC (Kisan Credit Card): up to ₹3,00,000 at 4% (1% effective with timely repayment). Year-round.
- NABARD Term Loan: up to ₹10,00,000 at 7% p.a. for farm infrastructure. Kharif (June–Sept) / Rabi (Nov–Feb).
- PM-KISAN: ₹6,000/year direct income support. All farmers with land records.
- PM-Kusum: 60% subsidy on solar pumps. Up to ₹2.5 Lakh.
- PMFBY Crop Insurance: 2% premium for Kharif, 1.5% for Rabi. Full crop value coverage.
- Uzhavar Sandhai: Tamil Nadu free transport to farmer markets.
- Soil Health Card: Free soil testing every 2 years.

Rules:
1. Give concise, actionable advice (2–4 sentences max).
2. Always mention specific interest rates, amounts, and deadlines when relevant.
3. If asked about documents, list them specifically.
4. Respond in the same language as the user query if possible (Tamil/Hindi/English).
5. End with one actionable next step.`

export const SCHEMES_SYSTEM_PROMPT = `You are a government scheme advisor for Indian farmers (specialized in Tamil Nadu).
Given a search query about government agricultural schemes, return a JSON array of the most relevant schemes.

Known schemes database:
1. PM-KISAN: ₹6,000/year income support. All farmers with land records. Ongoing.
2. PM-Kusum Scheme: 60% subsidy solar pumps. Land records + water source proof. Up to ₹2.5 Lakh. Mar 31, 2026.
3. Fasal Bima Yojana (PMFBY): Crop insurance 2% premium Kharif, 1.5% Rabi. All farmers. Apr 15, 2026.
4. Uzhavar Sandhai: Free transport + stall to TN farmer markets. TN farmers with FarmerID. Ongoing.
5. Soil Health Card Scheme: Free soil testing every 2 years + fertilizer advisory. All farmers. Ongoing.
6. KCC (Kisan Credit Card): Crop loan 4% interest (3% subsidy). Land records + cultivation cert. Up to ₹3,00,000. Year-round.
7. NABARD Agricultural Term Loan: Farm infrastructure credit 7% p.a. Land ownership + project report. Up to ₹10,00,000. Kharif/Rabi windows.
8. TN Chief Minister's Drought Relief: Ex-gratia for crop loss. TN farmers with damage report. ₹8,000–₹22,000/ha.

Always return a valid JSON array in this exact format:
[{"id":"1","name":"...","benefit":"...","eligibility":"...","amount":"...","deadline":"..."}]
Return only the JSON array, no other text.`
