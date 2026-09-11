import { useMemo, type ReactNode } from 'react'
import { cn } from '../lib/utils'

interface JsonViewerProps {
  /** Any JSON-serializable value. */
  value: unknown
  /** Extra classes on the `<pre>` (e.g. a `max-h-*` to cap height). */
  className?: string
}

// Matches: a quoted string (optionally a key — trailed by `:`), a literal
// (true/false/null), or a number.
//
// KNOWN, AND LATENT RATHER THAN BROKEN — read this before styling a syntax role.
// The `\s*` sits INSIDE the match, so when a string is followed by whitespace the
// match carries that whitespace and the emitted `<span>` wraps it. In practice
// that is the last element before a closing bracket, and only strings: literals
// and numbers have no trailing `\s*`, and a string followed by `,` or `:` stops
// at the quote. `{"tags":["one","two"]}` pretty-printed yields one such match —
// `"two"\n  ` — whose span swallows the newline and the bracket's indent.
//
// `classFor` already tolerates it (hence the `trimEnd()`), and while these roles
// are colour-only it renders identically, which is why it has survived. It stops
// being invisible the moment a role takes a `background`, `border`, `underline`
// or `padding` — the span then paints across the line break — and that is exactly
// what a syntax-palette design pass would add.
//
// The fix is a lookahead rather than a consumed suffix: match the quoted run and
// assert `(?=\s*:)` to recognise a key, which ends every match at the closing
// quote (verified: 0 matches carry trailing whitespace, all 5 keys still
// classify). It is NOT a pure refactor — the `:` stops being part of the key's
// span and renders in the surrounding text colour — so it is left alone
// deliberately, to land with the design pass rather than ahead of it.
const TOKEN = /("(?:[^"\\]|\\.)*"\s*:?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g

/**
 * THE SYNTAX PALETTE, AND THE CONTRACT GAP IT SITS ON.
 *
 * CW-0116 called this file's token bug "the worst kind": four `--color-status-*`
 * tokens used as SYNTAX colours, so a change to the operations status palette
 * silently restyled JSON. Base cannot name `status-*` regardless — the contract
 * burned that prefix — so the mapping had to change.
 *
 * WHAT IT MOVED TO IS NOT A FIX, IT IS THE SAME DEFECT ONE FAMILY OVER. These
 * name the feedback family, which carries meaning — `danger` means danger — and a
 * theme retuning `danger` will restyle JSON exactly as the status palette did.
 * The categories here are syntactic, not semantic: a string is not a success.
 *
 * WHAT IS ACTUALLY MISSING is a categorical family, and the contract has the
 * right shape for it already — `chart-1..5` are names with no semantics,
 * explicitly a palette awaiting a design pass. They are the natural home for
 * this. They cannot be used yet: every built-in theme sets all five to
 * PLACEHOLDER_CHART_COLOR, deliberately loud so an unreviewed chart looks wrong
 * rather than plausible, which would make JSON five shades of magenta.
 *
 * So this preserves the function and keeps the gap visible in one place rather
 * than five. Routed as a contract item; when a syntax or categorical family
 * lands, this map is the only thing that changes.
 */
const SYNTAX = {
  key: 'text-info',
  string: 'text-success',
  boolean: 'text-warning',
  null: 'text-fg-faint',
  number: 'text-primary',
} as const

function classFor(match: string): string {
  if (match.startsWith('"')) {
    return match.trimEnd().endsWith(':') ? SYNTAX.key : SYNTAX.string
  }
  if (match === 'true' || match === 'false') return SYNTAX.boolean
  if (match === 'null') return SYNTAX.null
  return SYNTAX.number
}

/**
 * Syntax-highlighted, read-only JSON view. Pretty-prints the value and tints
 * keys / strings / numbers / literals so the output follows the active theme.
 */
export function JsonViewer({ value, className }: JsonViewerProps) {
  const nodes = useMemo<ReactNode[]>(() => {
    let text: string
    try {
      text = JSON.stringify(value, null, 2) ?? String(value)
    } catch {
      text = String(value)
    }

    const out: ReactNode[] = []
    let last = 0
    let key = 0
    for (const match of text.matchAll(TOKEN)) {
      const index = match.index ?? 0
      if (index > last) out.push(text.slice(last, index))
      out.push(
        <span key={key++} className={classFor(match[0])}>
          {match[0]}
        </span>,
      )
      last = index + match[0].length
    }
    if (last < text.length) out.push(text.slice(last))
    return out
  }, [value])

  return (
    <pre
      className={cn(
        'overflow-auto rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs leading-5 text-fg-secondary',
        className,
      )}
    >
      <code>{nodes}</code>
    </pre>
  )
}
