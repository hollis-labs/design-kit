# @hollis-labs/design-app-runtime

## 0.1.0 — 2026-09-11

First release, alongside the five other packages in this repo. The set shares a
version number; the release record for all of it is the repo's
[`CHANGELOG.md`](https://github.com/hollis-labs/design-kit/blob/main/CHANGELOG.md).

**App runtime with no opinion about appearance** — API client, polling and SSE hooks,
scoped storage, list cursors, formatters. Zero runtime dependencies, zero class
strings, and the design rules are enforced against it precisely so it stays that way.

Fixed during extraction: `createApiClient` used `window.location.origin` as a parsing
base and therefore **threw off-browser** — in a test environment or during SSR. The
`shell-reset.css` subpath carries only the document-shell lock; scrollbar suppression
and focus-ring taste were deliberately left to the kits.
