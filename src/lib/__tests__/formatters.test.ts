import { describe, it, expect } from 'vitest'
import {
  formatINR,
  formatINRDecimal,
  formatNum,
  formatNumDecimal,
  formatDate,
  formatDateShort,
  formatDateLong,
  formatMonthYear,
  formatCO2,
  formatCO2Short,
  todayISO,
  currentMonthKey,
} from '../formatters'

describe('formatINR', () => {
  it('formats whole number as Indian currency', () => {
    const result = formatINR(1000)
    expect(result).toContain('1,000')
    expect(result).toMatch(/₹/)
  })

  it('formats zero correctly', () => {
    const result = formatINR(0)
    expect(result).toMatch(/₹/)
    expect(result).toContain('0')
  })

  it('formats large amounts with Indian number system', () => {
    const result = formatINR(100000)
    expect(result).toContain('1,00,000')
  })
})

describe('formatINRDecimal', () => {
  it('formats with 2 decimal places', () => {
    const result = formatINRDecimal(1500.5)
    expect(result).toContain('1,500.50')
  })
})

describe('formatNum', () => {
  it('formats numbers with Indian locale', () => {
    const result = formatNum(100000)
    expect(result).toContain('1,00,000')
  })
})

describe('formatNumDecimal', () => {
  it('formats with 1 decimal place', () => {
    const result = formatNumDecimal(12.35)
    expect(result).toContain('12.4')
  })

  it('formats zero as 0.0', () => {
    const result = formatNumDecimal(0)
    expect(result).toContain('0.0')
  })
})

describe('formatDate', () => {
  it('formats ISO string to DD/MM/YYYY', () => {
    const result = formatDate('2026-06-20T00:00:00.000Z')
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    expect(result).toContain('2026')
  })
})

describe('formatDateShort', () => {
  it('formats ISO string to day and short month (no year)', () => {
    const result = formatDateShort('2026-06-20T00:00:00.000Z')
    // Short formatter shows day + abbreviated month (e.g. "20 Jun") — no year
    expect(result.length).toBeGreaterThan(3)
    expect(result).not.toBe('')
  })
})

describe('formatDateLong', () => {
  it('formats ISO string with full month name and year', () => {
    const result = formatDateLong('2026-06-20T00:00:00.000Z')
    expect(result).toContain('2026')
    expect(result.length).toBeGreaterThan(8)
  })
})

describe('formatMonthYear', () => {
  it('formats ISO string to Month YYYY', () => {
    const result = formatMonthYear('2026-06-20T00:00:00.000Z')
    expect(result).toContain('2026')
  })
})

describe('formatCO2', () => {
  it('shows kg for values below 1000', () => {
    const result = formatCO2(500)
    expect(result).toContain('kg CO₂')
    expect(result).not.toContain('tonnes')
  })

  it('shows tonnes for values at or above 1000', () => {
    const result = formatCO2(1000)
    expect(result).toContain('tonnes CO₂')
    expect(result).not.toContain('kg')
  })

  it('shows tonnes for large values', () => {
    const result = formatCO2(2500)
    expect(result).toContain('tonnes CO₂')
    expect(result).toContain('2.5')
  })

  it('correctly formats 0 kg', () => {
    const result = formatCO2(0)
    expect(result).toContain('kg CO₂')
    expect(result).toContain('0.0')
  })
})

describe('formatCO2Short', () => {
  it('shows kg suffix for small values', () => {
    expect(formatCO2Short(12.5)).toBe('12.5kg')
  })

  it('shows t suffix for values >= 1000', () => {
    expect(formatCO2Short(1500)).toBe('1.50t')
  })

  it('handles zero', () => {
    expect(formatCO2Short(0)).toBe('0.0kg')
  })
})

describe('todayISO', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = todayISO()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns today\'s date', () => {
    const result = todayISO()
    const today = new Date().toISOString().split('T')[0]
    expect(result).toBe(today)
  })
})

describe('currentMonthKey', () => {
  it('returns a string in YYYY-MM format', () => {
    const result = currentMonthKey()
    expect(result).toMatch(/^\d{4}-\d{2}$/)
  })

  it('returns the current month', () => {
    const result = currentMonthKey()
    const d = new Date()
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    expect(result).toBe(expected)
  })
})
