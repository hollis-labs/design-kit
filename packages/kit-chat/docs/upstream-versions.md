# AI Elements upstream inventory

| Adopted | CLI | Upstream commit | Source date |
| --- | --- | --- | --- |
| 2026-10-02 | ai-elements 1.9.0 | `6a9d5b1822ffb10bba4bd97175f01edd7d8651cd` | 2026-08-21 |

| Local source | Upstream source | Divergences |
| --- | --- | --- |
| src/components/attachments.tsx, src/lib/attachment.ts | packages/elements/src/attachments.tsx | Own data; shared Button/cn; Base UI Popover instead of hover-only preview; visible removal; tokens |
| src/components/attachment-dropzone.tsx | packages/elements/src/prompt-input.tsx (attachment sections only) | Local picker/dropzone emits files/rejections; host list and URL lifetime; no stores/global listeners/screenshots/composer logic; extension matching; tokens |
| src/components/message.tsx | packages/elements/src/message.tsx | Actions and branching only; Base UI tooltips; native group; controlled branch; normalized children/count; no AI SDK or markdown deps; tokens |
| src/components/shimmer.tsx, src/styles/keyframes.css | packages/elements/src/shimmer.tsx | motion/react → opt-in CSS; no module cache; token colors/spacing; reduced motion |

The package-root LICENSE ships the original Hollis Labs MIT text and upstream
Vercel attribution/full Apache-2.0 text. The pin contains no upstream NOTICE.
Keep upstream names and per-file provenance; record future pins without erasing
history. Follow design-components/docs/vendoring.md when updating these ports.
