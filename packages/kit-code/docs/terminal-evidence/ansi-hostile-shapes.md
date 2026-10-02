# Hostile ANSI shapes: one line and 100 lines

Output of `node demo/scripts/ansi-hostile-shapes.mjs` (server render in plain Node, warm second run, built `dist`, one shared and busy machine, 2026-10-02).
Columns: `peer` is `ansi-to-react` 6.2.6 alone on the whole input; `sanitize` is this package's `sanitizeForDisplay` plus `toCopyText` alone on the whole input;
`terminal` is the built `Terminal` (sanitise, normalise `\r`/`\b`, render the last 65,536 characters). Times are for shape, not for the record: rerun on your machine.

## At the 65,536-character window (all three columns)

```
total input per case: 65,536 characters

shape                                      lines      peer  sanitize  terminal
one delimiter repeated "("                   100   0.7 ms   0.3 ms   3.0 ms
one delimiter repeated "("                     1   0.5 ms   0.3 ms   2.6 ms
one delimiter repeated ";"                   100   0.3 ms   0.2 ms   1.9 ms
one delimiter repeated ";"                     1   0.3 ms   0.3 ms   2.0 ms
one delimiter repeated "/"                   100   0.1 ms   0.2 ms   4.7 ms
one delimiter repeated "/"                     1   0.4 ms   0.3 ms   1.8 ms
long SGR parameters, terminated              100    13 ms   0.7 ms    19 ms
long SGR parameters, terminated                1   0.9 ms   0.9 ms   2.1 ms
long SGR parameters, unterminated            100   6.5 ms   1.5 ms   3.4 ms
long SGR parameters, unterminated              1   0.6 ms   0.9 ms   1.9 ms
SGR 38;5 repeated                            100   153 ms   4.2 ms   3.8 ms
SGR 38;5 repeated                              1   115 ms   5.2 ms   4.8 ms
SGR colour change every 6 chars              100   287 ms   1.1 ms   138 ms
SGR colour change every 6 chars                1   131 ms   0.8 ms   133 ms
ESC [ repeated (unfinished CSI starts)       100    14 ms   4.6 ms   4.2 ms
ESC [ repeated (unfinished CSI starts)         1    10 ms   4.6 ms   4.2 ms
ESC ] repeated (OSC starts)                  100   0.4 ms   1.1 ms   1.8 ms
ESC ] repeated (OSC starts)                    1   0.4 ms   1.1 ms   1.9 ms
OSC 8 link, unterminated                     100   0.2 ms   0.4 ms   1.4 ms
OSC 8 link, unterminated                       1   0.2 ms   0.4 ms   2.1 ms
OSC 8 links, terminated                      100   0.2 ms   0.6 ms   1.8 ms
OSC 8 links, terminated                        1   0.2 ms   0.6 ms   1.6 ms
DCS, unterminated                            100   0.2 ms   0.4 ms   1.5 ms
DCS, unterminated                              1   0.2 ms   0.4 ms   1.7 ms
bare ESC repeated                            100   0.7 ms   2.8 ms   2.8 ms
bare ESC repeated                              1   0.7 ms   2.7 ms   3.9 ms
backspace run after text                     100   0.4 ms   1.5 ms   2.1 ms
backspace run after text                       1   0.4 ms   1.2 ms   2.1 ms
backspaces interleaved "a\b"                 100   0.6 ms   2.2 ms   2.6 ms
backspaces interleaved "a\b"                   1   0.6 ms   1.6 ms   2.0 ms
backspace after ESC "ESC[\b"                 100   1.0 ms   4.1 ms   3.8 ms
backspace after ESC "ESC[\b"                   1   1.1 ms   4.3 ms    10 ms
carriage returns "a\r"                       100    11 ms   1.6 ms    13 ms
carriage returns "a\r"                         1    11 ms   1.8 ms   8.3 ms
carriage returns only                        100   0.5 ms   1.7 ms   1.6 ms
carriage returns only                          1   3.71 s   1.9 ms   1.6 ms
carriage returns "ab\rc"                     100    11 ms   1.1 ms   8.8 ms
carriage returns "ab\rc"                       1   6.8 ms   1.2 ms   8.2 ms
bidi overrides                               100   0.3 ms   1.9 ms   2.4 ms
bidi overrides                                 1   0.2 ms   1.9 ms   2.3 ms
C1 controls                                  100   0.2 ms   1.8 ms   2.3 ms
C1 controls                                    1   0.2 ms   1.8 ms   2.2 ms
mixed ESC, BS, CR, SGR                       100   3.8 ms   1.9 ms   6.1 ms
mixed ESC, BS, CR, SGR                         1   1.1 ms   1.2 ms   2.8 ms

slowest peer-alone case: carriage returns only (1 lines) 3715 ms
slowest sanitize/terminal case: SGR colour change every 6 chars (100 lines) 138 ms
```

For comparison, the first version of `Terminal` (before `normalizeLineControls`) measured on the single line of carriage returns: peer alone 6.02 s, `Terminal` 8.80 s.
Timings of the peer's one quadratic regex on its own, on a run of N carriage returns: N=8,192 73 ms; 16,384 304 ms; 32,768 1,371 ms; 65,536 6,048 ms.

## At 1 MiB, `Terminal` and the sanitiser only

The peer column is skipped: on the carriage-return run it would take over an hour.

```
total input per case: 1,048,576 characters

shape                                      lines      peer  sanitize  terminal
one delimiter repeated "("                   100  skipped   5.1 ms   4.3 ms
one delimiter repeated "("                     1  skipped   5.0 ms   2.8 ms
one delimiter repeated ";"                   100  skipped   5.1 ms   2.5 ms
one delimiter repeated ";"                     1  skipped   4.8 ms   3.0 ms
one delimiter repeated "/"                   100  skipped   4.8 ms   4.9 ms
one delimiter repeated "/"                     1  skipped   4.9 ms   2.5 ms
long SGR parameters, terminated              100  skipped    10 ms    11 ms
long SGR parameters, terminated                1  skipped    16 ms   2.4 ms
long SGR parameters, unterminated            100  skipped    36 ms   9.1 ms
long SGR parameters, unterminated              1  skipped    16 ms   2.0 ms
SGR 38;5 repeated                            100  skipped    98 ms   5.9 ms
SGR 38;5 repeated                              1  skipped    87 ms   4.3 ms
SGR colour change every 6 chars              100  skipped    15 ms   135 ms
SGR colour change every 6 chars                1  skipped    21 ms   164 ms
ESC [ repeated (unfinished CSI starts)       100  skipped    68 ms   3.2 ms
ESC [ repeated (unfinished CSI starts)         1  skipped    86 ms   3.6 ms
ESC ] repeated (OSC starts)                  100  skipped    16 ms   1.2 ms
ESC ] repeated (OSC starts)                    1  skipped    15 ms   2.3 ms
OSC 8 link, unterminated                     100  skipped   5.2 ms   0.9 ms
OSC 8 link, unterminated                       1  skipped   5.2 ms   1.4 ms
OSC 8 links, terminated                      100  skipped   9.1 ms   1.4 ms
OSC 8 links, terminated                        1  skipped   9.9 ms   1.0 ms
DCS, unterminated                            100  skipped   5.8 ms   0.9 ms
DCS, unterminated                              1  skipped   5.0 ms   2.9 ms
bare ESC repeated                            100  skipped    42 ms   3.6 ms
bare ESC repeated                              1  skipped    43 ms   4.4 ms
backspace run after text                     100  skipped    18 ms   2.1 ms
backspace run after text                       1  skipped    19 ms   2.6 ms
backspaces interleaved "a\b"                 100  skipped    39 ms   1.3 ms
backspaces interleaved "a\b"                   1  skipped    24 ms   2.1 ms
backspace after ESC "ESC[\b"                 100  skipped    86 ms   3.8 ms
backspace after ESC "ESC[\b"                   1  skipped    84 ms   4.3 ms
carriage returns "a\r"                       100  skipped    26 ms    12 ms
carriage returns "a\r"                         1  skipped    54 ms    13 ms
carriage returns only                        100  skipped    30 ms   2.4 ms
carriage returns only                          1  skipped    68 ms   1.7 ms
carriage returns "ab\rc"                     100  skipped    32 ms   9.0 ms
carriage returns "ab\rc"                       1  skipped    36 ms   8.7 ms
bidi overrides                               100  skipped    33 ms   2.5 ms
bidi overrides                                 1  skipped    28 ms   3.4 ms
C1 controls                                  100  skipped    29 ms   2.4 ms
C1 controls                                    1  skipped    28 ms   2.2 ms
mixed ESC, BS, CR, SGR                       100  skipped    36 ms   3.1 ms
mixed ESC, BS, CR, SGR                         1  skipped    32 ms   3.8 ms
slowest sanitize/terminal case: SGR colour change every 6 chars (1 lines) 164 ms
```

`terminal` does not grow with the input (it renders the last 65,536 characters); `sanitize`, which scans everything, is linear: tens of milliseconds per MiB.
