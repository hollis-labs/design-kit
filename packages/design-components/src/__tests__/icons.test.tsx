import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import * as icons from '../components/icons'

/**
 * Vendored path data has exactly one failure mode worth a test: a glyph that
 * renders an EMPTY svg because a path was truncated or a child was dropped on
 * the way in. That is invisible in review — an empty 24x24 svg looks like a
 * correct icon in a diff — and it renders as a blank space rather than an error.
 *
 * So: every exported glyph draws at least one shape, and carries the stroke
 * presentation lucide's paths are drawn for. A glyph added later is covered
 * automatically, because the suite reads the module's exports rather than a list.
 */
const GLYPHS = Object.entries(icons).filter(([name]) => name.endsWith('Glyph')) as Array<
  [string, (props: { className?: string }) => React.ReactNode]
>

describe('vendored glyphs', () => {
  it('exports the seventeen the components need', () => {
    expect(GLYPHS).toHaveLength(17)
  })

  it.each(GLYPHS)('%s draws at least one shape', (_name, Glyph) => {
    const { container } = render(<Glyph />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg!.children.length).toBeGreaterThan(0)
    expect(svg!.getAttribute('stroke')).toBe('currentColor')
    expect(svg!.getAttribute('viewBox')).toBe('0 0 24 24')
  })

  it.each(GLYPHS)('%s forwards className so the component owns its size', (_name, Glyph) => {
    const { container } = render(<Glyph className="size-4" />)
    expect(container.querySelector('svg')!.getAttribute('class')).toBe('size-4')
  })
})
