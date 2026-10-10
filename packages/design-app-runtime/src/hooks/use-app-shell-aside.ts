import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react'
import {
  createAppShellAsideStore,
  type AppShellAsideStore,
  type AppShellAsideStoreOptions,
  type AsideWidth,
} from '../lib/app-shell-aside-store'

export interface FocusReturnTargetOptions {
  trigger?: HTMLElement | null | (() => HTMLElement | null)
  isAdmitted?: (trigger: HTMLElement) => boolean
  isFallbackAdmitted?: (target: HTMLElement) => boolean
  fallbackTarget?: HTMLElement | null | (() => HTMLElement | null)
}

/**
 * Resolves an admitted focus return target:
 * 1. Checks opening trigger: must be connected in DOM, not disabled, and admitted.
 * 2. If trigger is missing/disconnected/disabled/unadmitted: falls back to explicit caller fallbackTarget.
 * 3. Never guesses random hidden DOM elements.
 */
export function resolveAdmittedFocusTarget(options: FocusReturnTargetOptions): HTMLElement | null {
  const rawTrigger = typeof options.trigger === 'function' ? options.trigger() : options.trigger
  if (
    rawTrigger &&
    rawTrigger instanceof HTMLElement &&
    rawTrigger.isConnected &&
    !rawTrigger.matches(':disabled') &&
    (!options.isAdmitted || options.isAdmitted(rawTrigger))
  ) {
    return rawTrigger
  }

  const rawFallback =
    typeof options.fallbackTarget === 'function' ? options.fallbackTarget() : options.fallbackTarget
  if (
    rawFallback &&
    rawFallback instanceof HTMLElement &&
    rawFallback.isConnected &&
    !rawFallback.matches(':disabled') &&
    (!options.isFallbackAdmitted || options.isFallbackAdmitted(rawFallback))
  ) {
    return rawFallback
  }

  return null
}

export interface UseAppShellAsideOptions extends AppShellAsideStoreOptions {
  /** Existing store instance to share. If omitted, one is created from options. */
  store?: AppShellAsideStore
  /** Explicit narrow viewport override (e.g. for testing / Storybook). */
  isNarrow?: boolean
  /** Explicit fallback target for focus return when trigger is disconnected/disabled/unadmitted. */
  focusFallbackTarget?: HTMLElement | null | (() => HTMLElement | null)
  /** Admission predicate to verify if trigger element is eligible for focus return. */
  isFallbackAdmitted?: (target: HTMLElement) => boolean
  isTriggerAdmitted?: (trigger: HTMLElement) => boolean
  /** Active source/access/layer generation. Callbacks from retired generations will fail. */
  sourceGeneration?: unknown
}

export interface AppShellAsideHandle {
  /** Current aside width preset ('compact' | 'regular' | 'wide'). */
  width: AsideWidth
  /** Update width preset and persist to storage. */
  setWidth: (width: AsideWidth) => void
  /** Current desktop collapsed state (persisted). */
  collapsed: boolean
  /** Update desktop collapsed state and persist to storage. */
  setCollapsed: (collapsed: boolean) => void
  /** Toggle desktop collapsed state and persist to storage. */
  toggleCollapsed: () => void
  /** Temporary narrow-screen overlay open state (never persisted). */
  overlayOpen: boolean
  /** Set temporary narrow-screen overlay open state. */
  setOverlayOpen: (open: boolean) => void
  /** Toggle temporary narrow-screen overlay open state. */
  toggleOverlay: () => void
  /** Whether the viewport is currently narrow (< 1024px). */
  isNarrow: boolean
  /** Reference to opening trigger element for focus return. */
  triggerRef: RefObject<HTMLElement | null>
  /** Restore focus safely to admitted trigger or fallback target. Returns true if focused. */
  restoreFocus: () => boolean
  /** Props ready to spread onto <AppShell>. */
  asideProps: {
    asideWidth: AsideWidth
    asideCollapsed: boolean
    onAsideCollapsedChange: (collapsed: boolean) => void
    asideOverlayOpen: boolean
    onAsideOverlayOpenChange: (open: boolean) => void
    isNarrow: boolean
    asideFocusReturnTarget: () => HTMLElement | null
    asideFocusFallbackTarget?: HTMLElement | null | (() => HTMLElement | null)
    isAsideTriggerAdmitted?: (target: HTMLElement) => boolean
    isAsideFallbackAdmitted?: (target: HTMLElement) => boolean
  }
}

/**
 * Persisted AppShell aside hook via design-app-runtime storage.
 *
 * Manages:
 * - Persistent desktop asideWidth presets ('compact' | 'regular' | 'wide')
 * - Persistent desktop asideCollapsed state
 * - Narrow-screen OverlaySidebar fallback below 1024px ('lg')
 * - In-memory temporary overlay open state (never written to storage)
 * - Safe admitted focus return and resize preservation
 */
export function useAppShellAside(
  optionsOrStore: UseAppShellAsideOptions | AppShellAsideStore = {},
): AppShellAsideHandle {
  const options: UseAppShellAsideOptions =
    'getSnapshot' in optionsOrStore ? { store: optionsOrStore } : optionsOrStore
  const {
    store: providedStore,
    isNarrow: controlledNarrow,
    focusFallbackTarget,
    isTriggerAdmitted,
    isFallbackAdmitted,
    sourceGeneration,
    ...storeOptions
  } = options

  const store = useMemo(
    () => providedStore ?? createAppShellAsideStore(storeOptions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [providedStore, storeOptions.appNamespace, storeOptions.storageKey, storeOptions.defaultWidth, storeOptions.defaultCollapsed, storeOptions.storage, storeOptions.narrowBreakpoint],
  )

  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)

  const [overlayOpen, setOverlayOpenState] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)
  // Viewport detection below narrowBreakpoint using useSyncExternalStore
  const query = `(max-width: ${store.narrowBreakpoint - 1}px)`

  const subscribeMedia = useCallback(
    (callback: () => void) => {
      if (typeof window === 'undefined') return () => {}
      const mql = window.matchMedia?.(query)
      if (!mql) return () => {}
      mql.addEventListener?.('change', callback)
      return () => {
        mql.removeEventListener?.('change', callback)
      }
    },
    [query],
  )

  const getMediaSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false
    return Boolean(window.matchMedia?.(query).matches)
  }, [query])

  const getMediaServerSnapshot = useCallback(() => false, [])

  const mediaNarrow = useSyncExternalStore(subscribeMedia, getMediaSnapshot, getMediaServerSnapshot)
  const isNarrow = controlledNarrow ?? mediaNarrow

  // A retired lease stays retired even if a caller later reuses the same generation ID.
  const lease = useMemo(() => ({ store, sourceGeneration, isNarrow, overlayOpen }), [store, sourceGeneration, isNarrow, overlayOpen])
  const currentLease = useRef<typeof lease | null>(null)
  useLayoutEffect(() => {
    currentLease.current = lease
    return () => { currentLease.current = null }
  }, [lease])


  const restoreFocus = useCallback(() => {
    if (currentLease.current !== lease) return false

    const target = resolveAdmittedFocusTarget({
      trigger: triggerRef.current,
      isAdmitted: isTriggerAdmitted,
      fallbackTarget: focusFallbackTarget,
      isFallbackAdmitted,
    })

    if (target && typeof target.focus === 'function') {
      target.focus()
      return true
    }
    return false
  }, [isTriggerAdmitted, focusFallbackTarget, isFallbackAdmitted, lease])

  // Resize handling: switching between persistent desktop and narrow overlay
  const [prevNarrow, setPrevNarrow] = useState(isNarrow)
  if (prevNarrow !== isNarrow) {
    setPrevNarrow(isNarrow)
    if (overlayOpen) {
      setOverlayOpenState(false)
    }
  }

  const [previousSource, setPreviousSource] = useState({ store, sourceGeneration })
  if (previousSource.store !== store || previousSource.sourceGeneration !== sourceGeneration) {
    setPreviousSource({ store, sourceGeneration })
    if (overlayOpen) setOverlayOpenState(false)
  }

  const setWidth = useCallback(
    (width: AsideWidth) => {
      if (currentLease.current !== lease) return
      store.setWidth(width)
    },
    [store, lease],
  )

  const setCollapsed = useCallback(
    (collapsed: boolean) => {
      if (currentLease.current !== lease) return
      store.setCollapsed(collapsed)
    },
    [store, lease],
  )

  const toggleCollapsed = useCallback(() => {
    if (currentLease.current !== lease) return
    store.toggleCollapsed()
  }, [store, lease])

  const setOverlayOpen = useCallback(
    (open: boolean) => {
      if (currentLease.current !== lease) return
      setOverlayOpenState(open)
    },
    [lease],
  )

  const toggleOverlay = useCallback(() => {
    if (currentLease.current !== lease) return
    setOverlayOpenState((prev) => !prev)
  }, [lease])

  return {
    width: state.width,
    setWidth,
    collapsed: state.collapsed,
    setCollapsed,
    toggleCollapsed,
    overlayOpen,
    setOverlayOpen,
    toggleOverlay,
    isNarrow,
    triggerRef,
    restoreFocus,
    asideProps: {
      asideWidth: state.width,
      asideCollapsed: state.collapsed,
      onAsideCollapsedChange: setCollapsed,
      asideOverlayOpen: overlayOpen,
      onAsideOverlayOpenChange: setOverlayOpen,
      isNarrow,
      asideFocusReturnTarget: () => currentLease.current === lease ? triggerRef.current : null,
      asideFocusFallbackTarget: focusFallbackTarget,
      isAsideTriggerAdmitted: (target) => currentLease.current === lease && (!isTriggerAdmitted || isTriggerAdmitted(target)),
      isAsideFallbackAdmitted: (target) => currentLease.current === lease && (!isFallbackAdmitted || isFallbackAdmitted(target)),
    },
  }
}
