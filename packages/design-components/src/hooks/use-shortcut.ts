import { useLayoutEffect, useRef } from 'react'
import { defaultEscapeStack, type EscapeStack } from '../lib/escape-stack'
import {
  hasActiveModalOverlay,
  isComposingEvent,
  isEditableTarget,
  isInteractiveTarget,
  matchExactModifiers,
  type ExactModifierConfig,
} from '../lib/keyboard-guards'

export interface UseShortcutOptions {
  /** The key string to match (e.g. 'k', '/', 'Enter'). Case-insensitive for alpha. */
  key: string
  /** Exact modifier configuration required. */
  modifiers?: ExactModifierConfig
  /** Handler fired when the shortcut matches all admission rules. */
  onTrigger: (event: KeyboardEvent) => void
  /** Whether the shortcut is active. Default: true. */
  enabled?: boolean
  /**
   * Allow triggering when focus is inside an interactive control (button, link, tab, menuitem).
   * Default: true (unsuppressed outside editable targets unless explicitly set to false).
   */
  allowInInteractive?: boolean
  /** Allow triggering when focus is inside an editable field (input, textarea). Default: false. */
  allowInEditable?: boolean
  /** Allow triggering during IME composition. Default: false. */
  allowInIME?: boolean
  /** Suspend shortcut when an active modal overlay owns keyboard focus. Default: true. */
  preventWhenOverlayActive?: boolean
  /** Call event.preventDefault() upon match. Default: true. */
  preventDefault?: boolean
  /** Call event.stopPropagation() upon match. Default: true. */
  stopPropagation?: boolean
  /** Optional custom EscapeStack to check for active overlay ownership. */
  escapeStack?: EscapeStack
  /** Caller-owned admission predicate. If returns false, shortcut is suppressed. */
  isAdmitted?: () => boolean
  /** Whether the shortcut is accessible (not disabled/inert). Default: true. */
  accessible?: boolean
  /** Source generation token to invalidate stale registrations. */
  sourceGeneration?: unknown
}

export interface UseShortcutResult {
  /** Whether the shortcut registration is currently live. */
  isLive: () => boolean
  /**
   * Positive/negative control invocation with full admission checks.
   * Returns true if invocation succeeded within live frame, false if retired or unadmitted.
   */
  trigger: (event?: KeyboardEvent) => boolean
}

export function useShortcut(options: UseShortcutOptions): UseShortcutResult {
  const { enabled = true } = options

  const leaseRef = useRef(0)
  const activeLeaseRef = useRef(0)
  const currentLeaseRef = useRef(0)
  const frame = {}
  const currentFrame = useRef(frame)
  const latestRef = useRef<{
    options: UseShortcutOptions
    live: () => boolean
  }>({
    options,
    live: () => false,
  })

  useLayoutEffect(() => {
    currentFrame.current = frame
  })

  useLayoutEffect(() => {
    const lease = ++leaseRef.current
    activeLeaseRef.current = lease
    currentLeaseRef.current = lease
    return () => {
      if (activeLeaseRef.current === lease) {
        activeLeaseRef.current = 0
      }
    }
  }, [])

  const live = () =>
    activeLeaseRef.current !== 0 &&
    activeLeaseRef.current === currentLeaseRef.current &&
    currentFrame.current === frame

  // Refresh latest handler, options, and live fence on every commit
  useLayoutEffect(() => {
    latestRef.current = {
      options,
      live,
    }
  })

  useLayoutEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      const current = latestRef.current
      if (!current.live() || current.options.enabled === false) return

      const opts = current.options
      const stack = opts.escapeStack ?? defaultEscapeStack

      // Suspend if active overlay owns keys (registered in escapeStack OR unregistered modal overlay)
      if (
        opts.preventWhenOverlayActive !== false &&
        (stack.hasActiveLayer() || hasActiveModalOverlay())
      ) {
        return
      }

      if (opts.isAdmitted && !opts.isAdmitted()) return
      if (opts.accessible === false) return

      if (event.defaultPrevented) return

      // IME composition guard
      if (!opts.allowInIME && isComposingEvent(event)) {
        return
      }

      // Interactive target check (opt-in suppression via allowInInteractive: false)
      if (opts.allowInInteractive === false && isInteractiveTarget(event.target)) {
        return
      }

      // Editable target guard
      if (!opts.allowInEditable && isEditableTarget(event.target)) {
        return
      }

      // Match key (case-insensitive for letters)
      const targetKey = opts.key.toLowerCase()
      const pressedKey = event.key.toLowerCase()
      if (pressedKey !== targetKey) return

      // Match exact modifiers
      if (!matchExactModifiers(event, opts.modifiers)) return

      if (opts.preventDefault !== false) {
        event.preventDefault()
      }
      if (opts.stopPropagation !== false) {
        event.stopPropagation()
      }

      opts.onTrigger(event)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled])

  return {
    isLive: live,
    trigger: (event?: KeyboardEvent): boolean => {
      const current = latestRef.current
      if (!current.live() || current.options.enabled === false) return false

      const opts = current.options
      const stack = opts.escapeStack ?? defaultEscapeStack

      if (
        opts.preventWhenOverlayActive !== false &&
        (stack.hasActiveLayer() || hasActiveModalOverlay())
      ) {
        return false
      }

      if (opts.isAdmitted && !opts.isAdmitted()) return false
      if (opts.accessible === false) return false

      const e = event ?? new KeyboardEvent('keydown', { key: opts.key, bubbles: true, cancelable: true })

      if (e.defaultPrevented) return false
      if (!opts.allowInIME && isComposingEvent(e)) return false

      const target = e.target ?? (typeof document !== 'undefined' ? document.activeElement : null)
      if (opts.allowInInteractive === false && isInteractiveTarget(target)) return false
      if (!opts.allowInEditable && isEditableTarget(target)) return false

      if (opts.modifiers && !matchExactModifiers(e, opts.modifiers)) return false

      if (opts.preventDefault !== false && typeof e.preventDefault === 'function') {
        e.preventDefault()
      }
      if (opts.stopPropagation !== false && typeof e.stopPropagation === 'function') {
        e.stopPropagation()
      }

      opts.onTrigger(e)
      return true
    },
  }
}

