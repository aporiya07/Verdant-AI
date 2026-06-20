import {
  Car, UtensilsCrossed, Zap, ShoppingBag, Plane, Recycle,
  Train, Bus, CircleDot, Bike, TrainFront, Footprints,
  Salad, Drumstick, CookingPot, Sprout, Leaf, TreePine, Palmtree, Globe,
  Wind, Sun, Snowflake, Flame, MapPin, Bot,
  type LucideIcon
} from 'lucide-react'

export type IconName = string

export const CATEGORY_ICONS: Record<string, IconName> = {
  transport: 'Car',
  food: 'UtensilsCrossed',
  energy: 'Zap',
  shopping: 'ShoppingBag',
  travel: 'Plane',
  waste: 'Recycle',
}

export const LEVEL_ICONS: Record<string, IconName> = {
  Seedling: 'Sprout',
  Sprout: 'Leaf',
  Sapling: 'TreePine',
  Bamboo: 'TreePine',
  Oak: 'TreePine',
  Banyan: 'Palmtree',
  EarthGuardian: 'Globe',
}

export const TEMPLATE_ICONS: Record<string, IconName> = {
  metro: 'Train',
  city_bus: 'Bus',
  auto: 'CircleDot',
  two_wheeler: 'Bike',
  two_wheeler_ev: 'Bike',
  cab: 'Car',
  cab_shared: 'Car',
  car_petrol: 'Car',
  local_train: 'TrainFront',
  walk: 'Footprints',
  cycle: 'Bike',
  veg_thali: 'Salad',
  chicken_thali: 'Drumstick',
  mutton_thali: 'Drumstick',
  fish_thali: 'CookingPot',
  street_food: 'CookingPot',
  home_cooked: 'CookingPot',
  food_delivery: 'ShoppingBag',
  electricity: 'Zap',
  lpg: 'Flame',
  clothing: 'ShoppingBag',
  phone: 'ShoppingBag',
  laptop: 'ShoppingBag',
  ac: 'Snowflake',
}

export const BADGE_ICONS: Record<string, IconName> = {
  'metro-warrior': 'Train',
  'veg-week': 'Salad',
  'no-ac': 'Snowflake',
  'cycle-champ': 'Bike',
  'streak-7': 'Flame',
  'first-log': 'Sprout',
}

export const PROJECT_ICONS: Record<string, IconName> = {
  sundarbans: 'TreePine',
  'rajasthan-solar': 'Sun',
  'western-ghats': 'TreePine',
  'himalayan-cookstove': 'CookingPot',
  'gujarat-wind': 'Wind',
}

const ICON_MAP: Record<string, LucideIcon> = {
  Car,
  UtensilsCrossed,
  Zap,
  ShoppingBag,
  Plane,
  Recycle,
  Train,
  Bus,
  CircleDot,
  Bike,
  TrainFront,
  Footprints,
  Salad,
  Drumstick,
  CookingPot,
  Sprout,
  Leaf,
  TreePine,
  Palmtree,
  Globe,
  Wind,
  Sun,
  Snowflake,
  Flame,
  MapPin,
  Bot,
}

export interface CategoryIconProps {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
}

export function CategoryIcon({ name, size = 16, className = '', strokeWidth = 1.75 }: CategoryIconProps) {
  const IconComponent: LucideIcon = ICON_MAP[name] ?? Leaf
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />
}

export interface LevelIconProps {
  name: string
  size?: number
  className?: string
  strokeWidth?: number
}

export function LevelIcon({ name, size = 48, className = '', strokeWidth = 1.75 }: LevelIconProps) {
  const iconName = LEVEL_ICONS[name] ?? 'Sprout'
  const IconComponent: LucideIcon = ICON_MAP[iconName] ?? Sprout
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />
}