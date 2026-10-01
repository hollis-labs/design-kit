import type { ReactElement, ReactNode } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'

export interface OverlaySidebarProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  /** A button element. Sheet owns activation and focus return. */
  readonly trigger: ReactElement
  readonly title: ReactNode
  readonly description?: ReactNode
  readonly side?: 'left' | 'right'
  readonly header?: ReactNode
  readonly footer?: ReactNode
  readonly children: ReactNode
}

/**
 * A modal sidebar with pinned chrome and a scrolling body. Composes the existing
 * Sheet; Base UI owns focus containment, Escape and backdrop dismissal. The host
 * owns navigation, selection and content. No layout store or viewport breakpoint.
 */
export function OverlaySidebar({ open, onOpenChange, trigger, title, description, side = 'left', header, footer, children }: OverlaySidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger render={trigger} />
      <SheetContent side={side} className="min-w-0 max-w-full gap-0 overflow-hidden bg-bg-elevated text-control text-fg data-[side=left]:w-80 data-[side=right]:w-80">
        <SheetHeader className="shrink-0 border-b border-border-subtle pr-12">
          <SheetTitle className="text-control font-semibold text-fg">{title}</SheetTitle>
          {description ? <SheetDescription className="text-caption text-fg-muted">{description}</SheetDescription> : null}
          {header}
        </SheetHeader>
        <div data-slot="overlay-sidebar-body" className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 [overflow-wrap:anywhere]">{children}</div>
        {footer ? <div data-slot="overlay-sidebar-footer" className="shrink-0 border-t border-border-subtle p-4">{footer}</div> : null}
      </SheetContent>
    </Sheet>
  )
}
