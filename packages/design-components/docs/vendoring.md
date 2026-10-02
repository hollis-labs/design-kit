# Vendoring AI Elements

Read the pinned source before porting it. AI Elements is copied as source, never
installed as a dependency. The current pin and file inventory live in
[the upstream log](upstream-versions.md). Keep upstream component and sub-component
names so later source diffs remain useful.

## Provenance header

Retain this format from the batch brief. Use the actual upstream path (including
`packages/shadcn-ui/components/ui/` for primitives), full commit URL and actual
vendoring date. List each substantive change under Divergences. Place the header
before imports or a `"use client"` directive; preserve any original file notices.

```tsx
/**
 * Vendored from AI Elements (Vercel, Apache-2.0).
 * Upstream: packages/elements/src/<name>.tsx
 * Source:   https://github.com/vercel/ai-elements/blob/6a9d5b1822ffb10bba4bd97175f01edd7d8651cd/packages/elements/src/<name>.tsx
 * Version:  ai-elements 1.9.0 @ 6a9d5b1 (2026-08-21); vendored 2026-10-02
 * Divergences: <one line each: Radix->Base UI, `ai` types removed, framer-motion->CSS, tokens, ...>
 */
```

This notice identifies modified files. It does not replace the upstream licence.

## Licence and attribution travel with each package

Each package that takes source must append the AI Elements section from this
package's [LICENSE](../LICENSE) to its own package-root `LICENSE`, retaining its
original licence first. That section identifies the third-party scope, preserves
upstream's copyright and licence notice verbatim, and includes the full Apache-2.0
text. npm includes the package-root `LICENSE` even with a `files` allowlist; verify
this with `npm pack --dry-run --json --ignore-scripts` after building the package.
A repository-only licence or a link alone is insufficient for a shipped tarball.
Consumers redistributing the port must retain these notices and the licence text.

The pinned checkout has no `NOTICE` file. At each upstream update check again:
if one appears, retain its relevant attribution verbatim in the package's
`LICENSE` third-party section as well. Preserve source-file copyright, patent,
trademark and attribution notices too. Do not substitute a newly written notice
for an upstream one. See [Apache-2.0 section 4](https://www.apache.org/licenses/LICENSE-2.0).
An independently sourced file needs its own verified licence and attribution;
being adjacent to AI Elements code does not establish its origin.

## Port checklist

1. Read the actual pinned source and its notices. Record its path and revision in
   the package's upstream log and add the header above to each copied file.
2. Add the package-local licence section before taking source. Inspect the built
   tarball manifest for `LICENSE`; retain any upstream `NOTICE` attribution.
3. Replace Radix with Base UI, `asChild` with `render`, and controllable-state
   helpers with local presentational state where needed. Verify available Base UI
   primitives and actual controlled/uncontrolled, keyboard and focus behavior.
4. Remove `ai` and `@ai-sdk/*` imports/types. Own the presentational prop types:
   props down, callbacks up; no stores or fetching.
5. Name tokens, never values, for colour and scale. Use the contract's typography
   and radius names (`rounded-panel`, `rounded-control`) and shared `cn()`.
6. Replace framer-motion with CSS. Global keyframes remain opt-in through the
   package's separate stylesheet; importing a component must not install them.
7. Put heavy optional peers behind opt-in subpaths, with documented Tailwind
   source registration. Libraries holding module state remain peers.
8. Keep upstream sub-component names; use shapes rather than wire-kind names.
   Reconcile existing components instead of adding redundant alternatives.
9. Add behavioral tests, a package demo entry, README line and unreleased CHANGELOG
   entry. Update the upstream log with local paths and concrete divergences.
10. Build packages first, then run root typecheck, lint, test:run, build and
    `node .github/scripts/design-rules-gate.mjs`; paste actual output in the PR.
    Include visual evidence in light/dark for affected themes and state what was
    not verified. New packages stay private at 0.0.0; core versions/ranges stay put.

## Updating a port

Diff old and new upstream source, inspect licence changes, then apply relevant
changes deliberately. Update the header, inventory and divergence notes together;
keep historical pin rows. Re-run behavior and visual verification for changed
behavior. No automatic upstream sync and no upstream runtime hotlinks.
