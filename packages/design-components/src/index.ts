/**
 * @hollis-labs/design-components — layer 4 of the Hollis Labs frontend layering,
 * the idiom-free base.
 *
 * THE ONE RULE: a component may name a token, never a value. It covers scale as
 * much as colour — `text-[13px]` names a value exactly as much as `#1a1b26` does.
 * Every token named here comes from `@hollis-labs/design-tokens`; this package
 * restates none of the contract locally.
 *
 * THE TEST EVERY EXPORT PASSED: "would kit-chat take this unchanged?" An app
 * wanting only a Button had to take the whole dense-dashboard idiom — confirmed
 * at the barrel level, not inferred — and removing that is the point of the
 * split. Dashboard idiom lives in `@hollis-labs/kit-dashboard`; chat-specific
 * composition lives in `@hollis-labs/kit-chat`.
 *
 * Built on Base UI (`@base-ui/react`), a peer. See CW-20260910-0140.
 */

/* The utility every component needs, and the other half of sysop-ui's lib/utils. */
export { cn } from './lib/utils'

/* Toast — ships with `ui/sonner.tsx`'s <Toaster/>, which it requires. */
export { notifyError, notifySuccess } from './lib/toast'

/* The column contract. The table that renders it is kit; the contract is not. */
export { alignClass, compareBy } from './lib/column'
export type { ColumnDef, SortDir, SortState } from './lib/column'

/* UI affordances. Transport hooks live in @hollis-labs/design-app-runtime. */
export { useCopy } from './hooks/use-copy'
export type { UseCopyResult } from './hooks/use-copy'
export { useArrowNav } from './hooks/use-arrow-nav'
