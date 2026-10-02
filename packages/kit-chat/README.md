# @hollis-labs/kit-chat

**The chat idiom** — a composer and a transcript. Props down, messages up: no stores,
no data fetching, no API client, no plugin system. The host owns state; these
components own presentation and interaction.

> **The one rule: a component may name a token, never a value.**
> It covers **scale** as much as colour.

---

## Tailwind compatibility

Styled components require **Tailwind CSS v4**, declared as a required
`tailwindcss: ^4.0.0` peer. npm 7+ installs a missing required peer automatically;
npm 11's default resolver rejects an installed incompatible major. An automatic
peer install does not add Tailwind to your app's manifest or configure its CSS
build. Declare it explicitly and configure the matching Vite/PostCSS/CLI
integration:

```sh
npm install -D tailwindcss@^4.0.0
```

A successful install alone does not verify styling. Follow this package's usage
instructions for the CSS imports and source registration as well.

## Install — and the line that is not optional

```bash
npm install @hollis-labs/kit-chat @hollis-labs/design-components @hollis-labs/design-tokens
npm install @base-ui/react react react-dom lucide-react     # peers
```

```css
/* your app's stylesheet */
@import "tailwindcss";
@import "@hollis-labs/design-tokens/design-tokens.css";
@import "@hollis-labs/design-components/source.css";
@import "@hollis-labs/kit-chat/source.css";          /* ← THIS ONE */
```

**Leave out that last line and styling fails silently.** The base-component or
host scan can emit some shared utilities, leaving a partially styled transcript
that looks plausible. See the
[adopter-path guide](https://github.com/hollis-labs/design-kit/blob/main/docs/adopter-path.md)
for complete values, source wiring and focused computed-style verification.
Restart the dev server
after stylesheet import changes before checking a fresh production build.

Tailwind v4 emits a utility only for a class string it has *seen*, and it does not scan
`node_modules`. This package's class strings ship inside `dist`, so without something
pointing Tailwind at them the utilities are never generated. There is no error to read,
because the defect is in what your build did not produce rather than in anything the
code says.

`design-components/source.css` is a **separate import and both are needed** — this
package composes its primitives, so their class strings live in a different `dist`.

[Consumer verification](docs/consumer-verification.md) records the registry
0.1.0 browser measurements, source-registration negative control, typography
defect and packed-candidate fix. Import resolution alone does not verify styling.

---

## Use

```tsx
import { ChatInput, ChatStream, useStallDetector } from '@hollis-labs/kit-chat'
import type { ChatItem, ChatTrigger } from '@hollis-labs/kit-chat'

function Chat() {
  const [items, setItems] = useState<ChatItem[]>([])
  const [draft, setDraft] = useState('')
  const [partial, setPartial] = useState<string | null>(null)
  const stalled = useStallDetector(partial)

  const triggers: readonly ChatTrigger[] = [
    { id: 'files', kind: 'reference', char: '@', items: files },
    { id: 'commands', kind: 'command', char: '/', atLineStart: true,
      items: commands, onSelect: (c) => run(c.id) },
  ]

  return (
    <div className="flex h-full flex-col">
      <ChatStream
        items={items}
        status={partial === null
          ? { status: 'idle' }
          : { status: stalled ? 'stalled' : 'streaming', role: 'assistant', content: partial }}
      />
      <ChatInput value={draft} onValueChange={setDraft} onSubmit={send} triggers={triggers} />
    </div>
  )
}
```

---

## `ChatInput`

A controlled composer. Enter submits, Shift+Enter inserts a newline.
The framed composer includes a visible Send action, so touch users can submit
without a keyboard shortcut. Enter used to commit an IME candidate does not send.

`busy` keeps the draft editable and disables sending. Supply `onStop` to show a
Stop action that calls your cancellation handler. Set `showSubmitButton={false}`
when your `toolbarEnd` already supplies an action; existing toolbar slots remain.

### Two trigger kinds, because they are two different operations

| | `ReferenceTrigger` | `CommandTrigger` |
|---|---|---|
| Example | `@` a file | `/` a command |
| On select | inserts `value ?? label` **as text in the message** | reports the choice and **inserts nothing** |
| Carries | `suffix`, optional `onInsert` | **required** `onSelect` |

A reference becomes part of what gets sent. A command is a choice — it may set a
pending mode, clear the composer, or fire an action, and assuming it inserts text is
wrong. Typing them as one shape with a different character is how a props surface grows
an options bag, so they are two types and **a command trigger without an `onSelect` does
not compile**.

Selecting a command removes the `/query` span, because leaving `/cle` behind after
choosing `clear` is wrong in every host. Beyond that the host owns `value`, so its
`onSelect` may set the composer to anything and its write lands after ours.

**Both are host-supplied.** This package does not know what a file is, what commands
exist, or how to search either.

### Why a textarea rather than a rich editor

Measured as kB added to a consumer's `node_modules`: TipTap **14,832**, Lexical
**23,968**, this route **0** — `cmdk` is already a runtime dependency of
`@hollis-labs/design-components` and the primitives are already exported from it.

The cost, stated: a textarea cannot render a mention as an inline chip. What it gives
back is plaintext fidelity on submit, which is what a chat message is.

### Other props worth knowing

- **`history`** — previously sent messages, newest last; ArrowUp from an empty composer
  walks back through them. Prop-driven on purpose: Nanite keeps this in `localStorage`
  at module scope, which means two composers on a page share one history and a test
  cannot control it.
- **`menuSide`** — `'top'` (default) or `'bottom'`. The component does **not** measure
  available space; auto-flipping needs a positioning dependency or hand-rolled
  measurement, and a composer at the bottom of a transcript never needs it. A host that
  places the composer mid-page knows something the component cannot.

---

## `ChatStream`

The transcript. Renders an ordered list of items the host provides.
The default content column is bounded at `max-w-3xl`. Plain string messages
preserve newlines and wrap long tokens; rendered nodes keep their own formatting.

Pass `loading` while fetching the initial conversation to show progress instead
of the empty state. The optional `history` prop renders an older-history action,
loading feedback, and a retry action without fetching anything:

```tsx
<ChatStream
  items={items}
  loading={initialLoading}
  history={{ hasOlder, loading: loadingOlder, error: historyError,
    onLoadOlder: loadOlder }}
/>
```

### Paginated history

`useChatHistory({ loadPage, initialPage? })` connects bounded, oldest-first pages
to this seam. The host supplies an async page loader; the hook handles cursors,
overlap by stable item ID, single-flight requests, retry and cancellation. It loads
the latest window once, then older windows only when requested. `append` upserts
live items without losing messages that arrived during a history request.

```tsx
const transcript = useChatHistory({ loadPage })
<ChatStream items={transcript.items} loading={transcript.loading} history={transcript.history} />
```

Key the containing component by conversation/window to reset it. An optional
`initialPage` seeds a hydrated or search-selected window without a latest request.
The host chooses page size, transport and rendering; the hook neither fetches nor
evicts rows. [History adapter contract and browser proof](docs/message-history.md)
includes integration, cursor rules and the prepend fix.

`ChatStream` delegates cursors, deduplication and request state to the host or
the headless hook above; its history prop remains presentation only.

### Scroll is the hard part and this package does not own it

`@shadcn/react`'s `MessageScroller` handles it: anchoring a turn, releasing the view
when the reader scrolls away, holding position when history is prepended, and staying
stable when content reflows under a stream. It has **zero runtime dependencies**, adds
76 kB, and is headless, so it needs no `@source` of its own.

Verified against a 30-message transcript in a browser: prepending ten older messages
moved the reader **0 px** while the scroll height grew.

### The item model

```ts
type ChatItem = ChatMessageItem | ChatMarkerItem | ChatCardItem
```

A discriminated union on `kind`, not a message with optional fields — so a "message"
carrying a marker's label and no content does not typecheck. `renderItem` replaces
rendering wholesale, and the default renderer's `switch` ends in a `never`, so a new
variant that nobody handled is a compile error rather than a blank row.

By default a **user** turn gets a bubble and an **assistant** turn runs full width,
because assistant content is usually rich and a bubble sized to a conversational line
squeezes a table into a column.

A **card** is a sibling variant rather than a field on a message. A card nested
inside a message would force every consumer of `ChatMessageItem` to know about
envelopes, and force a card to inherit a `role` and an author it does not have.

### Streaming state, and why stall is yours to assert

```ts
type ChatStreamStatus =
  | { status: 'idle' }
  | { status: 'streaming'; role: ChatRole; content: ReactNode }
  | { status: 'stalled';   role: ChatRole; content: ReactNode }
  | { status: 'error';     message: ReactNode }
```

A partially-arrived reply renders outside the item list, because it is not a message
yet.
Streaming shows Responding feedback even before the first token. A stalled reply
keeps its content and shows a waiting message; an error renders an alert. Loading
icons respect reduced motion.

**`ChatStream` cannot detect a stall itself**, and that is a real consequence of it
taking already-rendered content: two renders of the same text are two different
`ReactNode` objects, so it cannot tell "a token arrived" from "the host re-rendered".
Only you hold something that changes exactly when content does. `useStallDetector`
ships the timer so nobody rewrites it:

```tsx
const stalled = useStallDetector(accumulatedText)   // 2000 ms default — Nanite's value
```

---

## `@hollis-labs/kit-chat/markdown` — optional

**You only need this if you want us to render markdown for you.** `ChatStream` takes
already-rendered content, so a host with its own pipeline imports none of this and
installs nothing extra.

```bash
npm install streamdown        # an optional peer — not installed unless you ask
```

```css
@import "@hollis-labs/kit-chat/markdown.css";   /* ← required, see below */
@import "streamdown/styles.css";                /* streamdown's own keyframes */
```

```tsx
import { ChatMarkdown } from '@hollis-labs/kit-chat/markdown'

<ChatMarkdown streaming={isStreaming}>{markdownSource}</ChatMarkdown>
```

`streaming` maps to streamdown's `mode` and it matters: in streaming mode it repairs
unterminated constructs, so a half-written fence renders as a code block instead of as
literal backticks. Every other `StreamdownProps` option passes through.

### The extra `@source`, and why we ship it

Streamdown's class strings are in *its* `dist`, so Tailwind needs to see them too.
Its own README asks you to write `@source "../node_modules/streamdown/dist/*.js"` and to
*"adjust the number of `../` segments based on where your CSS file lives"* — a glob whose
correctness depends on your directory depth, failing as silently when wrong as when
missing.

`@hollis-labs/kit-chat/markdown.css` declares it for you. `@source` resolves relative to
the file that declares it, so the path is fixed against a layout this package controls.

**It assumes `streamdown` sits in the same `node_modules` root as `@hollis-labs`**,
which is what npm, yarn and pnpm produce for a package you installed directly; verified
against a real npm install. If your layout differs, write streamdown's own line in your
stylesheet instead.

### Why streamdown, and why it is not in the base package

It adds **11,148 kB** to `node_modules` — more than the entire Base UI headless layer
this portfolio accepted — which is why it is an optional peer behind a subpath rather
than a dependency. Behind an opt-in export, buying correctness on unterminated fences
and half-written tables beats reimplementing it; in the base package it would have been
a tax on every consumer.

Rejected: `react-markdown`, whose last release was 2025-03-07 and which does not handle
partial markdown; `marked` alone, which is 488 kB but leaves the streaming-safety work
to us.

---


## The card set

Interactive cards for a transcript: the `Envelope` chassis, five presentational
shapes, three that take an answer, and the cards that draw a binding miss.
`ArtifactCard` adds compact native download/dismiss presentation, `DocumentCard`
provides a bounded pane for rendered content and host navigation/actions, and
`PromptCard` collects a controlled text answer through the existing responder.
Boolean choices use `ConfirmationCard`. See the
[Nanite/Flux reconciliation](docs/nanite-card-reconciliation.md) for usage and
the mapping to existing cards; no wire kinds or app transports are added.
Envelopes fill the transcript column, wrap long body text, and let wide tables
scroll within the card. See the [polish dogfood record](docs/polish-dogfood.md)
for the Flux gap list and browser checks in an isolated ops-chat consumer.

```tsx
import { ConfirmationCard, CardBoundary, CardMiss } from '@hollis-labs/kit-chat'

const r = resolve(table, envelope.kind)   // your table, from @hollis-labs/design-bindings

items.push({
  kind: 'card',
  id: envelope.id,
  wireKind: envelope.kind,
  content: r.ok ? (
    <CardBoundary key={envelope.id} wireKind={envelope.kind} onError={report}>
      <ConfirmationCard
        title="Apply 3 changes?"
        actions={[{ id: 'apply', label: 'Apply', primary: true }]}
        priorStatus={envelope.prior_response?.status}
        onRespond={(outcome) => submit(envelope.id, outcome)}
      />
    </CardBoundary>
  ) : (
    <CardMiss code={r.code} wireKind={envelope.kind} reason={r.reason} />
  ),
})
```

### A card is a shape, not a wire kind

There is no `ApprovalCard` here and there will not be one. A renderer keyed to a wire
kind is the design layer asserting wire identity, which the portfolio's ownership
table gives to `go-envelopes`. Your host binds *its* kinds to *these* shapes, and the
binding table is host-local by construction.

**So this kit ships no default `BindingRequest` rows.** A request names a `kind`, and
a kit that implements no kinds has none to offer. What it ships instead is the design
half of a miss: `CardMiss` draws all four codes distinguishably, and
`CardFallbackDeclined` draws the case where a fallback refuses because it could not
preserve meaning.

| component | what it is |
|---|---|
| `Envelope`, `EnvelopeHeader`, `EnvelopeBody`, `EnvelopeFooter`, `EnvelopeSection` | the chassis |
| `InfoCard`, `MetricCard`, `ProgressCard`, `TimelineCard`, `DiffCard` | presentational |
| `ConfirmationCard`, `TableCard`, `ListCard` | take an answer |
| `CardMiss`, `CardFallbackDeclined` | a kind that resolved to nothing |
| `CardBoundary` | a card that threw *while rendering* |

`accent` and `tone` are typed off `@hollis-labs/design-tokens`, so a tone leaving the
contract breaks these props rather than leaving them pointing at a token that renders
nothing.

### Responding: emit closed, read open

A card never builds the wire response. It reports an **outcome**; your host adds the
version and envelope id and transports it.

```ts
type CardOutcome =
  | { status: 'submitted'; data?; answers?; decisions? }
  | { status: 'canceled' }
```

**`partial` is absent from that union on purpose, and it is not an oversight.** A
partial submission does not work as implemented: every submission sets `responded_at`
before the handler dispatches, so a partial claims the envelope and the submission
that would *complete* the interaction gets a 409. Partial is a state you can enter and
never leave. A comment warning about that is read after the bug is written; a union
that cannot express it is a compile error before.

Reading is the opposite. `priorStatus` is a plain `string`, and
`classifyPriorResponse` is total over it:

```ts
classifyPriorResponse('partial')   // { kind: 'open' }      — does not claim
classifyPriorResponse('cancelled') // { kind: 'canceled' }  — legacy spelling
classifyPriorResponse('handling')  // { kind: 'pending' }   — not in the declared enum
classifyPriorResponse('quiesced')  // { kind: 'unrecognized', status: 'quiesced' }
```

The declared enum is four canonical values plus a legacy `cancelled`, and two more —
`handling` and `failed` — reach the column in practice. A closed union here would be a
lie that throws on data already in production databases. An unrecognised status leaves
the card **locked and names the value**, because re-enabling controls against an
unknown terminal state invites a second submission that 409s.

Resolved state is a **prop**, not internal state, so a decision survives a reload. A
confirmed card that reads unconfirmed after a refresh is how you get a double submit.

### Why there is no `ResponseV1` type here

There is no TypeScript expression of the response protocol anywhere in the portfolio:
`go-envelopes` emits envelope data types and import metadata and nothing
response-shaped, and `ResponseStatus.IsTerminal()` is Go-only. Defining one here would
make a **fourth** definition of the same thing, which is the exact failure the
protocol reconciliation was done to stop.

## Working on this package

```bash
npm run build       # tsc -p tsconfig.build.json && vite build
npm run typecheck
npm run test:run
npm run lint
```

The design rules are enforced **at zero** here from the first commit — `kit-chat` is on
the repo gate's `BLOCKING` list. There is no exemption file.

Externals are derived from `package.json` rather than listed, so the manifest and the
build cannot disagree. This matters more here than anywhere: chat libraries are where
module-level state lives, and a bundled copy of a stateful dependency fails silently.

`prepack` runs the build — not `prepare`, which runs during install and races workspace
ordering, and not `prepublishOnly`, which does not run for `npm pack` and would let a
tarball ship an empty `dist/`.

## Message extras and Shimmer

`MessageActions` / `MessageAction` provide host-owned action buttons with optional
Base UI tooltips. Supply `label` or `tooltip` for icon-only actions. No message
layout or markdown renderer is included.

`MessageBranch`, `MessageBranchContent`, `MessageBranchSelector`,
`MessageBranchPrevious`, `MessageBranchNext` and `MessageBranchPage` compose
alternative responses. Use one Content per Branch. Navigation wraps; inactive
branches remain mounted but hidden, preserving drafts. `defaultBranch` initializes
local selection; optional `branch` + `onBranchChange` gives the host control.
Out-of-range indices are clamped to the available alternatives. Empty and single
responses hide the selector. Branch changes never send a message or fetch content.

`Shimmer` renders text with optional `as`, `duration` (seconds) and `spread`
(highlight width multiplier). Without the stylesheet it stays ordinary readable
text. To enable the token-colored CSS sweep, import explicitly:

```css
@import "@hollis-labs/kit-chat/keyframes.css";
```

No component import installs keyframes. Reduced-motion users see static text;
`duration={0}` stops motion. No motion library is required. See
[demo/chat-core.tsx](demo/chat-core.tsx) for all three compositions and
[the upstream inventory](docs/upstream-versions.md) for provenance. The shipped
`LICENSE` retains Hollis Labs MIT terms and AI Elements Apache-2.0 attribution.

## Attachments and local file intake (unreleased)

`Attachments` supplies `grid`, `inline` or `list` layout; compose `Attachment` with
`AttachmentPreview`, `AttachmentInfo`, `AttachmentRemove`, and `AttachmentEmpty`.
`AttachmentData` is our own file/source-document presentation union (`id`, optional
`filename`/`mediaType`, file `url`, source `title`); it carries no AI SDK/wire type.
The host owns the list, object URL lifetime, validation on the server and uploads.
`onRemove` requests removal; the component never mutates the host list.

`AttachmentDropzone` wraps a local region, including an existing `ChatInput`.
Place `PromptInputActionAddAttachments` in its toolbar to open the native picker.
`onFilesSelect(File[])` reports accepted files; `onFilesReject` reports each rejected
file and `accept`, `max_file_size` or `max_files`. `accept` supports MIME patterns
and filename extensions; `multiple`, `attachmentCount`, `maxFiles`, `maxFileSize`
(bytes), and `disabled` control intake. The picker resets after every selection.
Drops stay local; ordinary text drops are left alone. There are no document event
listeners, fetching, attachment stores, screenshot capture or composer trigger changes.

```tsx
<AttachmentDropzone onFilesSelect={addFiles} onFilesReject={reportRejected}
  accept="image/*,.txt" maxFiles={6} attachmentCount={attachments.length}>
  <Attachments variant="list">
    {attachments.map(data => <Attachment key={data.id} data={data}
      onRemove={() => remove(data.id)}>
      <AttachmentPreview /><AttachmentInfo /><AttachmentRemove />
    </Attachment>)}
  </Attachments>
  <ChatInput value={draft} onValueChange={setDraft} onSubmit={submit}
    toolbarStart={<PromptInputActionAddAttachments />} />
</AttachmentDropzone>
```

For expanded preview, the upstream names `AttachmentHoverCard`,
`AttachmentHoverCardTrigger`, and `AttachmentHoverCardContent` are retained, but
compose an accessible Base UI **Popover**: click/touch or keyboard activation opens
it, Escape closes it, and focus returns to its trigger. Use `render={<Button />}`
instead of Radix `asChild`; removal buttons belong outside the preview trigger.
These previews are not hover-only. Removal controls are always visible.
Caller-supplied media URLs are rendered by browser media elements; the host decides
which URLs are appropriate and revokes blob URLs when removed or on unmount.

Only existing published design-components 0.3.0 exports are used (Button, Popover,
PopoverTrigger, PopoverContent, cn); no new dependency or optional peer is added.
See `demo/attachments.tsx` for a host-owned list/URL lifecycle example. Browser
evidence is in `docs/attachments-a/`; unit tests exercise presentation/intake
without opening a portal (open Base UI Positioner/Popup hangs jsdom in this environment).
Real preview opening/focus/Escape is verified separately in Chromium.
