import { useLayoutEffect, useRef } from 'react'
import { defaultEscapeStack, type EscapeStack } from '../lib/escape-stack'
import {
  isComposingEvent,
  isEditableTarget,
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
  /** Allow triggering when focus is inside an editable field. Default: false. */
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
}

export interface UseShortcutResult {
  /** Whether the shortcut registration is currently live. */
  isLive: () => boolean
  /**
   * Positive/negative control invocation.
   * Returns true if invocation succeeded within live frame, false if retired.
   */
  trigger: (event?: KeyboardEvent) => boolean
}

export function useShortcut(options: UseShortcutOptions): UseShortcutResult {
  const {
    key,
    modifiers,
    onTrigger,
    enabled = true,
    allowInEditable = false,
    allowInIME = false,
    preventWhenOverlayActive = true,
    preventDefault = true,
    stopPropagation = true,
    escapeStack = defaultEscapeStack,
  } = options

  const mounted = useRef(false)
  const frame = {}
  const currentFrame = useRef(frame)

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

  useLayoutEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      if (!live() || !enabled) return

      // Suspend if active overlay owns keys
      if (preventWhenOverlayActive && escapeStack.hasActiveLayer()) {
        return
      }

      if (event.defaultPrevented) return

      // IME composition guard
      if (!allowInIME && isComposingEvent(event)) {
        return
      }

      // Editable target guard
      if (!allowInEditable && isEditableTarget(event.target)) {
        return
      }

      // Match key (case-insensitive for letters)
      const targetKey = key.toLowerCase()
      const pressedKey = event.key.toLowerCase()
      if (pressedKey !== targetKey) return

      // Match exact modifiers
      if (!matchExactModifiers(event, modifiers)) return

      if (preventDefault) {
        event.preventDefault()
      }
      if (stopPropagation) {
        event.stopPropagation()
      }

      onTrigger(event)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    key,
    modifiers,
    onTrigger,
    enabled,
    allowInEditable,
    allowInIME,
    preventWhenOverlayActive,
    preventDefault,
    stopPropagation,
    escapeStack,
  ])

  return {
    isLive: live,
    trigger: (event?: KeyboardEvent) => {
      if (!live() || !enabled) return false
      const e = event ?? new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      onTrigger(e)
      return true
    },
  }
}
