# @hollis-labs/plugin-host-ui

Host-neutral provisioning extracted from Nanite's importmap and `_host` entry mechanism. Exports: `.` for the runtime, ordering and scoped layout stores; `./react` for selectors and render primitives; `./vite` for importmap provisioning; `./source.css` for Tailwind scanning. The package follows the plugin-host-ui design draft. It is private until a separately approved release.

## Host importmap

```ts
import { defineConfig } from 'vite'
import { designKitEntries, pluginHostImportmap } from '@hollis-labs/plugin-host-ui/vite'

export default defineConfig({
  base: '/admin/',
  plugins: [pluginHostImportmap({ entries: [
    { specifier: 'react', source: 'react', exports: ['createElement', 'useState', 'version'], defaultExport: true },
    { specifier: 'react-dom', source: 'react-dom', exports: ['createPortal', 'flushSync'] },
    { specifier: 'react-dom/client', source: 'react-dom/client', exports: ['createRoot', 'hydrateRoot'] },
    { specifier: 'react/jsx-runtime', source: 'react/jsx-runtime', exports: ['Fragment', 'jsx', 'jsxs'] },
    ...designKitEntries('@example/ui', {
      button: { source: '@hollis-labs/design-components', exports: ['Button'] },
    }),
  ] })],
})
```

Install the host's React, React DOM and design-kit packages in the host; this helper does not install or bundle a private runtime. Explicitly list **every export your plugins are allowed to import**, including any additional React APIs: the short example above is a small contract, not a full React export list. Missing named/default exports fail the production build. Duplicate specifiers are refused when configuring the plugin. Files may be absolute paths or `./` paths relative to the Vite root. Bare module names resolve from the host.

The helper adds runtime entry chunks with strict export signatures and injects an importmap before module scripts. Vite dev serves virtual re-export entries; production maps their emitted filenames. `/` and absolute subpath bases such as `/admin/` are supported. Main application imports and plugin imports resolve the same host modules within one realm. Plugin bundlers must externalize every mapped specifier (including `react/jsx-runtime`) instead of bundling another copy. A browser supporting native importmaps is required; no obsolete contract aliases or automatic `@nanite/ui` rewrite is installed.

Existing Rollup inputs are retained. The helper reserves input names `plugin-host-ui-N`. It leaves routing, API proxying and theme selection to the host. Apply it once per host build. A standalone buildable host at `examples/importmap-host` demonstrates provisioning without an app dependency:

```sh
cd <worktree>
npm ci
npm run build -w @hollis-labs/plugin-host-ui
npm run example:build -w @hollis-labs/plugin-host-ui
```

## Stylesheet ownership

The Vite helper provides a browser-only virtual module; Node/Vite dependencies do not enter its output:

```ts
import { createStylesheetLeases } from 'virtual:plugin-host-ui/stylesheets'

const leases = createStylesheetLeases(document)
const generation = { owner: 'notes', generation: 'accepted-generation-id' }
const release = leases.acquire(generation, '/plugins/notes/styles.css')
// During revoke/unload, before loading another generation:
leases.releaseOwner(generation)
release() // releases are idempotent
// On host disposal:
leases.dispose()
```

Each lease is owner/generation scoped; canonical absolute URLs share one link until the last lease releases. One manager belongs to one document/host scope; call its release hooks from the host lifecycle. The manager removes only nodes it created, never host/design-kit theme links. Pass only stylesheet URLs already admitted by the host's trust/CSP policy. HTTP(S) URLs are supported; this mechanism is not sandboxing or origin admission. Failed/unaccepted plugins must acquire no leases. Browser stylesheet loading failures are surfaced by normal link events; a lease is resource ownership, not a load-success receipt.

For TypeScript, declare the virtual module in the host's ambient types (the example includes a declaration). Its `StylesheetLeases` and `StylesheetOwner` types are type-only exports from `./vite`; browser code must import the implementation through the virtual module, not the Node build helper.

## Versions and isolation

`VersionAdmission<T>` carries host-declared version strings and a required `check(requirements, versions)` callback. `admitPluginVersions` delegates that decision and returns `{ accepted: true }` or `{ accepted: false, reason }`. `T` is a host normalization of the reviewed contract, **not a new registry/manifest wire schema**. CW-20261003-0037 owns runtime/design-kit requirement fields and enforcement. Invoke admission before executing/adopting a plugin or leasing its stylesheet. The helper itself does not check version ranges or bundle integrity.

An iframe has a different JavaScript realm and its own runtime singleton set/importmap. It cannot share the literal parent's React object. A typed capability bridge and the frame's import strategy belong to CW-20261002-0145; this helper implements neither isolation nor bridge authority.

## Design-kit tokens and CSS

Use the host's design-kit version and semantic tokens for foreground, surface, border, danger, spacing, type and radius. Import its documented token/theme CSS once in the host; never lease it as plugin CSS. Components may be mapped under any configured namespace using `designKitEntries`. CSS is not an executable importmap export: styles enter through the host stylesheet build or an admitted stylesheet lease. In a Tailwind v4 host, import the installed design package's documented `source.css` entry or declare its sources for scanning; import `@hollis-labs/plugin-host-ui/source.css` so its emitted class names are scanned. Plugin CSS must use scoped selectors and host token variables; do not override the global host theme. This helper does not copy a palette or change theme classes.

## Checks

From the design-kit repository root: `npm run typecheck -w @hollis-labs/plugin-host-ui` and `npm run test:run -w @hollis-labs/plugin-host-ui`. Tests exercise actual Vite dev HTTP responses, production emitted specifier/export resolution, subpath bases, singleton deduplication, missing exports, duplicate specifiers, stylesheet generation/disposal and the admission seam. Use design-kit's typecheck, build-before-test, test:run, lint and design-rule gates, then the package pack dry-run and example build. Root lockfile and blocking gate-list enrollment are maintainer-owned integration changes. The package follows the repository's per-package tag convention: plugin-host-ui-vX.Y.Z; publishing and tags require separate owner approval.

## Render host contract

The root entry has no React or DOM imports. Create one runtime with `createPluginHostRuntime(adapter)` and put `PluginHostProvider` from `./react` around its consumers. The provider retains the controller; additional selectors do not register panels again. Last-provider cleanup unsubscribes and releases only that scoped host panel projection. A later mount restores it, including React Strict Mode effect replay. `dispose()` fences this runtime permanently; it does not clear or dispose the host-owned registry. The host owns registry generation disposal and stylesheet leases.

The structural `PluginRegistryInstance<Input>` accepts a registry v2 instance (`registryVersion: 2` snapshots) with `sync`, `subscribe`, `snapshot`, `list`, and `get`. `get` uses the registry's owner/local qualified key. Adopted entries supply `hostInstance`, `value`, and `isActive()`. There is no registry npm dependency while its v2 release is pending. Supported registry version range: v2 only (`registryVersion: 2`). No npm semver range is admitted yet; compatibility with the released v2 package must be checked after release. Tests currently use a structural fake, not a released registry type assertion. Wire parsing, integrity/version admission, catalog schemas, kind opt-in, refusals, and revoke-before-load remain upstream registry/host responsibilities.

The adapter supplies:

- `scope`: app, environment, optional project, client; each runtime owns one immutable scope.
- `project(entry)`: validated declaration to region, label, icon name, props, priority and manifest order, or undefined to omit. Region names and kind selection are host-defined; no Nanite slot vocabulary is installed.
- `reserved(ref)`: host core-name protection. Each ref carries host epoch, owner, generation, kind and local key.
- `isolation`: stable external store of the app's effective `sandboxed-frame` or `main-origin` mode and setting revision. The package chooses no default. Host/app settings apply the default sandboxed-frame policy and development override. A missing/invalid app setting blocks rendering. Frame mode projects an unavailable renderer notice and registers no same-realm panels; a frame/bridge controller is separate work.
- `renderContext`: stable external store of host-owned render props. These overwrite declaration props; a session host can explicitly supply `session_id`. No global session/store/query-client dependency is assumed. Promises can feed `runtime.sync`; external stores supply synchronous snapshots.
- `panels.reconcile(scope, views)` and `releaseScope(scope)`: replace/release this scope's accepted, available panel projection, preserving other scopes and core panels.
- optional `icons.resolve(name)` and required `diagnostics(event)`: host icon mapping and code-only failure reporting. Components never display raw thrown exception text.

All observable stores need stable `getSnapshot()` objects until they change and an appropriate `getServerSnapshot()`. The runtime caches projected snapshots even though registry snapshots may be freshly allocated. Entries with unknown status, `declared_not_selected`, `refused`, or `unavailable` remain visible as metadata and never resolve or mount. `isCurrent(view)` checks epoch, owner/generation, kind/key, export identity, active lease, reserved names and isolation again immediately before rendering. Concurrent async sync completion after disposal cannot re-publish views.

## React API

`usePluginViews()` observes the projected set; `usePluginSlots(region, savedOrder?, policy?)` selects/arranges a host region; `usePluginPanels()` selects panel declarations; `usePluginDrawerTabs(region)` selects drawer tab declarations. Exported root constants `PANEL_KIND = "panel"`, `DRAWER_TAB_KIND = "drawer.tab"`, and `WIDGET_KIND = "widget"` are the registry v2 kind names; the runtime and hooks use these names. Hooks return inactive metadata too so hosts can show diagnostics; bodies mount only current accepted views. Catalogs and typed action dispatch are separate work.

`PluginPanelBody({ panel, fallback?, loading? })`, `PluginDrawerTabBody({ tab, ... })`, and `WidgetRenderer({ widget?, ... })` give each export its own error boundary and Suspense fallback. Owner/generation/epoch changes remount owned state. Unrelated revisions preserve healthy child state. Failed boundaries reset when the export value changes; `PluginRenderBoundary` is also exported for direct composition. Drawer IDs are `plugin:<encoded owner>:<encoded local key>`; selection IDs are durable `contributionId(ref)` tuples including kind, owner and local key. These two ID forms have different purposes.

`PluginReviewDialog` is controlled: title/description, rows with semantic `id`, label, description and added/removed/changed/unchanged state, optional `plugin: { id, version? }`, `currentBundle: { version?, digest? }` and `previousBundle: { version?, digest? }` display fields, busy/error, `onOpenChange`, and `onApprove`. Duplicate labels remain distinct rows. Busy disables close/cancel/approve; the host owns the async transaction, permission policy and bundle digest pinning. `onApprove()` receives no payload (including no click event); displayed bundle details do not replace host-owned digest pinning. Review UI does not grant capabilities.

## Ordering and persistence

`orderContributions(views, savedOrder?, policy?)` places known saved identities first, then priority (ascending by default, explicitly choose descending if desired), manifest order, and canonical identity. Default priority is 10. New entries are appended by that rule; unknown saved IDs never invent views. Core ordering and developer filtering are host inputs.

`createPluginLayoutStore(storage, scope, region, schemaVersion?)` uses an encoded tuple including all scope dimensions, region and schema version. Storage implements read/write/remove; browser localStorage is an optional host choice. Only order, visibility and selected identity persist, never props, session context, plugin configuration or secrets. `reconcile(available, retainMissing = true)` adds new identities while retaining preferences across temporary owner unload; choose false to prune missing identities. Hidden/missing selection falls back to the first available visible identity. Invalid data/storage failures fall back safely and report diagnostics. No legacy Nanite layout key is read or migrated.

## Minimal rendering example

`examples/render-host` uses ordinary external stores and promises, two host-named regions, and an owned panel/widget. Its registry is an illustrative fake, not a loader. It explicitly selects main-origin for development and offers owner unload. Run from the repository root after building design-components/tokens:

```sh
npm run example:render:build -w @hollis-labs/plugin-host-ui
```

The host imports design-tokens' theme/token CSS and design-components' documented styles once. In Tailwind v4, import this package's `source.css` alongside design-components' source integration. The package defines no palette and does not override the app theme. React, React DOM and Vite peers are optional at package level: install React/DOM for `./react`, Vite for `./vite`. This extraction changes no consumer app.
