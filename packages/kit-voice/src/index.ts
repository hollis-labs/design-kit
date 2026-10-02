/**
 * `@hollis-labs/kit-voice` — voice input and output components.
 *
 * Vendored from AI Elements (Apache-2.0) and ported to Base UI and the token contract;
 * see README.md and docs/upstream-versions.md. The main entry carries no heavy
 * dependency. Needs the next design-components release (unreleased): it imports its
 * `useControllableState`.
 */
export {
  MicSelector,
  MicSelectorContent,
  MicSelectorEmpty,
  MicSelectorInput,
  MicSelectorItem,
  MicSelectorLabel,
  MicSelectorList,
  MicSelectorTrigger,
  MicSelectorValue,
} from './mic-selector'
export type {
  MicSelectorContentProps,
  MicSelectorEmptyProps,
  MicSelectorInputProps,
  MicSelectorItemProps,
  MicSelectorLabelProps,
  MicSelectorListProps,
  MicSelectorProps,
  MicSelectorTriggerProps,
  MicSelectorValueProps,
} from './mic-selector'
export { SpeechInput } from './speech-input'
export type {
  SpeechInputAvailability,
  SpeechInputError,
  SpeechInputErrorCode,
  SpeechInputProps,
} from './speech-input'
export { useAudioDevices } from './use-audio-devices'
