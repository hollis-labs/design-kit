# @hollis-labs/kit-voice

Voice input and output components on Base UI and the token contract. **Private
`0.0.0`, unpublished. This is the package skeleton: nothing is exported yet.**

Props down, messages up. No transport, no speech-to-text or text-to-speech service, no
store, no fetching: a host hands the components audio and text and receives events
and `Blob`s back.

## What is coming

Vendored as source from [AI Elements](https://github.com/vercel/ai-elements)
(Vercel, Apache-2.0), pinned at `6a9d5b1`, with a provenance header on each file that
states what diverged. Each lands in its own change.

| Component | Needs | Status |
|---|---|---|
| `SpeechInput`, `MicSelector` + `useAudioDevices` | browser APIs only | planned |
| `VoiceSelector`, `Transcription` | browser APIs only | planned |
| `AudioPlayer` | `media-chrome`, behind `@hollis-labs/kit-voice/audio-player` | planned, after `ButtonGroup` |

Not taken: AI Elements' `Persona`. It needs Rive and `.riv` files hotlinked from
Vercel's storage, and no licence for those assets is granted by the repository.

## Why its own package

`kit-chat` is a published core package versioned in lockstep with five others; voice is
a different concern with its own release cadence. The main entry carries no heavy
dependency. `media-chrome` is an **optional peer** reached only through the
`/audio-player` subpath, the same shape as `kit-chat/markdown`: it registers custom
elements in the global registry, so it must be the host's single copy, and a host that
does not play audio pays nothing.

## Install

```bash
npm install @hollis-labs/kit-voice @hollis-labs/design-components @hollis-labs/design-tokens
npm install @base-ui/react react react-dom lucide-react     # peers
```

```css
@import "tailwindcss";
@import "@hollis-labs/design-tokens/design-tokens.css";
@import "@hollis-labs/design-components/source.css";
@import "@hollis-labs/kit-voice/source.css";   /* required, or styling silently fails */
```

## Working on it

```bash
npm run build && npm run typecheck && npm run lint
```
