// India-specific CO₂ emission factors
// Sources: CEA CO₂ Baseline Database V21.0 (FY 2024-25), MoEFCC, IPCC, MoP India

export const CO2_FACTORS_INDIA = {
  transport: {
    petrol_car_km: 0.192,           // kg CO₂/km — Indian avg petrol car
    diesel_car_km: 0.171,
    cng_car_km: 0.118,
    two_wheeler_petrol_km: 0.078,
    two_wheeler_ev_km: 0.028,       // based on Indian grid (CEA V21.0)
    auto_rickshaw_km: 0.082,
    city_bus_km: 0.065,             // per passenger km
    metro_km: 0.031,                // Delhi/Mumbai/Bangalore metro
    local_train_km: 0.028,          // suburban rail
    intercity_train_km: 0.012,      // Indian Railways
    flight_domestic_km: 0.255,      // per passenger km
    flight_international_km: 0.195,
    ola_uber_km: 0.21,              // ride hailing
    ola_uber_shared_km: 0.10,       // shared/pool
    walking: 0,
    cycling: 0,
  },
  food: {
    veg_thali: 0.45,                // kg CO₂ per meal
    non_veg_thali_chicken: 1.4,
    non_veg_thali_mutton: 3.8,
    non_veg_thali_fish: 0.9,
    egg_meal: 0.6,
    street_food: 0.3,
    fast_food_burger: 2.5,
    dairy_tea_coffee_daily: 0.2,
    home_cooked: 0.3,
    food_delivery: 0.5,             // food + packaging + delivery
  },
  energy: {
    electricity_kwh: 0.712,         // India CEA V21.0 (FY 2024-25) grid emission factor
    lpg_cylinder_14kg: 29.5,        // kg CO₂ per 14kg LPG cylinder
    piped_gas_scm: 2.04,            // per standard cubic metre
    firewood_kg: 1.57,
  },
  shopping: {
    clothing_item_fast_fashion: 12,
    electronics_phone: 55,
    electronics_laptop: 320,
    appliance_small: 30,
    appliance_large_ac: 200,
    online_order_delivery: 0.5,     // per parcel
  },
  waste: {
    mixed_waste_kg: 0.5,            // unsegregated municipal waste
    wet_waste_composted_kg: 0.05,
  },
} as const

export const INDIA_BENCHMARKS = {
  avgAnnualTonnes: 1.9,
  avgMonthlyKg: 158,
  parisTargetAnnualTonnes: 2.0,
  parisTargetMonthlyKg: 167,
  globalAvgAnnualTonnes: 4.7,
  globalAvgMonthlyKg: 392,
  // City-level monthly averages (approximate)
  cityAvgMonthlyKg: {
    Mumbai: 162,
    Delhi: 185,
    Bengaluru: 158,
    Hyderabad: 155,
    Chennai: 152,
    Pune: 148,
    Kolkata: 145,
    Ahmedabad: 160,
    Jaipur: 140,
    Kochi: 138,
  },
}

// Activity templates for quick logging
export interface ActivityTemplate {
  id: string
  label: string
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'travel' | 'waste'
  icon: string
  defaultCO2: number
  unit: string
  prompt?: string
}

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  // Transport
  { id: 'metro', label: 'Metro commute', category: 'transport', icon: 'Train', defaultCO2: 0, unit: 'km', prompt: 'How many km?' },
  { id: 'city_bus', label: 'City bus (BEST/BMTC/DTC)', category: 'transport', icon: 'Bus', defaultCO2: 0, unit: 'km', prompt: 'How many km?' },
  { id: 'auto', label: 'Auto rickshaw', category: 'transport', icon: 'CircleDot', defaultCO2: 0, unit: 'km', prompt: 'How many km?' },
  { id: 'two_wheeler', label: 'Two-wheeler (petrol)', category: 'transport', icon: 'Bike', defaultCO2: 0, unit: 'km', prompt: 'How many km?' },
  { id: 'two_wheeler_ev', label: 'Two-wheeler (electric)', category: 'transport', icon: 'Bike', defaultCO2: 0, unit: 'km', prompt: 'How many km?' },
  { id: 'cab', label: 'Ola/Uber cab', category: 'transport', icon: 'Car', defaultCO2: 0, unit: 'km', prompt: 'How many km?' },
  { id: 'cab_shared', label: 'Ola/Uber Share', category: 'transport', icon: 'Car', defaultCO2: 0, unit: 'km', prompt: 'How many km?' },
  { id: 'car_petrol', label: 'Personal car (petrol)', category: 'transport', icon: 'Car', defaultCO2: 0, unit: 'km', prompt: 'How many km?' },
  { id: 'local_train', label: 'Local train', category: 'transport', icon: 'TrainFront', defaultCO2: 0, unit: 'km', prompt: 'How many km?' },
  { id: 'walk', label: 'Walking', category: 'transport', icon: 'Footprints', defaultCO2: 0, unit: 'km' },
  { id: 'cycle', label: 'Cycling', category: 'transport', icon: 'Bike', defaultCO2: 0, unit: 'km' },
  // Food
  { id: 'veg_thali', label: 'Veg Thali', category: 'food', icon: 'Salad', defaultCO2: 0.45, unit: 'meal' },
  { id: 'chicken_thali', label: 'Chicken Thali', category: 'food', icon: 'Drumstick', defaultCO2: 1.4, unit: 'meal' },
  { id: 'mutton_thali', label: 'Mutton Thali', category: 'food', icon: 'Drumstick', defaultCO2: 3.8, unit: 'meal' },
  { id: 'fish_thali', label: 'Fish Thali', category: 'food', icon: 'CookingPot', defaultCO2: 0.9, unit: 'meal' },
  { id: 'street_food', label: 'Street food / Chaat', category: 'food', icon: 'CookingPot', defaultCO2: 0.3, unit: 'meal' },
  { id: 'home_cooked', label: 'Home cooked', category: 'food', icon: 'CookingPot', defaultCO2: 0.3, unit: 'meal' },
  { id: 'food_delivery', label: 'Swiggy/Zomato order', category: 'food', icon: 'ShoppingBag', defaultCO2: 0.5, unit: 'order' },
  // Energy
  { id: 'electricity', label: 'Electricity units', category: 'energy', icon: 'Zap', defaultCO2: 0, unit: 'kWh', prompt: 'How many kWh?' },
  { id: 'lpg', label: 'LPG cylinder (14kg)', category: 'energy', icon: 'Flame', defaultCO2: 29.5, unit: 'cylinder' },
  // Shopping
  { id: 'clothing', label: 'Clothing item', category: 'shopping', icon: 'ShoppingBag', defaultCO2: 12, unit: 'item' },
  { id: 'phone', label: 'Smartphone', category: 'shopping', icon: 'ShoppingBag', defaultCO2: 55, unit: 'item' },
  { id: 'laptop', label: 'Laptop', category: 'shopping', icon: 'ShoppingBag', defaultCO2: 320, unit: 'item' },
  { id: 'ac', label: 'Air conditioner', category: 'shopping', icon: 'Snowflake', defaultCO2: 200, unit: 'item' },
]

export const CATEGORY_COLORS = {
  transport: '#2ECC7A',
  food: '#FFD166',
  energy: '#E8472A',
  shopping: '#A8F5B0',
  travel: '#4ECDC4',
  waste: '#95A5A6',
}

export const CATEGORY_LABELS = {
  transport: 'Transport',
  food: 'Food',
  energy: 'Energy',
  shopping: 'Shopping',
  travel: 'Travel',
  waste: 'Waste',
}

export type ActivityCategory = keyof typeof CATEGORY_COLORS

// Calculate CO₂ for a transport activity based on km
export function calcTransportCO2(mode: keyof typeof CO2_FACTORS_INDIA.transport, km: number): number {
  return (CO2_FACTORS_INDIA.transport[mode] ?? 0) * km
}

/** Calculate CO₂ for a given kWh electricity consumption */
export function calcElectricityCO2(kwh: number): number {
  return CO2_FACTORS_INDIA.energy.electricity_kwh * kwh
}

/** Voluntary carbon market price per tonne (INR) for the Indian market (~2024) */
export const CARBON_PRICE_INR_PER_TONNE = 420

/**
 * Estimated monthly carbon offset cost in INR.
 * Uses 45% of monthly kg as the "offset-eligible" fraction
 * (scope 1+2 activities that can realistically be offset).
 */
export function calcMonthlyOffsetCostINR(monthlyKg: number): number {
  const OFFSET_ELIGIBLE_FRACTION = 0.45
  return (monthlyKg / 1000) * OFFSET_ELIGIBLE_FRACTION * CARBON_PRICE_INR_PER_TONNE * 1000
}

/** Threshold (kg CO₂) above which the orb zone is considered "high" */
const HIGH_EMISSION_THRESHOLD_KG = 300

/** Get ImpactOrb color zone */
export function getOrbZone(monthlyKg: number): 'green' | 'amber' | 'red' {
  if (monthlyKg < INDIA_BENCHMARKS.avgMonthlyKg) return 'green'
  if (monthlyKg < HIGH_EMISSION_THRESHOLD_KG) return 'amber'
  return 'red'
}

export function getOrbMessage(monthlyKg: number): string {
  const zone = getOrbZone(monthlyKg)
  if (zone === 'green') return 'Below Average — Great going!'
  if (zone === 'amber') return 'Near Average — Room to improve'
  return 'Above Average — Let\'s fix this'
}

