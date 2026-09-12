# @hollis-labs/kit-chat

**The chat idiom** — a composer and a transcript. Props down, messages up: no stores,
no data fetching, no API client, no plugin system. The host owns state; these
components own presentation and interaction.

> **The one rule: a component may name a token, never a value.**
> It covers **scale** as much as colour.

---

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

**Leave out that last line and the components render, render mostly unstyled, and
nothing errors.**

Tailwind v4 emits a utility only for a class string it has *seen*, and it does not scan
`node_modules`. This package's class strings ship inside `dist`, so without something
pointing Tailwind at them the utilities are never generated. There is no error to read,
because the defect is in what your build did not produce rather than in anything the
code says.

`design-components/source.css` is a **separate import and both are needed** — this
package composes its primitives, so their class strings live in a different `dist`.

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
