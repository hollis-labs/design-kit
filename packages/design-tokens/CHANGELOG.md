# @hollis-labs/design-tokens

## 0.1.0 — 2026-09-11

First release, alongside the five other packages in this repo. The set shares a
version number; the release record for all of it is the repo's
[`CHANGELOG.md`](https://github.com/hollis-labs/design-kit/blob/main/CHANGELOG.md).

**The token contract** — 48 colour token names and their types — plus ten built-in
themes, four added type steps, two radius steps and two tracking steps. No React, no
framework, no dependencies at all.

A **synthesis of two working implementations**, `libs/sysop-ui` and `apps/nanite`,
rather than an extraction of either: both palette sets survive whole, and the
`--hl-*` value layer under a `--color-*` contract layer is Nanite's design.

Notable, because they are easy to mistake for oversights:

- **`chart-1` … `chart-5` are names with placeholder values.** Every built-in sets
  all five to the same magenta and `theme.chartPalette === 'placeholder'` says so in
  the data. The palette is a pending design pass. Five identical magentas make a
  chart obviously wrong; five plausible colours would make it quietly unreviewed.
- **`DERIVED_TOKEN_VALUES` exports the 168 values nobody chose** — the ones filled by
  rule where neither source implementation had one. Exporting the list is how that
  stays honest; none has been through design review.
- **`Theme.tokens.light` is optional**, the one place the contract was not
  implemented literally, because sysop-ui's four palettes are dark-only alternates
  rather than modes and do not acquire light variants by being asked.

Corrected in this README at publish: the tracking scale is **two** steps
(`tracking-label` 0.18em, `tracking-eyebrow` 0.28em), not one at 0.16em; the derived
value count is 168 across four rules, not 88 across three; and `kit-dashboard` names
its status colours `status-*` from its own theme values — the `dash` prefix is
reserved and unused.
