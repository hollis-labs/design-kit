import { useState } from 'react'
import {
  MicSelector,
  MicSelectorContent,
  MicSelectorEmpty,
  MicSelectorInput,
  MicSelectorItem,
  MicSelectorLabel,
  MicSelectorList,
  MicSelectorTrigger,
  MicSelectorValue,
  SpeechInput,
} from '../src'
import type { SpeechInputError } from '../src'
import { AudioSection } from './AudioSection'

const panel = 'flex flex-col gap-3 rounded-panel border border-border bg-bg-elevated p-4'

// This fixture host owns the transcript and the log. kit-voice only reports; there is
// no speech service behind either button.
export function App() {
  const [transcript, setTranscript] = useState('')
  const [recorded, setRecorded] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [mic, setMic] = useState<string | undefined>()
  const onError = (source: string) => (error: SpeechInputError) =>
    setErrors((current) => [...current, `${source}: ${error.code} — ${error.message}`])

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
        <h1 className="text-title font-semibold">kit-voice fixtures</h1>

        <section className={panel} aria-labelledby="speech-input">
          <h2 id="speech-input" className="text-label font-medium">SpeechInput (Web Speech)</h2>
          <p className="text-control text-fg-muted">
            Uses the browser's recognizer where there is one. It needs HTTPS or localhost.
          </p>
          <div className="flex items-center gap-3">
            <SpeechInput
              onError={onError('web-speech')}
              onTranscriptionChange={(text) => setTranscript((current) => current + text)}
            />
            <output className="text-control text-fg-secondary" data-testid="transcript">
              {transcript || 'No transcript yet.'}
            </output>
          </div>
        </section>

        <section className={panel} aria-labelledby="speech-input-recorder">
          <h2 id="speech-input-recorder" className="text-label font-medium">
            SpeechInput (MediaRecorder fallback)
          </h2>
          <p className="text-control text-fg-muted">
            Where Web Speech is absent the host gets the recording to transcribe. This fixture
            only reports what it received.
          </p>
          <div className="flex items-center gap-3">
            <SpeechInput
              data-testid="recorder-input"
              onAudioRecorded={async (blob) => `Received ${blob.size} bytes of ${blob.type || 'unknown type'}.`}
              onError={onError('recorder')}
              onTranscriptionChange={setRecorded}
            />
            <output className="text-control text-fg-secondary" data-testid="recorded">
              {recorded || 'Nothing recorded yet.'}
            </output>
          </div>
        </section>

        <section className={panel} aria-labelledby="mic-selector">
          <h2 id="mic-selector" className="text-label font-medium">MicSelector</h2>
          <MicSelector onValueChange={setMic} value={mic}>
            <MicSelectorTrigger className="w-72" data-testid="mic-trigger">
              <MicSelectorValue />
            </MicSelectorTrigger>
            <MicSelectorContent>
              <MicSelectorInput />
              <MicSelectorList>
                {(devices) =>
                  devices.length === 0 ? (
                    <MicSelectorEmpty />
                  ) : (
                    devices.map((device) => (
                      <MicSelectorItem
                        key={device.deviceId}
                        keywords={[device.label]}
                        value={device.deviceId}
                      >
                        <MicSelectorLabel device={device} />
                      </MicSelectorItem>
                    ))
                  )
                }
              </MicSelectorList>
            </MicSelectorContent>
          </MicSelector>
        </section>

        <AudioSection panelClassName={panel} />

      <section className={panel} aria-labelledby="error-log">
          <h2 id="error-log" className="text-label font-medium">onError log</h2>
          <ul className="text-control text-fg-secondary" data-testid="errors">
            {errors.length === 0 ? <li>No errors.</li> : errors.map((line, index) => <li key={index}>{line}</li>)}
          </ul>
        </section>
      </main>
    </div>
  )
}
