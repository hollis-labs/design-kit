# @hollis-labs/kit-voice

Voice input and output components on Base UI and the token contract. **Private
`0.0.0`, unpublished.**

Props down, messages up. No transport, no speech-to-text or text-to-speech service, no
store, no fetching: a host hands the components audio and text and receives events
and `Blob`s back.

## Components

Vendored as source from [AI Elements](https://github.com/vercel/ai-elements)
(Vercel, Apache-2.0), pinned at `6a9d5b1`, with a provenance header on each file that
states what diverged (and `docs/upstream-versions.md`). Each lands in its own change.

| Component | Needs | Status |
|---|---|---|
| `SpeechInput` | browser APIs only | **available** |
| `MicSelector` (+ `MicSelector*` parts) and `useAudioDevices` | browser APIs only | **available** |
| `VoiceSelector`, `Transcription` | browser APIs only | planned |
| `AudioPlayer` | `media-chrome`, behind `@hollis-labs/kit-voice/audio-player` | planned. Imports `ButtonGroup`: **needs the next `design-components` release (unreleased)** |

Not taken: AI Elements' `Persona`. It needs Rive and `.riv` files hotlinked from
Vercel's storage, and no licence for those assets is granted by the repository.

What is available now imports only `Button`, `Command*`, `Popover*` and `cn` from
`design-components`, all present in its `0.3.0` release.

## Secure context: the microphone needs HTTPS or localhost

Browsers withhold the microphone, and so `navigator.mediaDevices`, from any page that is
not a **secure context**: `https://`, `http://localhost` or `http://127.0.0.1`. A page
served over plain `http://` on a LAN address or hostname gets neither Web Speech nor
`getUserMedia`, and nothing in the page can change that.

What the components do about it, instead of failing silently:

- `SpeechInput` is disabled, with `data-unavailable="insecure-context"` on the button so a
  host can show a reason. It reads `window.isSecureContext`.
- `useAudioDevices` returns `error` explaining it, adds no `devicechange` listener, and does
  not throw. `MicSelector` then lists nothing.

## SpeechInput

A round mic button that toggles listening. Two modes, chosen once from what the browser has:

| Mode | When | What happens |
|---|---|---|
| Web Speech | `SpeechRecognition` / `webkitSpeechRecognition` exists (Chromium, Safari) | The browser recognises speech and `onTranscriptionChange` receives each **final** chunk |
| MediaRecorder fallback | No Web Speech, but `MediaRecorder` and `getUserMedia` | Records until clicked again, then hands the host a `Blob` through `onAudioRecorded`; the text it resolves goes to `onTranscriptionChange` |

```tsx
import { SpeechInput } from '@hollis-labs/kit-voice'

<SpeechInput
  lang="en-US"
  onTranscriptionChange={(text) => setDraft((draft) => draft + text)}   // append: each call is one chunk
  onAudioRecorded={async (blob) => (await transcribe(blob)).text}       // the host's own STT
  onError={({ code, message }) => toast(message)}
/>
```

- **`onAudioRecorded` is the host's transcription step and is required for the fallback.**
  Without it, in a browser that has no Web Speech, the button is disabled with
  `data-unavailable="media-recorder-needs-onAudioRecorded"`. kit-voice never sends audio
  anywhere. The `Blob`'s `type` is the recorder's own `mimeType`, which differs by browser
  (`audio/webm;codecs=opus` in Chromium and Firefox, `audio/mp4` in Safari); send it with
  that type rather than assuming webm.
- **Errors reach `onError`** as `{ code, message, cause }`. Codes: `permission-denied`,
  `no-audio-input`, `recognition-error`, `recording-error`, `transcription-failed`. Web
  Speech's own `aborted` is not an error. A rejected `onAudioRecorded` is
  `transcription-failed` and the button is usable again.
- **Why it is disabled** is `data-unavailable`: `insecure-context`, `unsupported`
  (neither Web Speech nor MediaRecorder) or `media-recorder-needs-onAudioRecorded`.
  `data-availability` always names the mode in use or the reason.
- **Accessibility:** the button is named `Voice input` (override with `aria-label`, e.g. to
  localise) and is a toggle, `aria-pressed` while listening, `aria-busy` while the host
  transcribes.
- **`onClick`** runs first; call `event.preventDefault()` to cancel the toggle.
- Leaving the page or unmounting releases the microphone. A recording still running at
  unmount is discarded, not transcribed.
- `lang` is read each time recognition starts; changing it mid-session applies to the next one.

## MicSelector and useAudioDevices

A Popover + Command combobox over the user's microphones. The parts are upstream's:

```tsx
<MicSelector value={deviceId} onValueChange={setDeviceId}>
  <MicSelectorTrigger><MicSelectorValue /></MicSelectorTrigger>
  <MicSelectorContent>
    <MicSelectorInput />
    <MicSelectorList>
      {(devices) =>
        devices.length === 0 ? <MicSelectorEmpty /> : devices.map((device) => (
          <MicSelectorItem key={device.deviceId} value={device.deviceId} keywords={[device.label]}>
            <MicSelectorLabel device={device} />
          </MicSelectorItem>
        ))
      }
    </MicSelectorList>
  </MicSelectorContent>
</MicSelector>
```

- **Pass `keywords={[device.label]}`.** The item's `value` is the device id, and the search
  matches `value` and `keywords`, not the visible text; without it, typing a device name
  finds nothing.
- Device **labels are empty until the user grants microphone permission**. The selector asks
  **once each time it opens**; closing and reopening is the retry. (Upstream asked again on
  every state change, so a denied permission became an endless prompt loop.)
- `value` / `open` are controlled when passed and uncontrolled otherwise (`defaultValue`,
  `defaultOpen`). `undefined` counts as "not passed", so to control an empty selection pass
  `''`: it matches no device and the trigger shows "Select microphone...".
- `useAudioDevices()` is exported for hosts that draw their own picker. It returns
  `{ devices, error, hasPermission, loadDevices, loading }`; `loadDevices` triggers the
  permission prompt and is safe to call repeatedly (one request in flight at a time).
- Picking a microphone does not bind it to `SpeechInput`: Web Speech cannot be pointed at a
  device, and the fallback uses the browser's default. The id is yours to use in your own
  `getUserMedia` call.

## Why its own package

`kit-chat` is a published core package versioned in lockstep with five others; voice is
a different concern with its own release cadence. The main entry carries no heavy
dependency. `media-chrome` is an **optional peer** reached only through the
`/audio-player` subpath (not built yet), the same shape as `kit-chat/markdown`: it registers
custom elements in the global registry, so it must be the host's single copy, and a host
that does not play audio pays nothing.

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
npm run build && npm run typecheck && npm run lint && npm run test:run
npm run demo -w @hollis-labs/kit-voice           # fixtures; ?theme=sysop-p4-white&mode=light
```

- Tests run in jsdom against fakes (`src/__tests__/fakes.ts`) for `mediaDevices`,
  `MediaRecorder`, `SpeechRecognition` and `isSecureContext`. The MicSelector tests render
  `Command` where an app renders `MicSelectorContent`, because an open Base UI Popover
  popup hangs jsdom (bisected with raw `@base-ui/react/popover`, no kit code). The real
  popover is covered in a real browser instead.
- `docs/evidence/verify-browser.mjs` drives headless Chromium with fake microphones
  (`--use-fake-device-for-media-stream`) over the built demo: the MediaRecorder fallback, the
  real popover, the no-re-prompt-loop, the insecure-context path. Its output and
  light/dark screenshots for two themes are committed beside it. **Not verified anywhere:**
  Web Speech *recognition* itself (no speech service in headless Chromium), Safari and
  Firefox.
