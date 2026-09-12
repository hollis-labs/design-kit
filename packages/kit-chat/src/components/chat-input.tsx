import { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode, Ref } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  Textarea,
  cn,
} from '@hollis-labs/design-components'
import {
  applyReference,
  detectSuggestion,
  filterSuggestions,
  removeSuggestion,
  type ActiveSuggestion,
  type ChatTrigger,
  type SuggestionItem,
} from '../lib/suggestion'

export interface ChatInputProps<TItem extends SuggestionItem = SuggestionItem> {
  /** Controlled. This component holds no draft of its own. */
  readonly value: string
  readonly onValueChange: (value: string) => void
  /** Enter submits; Shift+Enter inserts a newline. Not called while `busy`. */
  readonly onSubmit: (value: string) => void

  readonly placeholder?: string
  readonly disabled?: boolean
  /** A reply is in flight. The composer stays editable; submit is suppressed. */
  readonly busy?: boolean

  /**
   * What opens a menu. A `reference` trigger inserts its selection into the message;
   * a `command` trigger reports it and inserts nothing. See `lib/suggestion`.
   */
  readonly triggers?: readonly ChatTrigger<TItem>[]

  /**
   * Previously sent messages, newest last. Arrow-up from an empty composer walks
   * backwards through them.
   *
   * PROP-DRIVEN, DELIBERATELY. Nanite keeps this in `localStorage` at module scope
   * with a 50-entry cap, which means two composers on one page share a history and a
   * test cannot control it. Whose history it is, how long it lives and whether it
   * persists at all are the host's questions.
   */
  readonly history?: readonly string[]

  readonly toolbarStart?: ReactNode
  readonly toolbarEnd?: ReactNode
  readonly className?: string
  readonly textareaRef?: Ref<HTMLTextAreaElement>
  readonly 'aria-label'?: string
}

/**
 * The composer.
 *
 * WHY A TEXTAREA AND NOT A RICH EDITOR. Decided by CW-20260910-0128 against measured
 * install cost: TipTap adds 14,832 kB to a consumer's `node_modules` and Lexical
 * 23,968 kB, while this route adds **nothing** — `cmdk` is already a runtime
 * dependency of `@hollis-labs/design-components`, and `Command`, `Textarea` and the
 * rest are already exported from it, already token-compliant and already lint-clean.
 * For a package many apps install, a suggestion menu composed from primitives that
 * are already paid for beats 14 MB of ProseMirror.
 *
 * THE COST, STATED RATHER THAN HIDDEN: a textarea cannot render a mention as an
 * inline chip. Nanite's TipTap composer can. What a textarea gives back is plaintext
 * fidelity on submit — which is what a chat message is, and what a rich document has
 * to be flattened into anyway. If chips become a requirement, this is the component
 * that changes and the change is contained to it.
 *
 * WHY THE MENU IS NOT IN A `Popover`. A popover portals its content and moves focus,
 * and this menu must leave focus in the textarea so typing keeps filtering it. Base
 * UI's focus management is right for a popover and wrong for a combobox driven from
 * another element, and fighting it is more code than positioning a container. `cmdk`
 * still provides the list semantics and the highlight; only the placement is ours.
 */
export function ChatInput<TItem extends SuggestionItem = SuggestionItem>({
  value,
  onValueChange,
  onSubmit,
  placeholder = 'Send a message…',
  disabled = false,
  busy = false,
  triggers,
  history,
  toolbarStart,
  toolbarEnd,
  className,
  textareaRef,
  'aria-label': ariaLabel = 'Message',
}: ChatInputProps<TItem>) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null)
  const [active, setActive] = useState<ActiveSuggestion<TItem> | null>(null)
  const [highlighted, setHighlighted] = useState<string>('')
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)

  const matches = useMemo(
    () => (active ? filterSuggestions(active.trigger.items, active.query) : []),
    [active],
  )
  const open = active !== null && matches.length > 0

  /*
   * `useImperativeHandle` rather than a hand-merged callback ref. Merging by hand
   * means writing to a ref that arrived as a prop, which `react-hooks/immutability`
   * objects to and is right to: a function that mutates a prop after render is how a
   * ref ends up pointing at a node from a previous render. React does the same
   * forwarding here, for both callback and object refs, without anyone mutating.
   */
  useImperativeHandle(textareaRef, () => innerRef.current as HTMLTextAreaElement, [])

  const refresh = useCallback(
    (text: string, caret: number) => {
      if (!triggers || triggers.length === 0) {
        setActive(null)
        return
      }
      const next = detectSuggestion(text, caret, triggers)
      setActive(next)
      const first = next ? filterSuggestions(next.trigger.items, next.query)[0] : undefined
      setHighlighted(first?.id ?? '')
    },
    [triggers],
  )

  const handleChange = useCallback(
    (text: string, caret: number) => {
      setHistoryIndex(null)
      onValueChange(text)
      refresh(text, caret)
    },
    [onValueChange, refresh],
  )

  const choose = useCallback(
    (item: TItem) => {
      if (!active) return
      const { trigger } = active

      /*
       * The two kinds diverge here and nowhere else. A reference becomes text; a
       * command has its span removed and is reported. The host owns `value`, so a
       * command's `onSelect` may set the composer to anything and its write lands
       * after ours.
       */
      const next =
        trigger.kind === 'reference'
          ? applyReference(value, active, trigger, item)
          : removeSuggestion(value, active)

      onValueChange(next.text)
      setActive(null)

      if (trigger.kind === 'reference') trigger.onInsert?.(item)
      else trigger.onSelect(item)

      // Restore the caret after React commits the controlled value.
      queueMicrotask(() => {
        const el = innerRef.current
        if (!el) return
        el.focus()
        el.setSelectionRange(next.caret, next.caret)
      })
    },
    [active, value, onValueChange],
  )

  const move = useCallback(
    (delta: number) => {
      if (matches.length === 0) return
      const at = matches.findIndex((m) => m.id === highlighted)
      const next = (at + delta + matches.length) % matches.length
      setHighlighted(matches[next].id)
    },
    [matches, highlighted],
  )

  const recall = useCallback(
    (delta: number) => {
      if (!history || history.length === 0) return false
      const at = historyIndex === null ? history.length : historyIndex
      const next = at + delta
      if (next < 0 || next > history.length) return false
      setHistoryIndex(next === history.length ? null : next)
      onValueChange(next === history.length ? '' : history[next])
      return true
    },
    [history, historyIndex, onValueChange],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (open) {
        if (event.key === 'ArrowDown') return event.preventDefault(), move(1)
        if (event.key === 'ArrowUp') return event.preventDefault(), move(-1)
        if (event.key === 'Escape') return event.preventDefault(), setActive(null)
        if (event.key === 'Enter' || event.key === 'Tab') {
          const item = matches.find((m) => m.id === highlighted)
          if (item) {
            event.preventDefault()
            choose(item)
            return
          }
        }
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        const trimmed = value.trim()
        if (trimmed === '' || busy || disabled) return
        onSubmit(trimmed)
        setHistoryIndex(null)
        return
      }

      // History only when the composer is empty, so it never eats a real edit.
      if (!open && value === '' && event.key === 'ArrowUp' && recall(-1)) event.preventDefault()
      else if (!open && historyIndex !== null && event.key === 'ArrowDown' && recall(1))
        event.preventDefault()
    },
    [open, move, matches, highlighted, choose, value, busy, disabled, onSubmit, recall, historyIndex],
  )

  return (
    <div className={cn('relative flex flex-col gap-2', className)} data-slot="chat-input">
      {open && active ? (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 w-full overflow-hidden rounded-panel border border-border bg-bg-elevated shadow-lg"
          data-slot="chat-input-suggestions"
        >
          <Command shouldFilter={false} value={highlighted} onValueChange={setHighlighted}>
            <CommandList className="max-h-64">
              <CommandEmpty className="text-control text-fg-muted">
                {active.trigger.emptyLabel ?? 'No matches'}
              </CommandEmpty>
              <CommandGroup>
                {matches.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => choose(item)}
                      className="gap-2"
                    >
                      {Icon ? <Icon className="size-4 text-fg-muted" aria-hidden /> : null}
                      <span className="text-control text-fg">{item.label}</span>
                      {item.description ? (
                        <span className="ml-auto text-caption text-fg-faint">{item.description}</span>
                      ) : null}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      ) : null}

      <Textarea
        ref={innerRef}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={open ? 'chat-input-suggestions' : undefined}
        role="combobox"
        className="text-control"
        onKeyDown={onKeyDown}
        onChange={(e) => handleChange(e.target.value, e.target.selectionStart ?? e.target.value.length)}
        onClick={(e) => {
          const el = e.currentTarget
          refresh(el.value, el.selectionStart ?? el.value.length)
        }}
        onBlur={() => setActive(null)}
      />

      {toolbarStart || toolbarEnd ? (
        <div className="flex items-center gap-2" data-slot="chat-input-toolbar">
          {toolbarStart}
          <div className="ml-auto flex items-center gap-2">{toolbarEnd}</div>
        </div>
      ) : null}
    </div>
  )
}
