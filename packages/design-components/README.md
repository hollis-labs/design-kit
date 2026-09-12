# @hollis-labs/design-components

Layer 4 of the Hollis Labs frontend layering: **the idiom-free base.** Styled
compositions of Base UI primitives that name tokens from
`@hollis-labs/design-tokens` and carry no idiom of their own.

> **The one rule: a component may name a token, never a value.**
> It covers **scale** as much as colour. `text-[13px]` names a value exactly as
> much as `#1a1b26` does.

---

## Install — and the line that is not optional

```bash
npm install @hollis-labs/design-components @hollis-labs/design-tokens
npm install @base-ui/react react react-dom lucide-react     # peers
```

```css
/* your app's stylesheet */
@import "tailwindcss";
@import "@hollis-labs/design-tokens/design-tokens.css";
@import "@hollis-labs/design-components/source.css";   /* ← THIS ONE */
```

**Leave out that third line and the components render, render mostly unstyled, and
nothing errors.**

Tailwind v4 emits a utility only for a class string it has *seen*, and it does not
scan `node_modules`. This package's class strings ship inside `dist`, so without
something pointing Tailwind at them, `text-fg-secondary`, `bg-surface`,
`text-fg-faint` and `text-primary` are simply never generated in your stylesheet.
There is no error to read, because the defect is in what your build did not produce
rather than in anything the code says. You get a Button with no colour and a Card
with no surface, and nothing to grep for.

`source.css` contains one `@source` directive pointing at this package's own `dist`.
It ships as an importable stylesheet rather than as a glob you write yourself
because **`@source` paths resolve relative to the CSS file that declares them** —
so the path is written once, here, against a layout this package controls, instead
of every consumer hand-writing
`@source "../node_modules/@hollis-labs/design-components/dist/**/*.js"` against a
layout that changes with hoisting, with the package manager, and inside a monorepo.
A wrong glob fails exactly as silently as a missing one.

Verified 2026-09-11 against `tailwindcss` 4.3.3: a package-shipped stylesheet's
`@source` resolves against its own location and emits the utilities.

### If you are using `@hollis-labs/kit-dashboard`

You need none of this. `@hollis-labs/kit-dashboard/theme.css` imports both its own
`source.css` and this one, and you cannot use that kit without its theme.

### How this was found, which is the reason to trust the line above

The repo's demo was this package's only consumer, and **the demo had the identical
bug** — its `@source` globs still pointed at `../src`, where these components no
longer live after the extraction. So the base components had been rendering
substantially unstyled in the one place anyone would have noticed. Adding the glob
took the demo's compiled stylesheet from 57 kB to 120 kB; that delta is the size of
what was missing. "It worked in the demo" was not evidence.

---

## Does this package ship compiled CSS? No — decided, not overlooked

There is a second possible answer to the problem above: ship a prebuilt stylesheet
containing every utility these components use, so styling does not depend on your
Tailwind configuration at all. **Rejected, by CW-20260910-0131, for two reasons.**

**It would fight your own build rather than replace it.** Any consumer who has
Tailwind — which is all of them today — would get both the prebuilt sheet and their
own build's output for the same class names. Duplicate declarations whose winner
depends on `@import` order is a worse failure than the one it fixes, because it is
intermittent and looks like a specificity bug.

**And it cannot tree-shake.** A prebuilt sheet carries the utilities for every
component in the package whether you import one or forty. The `@source` route emits
exactly the utilities your app actually renders, which is the property that makes
`preserveModules` in the build worth having in the first place.

The population a prebuilt sheet would serve — a consumer with no Tailwind build — is
empty across this portfolio, which is Tailwind v4 end to end.

**The door stays open and costs nothing to keep open.** A prebuilt sheet is purely
additive: a new `./styles.css` subpath, no change to anything documented here. If a
non-Tailwind consumer ever turns up, that is a small task rather than a migration.

---

## What is in it

| | |
|---|---|
| shadcn primitives (`ui/`) | 23 files — table, button, badge, card, checkbox, input, textarea, label, dialog, alert-dialog, dropdown-menu, popover, command, input-group, scroll-area, select, separator, sheet, switch, tabs, tooltip, skeleton, sonner |
| Components | 21 — `Pill` · `LiveDot` · `Callout` · `CopyableId` · `CopyButton` · `ConfirmDialog` · `DetailDialog`/`DetailSection` · `FormDialog` · `JsonViewer` · `JsonModal`/`PayloadActions`/`PayloadSummary` · `MetaList` · `Metric` · `ProgressBar` · `AppShell` · `DetailPageLayout` · `OverflowMenu` · `CollapsibleSection` · `Combobox` · `EmptyState` · `SearchInput` · `TransferList` |
| Hooks | `useCopy` · `useArrowNav` |
| Contracts | `ColumnDef`/`SortState`/`alignClass`/`compareBy` · `Tone`/`TONE_CLASSES` · `IconComponent` · the row-activation protocol |

**The test every export passed: "would `kit-chat` take this unchanged?"** Anything
that answered no is dashboard idiom and lives in `@hollis-labs/kit-dashboard`. The
column *contract* is here; the `DataTable` that renders it is not.

## Peers, and why each one is a peer

| Peer | Why not a dependency |
|---|---|
| `@base-ui/react` | Two installed copies of a headless library means two portal roots and two context trees. The symptom is a Popover inside a Dialog misbehaving in a way nobody traces back to a manifest. |
| `react`, `react-dom` | The app owns these. |
| `lucide-react` | This package ships an icon **shape** (`IconComponent`), not an icon set, so you pick the library and its major version. |

`@hollis-labs/design-tokens` is a real `dependency`, not a peer: the token contract
is what these components are compiled against, and a component paired with the wrong
contract version names tokens that do not exist.

### The bundler externalises `dependencies` as well as peers, and that is load-bearing

`vite.config.ts` derives `external` from `package.json` rather than from a
hand-written list. This is not an optimisation. This package's first build inlined
`sonner` into `dist/`, and **`sonner` keeps its toast queue in module state** — so an
app calling `toast()` from its own installed copy would push onto a different queue
than the `<Toaster/>` rendered from the bundled one. The toast never appears, and
nothing in the stack points at a bundler config. `tailwind-merge` is the milder
version of the same thing: two configs, two caches, 80 kB paid twice.

Deriving the list from the manifest is what makes the two impossible to disagree. A
hand-kept list is a second place to remember, and its failure is silent.

---

## Subpaths

| Import | For |
|---|---|
| `@hollis-labs/design-components` | everything above |
| `@hollis-labs/design-components/source.css` | registers this package with your Tailwind build — see the top of this file |
| `@hollis-labs/design-components/keyframes.css` | opt-in, only if you use `<ProgressBar indeterminate>` |

`keyframes.css` is a separate import on purpose: a keyframe is a global name, and a
package should not install one into your document because you imported a Button.

## Toast

`notifySuccess` / `notifyError` need `<Toaster/>` mounted once, from this package's
`ui/sonner`. Its theming names contract tokens through sonner's own CSS-variable
surface (`var(--color-bg-elevated)`, `var(--color-fg)`, `var(--color-border)`,
`var(--radius-control)`) rather than through classNames — still the one rule, just
expressed in the only place sonner reads.

Worth knowing, because it is the kind of thing that stays broken for a year: in
`libs/sysop-ui` this component named `var(--popover)`, `var(--popover-foreground)`
and `var(--border)`, **none of which were ever declared** in either tree. An invalid
custom property makes the whole declaration invalid at computed-value time, so
sonner silently fell back to its own defaults. The toast rendered; it had simply
never been themed. Repaired here.

## Working on this package

```bash
npm run build       # tsc -p tsconfig.build.json && vite build
npm run typecheck
npm run test:run
npm run lint        # the design rules, enforced at zero
```

`prepack` runs the build, deliberately **not** `prepare` or `prepublishOnly`.
`prepare` runs during install, and npm does not order workspace installs by
dependency — which is what turned CI red once. `prepublishOnly` does not run for
`npm pack`, so a tarball could be cut with an **empty `dist/`** and nothing would
say so. `prepack` is the only hook that is right on both counts. Do not tidy it.

`vite-plugin-dts` emits declarations under `dist/src/` while `preserveModules`
flattens the JS to `dist/`, which is why `types` points at `./dist/src/index.d.ts`.
`rollupTypes: true` was tried in sysop-ui and produced an empty `export {}` bundle —
see `[[sysop_ui_build_quirks]]` before "fixing" it.
