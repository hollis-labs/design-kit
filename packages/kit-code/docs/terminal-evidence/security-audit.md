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
5. **Its two helper loops, and one quadratic regex.** `fixBackspace` is `do { txt = tmp; tmp = txt.replace(/[^\n]\x08/gm, "") } while (tmp.length < txt.length)`;
   `escapeCarriageReturn` is `txt.replace(/\r+\n/gm, "\n"); while (/\r./.test(txt)) txt = txt.replace(/^([^\r\n]*)\r+([^\r\n]+)/gm, ...)`.
   - **The loops' pass counts are small.** Backspace: exhaustively, over every string of `a`, `\b`, `\n` up to length 13 the worst case is 4 passes
     (1, 2, 2, 3, 3, 3, 3, then 4 from length 8 on): a nesting that costs about log2(length). Carriage return: `^` in JavaScript's multiline mode also
     matches after every `\r`, so each pass folds every other segment, and 4 KB to 96 KB inputs took 11 to 16 passes.
   - **`/\r+\n/gm` (escape-carriage, line 1 of the function) IS quadratic.** On a run of N carriage returns with no newline after it, `\r+` consumes the
     run from every starting position and then fails to find `\n`: measured verbatim on `"\r"` repeated N: 8,192 -> 73 ms, 16,384 -> 304 ms,
     32,768 -> 1,371 ms, 65,536 -> **6,048 ms** (each doubling is ~4x). One line of 65,536 carriage returns took 6.0 s through the peer alone and **8.8 s
     through the first version of `Terminal`, which was under its own 65,536-character window**.
   - **How it was missed, and found.** The first pass over the helpers used a random search and a hill-climb (20,000 strings of length 64; lengths 16-512),
     which never produce a long run of one control character, and concluded the loops were near-linear. That conclusion was wrong for this input. It was found
     by benchmarking deliberately hostile shapes (a long run of one control character, repeated escape/backspace/return runs, unterminated sequences) at one
     and at 100 lines each (`demo/scripts/ansi-hostile-shapes.mjs`). Per-line the quadratic is invisible: 100 lines of 655 carriage returns each is fast, because
     the run per line is short. A cap on the total (65,536) is not enough on its own; the pattern itself must be removed.
   - **Fix: `normalizeLineControls`** (`terminal-text.ts`) runs before the peer, in linear time: backspaces first, by the peer's own rule, until nothing changes (capped
     at 32 passes, far beyond the 4 needed for a 13-character worst case), then runs of carriage returns collapse to one (exact: both helpers read `\r+` as a
     single separator) and carriage returns at the very end of the text are dropped. The peer then finds no pair to erase and no run, so its loops do one trivial pass. A
     differential test renders 3,000 seeded random inputs (ESC, `[`, digits, `m`, `\r`, `\b`, `\n`) with and without the normaliser and requires identical output, apart
     from carriage returns left at the very end and the empty runs they leave.
     The same single line of 65,536 carriage returns now renders in 1 ms.

## The cost that remains is size, so the window is on size

Rendering builds one DOM element per styled run. Cost is linear in input and large: `ansi-to-react` alone, server render in Node
(`demo/scripts/ansi-cost.mjs`, warm run, shared and busy machine, three runs: ranges shown):

| input | 96 KiB, peer alone | 6 MiB, peer alone | 6 MiB through `Terminal` |
|---|---|---|---|
| colour change every 6 characters | 0.31-0.49 s | 16.9-23.4 s | 0.15-0.23 s |
| a realistic coloured log | 0.16-0.23 s | 3.9-7.2 s | 0.09-0.19 s |
| `a\r` repeated (carriage returns) | 10-35 ms | 1.7-2.9 s | 14-41 ms |
| `a\b` repeated (backspaces) | 1 ms | 37-76 ms | 2-3 ms |
| plain text | 0 ms | 8-12 ms | 2 ms |

At 96 KiB the two are comparable (a 96 KiB input is already over the 64 KiB window, so `Terminal` renders its last two thirds); the point is the right-hand column, which stays flat as the input grows (1.5 MiB through `Terminal`: 0.01-0.22 s).

In real Chromium 153 (`browser.json`): loading 6 MB of colour changes into `Terminal` renders in 0.27 s (10,923 spans), and 40,000 lines in 0.17 s.
`Terminal` renders only the last `maxChars` (default 65,536) characters, starting on a line boundary, with a visible note; the whole output
stays with the host and Copy takes all of it. Copy is computed when pressed, so streaming a long output is not re-scanned on every chunk.

## Hostile shapes, one line and 100 lines (`ansi-hostile-shapes.md`)

22 shapes (one delimiter repeated, long and unterminated SGR parameters, unfinished CSI and OSC starts, unterminated OSC 8 and DCS, bare ESC, backspace and
carriage-return runs and alternations, bidi and C1 controls, a mix), each as 1 line and as 100 lines, timed through the peer alone, the sanitiser alone and the
built `Terminal`. At the 65,536-character window the slowest `Terminal` case is dense colour changes at ~0.3 s (the DOM it builds); at 1 MiB it is the same
~0.3 s. The peer alone on a single line of carriage returns is the only shape that is slow for it at the window (3.9-6.0 s), and `Terminal` renders it in about 1 ms.

## The package's own patterns (`terminal-text.ts`)

Every regex is meant to be linear, and the evidence above is why that is not taken on trust: inside one sequence the character classes are disjoint (parameter bytes 0x30-0x3F, intermediates 0x20-0x2F, final 0x40-0x7E),
there are no nested quantifiers and no overlapping alternatives, and OSC/device payloads are capped at 4,096 characters (so an unterminated OSC
cannot swallow what follows). Measured in Node, `sanitizeForDisplay` on 1 MiB (the first version of these patterns, before the stricter display fallback): unterminated CSI with a megabyte
of parameters 5 ms; unfinished CSI starts 14 ms; OSC starts 5 ms; an unterminated OSC or DCS megabyte 2 ms; bare ESC 15 ms; 6 MiB of real colour changes 60 ms.
Re-measured after the fix with `ansi-hostile-shapes.mjs` (sanitise plus copy text, both patterns, 1 MiB, 1 line and 100 lines): 5-86 ms for every shape, and 16x the
input costs 15-19x the time (unfinished CSI starts: 4.6 ms at 64 KiB, 68-86 ms at 1 MiB). The tests (`terminal-text.test.ts`) run these shapes against a generous 2 s ceiling.

## Invariants, checked as properties

A review found that **malformed** sequences could leave a raw ESC behind (`ESC [ 3 1 \n`, `ESC [ 3 1 ! BEL`, `ESC [ ESC [ 3 1 m`): the fallback for a stray ESC excluded an ESC before `[` or `]`, so a sequence whose CSI/OSC alternative then failed to match kept its ESC. About 0.65% of 200,000 random short inputs leaked one. Fixed, and the guarantees are now stated as properties and tested on seeded random inputs, not only on the cases someone thought of (`terminal-text.test.ts`, "invariants on malformed and random input"; 60,000 inputs per property per alphabet, two alphabets, plus the three literals from the review):

- `toCopyText(x)` never contains `[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]`. Copy has an unconditional fallback that removes any ESC left after the complete sequences.
- `sanitizeForDisplay(x)` keeps an ESC **only** when it begins a complete `ESC [ digits ; : m`. Every other CSI, including one with private parameters or intermediates that ends in `m`, and every ESC that starts nothing complete, is removed.
- `prepareForDisplay(x)` (what `Terminal` renders) holds the same ESC invariant and no backspace: applying a backspace can erase the final `m` of a colour sequence and leave its ESC, so it sanitises again after normalising, and a backspace with nothing to erase (which `normalizeLineControls` keeps, as the peer does) is dropped last. The `Terminal` tests also render 2,000 seeded random inputs and require no control byte in the DOM text.

## What is removed, and what is kept

Kept for display: SGR colour and style (`ESC[...m`), `\n`, `\t`, `\b`, `\r` (normalised by `normalizeLineControls`, then applied by the peer). Removed: OSC (titles, hyperlinks), DCS/SOS/PM/APC, every other CSI
(cursor, erase, private modes), two-byte escapes, a lone or unfinished ESC, other C0 controls, DEL, C1 controls (U+009B is a one-character CSI), and the bidirectional
override/embedding/isolate characters U+202A-202E and U+2066-2069 (they reorder what the reader sees). Copy removes SGR as well, turns `\r\n` and `\r` into newlines and drops `\b`.

## Not covered

- `\r` and `\b` overwrite what was printed before them, as in a real terminal; hostile output can therefore show different text than it first printed. That is inherent to terminal
  semantics, not something to filter. Copy does not replay that collapsing: it gives the text with the escape sequences removed, `\r` as a newline and `\b` dropped.
- A hard cut inside a single line longer than `maxChars` can start in the middle of an escape sequence's text (a line boundary is used whenever one is near).
- Browsers other than Chromium, and screen readers, were not run.
