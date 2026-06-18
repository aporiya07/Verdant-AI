import { useState } from 'react'
import { useVerdantStore, getMonthlyTotal, getCategoryTotals } from '../../lib/store'
import { getSageResponse } from '../../lib/gemini'

export function useSage() {
  const user = useVerdantStore(s => s.user)
  const logs = useVerdantStore(s => s.logs)
  const chatHistory = useVerdantStore(s => s.chatHistory)
  const addMessage = useVerdantStore(s => s.addMessage)

  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const monthlyKg = getMonthlyTotal(logs)
  const categoryTotals = getCategoryTotals(logs)
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'transport'
  const recentActivities = logs.slice(-5).map(l => l.activity)

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    setError(null)

    // Add user message immediately
    addMessage({ role: 'user', content: text, timestamp: new Date().toISOString() })
    setIsTyping(true)

    try {
      const response = await getSageResponse(text, {
        name: user.name,
        city: user.city,
        monthlyKg,
        topCategory,
        streak: user.streak,
        recentActivities,
      })
      addMessage({ role: 'assistant', content: response, timestamp: new Date().toISOString() })
    } catch (err) {
      const hint = err instanceof Error ? err.message : String(err)
      const isKeyError = hint.includes('API_KEY') || hint.includes('400') || hint.includes('403') || hint.includes('401')
      addMessage({
        role: 'assistant',
        content: isKeyError
          ? `I need a valid Gemini API key to respond. Please add your key to the .env file — get one free at aistudio.google.com/app/apikey (keys start with AIzaSy…)`
          : `I'm taking a short break — check back in a moment! In the meantime, try logging your commute or meals — every bit counts, ${user.name}.`,
        timestamp: new Date().toISOString(),
      })
      setError(hint)
    } finally {
      setIsTyping(false)
    }
  }

  return { chatHistory, isTyping, error, sendMessage }
}
