# Font-size class merge — CW-20261001-0521

The two screenshots render the same primary Button (`size="sm"`) and all Pill
tones with identical compiled theme CSS and the same sysop P4 dark palette.
The before image uses the packed pre-fix components; the after image uses this
branch's built components. This isolates the class-merging behavior from token
values. Chromium captured a 720 × 250 viewport and cropped the rendered section.

| Before | After |
|---|---|
| ![Before](./before.png) | ![After](./after.png) |

The button stays 13px but retains `text-primary-foreground` after the fix,
changing its computed foreground from near white to black on the same light fill.
Every Pill retains `text-caption`, changing from inherited 16px to 10px without
losing its tone. [Before computed styles](./before.json) and
[after computed styles](./after.json) include the rendered classes and colors.

The separate legacy dashboard `--hl-info`/`--hl-success` problem remains in
CW-20261001-0498; these images use a complete built-in palette so it cannot obscure
this regression.
