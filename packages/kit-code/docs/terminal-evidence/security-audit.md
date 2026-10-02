# `/terminal`: handling untrusted ANSI output

Terminal output is written by a tool, a script or a remote host, so it is untrusted. This records what was read,
measured and decided for `@hollis-labs/kit-code/terminal` (CW-20261002-0046, slice 4). Measured 2026-10-02.

## What was read (primary source, not the README)

| Package | Version | Licence | Read |
|---|---|---|---|
| `ansi-to-react` | 6.2.6 | BSD-3-Clause | `lib/index.js`, all 217 lines |
| `anser` | 2.3.5 | MIT | `lib/index.js` (regex use, class generation, JSON mode) |
| `escape-carriage` | 1.3.1 | MIT | `index.js`, all |
| `linkify-it` | 3.0.3 | MIT | only to confirm it is reached solely through `linkify` |

## Findings about the peer

1. **It renders React elements, not HTML.** `convertBundleIntoReact` returns `React.createElement("span", { style, key, className }, bundle.content)`;
   the text is a child, so React escapes it. There is no `dangerouslySetInnerHTML` and no `innerHTML` in `lib/index.js`.
   Confirmed by output: `<script>..</script><img src=x onerror=..>` renders as `&lt;script&gt;...`.
2. **Links exist only when asked for.** `linkify` defaults to `false` (`linkify ?? false`). `true` wraps `http(s)://` and `www.` matches in
   `<a href target="_blank">` (no `rel`); `"fuzzy"` uses linkify-it, whose matches carry whatever scheme it knows (`mailto:`, `ftp:`, ...).
   `Terminal` always passes `linkify={false}`: no anchor is ever created.
3. **Colours can be classes or inline style.** With `useClasses` the span gets a class and `style` is `null`; without it, `style="color:rgb(...)"`.
   `Terminal` always passes `useClasses`. The classes come from a fixed set (`ansi-<colour>-fg|bg`, `ansi-bright-<colour>-...`,
   `ansi-palette-N-...` for N from 16 up, `ansi-truecolor-...`, and the decorations); an input that tries to inject one
   (`ESC[38;5;1" onclick="x"m`) produces no class at all. Indices 0-15 arrive as the named classes; true colour arrives as
   `ansi-truecolor-fg|bg` with **no colour value**, so it cannot be coloured from tokens and shows in the text colour.
4. **It does NOT strip other control sequences.** An OSC 8 hyperlink `ESC]8;;javascript:alert(1)BELclickESC]8;;BEL` and a window title
   `ESC]0;titleBEL` are printed as visible text with the raw ESC and BEL bytes (inert, no anchor, but wrong and noisy).
   Cursor and erase sequences (`ESC[2K`, `ESC[1A`, `ESC[?25l`) are consumed. -> `terminal-text.ts` removes them first.
5. **Its two loops.** `fixBackspace` is `do { txt = tmp; tmp = txt.replace(/[^\n]\x08/gm, "") } while (tmp.length < txt.length)`; `escapeCarriageReturn`
   is `while (/\r./.test(txt)) txt = txt.replace(/^([^\r\n]*)\r+([^\r\n]+)/gm, ...)`. Both repeat a full-string replace, which looks quadratic.
   **It was not.** Counting passes on instrumented verbatim copies: backspace shapes 2-3 passes at 96 KB; carriage-return shapes 11-16 passes
   from 4 KB to 96 KB; a random search (20,000 strings, length 64) found at most 5 passes for either, and a hill-climb for the worst case at lengths
   16-512 found 5 (backspace, flat) and 4-6 (carriage return, growing only logarithmically). So both are about O(n log n) on everything tried.
   **This is not a proof**: no super-linear input was found, and the bound below does not depend on there being none.

## The real cost is size, so the bound is on size

Rendering builds one DOM element per styled run. Cost is linear in input and large: `ansi-to-react` alone, server render in Node
(`demo/scripts/ansi-cost.mjs`, warm run, shared and busy machine, three runs: ranges shown):

| input | 96 KiB, peer alone | 6 MiB, peer alone | 6 MiB through `Terminal` |
|---|---|---|---|
| colour change every 6 characters | 0.39-0.49 s | 18.7-23.4 s | 0.15-0.23 s |
| a realistic coloured log | 0.18-0.23 s | 3.9-7.2 s | 0.09-0.19 s |
| `a\r` repeated (carriage returns) | 10-19 ms | 2.1-2.9 s | 14-41 ms |
| `a\b` repeated (backspaces) | 1 ms | 43-76 ms | 2-3 ms |
| plain text | 0 ms | 8-12 ms | 2 ms |

At 96 KiB the two are comparable (a 96 KiB input is already over the 64 KiB window, so `Terminal` renders its last two thirds); the point is the right-hand column, which stays flat as the input grows (1.5 MiB through `Terminal`: 0.01-0.22 s).

In real Chromium 153 (`browser.json`): loading 6 MB of colour changes into `Terminal` renders in 0.27 s (10,923 spans), and 40,000 lines in 0.17 s.
`Terminal` renders only the last `maxChars` (default 65,536) characters, starting on a line boundary, with a visible note; the whole output
stays with the host and Copy takes all of it. Copy is computed when pressed, so streaming a long output is not re-scanned on every chunk.

## The package's own patterns (`terminal-text.ts`)

Every regex is linear: inside one sequence the character classes are disjoint (parameter bytes 0x30-0x3F, intermediates 0x20-0x2F, final 0x40-0x7E),
there are no nested quantifiers and no overlapping alternatives, and OSC/device payloads are capped at 4,096 characters (so an unterminated OSC
cannot swallow what follows). Measured in Node, `sanitizeForDisplay` on 1 MiB: unterminated CSI with a megabyte of parameters 5 ms; a megabyte of
unfinished CSI starts 14 ms; a megabyte of OSC starts 5 ms; an unterminated OSC or DCS megabyte 2 ms; a megabyte of bare ESC 15 ms; 6 MiB of real colour
changes 60 ms (copy text, 6 MiB: 25-150 ms). The tests (`terminal-text.test.ts`) run these shapes against a generous 2 s ceiling.

## What is removed, and what is kept

Kept for display: SGR colour and style (`ESC[...m`), `\n`, `\t`, `\b`, `\r` (the peer applies the last two). Removed: OSC (titles, hyperlinks), DCS/SOS/PM/APC, every other CSI
(cursor, erase, private modes), two-byte escapes, a lone or unfinished ESC, other C0 controls, DEL, C1 controls (U+009B is a one-character CSI), and the bidirectional
override/embedding/isolate characters U+202A-202E and U+2066-2069 (they reorder what the reader sees). Copy removes SGR as well, turns `\r\n` and `\r` into newlines and drops `\b`.

## Not covered

- `\r` and `\b` overwrite what was printed before them, as in a real terminal; hostile output can therefore show different text than it first printed. That is inherent to terminal
  semantics, not something to filter. Copy does not replay that collapsing: it gives the text with the escape sequences removed, `\r` as a newline and `\b` dropped.
- A hard cut inside a single line longer than `maxChars` can start in the middle of an escape sequence's text (a line boundary is used whenever one is near).
- Browsers other than Chromium, and screen readers, were not run.
