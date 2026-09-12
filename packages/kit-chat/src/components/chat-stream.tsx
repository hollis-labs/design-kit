import type { ReactNode } from 'react'
import { MessageScroller } from '@shadcn/react/message-scroller'
import { cn } from '@hollis-labs/design-components'
import type {
  ChatCardItem,
  ChatItem,
  ChatMarkerItem,
  ChatMessageItem,
  ChatStreamStatus,
} from '../lib/types'

export interface ChatStreamProps {
  /** Ordered oldest-first. The host owns this list; this component never mutates it. */
  readonly items: readonly ChatItem[]

  /**
   * The reply in flight, if any. Rendered after `items` and outside them, because a
   * partially-arrived message is not a message yet.
   */
  readonly status?: ChatStreamStatus

  /**
   * Render one item. Optional — there is a reasonable default — but this is the seam
   * a kit or an app uses to render its own bubbles, and the seam CW-20260910-0129
   * uses to draw a card when it adds `ChatCardItem` to the union.
   */
  readonly renderItem?: (item: ChatItem) => ReactNode

  /** Shown when `items` is empty and nothing is streaming. */
  readonly empty?: ReactNode

  /** Label for the jump-to-latest control. */
  readonly jumpLabel?: ReactNode

  /**
   * Keep the view pinned to the newest message. Scrolling away releases it; the
   * scroller handles that, and the jump control brings it back.
   */
  readonly autoScroll?: boolean

  /**
   * Hold scroll position when older items are prepended, so loading history does not
   * move the reader. On by default because a chat that jumps on backfill is broken.
   */
  readonly preserveScrollOnPrepend?: boolean

  readonly className?: string
  readonly viewportClassName?: string
  readonly 'aria-label'?: string
}

const MARKER_TONE = {
  date: 'text-fg-faint',
  tool: 'text-info',
  compaction: 'text-fg-muted',
  error: 'text-danger',
  info: 'text-fg-muted',
} as const satisfies Record<ChatMarkerItem['variant'], string>

const ROLE_ALIGN = {
  user: 'items-end',
  assistant: 'items-start',
  system: 'items-start',
  tool: 'items-start',
} as const satisfies Record<ChatMessageItem['role'], string>

function DefaultMessage({ item }: { readonly item: ChatMessageItem }) {
  return (
    <div className={cn('flex flex-col gap-1', ROLE_ALIGN[item.role])}>
      {item.author || item.timestamp ? (
        <div className="flex items-baseline gap-2">
          {item.author ? (
            <span className="text-label tracking-label text-fg-secondary uppercase">
              {item.author}
            </span>
          ) : null}
          {item.timestamp ? <span className="text-caption text-fg-faint">{item.timestamp}</span> : null}
        </div>
      ) : null}
      {/*
        * ONLY A USER MESSAGE GETS A BUBBLE. An assistant turn runs full width, because
        * its content is usually rich — a code block, a table, a list — and a bubble
        * sized to a conversational line squeezes all of it into a column. Caught by
        * rendering markdown in a browser rather than by reading the class list: the
        * first version constrained both roles and the tables came out unreadable.
        *
        * The constraint is `max-w-lg`, a named step, and not the `max-w-[85%]` it
        * replaced — a named step reads better and does not encode a magic percentage.
        *
        * CORRECTION, 2026-09-12, found by `design-kit-a3`. An earlier version of this
        * comment said the design gate "does not check `max-w`" and framed that as
        * something the rule fails to catch. That is wrong, and it is worth correcting
        * rather than deleting because the wrong version is the intuitive one.
        * `max-w` is listed in `NEVER_SCALE_PREFIXES` **deliberately**, alongside every
        * other layout-geometry prefix, and the lint package says why: "layout geometry
        * and icon-sized boxes are one-off facts, not a repeated design decision —
        * `h-[18px]` on an icon wrapper is legitimate in a way `text-[13px]` is not."
        * Contract §7 carries the measurement behind it: 6,751 named spacing utilities
        * against 39 arbitrary ones, 99.4% adherence, so Tailwind's scale IS the spacing
        * contract and is inherited rather than redefined.
        *
        * So the gate accepting `max-w-[85%]` is the rule correctly declining to judge
        * layout, by design and on evidence — not a hole in it. The change below stands
        * on readability; it was never a gate repair.
        */}
      <div
        className={cn(
          'rounded-panel px-3 py-2 text-control text-fg',
          item.role === 'user' ? 'max-w-lg bg-surface' : 'w-full bg-bg-elevated',
        )}
      >
        {item.content}
      </div>
      {item.footer ? <div className="text-caption text-fg-muted">{item.footer}</div> : null}
    </div>
  )
}

function DefaultMarker({ item }: { readonly item: ChatMarkerItem }) {
  return (
    <div className="flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-divider" />
      <span className={cn('text-caption tracking-eyebrow uppercase', MARKER_TONE[item.variant])}>
        {item.label}
      </span>
      <span className="h-px flex-1 bg-divider" />
    </div>
  )
}

/**
 * A CARD IS NOT GIVEN A BUBBLE, AND THAT IS THE POINT OF IT BEING A SIBLING VARIANT.
 * A message bubble is chrome that says "someone said this"; a card is a surface that
 * already carries its own frame, and nesting one inside the other double-frames it.
 * So this row contributes alignment and an optional byline and nothing else — the
 * host's card draws itself.
 */
function DefaultCard({ item }: { readonly item: ChatCardItem }) {
  return (
    <div className="flex w-full flex-col gap-1 items-start" data-wire-kind={item.wireKind}>
      {item.author || item.timestamp ? (
        <div className="flex items-baseline gap-2">
          {item.author ? (
            <span className="text-label tracking-label text-fg-secondary uppercase">
              {item.author}
            </span>
          ) : null}
          {item.timestamp ? <span className="text-caption text-fg-faint">{item.timestamp}</span> : null}
        </div>
      ) : null}
      <div className="w-full">{item.content}</div>
    </div>
  )
}

function defaultRender(item: ChatItem): ReactNode {
  // Exhaustive by construction: adding a variant to ChatItem without handling it
  // here is a compile error at the `never` below, not a blank row at runtime.
  switch (item.kind) {
    case 'message':
      return <DefaultMessage item={item} />
    case 'marker':
      return <DefaultMarker item={item} />
    case 'card':
      return <DefaultCard item={item} />
    default: {
      const exhaustive: never = item
      return exhaustive
    }
  }
}

/**
 * The transcript.
 *
 * SCROLL IS THE HARD PART AND WE DO NOT OWN IT. `@shadcn/react`'s `MessageScroller`
 * handles anchoring a turn, releasing the view when the reader scrolls away, holding
 * position when history is prepended, and staying stable when content reflows under a
 * stream. Nanite hand-rolls that in 468 lines of `ChatTranscript.tsx`; the upstream
 * engine has ZERO runtime dependencies and adds 76 kB, which for the package that
 * carries the most dependencies in this repo made it not a close call.
 *
 * It is headless and ships no CSS, so it needs no `@source` of its own — only this
 * package's class strings do.
 *
 * WHAT THIS COMPONENT DOES NOT DO: parse markdown. `content` is a `ReactNode` the host
 * has already rendered. A streaming-safe markdown renderer is the optional
 * `/markdown` subpath, so a host that renders its own pays nothing for ours. The
 * consequence is that this component cannot see tokens arrive — see `useStallDetector`
 * for why stall is host-asserted rather than derived here.
 */
export function ChatStream({
  items,
  status = { status: 'idle' },
  renderItem = defaultRender,
  empty,
  jumpLabel = 'Jump to latest',
  autoScroll = true,
  preserveScrollOnPrepend = true,
  className,
  viewportClassName,
  'aria-label': ariaLabel = 'Conversation',
}: ChatStreamProps) {
  const showEmpty = items.length === 0 && status.status === 'idle'

  return (
    <MessageScroller.Provider autoScroll={autoScroll} defaultScrollPosition="end">
      <MessageScroller.Root className={cn('relative flex min-h-0 flex-1 flex-col', className)}>
        <MessageScroller.Viewport
          aria-label={ariaLabel}
          preserveScrollOnPrepend={preserveScrollOnPrepend}
          className={cn('min-h-0 flex-1 overflow-y-auto px-4 py-6', viewportClassName)}
        >
          <MessageScroller.Content className="flex flex-col gap-4">
            {showEmpty ? <div data-slot="chat-stream-empty">{empty}</div> : null}

            {items.map((item) => (
              <MessageScroller.Item key={item.id} messageId={item.id} data-slot="chat-stream-item">
                {renderItem(item)}
              </MessageScroller.Item>
            ))}

            {status.status === 'streaming' || status.status === 'stalled' ? (
              <MessageScroller.Item
                messageId="__streaming"
                scrollAnchor
                data-slot="chat-stream-streaming"
                data-stalled={status.status === 'stalled' ? '' : undefined}
              >
                <div className={cn('flex flex-col gap-1', ROLE_ALIGN[status.role])}>
                  <div
                    className={cn(
                      'rounded-panel bg-bg-elevated px-3 py-2 text-control text-fg',
                      status.role === 'user' ? 'max-w-lg' : 'w-full',
                    )}
                  >
                    {status.content}
                  </div>
                  {status.status === 'stalled' ? (
                    <span className="text-caption text-warning" role="status">
                      Waiting for the response to continue…
                    </span>
                  ) : null}
                </div>
              </MessageScroller.Item>
            ) : null}

            {status.status === 'error' ? (
              <div
                data-slot="chat-stream-error"
                role="alert"
                className="rounded-panel border border-danger bg-danger-muted px-3 py-2 text-control text-danger-fg"
              >
                {status.message}
              </div>
            ) : null}
          </MessageScroller.Content>
        </MessageScroller.Viewport>

        <MessageScroller.Button
          direction="end"
          data-slot="chat-stream-jump"
          className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-control border border-border bg-bg-elevated px-3 py-1.5 text-caption text-fg-secondary shadow-md"
        >
          {jumpLabel}
        </MessageScroller.Button>
      </MessageScroller.Root>
    </MessageScroller.Provider>
  )
}
