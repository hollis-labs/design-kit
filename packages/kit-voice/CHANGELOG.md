# Changelog

## 0.0.0 — unreleased, private

- Add the package skeleton: manifest, build, lint and typecheck wiring, enrolled on
  both repo gates. No components yet.
- Add `SpeechInput`: Web Speech where the browser has it, otherwise a MediaRecorder fallback
  that hands the host a `Blob` through `onAudioRecorded`. Reports failures through `onError`,
  is disabled outside a secure context with `data-unavailable` saying why, types the Blob with
  the recorder's own mimeType, and releases the microphone on unmount.
- Add `MicSelector` (and its `MicSelector*` parts) and `useAudioDevices`. Asks for the
  microphone once per open instead of looping after a denial, and does not throw without
  `navigator.mediaDevices`.
- Local `useControllableState` (internal) in place of Radix's.
- Add `test:run`, a fixtures demo (`npm run demo`) and Chromium evidence under `docs/evidence`.
