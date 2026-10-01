# @hollis-labs/design-components

## Unreleased (CW-20260912-0097)

- Declare `tailwindcss: ^4.0.0` as a required peer for styled components.
  npm 7+ auto-installs a missing peer; incompatible installed majors fail peer
  resolution. Document the explicit app dependency and CSS build integration,
  which an automatic peer install does not configure.

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
