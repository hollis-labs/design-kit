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
  /** Monotonic activation sequence number representing render/activation order. */
  activationSeq?: number
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

    if (this.getActiveLayers().length > 0) {
      this.ensureListener()
    } else {
      this.removeListener()
    }

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

  /** Retrieve the topmost (innermost) active layer, respecting DOM containment, scope priority and LIFO order. */
  getTopLayer(target?: EventTarget | null): LayeredEscapeRegistration | null {
    const active = this.getActiveLayers()
    if (active.length === 0) return null

    // If target element is provided, check for DOM containment among registered rootElements
    if (target instanceof Element) {
      const containing = active.filter((l) => {
        const root = typeof l.rootElement === 'function' ? l.rootElement() : l.rootElement
        return root instanceof Element && root.contains(target)
      })

      if (containing.length > 0) {
        // Deepest DOM descendant wins; if equal, check scope priority; else activationSeq; else LIFO
        containing.sort((a, b) => {
          const rootA = typeof a.rootElement === 'function' ? a.rootElement() : a.rootElement
          const rootB = typeof b.rootElement === 'function' ? b.rootElement() : b.rootElement
          if (rootA instanceof Element && rootB instanceof Element && rootA !== rootB) {
            if (rootA.contains(rootB)) return -1 // B is inside A, so B is deeper
            if (rootB.contains(rootA)) return 1  // A is inside B, so A is deeper
          }
          if (a.scopeId && a.scopeId === b.scopeId && (a.priority ?? 0) !== (b.priority ?? 0)) {
            return (a.priority ?? 0) - (b.priority ?? 0)
          }
          if (
            a.activationSeq !== undefined &&
            b.activationSeq !== undefined &&
            a.activationSeq !== b.activationSeq
          ) {
            return a.activationSeq - b.activationSeq
          }
          return this.layers.indexOf(a) - this.layers.indexOf(b)
        })
        return containing[containing.length - 1]
      }
    }

    // Outside DOM containment: sort active layers by scope priority (if shared scopeId), activationSeq, then LIFO index
    active.sort((a, b) => {
      if (a.scopeId && a.scopeId === b.scopeId && (a.priority ?? 0) !== (b.priority ?? 0)) {
        return (a.priority ?? 0) - (b.priority ?? 0)
      }
      if (
        a.activationSeq !== undefined &&
        b.activationSeq !== undefined &&
        a.activationSeq !== b.activationSeq
      ) {
        return a.activationSeq - b.activationSeq
      }
      return this.layers.indexOf(a) - this.layers.indexOf(b)
    })
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

    const topLayer = this.getTopLayer(event.target)
    if (!topLayer) return false

    // 1. Try input clearing first if layer declared an input clear hook
    if (topLayer.onClearInput && topLayer.onClearInput()) {
      event.preventDefault()
      event.stopPropagation()
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation()
      }
      return true
    }

    // 2. Dispatch to layer's onEscape handler
    const result = topLayer.onEscape(event)
    const handled = result === true || result === 'cleared' || result === 'closed'

    if (handled) {
      event.preventDefault()
      event.stopPropagation()
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation()
      }

      // 3. If closed and focus return options are present, restore focus
      if (result === 'closed' || result === true) {
        if (topLayer.focusReturn) {
          restoreAdmittedFocus(topLayer.focusReturn)
        }
      }
    }

    return handled
  }

  private ensureListener(): void {
    if (this.listenerAttached) return
    if (typeof window === 'undefined') return
    // Bubble phase allows nested inputs and Base UI components to process Escape first
    window.addEventListener('keydown', this.boundHandler, false)
    this.listenerAttached = true
  }

  private removeListener(): void {
    if (!this.listenerAttached) return
    if (typeof window === 'undefined') return
    window.removeEventListener('keydown', this.boundHandler, false)
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
