# @hollis-labs/kit-dashboard

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
