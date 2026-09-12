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
Without it the components render *mostly unstyled* and nothing errors.

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
