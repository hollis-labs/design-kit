/**
 * Text handling for `/terminal`. Original Hollis Labs code (MIT), not vendored.
 *
 * Terminal output is untrusted: a tool, a package script or a remote host wrote it. Two things are
 * done to it before it reaches the ANSI renderer, and a third for the clipboard.
 *
 * 1. `sanitizeForDisplay` keeps colour and text styling (SGR, `ESC [ ... m`) and the characters a
 *    terminal lays out (`\n \t \b \r`) and removes everything else that is a control sequence: window
 *    titles, OSC 8 hyperlinks, cursor and screen control, device strings, stray ESC and C0/C1 control
 *    bytes. The renderer would otherwise print an OSC payload (`javascript:...`) as visible text.
 * 2. `tailOf` bounds the work: the renderer builds one DOM element per styled run, so cost grows with
 *    the input. Measured with ansi-to-react 6.2.6 on a hostile input of one colour change per six
 *    characters, rendering took ~0.2 s at 96 KB and ~8.6 s at 6 MB. Only the last `maxChars` are shown.
 * 3. `toCopyText` strips every control sequence, so what is copied is the text the user sees, not
 *    bytes that a terminal would execute when pasted.
 *
 * Every pattern here is linear: the character classes inside one sequence are disjoint, there is no
 * nested quantifier and no alternation that overlaps, so nothing can backtrack on hostile input.
 */

// ESC-introduced sequences, shared by both patterns below. In order:
//   OSC    ESC ] ... (BEL | ESC \)          title, hyperlink; at most 4096 payload characters, as terminals bound it, so an
//                                           unterminated one cannot swallow the output that follows
//   DCS... ESC P|X|^|_ ... (ESC \)          device control, SOS, PM, APC; same bound
//   CSI    ESC [ params intermediates final parameter bytes 0x30-0x3F, intermediates 0x20-0x2F, final 0x40-0x7E
//   two    ESC + one byte 0x30-0x7E         two-byte escapes (save cursor, reset, index, ...); `[` and the string openers come first
//   tail   ESC with an unfinished sequence at the very end of the text (output still streaming)
//   other  a lone ESC that starts none of the above
const OSC = String.raw`\][^\x07\x1b]{0,4096}(?:\x07|\x1b\\)?`
const DEVICE = String.raw`[PX^_][^\x1b]{0,4096}(?:\x1b\\)?`
const FE = String.raw`[0-Z\\-~]`
const UNFINISHED_AT_END = String.raw`(?:\[[0-?]*[ -/]*|\][^\x07\x1b]*|[PX^_][^\x1b]*)?$`
// C0 controls except \b \t \n \r (ESC is handled above), DEL, the C1 range (U+009B is a one-character CSI), and the
// bidirectional embedding/override/isolate controls (U+202A-202E, U+2066-2069), which can reorder what the user reads.
const CONTROLS = String.raw`[\x00-\x07\x0b\x0c\x0e-\x1a\x1c-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]`

/** CSI with any final byte except `m`: SGR (colour and style) survives. */
const DISPLAY = new RegExp(
  String.raw`\x1b(?:${OSC}|${DEVICE}|\[[0-?]*[ -/]*[@-ln-~]|${FE}|${UNFINISHED_AT_END}|(?![\[\]]))|${CONTROLS}`,
  'g',
)
/** CSI with any final byte: SGR goes too. */
const ALL = new RegExp(
  String.raw`\x1b(?:${OSC}|${DEVICE}|\[[0-?]*[ -/]*[@-~]|${FE}|${UNFINISHED_AT_END}|(?![\[\]]))|${CONTROLS}`,
  'g',
)

/** Keep SGR colour and style, `\n \t \b \r` and text; drop every other control sequence and control byte. */
export function sanitizeForDisplay(text: string): string {
  return text.replace(DISPLAY, '')
}

/** The text a user would select: no control sequences at all, `\r\n` and `\r` as newlines, `\b` gone. */
export function toCopyText(text: string): string {
  return text.replace(ALL, '').replace(/\r\n?/g, '\n').replaceAll('\x08', '')
}

/** The last `maxChars` of `text`, starting on a line boundary when one is near, never inside a surrogate pair. */
export function tailOf(text: string, maxChars: number): { text: string; truncated: boolean } {
  if (text.length <= maxChars) {
    return { text, truncated: false }
  }

  const cut = text.length - maxChars
  const newline = text.indexOf('\n', cut)
  let start = newline !== -1 && newline - cut < maxChars / 2 ? newline + 1 : cut
  const unit = text.charCodeAt(start)
  if (unit >= 0xdc00 && unit <= 0xdfff) {
    start += 1 // the cut fell between the halves of a surrogate pair
  }
  return { text: text.slice(start), truncated: true }
}
