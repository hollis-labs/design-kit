# Shortcut Registry & Layered Escape Stack (CW-20261010-0090)

## Overview

This specification implements the keyboard interaction and focus architecture defined in the Nil Behavior Spec (`docs/nil-behavior-spec.md`) and confirmed under owner direction **DEC-079** (`01a123ff-1a7d-7f2d-88b0-72f56e6dead6` / `01a123ff-25bc-7dad-8380-e31a32092c02`).

The architecture establishes:
1. **Centralized LIFO Layered Escape Stack (`useLayeredEscape`)**:
   - The innermost (topmost active) overlay owns the Escape key.
   - **Input-clearing before closing contract**: if focus is inside a clearable search or filter input, Escape clears the input first and consumes the event (`stopPropagation()`, `stopImmediatePropagation()`, `preventDefault()`), preventing accidental dismissal of the containing modal or background queries. Subsequent Escape dismisses the overlay.
   - Background queries and page state are strictly preserved when dismissing an overlay.
   - Priority cannot override activation order without an explicit nested scope contract.
   - Committed render/unmount callback fences (`live()`) prevent stale callback execution.
2. **Focus Return Resolver (`restoreAdmittedFocus` / `resolveAdmittedFocusTarget`)**:
   - Focus is restored to the triggering opener only if it is currently connected in the DOM, not disabled, and admitted by caller source projection (e.g. record still present).
   - If disconnected or stale, focus falls back to an explicit caller fallback anchor.
3. **Double-Shift Detection Hook (`useShiftShift`)**:
   - Detects two consecutive `Shift` key presses within a configurable threshold (default `300ms` per DEC-079).
   - Modifier-aware: suppressed when `metaKey`, `ctrlKey`, or `altKey` are held.
   - Suppressed in editable targets (`input`, `textarea`, `select`, `contenteditable`, and ARIA text/combobox roles).
   - Suppressed during active IME composition (`isComposing` or `keyCode === 229`).
   - Window blur or any non-Shift key immediately resets the tap window.
   - Suspended when an active modal overlay owns keyboard focus.
   - Supports deterministic monotonic clock injection (`getTime`) for test reproducibility without `Date.now()`.
4. **Scoped Shortcut Registry (`useShortcut`) & Quick Search (`useQuickSearchShortcut`)**:
   - `useShortcut` enforces exact modifier matching (requiring all declared modifiers and forbidding undeclared modifiers).
   - Suspends background (Tier 4) shortcuts while active overlays are open in the stack.
   - `useQuickSearchShortcut` binds `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux) as primary and `Shift-Shift` as alias to a unified `onOpen` callback.
5. **Shared Admission Guards (`keyboard-guards.ts`)**:
   - Extracted Parallax Torque guards applied to `SearchInput` (`/`-to-focus with IME, modifier, overlay, and editable target checks).
   - Legacy `useArrowNav` remains published and unchanged by default.
