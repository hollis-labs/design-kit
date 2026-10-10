/**
 * Focus return resolver with connection, disabled, and caller admission guards.
 *
 * Rules:
 * 1. Focus returns to the opening trigger only if it is currently connected in
 *    the DOM (`trigger.isConnected`), not disabled (`!trigger.matches(':disabled')`),
 *    and admitted by the caller's admission check (`isAdmitted(trigger)`).
 * 2. If the trigger is disconnected, disabled, or fails source admission,
 *    focus falls back to the caller's explicit fallback target.
 * 3. No hidden persistence or uncoordinated global mutations.
 */

export interface FocusReturnOptions {
  /** The element that opened the overlay / layer. */
  trigger?: HTMLElement | null | (() => HTMLElement | null)
  /** Caller-owned admission predicate (e.g. record still in active projection). */
  isAdmitted?: (trigger: HTMLElement) => boolean
  /** Explicit fallback if trigger is missing, disconnected, or unadmitted. */
  isFallbackAdmitted?: (target: HTMLElement) => boolean
  fallbackTarget?: HTMLElement | null | (() => HTMLElement | null)
}

function visibleReturnTarget(target: HTMLElement): boolean {
  if (target.closest('[hidden], [inert], [aria-hidden="true"], [aria-disabled="true"]')) return false
  const view = target.ownerDocument.defaultView
  for (let node: HTMLElement | null = target; node; node = node.parentElement) {
    const style = view?.getComputedStyle(node)
    if (style?.display === 'none' || style?.visibility === 'hidden') return false
  }
  return !target.matches('input[type="hidden"]')
}

/** Resolve the admitted focus return element. */
export function resolveAdmittedFocusTarget(options: FocusReturnOptions): HTMLElement | null {
  const rawTrigger = typeof options.trigger === 'function' ? options.trigger() : options.trigger
  if (
    rawTrigger &&
    rawTrigger instanceof HTMLElement &&
    rawTrigger.isConnected &&
    !rawTrigger.matches(':disabled') &&
    visibleReturnTarget(rawTrigger) &&
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
    visibleReturnTarget(rawFallback) &&
    (!options.isFallbackAdmitted || options.isFallbackAdmitted(rawFallback))
  ) {
    return rawFallback
  }

  return null
}

/** Restore focus to the admitted return target, returning true if focused. */
export function restoreAdmittedFocus(options: FocusReturnOptions): boolean {
  const target = resolveAdmittedFocusTarget(options)
  if (target && typeof target.focus === 'function') {
    target.focus()
    return target.ownerDocument.activeElement === target
  }
  return false
}
