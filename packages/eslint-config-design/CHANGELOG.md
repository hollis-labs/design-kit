# @hollis-labs/eslint-config-design

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
