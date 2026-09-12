# Changelog

All six packages in this repo are released together and share a version number, so
"same number, same release" is a true statement about them. This file is the release
record for the set; each package also carries its own `CHANGELOG.md` for anything
specific to it.

---

## 0.1.0 — 2026-09-11

**First release. Six packages appear on npm at once, none of which existed under
these names before.** If you have never seen this project, read this section top to
bottom — it is written for you rather than for someone who followed the work.

### What this is

One rule, enforced mechanically:

> **A component may name a token, never a value.**

It covers **scale** as much as colour — a component reaching for `text-[13px]` is
naming a value exactly as much as one reaching for `#1a1b26`. The point is that
appearance has exactly one authority instead of being re-decided in every component.

Four layers, in dependency order:

| Layer | | Package |
|---|---|---|
| 1 | **headless behaviour** — no appearance | Base UI (`@base-ui/react`), a peer |
| 2 | **the token contract** — the names and their types, a vocabulary with no values | `@hollis-labs/design-tokens` |
| 3 | **the theme** — the values. The only layer permitted to name a colour. | `design-tokens`' ten built-ins, or your own |
| 4 | **components** — styled compositions of (1) that reference only (2) | `@hollis-labs/design-components`, and the kits |

Tokens come before components on purpose: a component authored with no token contract
available does not avoid drift, it just relocates it somewhere harder to see.

### The packages

| Package | What it is | Take it if |
|---|---|---|
| **`@hollis-labs/design-tokens`** | The contract — 48 colour token names and their types — plus ten built-in themes. No React, no framework, no dependencies. | you want the vocabulary, with or without anything else here |
| **`@hollis-labs/design-components`** | The idiom-free base: 23 shadcn primitives on Base UI, plus 21 components. Names tokens, never values. | you want components and your own layout |
| **`@hollis-labs/design-app-runtime`** | API client, polling and SSE hooks, storage, list cursors. **No opinion about appearance** — zero runtime dependencies, zero class strings. | you want the plumbing without taking a look |
| **`@hollis-labs/kit-dashboard`** | The dashboard idiom: nav rail, page header, `DataTable`, filter bar, twelve widgets, charts. A **kit** is layers 3 + 1 bundled. | you are building a dense operations UI |
| **`@hollis-labs/design-bindings`** | The binding contract — which component draws a wire kind, and at what trust. Names a component identity, never an appearance. | you render server-described UI |
| **`@hollis-labs/eslint-config-design`** | The gate. Six rules that enforce the one rule, including `no-undefined-token`. | you want the rule enforced rather than agreed to |

### What an adopter does first — and it is not optional

**Tailwind v4 emits a utility only for a class string it has seen, and it does not
scan `node_modules`.** Every package here ships its class strings inside `dist`. So
unless your build is pointed at them, the components render, render *mostly
unstyled*, and **nothing errors**.

One import fixes it, and each package ships the file:

```css
@import "tailwindcss";
@import "@hollis-labs/design-tokens/design-tokens.css";
@import "@hollis-labs/design-components/source.css";   /* ← without this, no colour */
```

Using `kit-dashboard`? Its theme covers both:

```css
@import "tailwindcss";
@import "@hollis-labs/kit-dashboard/theme.css";
```

`source.css` is shipped rather than documented as a glob you write yourself, because
`@source` paths resolve relative to the CSS file that declares them — so the path is
written once, by the package, against a layout the package controls. A hand-written
`@source "../node_modules/…"` breaks with hoisting, with the package manager, and
inside a monorepo, and it fails exactly as silently as leaving it out.

### Versioning — why all six are `0.1.0`

They are released as a set and depend on each other, so a shared number makes "same
number, same release" true, which is the property you actually need when six packages
arrive at once and three of them are linked. `0.x` keeps pre-1.0 latitude while this
is still developing in the open; `0.1.0` rather than `0.0.1` says these were designed
and reviewed rather than scaffolded. Sibling ranges are pinned at `^0.1.0` — never
`*` — so a published manifest can only ask for versions that exist.

**`kit-dashboard` goes down, from `0.9.0` to `0.1.0`, and that is deliberate.** It
carried `0.9.0` from `@hollis-labs/sysop-ui`, the package it was forked from. Nothing
has ever been published under the name `@hollis-labs/kit-dashboard`, so there is no
line to continue, and keeping `0.9.0` would have asserted a continuity that does not
exist — while putting the least contract-conformant package in the set eight minors
ahead of the contract it depends on.

### Relationship to `@hollis-labs/sysop-ui`

`sysop-ui` is **not deprecated, not moved, and not affected by this release.** It
stays published at `0.9.0` serving its eight consumers, untouched. `design-kit` is a
**fork**, not a rename — which is exactly what lets it change freely without breaking
anything live. `kit-dashboard` carries sysop-ui's real git history.

Each project migrates on its own schedule, in its own session. Nothing here requires
anyone to move.

### What is deliberately NOT in this release

- **`@hollis-labs/kit-chat` does not ship.** It is reserved and empty; the chat kit is
  separate work. Holding five finished packages for it was considered and rejected.
- **`chart-1` … `chart-5` are names with placeholder values** — every built-in theme
  sets all five to the same magenta, and `theme.chartPalette === 'placeholder'` says
  so in the data. This is not an oversight. Five categorical colours that stay
  distinguishable across ten themes and survive colourblindness is real design work,
  and it is pending. *Five identical magentas make a chart obviously wrong; five
  plausible colours would make it quietly unreviewed.*
- **`kit-dashboard` speaks the contract vocabulary but still carries its own theme
  values** — 434 lines across four palettes. It works, and it is the next task rather
  than this one.
- **The 88 derived colour values** exported as `DERIVED_TOKEN_VALUES` have not been
  through design review. The list is exported precisely so that stays visible.

### Fixed on the way out the door

Four defects that broke nothing in this repo and would each have broken a consumer.
They are listed because every one of them is the same shape — *a failure that looks
like success* — and that shape is worth recognising.

- **Components shipped without a way to be styled.** No package documented `@source`
  and none shipped one. The repo's own demo had the identical bug, so the one place
  it would have shown up was broken in the same way. Fixed by shipping `source.css`
  from every package that has class strings. Measured in a scratch consumer built
  from the published tarballs: **11 of 19 probed utilities existed only because of
  that import**, and the compiled stylesheet went from 28,924 to 94,518 bytes.
- **`kit-dashboard/theme.css` could not be imported at all.** It pulled in
  `shadcn/tailwind.css` while `shadcn` was a devDependency — correctly so, it is a
  5.9 MB CLI — so a consumer following the README got `Can't resolve
  'shadcn/tailwind.css'`. The import is gone. Of its 629 lines this repo used two
  custom variants and one utility; `design-components` now ships those three itself.
- **Two of those variants were load-bearing and nearly lost.** `data-horizontal:` and
  `data-vertical:` have no Tailwind equivalent — Tailwind's bare `data-x:` compiles to
  `[data-x]`, and Base UI sets `data-orientation="horizontal"`. Dropping the shadcn
  import alone silently retargeted 23 selectors at an attribute that is never present.
  Caught by diffing the compiled stylesheet rather than by reasoning about it.
- **Three of `kit-dashboard`'s shipped type declarations pointed outside the
  package** — `import { ColumnDef } from '../../../design-components/src/index.ts'`,
  a path a consumer does not have, naming a directory that is not published, with a
  `.ts` extension `tsc` rejects. `DataTable`, `DataTableRow` and `OperationsTablePage`
  were affected; the emitted JavaScript was always correct, so this broke types only.
  `tsc` had been reporting it 65 times as `TS6059` while the build exited 0.

### Verified before release

Every package packed with `npm pack` and installed from the tarballs into a scratch
app carrying only React, `react-dom`, `@base-ui/react` and `lucide-react`, then
compiled with a real Tailwind v4 build and **rendered in Chromium**:

- Eleven components on screen, zero console errors, both consumer paths.
- Seven colour probes read back from `getComputedStyle` and compared against the
  contract's own exported values — `fg` `#f4f4f5`, `fg-faint` `#52525b`, `primary`
  `#6e8aa8`, `surface` `#27272a`, `bg-elevated` `#18181b`, `bg` `#0e0e10` — **7 of 7
  exact.**
- The four added type steps measured 9 / 10 / 11 / 13 px, `rounded-panel` 10px,
  `rounded-control` 6px.
- Zero nested `node_modules` in any tarball, so no dependency is bundled — which
  matters most for `sonner`, whose toast queue is module state.
