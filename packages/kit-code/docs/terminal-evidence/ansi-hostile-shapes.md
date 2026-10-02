# Hostile ANSI shapes: one line and 100 lines

Output of `node demo/scripts/ansi-hostile-shapes.mjs` (server render in plain Node, warm second run, built `dist`, one shared and busy machine, 2026-10-02).
Columns: `peer` is `ansi-to-react` 6.2.6 alone on the whole input; `sanitize` is this package's `sanitizeForDisplay` plus `toCopyText` alone on the whole input;
`terminal` is the built `Terminal` (sanitise, normalise `\r`/`\b`, render the last 65,536 characters). Times are for shape, not for the record: rerun on your machine.

## At the 65,536-character window (all three columns)

```
total input per case: 65,536 characters

shape                                      lines      peer  sanitize  terminal
one delimiter repeated "("                   100   0.5 ms   0.3 ms   2.1 ms
one delimiter repeated "("                     1   0.2 ms   0.2 ms   2.1 ms
one delimiter repeated ";"                   100   0.5 ms   0.2 ms   1.5 ms
one delimiter repeated ";"                     1   0.2 ms   0.3 ms   1.6 ms
one delimiter repeated "/"                   100   0.2 ms   0.4 ms   2.3 ms
one delimiter repeated "/"                     1   0.4 ms   0.3 ms   1.9 ms
long SGR parameters, terminated              100    11 ms   0.9 ms    12 ms
long SGR parameters, terminated                1   0.7 ms   0.7 ms   1.9 ms
long SGR parameters, unterminated            100   4.5 ms   1.4 ms   7.2 ms
long SGR parameters, unterminated              1   0.7 ms   0.7 ms   1.9 ms
SGR 38;5 repeated                            100   252 ms   2.5 ms   121 ms
SGR 38;5 repeated                              1    69 ms   2.5 ms   130 ms
SGR colour change every 6 chars              100   337 ms   1.4 ms   144 ms
SGR colour change every 6 chars                1   141 ms   1.5 ms   323 ms
ESC [ repeated (unfinished CSI starts)       100    14 ms   1.7 ms    13 ms
ESC [ repeated (unfinished CSI starts)         1    13 ms   1.7 ms    19 ms
ESC ] repeated (OSC starts)                  100   0.3 ms   0.6 ms   0.7 ms
ESC ] repeated (OSC starts)                    1   0.3 ms   0.6 ms   0.9 ms
OSC 8 link, unterminated                     100   0.1 ms   0.2 ms   0.4 ms
OSC 8 link, unterminated                       1   0.1 ms   0.2 ms   0.6 ms
OSC 8 links, terminated                      100   0.2 ms   0.5 ms   0.6 ms
OSC 8 links, terminated                        1   0.1 ms   0.4 ms   0.5 ms
DCS, unterminated                            100   0.1 ms   0.2 ms   0.3 ms
DCS, unterminated                              1   0.1 ms   0.3 ms   0.5 ms
bare ESC repeated                            100   0.7 ms   1.7 ms   1.6 ms
bare ESC repeated                              1   0.6 ms   2.0 ms   2.7 ms
backspace run after text                     100   0.3 ms   1.0 ms   1.0 ms
backspace run after text                       1   0.3 ms   1.1 ms   1.0 ms
backspaces interleaved "a\b"                 100   0.5 ms   1.3 ms   1.5 ms
backspaces interleaved "a\b"                   1   0.5 ms   1.0 ms   1.1 ms
backspace after ESC "ESC[\b"                 100   0.8 ms   2.9 ms   3.0 ms
backspace after ESC "ESC[\b"                   1   1.0 ms   2.8 ms   2.7 ms
carriage returns "a\r"                       100    11 ms   1.6 ms    11 ms
carriage returns "a\r"                         1    22 ms   1.5 ms    12 ms
carriage returns only                        100   0.7 ms   2.0 ms   0.7 ms
carriage returns only                          1   3.92 s   1.8 ms   1.1 ms
carriage returns "ab\rc"                     100   7.2 ms   1.1 ms   8.2 ms
carriage returns "ab\rc"                       1   4.0 ms   0.8 ms   4.8 ms
bidi overrides                               100   0.2 ms   1.4 ms   2.4 ms
bidi overrides                                 1   0.3 ms   1.7 ms   1.8 ms
C1 controls                                  100   0.1 ms   1.3 ms   2.1 ms
C1 controls                                    1   0.2 ms   1.3 ms   1.9 ms
mixed ESC, BS, CR, SGR                       100   2.9 ms   1.8 ms   8.5 ms
mixed ESC, BS, CR, SGR                         1   1.8 ms   1.7 ms   3.9 ms

slowest peer-alone case: carriage returns only (1 lines) 3921 ms
slowest sanitize/terminal case: SGR colour change every 6 chars (1 lines) 323 ms
```

For comparison, the first version of `Terminal` (before `normalizeLineControls`) measured on the single line of carriage returns: peer alone 6.02 s, `Terminal` 8.80 s.
Timings of the peer's one quadratic regex on its own, on a run of N carriage returns: N=8,192 73 ms; 16,384 304 ms; 32,768 1,371 ms; 65,536 6,048 ms.

## At 1 MiB, `Terminal` and the sanitiser only

The peer column is skipped: on the carriage-return run it would take over an hour.

```
total input per case: 1,048,576 characters

shape                                      lines      peer  sanitize  terminal
one delimiter repeated "("                   100  skipped   5.2 ms   3.4 ms
one delimiter repeated "("                     1  skipped   5.1 ms   2.9 ms
one delimiter repeated ";"                   100  skipped   4.9 ms   2.5 ms
one delimiter repeated ";"                     1  skipped   5.0 ms   3.2 ms
one delimiter repeated "/"                   100  skipped   5.0 ms   4.8 ms
one delimiter repeated "/"                     1  skipped   5.1 ms   2.3 ms
long SGR parameters, terminated              100  skipped    12 ms    11 ms
long SGR parameters, terminated                1  skipped    15 ms   2.5 ms
long SGR parameters, unterminated            100  skipped    28 ms   9.0 ms
long SGR parameters, unterminated              1  skipped    13 ms   2.6 ms
SGR 38;5 repeated                            100  skipped    45 ms   181 ms
SGR 38;5 repeated                              1  skipped    45 ms   134 ms
SGR colour change every 6 chars              100  skipped    21 ms   179 ms
SGR colour change every 6 chars                1  skipped    24 ms   322 ms
ESC [ repeated (unfinished CSI starts)       100  skipped    46 ms    13 ms
ESC [ repeated (unfinished CSI starts)         1  skipped    51 ms    12 ms
ESC ] repeated (OSC starts)                  100  skipped    14 ms   1.1 ms
ESC ] repeated (OSC starts)                    1  skipped    15 ms   1.2 ms
OSC 8 link, unterminated                     100  skipped   5.5 ms   0.7 ms
OSC 8 link, unterminated                       1  skipped   4.8 ms   0.8 ms
OSC 8 links, terminated                      100  skipped    18 ms   1.0 ms
OSC 8 links, terminated                        1  skipped   9.2 ms   0.9 ms
DCS, unterminated                            100  skipped   5.8 ms   0.8 ms
DCS, unterminated                              1  skipped   4.3 ms   0.7 ms
bare ESC repeated                            100  skipped    45 ms   2.0 ms
bare ESC repeated                              1  skipped    41 ms   2.4 ms
backspace run after text                     100  skipped    18 ms   1.1 ms
backspace run after text                       1  skipped    20 ms   2.0 ms
backspaces interleaved "a\b"                 100  skipped    22 ms   2.1 ms
backspaces interleaved "a\b"                   1  skipped    29 ms   2.2 ms
backspace after ESC "ESC[\b"                 100  skipped    47 ms   3.6 ms
backspace after ESC "ESC[\b"                   1  skipped    48 ms   4.2 ms
carriage returns "a\r"                       100  skipped    65 ms    12 ms
carriage returns "a\r"                         1  skipped    66 ms    14 ms
carriage returns only                        100  skipped    33 ms   1.7 ms
carriage returns only                          1  skipped    72 ms   1.7 ms
carriage returns "ab\rc"                     100  skipped    32 ms   8.4 ms
carriage returns "ab\rc"                       1  skipped    38 ms   9.1 ms
bidi overrides                               100  skipped    31 ms   2.6 ms
bidi overrides                                 1  skipped    35 ms   2.5 ms
C1 controls                                  100  skipped    29 ms   2.4 ms
C1 controls                                    1  skipped    28 ms   2.3 ms
mixed ESC, BS, CR, SGR                       100  skipped    34 ms   5.4 ms
mixed ESC, BS, CR, SGR                         1  skipped    28 ms   3.9 ms
slowest sanitize/terminal case: SGR colour change every 6 chars (1 lines) 322 ms
```

`terminal` does not grow with the input (it renders the last 65,536 characters); `sanitize`, which scans everything, is linear: tens of milliseconds per MiB.
