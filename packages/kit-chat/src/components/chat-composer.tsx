import { memo, useCallback, useState } from 'react'
import { ChatInput, type ChatInputProps } from './chat-input'
import type { SuggestionItem } from '../lib/suggestion'

export interface ChatComposerProps<TItem extends SuggestionItem = SuggestionItem>
  extends Omit<ChatInputProps<TItem>, 'value' | 'onValueChange' | 'onSubmit'> {
  readonly defaultValue?: string
  /**
   * Called with the trimmed draft; empty drafts are not submitted. The draft clears
   * once the call returns, unless it returned `false` (or a promise resolving to
   * `false`, or rejecting): the host kept the text, e.g. because a send failed.
   */
  readonly onSubmit: (value: string) => boolean | void | Promise<boolean | void>
  /** Reports each edit, for hosts that persist a draft. Optional; never required to type. */
  readonly onDraftChange?: (value: string) => void
}

/**
 * A composer that OWNS ITS DRAFT.
 *
 * `ChatInput` is controlled, which is right for a host that needs the text, but it
 * invites keeping the draft in the page component, so every keystroke re-renders the
 * transcript. This wrapper holds the draft here, memoized, so typing re-renders only
 * the composer. Pair it with `ChatStream`'s memoized rows.
 */
function ChatComposerImpl<TItem extends SuggestionItem = SuggestionItem>({
  defaultValue = '',
  onSubmit,
  onDraftChange,
  ...input
}: ChatComposerProps<TItem>) {
  const [draft, setDraft] = useState(defaultValue)
  const change = useCallback((next: string) => {
    setDraft(next)
    onDraftChange?.(next)
  }, [onDraftChange])
  const submit = useCallback((raw: string) => {
    const text = raw.trim()
    if (!text) return
    const clear = () => { setDraft((current) => (current.trim() === text ? '' : current)); onDraftChange?.('') }
    let result: boolean | void | Promise<boolean | void>
    try { result = onSubmit(text) } catch { return }
    if (result instanceof Promise) void result.then((ok) => { if (ok !== false) clear() }, () => undefined)
    else if (result !== false) clear()
  }, [onSubmit, onDraftChange])
  return <ChatInput {...input} value={draft} onValueChange={change} onSubmit={submit} />
}

export const ChatComposer = memo(ChatComposerImpl) as typeof ChatComposerImpl
