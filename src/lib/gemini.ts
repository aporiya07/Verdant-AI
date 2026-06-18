const PRIMARY_MODEL = 'gemini-2.5-flash'
const FALLBACK_MODEL = 'gemini-2.0-flash-lite'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// Rate limit guard: enforce minimum 6s between calls (stays under 10 RPM)
let lastCallTime = 0
const MIN_INTERVAL_MS = 6000

// Session-level prompt cache
const promptCache = new Map<string, string>()

function hashPrompt(prompt: string, systemPrompt?: string): string {
  return `${systemPrompt?.slice(0, 50) ?? ''}::${prompt.slice(0, 100)}`
}

async function tryModel(model: string, prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set')

  const res = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...(systemPrompt && {
        systemInstruction: { parts: [{ text: systemPrompt }] },
      }),
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`[Gemini] ${model} HTTP ${res.status}:`, err)
    throw new Error(`${model} failed: ${res.status} — ${err}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  const cacheKey = hashPrompt(prompt, systemPrompt)
  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey)!
  }

  // Rate limit enforcement
  const now = Date.now()
  const elapsed = now - lastCallTime
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise(r => setTimeout(r, MIN_INTERVAL_MS - elapsed))
  }
  lastCallTime = Date.now()

  try {
    const result = await tryModel(PRIMARY_MODEL, prompt, systemPrompt)
    promptCache.set(cacheKey, result)
    return result
  } catch (e) {
    console.warn('Primary Gemini model failed, switching to fallback:', e)
    try {
      const result = await tryModel(FALLBACK_MODEL, prompt, systemPrompt)
      promptCache.set(cacheKey, result)
      return result
    } catch (e2) {
      console.error('Both Gemini models failed:', e2)
      throw new Error('Gemini unavailable')
    }
  }
}

export const SAGE_SYSTEM_PROMPT = `You are Sage, a warm and knowledgeable carbon footprint coach inside Verdant AI, designed for Indian users. You speak in clear, friendly Indian English. You help users understand their carbon footprint in the Indian context — referencing local transport (autos, metros, local trains), Indian food (thalis, tiffin, street food), Indian energy (LPG cylinders, electricity units), and Indian cities. You celebrate wins enthusiastically, suggest practical India-specific reductions (e.g., switching to metro over cab, choosing veg thali twice a week, using 5-star rated ACs). Reference the user's actual logged data when possible. Keep responses concise (3-5 sentences max unless asked for more). Never lecture — inspire instead. Currency is always ₹ INR. Use Indian number formatting.`

export async function getSageResponse(
  userMessage: string,
  contextData: {
    name: string
    city: string
    monthlyKg: number
    topCategory: string
    streak: number
    recentActivities: string[]
  }
): Promise<string> {
  const contextPrompt = `
User context:
- Name: ${contextData.name}
- City: ${contextData.city}
- CO₂ this month: ${contextData.monthlyKg.toFixed(1)} kg
- Top emission source: ${contextData.topCategory}
- Current streak: ${contextData.streak} days
- Recent activities: ${contextData.recentActivities.slice(0, 5).join(', ')}

User says: "${userMessage}"
`
  return callGemini(contextPrompt, SAGE_SYSTEM_PROMPT)
}

export async function getClarityInsights(
  contextData: {
    name: string
    city: string
    monthlyKg: number
    goalKg: number
    byCategory: Record<string, number>
    avgMonthlyKg: number
  }
): Promise<string[]> {
  const prompt = `
You are Sage, a carbon footprint coach for Indian users. Generate exactly 3 short, actionable insights for this user.
Each insight should be 1-2 sentences max, warm and encouraging.
Format: Return exactly 3 lines, each starting with an emoji then the insight text.

User data:
- Name: ${contextData.name}, City: ${contextData.city}
- CO₂ this month: ${contextData.monthlyKg.toFixed(1)} kg (goal: ${contextData.goalKg} kg, India avg: ${contextData.avgMonthlyKg} kg)
- By category (kg): ${Object.entries(contextData.byCategory).map(([k, v]) => `${k}: ${v.toFixed(1)}`).join(', ')}

Generate 3 personalized insights:
`
  const raw = await callGemini(prompt)
  const lines = raw.split('\n').filter(l => l.trim().length > 0).slice(0, 3)
  if (lines.length < 3) {
    return [
      '🌿 You\'re tracking your footprint — that\'s already a big win!',
      '🚇 Switching one cab ride to metro this week can save ~0.5 kg CO₂.',
      '🍛 Choosing a veg thali over non-veg saves up to 3 kg CO₂ per meal.',
    ]
  }
  return lines
}

export async function getWeeklyQuest(
  topCategory: string,
  city: string
): Promise<{ title: string; description: string; co2SavingKg: number; icon: string } | null> {
  const prompt = `
Generate one specific, practical weekly carbon-reduction challenge for an Indian user in ${city}.
Their biggest emission source is: ${topCategory}.
Format your response as JSON with keys: title (5 words max), description (one sentence action), co2SavingKg (number), icon (single emoji).
Only return the JSON object, nothing else.
`
  try {
    const raw = await callGemini(prompt)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

export async function estimateCO2(activityDescription: string): Promise<number> {
  const prompt = `
Estimate the CO₂ emissions in kg for this activity in the Indian context: "${activityDescription}"
Return ONLY a number (the kg CO₂ value). No explanation, no units, just the number.
Examples: for "drove 10km by petrol car" return 1.92, for "ate veg thali" return 0.45
`
  try {
    const raw = await callGemini(prompt)
    const num = parseFloat(raw.trim())
    return isNaN(num) ? 0.5 : num
  } catch {
    return 0.5
  }
}
