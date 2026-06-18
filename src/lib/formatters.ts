// en-IN locale formatters — instantiated once and reused for performance

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const inrDecimalFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numFormatter = new Intl.NumberFormat('en-IN')

const numDecimalFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateShortFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
})

const dateLongFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const monthYearFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'long',
  year: 'numeric',
})

/** Format as ₹1,42,500 */
export const formatINR = (amount: number): string => inrFormatter.format(amount)

/** Format as ₹1,42,500.50 */
export const formatINRDecimal = (amount: number): string => inrDecimalFormatter.format(amount)

/** Format as 1,42,500 (Indian number system) */
export const formatNum = (n: number): string => numFormatter.format(n)

/** Format as 1,42,500.5 */
export const formatNumDecimal = (n: number): string => numDecimalFormatter.format(n)

/** Format ISO string as DD/MM/YYYY */
export const formatDate = (iso: string): string => dateFormatter.format(new Date(iso))

/** Format ISO string as 18 Jun */
export const formatDateShort = (iso: string): string => dateShortFormatter.format(new Date(iso))

/** Format ISO string as 18 June 2026 */
export const formatDateLong = (iso: string): string => dateLongFormatter.format(new Date(iso))

/** Format ISO string as June 2026 */
export const formatMonthYear = (iso: string): string => monthYearFormatter.format(new Date(iso))

/** Format kg CO₂ with appropriate unit */
export const formatCO2 = (kg: number): string => {
  if (kg >= 1000) {
    return `${numDecimalFormatter.format(kg / 1000)} tonnes CO₂`
  }
  return `${numDecimalFormatter.format(kg)} kg CO₂`
}

/** Format kg CO₂ compactly */
export const formatCO2Short = (kg: number): string => {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)}t`
  }
  return `${kg.toFixed(1)}kg`
}

/** Get today as ISO date string (YYYY-MM-DD) */
export const todayISO = (): string => new Date().toISOString().split('T')[0]

/** Get current month as YYYY-MM */
export const currentMonthKey = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
