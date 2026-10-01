# @hollis-labs/kit-dashboard

## Unreleased (CW-20260911-0071, step c)

- Remove the hand-authored base palette and reverse --hl mapping. Generate legacy
  ID aliases from design-tokens; keep sysop.theme and existing helper IDs.
- Consume canonical base utilities; retain six shadcn compatibility mappings so
  modern controls keep their appearance. Dashboard workflow derivations remain.
  Canonical legacy colors approved under CW-20261001-0526 option A.
- Use feedback danger/info for SettingsNotice; keep status pills on workflow tones.

## Unreleased (CW-20260911-0071, step b)

- Register dash-status lifecycle and label utilities in the kit-owned manifest;
  migrate components and demo uses, preserving CSS bindings and rendered colors.
  Keep the old names as deprecated compatibility aliases in the same manifest.

## Unreleased (CW-20260911-0071, step a)

- Delegate theme-only persistence to design-tokens while preserving sysop.theme,
  legacy IDs and defaults. Catch blocked storage getters; no palette/CSS changes.

## Unreleased (CW-20260912-0031)

- Add opt-in `show-scrollbar` with contract colors that follow light/dark mode.
  Keep global suppression unchanged; explicit `no-scrollbar` wins. Add a gallery
  example and 24-state rendered proof. No app-specific escape-hatch names.

## Unreleased (CW-20261001-0529)

- Own idiom names and deprecations in the shipped `idiom-tokens.json` manifest;
  derive `DASHBOARD_DEPRECATED_TOKENS` from it. Register the checked bindings in
  the design gate and switch PriorityBadge to canonical `dash-priority-*` utilities.

## Unreleased (CW-20260912-0097)

- CW-20260912-0046: preserve priority fills as `dash-priority-p1-bg` /
  `dash-priority-p2-bg`; retain deprecated CSS aliases and badge compatibility
  uses until the idiom vocabulary registration seam lands (CW-20261001-0529).
  Export dashboard-owned token migration metadata. Workflow status/label names
  remain unchanged. All measured badge colors and sizes are preserved.

- Declare `tailwindcss: ^4.0.0` as a required peer for styled components.
  npm 7+ auto-installs a missing peer; incompatible installed majors fail peer
  resolution. Document the explicit app dependency and CSS build integration,
  which an automatic peer install does not configure.

## 0.1.0 — 2026-09-11

First release under this name, alongside the five other packages in this repo. The
set shares a version number; the release record for all of it is the repo's
[`CHANGELOG.md`](https://github.com/hollis-labs/design-kit/blob/main/CHANGELOG.md).

**The version went down, from `0.9.0` to `0.1.0`, deliberately.** `0.9.0` came from
`@hollis-labs/sysop-ui`, the package this was forked from. Nothing has ever been
published under the name `@hollis-labs/kit-dashboard`, so there is no line to
continue, and keeping the number would have claimed a continuity that does not exist.
`sysop-ui` stays published at `0.9.0`, untouched, serving its own consumers.

**The dashboard idiom, and nothing else.** Since the fork this package has been
rebased onto the extracted packages: idiom-free primitives come from
`@hollis-labs/design-components`, transport from `@hollis-labs/design-app-runtime`,
the vocabulary from `@hollis-labs/design-tokens`. Its own token names went from 256
to 43. The README's *"Moved out, and where they went"* table lists every export that
left and which package now owns it.

**It re-exports none of them, on purpose** — taking the dashboard should be a choice,
not a side effect of wanting a Button.

Fixed at publish, both invisible from inside this repo:

- **`theme.css` could not be imported by anyone outside it.** It pulled in
  `shadcn/tailwind.css` while `shadcn` is a devDependency — correctly, it is a 5.9 MB
  CLI — so a consumer following this README got `Can't resolve 'shadcn/tailwind.css'`
  and no stylesheet at all. The import is gone; the three things this repo actually
  used from it now ship from `design-components`.
- **Three shipped type declarations pointed outside the package**, at
  `../../../design-components/src/index.ts` — not published, not present in a
  consumer's tree, and carrying a `.ts` extension `tsc` rejects. `DataTable`,
  `DataTableRow` and `OperationsTablePage` were affected. The emitted JavaScript was
  always correct, so this broke types only, and `tsc` had been reporting it 65 times
  while the build exited 0.

**Still carrying its own theme values** — 434 lines across four palettes, speaking the
contract vocabulary but not yet using contract values. That is the next task
(CW-20260911-0071) and deliberately not this release.
