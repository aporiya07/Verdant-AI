import { describe, it, expect } from 'vitest'
import {
  CO2_FACTORS_INDIA,
  INDIA_BENCHMARKS,
  calcTransportCO2,
  calcElectricityCO2,
  getOrbZone,
  getOrbMessage,
} from '../carbon'

describe('CO2_FACTORS_INDIA', () => {
  it('has correct petrol car emission factor', () => {
    expect(CO2_FACTORS_INDIA.transport.petrol_car_km).toBe(0.192)
  })

  it('has zero emission for walking', () => {
    expect(CO2_FACTORS_INDIA.transport.walking).toBe(0)
  })

  it('has zero emission for cycling', () => {
    expect(CO2_FACTORS_INDIA.transport.cycling).toBe(0)
  })

  it('has correct LPG cylinder emission factor', () => {
    expect(CO2_FACTORS_INDIA.energy.lpg_cylinder_14kg).toBe(29.5)
  })

  it('has correct electricity emission factor (CEA V21.0)', () => {
    expect(CO2_FACTORS_INDIA.energy.electricity_kwh).toBe(0.712)
  })

  it('has correct metro emission factor', () => {
    expect(CO2_FACTORS_INDIA.transport.metro_km).toBe(0.031)
  })

  it('has correct veg thali emission factor', () => {
    expect(CO2_FACTORS_INDIA.food.veg_thali).toBe(0.45)
  })

  it('has correct mutton thali emission factor', () => {
    expect(CO2_FACTORS_INDIA.food.non_veg_thali_mutton).toBe(3.8)
  })

  it('metro emits less than petrol car per km', () => {
    expect(CO2_FACTORS_INDIA.transport.metro_km).toBeLessThan(CO2_FACTORS_INDIA.transport.petrol_car_km)
  })
})

describe('INDIA_BENCHMARKS', () => {
  it('has correct average monthly kg', () => {
    expect(INDIA_BENCHMARKS.avgMonthlyKg).toBe(158)
  })

  it('has correct Paris target monthly kg', () => {
    expect(INDIA_BENCHMARKS.parisTargetMonthlyKg).toBe(167)
  })

  it('has city averages for major metros', () => {
    expect(INDIA_BENCHMARKS.cityAvgMonthlyKg.Mumbai).toBeDefined()
    expect(INDIA_BENCHMARKS.cityAvgMonthlyKg.Delhi).toBeDefined()
    expect(INDIA_BENCHMARKS.cityAvgMonthlyKg.Bengaluru).toBeDefined()
    expect(INDIA_BENCHMARKS.cityAvgMonthlyKg.Ahmedabad).toBeDefined()
  })
})

describe('calcTransportCO2', () => {
  it('calculates petrol car CO₂ correctly', () => {
    const result = calcTransportCO2('petrol_car_km', 10)
    expect(result).toBeCloseTo(1.92, 5)
  })

  it('calculates metro CO₂ correctly', () => {
    const result = calcTransportCO2('metro_km', 20)
    expect(result).toBeCloseTo(0.62, 5)
  })

  it('returns 0 for walking', () => {
    expect(calcTransportCO2('walking', 5)).toBe(0)
  })

  it('returns 0 for cycling', () => {
    expect(calcTransportCO2('cycling', 10)).toBe(0)
  })

  it('returns 0 for 0 km', () => {
    expect(calcTransportCO2('petrol_car_km', 0)).toBe(0)
  })

  it('scales linearly with distance', () => {
    const co2For10km = calcTransportCO2('diesel_car_km', 10)
    const co2For20km = calcTransportCO2('diesel_car_km', 20)
    expect(co2For20km).toBeCloseTo(co2For10km * 2, 5)
  })
})

describe('calcElectricityCO2', () => {
  it('calculates electricity CO₂ correctly for 1 kWh', () => {
    expect(calcElectricityCO2(1)).toBeCloseTo(0.712, 5)
  })

  it('calculates electricity CO₂ correctly for 100 kWh', () => {
    expect(calcElectricityCO2(100)).toBeCloseTo(71.2, 5)
  })

  it('returns 0 for 0 kWh', () => {
    expect(calcElectricityCO2(0)).toBe(0)
  })
})

describe('getOrbZone', () => {
  it('returns green when below India average', () => {
    expect(getOrbZone(100)).toBe('green')
    expect(getOrbZone(157)).toBe('green')
  })

  it('returns green at exactly 0 kg', () => {
    expect(getOrbZone(0)).toBe('green')
  })

  it('returns amber when at India average and below 300', () => {
    expect(getOrbZone(158)).toBe('amber')
    expect(getOrbZone(200)).toBe('amber')
    expect(getOrbZone(299)).toBe('amber')
  })

  it('returns red when at or above 300 kg', () => {
    expect(getOrbZone(300)).toBe('red')
    expect(getOrbZone(500)).toBe('red')
  })
})

describe('getOrbMessage', () => {
  it('returns positive message for green zone', () => {
    expect(getOrbMessage(100)).toContain('Below Average')
  })

  it('returns improvement message for amber zone', () => {
    expect(getOrbMessage(200)).toContain('Room to improve')
  })

  it('returns action message for red zone', () => {
    expect(getOrbMessage(400)).toContain('fix this')
  })
})
