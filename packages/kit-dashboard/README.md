# @hollis-labs/kit-dashboard

**Kit Dashboard** — the dashboard idiom. A package of generic shell
components, shadcn/ui primitives, the `[data-theme]` palette, and data hooks,
extracted from the most-evolved app frontends (Torque's GUI and Fragments
Engine's Sysop).

Forked from `@hollis-labs/sysop-ui` 0.9.0 and **since rebased onto the extracted
packages**: the idiom-free primitives, the transport hooks and the token contract now
come from `@hollis-labs/design-components`, `@hollis-labs/design-app-runtime` and
`@hollis-labs/design-tokens`. What is left here is the dashboard idiom. A KIT is
layers 3 + 1 of the design-kit layering: which components exist and how pages lay out.

`sysop-ui` itself is untouched and still published at `0.9.0` for its existing
consumers. This is a fork, not a rename.

- React 19 · Vite 5 · Tailwind v4 · shadcn/ui (`base-nova` style)
- The `[data-theme]` + Tailwind `@theme` token system is **canonical** — the
  single styling lineage every Hollis Labs app converges to. The hand-rolled
  "HUD" CSS in older apps is retired in favour of it.

## Tailwind compatibility

Styled components require **Tailwind CSS v4**, declared as a required
`tailwindcss: ^4.0.0` peer. npm 7+ installs a missing required peer automatically;
npm 11's default resolver rejects an installed incompatible major. An automatic
peer install does not add Tailwind to your app's manifest or configure its CSS
build. Declare it explicitly and configure the matching Vite/PostCSS/CLI
integration:

```sh
npm install -D tailwindcss@^4.0.0
```

A successful install alone does not verify styling. Follow this package's usage
instructions for the CSS imports and source registration as well.

## What's in the kit

| Area | Exports |
| --- | --- |
| Theme | `theme.css` (4 palettes + tokens), `applyTheme`, `THEME_OPTIONS`, `ThemeSwitcher`, … |
| Shell | `NavRail`, `PageHeader`, `SummaryCards`, `EmptyState`, `DetailDialog`/`DetailSection` |
| Layout | `ListPageLayout`, `DetailPageLayout`, `DetailHeader`, `TabStrip`, `OperationsTablePage` preset, `CollapsibleSection` |
| Data table | `DataTable<T>` + `ColumnDef<T>` (sortable, windowed, selectable), `RowActionMenu` |
| Filters | `FilterBar` shell + `FilterSearchInput`, `FilterCycleToggle`, `FilterChipGroup`, `FilterEntityCombobox` |
| Idiom primitives | `StatusBadge`, `PriorityBadge`, `Metric` |
| Widgets | `TimeSeriesChart` (stacked bar/area, day-bucketed), `DonutChart`, `BarMeter`, `ActivityHeatmap` (calendar heatmap), `HourlyPulse` (last-24h strip), `RecentList` |
| Status vocabulary | `statusClass`, `statusLabel` and the Torque workflow states |

**Moved out, and where they went.** These used to be exported from here and are not
any more — take them from the package that owns them:

| You used to import | Now |
|---|---|
| `Button`, `Card`, `Dialog`, `Popover`, `Command`, … and the rest of shadcn `ui/` | `@hollis-labs/design-components` |
| `CopyableId`, `CopyButton`, `Pill`, `LiveDot`, `Callout`, `Combobox`, `MetaList`, `ProgressBar`, `JsonViewer`, `FormDialog`, `ConfirmDialog`, `EmptyState`, `SearchInput` | `@hollis-labs/design-components` |
| `useCopy`, `useArrowNav` | `@hollis-labs/design-components` |
| `usePoll`, `useSSE`, `useElapsed`, `createApiClient`, `createApiContext`, `normalizeKeys` | `@hollis-labs/design-app-runtime` |
| `createScopedStorage`, `createListCursor`, `listCursorNeighbors` | `@hollis-labs/design-app-runtime` |
| `formatDuration`, `formatRelativeTime`, `formatShortDate`, `formatCount` | `@hollis-labs/design-app-runtime` |
| `notifySuccess`, `notifyError` | `@hollis-labs/design-components` |

This package re-exports **none** of them, deliberately: taking the dashboard should
be a choice, not a side effect of wanting a Button. Depend on the package you
actually want.

App-specific domain code (fragment/route/task models, app dialogs) is **not**
in the kit — it stays in each app. The kit is the generic shell.

The dashboard widgets pull in **`recharts`** (a bundled dependency) — it backs
`TimeSeriesChart`'s stacked bar/area rendering. The other widgets
(`DonutChart`, `BarMeter`, `ActivityHeatmap`, `HourlyPulse`, `RecentList`) are
dependency-free hand-rolled SVG/markup.

## Import surfaces

The root entrypoint is intentionally narrow and mirrors `ui`:

```ts
import { Button, PageHeader, applyTheme } from '@hollis-labs/kit-dashboard'
```

Optional domains live behind explicit subpaths:

| Entry | Use for |
| --- | --- |
| `@hollis-labs/kit-dashboard/ui` | Theme helpers, shell chrome, idiom primitives |
| `@hollis-labs/kit-dashboard/layout` | Page skeletons such as `ListPageLayout`, `DetailPageLayout`, `TabStrip` |
| `@hollis-labs/kit-dashboard/data` | `DataTable`, `RowActionMenu`, filter-bar pieces |
| `@hollis-labs/kit-dashboard/widgets` | Lightweight SVG/markup widgets that do not use `recharts` |
| `@hollis-labs/kit-dashboard/charts` | `TimeSeriesChart` and any future charting components backed by `recharts` |

Recommended rule:

- treat the root entrypoint as `ui`
- import app transport/client plumbing from `@hollis-labs/design-app-runtime`
- import page layouts from `layout`
- import table/filter features from `data`
- import `charts` only inside pages that actually render charts
- import `widgets` explicitly for dashboard-only SVG widgets

## Consuming the kit

**Published at `0.1.0`.** `@hollis-labs/kit-dashboard` is a workspace package inside
`hollis-labs/design-kit`, released alongside the other five — see the repo's
[`CHANGELOG.md`](https://github.com/hollis-labs/design-kit/blob/main/CHANGELOG.md).

The version went **down** from `0.9.0`, on purpose: that number came from `sysop-ui`,
nothing has ever been published under this name, and carrying it would have claimed a
continuity that does not exist.

```bash
npm install @hollis-labs/kit-dashboard
npm install @base-ui/react react react-dom      # peers
```

### In this monorepo

It is an npm workspace, so it is already linked — depend on it by name and root
`npm install` wires it up. `npm install` at the root also builds `dist/` via this
package's `prepare` script.

### In an app outside the monorepo

Apps consuming the kit today still use the frozen `@hollis-labs/sysop-ui` 0.9.0.
Nothing has migrated onto `kit-dashboard` yet, and adoption is each project's own
work, on its own schedule. To try a working copy against an app without publishing:

```bash
# from the consuming app
npm install file:../../libs/design-kit/packages/kit-dashboard
```

Run `npm run build` in `packages/kit-dashboard` after changes (or `npm run build
-- --watch`) so the linked `dist/` stays fresh.

### Wire it up

```ts
// 1. Import the canonical theme once (e.g. in main.tsx)
import '@hollis-labs/kit-dashboard/theme.css'

// 2. Apply the persisted palette before first paint
import { applyTheme, getInitialTheme } from '@hollis-labs/kit-dashboard/ui'
applyTheme(getInitialTheme())
```

**That one import is also what makes the components have colour, and it is easy to
miss why.** Tailwind v4 emits a utility only for a class string it has *seen*, and it
does not scan `node_modules` — and this package's class strings, along with those of
`@hollis-labs/design-components`, ship inside `dist`. `theme.css` therefore imports
both packages' `source.css`, each of which points Tailwind at its own built output.
Without it styling fails silently. An app already using similar utilities may
look almost correct while package-only widgets break. See the
[adopter-path guide](https://github.com/hollis-labs/design-kit/blob/main/docs/adopter-path.md)
for the measured Tangent comparison, complete
custom value declarations and focused computed-style verification. Restart the
dev server after stylesheet import changes; verify a fresh production build.

If you supply your own theme values and never import ours, import the registration
directly instead:

```css
@import "@hollis-labs/kit-dashboard/source.css";
@import "@hollis-labs/design-components/source.css";
```

The kit's components name semantic Tailwind tokens (`bg-panel-2`, `text-text-subtle`,
`border-border-subtle`, `text-status-*`, …) that `theme.css` declares, so the
consuming app's Tailwind build must process it.

`theme.css` also locks the document shell — `html`, `body`, and `#root` are
pinned to the viewport with overflow disabled, so the fixed NavRail + PageHeader
chrome never scrolls. Apps mount into `#root` and let page regions scroll
internally; no per-app `index.css` reset is needed.

## Legacy theme preference compatibility

`readStoredTheme` / `persistTheme` delegate to design-tokens' theme-only helpers.
The kit still uses `sysop.theme`, defaults to `p4-white`, and accepts the same four
legacy IDs; its switcher and exported signatures are unchanged. Blocked storage
also falls back if accessing localStorage itself throws.

New theme+mode apps use `createThemeStore` from design-app-runtime with their own
JSON appearance key (see [appearance setup](../../docs/appearance.md)). When an
app migrates, read the legacy theme once, map it to the canonical ID and persist
it through the new store. Only then retire that app's legacy key. This library
step neither migrates nor deletes stored preferences; CSS/ID migration follows
in separate CW-20260911-0071 PRs.

## Priority and workflow tokens

Priority fills are **dashboard idiom**, not general feedback tints. P1 and P2 keep
the existing 22% Oklab mix of blocked/queued into the page background. A general
`danger-muted` or `warning-muted` replacement would change that treatment and can
be undefined in the legacy palettes. Components name the result; `color-mix()`
stays in the theme layer.

| Previous utility token | Canonical token | Disposition |
| --- | --- | --- |
| `priority-p1-bg` | `dash-priority-p1-bg` | Deprecated compatibility alias, still resolves to the same fill |
| `priority-p2-bg` | `dash-priority-p2-bg` | Deprecated compatibility alias, still resolves to the same fill |

`PriorityBadge` uses `bg-dash-priority-p1-bg` / `bg-dash-priority-p2-bg`.
The kit-owned `src/styles/idiom-tokens.json` manifest is exported as
`@hollis-labs/kit-dashboard/idiom-tokens.json`; it owns the vocabulary and
deprecation map, and the design gate checks its bindings against `theme.css`.
The gate enrolls these names only within this kit. Consumer apps explicitly
register the manifest with `designConfig({ idiomManifests })` or ratchet/Biome
`--idiom-manifest` (see eslint-config-design's README).
`DASHBOARD_DEPRECATED_TOKENS`, exported from the root and `/ui`, records these
migrations. The base contract's `DEPRECATED_TOKENS` intentionally maps base names
to base replacements; dashboard-specific retirements belong to this kit.

**Workflow utilities use the dashboard namespace.** `dash-status-*` carries the
lifecycle color and `dash-status-*-label` carries its derived readable label step.
Both families cover backlog, todo, queued, doing, review, done, blocked, paused,
archived, inbox, routed and indexed. Their CSS bindings and label mixes are
unchanged. For example, replace `bg-status-doing/10` with
`bg-dash-status-doing/10` and `text-status-doing-label` with
`text-dash-status-doing-label`. The old utility names remain CSS compatibility
aliases and are deprecated in the same kit-owned manifest; kit components and
examples use the canonical names. Unknown names in either family are checked by
the kit's existing design-rule registration.

Workflow colors describe lifecycle state, rather than general feedback severity.
The label family comes from moving component mixing into the theme layer. These
workflow names are separate from Nanite's retired health-triad names. The palette migration consumes canonical base values; the naming split preserved
colors before that migration. See the [24-state workflow proof](../../docs/screenshots/theme-migration/workflow/README.md).

Decision: CW-20260912-0046. Before/after screenshots and computed styles are in
[priority proof](../../docs/screenshots/priority-tokens/README.md).

## Visible scrollbars (opt-in)

The kit keeps scrollbars hidden by default. Add `show-scrollbar` to the element
that owns overflow when a region should show a themed bar:

```tsx
<div className="show-scrollbar h-64 overflow-auto" tabIndex={0} role="region" aria-label="Task history">
  {/* scrollable content */}
</div>
```

The thumb uses contract `fg-muted`, with `fg` for the WebKit hover state;
transparent track and thin sizing follow the browser. WebKit fallback dimensions
and radius use the spacing/radius tokens. Contract colors follow the active theme
and light/dark mode, including explicit `data-mode`; no extra light-mode class is
needed. `no-scrollbar` takes precedence if both classes are supplied. Both axes
still scroll when their bars are hidden.

The opt-in lives beside the dashboard's suppression policy. Nanite's
`chat-scroll` and `provider-scroll` merely repeat suppression and are not portable
kit vocabulary, so they are not exported. No app is changed. The theme gallery
includes an opt-in region; [24-state before/after proof](../../docs/screenshots/scrollbar-opt-in/README.md)
shows the deliberate visible-bar change (CW-20260912-0031).

## App structure

Default Sysop app shape:

- eager shell: nav, page header, providers, theme boot, route state
- lazy routes: each page loaded through `React.lazy(() => import('./pages/...'))`
- page-local feature code: charts, dialogs, tables, and heavy inspectors stay with the page that uses them
- shared shell imports: `ui` and `layout`
- transport/client imports: `@hollis-labs/design-app-runtime`
- optional heavy domains: `charts` only where needed

Minimal shell example:

```tsx
import { Suspense, lazy } from 'react'
import { NavRail, PageHeader } from '@hollis-labs/kit-dashboard/ui'

const OperationsPage = lazy(() =>
  import('./pages/operations').then((module) => ({ default: module.OperationsPage })),
)

export function AppShell() {
  return (
    <>
      <NavRail items={[]} />
      <PageHeader title="Operations" />
      <Suspense fallback={<div>Loading...</div>}>
        <OperationsPage />
      </Suspense>
    </>
  )
}
```

## Adding a page

A page is generic kit chrome + app-specific content:

```tsx
import {
  PageHeader, SummaryCards, EmptyState, StatusBadge,
} from '@hollis-labs/kit-dashboard/ui'
import { DataTable, type ColumnDef } from '@hollis-labs/kit-dashboard/data'

interface Widget { id: string; name: string; status: string }

const columns: ColumnDef<Widget>[] = [
  { key: 'name', header: 'Name', width: 'fill', cell: (w) => w.name,
    sortValue: (w) => w.name },
  { key: 'status', header: 'Status', cell: (w) => <StatusBadge status={w.status} /> },
]

export function WidgetsPage({ widgets }: { widgets: Widget[] }) {
  return (
    <>
      <PageHeader title="Widgets" />
      <SummaryCards cards={[{ label: 'Total', value: widgets.length }]} />
      {widgets.length === 0 ? (
        <EmptyState variant="empty" title="No widgets" description="Nothing here yet." />
      ) : (
        <DataTable items={widgets} columns={columns} getRowId={(w) => w.id} />
      )}
    </>
  )
}
```

### Page layouts are full-bleed — chrome divides, content blocks frame

Reach for a layout component instead of hand-assembling the skeleton:

- `OperationsTablePage` — the whole list/operations page (header + summary +
  filters + table) as one preset.
- `ListPageLayout` / `DetailPageLayout` — slot-based shells for bespoke pages.

These fill the viewport edge-to-edge. Their structure comes from the **pinned
region dividers** — `PageHeader`, `SummaryCards`, `FilterBar`, and `TabStrip`
each carry a bottom border — plus the `NavRail`'s edge. *That* is the frame.
Do **not** wrap a layout, or the `DataTable` inside it, in a bordered panel:
the scroll body and table sit flush, exactly as Torque's and Fragments
Engine's `/operations` routes do.

Borders belong to **content blocks** — a card, a callout, a grouped section
*inside* the scroll body. Those opt in via the `hud-panel` class
(`rounded-md border bg-panel`). Rule of thumb: page chrome *divides* with
bottom borders; content blocks *frame* with `hud-panel`.

For the API layer, build a concrete client on `createApiClient` and a typed
context with `createApiContext`:

```ts
import { createApiClient, createApiContext } from '@hollis-labs/design-app-runtime'

const http = createApiClient({ baseUrl: '' })
export const apiClient = {
  listWidgets: () => http.get<Widget[]>('/v1/widgets'),
}
export const { ApiProvider, useApi } = createApiContext(apiClient)
```

## Bundle inspection

Use route-level lazy imports first. If a Sysop app still has a large initial
chunk, inspect the app build rather than guessing:

```bash
npm run analyze
```

Questions to answer in the report:

- which modules are in the entry chunk
- which pages moved into route chunks after `React.lazy`
- whether `recharts` appears only in the page chunks that import `@hollis-labs/kit-dashboard/charts`

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run build` | Type-check + emit `dist/` (ES module + `.d.ts`) |
| `npm run demo` | Component gallery — every export, live theme switch (visual reference) |
| `npm run typecheck` | Type-check only |
| `npm run lint` | ESLint |
| `npm test` | Vitest (watch) |
| `npm run test:run` | Vitest (single run) |

## License

MIT — see [LICENSE](./LICENSE).

### Operations density and detail navigation

`OperationsTablePage` keeps Torque's compact two-row filter band and dense table
as its default. `density="comfortable"` increases row padding using the spacing
scale. `filterActions` holds density/refresh/view controls; `searchMatchCount`
generates the filter/match summary (an explicit `filterSummary` takes precedence).
`footer` pins result/selection controls below the scrolling body. `errorState`
renders request failures separately from `emptyState`; loading takes precedence.
All of these are optional additions to the existing props.

`onVisibleOrderChange` publishes the rendered ids after sorting and windowing.
Keep that order in app state when opening a detail view, then use the `/data`
hooks for bounded previous/next navigation:

```tsx
import { useListNavigation } from '@hollis-labs/kit-dashboard/data'

// The app decides which rows are errors and whether the detail view is active.
const navigation = useListNavigation({
  ids: orderedErrorIds,
  currentId: openErrorId,
  onNavigate: openError,
  enabled: detailOpen,
})
// Bind navigation.onPrev/onNext to buttons, disabling them when the
// corresponding previousId/nextId is undefined. ArrowLeft/ArrowRight use
// the same handlers. Boundaries do not wrap; a missing cursor does not jump.
```

`useArrowNav` accepts callbacks directly when the app owns its own cursor.
Both hooks preserve editing, modifiers, already-consumed events and arrow-key
widgets. A custom widget can opt out with `data-arrow-nav-ignore`. Enable only
one navigation owner at a time. Cursor persistence, error classification,
fetching further pages, and auto-advance after mutations remain app behavior.

The Operations demo exercises compact/comfortable rows, errors-only filtering,
and keyboard detail navigation. Torque's primary `BoardPage`, domain filter bar,
`TaskTable` and `use-arrow-nav` informed this composition; Cerberus's resource
attention filter informed the app-owned errors-only facet. Atlas Register and
Audit Board were not present as identifiable authored views in the available
checkouts, so this change makes no claim to reproduce those surfaces.

Visual check for CW-20261001-0500 (2026-10-01): `npm run demo`, Playwright
headless Chromium, 1440 × 900 and 640 × 900. Captures live in
[`docs/screenshots`](../../docs/screenshots): compact, comfortable, errors-only,
error detail navigation and narrow layout. Browser assertions exercised both
arrow directions through two blocked fixtures with no page errors. The fixture
classification is a demo policy, not a status model supplied by the kit.

A separate, disposable Tachyon worktree rendered the built `/layout` and `/data`
entrypoints with the kit's theme CSS and mocked API responses. Its screenshot is
`tachyon-operations-consumer.png`. The preview was temporary consumer wiring;
it is not a Tachyon migration or a check against a live backend.

## Canonical palettes and legacy IDs

The theme layer imports the design-tokens contract and built-in palettes; it no
longer authors a second base palette or reverse-maps dashboard values onto
`--hl-*`. Base utilities come directly from that contract. Six shadcn mappings
retain the dashboard's established control treatment: input uses border,
secondary/muted/accent use bg-elevated, muted foreground uses fg-faint, and accent
foreground uses fg. These mappings consume contract-backed compatibility roles,
so modern themes keep their appearance while legacy palettes adopt canonical values.
The remaining layer supplies dashboard workflow tones, label/priority mixes,
sidebar roles, and old utility compatibility aliases.

`src/styles/legacy-themes.json` maps `p4-white`, `p1-green-phosphor`,
`p3-amber-phosphor`, and `hi-contrast` to their `sysop-*` counterparts.
`npm run generate:themes -w @hollis-labs/kit-dashboard` reuses the exported
`emitThemeCss` generator with those legacy IDs; the committed `legacy-themes.css`
contains generated output, never hand-authored values. Regenerate it after a
design-tokens palette change and review the diff. The kit's no-attribute default
remains P4 White; both ID spellings support light/dark selectors and nested themes.
`sysop.theme`, `THEME_OPTIONS`, `applyTheme`, and their legacy ID values are kept.
New apps should choose canonical IDs through `createThemeStore` and ThemePicker.

Adopting canonical values visibly changes legacy borders, overlays, faint text,
and workflow colors. This is a migration to the reviewed contract, not a new
palette design. The [pre-migration value comparison](../../docs/screenshots/theme-migration/palette/legacy-contract-comparison.md)
and [before/after proofs](../../docs/screenshots/theme-migration/palette/README.md)
show the changes for visual review. `SettingsNotice` now uses base danger/info
feedback colors; `SettingsStatusPill` retains doing/done lifecycle tones.
