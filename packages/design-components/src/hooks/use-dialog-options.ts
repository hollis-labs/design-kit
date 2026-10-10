import { useContext, createContext, useLayoutEffect, useState } from 'react'
import type { Dialog } from '@base-ui/react/dialog'
import { useCommittedShortcutFrame } from './use-committed-shortcut-frame'
import { resolveAdmittedFocusTarget, type FocusReturnOptions } from '../lib/focus-return'
import { isActiveOverlay, OVERLAY_SELECTOR } from '../lib/keyboard-guards'

/** Root open state shared with popup chrome; Base UI still owns modality and focus. */
export const DialogOpenContext = createContext(false)

export interface DialogOptions {
  /** Show an expand/collapse control. Existing dialogs remain bounded by default. */
  showFullscreenToggle?: boolean
  /** Controlled fullscreen state; omit for reset-on-open internal state. */
  fullscreen?: boolean
  onFullscreenChange?: (fullscreen: boolean) => void
  /** Opt-in sessionStorage key. Invalid or denied storage falls back to bounded. */
  fullscreenSessionKey?: string
  initialFocus?: Dialog.Popup.Props['initialFocus']
  finalFocus?: Dialog.Popup.Props['finalFocus']
  /** Explicit admitted return policy. Takes precedence over native finalFocus. */
  returnFocus?: FocusReturnOptions
}

function readPreference(key?: string) {
  try { return key !== undefined && sessionStorage.getItem(key) === 'true' } catch { return false }
}

export function useDialogOptions(options: DialogOptions) {
  const open = useContext(DialogOpenContext)
  const live = useCommittedShortcutFrame()
  const [expanded, setExpanded] = useState(() => readPreference(options.fullscreenSessionKey))
  useLayoutEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize an external session preference on each opening
      setExpanded(readPreference(options.fullscreenSessionKey))
    }
  }, [open, options.fullscreenSessionKey])
  const fullscreen = options.fullscreen ?? expanded
  return {
    fullscreen,
    toggle: () => {
      if (!live() || !open) return
      const next = !fullscreen
      if (options.fullscreen === undefined) setExpanded(next)
      try {
        if (options.fullscreenSessionKey !== undefined) sessionStorage.setItem(options.fullscreenSessionKey, String(next))
      } catch { /* Session persistence is optional, including in restricted browsers. */ }
      options.onFullscreenChange?.(next)
    },
    finalFocus: options.returnFocus === undefined ? options.finalFocus : () => {
      // Base UI invokes finalFocus during cleanup, before its aria-hidden lease
      // is released. Resolve current admission after that cleanup, never cache
      // a target while the page is still hidden. Ordinary unmount retires live.
      queueMicrotask(() => {
        if (!live() || open) return
        const target = resolveAdmittedFocusTarget(options.returnFocus!)
        if (!target) return
        // A newly active sibling owns focus; returning into an admitted parent
        // remains valid when a nested modal closes.
        if (Array.from(target.ownerDocument.querySelectorAll(OVERLAY_SELECTOR)).some(overlay =>
          isActiveOverlay(overlay) && !overlay.contains(target))) return
        target.focus({ preventScroll: true })
      })
      return false
    },
  }
}
