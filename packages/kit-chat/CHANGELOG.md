# @hollis-labs/kit-chat

## Unreleased — OpenIn (CW-20261002-0049 PR B)

- Add host-supplied HTTP(S) destinations and decorative ReactNode icons on Base UI Menu.
- Reject unsupported/invalid hrefs as disabled non-link rows; explicit native activation opens a new tab with noopener noreferrer.
- No default providers, query construction, bundled brands, fetching or new dependencies.

## Unreleased — Image + InlineCitation (CW-20261002-0049 A)

- Image uses host-owned `src`, required `alt`, and optional `mediaType` metadata; no AI SDK/generated-file or base64 assumptions.
- InlineCitation retains the upstream composition names with a controlled local pager (index, previous/next, wraparound), exposed interactive HoverCard content and keyboard focus handoffs. No embla or new dependency. Needs the next design-components release (unreleased), which supplies HoverCard.

## Unreleased — model selector (CW-20261002-0045)

- Add ModelSelector Dialog/Command compositions with host-owned catalog, filtering and selection.
- Replace upstream brand-logo hotlinks with consumer ReactNode slots; bundle no marks or new dependencies.
- Keep titles/descriptions inside the real popup, with Command unit tests and Chromium dialog evidence.

## Unreleased — attachments (CW-20261002-0045)

- Host-controlled Attachments grid/inline/list, media previews, metadata and removal events; own presentation types.
- Local AttachmentDropzone/native picker reports File[] and per-file rejections; no stores, uploads, screenshots or composer trigger takeover.
- Upstream preview names backed by accessible Base UI Popover; existing published primitives only, no new dependencies.
- Pinned provenance, full existing Apache terms extended to these ports, tests, host demo and browser evidence.

## Unreleased

- Add AI Elements Tool with host-mapped ToolState and JsonViewer/host-rendered content,
  preserving falsy outputs; no AI SDK or code-renderer dependency (CW-20261002-0044 C).
- Reconcile Confirmation content slots under ConfirmationCard's sole envelope/responder;
  unchanged card props/locks/actions, opaque host-selected action IDs, host-supplied messages.
- Add presentational Queue slots with bounded native list scrolling, Base UI disclosure,
  and always-visible host action buttons for keyboard/touch.
- Needs the next design-components release (unreleased) for Collapsible; publish with
  the next coordinated core minor. No version/range/dependency/manifest changes.
- Add AI Elements Reasoning, ChainOfThought, Sources and Plan on the shared Base UI
  Collapsible; keep content, citations and plan actions host-owned (CW-20261002-0044 B).
- Fix upstream split disclosure roots in ChainOfThought so header/panel ARIA linkage
  is preserved. Reasoning elapsed seconds are host-supplied; no markdown deps in main.
- **Release prerequisite:** these components require the next, unreleased
  design-components core release. Published design-components 0.3.0 lacks Collapsible.
  Publish together in the next six-way core minor; no version/range changes here.

- Add AI Elements Message actions/branching without message-layout or AI SDK dependencies;
  controlled selection, wraparound navigation and preserved inactive drafts (CW-20261002-0044).
- Add Shimmer with token-colored, opt-in `keyframes.css`, a static fallback and reduced-motion support;
  replace upstream motion/react with CSS (CW-20261002-0044).
- Create kit-chat's MIT LICENSE and append AI Elements attribution/full Apache-2.0 text.
  This adds a LICENSE file to the published tarball; no version/range changes.


## 0.3.0 — 2026-10-02

Co-released with the other core packages, alongside the first releases of kit-settings and
kit-observe. Requires `@hollis-labs/design-components` and `@hollis-labs/design-tokens` `^0.3.0`.

- Internal refactor: use design-components' token-aware `cn()` throughout cards, composer,
  stream and markdown, retiring the local stopgap. Existing typography cases stay verbatim
  against the shared helper.
- **Visible change, through design-components 0.3.0:** the composer's Send and Stop buttons and
  the card action buttons (artifact, document, prompt, confirmation, list and table actions)
  render the 6px control radius instead of 8px. Nothing else in the package changes.

## 0.2.0 — 2026-10-01

Co-released with design-tokens, design-components, design-app-runtime, eslint-config-design
and kit-dashboard. Requires `@hollis-labs/design-components` and `@hollis-labs/design-tokens`
`^0.2.0`.

**Behaviour changes to know before upgrading**

- `ChatInput` now draws its own frame with a visible **Send** action and an optional
  host-owned **Stop** callback (`onStop`). A host that already supplies its own submit
  control should pass `showSubmitButton={false}`, or it will show two.
- The suggestion menu now shows its "no matches" state instead of closing silently.
- `tailwindcss: ^4.0.0` is now a **required** peer (CW-20260912-0097). npm 7+ installs it
  when it is missing, and an incompatible installed major fails peer resolution. The
  automatic install does not configure your CSS build; keep the explicit app dependency and
  the stylesheet imports described in the README.

**Typography fix (CW-20260913-0032).** Class names merge with the contract's named
typography tokens preserved beside text colours. Chromium verification of a registry
consumer found 0.1.0 message bubbles inheriting 16px because `text-control` was removed
beside `text-fg`; the packed candidate computes the 13px control token. The composer also
keeps its control size across the primitive's desktop breakpoint (previously 14px).

**Composer and transcript polish (CW-20261001-0502).** Protect IME composition and
Shift+Enter from submission or suggestion selection; keep textarea focus on pointer
selection; connect the suggestion ARIA references to cmdk's actual IDs; fix repeated
sent-message history recall. Bound the transcript width, preserve plain-string line breaks
and wrap long tokens. Add first-token and streaming feedback with reduced-motion loading
icons, plus initial loading and host-driven older-history loading/retry presentation.
Card envelopes stay within narrow transcript columns and wide tables scroll locally. The
"Jump to latest" control is hidden when the scroller marks it inactive; before, its inert
button still painted over short transcripts. See [ops-chat dogfood](docs/polish-dogfood.md).

**Windowed history (CW-20260930-0017).** New transport-free `useChatHistory` for bounded
latest/older windows, stable-ID dedupe, live upserts, single-flight loading, retry and
stale-request cancellation. Fixes prepend anchoring by moving the history controls outside
the message log; reader position and Jump-to-latest were verified in a packed
desktop/mobile consumer. See [adapter contract and browser proof](docs/message-history.md).

**New cards (CW-20261001-0501).** Reconciled Nanite/Flux card surfaces with the existing
eight primitive cards and added compact `ArtifactCard`, bounded `DocumentCard` and a
controlled text `PromptCard` on the existing Envelope. Host callbacks and slots keep
download, rendering, navigation, persistence and wire translation outside the kit. See
[inventory and usage](docs/nanite-card-reconciliation.md).

**Verification records.** The published-package source-registration negative control and the
ChatStream-only optional-peer check are in [consumer verification](docs/consumer-verification.md).

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
