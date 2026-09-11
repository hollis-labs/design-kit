import type { ReactNode } from 'react'
import { type Accent } from '@hollis-labs/design-tokens'

/**
 * Accent name -> utility. Keyed by the contract's `Accent`, so adding or
 * removing an accent token in design-tokens is a compile error here rather than
 * a prop that quietly points at nothing.
 */
const ACCENT_CLASSES = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  primary: 'text-primary',
  brand: 'text-brand',
} as const satisfies Record<Accent, string>

interface MetricProps {
  label: string
  value: ReactNode
  /** Optional sub-text beneath the value. */
  hint?: string
  /**
   * Tint the value. Names a contract accent token — `success`, `warning`,
   * `danger`, `info`, `primary`, `brand`.
   *
   * REPLACES sysop-ui's `accentColor?: string`, which took a raw CSS colour and
   * applied it via inline `style`. That is the one rule broken at the API
   * surface: a prop typed `string` and applied as a colour is an unbounded
   * escape hatch, and it is the reason CW-0116 flagged nine exports like it. An
   * invalid accent is now a compile error rather than a colour nobody reviewed.
   */
  accent?: Accent
}

/**
 * Large mono value over a small uppercase label — the generic stat block.
 *
 * Classified BASE despite the dashboard-sounding name: the body is a label, a
 * value and a hint, it names no surface and no page chrome, and a chat app
 * rendering token counts or latency wants it unchanged. The only dashboard thing
 * about it was a doc comment pointing at `SummaryCards`, which is kit.
 */
export function Metric({ label, value, hint, accent }: MetricProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption uppercase tracking-label text-fg-faint">{label}</span>
      <span
        className={`font-mono text-2xl font-semibold tabular-nums ${
          accent ? ACCENT_CLASSES[accent] : 'text-fg'
        }`}
      >
        {value}
      </span>
      {hint ? <span className="text-label text-fg-faint">{hint}</span> : null}
    </div>
  )
}
