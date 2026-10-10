import { useId, useLayoutEffect, useRef } from 'react'
import {
  defaultEscapeStack,
  type EscapeHandlingAction,
  type EscapeStack,
} from '../lib/escape-stack'
import type { FocusReturnOptions } from '../lib/focus-return'

export interface UseLayeredEscapeOptions {
  /** Whether this layer is currently open/active in the stack. */
  active: boolean
  /** Whether the layer is accessible (e.g. not disabled or inert). Default: true. */
  accessible?: boolean
  /** Scope identifier to group nested layers. */
  scopeId?: string
  /** Priority tier for tie-breaking within identical activation frames. Default: 0. */
  priority?: number
  /**
   * Primary Escape handler.
   * Return 'cleared' when clearing an internal input, 'closed' when dismissing,
   * or boolean true if handled.
   */
  onEscape: (event: KeyboardEvent) => EscapeHandlingAction | boolean | void
  /**
   * Optional hook to clear an active search/filter input prior to closing.
   * Returns true if input was cleared (consuming Escape), false otherwise.
   */
  onClearInput?: () => boolean
  /** The element that opened this layer, for admitted focus return. */
  trigger?: HTMLElement | null | (() => HTMLElement | null)
  /** Caller-owned admission predicate for focus return. */
  isAdmitted?: (trigger: HTMLElement) => boolean
  /** Fallback element if trigger is disconnected or unadmitted. */
  fallbackReturnTarget?: HTMLElement | null | (() => HTMLElement | null)
  /** Root element of the layer for containment checks. */
  rootElement?: HTMLElement | null | (() => HTMLElement | null)
  /** Optional custom EscapeStack instance (defaults to defaultEscapeStack). */
  escapeStack?: EscapeStack
  /** Source generation token to invalidate stale registrations. */
  sourceGeneration?: unknown
}

export interface UseLayeredEscapeResult {
  /** Unique ID assigned to this layer registration. */
  layerId: string
  /** Whether this layer is currently the topmost active layer in the stack. */
  isTopmost: () => boolean
  /** Programmatically dispatch Escape to this layer if live. */
  handleEscape: (event?: KeyboardEvent) => boolean
}

export function useLayeredEscape(options: UseLayeredEscapeOptions): UseLayeredEscapeResult {
  const {
    active,
    accessible = true,
    scopeId,
    priority = 0,
    onEscape,
    onClearInput,
    trigger,
    isAdmitted,
    fallbackReturnTarget,
    rootElement,
    escapeStack = defaultEscapeStack,
    sourceGeneration,
  } = options

  const layerId = useId()
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

  const focusReturn: FocusReturnOptions = {
    trigger,
    isAdmitted,
    fallbackTarget: fallbackReturnTarget,
  }

  useLayoutEffect(() => {
    if (!live()) return

    const unregister = escapeStack.register({
      id: layerId,
      scopeId,
      priority,
      active,
      accessible,
      live,
      onEscape: (e) => {
        if (!live()) return false
        return onEscape(e)
      },
      onClearInput: () => {
        if (!live() || !onClearInput) return false
        return onClearInput()
      },
      focusReturn,
      rootElement,
    })

    return () => {
      unregister()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    layerId,
    active,
    accessible,
    scopeId,
    priority,
    onEscape,
    onClearInput,
    trigger,
    isAdmitted,
    fallbackReturnTarget,
    rootElement,
    escapeStack,
    sourceGeneration,
  ])

  return {
    layerId,
    isTopmost: () => {
      const top = escapeStack.getTopLayer()
      return Boolean(top && top.id === layerId)
    },
    handleEscape: (event?: KeyboardEvent) => {
      if (!live() || !active || !accessible) return false
      const e = event ?? new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      return escapeStack.handleKeyDown(e)
    },
  }
}
