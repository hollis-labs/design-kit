# @hollis-labs/eslint-config-design

## Unreleased (CW-20261001-0499)

**Baseline/ratchet mode.** Existing codebases can now adopt the gate without a
big-bang fix. Record the current violation counts as `.eslint-design-baseline.json`,
and CI fails only when new violations are **added** — not on the existing backlog.

- `src/ratchet.js` — core logic: `countByRule`, `buildBaseline`, `parseBaseline`,
  `compare`, `formatReport`, `DESIGN_RULES`. Importable as `@hollis-labs/eslint-config-design/ratchet`.
- `scripts/ratchet.mjs` — standalone CLI. Supports `--update`, `--no-config`
  (cross-repo), `--json`, `--quiet`, `--colors`, and `--baseline <file>`.
- `docs/ratchet.md` — full adopter guide: quick start, CI workflow, fixing
  violations, accepting debt, phasing out, and the Biome cross-reference
  (CW-20260913-0031).
- `package.json`: exports `./ratchet`; `scripts` ships with the package; `ratchet`
  and `ratchet:update` convenience scripts added.

Verified read-only against Tangent's source (`apps/tangent/ui/src`): 123 hex,
1273 raw-palette, 166 arbitrary-scale, 0 undefined-token, recorded and re-checked
in pass mode (exit 0). No Tangent files written or PRs opened.

## 0.1.0 — 2026-09-11

First release, alongside the five other packages in this repo. The set shares a
version number; the release record for all of it is the repo's
[`CHANGELOG.md`](https://github.com/hollis-labs/design-kit/blob/main/CHANGELOG.md).

**The gate.** Six rules enforcing that a component may name a token, never a value —
`no-color-literal`, `no-raw-palette-utility`, `no-arbitrary-scale`,
`no-undefined-token`, `no-idiom-shadowing-contract`, `require-disable-reason`.

`no-undefined-token` is the one that earns the package. Four invented token names
were live in production across two separately-reviewed codebases at 16 use sites,
every one rendering no colour at all. A hex literal at least renders something.

The vocabulary is **injected, never hardcoded** — a copy of the token names here
would be a third list that drifts invisibly. `@hollis-labs/design-tokens` is the
default source and is declared as a `peerDependency`, so npm installs it for you and
the first lint run works.

Adopt it at `severity: 'warn'` first and read the counts before flipping to `error`;
the README has the full sequence.
