# @hollis-labs/kit-code

Private, unpublished `0.0.0`. Code presentation uses the design-kit contract.

- **CodeBlock** displays source as React text, with optional hidden line numbers, a filename/header/actions family, an accessible copy button and shared Base UI language selectors. The root entry does not load Shiki.
- **Snippet** composes a command prefix, a read-only Input and a labelled copy button. Give `SnippetInput` an `aria-label` or associated label; copying uses the supplied code, never the prefix.
- **FileTree** uses native disclosure/selection buttons and groups, with controlled or uncontrolled immutable expansion. It makes no incomplete ARIA tree/roving-focus claim.
- **StackTrace** preserves unknown frames, displays paths as text by default, and delegates valid coordinates to an optional host callback. Its copy action preserves the raw trace.
- **TestResults** composes summaries, bounded progress, independently controlled Base UI suites and labelled pass/fail/skipped/running statuses. Zero duration remains visible.
- **Commit** composes a native disclosure, sibling hash-copy action, author/initials metadata, guarded timestamps and file statuses/change counts.
- **Agent** displays host-supplied instructions and local tool/schema descriptors through the shared JsonViewer. Tool disclosures are independent.
- **`/highlight`** creates one host-owned Shiki core highlighter using the JS regexp engine and explicitly selected grammars. Its structural plugin serves both CodeBlock and `kit-chat/markdown`. No global caches, downloads, per-language singleton or markdown dependency.

```css
@import "tailwindcss";
@import "@hollis-labs/design-tokens/design-tokens.css";
@import "@hollis-labs/design-components/source.css";
@import "@hollis-labs/kit-code/source.css";
```

Plain code works without installing the optional highlighting peer:

```tsx
import { CodeBlock, CodeBlockCopyButton, Snippet, SnippetInput, SnippetCopyButton } from '@hollis-labs/kit-code'

<CodeBlock code={source}><CodeBlockCopyButton onError={showError} /></CodeBlock>
<Snippet code="npm test"><SnippetInput aria-label="Command" /><SnippetCopyButton onError={showError} /></Snippet>
```

Install `shiki@^4.5.0` to opt in. Create the instance outside rendering and share it:

```tsx
import typescript from 'shiki/langs/typescript.mjs'
import json from 'shiki/langs/json.mjs'
import { createCodeHighlighter } from '@hollis-labs/kit-code/highlight'
import { CodeBlock } from '@hollis-labs/kit-code'
import { ChatMarkdown } from '@hollis-labs/kit-chat/markdown'

const highlighter = await createCodeHighlighter({ langs: [typescript, json] })
// The host retains this instance across both surfaces.
<CodeBlock code={source} language="typescript" highlighter={highlighter} />
<ChatMarkdown plugins={{ code: highlighter }}>{markdown}</ChatMarkdown>
// Call highlighter.dispose() after its consumers have unmounted.
```

Kit-code does not install Streamdown or `@streamdown/code`. Streamdown 2.6 accepts
the shared plugin; its highlighting lives in optional plugins rather than a
mandatory Shiki dependency. The host owns kit-chat/markdown's optional peer setup.
If initialization rejects, keep CodeBlock's plain rendering and handle the error
in the host. Unknown/unloaded languages and disposed instances also fall back to
plain code. Only TypeScript, JSON and Bash grammars have been exercised here;
other JS-engine-compatible grammars are caller-selected, not promised.

Token colours reference contract CSS variables, so theme/mode changes require no
second highlighter. The existing syntax roles supply keys, strings, numbers,
booleans and null; comments use muted text and functions use primary. No GitHub
palette, inline HTML injection or host-executed code is involved.

Copy buttons report missing/denied Clipboard API access through `onError`, block
concurrent writes, compose consumer `onClick` (preventDefault cancels copying),
clean up feedback timers and tie copied feedback to the exact source. Clipboard
access requires a secure context. The host supplies labels for language selectors
and owns value/onValueChange. Component names follow upstream, with Base UI's
`render` props replacing `asChild`.

FileTree, StackTrace, TestSuite, Commit and AgentTool use Collapsible; FileTree and StackTrace also
use the shared controlled-state helper. Each **needs next design-components release (unreleased)**.
This private workspace is not a claim of
compatibility with registry design-components 0.3.0. Nothing publishes here.
`/terminal` has not landed yet.

Source ports retain AI Elements' Apache-2.0 provenance; full terms follow the
original MIT notice in LICENSE. Shiki is MIT; optional future ansi-to-react is
BSD-3-Clause. Neither optional peer enters the main module graph.

Run `npm run test:run --workspace @hollis-labs/kit-code`, or the demo with
`npm run demo --workspace @hollis-labs/kit-code`. Light/dark browser evidence across
all built-in themes is in `docs/code-block-evidence/`.

FileTree `expanded`/`defaultExpanded` accept Sets; expansion requests create a new
Set and never mutate the supplied Set. Controlled expansion waits for the host.
Selection is host-owned through `selectedPath`/`onSelect`; without a callback,
files are read-only text. Folder expansion and selection have separate buttons.
Place row buttons in `actions` or direct `FileTreeActions` children of a file;
keep interactive controls out of names/icons. StackTrace uses one disclosure
root: `StackTraceHeader` is its native trigger, direct `StackTraceActions` or
`actions` are siblings, and `StackTraceExpandButton` is a decorative indicator.
Do not put additional interactive controls inside trigger content.
`onFilePathClick(path, line?, column?)` delegates navigation entirely to the host.
Unknown/malformed frames and lines over 1,000 characters remain text without
regex matching; `showInternalFrames={false}` only filters
recognized internal paths. Test progress measures passed plus failed tests,
clamped to the finite positive total; skipped tests remain in the summary.

Use `?view=inspection` in the demo. Theme/mode screenshots and browser interaction
receipts for this slice are in `docs/inspection-evidence/`.

Commit header names and metadata use phrasing elements so they compose inside
its native trigger. Put action buttons in `actions` or direct `CommitActions`
children; they render beside the trigger. `CommitAuthorAvatar` displays
decorative initials; provide the author name with `CommitAuthor`. Valid timestamps
carry an ISO `dateTime` and a relative day label (updated on render); invalid
dates show `Unknown date`. Change counts omit nonfinite/nonpositive values.

`AgentToolDefinition` is the local `{ description?: string; inputSchema: unknown }`
presentation shape. Supply JSON-serializable schema data, rather than SDK tool
objects or validators. `AgentOutput schema={value}` uses the same JsonViewer;
strings render as JSON string values, so parse serialized JSON in the host when
you want an object view. Instructions and schemas render as React text. Each
AgentTool accepts Base UI `open`/`defaultOpen`/`onOpenChange`; multiple tools may
remain open. AgentTools is a labelled container rather than an accordion.
Use `?view=metadata` in the demo; light/dark proof is in `docs/metadata-evidence/`.
