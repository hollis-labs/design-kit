# @hollis-labs/kit-chat

## Unreleased (CW-20260912-0097)

- Declare `tailwindcss: ^4.0.0` as a required peer for styled components.
  npm 7+ auto-installs a missing peer; incompatible installed majors fail peer
  resolution. Document the explicit app dependency and CSS build integration,
  which an automatic peer install does not configure.

## Unreleased

- Preserve named typography tokens beside foreground colors when merging class
  names. Registry-consumer Chromium verification found 0.1.0 message bubbles
  inheriting 16px because `text-control` was removed beside `text-fg`; the packed
  candidate computes the 13px control token. Keep the composer's control size
  across the primitive's desktop breakpoint as well (previously 14px).
- Record the published-package source registration negative control and
  ChatStream-only optional-peer check in [consumer verification](docs/consumer-verification.md).

## 0.1.0 — 2026-09-12

First release, joining the six already-published packages in this repo at 0.1.0.
The release record for the set is the repo's
[`CHANGELOG.md`](https://github.com/hollis-labs/design-kit/blob/main/CHANGELOG.md).

The chat kit contains `ChatInput`, `ChatStream`, and the interactive card set,
composing the idiom-free base components against the shared token contract.
The optional `/markdown` subpath adds Markdown rendering; consumers of the main
entrypoint do not need it.

**Start with the stylesheet imports in your app's Tailwind entrypoint:**

```css
@import "tailwindcss";
@import "@hollis-labs/design-tokens/design-tokens.css";
@import "@hollis-labs/design-components/source.css";
@import "@hollis-labs/kit-chat/source.css";
```

The last line imports this package's `src/styles/source.css`, registering its
shipped class strings with Tailwind. Leaving it out produces unstyled components
and no error. Both component packages' source imports are needed. See the README
for the additional setup required by the optional `/markdown` subpath.

**This release deliberately claims zero `chat-*` idiom tokens.** It publishes no
`chat-mode-*` or `chat-composer-*` vocabulary; future names await a consumer's need.
The accompanying design gate change makes the existing undefined-token rule
validate `chat` and `dash` names even though those families declare no tokens.
An invented `chat-*` name is now a gate error rather than a silent no-op.
