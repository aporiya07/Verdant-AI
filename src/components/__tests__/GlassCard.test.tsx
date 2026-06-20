import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassCard } from '../../components/ui/GlassCard'

describe('GlassCard', () => {
  it('renders children correctly', () => {
    render(<GlassCard>Hello Verdant</GlassCard>)
    expect(screen.getByText('Hello Verdant')).toBeInTheDocument()
  })

  it('applies the base glass-card class by default', () => {
    const { container } = render(<GlassCard>Content</GlassCard>)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('glass-card')
  })

  it('applies glass-card-strong class when strong prop is set', () => {
    const { container } = render(<GlassCard strong>Strong Card</GlassCard>)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('glass-card-strong')
  })

  it('does NOT apply glass-card-strong class when strong is false', () => {
    const { container } = render(<GlassCard strong={false}>Normal Card</GlassCard>)
    const div = container.firstChild as HTMLElement
    expect(div.className).not.toContain('glass-card-strong')
  })

  it('applies additional className prop', () => {
    const { container } = render(<GlassCard className="p-6">Content</GlassCard>)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('p-6')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<GlassCard onClick={onClick}>Clickable</GlassCard>)
    screen.getByText('Clickable').click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders multiple children', () => {
    render(
      <GlassCard>
        <span>Child 1</span>
        <span>Child 2</span>
      </GlassCard>
    )
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })
})
