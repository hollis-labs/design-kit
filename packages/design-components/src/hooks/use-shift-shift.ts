import { useLayoutEffect, useRef } from 'react'
import { defaultEscapeStack, type EscapeStack } from '../lib/escape-stack'
import { isComposingEvent, isEditableTarget } from '../lib/keyboard-guards'

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
  /** Whether to suppress when an active modal overlay owns keyboard focus. Default: true. */
  preventWhenOverlayActive?: boolean
  /** Optional custom EscapeStack to check for active overlay ownership. */
  escapeStack?: EscapeStack
}

export interface UseShiftShiftResult {
  /** Whether the hook is currently mounted and active. */
  isLive: () => boolean
  /** Manually reset the double-tap timer. */
  reset: () => void
  /**
   * Test-only positive/negative control invocation.
   * Returns true if invocation succeeded within live frame, false if retired.
   */
  trigger: () => boolean
}

export function useShiftShift(options: UseShiftShiftOptions): UseShiftShiftResult {
  const {
    onTrigger,
    thresholdMs = 300,
    enabled = true,
    getTime,
    preventInEditable = true,
    preventInIME = true,
    preventWhenOverlayActive = true,
    escapeStack = defaultEscapeStack,
  } = options

  const mounted = useRef(false)
  const frame = {}
  const currentFrame = useRef(frame)
  const lastShiftTime = useRef<number>(0)

  useLayoutEffect(() => {
    currentFrame.current = frame
  })

  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const live = () => mounted.current && currentFrame.current === frame

  const resolveNow = (): number => {
    if (getTime) return getTime()
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now()
    }
    return Date.now()
  }

  useLayoutEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      if (!live() || !enabled) return

      // Suppress if active overlay owns keys
      if (preventWhenOverlayActive && escapeStack.hasActiveLayer()) {
        lastShiftTime.current = 0
        return
      }

      // Suppress if default already prevented
      if (event.defaultPrevented) return

      // Suppress during active IME composition
      if (preventInIME && isComposingEvent(event)) {
        lastShiftTime.current = 0
        return
      }

      // Suppress when modifiers are held
      if (event.metaKey || event.ctrlKey || event.altKey) {
        lastShiftTime.current = 0
        return
      }

      // Suppress in editable targets
      if (preventInEditable && isEditableTarget(event.target)) {
        lastShiftTime.current = 0
        return
      }

      // Any non-Shift key immediately resets the tap window
      if (event.key !== 'Shift') {
        lastShiftTime.current = 0
        return
      }

      const now = resolveNow()
      const delta = now - lastShiftTime.current

      if (lastShiftTime.current > 0 && delta <= thresholdMs) {
        event.preventDefault()
        lastShiftTime.current = 0
        onTrigger()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    thresholdMs,
    getTime,
    preventInEditable,
    preventInIME,
    preventWhenOverlayActive,
    escapeStack,
    onTrigger,
  ])

  return {
    isLive: live,
    reset: () => {
      lastShiftTime.current = 0
    },
    trigger: () => {
      if (!live() || !enabled) return false
      onTrigger()
      return true
    },
  }
}
