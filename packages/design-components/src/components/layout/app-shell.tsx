import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { cn } from '../../lib/utils'
import { OverlaySidebar } from '../overlay-sidebar'
import { restoreAdmittedFocus } from '../../lib/focus-return'

export type AsideWidth = 'compact' | 'regular' | 'wide'

export interface AppShellAsideProps {
  /** Optional content rendered inside the right aside region. When omitted, aside geometry is absent. */
  aside?: ReactNode
  /** Accessible landmark label for the aside region. Defaults to 'Aside'. */
  asideLabel?: string
  /**
   * Width preset for the desktop aside:
   * - 'compact': w-80 (20rem / 320px)
   * - 'regular': w-96 (24rem / 384px) - default
   * - 'wide': w-112 (28rem / 448px)
   */
  asideWidth?: AsideWidth
  /** Controlled collapsed state. When true, desktop aside is collapsed and reserves no sliver. */
  asideCollapsed?: boolean
  /** Controlled change handler for collapsed state. */
  onAsideCollapsedChange?: (collapsed: boolean) => void
  /** Pinned header band at the top of the aside. */
  asideHeader?: ReactNode
  /** Pinned footer band at the bottom of the aside (e.g., composer). */
  asideFooter?: ReactNode
  /** Title for the narrow OverlaySidebar fallback. Defaults to asideLabel or 'Aside'. */
  asideTitle?: ReactNode
  /** Description for the narrow OverlaySidebar fallback. */
  asideDescription?: ReactNode
  /**
   * Custom trigger element for opening the narrow OverlaySidebar.
   * If omitted, a default accessible trigger button is rendered.
   */
  asideTrigger?: ReactElement
  /** Controlled open state for the narrow OverlaySidebar. */
  asideOverlayOpen?: boolean
  /** Controlled change handler for the narrow OverlaySidebar open state. */
  onAsideOverlayOpenChange?: (open: boolean) => void
  /**
   * Controlled narrow viewport override (e.g. for testing / Storybook).
   * If undefined, media query (max-width: 1023px) is evaluated in the browser.
   */
  isNarrow?: boolean
  /** Explicit fallback target for focus return when trigger is disconnected/disabled/unadmitted. */
  asideFocusFallbackTarget?: HTMLElement | null | (() => HTMLElement | null)
  /** Admission predicate to check if the trigger is still eligible to receive focus. */
  isAsideTriggerAdmitted?: (trigger: HTMLElement) => boolean
}

export interface AppShellProps extends AppShellAsideProps {
  /** Left-hand rail, full height beside the content column. Optional. */
  nav?: ReactNode
  /** Pinned band across the top of the content column. Optional. */
  header?: ReactNode
  /** The routed view. Rendered inside a flex column, so a child's `flex-1` works. */
  children: ReactNode
  /** Extra classes on the outermost element. */
  className?: string
}

const ASIDE_WIDTH_CLASSES: Record<AsideWidth, string> = {
  compact: 'w-80',
  regular: 'w-96',
  wide: 'w-112',
}

function subscribeMediaQuery(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia?.('(max-width: 1023px)')
  if (!mql) return () => {}
  mql.addEventListener?.('change', callback)
  return () => {
    mql.removeEventListener?.('change', callback)
  }
}

function getMediaNarrowSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.matchMedia?.('(max-width: 1023px)').matches)
}

function getMediaNarrowServerSnapshot(): boolean {
  return false
}

/**
 * The application shell — nav rail, optional header, content region that fills the viewport and scrolls,
 * and an optional right aside (e.g. assistant, inspector) with width presets, collapse, and narrow OverlaySidebar fallback.
 *
 * THE CHAIN, and each link earns its place:
 *
 *   h-dvh + overflow-hidden   the shell is exactly the viewport and never scrolls
 *   flex                      so the rail, content column, and aside sit side by side
 *   min-h-0 on the column     WITHOUT THIS a flex child refuses to shrink below
 *                             its content, so the column grows past the viewport
 *                             and takes the scroll region with it.
 *   min-w-0 on the column     the horizontal twin: one unbreakable string in the
 *                             content otherwise widens the whole shell
 *   flex flex-col on <main>   so the routed view's own `flex-1` has a flex parent
 *                             to size against.
 *
 * ASIDE OWNERSHIP:
 *   - On desktop (at or above 1024px / lg), the aside renders as a persistent right column with its own
 *     independent scrolling body and pinned header/footer chrome.
 *   - When collapsed, no empty sliver is reserved.
 *   - Below the narrow breakpoint (390px, mobile, < 1024px), the aside falls back to a right OverlaySidebar
 *     so the main column retains full viewport width.
 *   - Exactly one mounted copy of `aside` is rendered at any time.
 *   - Resize between desktop and narrow preserves the desktop collapsed preference without mutating storage,
 *     closes temporary overlays, and restores focus safely.
 */
export function AppShell({
  nav,
  header,
  children,
  className,
  aside,
  asideLabel = 'Aside',
  asideWidth = 'regular',
  asideCollapsed = false,
  asideHeader,
  asideFooter,
  asideTitle,
  asideDescription,
  asideTrigger,
  asideOverlayOpen: controlledOverlayOpen,
  onAsideOverlayOpenChange,
  isNarrow: controlledNarrow,
  asideFocusFallbackTarget,
  isAsideTriggerAdmitted,
}: AppShellProps) {
  const hasAside = aside !== undefined

  // Media query detection below narrow breakpoint (1024px / lg) using useSyncExternalStore
  const mediaNarrow = useSyncExternalStore(subscribeMediaQuery, getMediaNarrowSnapshot, getMediaNarrowServerSnapshot)
  const isNarrow = controlledNarrow ?? mediaNarrow

  // Narrow overlay open state (controlled or uncontrolled)
  const [internalOverlayOpen, setInternalOverlayOpen] = useState(false)
  const isOverlayOpen = controlledOverlayOpen !== undefined ? controlledOverlayOpen : internalOverlayOpen

  // Adjust overlay state during render when viewport switches narrow/desktop
  const [prevNarrow, setPrevNarrow] = useState(isNarrow)
  if (prevNarrow !== isNarrow) {
    setPrevNarrow(isNarrow)
    if (internalOverlayOpen) {
      setInternalOverlayOpen(false)
    }
  }

  const setOverlayOpen = useCallback(
    (open: boolean) => {
      if (onAsideOverlayOpenChange) {
        onAsideOverlayOpenChange(open)
      } else {
        setInternalOverlayOpen(open)
      }
    },
    [onAsideOverlayOpenChange],
  )

  const desktopAsideRef = useRef<HTMLElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  // When switching from desktop to narrow while focus is inside the aside, restore focus
  useEffect(() => {
    if (!hasAside) return
    if (isNarrow && typeof document !== 'undefined') {
      const active = document.activeElement
      if (active && desktopAsideRef.current?.contains(active)) {
        restoreAdmittedFocus({
          trigger: triggerRef.current,
          isAdmitted: isAsideTriggerAdmitted,
          fallbackTarget: asideFocusFallbackTarget,
        })
      }
    }
  }, [isNarrow, hasAside, isAsideTriggerAdmitted, asideFocusFallbackTarget])

  return (
    <div
      data-slot="app-shell"
      data-has-aside={hasAside ? true : undefined}
      className={cn('flex h-dvh w-dvw overflow-hidden bg-bg text-fg', className)}
    >
      {nav}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {header}
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
      {hasAside && !isNarrow && !asideCollapsed && (
        <aside
          ref={desktopAsideRef}
          data-slot="app-shell-aside"
          data-width={asideWidth}
          data-collapsed={false}
          aria-label={asideLabel}
          className={cn(
            'flex min-h-0 shrink-0 flex-col overflow-hidden border-l border-border-subtle bg-bg',
            ASIDE_WIDTH_CLASSES[asideWidth],
          )}
        >
          {asideHeader ? (
            <div data-slot="app-shell-aside-header" className="shrink-0 border-b border-border-subtle">
              {asideHeader}
            </div>
          ) : null}
          <div data-slot="app-shell-aside-body" className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            {aside}
          </div>
          {asideFooter ? (
            <div data-slot="app-shell-aside-footer" className="shrink-0 border-t border-border-subtle">
              {asideFooter}
            </div>
          ) : null}
        </aside>
      )}
      {hasAside && isNarrow && (
        <OverlaySidebar
          side="right"
          open={isOverlayOpen}
          onOpenChange={(nextOpen) => {
            setOverlayOpen(nextOpen)
            if (!nextOpen) {
              restoreAdmittedFocus({
                trigger: triggerRef.current,
                isAdmitted: isAsideTriggerAdmitted,
                fallbackTarget: asideFocusFallbackTarget,
              })
            }
          }}
          trigger={
            asideTrigger ?? (
              <button
                ref={triggerRef}
                type="button"
                data-slot="app-shell-aside-trigger"
                aria-label={asideLabel}
                aria-expanded={isOverlayOpen}
                className="sr-only"
              >
                {asideLabel}
              </button>
            )
          }
          title={asideTitle ?? asideLabel}
          description={asideDescription}
          header={asideHeader}
          footer={asideFooter}
        >
          {aside}
        </OverlaySidebar>
      )}
    </div>
  )
}
