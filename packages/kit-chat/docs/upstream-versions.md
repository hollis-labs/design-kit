# AI Elements upstream inventory

| Adopted | CLI | Upstream commit | Source date |
| --- | --- | --- | --- |
| 2026-10-02 | ai-elements 1.9.0 | `6a9d5b1822ffb10bba4bd97175f01edd7d8651cd` | 2026-08-21 |

| Local source | Upstream source | Divergences |
| --- | --- | --- |
| src/components/message.tsx | packages/elements/src/message.tsx | Actions and branching only; Base UI tooltips; native group; controlled branch; normalized children/count; no AI SDK or markdown deps; tokens |
| src/components/shimmer.tsx, src/styles/keyframes.css | packages/elements/src/shimmer.tsx | motion/react → opt-in CSS; no module cache; token colors/spacing; reduced motion |
| src/components/tool.tsx | packages/elements/src/tool.tsx | Base UI; own ToolState/name; JsonViewer/host content instead of CodeBlock; falsy output retained; tokens |
| src/components/confirmation.tsx | packages/elements/src/confirmation.tsx | Subordinate slots inside existing ConfirmationCard; no second card/actions; opaque host-selected IDs and host messages; no AI SDK |
| src/components/queue.tsx | packages/elements/src/queue.tsx | Base UI; native bounded scrolling list; actions visible for keyboard/touch; token geometry/colors |

The package-root LICENSE ships the original Hollis Labs MIT text and upstream
Vercel attribution/full Apache-2.0 text. The pin contains no upstream NOTICE.
Keep upstream names and per-file provenance; record future pins without erasing
history. Follow design-components/docs/vendoring.md when updating these ports.
