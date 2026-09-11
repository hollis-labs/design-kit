/**
 * Status presentation tones.
 *
 * Tuned to match Torque's `STATUS_COLORS`, which spreads each status across
 * four shades — a tinted fill, a `40%` border, a solid dot, and a *light*
 * label. The kit carries one `--color-status-*` token per status (so all four
 * palettes stay themeable), plus a `--color-status-*-label` derived from it.
 *
 * THE LABEL USED TO BE COMPUTED HERE, inline, as
 * `text-[color-mix(in_oklab,var(--color-status-done)_60%,var(--color-text))]`.
 * That is a colour literal and an arbitrary value at once, so both design rules
 * reported all twelve — and it was theme-layer work sitting in a component:
 * deriving one colour from two others belongs to the only layer allowed to name
 * a colour. The mix now lives in `styles/theme.css`; this file names the result.
 *
 * The derivation itself is unchanged and deliberate — toward the palette's own
 * text colour rather than toward white, so the phosphor palettes stay coherent
 * (green mixes toward green). Verified identical in all four palettes.
 *
 * Classes are written out as literals (not built from a template) so the
 * Tailwind scanner reliably emits every `*-status-*` utility.
 */

export interface StatusTone {
  /** Tailwind background class (tinted fill). */
  bg: string
  /** Tailwind text-color class (light label). */
  text: string
  /** Tailwind border-color class. */
  border: string
  /** Tailwind background class for the leading dot (solid). */
  dot: string
}

/** Canonical status keys with a dedicated `--color-status-*` token. */
export const STATUS_KEYS = [
  'backlog',
  'todo',
  'queued',
  'doing',
  'review',
  'done',
  'blocked',
  'paused',
  'archived',
  'inbox',
  'routed',
  'indexed',
] as const

export type StatusKey = (typeof STATUS_KEYS)[number]

export const STATUS_TONES: Record<StatusKey, StatusTone> = {
  backlog: {
    bg: 'bg-status-backlog/10',
    border: 'border-status-backlog/40',
    dot: 'bg-status-backlog',
    text: 'text-status-backlog-label',
  },
  todo: {
    bg: 'bg-status-todo/10',
    border: 'border-status-todo/40',
    dot: 'bg-status-todo',
    text: 'text-status-todo-label',
  },
  queued: {
    bg: 'bg-status-queued/10',
    border: 'border-status-queued/40',
    dot: 'bg-status-queued',
    text: 'text-status-queued-label',
  },
  doing: {
    bg: 'bg-status-doing/10',
    border: 'border-status-doing/40',
    dot: 'bg-status-doing',
    text: 'text-status-doing-label',
  },
  review: {
    bg: 'bg-status-review/10',
    border: 'border-status-review/40',
    dot: 'bg-status-review',
    text: 'text-status-review-label',
  },
  done: {
    bg: 'bg-status-done/10',
    border: 'border-status-done/40',
    dot: 'bg-status-done',
    text: 'text-status-done-label',
  },
  blocked: {
    bg: 'bg-status-blocked/10',
    border: 'border-status-blocked/40',
    dot: 'bg-status-blocked',
    text: 'text-status-blocked-label',
  },
  paused: {
    bg: 'bg-status-paused/10',
    border: 'border-status-paused/40',
    dot: 'bg-status-paused',
    text: 'text-status-paused-label',
  },
  archived: {
    bg: 'bg-status-archived/10',
    border: 'border-status-archived/40',
    dot: 'bg-status-archived',
    text: 'text-status-archived-label',
  },
  inbox: {
    bg: 'bg-status-inbox/10',
    border: 'border-status-inbox/40',
    dot: 'bg-status-inbox',
    text: 'text-status-inbox-label',
  },
  routed: {
    bg: 'bg-status-routed/10',
    border: 'border-status-routed/40',
    dot: 'bg-status-routed',
    text: 'text-status-routed-label',
  },
  indexed: {
    bg: 'bg-status-indexed/10',
    border: 'border-status-indexed/40',
    dot: 'bg-status-indexed',
    text: 'text-status-indexed-label',
  },
}

/** Neutral fallback for statuses without a dedicated token. */
export const DEFAULT_STATUS_TONE: StatusTone = {
  bg: 'bg-panel-2',
  text: 'text-text-soft',
  border: 'border-border-subtle',
  dot: 'bg-text-subtle',
}

/** Resolve a status string (case-insensitive) to its presentation tone. */
export function statusTone(status: string): StatusTone {
  return STATUS_TONES[(status || '').toLowerCase() as StatusKey] ?? DEFAULT_STATUS_TONE
}
