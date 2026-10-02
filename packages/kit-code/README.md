# @hollis-labs/kit-code

Private, unpublished `0.0.0`. Code presentation uses the design-kit contract.

- **CodeBlock** displays source as React text, with optional hidden line numbers, a filename/header/actions family, an accessible copy button and shared Base UI language selectors. The root entry does not load Shiki.
- **Snippet** composes a command prefix, a read-only Input and a labelled copy button. Give `SnippetInput` an `aria-label` or associated label; copying uses the supplied code, never the prefix.
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

Later FileTree/StackTrace/Commit/TestSuite components need the next
design-components release (unreleased). This private workspace is not a claim of
compatibility with registry design-components 0.3.0. Nothing publishes here.
`/terminal` and the remaining component slices have not landed yet.

Source ports retain AI Elements' Apache-2.0 provenance; full terms follow the
original MIT notice in LICENSE. Shiki is MIT; optional future ansi-to-react is
BSD-3-Clause. Neither optional peer enters the main module graph.

Run `npm run test:run --workspace @hollis-labs/kit-code`, or the demo with
`npm run demo --workspace @hollis-labs/kit-code`. Light/dark browser evidence across
all built-in themes is in `docs/code-block-evidence/`.
