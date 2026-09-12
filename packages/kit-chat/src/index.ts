/**
 * @hollis-labs/kit-chat — the chat idiom.
 *
 * PROPS DOWN, MESSAGES UP. No stores, no data fetching, no API client, no plugin
 * system. The host owns state; these components own presentation and interaction.
 * That constraint is what makes them reusable, and it is the reason this package was
 * built rather than extracted from Nanite, whose 748-line composer is wired into six
 * zustand stores.
 *
 * THIS PACKAGE NEVER PARSES MARKDOWN. `ChatStream` takes already-rendered content.
 * A streaming-safe markdown renderer ships as the optional `/markdown` subpath, so a
 * host that already renders its own pays nothing for ours.
 */

export { ChatInput } from './components/chat-input'
export type { ChatInputProps } from './components/chat-input'

export { ChatStream } from './components/chat-stream'
export type { ChatStreamProps } from './components/chat-stream'

export {
  CardBoundary,
  CardFallbackDeclined,
  CardMiss,
  ConfirmationCard,
  DiffCard,
  Envelope,
  EnvelopeBody,
  EnvelopeFooter,
  EnvelopeHeader,
  EnvelopeSection,
  InfoCard,
  ListCard,
  MetricCard,
  ProgressCard,
  TableCard,
  TimelineCard,
} from './cards'
export type {
  CardBoundaryProps,
  CardFallbackDeclinedProps,
  CardMissProps,
  ConfirmationAction,
  ConfirmationCardProps,
  DiffCardProps,
  DiffSide,
  EnvelopeBodyProps,
  EnvelopeFooterProps,
  EnvelopeHeaderProps,
  EnvelopeProps,
  EnvelopeSectionProps,
  InfoCardProps,
  ListCardItem,
  ListCardProps,
  MetricCardProps,
  MetricTrend,
  ProgressCardProps,
  ProgressStep,
  TableCardProps,
  TableColumn,
  TimelineCardProps,
  TimelineEvent,
  TimelineStatus,
} from './cards'

/* The response seam. See lib/response.ts for why emit is closed and read is open. */
export { acceptsInput, classifyPriorResponse } from './lib/response'
export type {
  CardAnswer,
  CardDecision,
  CardOutcome,
  CardResponder,
  PriorResponseState,
} from './lib/response'

export { useStallDetector } from './lib/use-stall-detector'

export {
  applyReference,
  detectSuggestion,
  filterSuggestions,
  removeSuggestion,
} from './lib/suggestion'
export type {
  ActiveSuggestion,
  ChatTrigger,
  CommandTrigger,
  ReferenceTrigger,
  SuggestionItem,
} from './lib/suggestion'

export type {
  ChatCardItem,
  ChatItem,
  ChatMarkerItem,
  ChatMessageItem,
  ChatRole,
  ChatStreamStatus,
} from './lib/types'
