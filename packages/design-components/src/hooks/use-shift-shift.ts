import { useLayoutEffect, useRef } from 'react'
import { defaultEscapeStack, type EscapeStack } from '../lib/escape-stack'
import {
  hasActiveModalOverlay,
  isComposingEvent,
  isEditableTarget,
} from '../lib/keyboard-guards'

export interface UseShiftShiftOptions {
  /** Callback fired upon two consecutive Shift presses within the threshold. */
  onTrigger: () => void
  /** Double-tap window in milliseconds. Default: 300ms per DEC-079 Nil spec. */
  thresholdMs?: number
  /** Whether the listener is active. Default: true. */
  enabled?: boolean
  /** Time provider function for deterministic testing without Date.now(). */
  getTime?: () => number
  /** Whether to suppress inside editable inputs. Default: true. */
  preventInEditable?: boolean
  /** Whether to suppress during IME composition. Default: true. */
  preventInIME?: boolean
  /** Suspend shortcut when an active modal overlay owns keyboard focus. Default: true. */
  preventWhenOverlayActive?: boolean
  /** Optional custom EscapeStack to check for active overlay ownership. */
  escapeStack?: EscapeStack
  /** Caller-owned admission predicate. If returns false, shortcut is suppressed. */
  isAdmitted?: () => boolean
  /** Whether the shortcut is accessible (not disabled/inert). Default: true. */
  accessible?: boolean
  /** Source generation token to invalidate stale registrations. */
  sourceGeneration?: unknown
}

export interface UseShiftShiftResult {
  /** Whether the hook is currently mounted and active. */
  isLive: () => boolean
  /** Manually reset the double-tap timer. */
  reset: () => void
  /**
   * Test-only positive/negative control invocation with full admission checks.
   * Returns true if invocation succeeded within live frame, false if retired or unadmitted.
   */
  trigger: () => boolean
}

export function useShiftShift(options: UseShiftShiftOptions): UseShiftShiftResult {
  const { enabled = true } = options

  const leaseRef = useRef(0)
  const activeLeaseRef = useRef(0)
  const currentLeaseRef = useRef(0)
  const frame = {}
  const currentFrame = useRef(frame)
  const lastShiftTime = useRef<number>(0)
  const latestRef = useRef<{
    options: UseShiftShiftOptions
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

  const resolveNow = (customGetTime?: () => number): number => {
    if (customGetTime) return customGetTime()
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now()
    }
    return Date.now()
  }

  useLayoutEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      const current = latestRef.current
      if (!current.live() || current.options.enabled === false) return

      const opts = current.options
      const stack = opts.escapeStack ?? defaultEscapeStack

      // Suppress if active overlay owns keys (escapeStack OR unregistered modal overlay)
      if (
        opts.preventWhenOverlayActive !== false &&
        (stack.hasActiveLayer() || hasActiveModalOverlay())
      ) {
        lastShiftTime.current = 0
        return
      }

      if (opts.isAdmitted && !opts.isAdmitted()) return
      if (opts.accessible === false) return

      // Suppress if default already prevented
      if (event.defaultPrevented) return

      // Shift keydown repeat guard: holding Shift down fires repeated keydown events; ignore them
      if (event.repeat) {
        return
      }

      // Suppress during active IME composition
      if (opts.preventInIME !== false && isComposingEvent(event)) {
        lastShiftTime.current = 0
        return
      }

      // Suppress when modifiers are held
      if (event.metaKey || event.ctrlKey || event.altKey) {
        lastShiftTime.current = 0
        return
      }

      // Suppress in editable targets
      if (opts.preventInEditable !== false && isEditableTarget(event.target)) {
        lastShiftTime.current = 0
        return
      }

      // Any non-Shift key immediately resets the tap window
      if (event.key !== 'Shift') {
        lastShiftTime.current = 0
        return
      }

      const now = resolveNow(opts.getTime)

      // Clock-zero and invalid time controls
      if (now <= 0 || !Number.isFinite(now)) {
        lastShiftTime.current = 0
        return
      }

      // Backwards clock control: if time jumped backwards, reset window to current time
      if (lastShiftTime.current > 0 && now < lastShiftTime.current) {
        lastShiftTime.current = now
        return
      }

      const delta = now - lastShiftTime.current
      const threshold = opts.thresholdMs ?? 300

      if (lastShiftTime.current > 0 && delta >= 0 && delta <= threshold) {
        event.preventDefault()
        lastShiftTime.current = 0
        opts.onTrigger()
      } else {
        lastShiftTime.current = now
      }
    }

    function handleBlur() {
      lastShiftTime.current = 0
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', handleBlur)
    }
  }, [enabled])

  return {
    isLive: live,
    reset: () => {
      lastShiftTime.current = 0
    },
    trigger: (): boolean => {
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

      const target = typeof document !== 'undefined' ? document.activeElement : null
      if (opts.preventInEditable !== false && isEditableTarget(target)) return false

      opts.onTrigger()
      return true
    },
  }
}

