import type { ReactNode } from 'react'
import { Button } from './ui/button'
import { CircleAlertGlyph, InboxGlyph, SearchXGlyph } from './icons'

export type EmptyStateVariant = 'empty' | 'no-results' | 'error'

interface EmptyStateProps {
  variant: EmptyStateVariant
  title: string
  description: string
  /** Small uppercase eyebrow above the title. */
  eyebrow?: string
  action?: {
    label: string
    onClick: () => void
  }
  /** Optional shell command shown in a code block (e.g. a setup hint). */
  command?: string
}

const ICONS: Record<EmptyStateVariant, ReactNode> = {
  empty: <InboxGlyph className="h-10 w-10 text-fg-faint" />,
  'no-results': <SearchXGlyph className="h-10 w-10 text-fg-faint" />,
  error: <CircleAlertGlyph className="h-10 w-10 text-danger-muted" />,
}

/**
 * Centered empty / no-results / error panel. Borderless and compact — sits
 * inside a page body or table region.
 */
export function EmptyState({
  variant,
  title,
  description,
  eyebrow,
  action,
  command,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {ICONS[variant]}
      <div className="space-y-1">
        {eyebrow ? (
          // TODO(round-2): this was `tracking-[0.28em]`, and round 1 decided a
          // step SHOULD exist for it rather than folding — but the value is part
          // of Chrispian's design pass and `tracking-eyebrow` is not in the
          // contract yet. `tracking-label` (0.16) is the nearest that exists;
          // this package is enforced at zero, so an arbitrary value would fail
          // the gate rather than wait politely. Visibly tighter than intended
          // until the step lands, and then it is one rename.
          //
          // The other 0.28em site is kit-dashboard's data-table <thead> — same
          // register, same 10px uppercase faint construction, reached
          // independently. That is what made it a role rather than an outlier.
          <p className="text-caption font-semibold uppercase tracking-label text-fg-faint">
            {eyebrow}
          </p>
        ) : null}
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mx-auto max-w-md text-sm text-fg-faint">{description}</p>
      </div>
      {command ? (
        <pre className="mt-1 w-full max-w-md overflow-x-auto rounded-md border border-border bg-bg px-3 py-2 text-left text-xs text-fg-secondary">
          <code>{command}</code>
        </pre>
      ) : null}
      {action ? (
        <Button variant="outline" size="sm" className="mt-1" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}
