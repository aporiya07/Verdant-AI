import { describe, it, expect } from 'vitest'
import {
  getMonthlyLogs,
  getMonthlyTotal,
  getCategoryTotals,
  getLevelInfo,
} from '../store'
import type { ActivityLog } from '../store'

const makeLog = (overrides: Partial<ActivityLog>): ActivityLog => ({
  id: 'test-id',
  date: '2026-06-15',
  category: 'transport',
  activity: 'Metro commute',
  co2Kg: 1.0,
  ...overrides,
})

describe('getMonthlyLogs', () => {
  const logs: ActivityLog[] = [
    makeLog({ id: '1', date: '2026-06-01', co2Kg: 2.0 }),
    makeLog({ id: '2', date: '2026-06-15', co2Kg: 3.0 }),
    makeLog({ id: '3', date: '2026-05-20', co2Kg: 5.0 }),
    makeLog({ id: '4', date: '2026-07-01', co2Kg: 1.0 }),
  ]

  it('filters logs for the specified month', () => {
    const result = getMonthlyLogs(logs, '2026-06')
    expect(result).toHaveLength(2)
    expect(result.map(l => l.id)).toEqual(['1', '2'])
  })

  it('returns empty array when no logs match month', () => {
    const result = getMonthlyLogs(logs, '2026-01')
    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty logs', () => {
    const result = getMonthlyLogs([], '2026-06')
    expect(result).toHaveLength(0)
  })

  it('excludes logs from other months', () => {
    const result = getMonthlyLogs(logs, '2026-05')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('3')
  })
})

describe('getMonthlyTotal', () => {
  const logs: ActivityLog[] = [
    makeLog({ id: '1', date: '2026-06-01', co2Kg: 2.5 }),
    makeLog({ id: '2', date: '2026-06-15', co2Kg: 3.5 }),
    makeLog({ id: '3', date: '2026-05-20', co2Kg: 100.0 }),
  ]

  it('sums CO₂ for the current month only', () => {
    const result = getMonthlyTotal(logs, '2026-06')
    expect(result).toBeCloseTo(6.0, 5)
  })

  it('returns 0 for empty logs', () => {
    expect(getMonthlyTotal([], '2026-06')).toBe(0)
  })

  it('returns 0 when no logs match month', () => {
    expect(getMonthlyTotal(logs, '2026-01')).toBe(0)
  })
})

describe('getCategoryTotals', () => {
  const logs: ActivityLog[] = [
    makeLog({ id: '1', category: 'transport', co2Kg: 2.0 }),
    makeLog({ id: '2', category: 'transport', co2Kg: 3.0 }),
    makeLog({ id: '3', category: 'food', co2Kg: 1.5 }),
    makeLog({ id: '4', category: 'energy', co2Kg: 5.0 }),
    makeLog({ id: '5', category: 'food', co2Kg: 0.5 }),
  ]

  it('groups and sums CO₂ by category', () => {
    const result = getCategoryTotals(logs)
    expect(result['transport']).toBeCloseTo(5.0, 5)
    expect(result['food']).toBeCloseTo(2.0, 5)
    expect(result['energy']).toBeCloseTo(5.0, 5)
  })

  it('returns empty object for empty logs', () => {
    expect(getCategoryTotals([])).toEqual({})
  })

  it('handles single log correctly', () => {
    const result = getCategoryTotals([makeLog({ category: 'shopping', co2Kg: 12 })])
    expect(result['shopping']).toBe(12)
  })

  it('only includes categories that appear in logs', () => {
    const result = getCategoryTotals(logs)
    expect(Object.keys(result)).not.toContain('waste')
    expect(Object.keys(result)).not.toContain('shopping')
  })
})

describe('getLevelInfo', () => {
  it('returns level 1 (Seedling) at 0 XP', () => {
    const info = getLevelInfo(0)
    expect(info.level).toBe(1)
    expect(info.title).toBe('Seedling')
  })

  it('returns level 2 (Sprout) at 100 XP', () => {
    const info = getLevelInfo(100)
    expect(info.level).toBe(2)
    expect(info.title).toBe('Sprout')
  })

  it('returns level 3 (Sapling) at 300 XP', () => {
    const info = getLevelInfo(300)
    expect(info.level).toBe(3)
    expect(info.title).toBe('Sapling')
  })

  it('returns level 7 (EarthGuardian) at 4000+ XP', () => {
    const info = getLevelInfo(4000)
    expect(info.level).toBe(7)
    expect(info.title).toBe('EarthGuardian')
  })

  it('caps at level 7 for very high XP', () => {
    const info = getLevelInfo(99999)
    expect(info.level).toBe(7)
  })

  it('always has an icon string', () => {
    [0, 100, 300, 600, 1000, 2000, 4000].forEach(xp => {
      const info = getLevelInfo(xp)
      expect(typeof info.icon).toBe('string')
      expect(info.icon.length).toBeGreaterThan(0)
    })
  })

  it('always has a nextThreshold number', () => {
    const info = getLevelInfo(50)
    expect(typeof info.nextThreshold).toBe('number')
  })
})
