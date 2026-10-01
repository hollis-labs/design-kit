# @hollis-labs/kit-account

Controlled account surfaces for a single-user, local-first app. **Private 0.0.0;
not published.** This package owns presentation and user intent. The host owns
identity, drafts, validation, loading, errors, transport and per-app persistence.
It supplies no login, auth service, browser storage or manifest protocol.

CW-20261001-0511 / Tesseract `kit_account_scope` chose local-first, per-app
profile/preferences and deferred login until OAuth 2.1. Current 0515 direction
builds controlled components while PR14's manifest contract awaits approval.
The future adapter belongs outside these components.

## Styling and development

Use a workspace build or local packed candidate, paired with design-components
0.1.1 (its token-aware `cn` is required). A release decision is separate.
Tailwind CSS **v4** is a required peer; a peer install does not configure its build.

```css
@import "tailwindcss";
@import "@hollis-labs/design-tokens/design-tokens.css";
@import "@hollis-labs/design-components/source.css";
@import "@hollis-labs/kit-account/source.css";
```

The last two lines register shipped class strings for Tailwind's consumer build.
Without source registration, an import can resolve while the surface is unstyled.
Build sibling packages from the repo root first. Declarations reference package
names, while typecheck maps siblings to source. All dependencies/peers stay
external in the library bundle.

## Profile, preferences and identity

```tsx
import { AccountProfile, AccountPreferences, WhoamiBadge } from '@hollis-labs/kit-account'

<WhoamiBadge identity={{ state: 'identified', displayName: 'Local user',
  assurance: 'local', source: 'This app' }} />
<AccountProfile value={draft} onValueChange={setDraft} onSave={saveProfile}
  saving={saving} error={safeError} notice={saveNotice} />
<AccountPreferences onSave={savePreferences} saving={savingPreferences}>
  {hostRenderedControlledFields}
</AccountPreferences>
```

`AccountProfileValue` is `{ displayName, email }`, both strings; email is optional
in the UI and represented by an empty string. Edits report the new value without
owning a draft. Save emits the current value without trimming or inventing
success. Blank names, busy/read-only state and `canSave={false}` block save;
native browser validation also applies. The host handles rejected async work,
sets sanitized errors, and asserts success only after its operation completes.

`AccountPreferences` accepts host-rendered controlled fields, with no schema
renderer duplicated here. A future kit-settings renderer can occupy this slot.
Do not nest another form. Busy/read-only fieldsets disable native controls; custom
widgets must also honor the host's disabled/read-only state. The host's `onSave`
reads its own controlled preference values. Editable preferences belong in
Settings; runtime diagnostics do not go into these forms.

`WhoamiBadge` takes a discriminated identity state: loading, unknown, error, or
identified with local/verified assurance. **Profile names do not verify identity.**
Only a host with a verified identity source supplies `assurance: 'verified'`.
The badge makes no authentication, authorization or session-management decision.
Use it in an app-shell slot; it has no login action.

## Verification

Seven behavior tests cover controlled edits/save intents, busy/read-only/invalid
gates, host errors/success and identity assurance states. Packed Vite/Tailwind
browser checks at 1280/390px cover draft preservation after failure, successful
host save, preferences, disabled busy fields, unchanged whoami after profile edits,
zero horizontal overflow and the emitted **13px** Input token at both widths.
The executable fixture is [demo/profile.tsx](demo/profile.tsx), with
[browser harness](docs/profile-browser.mjs) and committed receipts/screenshots.

To reproduce, copy the fixture into an isolated React/Vite/Tailwind v4 consumer,
mount `AccountProfileFixture`, install the candidate kit/base tarballs and import
the four stylesheets above. Build outside scanned sources and serve on loopback.
Run the browser harness with `PLAYWRIGHT_MODULE` pointing to that consumer's
Playwright module, `CHROMIUM_PATH` to Chromium, and `FIXTURE_URL` to its server.
Its optional first argument is an output receipt path; `SCREENSHOT_PATH` records
the narrow screenshot. Use disk-backed `TMPDIR`/`GOTMPDIR` for all build/test work.

Local landing checks: build, typecheck, lint, test:run,
`node .github/scripts/design-rules-gate.mjs`. CI's separate lint gate also enrolls
kit-account. Both gate enrollments are maintainer-authorized one-line additions.

## Remaining phase 1 work

API token creation/revocation with one-time disclosure and provider-driven
connected accounts form the next component group in CW-20261001-0515. Manifest
bindings, a shared profile service, authentication/login, OAuth connector backend,
multi-user/grants and publishing remain outside this controlled UI package.
