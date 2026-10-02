# Dashboard keyboard focus and sort contrast — CW-20261002-0076

The before and after screenshots use an isolated Tailwind v4 consumer built from
installed npm tarballs, with no workspace links or source aliases. Before is main
`64a75fe`; after is the candidate diff recorded in [provenance.json](provenance.json).
Five packages were built and packed: design-tokens, design-components,
design-app-runtime, kit-dashboard (all 0.3.0), and kit-observe (0.1.0).
Only kit-dashboard changes; the tarball hashes record which artifacts were installed.
These are candidate builds at existing versions, not a published release.

## Findings

For all four legacy dark themes at both 390 and 1440 CSS pixels:

- Tab reaches Refresh, Actions, kit-observe's Retry Diagnostics, and its Copy
  Diagnostics data Button. Before: `:focus-visible` is true but box-shadow and
  outline-style are `none`. After: each has the existing 3px focus-visible ring.
- Tab to Actions followed by ArrowDown reaches Inspect in the Base UI menu.
  Its background highlight exists before and after. After also has a 2px token
  ring; removing the suppression alone leaves `outline-hidden` without an outline.
- Mouse clicks on Buttons and the menu item have `:focus-visible=false`,
  box-shadow `none` and outline-style `none`. The menu click receipt is captured
  by an event listener before Base UI unmounts the selected item. Pointer highlight
  and hover colors remain active.
- Unsorted glyphs now use full `text-text-subtle`. Sorted glyphs retain
  `text-text-muted` and the directional arrow; their ratios are unchanged and higher.

| Legacy theme | Unsorted before | Unsorted after | Sorted before/after |
| --- | ---: | ---: | ---: |
| p4-white | 2.128 | 5.291 | 13.461 |
| p1-green-phosphor | 2.123 | 5.287 | 15.508 |
| p3-amber-phosphor | 2.122 | 5.243 | 13.617 |
| hi-contrast | 3.763 | 13.615 | 21.000 |

Ratios are identical at 390 and 1440. All unsorted glyphs exceed the requested 3:1
UI-component criterion (and 4.5:1 if treated as normal text). The contrast method
matches Tachyon's `appearance-settled.mjs`: resolve CSS colors through a 1px canvas,
composite each ancestor's background and opacity in painting order, then compute
sRGB relative luminance. Before exactly reproduces all four ratios reported in
the task. Black/white (21:1) and identical-color (1:1) controls verify the calculation.
The [before](before.json) and [after](after.json) receipts include computed focus
styles and composited foreground/background colors for each case.

## Screenshots

Each theme/width has paired `before` and `after` PNGs for Refresh (`focus`), Retry,
Copy, keyboard menu focus, unsorted glyphs (`sort`) and sorted glyphs (`sorted`).
Representative pairs:

| State | Before | After |
| --- | --- | --- |
| P4 keyboard Refresh, 390 | [before](p4-white-390-before-focus.png) | [after](p4-white-390-after-focus.png) |
| P4 keyboard Retry, 390 | [before](p4-white-390-before-retry.png) | [after](p4-white-390-after-retry.png) |
| P4 keyboard Copy, 390 | [before](p4-white-390-before-copy.png) | [after](p4-white-390-after-copy.png) |
| P4 keyboard menu, 390 | [before](p4-white-390-before-menu.png) | [after](p4-white-390-after-menu.png) |
| Green unsorted table, 1440 | [before](p1-green-phosphor-1440-before-sort.png) | [after](p1-green-phosphor-1440-after-sort.png) |
| Green sorted table, 1440 | [before](p1-green-phosphor-1440-before-sorted.png) | [after](p1-green-phosphor-1440-after-sorted.png) |
| Amber unsorted table, 390 | [before](p3-amber-phosphor-390-before-sort.png) | [after](p3-amber-phosphor-390-after-sort.png) |
| High contrast unsorted table, 1440 | [before](hi-contrast-1440-before-sort.png) | [after](hi-contrast-1440-after-sort.png) |

## Repository gate

The final implementation passed:

```text
npm run build                         PASS (exit 0)
npm run typecheck                     PASS (exit 0)
npm run test:run                      PASS (exit 0; 60 test files, 765 tests)
npm run lint                          PASS (exit 0)
node .github/scripts/lint-gate.mjs     PASS (exit 0)
node .github/scripts/design-rules-gate.mjs
  REPORTED, not blocking — none. Every package is enforced at zero.
  0 violation(s).
  design-rules-gate: PASS.
```

Test totals are derived from `npm run test:run` output by summing Vitest's
`Test Files N passed` and `Tests N passed` rows across workspaces.

## Reproduce

Run on baseline `64a75fe` and then the candidate tree, keeping the packs in
separate directories under `$TMPDIR`. At each tree:

```sh
npm ci --no-audit --no-fund
npm run build
mkdir -p "$TMPDIR/dashboard-focus-packs"
npm pack --ignore-scripts --pack-destination "$TMPDIR/dashboard-focus-packs" \
  -w @hollis-labs/design-tokens -w @hollis-labs/design-components \
  -w @hollis-labs/design-app-runtime -w @hollis-labs/kit-dashboard \
  -w @hollis-labs/kit-observe
```

Copy [consumer/](consumer/) to a fresh directory under `$TMPDIR`, install the
appropriate packs, build, then serve that production build:

```sh
npm install --no-audit --no-fund "$TMPDIR/dashboard-focus-packs/"*.tgz
npm run build
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4176 --strictPort
```

From another terminal in the consumer directory, with Playwright's browser and
runtime libraries available:

```sh
node capture.mjs before "$TMPDIR/dashboard-focus-evidence"
# Repeat with the candidate packs installed and its production build served:
node capture.mjs after "$TMPDIR/dashboard-focus-evidence"
```

`CHROMIUM_PATH` optionally selects a browser executable; `LD_LIBRARY_PATH` can
supply user-local browser libraries. The recorded run uses headless Chromium
from `chromium_headless_shell-1243`, Playwright 1.61.1, Vite 5.4.21,
Tailwind/@tailwindcss/vite 4.2.2, React 19.2.4, and Base UI 1.3.0.
The capture script uses actual Tab/ArrowDown/click input, waits for transitions,
and asserts candidate keyboard rings, pointer suppression, the menu highlight,
unsorted contrast >=3:1, and a stronger sorted glyph.

This evidence covers the four legacy dark themes and the named controls in
Chromium. It does not redesign ring tokens, certify every control/browser/theme,
change consumer apps, or publish packages. The fix belongs in the next lockstep
core release and its CW-20261002-0075 proof.
