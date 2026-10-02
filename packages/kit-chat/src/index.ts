/**
 * @hollis-labs/kit-chat — the chat idiom.
 *
 * PROPS DOWN, MESSAGES UP. No global stores, built-in transport, API client or
 * plugin system. The host owns application state; components own presentation
 * and interaction. Optional headless hooks own local interaction/pagination state.
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
  ArtifactCard,
  DocumentCard,
  PromptCard,
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
  ArtifactCardProps,
  DocumentCardProps,
  PromptCardProps,
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

export { useChatHistory } from './lib/use-chat-history'
export type {
  ChatHistoryCursor,
  ChatHistoryPage,
  ChatHistoryRequest,
  UseChatHistoryOptions,
} from './lib/use-chat-history'

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

export { Shimmer } from './components/shimmer'
export type { TextShimmerProps } from './components/shimmer'
export { MessageActions, MessageAction, MessageBranch, MessageBranchContent, MessageBranchSelector, MessageBranchPrevious, MessageBranchNext, MessageBranchPage } from './components/message'
export type { MessageActionsProps, MessageActionProps, MessageBranchProps, MessageBranchContentProps, MessageBranchSelectorProps, MessageBranchPreviousProps, MessageBranchNextProps, MessageBranchPageProps } from './components/message'

export { Attachments, Attachment, AttachmentPreview, AttachmentInfo, AttachmentRemove, AttachmentEmpty, AttachmentHoverCard, AttachmentHoverCardTrigger, AttachmentHoverCardContent } from './components/attachments'
export type { AttachmentData, AttachmentMediaCategory, AttachmentVariant, AttachmentsProps, AttachmentProps, AttachmentPreviewProps, AttachmentInfoProps, AttachmentRemoveProps, AttachmentEmptyProps, AttachmentHoverCardProps, AttachmentHoverCardTriggerProps, AttachmentHoverCardContentProps } from './components/attachments'
export { AttachmentDropzone, PromptInputActionAddAttachments } from './components/attachment-dropzone'
export type { AttachmentDropzoneProps, AttachmentRejection, PromptInputActionAddAttachmentsProps } from './components/attachment-dropzone'
export { getMediaCategory, getAttachmentLabel } from './lib/attachment'

export { ModelSelector, ModelSelectorTrigger, ModelSelectorContent, ModelSelectorDialog, ModelSelectorInput, ModelSelectorList, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorItem, ModelSelectorShortcut, ModelSelectorSeparator, ModelSelectorLogo, ModelSelectorLogoGroup, ModelSelectorName } from './components/model-selector'
export type { ModelSelectorProps, ModelSelectorTriggerProps, ModelSelectorContentProps, ModelSelectorDialogProps, ModelSelectorInputProps, ModelSelectorListProps, ModelSelectorEmptyProps, ModelSelectorGroupProps, ModelSelectorItemProps, ModelSelectorShortcutProps, ModelSelectorSeparatorProps, ModelSelectorLogoProps, ModelSelectorLogoGroupProps, ModelSelectorNameProps } from './components/model-selector'
