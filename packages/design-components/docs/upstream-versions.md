# AI Elements upstream versions

Append a row when adopting a new pin; do not erase prior revisions. File inventories
record source actually taken, not planned work or documentation-only research.

| Adopted | CLI version | Upstream commit | Source date | Status |
|---|---|---|---|---|
| 2026-10-02 | ai-elements 1.9.0 | `6a9d5b1822ffb10bba4bd97175f01edd7d8651cd` | 2026-08-21 | Initial pin; convention established, no component source taken yet |

Read-only source checkout: `~/.cache/ai-elements-shared/upstream`.
Upstream: https://github.com/vercel/ai-elements.

## design-components inventory

No files vendored yet. Each component PR adds a row below:

| Local source | Upstream source at pin | Vendored | Divergences |
|---|---|---|---|

Other packages keep their own inventory and package-local licence using
[the vendoring convention](vendoring.md).
