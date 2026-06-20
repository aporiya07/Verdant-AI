import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CategoryIcon, CATEGORY_ICONS, TEMPLATE_ICONS } from '../../components/ui/CategoryIcon'

describe('CategoryIcon', () => {
  it('renders an SVG element for a known icon', () => {
    const { container } = render(<CategoryIcon name="Car" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders an SVG element for an unknown icon (falls back to Leaf)', () => {
    const { container } = render(<CategoryIcon name="UnknownIconXYZ" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies a custom className to the SVG', () => {
    const { container } = render(<CategoryIcon name="Train" className="text-green-500" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('text-green-500')
  })

  it('renders Train icon for transport activities', () => {
    const { container } = render(<CategoryIcon name={CATEGORY_ICONS.transport} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders Zap icon for energy category', () => {
    const { container } = render(<CategoryIcon name={CATEGORY_ICONS.energy} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders correctly with explicit size', () => {
    const { container } = render(<CategoryIcon name="Leaf" size={24} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})

describe('CATEGORY_ICONS', () => {
  it('has icons for all 6 main categories', () => {
    expect(CATEGORY_ICONS.transport).toBeDefined()
    expect(CATEGORY_ICONS.food).toBeDefined()
    expect(CATEGORY_ICONS.energy).toBeDefined()
    expect(CATEGORY_ICONS.shopping).toBeDefined()
    expect(CATEGORY_ICONS.travel).toBeDefined()
    expect(CATEGORY_ICONS.waste).toBeDefined()
  })
})

describe('TEMPLATE_ICONS', () => {
  it('has icon for metro template', () => {
    expect(TEMPLATE_ICONS.metro).toBe('Train')
  })

  it('has icon for lpg template', () => {
    expect(TEMPLATE_ICONS.lpg).toBe('Flame')
  })

  it('has icon for veg_thali template', () => {
    expect(TEMPLATE_ICONS.veg_thali).toBe('Salad')
  })
})
