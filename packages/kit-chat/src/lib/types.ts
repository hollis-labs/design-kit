import type { ReactNode } from 'react'

/**
 * The chat item model.
 *
 * WHY A DISCRIMINATED UNION AND NOT A MESSAGE WITH OPTIONAL FIELDS. An
 * optional-field grab-bag lets an author write a "message" that carries a marker's
 * label and no content, and nothing objects until it renders as an empty row. Here
 * `kind` selects the shape, so the invalid combination does not typecheck.
 *
 * AND WHY A CARD WILL BE A SIBLING VARIANT RATHER THAN A FIELD ON A MESSAGE:
 * CW-20260910-0129 adds the interactive card set on top of this package. A card that
 * lives *inside* a message forces every consumer of `ChatMessageItem` to know about
 * envelopes, and forces a card to inherit a message's role and author when it has
 * neither. Adding `| ChatCardItem` to this union is additive; unpicking a nested
 * field later is not.
 */
export type ChatItem = ChatMessageItem | ChatMarkerItem

/** Who a message is from. Not a token — this is chat vocabulary, so it lives here. */
export type ChatRole = 'user' | 'assistant' | 'system' | 'tool'

interface ChatItemBase {
  /** Stable across re-renders. Used for scroll anchoring and jump-to-message. */
  readonly id: string
}

export interface ChatMessageItem extends ChatItemBase {
  readonly kind: 'message'
  readonly role: ChatRole
  /**
   * ALREADY RENDERED. This package never parses markdown — see the README's
   * "What ChatStream does not do". A host that wants markdown imports
   * `@hollis-labs/kit-chat/markdown` and puts the result here, or renders its own.
   */
  readonly content: ReactNode
  readonly author?: ReactNode
  readonly timestamp?: ReactNode
  /** Rendered after the content, inside the row — actions, reactions, footnotes. */
  readonly footer?: ReactNode
}

export interface ChatMarkerItem extends ChatItemBase {
  readonly kind: 'marker'
  /**
   * What the marker is announcing. Distinct from a message because a date break, a
   * tool-call banner and a context-compaction notice are not things anyone said.
   */
  readonly variant: 'date' | 'tool' | 'compaction' | 'error' | 'info'
  readonly label: ReactNode
}

/**
 * The state of a reply that is arriving but is not a message yet.
 *
 * TYPED AS A UNION BECAUSE THE STATES ARE NOT INDEPENDENT. `content` is meaningless
 * when idle, `error` is meaningless while streaming, and a boolean pair
 * (`isStreaming`, `isStalled`) admits `{ isStreaming: false, isStalled: true }`,
 * which is not a state this component can be in. Nanite tracks streaming content
 * separately from committed messages plus a stall timer, and this is that, made
 * explicit.
 */
export type ChatStreamStatus =
  | { readonly status: 'idle' }
  | { readonly status: 'streaming'; readonly role: ChatRole; readonly content: ReactNode }
  | { readonly status: 'stalled'; readonly role: ChatRole; readonly content: ReactNode }
  | { readonly status: 'error'; readonly message: ReactNode }
