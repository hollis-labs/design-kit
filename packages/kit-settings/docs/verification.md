# CW-20261001-0505 verification

Verified 2026-10-02 from the task worktree based on main `ca88a833b07986451dd0029e65e85f14d561adc3`. This is a private package/demo check, not a publication or packed-consumer gate.

| Check | Result |
| --- | --- |
| `npm run build` | PASS, all workspaces |
| `npm run typecheck` | PASS, all workspaces |
| `npm run test:run` | PASS, all workspaces; kit-settings 30 behavior tests |
| `npm run lint` | PASS, all workspaces |
| `node .github/scripts/design-rules-gate.mjs` | PASS, 0 violations, including kit-settings |
| `npm run demo:build -w @hollis-labs/kit-settings` | PASS |

After the computed-style check found a conflicting base control radius, the kit's Input/Button overrides changed to `rounded-(--radius-control)` and the demo and package were rebuilt. The final browser run measured 6px rather than the previous 8px. The raw text token is `.8125rem`; its computed value is 13px. Final package typecheck also passed after review cleanup.

[Browser receipt](browser-receipt.json), produced by [browser.mjs](browser.mjs) against the production demo with Chromium 153.0.8010.12:

| Measurement | 1280px | 390px |
| --- | --- | --- |
| Input / select / button font | 13px | 13px |
| Input+button radius / panel radius | 6px / 10px | 6px / 10px |
| Viewport / document width | 1280 / 1280 | 390 / 390 |
| Page errors | none | none |

At both widths, actual keyboard Space toggled the boolean, Tab reached the native select, ArrowDown changed its selection, and Enter activated save/reset. Local invalid input supplied `aria-invalid` and an associated error description. Rejected host saves retained the draft; successful saves and explicit override removals updated only through the host. Secret controls began blank and the host cleared a successful transient replacement.

The read-only negative check attempted a real fill (rejected by the disabled control), confirmed the value remained unchanged, found no mutation buttons, and dispatched a form-submit event: the host save count did not change. Unit tests additionally inject forged read-only drafts and revoked permissions and verify no input/save callbacks.

The recorded browser accessibility tree exposes named forms, labeled checkbox/select/text controls, required/invalid/disabled attributes, read-only reasons, status and alert text. This checks browser semantics and real keyboard operation, **not speech from an installed screen reader**.

## Re-run

Build the workspace and demo, then serve `packages/kit-settings/demo/dist` on loopback (for example Python's HTTP server on 18755). Run:

```sh
FIXTURE_URL=http://127.0.0.1:18755 \
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
CHROMIUM_PATH=/absolute/path/to/chromium \
node packages/kit-settings/docs/browser.mjs $HOME/.cache/design-kit-tmp/settings-browser-receipt.json
```

Playwright/Chromium are verification tools, not package dependencies. On this shared host all npm installs used empty user/global configs and all scratch work used `~/.cache/design-kit-tmp`. Raw gate/build/browser logs remain there under `CW-20261001-0505`.

Excluded: app dogfood (0508), provenance/restart UX (0506), transport/authorization/backend durability, live screen-reader speech, publication and packed-tarball verification. The host must implement those backend boundaries described in the package README.
