# @hollis-labs/design-components

## 0.3.0 — 2026-10-02

Co-released with kit-dashboard and kit-chat, alongside the first releases of kit-settings and
kit-observe. Requires `@hollis-labs/design-tokens` `^0.2.0` (unchanged).

**Behaviour change to know before upgrading: small controls are squarer.**

- Register contract radius tokens in `cn()`'s existing radius groups. Named
  `rounded-control`/`rounded-panel` now replace competing steps in argument order,
  including modified/corner utilities. Known steps and explicit token-variable
  overrides continue to work.
- **Visible rendering change:** ungrouped Button `xs`, `sm`, `icon-xs` and
  `icon-sm`, plus caller control overrides, change from accidental 8px (contract
  CSS) or 9px (dashboard theme) to the intended 6px. Existing panel-only surfaces
  and kit-settings' token-variable workaround are unchanged. This includes
  kit-observe retry/copy actions, kit-chat card actions and composer Send/Stop.
  Option A approved 2026-10-02; [computed evidence](https://github.com/hollis-labs/design-kit/blob/main/packages/design-components/docs/radius-aliases.md).
- No release here. Ship in the next design-components **minor**, with internal
  dependency ranges raised together. Kit-chat uses the shared `cn()` after #48.

## 0.2.0 — 2026-10-01

Co-released with design-tokens, design-app-runtime, eslint-config-design, kit-chat and
kit-dashboard. Requires `@hollis-labs/design-tokens` `^0.2.0`.

**Appearance controls (CW-20261001-0498).** New controlled `ModeToggle` and `ThemePicker`.
The host owns the preference and its persistence; pair them with `createThemeStore` /
`useTheme` from design-app-runtime, or any store of your own. `ThemePicker` is a native
select, so keyboard and screen-reader behaviour needs no provider.

**`OverlaySidebar` (CW-20261001-0501).** A controlled modal sidebar composed from `Sheet`,
with pinned host header and footer around a scrolling body. Focus containment, Escape and
backdrop dismissal come from Base UI; the host owns open state, navigation and content. It
holds no layout store and no viewport breakpoint. See
[source reconciliation](docs/overlay-sidebar.md).

**Visible change in dark mode.** The outline and destructive `Button` variants no longer
carry dark-only background and border overrides (`dark:bg-input/30`,
`dark:border-input`, `dark:hover:bg-input/50`, `dark:bg-destructive/20`,
`dark:hover:bg-destructive/30`); they follow the active mode's tokens instead. The
destructive focus ring keeps its dark override.

**Install requirement (CW-20260912-0097).** `tailwindcss: ^4.0.0` is now a **required** peer
for styled components. npm 7+ installs it when it is missing, and an incompatible
installed major (for example Tailwind 3) now fails peer resolution instead of installing
silently unstyled. The automatic install does not configure your CSS build: keep the
explicit app dependency and the stylesheet imports described in the README.

## 0.1.1 — 2026-10-01

**Fix: `cn()` no longer drops the contract's font-size tokens.** The published `0.1.0`
merged class names with plain `tailwind-merge`, which does not know `text-micro`,
`text-caption`, `text-label` or `text-control` are font sizes and files them with the
text *colours*. Merging one beside a colour class therefore silently removed one of the
two. Two visible results: a `size="sm"` primary `Button` rendered `text-control` and lost
`text-primary-foreground` (near-white on near-white, unreadable), and `Pill` lost its
`text-caption` / `text-label` and inherited the body size.

`cn()` now registers the font-size group from `@hollis-labs/design-tokens`'
`TEXT_TOKENS`, so it follows the contract instead of a hand-typed list. A colour and a
size now survive independently, in either order and under responsive variants, and an
explicit `className` override of either still wins. No API change, nothing to migrate.
Needs `@hollis-labs/design-tokens` `^0.1.0`, which is already a dependency, so no other
package has to be released with it.

Found by Tachyon's design-kit migration (CW-20261001-0521). Covered by a regression
suite that renders every `Button` variant at every size and every `Pill` tone, plus
`Input`, `Checkbox`, `PopoverTrigger` and `Callout`.

## 0.1.0 — 2026-09-11

First release, alongside the five other packages in this repo. The set shares a
version number; the release record for all of it is the repo's
[`CHANGELOG.md`](https://github.com/hollis-labs/design-kit/blob/main/CHANGELOG.md).

**The idiom-free base** — 23 shadcn primitives on Base UI plus 21 components, every
one naming tokens from `@hollis-labs/design-tokens` and never a value. Extracted from
`libs/sysop-ui` against one test: *would `kit-chat` take this unchanged?*

**Read the README's first section before installing.** One `@import` line stands
between a styled component and an unstyled one, and leaving it out produces no error.

Fixed here on the way to release, both silent, both found by building a consumer
rather than by reading the code:

- **`ui/sonner.tsx` had never been themed, in either tree.** It named
  `var(--popover)`, `var(--popover-foreground)` and `var(--border)`, none of which
  were ever declared, so sonner fell back to its own defaults and the toast simply
  rendered wrong. Repaired to name contract tokens through sonner's own theming
  surface.
- **`useCopy` threw synchronously outside a secure context**, escaping the click
  handler and aborting React's dispatch for that event, while its own doc comment
  promised failures were swallowed. Guarded, and the comment corrected.

This package also now ships the two `data-*` custom variants and the one utility its
class strings name (`data-horizontal`, `data-vertical`, `no-scrollbar`) inside
`source.css`. They used to arrive via `shadcn/tailwind.css` from a sibling package's
theme, which is why nothing failed inside this repo and everything would have failed
outside it.
