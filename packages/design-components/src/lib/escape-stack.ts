/**
 * Centralized LIFO Layered Escape Stack.
 *
 * Rules:
 * 1. Strict LIFO ordering: the innermost (most recently activated) active layer
 *    owns the Escape key. Priority cannot override activation order without an
 *    explicit scope hierarchy contract.
 * 2. Input-clearing before closing: when focus is inside a clearable input within
 *    the active layer, Escape clears the input first and consumes the event.
 *    Only once the input is clear does a subsequent Escape dismiss the layer.
 * 3. Immediate consumption: a handled Escape halts both React bubbling and native
 *    propagation (`stopPropagation()`, `stopImmediatePropagation()`), ensuring
 *    no parent overlay or background query handler receives the event.
 * 4. Stale callback prevention: every layer invocation checks the caller's `live()`
 *    fence; retired callbacks cannot fire.
 */

import { restoreAdmittedFocus, type FocusReturnOptions } from './focus-return'
import { isComposingEvent } from './keyboard-guards'

export type EscapeHandlingAction = 'cleared' | 'closed' | 'ignored'

export interface LayeredEscapeRegistration {
  id: string
  scopeId?: string
  priority?: number
  active: boolean
  accessible: boolean
  /** Committed frame fence: must return true for callback to execute. */
  live: () => boolean
  /**
   * Primary Escape handler.
   * Return 'cleared' if an input was cleared, 'closed' if dismissed,
   * or true to indicate the event was fully consumed. Return false or 'ignored'
   * if unhandled.
   */
  onEscape: (event: KeyboardEvent) => EscapeHandlingAction | boolean | void
  /** Optional input clear hook to attempt before layer dismissal. */
  onClearInput?: () => boolean
  /** Optional focus return configuration for when the layer closes. */
  focusReturn?: FocusReturnOptions
  /** Root DOM element of the layer, if available, for scope/containment checks. */
  rootElement?: HTMLElement | null | (() => HTMLElement | null)
}

export class EscapeStack {
  private layers: LayeredEscapeRegistration[] = []
  private listenerAttached = false
  private boundHandler: (e: KeyboardEvent) => void

  constructor() {
    this.boundHandler = this.handleKeyDown.bind(this)
  }

  /** Register or update a layer in the stack. */
  register(layer: LayeredEscapeRegistration): () => void {
    const existingIndex = this.layers.findIndex((l) => l.id === layer.id)
    if (existingIndex >= 0) {
      // Update in place if already present to preserve stack position unless active state changed
      const wasActive = this.layers[existingIndex].active
      this.layers[existingIndex] = layer
      if (!wasActive && layer.active) {
        // Moved from inactive to active -> push to top of LIFO stack
        this.layers.splice(existingIndex, 1)
        this.layers.push(layer)
      }
    } else if (layer.active) {
      this.layers.push(layer)
    }

    this.ensureListener()

    return () => {
      this.unregister(layer.id)
    }
  }

  /** Unregister a layer by ID. */
  unregister(id: string): void {
    const index = this.layers.findIndex((l) => l.id === id)
    if (index >= 0) {
      this.layers.splice(index, 1)
    }
    if (this.getActiveLayers().length === 0) {
      this.removeListener()
    }
  }

  /** Retrieve all currently active, accessible, and live layers in LIFO order. */
  getActiveLayers(): LayeredEscapeRegistration[] {
    return this.layers.filter((l) => l.active && l.accessible && l.live())
  }

  /** Retrieve the topmost (innermost) active layer. */
  getTopLayer(): LayeredEscapeRegistration | null {
    const active = this.getActiveLayers()
    if (active.length === 0) return null
    // LIFO: last registered / activated layer is at the end of the array
    return active[active.length - 1]
  }

  /** Check if any active overlay currently owns keyboard focus/shortcuts. */
  hasActiveLayer(): boolean {
    return this.getActiveLayers().length > 0
  }

  /** Dispatch native keydown event through the LIFO stack. */
  handleKeyDown(event: KeyboardEvent): boolean {
    if (event.key !== 'Escape') return false
    if (event.defaultPrevented) return false
    if (isComposingEvent(event)) return false

    const topLayer = this.getTopLayer()
    if (!topLayer) return false

    // Consume native event immediately to protect background and sibling listeners
    event.preventDefault()
    event.stopPropagation()
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation()
    }

    // 1. Try input clearing first if layer declared an input clear hook
    if (topLayer.onClearInput && topLayer.onClearInput()) {
      return true
    }

    // 2. Dispatch to layer's onEscape handler
    const result = topLayer.onEscape(event)
    const handled = result === true || result === 'cleared' || result === 'closed'

    // 3. If closed and focus return options are present, restore focus
    if (result === 'closed' || result === true) {
      if (topLayer.focusReturn) {
        restoreAdmittedFocus(topLayer.focusReturn)
      }
    }

    return handled
  }

  private ensureListener(): void {
    if (this.listenerAttached) return
    if (typeof window === 'undefined') return
    window.addEventListener('keydown', this.boundHandler, true) // capture phase ensures precedence over bubbling
    this.listenerAttached = true
  }

  private removeListener(): void {
    if (!this.listenerAttached) return
    if (typeof window === 'undefined') return
    window.removeEventListener('keydown', this.boundHandler, true)
    this.listenerAttached = false
  }

  /** Clear all registrations (useful for test teardown). */
  reset(): void {
    this.layers = []
    this.removeListener()
  }
}

/** Global default escape stack instance. */
export const defaultEscapeStack = new EscapeStack()
