# kit-voice upstream log

Source taken from AI Elements, following [the vendoring convention](../../design-components/docs/vendoring.md).
Pin: ai-elements 1.9.0, upstream commit `6a9d5b1822ffb10bba4bd97175f01edd7d8651cd` (2026-08-21).
Read-only checkout: `~/.cache/ai-elements-shared/upstream`. No `NOTICE` file at the pin.

| Local source | Upstream source at pin | Vendored | Divergences |
|---|---|---|---|
| `src/mic-selector.tsx` | `packages/elements/src/mic-selector.tsx` | 2026-10-02 | Radix to Base UI (Popover from design-components, `asChild` to `render`); local `useControllableState`; popover width from `--anchor-width`, not a ResizeObserver; `useAudioDevices` moved out |
| `src/use-audio-devices.ts` | `packages/elements/src/mic-selector.tsx` (`useAudioDevices`) | 2026-10-02 | own file; `loadDevices` stable and single-flight (upstream re-prompted in a loop after a denial); no TypeError without `navigator.mediaDevices`; no `console.error` |
| `src/speech-input.tsx` | `packages/elements/src/speech-input.tsx` | not yet | WIP |

Original Hollis Labs code, not vendored: `src/lib/use-controllable-state.ts` (replaces Radix's hook).
Not taken: `persona.tsx` (Rive, hotlinked `.riv` assets, no licence for them).
