# Keyboard focus contrast — CW-20261002-0091

Measured from installed npm tarballs: baseline `ca8e087`, then the candidate
source diff. No workspace links or source aliases. [Provenance](provenance.json)
records each tarball hash; versions stay unchanged because these are candidate
builds for the next minor core release.

## Decision

Remove `/50` from base focus rings and strengthen only three `ring` values:

| Theme / mode | Before | After | Existing authored step used |
| --- | --- | --- | --- |
| dir-a / dark | #6e8aa8 | #96969c | fg-muted |
| dir-e / light | #006e8c | #4d5e69 | fg-faint |
| sysop-p4-white / dark (also p4-white) | rgb(63 63 70 / 60%) | #83838b | fg-faint |

Dropping `/50` alone still leaves minimum contrasts of 2.603, 2.811 and 1.060
respectively. Making the old colors opaque alone also fails: P4's old opaque
color is only 1.104 on surface-active, and the other two are already opaque.
The chosen change keeps ring widths, radii and placement and leaves every other
palette value alone. A new 2px offset foreground outline could pass, but changes
indicator geometry throughout the kits rather than fixing the existing ring.
The [candidate comparison](candidates.json) records all six token surfaces in
all theme/mode combinations, including composited selection tints.

Destructive Button and Badge focus now use `ring`, instead of a diluted danger
ring. Invalid controls keep their feedback borders and unfocused feedback halo;
when focused, the contrast ring takes precedence. InputGroup's descendant focus
and invalid selectors are combined explicitly. These are deliberate appearance
decisions for the later polishing session.

No token is added. `ring-soft` remains retired with its mapping to `ring`.
The three stronger values also deliberately change chat drag feedback,
workflow selected-edge/node/marquee and connection strokes, and the dashboard's
general outline-color mapping in those same pairs. The legacy p4-white alias
follows sysop-p4-white. All other decorative theme/mode styles are unchanged.
Every use is listed in the [ring-use audit](ring-uses.md); the
[decorative captures](decoration.md) show each changed computed property.

## Matrix and evidence

[Summary matrix](matrix.md): each value is **before → after**, taking the worst
composited contrast across the seven actual surrounding surfaces. The last
column includes destructive and invalid variants and all other measured rings.
The [complete control matrix](controls.md) lists every control/theme/mode and
its worst surrounding surface. Composer uses its measured full-strength border
contrast after confirming the computed border equals the token; its raw shadow
and outline indicator ratio is zero because neither is painted. [Verification](verification.json) records the
minimum, pointer comparisons and each deliberate decorative change.

The browser fixture imports Button, Input, Textarea, Select, Checkbox, Switch,
Tabs, Badge, InputGroup, ScrollArea and ThemePicker from the packed base package,
plus actual AttachmentDropzone, Node, Connection and Edge.Temporary components.
It also renders the existing HUD input and focus-within composer border styles.
The tested surrounds are page, elevated, surface, hover, active, selection and
popover (`bg-popover`, the menu/popover elevated alias). Tabs' list surface and
other intervening ancestors are composited as they actually render.

The raw before/after receipts include computed ring, outline, border, fill and
text styles for keyboard focus and pointer click. They are archived outside Git
at `/home/chrispian/dev/agent-os/workspaces/drafts/CW-20261002-0091/`;
[provenance](provenance.json) records their SHA-256, byte sizes and regeneration
commands. The committed [compact contrast receipt](contrast.csv) retains every
theme, mode, control, surround and before/after ratio (six decimal places).
Native :focus-visible behavior is retained: clicked text inputs, textareas,
grouped inputs and the native ThemePicker can draw the same indicator as Tab.
Their click indicators strengthen too. For controls where a click does not
match :focus-visible, painted pointer styles are unchanged. General outline
colors deliberately follow the stronger token in the three pairs even when
outline-style is none; those unpainted computed differences are listed.
No input-modality JavaScript is added.

Each component is isolated in the measurement fixture's Tab order and reached
with a real Tab key; a real click resets focus and supplies the pointer sample.
While it remains focused, the actual surrounding section switches between
seven token backgrounds and computed styles are read after each switch. CSS
transitions are disabled for settled measurements. Select measurements await
the opened listbox before recording pointer styles and dismiss it with Escape. Drag samples wait for the component’s existing
`data-dragging` marker after dispatching the file drag event.
Contrast resolves CSS colors through a one-pixel canvas, composites ancestors
and alpha, and uses WCAG sRGB relative luminance. Black/white = 21:1 and identical
colors = 1:1 controls check the formula. This receipt verifies appearance in
Chromium; it does not certify arbitrary host opacity, custom fills or themes,
clipping, disabled controls, forced-colors mode or every browser.

## Dashboard regression fixture

The unchanged #87 [packed consumer](../dashboard-focus/consumer/) was rerun with
the final candidate's five packages. [Dashboard receipt](dashboard-after.json)
covers all four legacy dark themes at 390 and 1440 CSS pixels. Refresh, Actions,
Retry Diagnostics and Copy Diagnostics data have nonzero keyboard rings and none
on pointer click. Menu keyboard focus and pointer suppression pass too. Sort
glyph contrast is unchanged from #87. Screenshots are scratch output for this
rerun; no additional visual checkpoint is required.

## Gate

See [gate.txt](gate.txt) for the final command results. Build, typecheck, lint,
test:run, lint-gate and design-rules-gate must pass; design-rules reports zero.
The browser receipt verifier requires >=3:1 for each measured focus indicator,
unchanged pointer painting, and decorative differences only in the approved
palette/mode pairs.

## Reproduce

Build the baseline and candidate separately, then pack these workspaces to
separate directories under `$TMPDIR`:

```sh
npm ci --no-audit --no-fund
npm run build
npm pack --ignore-scripts --pack-destination "$TMPDIR/focus-packs" \
  -w @hollis-labs/design-tokens -w @hollis-labs/design-components \
  -w @hollis-labs/design-app-runtime -w @hollis-labs/kit-dashboard \
  -w @hollis-labs/kit-observe -w @hollis-labs/kit-chat -w @hollis-labs/kit-workflow
```

Copy [consumer/](consumer/) to `$TMPDIR/focus-consumer`, install the corresponding
packs there, build and serve on loopback:

```sh
npm install --no-audit --no-fund "$TMPDIR/focus-packs/"*.tgz
npm run build
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4179 --strictPort
```

In the consumer directory, with Playwright's Chromium and required runtime
libraries available:

```sh
node capture.mjs before "$TMPDIR/focus-evidence" http://127.0.0.1:4179
# Repeat from a separate candidate consumer/server with phase 'after'.
node capture.mjs after "$TMPDIR/focus-evidence" http://127.0.0.1:4180
node candidates.mjs "$TMPDIR/focus-evidence/candidates.json"
node summarize.mjs "$TMPDIR/focus-evidence"
```

`CHROMIUM_PATH` optionally selects the executable and `LD_LIBRARY_PATH` can
supply user-local libraries. `RESUME=1` continues complete captured cells;
`PROBES=Select,SelectInvalid` narrows a targeted recapture. Use the same final
fixture in both consumers. The #87 fixture has its own reproduction commands.
