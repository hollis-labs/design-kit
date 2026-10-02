# AI Elements upstream versions

Append a row when adopting a new pin; do not erase prior revisions. File inventories
record source actually taken, not planned work or documentation-only research.

| Adopted | CLI version | Upstream commit | Source date | Status |
|---|---|---|---|---|
| 2026-10-02 | ai-elements 1.9.0 | `6a9d5b1822ffb10bba4bd97175f01edd7d8651cd` | 2026-08-21 | Initial pin; shadcn primitives ported to Base UI |

Read-only source checkout: `~/.cache/ai-elements-shared/upstream`.
Upstream: https://github.com/vercel/ai-elements.

## design-components inventory

Source paths below are MIT shadcn/ui copied through the AI Elements pin above:

| Local source | Upstream source at pin | Vendored | Divergences |
|---|---|---|---|
| `src/components/ui/button-group.tsx` | `packages/shadcn-ui/components/ui/button-group.tsx` | 2026-10-02 | Radix Slot to Base UI useRender; local cn/Separator; token radius; explicit orientation |
| `src/components/ui/collapsible.tsx` | `packages/shadcn-ui/components/ui/collapsible.tsx` | 2026-10-02 | Radix to Base UI; Content wraps Panel; Base UI callback/render props |


Other packages keep their own inventory and package-local licence using
[the vendoring convention](vendoring.md).
