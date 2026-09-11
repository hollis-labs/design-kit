import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppShell } from '../components/layout/app-shell'

/**
 * WHY THIS ASSERTS CLASSES, WHICH USUALLY SMELLS.
 *
 * The flex chain IS this component's contract — it exists for no other reason.
 * The behaviour it guarantees is "a tall child scrolls inside the shell instead
 * of overflowing the viewport", and jsdom does no layout, so that behaviour
 * cannot be observed directly. The chain is the only available proxy for it.
 *
 * So these pin the LOAD-BEARING links only — the ones whose absence is the known
 * bug — and not the full class string. Restyling the shell does not break them;
 * dropping `min-h-0` from the column or `flex-col` from `<main>` does, which is
 * exactly the regression Cerberus shipped for months.
 *
 * THE CHECK THAT MAKES THIS LEGITIMATE, and the one to apply before copying the
 * pattern: *if someone improves the code, does this fail?* Add or remove
 * decorative classes — no. Drop `min-h-0` — yes, and that is the defect. It
 * survives improvement and catches the bug, so it asserts a property rather than
 * a census. Asserting the FULL className string would have been the census: it
 * breaks on every restyle and pins appearance instead of contract.
 *
 * NOT PRECEDENT FOR PINNING CLASS STRINGS GENERALLY. This asserts the mechanism
 * only because the behaviour is unreachable in the harness — the property is
 * unobservable except through the classes that produce it. Where a behaviour CAN
 * be observed, assert the behaviour.
 */
function chain() {
  const outer = screen.getByTestId('shell-child').closest('div[class*="h-dvh"]')!
  const main = screen.getByTestId('shell-child').closest('main')!
  const column = main.parentElement!
  return { outer, column, main }
}

describe('AppShell flex chain', () => {
  it('the shell is exactly the viewport and does not scroll', () => {
    render(<AppShell><span data-testid="shell-child" /></AppShell>)
    const { outer } = chain()
    expect(outer.className).toContain('h-dvh')
    expect(outer.className).toContain('overflow-hidden')
    expect(outer.className).toContain('flex')
  })

  it('the content column can shrink below its content, vertically and horizontally', () => {
    render(<AppShell><span data-testid="shell-child" /></AppShell>)
    const { column } = chain()
    // Without min-h-0 a flex child refuses to shrink, the column grows past the
    // viewport, and the scroll region goes with it.
    expect(column.className).toContain('min-h-0')
    expect(column.className).toContain('min-w-0')
    expect(column.className).toContain('flex-col')
  })

  it('<main> is a flex column, so a routed view\'s own flex-1 has a parent to size against', () => {
    render(<AppShell><span data-testid="shell-child" /></AppShell>)
    const { main } = chain()
    // This is the exact link Cerberus dropped: `min-h-0 flex-1 overflow-hidden`
    // on a BLOCK container, which silently stops the page scrolling.
    expect(main.className).toContain('flex')
    expect(main.className).toContain('flex-col')
    expect(main.className).toContain('min-h-0')
    expect(main.className).toContain('flex-1')
  })

  it('renders nav and header as slots, and works without either', () => {
    const { unmount } = render(
      <AppShell nav={<nav data-testid="nav" />} header={<header data-testid="header" />}>
        <span data-testid="shell-child" />
      </AppShell>,
    )
    expect(screen.getByTestId('nav')).toBeTruthy()
    expect(screen.getByTestId('header')).toBeTruthy()
    unmount()

    render(<AppShell><span data-testid="shell-child" /></AppShell>)
    expect(screen.queryByTestId('nav')).toBeNull()
    expect(screen.getByTestId('shell-child')).toBeTruthy()
  })

  it('className extends the shell rather than replacing the chain', () => {
    render(<AppShell className="custom"><span data-testid="shell-child" /></AppShell>)
    const { outer } = chain()
    expect(outer.className).toContain('custom')
    expect(outer.className).toContain('h-dvh')
  })
})
