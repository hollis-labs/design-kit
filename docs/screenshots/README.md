# Theme review — CW-20261001-0498

These screenshots require Chrispian's visual sign-off. They record implementation
verification, not design approval. Every built-in theme is rendered in both modes
on the mixed design-components / kit-dashboard / kit-chat demo and in ops-chat.

The browser sets the OS preference opposite to the explicit selected mode. All
base color tokens must resolve; visible enabled text is measured against composed
ancestor backgrounds at 4.5:1 (3:1 for large text). Selected outline/destructive and
mode controls are also checked in hover/focus states. Reload persistence and
returning to a changing system preference are exercised after the matrix.
[Demo results](./contrast.json) and [ops-chat results](./ops-chat/contrast.json)
record the browser version, viewport, and any failures.

| Theme | Demo dark | Demo light | ops-chat dark | ops-chat light |
|---|---|---|---|---|
| Concrete & Signal | [dark](./nanite-default-dark.png) | [light](./nanite-default-light.png) | [dark](./ops-chat/nanite-default-dark.png) | [light](./ops-chat/nanite-default-light.png) |
| Graphite & Ink | [dark](./dir-a-dark.png) | [light](./dir-a-light.png) | [dark](./ops-chat/dir-a-dark.png) | [light](./ops-chat/dir-a-light.png) |
| Warm Stone & Steel | [dark](./dir-b-dark.png) | [light](./dir-b-light.png) | [dark](./ops-chat/dir-b-dark.png) | [light](./ops-chat/dir-b-light.png) |
| Synthwave | [dark](./dir-d-dark.png) | [light](./dir-d-light.png) | [dark](./ops-chat/dir-d-dark.png) | [light](./ops-chat/dir-d-light.png) |
| Hacker / Terminal | [dark](./dir-e-dark.png) | [light](./dir-e-light.png) | [dark](./ops-chat/dir-e-dark.png) | [light](./ops-chat/dir-e-light.png) |
| Flat / Mono | [dark](./dir-f-dark.png) | [light](./dir-f-light.png) | [dark](./ops-chat/dir-f-dark.png) | [light](./ops-chat/dir-f-light.png) |
| Sysop P4 White | [dark](./sysop-p4-white-dark.png) | [light](./sysop-p4-white-light.png) | [dark](./ops-chat/sysop-p4-white-dark.png) | [light](./ops-chat/sysop-p4-white-light.png) |
| Sysop Green | [dark](./sysop-green-phosphor-dark.png) | [light](./sysop-green-phosphor-light.png) | [dark](./ops-chat/sysop-green-phosphor-dark.png) | [light](./ops-chat/sysop-green-phosphor-light.png) |
| Sysop Amber | [dark](./sysop-amber-phosphor-dark.png) | [light](./sysop-amber-phosphor-light.png) | [dark](./ops-chat/sysop-amber-phosphor-dark.png) | [light](./ops-chat/sysop-amber-phosphor-light.png) |
| Sysop High Contrast | [dark](./sysop-hi-contrast-dark.png) | [light](./sysop-hi-contrast-light.png) | [dark](./ops-chat/sysop-hi-contrast-dark.png) | [light](./ops-chat/sysop-hi-contrast-light.png) |

## Legacy feedback pills

The existing dashboard palette ids lacked success/info values. The feedback
fill from CW-20261001-0522 preserves their existing status hues. The old class merger also removed the
caption size; that independent fix is CW-20261001-0521 (PR #18).

[Before: P4 legacy pill row](./pills-legacy-before.png) versus
[after: P4](./pills-p4-white-after.png), [green](./pills-p1-green-phosphor-after.png),
[amber](./pills-p3-amber-phosphor-after.png), and
[high contrast](./pills-hi-contrast-after.png).

## Reproduce

Build the workspace and demo, serve the demo on loopback port 5198, then run:

```sh
node packages/kit-dashboard/demo/scripts/theme-proof.mjs
```

The script requires Playwright (playwright-core is sufficient) and Chromium.
Install them in a separate scratch directory if desired; set `PLAYWRIGHT_MODULE`
to its `playwright-core/index.mjs`, and `CHROMIUM_PATH` to the browser binary.
`PROOF_URL` and `PROOF_OUTPUT` override the default demo URL and artifact folder.
Use the production demo build for final capture so Vite rebuilds cannot race it.

Ops-chat was tested in a disposable detached worktree at ff6affb, with packed
versions of this branch's tokens/components/runtime/chat installed and its production
build served on loopback. Its only source
adaptation was the documented AppearanceControls and pre-render initialization;
its stylesheet was unchanged. No app-specific colors or per-app palette overrides
were added. `typecheck`, `lint`, and `build` passed. Session/history responses were
intercepted with local fixtures; no real agents or backend writes were invoked.

The same script supports that worktree with `PROOF_APP=ops-chat`,
`PROOF_URL=http://127.0.0.1:5199`, and `PROOF_OUTPUT=docs/screenshots/ops-chat`.
It intercepts `/api/**` before navigating. These screenshots prove adoption of the
packed UI, not live Nanite transport. The temporary app edits are not shipped.

Limits: this is representative visual/contrast coverage, not a complete accessibility
audit or every popup state. Chart tokens remain explicit magenta placeholders.
The full legacy dashboard theme migration is CW-20260911-0071. Tachyon verification
is deferred to CW-20260918-0039; Tachyon was not read or changed by this task.
