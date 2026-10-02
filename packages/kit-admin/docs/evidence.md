# kit-admin fixture evidence — CW-20261001-0512

Built against release main `bbd7ce5` (including radius correction `78199fd`).
This is local composition proof using authored example manifests and explicit
fixture snapshots. It is not a live adapter, packed external-consumer, publishing
or two-real-app proof. Approved spec text/examples are unchanged.

## Browser capture

Production Vite demo imports kit-admin's built output; its siblings resolve to
workspace builds. Chromium headless, reduced motion, viewport height 900,
`data-theme="sysop-p4-white"`, dashboard theme CSS plus all three composition
source stylesheets. The manual [capture tool](capture.mjs) generated
[computed styles and state evidence](evidence/computed-styles.json): 24 page/app
states plus eight setup/failure states; 32 initial images and seven bottom-scroll
images. No new count/source-agreement gate was introduced.

| Fixture | Dashboard 1280 / 390 | Settings 1280 / 390 | Status 1280 / 390 | Diagnostics 1280 / 390 |
| --- | --- | --- | --- | --- |
| Approved Nanite example | [wide](evidence/nanite-dashboard-1280.png) / [narrow](evidence/nanite-dashboard-390.png) | [wide](evidence/nanite-settings-1280.png) / [narrow](evidence/nanite-settings-390.png) | [wide](evidence/nanite-status-1280.png) / [narrow](evidence/nanite-status-390.png) | [wide](evidence/nanite-diagnostics-1280.png) / [narrow](evidence/nanite-diagnostics-390.png) |
| Approved Tachyon example | [wide](evidence/tachyon-dashboard-1280.png) / [narrow](evidence/tachyon-dashboard-390.png) | [wide](evidence/tachyon-settings-1280.png) / [narrow](evidence/tachyon-settings-390.png) | [wide](evidence/tachyon-status-1280.png) / [narrow](evidence/tachyon-status-390.png) | [wide](evidence/tachyon-diagnostics-1280.png) / [narrow](evidence/tachyon-diagnostics-390.png) |
| Tether mixed split | [wide](evidence/tether-dashboard-1280.png) / [narrow](evidence/tether-dashboard-390.png) | [wide](evidence/tether-settings-1280.png) / [narrow](evidence/tether-settings-390.png) | [wide](evidence/tether-status-1280.png) / [narrow](evidence/tether-status-390.png) | [wide](evidence/tether-diagnostics-1280.png) / [narrow](evidence/tether-diagnostics-390.png) |

All 24 page/app states have zero browser page errors and document width equal to
the viewport. Navigation icons remain visible; their accessible labels and active
state come from NavRail. Form text computes to 13px, controls declaring the
control token to 6px, settings panels to 10px. Native checkbox radius remains
0px. Token variables compute from `.375rem` / `.625rem` with the theme's 16px
root. Background/foreground values, individual controls and scroll sizes are
recorded in the JSON rather than inferred from class names.

Settings and Diagnostics have one page scroll owner supplied by ListPageLayout;
the sample table's bounded region is a separate component detail. Bottom images
show successful scrolling: Nanite Settings [1280](evidence/nanite-settings-1280-bottom.png)/[390](evidence/nanite-settings-390-bottom.png),
Nanite Diagnostics [1280](evidence/nanite-diagnostics-1280-bottom.png)/[390](evidence/nanite-diagnostics-390-bottom.png),
Tachyon Settings [1280](evidence/tachyon-settings-1280-bottom.png)/[390](evidence/tachyon-settings-390-bottom.png),
and Tether Settings [390](evidence/tether-settings-390-bottom.png).
Nanite's truncated series intentionally reports incomplete evidence, with true
zero and null-gap samples preserved; it does not imply continuous history.

| Extra state | Wide / narrow | Evidence |
| --- | --- | --- |
| Setup alternate mode | [1280](evidence/nanite-setup-1280.png) / [390](evidence/nanite-setup-390.png) | One Wizard replacing the provenance editor, shared host drafts and canonical group links. |
| Rediscovery failure | [1280](evidence/nanite-refresh-1280.png) / [390](evidence/nanite-refresh-390.png) | Retained declaration warning; every input matches `:disabled`. |
| Group read failure | [1280](evidence/nanite-group-1280.png) / [390](evidence/nanite-group-390.png) | Retained failed-group snapshot disabled; sibling group navigation remains. |
| Initial discovery failure | [1280](evidence/nanite-first-1280.png) / [390](evidence/nanite-first-390.png) | Global unavailable, no settings inputs. |

Tether fixture desired shutdown timeout and env-locked configured socket path
appear only in Settings, with pending restart/source provenance. Measured uptime
and daemon reachability appear only in Status. Observed socket/PID diagnostics
appear only in Diagnostics. Lifecycle commands and richer scoped/provider editors
are not modelled or inferred.

Reproduce with the package build and `demo:build`, then serve using
`npm exec --workspace=@hollis-labs/kit-admin -- vite preview --config demo/vite.config.ts --host 127.0.0.1 --port 5205 --strictPort`.
Run `node packages/kit-admin/docs/capture.mjs` with `PLAYWRIGHT_MODULE` pointing to
an installed Playwright module, and optionally `CHROMIUM_PATH` / `DEMO_URL`.
On this host Chromium needs the cached runtime libraries in `LD_LIBRARY_PATH`.
These are manual review tools, not new repository checks.

## Settings-only chart isolation

The separately built `settings-only.html` imports only kit-admin root. Its
[reachable module inventory](evidence/settings-only-bundle.json) was derived
from Vite's emitted manifest and per-chunk module inventory, following static
imports from that entry. The two reachable chunks contain **zero** Recharts,
kit-admin `/charts`, kit-observe sample-series or dashboard timestamp-chart
implementation modules. The normal demo opts into `/charts`. This proves this
build's JS graph isolation, not absence of a declared dashboard dependency or
published-registry compatibility. No wire types/sibling APIs are re-exported.

## Behavioral gate

33 kit-admin tests exercise missing arrays, contradictory sections, empty/deep
links, all-empty declarations, incompatible versions, first/refresh/group read
failure, context isolation, unsupported groups, controlled navigation/intents,
default omission of apply, alternate Wizard plan, unavailable observations,
explicit series delegation, Tether placement and preserved field focus under
host draft updates. A failed group cannot call draft/write callbacks even if an
event is delivered programmatically. Exact command: `npm run test:run
--workspace=@hollis-labs/kit-admin`.
