import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  createAppShellAsideStore,
  createMemoryStorage,
  parseAsidePreference,
  type AppShellAsidePreference,
} from '../lib/app-shell-aside-store'
import {
  useAppShellAside,
  resolveAdmittedFocusTarget,
} from '../hooks/use-app-shell-aside'

describe('app-shell-aside-store', () => {
  it('parses valid preferences and falls back on invalid values', () => {
    expect(parseAsidePreference(null)).toBeNull()
    expect(parseAsidePreference('invalid')).toBeNull()
    expect(parseAsidePreference({})).toEqual({ width: 'regular', collapsed: true })
    expect(parseAsidePreference({ width: 'compact', collapsed: false })).toEqual({
      width: 'compact',
      collapsed: false,
    })
    expect(parseAsidePreference({ width: 'wide', collapsed: true })).toEqual({
      width: 'wide',
      collapsed: true,
    })
    expect(parseAsidePreference({ width: 'unknown', collapsed: 'not-bool' })).toEqual({
      width: 'regular',
      collapsed: true,
    })
  })

  it('initializes with defaults when storage is empty', () => {
    const memory = createMemoryStorage<AppShellAsidePreference>()
    const store = createAppShellAsideStore({
      appNamespace: 'test-app',
      storage: memory,
    })

    expect(store.storageKey).toBe('test-app:ops-shell:aside:v1')
    expect(store.getSnapshot()).toEqual({
      width: 'regular',
      collapsed: true,
    })
  })

  it('persists setWidth, setCollapsed, and toggleCollapsed to storage', () => {
    const memory = createMemoryStorage<AppShellAsidePreference>()
    const store = createAppShellAsideStore({ storage: memory, defaultCollapsed: true })

    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    store.setWidth('compact')
    expect(store.getSnapshot().width).toBe('compact')
    expect(memory.read()?.width).toBe('compact')
    expect(listener).toHaveBeenCalledTimes(1)

    store.setCollapsed(false)
    expect(store.getSnapshot().collapsed).toBe(false)
    expect(memory.read()?.collapsed).toBe(false)
    expect(listener).toHaveBeenCalledTimes(2)

    store.toggleCollapsed()
    expect(store.getSnapshot().collapsed).toBe(true)
    expect(memory.read()?.collapsed).toBe(true)
    expect(listener).toHaveBeenCalledTimes(3)

    unsubscribe()
  })

  it('resets to defaults cleanly', () => {
    const memory = createMemoryStorage<AppShellAsidePreference>()
    const store = createAppShellAsideStore({ storage: memory, defaultCollapsed: false })

    store.setWidth('wide')
    store.setCollapsed(true)
    expect(store.getSnapshot()).toEqual({ width: 'wide', collapsed: true })

    store.reset()
    expect(store.getSnapshot()).toEqual({ width: 'regular', collapsed: false })
    expect(memory.read()).toEqual({ width: 'regular', collapsed: false })
  })
})

describe('useAppShellAside hook', () => {
  let memory: ReturnType<typeof createMemoryStorage<AppShellAsidePreference>>

  beforeEach(() => {
    memory = createMemoryStorage<AppShellAsidePreference>()
  })

  it('provides width presets, collapsed state, and asideProps', () => {
    const { result } = renderHook(() =>
      useAppShellAside({
        storage: memory,
        defaultWidth: 'regular',
        defaultCollapsed: true,
        isNarrow: false,
      }),
    )

    expect(result.current.width).toBe('regular')
    expect(result.current.collapsed).toBe(true)
    expect(result.current.overlayOpen).toBe(false)
    expect(result.current.isNarrow).toBe(false)

    expect(result.current.asideProps).toMatchObject({
      asideWidth: 'regular',
      asideCollapsed: true,
      onAsideCollapsedChange: expect.any(Function),
      asideOverlayOpen: false,
      onAsideOverlayOpenChange: expect.any(Function),
      isNarrow: false,
    })
  })

  it('toggles collapsed and updates storage', () => {
    const { result } = renderHook(() =>
      useAppShellAside({
        storage: memory,
        defaultCollapsed: true,
      }),
    )

    act(() => {
      result.current.toggleCollapsed()
    })

    expect(result.current.collapsed).toBe(false)
    expect(memory.read()?.collapsed).toBe(false)

    act(() => {
      result.current.setWidth('wide')
    })

    expect(result.current.width).toBe('wide')
    expect(memory.read()?.width).toBe('wide')
  })

  it('manages overlayOpen in-memory without mutating storage', () => {
    const { result } = renderHook(() =>
      useAppShellAside({
        storage: memory,
        defaultCollapsed: true,
        isNarrow: true,
      }),
    )

    expect(result.current.overlayOpen).toBe(false)

    act(() => {
      result.current.setOverlayOpen(true)
    })

    expect(result.current.overlayOpen).toBe(true)
    // Storage only holds width and collapsed preference, never overlayOpen
    expect(memory.read()?.collapsed).toBe(true)

    act(() => {
      result.current.toggleOverlay()
    })

    expect(result.current.overlayOpen).toBe(false)
  })

  it('preserves desktop preference when resizing between desktop and narrow', () => {
    const { result, rerender } = renderHook(
      ({ isNarrow }) =>
        useAppShellAside({
          storage: memory,
          defaultCollapsed: false, // Desktop starts expanded
          isNarrow,
        }),
      { initialProps: { isNarrow: false } },
    )

    expect(result.current.collapsed).toBe(false)
    expect(result.current.isNarrow).toBe(false)

    // User expands overlay in narrow mode
    rerender({ isNarrow: true })
    expect(result.current.isNarrow).toBe(true)
    expect(result.current.overlayOpen).toBe(false)

    act(() => {
      result.current.setOverlayOpen(true)
    })
    expect(result.current.overlayOpen).toBe(true)

    // Switch back to desktop: overlay closes, desktop collapsed preference is intact
    rerender({ isNarrow: false })
    expect(result.current.isNarrow).toBe(false)
    expect(result.current.overlayOpen).toBe(false)
    expect(result.current.collapsed).toBe(false)
    expect(memory.read()?.collapsed).toBe(false)
  })
})

describe('admitted focus return', () => {
  it('returns trigger when connected, enabled, and admitted', () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)

    const isAdmitted = vi.fn().mockReturnValue(true)
    const target = resolveAdmittedFocusTarget({ trigger, isAdmitted })

    expect(target).toBe(trigger)
    expect(isAdmitted).toHaveBeenCalledWith(trigger)

    document.body.removeChild(trigger)
  })

  it('falls back to explicit target when trigger is disconnected', () => {
    const trigger = document.createElement('button') // Not appended to document
    const fallback = document.createElement('button')
    document.body.appendChild(fallback)

    const target = resolveAdmittedFocusTarget({
      trigger,
      fallbackTarget: fallback,
    })

    expect(target).toBe(fallback)
    document.body.removeChild(fallback)
  })

  it('falls back when trigger is disabled or fails admission', () => {
    const trigger = document.createElement('button')
    trigger.setAttribute('disabled', 'true')
    document.body.appendChild(trigger)

    const fallback = document.createElement('button')
    document.body.appendChild(fallback)

    const targetDisabled = resolveAdmittedFocusTarget({
      trigger,
      fallbackTarget: fallback,
    })
    expect(targetDisabled).toBe(fallback)

    trigger.removeAttribute('disabled')
    const targetUnadmitted = resolveAdmittedFocusTarget({
      trigger,
      isAdmitted: () => false,
      fallbackTarget: fallback,
    })
    expect(targetUnadmitted).toBe(fallback)

    document.body.removeChild(trigger)
    document.body.removeChild(fallback)
  })

  it('returns null and does not guess DOM when no valid target exists', () => {
    const trigger = document.createElement('button')
    trigger.setAttribute('disabled', 'true')

    const target = resolveAdmittedFocusTarget({ trigger })
    expect(target).toBeNull()
  })

  it('refuses stale callbacks from retired source generations', () => {
    const memory = createMemoryStorage<AppShellAsidePreference>()
    let currentGen = 'gen-1'

    const { result, rerender } = renderHook(
      ({ gen }) =>
        useAppShellAside({
          storage: memory,
          sourceGeneration: gen,
          defaultCollapsed: true,
        }),
      { initialProps: { gen: currentGen } },
    )

    // Capture callback from gen-1
    const staleSetCollapsed = result.current.setCollapsed

    // Advance source generation
    currentGen = 'gen-2'
    rerender({ gen: currentGen })

    // Invoke stale callback
    act(() => {
      staleSetCollapsed(false)
    })

    // State should not have changed because stale callback was rejected
    expect(result.current.collapsed).toBe(true)
    expect(memory.read()?.collapsed).toBe(true)

    // Current callback works
    act(() => {
      result.current.setCollapsed(false)
    })
    expect(result.current.collapsed).toBe(false)
    expect(memory.read()?.collapsed).toBe(false)
  })
})


describe('callback custody', () => {
  it('rejects every retired source, access, layer, store and unmounted callback, including reused IDs', () => {
    const trigger = document.createElement('button')
    const other = document.createElement('button')
    document.body.append(trigger, other)
    const store = createAppShellAsideStore({ storage: createMemoryStorage(), defaultCollapsed: true })
    const replacement = createAppShellAsideStore({ storage: createMemoryStorage(), defaultCollapsed: true })
    const { result, rerender, unmount } = renderHook(
      ({ generation, currentStore }) => useAppShellAside({ store: currentStore, sourceGeneration: generation, isNarrow: true }),
      { initialProps: { generation: 'source-A/access-A/layer-A', currentStore: store } },
    )
    result.current.triggerRef.current = trigger
    const retired = []
    for (const generation of ['source-B/access-A/layer-A', 'source-B/access-B/layer-A', 'source-B/access-B/layer-B', 'source-A/access-A/layer-A']) {
      retired.push(result.current)
      rerender({ generation, currentStore: store })
    }
    retired.push(result.current)
    rerender({ generation: 'source-A/access-A/layer-A', currentStore: replacement })
    other.focus()
    for (const handle of retired) {
      act(() => {
        handle.setWidth('wide'); handle.setCollapsed(false); handle.toggleCollapsed()
        handle.setOverlayOpen(true); handle.toggleOverlay()
        expect(handle.restoreFocus()).toBe(false)
      })
    }
    expect(store.getSnapshot()).toEqual({ width: 'regular', collapsed: true })
    expect(replacement.getSnapshot()).toEqual({ width: 'regular', collapsed: true })
    expect(result.current.overlayOpen).toBe(false)
    expect(document.activeElement).toBe(other)
    // Positive current control: same connected DOM target and actual writes.
    act(() => {
      result.current.setWidth('compact'); result.current.setCollapsed(false)
      result.current.setOverlayOpen(true)
      expect(result.current.restoreFocus()).toBe(true)
    })
    expect(document.activeElement).toBe(trigger)
    expect(replacement.getSnapshot()).toEqual({ width: 'compact', collapsed: false })
    expect(result.current.overlayOpen).toBe(true)
    const last = result.current
    unmount()
    other.focus()
    act(() => {
      last.setWidth('wide'); last.toggleCollapsed(); last.setOverlayOpen(false)
      expect(last.restoreFocus()).toBe(false)
    })
    expect(replacement.getSnapshot()).toEqual({ width: 'compact', collapsed: false })
    expect(document.activeElement).toBe(other)
    trigger.remove(); other.remove()
  })
})
