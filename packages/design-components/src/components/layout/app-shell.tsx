import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface AppShellProps {
  /** Left-hand rail, full height beside the content column. Optional. */
  nav?: ReactNode
  /** Pinned band across the top of the content column. Optional. */
  header?: ReactNode
  /** The routed view. Rendered inside a flex column, so a child's `flex-1` works. */
  children: ReactNode
  /** Extra classes on the outermost element. */
  className?: string
}

/**
 * The application shell — nav rail, optional header, and a content region that
 * fills the viewport and scrolls.
 *
 * WHY THIS IS A COMPONENT AND NOT A DOC. The chain it owns is four links long and
 * any one of them dropping `flex flex-col` or `min-h-0` makes the page overflow
 * the viewport INVISIBLY — the scrollbar simply never appears. Cerberus shipped
 * `<main className="min-h-0 flex-1 overflow-hidden">` — a BLOCK container, so the
 * inner page's `flex-1` had nothing to size against — and nobody noticed for
 * months, until the overview grew tall enough to need to scroll. Chrispian noted
 * at the time that another app had hit the same thing before it.
 * `[[sysop_ui_app_shell_layout_primitive]]` asks for this by name.
 *
 * THE CHAIN, and each link earns its place:
 *
 *   h-dvh + overflow-hidden   the shell is exactly the viewport and never scrolls
 *   flex                      so the rail and the column sit side by side
 *   min-h-0 on the column     WITHOUT THIS a flex child refuses to shrink below
 *                             its content, so the column grows past the viewport
 *                             and takes the scroll region with it. This is the
 *                             link that gets dropped.
 *   min-w-0 on the column     the horizontal twin: one unbreakable string in the
 *                             content otherwise widens the whole shell
 *   flex flex-col on <main>   so the routed view's own `flex-1` has a flex parent
 *                             to size against. This is the link Cerberus dropped.
 *
 * TAKEN FROM CERBERUS'S CURRENT App.tsx, not from the record's sketch. The record
 * was written while that file still carried the bug; it has since been repaired,
 * and the repaired version is the one that has actually run. It also adds
 * `min-w-0`, which the record does not mention.
 *
 * PAIRS WITH, AND DOES NOT REPLACE,
 * `@hollis-labs/design-app-runtime/shell-reset.css`. That sets
 * `html,body,#root{height:100%}` and `body,#root{overflow:hidden}` — the
 * document-level precondition `h-dvh` assumes. It is a deliberate opt-in import
 * there, and this package does not depend on that one, so importing it is the
 * app's call. Without it this still renders; the document may just scroll behind
 * a shell that does not.
 *
 * `nav` and `header` are SLOTS, never imports. `NavRail` and `PageHeader` are
 * dashboard chrome and stay in kit-dashboard; a chat kit passes something else.
 * That is the whole reason this is base and they are not.
 *
 * NO `PageShell` COMPANION, deliberately — see `DetailPageLayout`, which is the
 * inner pattern (pinned header, scroll body, optional aside) and is already in
 * this package. The record proposed `PageShell` before CW-0116 classified
 * `DetailPageLayout` as base; building both now would ship two components for one
 * job.
 */
export function AppShell({ nav, header, children, className }: AppShellProps) {
  return (
    <div className={cn('flex h-dvh w-dvw overflow-hidden bg-bg text-fg', className)}>
      {nav}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {header}
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  )
}
