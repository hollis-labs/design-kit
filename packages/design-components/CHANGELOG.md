# @hollis-labs/design-components

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
