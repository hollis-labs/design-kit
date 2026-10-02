import { describe, expect, it } from 'vitest'
import { sanitizeForDisplay, tailOf, toCopyText } from './terminal-text'

const ESC = '\x1b'

describe('sanitizeForDisplay', () => {
  it('keeps colour and style sequences and the layout characters', () => {
    const text = `${ESC}[1;31mred${ESC}[0m ok\ttab\nline\rcr\bbs`
    expect(sanitizeForDisplay(text)).toBe(text)
  })

  it.each([
    ['an OSC 8 hyperlink with a javascript: target', `${ESC}]8;;javascript:alert(1)\x07click${ESC}]8;;\x07`, 'click'],
    ['an OSC title ended by ST', `${ESC}]0;evil title${ESC}\\shown`, 'shown'],
    ['a device control string', `a${ESC}Pq#0;2;0;0;0${ESC}\\b`, 'ab'],
    ['screen and cursor control', `a${ESC}[2Kb${ESC}[1Ac${ESC}[?25ld${ESC}[3;4Hz`, 'abcdz'],
    ['two-byte escapes such as save cursor', `a${ESC}7b${ESC}Mc${ESC}=d`, 'abcd'],
    ['a lone escape (followed by no valid escape)', `a${ESC}\nb`, 'a\nb'],
    ['an escape at the very end', `ok${ESC}`, 'ok'],
    ['a CSI that has not finished arriving', `ok${ESC}[3`, 'ok'],
    ['an OSC that has not finished arriving', `ok${ESC}]0;ti`, 'ok'],
    ['C0 controls other than \\b \\t \\n \\r, and DEL', 'a\x00\x07\x0b\x0c\x1f\x7fb', 'ab'],
    ['C1 controls, including the one-character CSI (U+009B)', 'a\u009b31m\u0090b\u009cc', 'a31mbc'],
    ['bidirectional override and isolate controls', 'safe\u202etxt.exe\u202c \u2066x\u2069', 'safetxt.exe x'],
  ])('removes %s', (_label, input, expected) => {
    expect(sanitizeForDisplay(input)).toBe(expected)
  })

  it('does not let an unterminated OSC or DCS swallow what follows it', () => {
    const rest = 'x'.repeat(10_000)
    // Only the first 4096 payload characters belong to the string, as in a real terminal.
    expect(sanitizeForDisplay(`${ESC}]${rest}`)).toBe('x'.repeat(10_000 - 4096))
    expect(sanitizeForDisplay(`${ESC}P${rest}`)).toBe('x'.repeat(10_000 - 4096))
  })

  it('leaves no escape byte behind', () => {
    const noisy = `${ESC}[31m${ESC}]8;;u\x07t${ESC}]8;;\x07${ESC}[2K${ESC}${ESC}${ESC}[`
    expect(sanitizeForDisplay(noisy)).not.toMatch(new RegExp(String.raw`\x1b(?!\[\d+m)`))
  })
})

describe('toCopyText', () => {
  it('is the visible text: no sequences, newlines for returns, no backspaces', () => {
    const raw = `${ESC}[31mred${ESC}[0m\r\n10%\r20%\bX${ESC}]8;;u\x07link${ESC}]8;;\x07${ESC}[2K`
    expect(toCopyText(raw)).toBe('red\n10%\n20%Xlink')
  })

  it('drops bidirectional override characters too', () => {
    expect(toCopyText('a\u202eb\u2067c')).toBe('abc')
  })

  it('is empty for output that is nothing but control sequences', () => {
    expect(toCopyText(`${ESC}[2J${ESC}[H${ESC}[31m${ESC}[0m`)).toBe('')
  })
})

describe('tailOf', () => {
  it('returns short text untouched', () => {
    expect(tailOf('abc', 10)).toEqual({ text: 'abc', truncated: false })
  })

  it('starts on the next line when the cut fell near a line end', () => {
    expect(tailOf('first line\nsecond line\nthird', 18)).toEqual({ text: 'second line\nthird', truncated: true })
  })

  it('cuts a very long single line where it falls', () => {
    expect(tailOf(`${'x'.repeat(100)}\n${'y'.repeat(10)}`, 8)).toEqual({ text: 'yyyyyyyy', truncated: true })
  })

  it('does not start inside a surrogate pair', () => {
    const text = `abc\u{1F600}def`
    const tail = tailOf(text, 4) // would start on the low surrogate of the emoji
    expect(tail.text).toBe('def')
    expect(tail.text).not.toMatch(/[\udc00-\udfff]/)
  })
})

describe('cost on hostile input', () => {
  // Generous ceilings: these catch backtracking (which would take seconds to forever), not tuning.
  const MB = 1 << 20
  const hostile: Array<[string, string]> = [
    ['an unterminated CSI with a megabyte of parameters', `${ESC}[${'1;'.repeat(MB / 2)}`],
    ['a megabyte of unfinished CSI starts', `${ESC}[1`.repeat(MB / 3)],
    ['a megabyte of OSC starts', `${ESC}]x`.repeat(MB / 3)],
    ['an unterminated OSC megabyte', `${ESC}]${'x'.repeat(MB)}`],
    ['an unterminated DCS megabyte', `${ESC}P${'x'.repeat(MB)}`],
    ['a megabyte of bare escapes', ESC.repeat(MB)],
    ['megabytes of real colour changes', `${ESC}[31ma${ESC}[0m`.repeat((4 * MB) / 10)],
  ]

  it.each(hostile)('sanitizes %s in linear time', (_label, input) => {
    const start = performance.now()
    sanitizeForDisplay(input)
    toCopyText(input)
    expect(performance.now() - start).toBeLessThan(2000)
  })
})
