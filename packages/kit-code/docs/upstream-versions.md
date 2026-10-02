# Upstream versions

Ports follow the shared design-components vendoring convention.

| Component | Upstream source | Version | Vendored | Divergences |
|---|---|---|---|---|
| CodeBlock | packages/elements/src/code-block.tsx | ai-elements 1.9.0 @ 6a9d5b1822ffb10bba4bd97175f01edd7d8651cd (2026-08-21) | 2026-10-02 | Base UI primitives, plain root entry, host highlighter, contract vars, no global cache, copy lifecycle |
| Snippet | packages/elements/src/snippet.tsx | same pinned version | 2026-10-02 | Semantic group + shared Input/Button, contract tokens, read-only exact-source copying |

Both source ports are Vercel Apache-2.0; full terms are in LICENSE. The structural
highlight adapter and clipboard helper are original Hollis Labs MIT code.
