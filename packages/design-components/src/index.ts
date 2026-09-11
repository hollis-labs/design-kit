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

/*
 * The primitives. `ui/table.tsx` and `ui/tabs.tsx` are exported here despite
 * being unused inside sysop-ui — `DataTable` hand-rolls its markup and
 * `layout/tab-strip.tsx` re-implements a tab bar, both of which are the dashboard's
 * page-chrome variants and stay in kit-dashboard. Base keeps the primitives.
 */
export * from './components/ui'

/* The utility every component needs, and the other half of sysop-ui's lib/utils. */
export { cn } from './lib/utils'

/* Toast — ships with `ui/sonner.tsx`'s <Toaster/>, which it requires. */
export { notifyError, notifySuccess } from './lib/toast'

/*
 * Components. Tone-carrying primitives share one scale; see lib/tone.
 */
export { Pill } from './components/pill'
export { LiveDot } from './components/live-dot'
export { Callout } from './components/callout'
export { CopyableId } from './components/copyable-id'
export { ConfirmDialog } from './components/confirm-dialog'
export { DetailDialog, DetailSection } from './components/detail-dialog'
export { FormDialog } from './components/form-dialog'
export { JsonViewer } from './components/json-viewer'
export { MetaList } from './components/meta-list'
export type { MetaItem } from './components/meta-list'
export { Metric } from './components/metric'
export { ProgressBar } from './components/progress-bar'
export { AppShell } from './components/layout/app-shell'
export { DetailPageLayout } from './components/layout/detail-page-layout'
export { OverflowMenu } from './components/overflow-menu'
export type { OverflowAction } from './components/overflow-menu'
export { CollapsibleSection } from './components/collapsible-section'
export { Combobox } from './components/combobox'
export { CopyButton } from './components/copy-button'
export { EmptyState } from './components/empty-state'
export type { EmptyStateVariant } from './components/empty-state'
export { JsonModal, PayloadActions, PayloadSummary } from './components/json-payload'
export type { JsonModalProps, PayloadActionsProps, PayloadSummaryProps } from './components/json-payload'
export { SearchInput } from './components/search-input'
export { TransferList } from './components/transfer-list'
export type { TransferListItem } from './components/transfer-list'

/*
 * Payload parsers, split out of `json-payload.tsx` rather than exempted from the
 * react-refresh rule. They were the last two lint errors in the repo.
 */
export { safeParseObject, scalarStr } from './lib/payload'

/*
 * The icon prop shape. The glyphs themselves are NOT exported — this package
 * does not ship an icon set and should not look like it does.
 */
export type { IconComponent } from './components/icons'

/*
 * The row-activation protocol, moved DOWN from kit-dashboard so base stops
 * emitting markup whose meaning lived one layer up. A kit imports the selector.
 */
export {
  ROW_INTERACTIVE_ATTR,
  ROW_INTERACTIVE_SELECTOR,
  rowInteractiveProps,
} from './lib/row-activation'

/* The one tone scale, typed from the contract's own Tone. */
export { TONES, TONE_CLASSES, TONE_FILL_CLASSES } from './lib/tone'
export { ACCENT_TEXT_CLASSES, ACCENT_BORDER_L_CLASSES } from './lib/tone'
export type { Tone, Accent } from './lib/tone'

/* The column contract. The table that renders it is kit; the contract is not. */
export { alignClass, compareBy } from './lib/column'
export type { ColumnDef, SortDir, SortState } from './lib/column'

/* UI affordances. Transport hooks live in @hollis-labs/design-app-runtime. */
export { useCopy } from './hooks/use-copy'
export type { UseCopyResult } from './hooks/use-copy'
export { useArrowNav } from './hooks/use-arrow-nav'
