# Theme migration: canonical palette layer (CW-20260911-0071, split c)

**Approved under CW-20261001-0526, option A only:** adopt canonical legacy
palettes and preserve modern themes by restoring the six shadcn mappings.

The [value-by-value comparison](legacy-contract-comparison.md) was committed and
posted to Torque/lead before changing the palette (624d040). Its JSON contains
actual Chromium measurements from the compiled stylesheet. No canonical palette
values were redesigned in this PR.

The mixed-package gallery renders design-components, kit-dashboard and kit-chat.
The supplementary fixture renders the built SettingsNotice, SettingsStatusPill
and all workflow badges against production-built CSS. Both have 24 before/after
states: ten built-in themes in both modes plus four supported legacy dark IDs.
Motion/transitions/caret are frozen. No gallery page errors. The gallery uses
Vite development CSS, matching the committed BEFORE captures; settings and alias
checks use production CSS. Chromium's default hide-scrollbars flag is disabled.
Production precomputation of color mixes can introduce tiny rounding differences,
so gallery pixel comparisons use the same build mode on both sides.

Visible differences to judge:
- Legacy aliases adopt canonical borders, faint text, overlays and workflow colors.
  Neutral backlog/archived, warning queued/paused/inbox, brand review, success
  done/indexed and info doing/routed now follow the contract mappings.
- Six shadcn mappings retain input border, muted/secondary/accent surfaces,
  muted foreground and accent foreground exactly as in baseline 3122c45.
- SettingsNotice info changes from indexed/success to base info. Danger names base
  danger; warning was already base warning. Pending/current pills stay workflow.
- Modern gallery preservation is measured by decoded PNG pixels, rather than
  only sampled text styles: **20/20 modern states are pixel-identical to BEFORE**
  (zero changed pixels in each 1440×1200 PNG). See the
  [pixel comparison](modern-pixel-comparison.json). The four legacy states retain
  the approved palette changes.


The kit default without data-theme remains P4 White. Legacy IDs now support light
mode too, through the same generator mode selectors as canonical IDs. Storage
keys and helper ID values are unchanged. Compact before/after JSON records the
sampled vars and text styles; settings JSON records fixture colors.

| Appearance | Gallery before | Gallery after | Settings before | Settings after |
| --- | --- | --- | --- | --- |
| dir-a-dark | [Before](dir-a-dark-before.png) | [After](dir-a-dark-after.png) | [Settings before](settings/dir-a-dark-before.png) | [Settings after](settings/dir-a-dark-after.png) |
| dir-a-light | [Before](dir-a-light-before.png) | [After](dir-a-light-after.png) | [Settings before](settings/dir-a-light-before.png) | [Settings after](settings/dir-a-light-after.png) |
| dir-b-dark | [Before](dir-b-dark-before.png) | [After](dir-b-dark-after.png) | [Settings before](settings/dir-b-dark-before.png) | [Settings after](settings/dir-b-dark-after.png) |
| dir-b-light | [Before](dir-b-light-before.png) | [After](dir-b-light-after.png) | [Settings before](settings/dir-b-light-before.png) | [Settings after](settings/dir-b-light-after.png) |
| dir-d-dark | [Before](dir-d-dark-before.png) | [After](dir-d-dark-after.png) | [Settings before](settings/dir-d-dark-before.png) | [Settings after](settings/dir-d-dark-after.png) |
| dir-d-light | [Before](dir-d-light-before.png) | [After](dir-d-light-after.png) | [Settings before](settings/dir-d-light-before.png) | [Settings after](settings/dir-d-light-after.png) |
| dir-e-dark | [Before](dir-e-dark-before.png) | [After](dir-e-dark-after.png) | [Settings before](settings/dir-e-dark-before.png) | [Settings after](settings/dir-e-dark-after.png) |
| dir-e-light | [Before](dir-e-light-before.png) | [After](dir-e-light-after.png) | [Settings before](settings/dir-e-light-before.png) | [Settings after](settings/dir-e-light-after.png) |
| dir-f-dark | [Before](dir-f-dark-before.png) | [After](dir-f-dark-after.png) | [Settings before](settings/dir-f-dark-before.png) | [Settings after](settings/dir-f-dark-after.png) |
| dir-f-light | [Before](dir-f-light-before.png) | [After](dir-f-light-after.png) | [Settings before](settings/dir-f-light-before.png) | [Settings after](settings/dir-f-light-after.png) |
| hi-contrast-dark | [Before](hi-contrast-dark-before.png) | [After](hi-contrast-dark-after.png) | [Settings before](settings/hi-contrast-dark-before.png) | [Settings after](settings/hi-contrast-dark-after.png) |
| nanite-default-dark | [Before](nanite-default-dark-before.png) | [After](nanite-default-dark-after.png) | [Settings before](settings/nanite-default-dark-before.png) | [Settings after](settings/nanite-default-dark-after.png) |
| nanite-default-light | [Before](nanite-default-light-before.png) | [After](nanite-default-light-after.png) | [Settings before](settings/nanite-default-light-before.png) | [Settings after](settings/nanite-default-light-after.png) |
| p1-green-phosphor-dark | [Before](p1-green-phosphor-dark-before.png) | [After](p1-green-phosphor-dark-after.png) | [Settings before](settings/p1-green-phosphor-dark-before.png) | [Settings after](settings/p1-green-phosphor-dark-after.png) |
| p3-amber-phosphor-dark | [Before](p3-amber-phosphor-dark-before.png) | [After](p3-amber-phosphor-dark-after.png) | [Settings before](settings/p3-amber-phosphor-dark-before.png) | [Settings after](settings/p3-amber-phosphor-dark-after.png) |
| p4-white-dark | [Before](p4-white-dark-before.png) | [After](p4-white-dark-after.png) | [Settings before](settings/p4-white-dark-before.png) | [Settings after](settings/p4-white-dark-after.png) |
| sysop-amber-phosphor-dark | [Before](sysop-amber-phosphor-dark-before.png) | [After](sysop-amber-phosphor-dark-after.png) | [Settings before](settings/sysop-amber-phosphor-dark-before.png) | [Settings after](settings/sysop-amber-phosphor-dark-after.png) |
| sysop-amber-phosphor-light | [Before](sysop-amber-phosphor-light-before.png) | [After](sysop-amber-phosphor-light-after.png) | [Settings before](settings/sysop-amber-phosphor-light-before.png) | [Settings after](settings/sysop-amber-phosphor-light-after.png) |
| sysop-green-phosphor-dark | [Before](sysop-green-phosphor-dark-before.png) | [After](sysop-green-phosphor-dark-after.png) | [Settings before](settings/sysop-green-phosphor-dark-before.png) | [Settings after](settings/sysop-green-phosphor-dark-after.png) |
| sysop-green-phosphor-light | [Before](sysop-green-phosphor-light-before.png) | [After](sysop-green-phosphor-light-after.png) | [Settings before](settings/sysop-green-phosphor-light-before.png) | [Settings after](settings/sysop-green-phosphor-light-after.png) |
| sysop-hi-contrast-dark | [Before](sysop-hi-contrast-dark-before.png) | [After](sysop-hi-contrast-dark-after.png) | [Settings before](settings/sysop-hi-contrast-dark-before.png) | [Settings after](settings/sysop-hi-contrast-dark-after.png) |
| sysop-hi-contrast-light | [Before](sysop-hi-contrast-light-before.png) | [After](sysop-hi-contrast-light-after.png) | [Settings before](settings/sysop-hi-contrast-light-before.png) | [Settings after](settings/sysop-hi-contrast-light-after.png) |
| sysop-p4-white-dark | [Before](sysop-p4-white-dark-before.png) | [After](sysop-p4-white-dark-after.png) | [Settings before](settings/sysop-p4-white-dark-before.png) | [Settings after](settings/sysop-p4-white-dark-after.png) |
| sysop-p4-white-light | [Before](sysop-p4-white-light-before.png) | [After](sysop-p4-white-light-after.png) | [Settings before](settings/sysop-p4-white-light-before.png) | [Settings after](settings/sysop-p4-white-light-after.png) |

One-off compiled-CSS behavior check: [alias receipt](alias-behavior.json) confirms
legacy/canonical equality for every base color in both modes, within nested
[data-theme] boundaries, and matching workflow label derivation. No mismatches.
No-attribute default background: dark #09090b, light #fafafa. This is proof
attached to the PR, not a new source-agreement test or gate.
