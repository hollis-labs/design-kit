import { describe, expect, it, vi } from 'vitest'
import {
  applyTheme,
  DEFAULT_THEME,
  persistTheme,
  readStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  THEME_OPTIONS,
} from '@/lib/theme'

describe('theme helpers', () => {
  it('falls back to the default theme when storage is empty or invalid', () => {
    expect(readStoredTheme({ getItem: () => null })).toBe(DEFAULT_THEME)
    expect(readStoredTheme({ getItem: () => 'unknown-theme' })).toBe(DEFAULT_THEME)
  })

  it('returns the stored theme when it is recognized', () => {
    expect(readStoredTheme({ getItem: () => 'p1-green-phosphor' })).toBe('p1-green-phosphor')
  })

  it('persists the selected theme under the expected storage key', () => {
    const setItem = vi.fn()

    persistTheme('hi-contrast', { setItem })

    expect(setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'hi-contrast')
  })

  it('applies the selected theme to the document root attribute', () => {
    const setAttribute = vi.fn()

    applyTheme('p3-amber-phosphor', { setAttribute })

    expect(setAttribute).toHaveBeenCalledWith('data-theme', 'p3-amber-phosphor')
    expect(setAttribute).toHaveBeenCalledTimes(1)
  })

  it.each(THEME_OPTIONS)('defaults $value to dark when the root has no mode', ({ value }) => {
    const root = document.createElement('div')
    applyTheme(value, root)
    expect(root.getAttribute('data-theme')).toBe(value)
    expect(root.getAttribute('data-mode')).toBe('dark')
  })

  it.each(['light', 'dark', ''])('preserves an explicitly supplied mode %j', mode => {
    const root = document.createElement('div')
    root.setAttribute('data-mode', mode)
    applyTheme('p4-white', root)
    expect(root.getAttribute('data-mode')).toBe(mode)
  })

  it('preserves the explicit light class spelling', () => {
    const root = document.createElement('div')
    root.className = 'host light'
    applyTheme('hi-contrast', root)
    expect(root.hasAttribute('data-mode')).toBe(false)
    expect(root.className).toBe('host light')
  })

  it('resolves unknown values to the default theme', () => {
    expect(resolveTheme(undefined)).toBe(DEFAULT_THEME)
    expect(resolveTheme('p4-white')).toBe('p4-white')
  })
})
