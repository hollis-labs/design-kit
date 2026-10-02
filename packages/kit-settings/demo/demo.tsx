import { useState } from 'react'
import { SettingsRenderer } from '../src'
import type { SettingsChanges, SettingsState } from '../src'
import { demoFallbacks, initialStates, nanite, tachyon } from './fixtures'

export function Demo() {
  const [states, setStates] = useState(initialStates)
  const [reject, setReject] = useState(false)
  const [saved, setSaved] = useState(0)
  const patch = (id: string, update: Partial<SettingsState>) => setStates(previous => ({ ...previous, [id]: { ...previous[id], ...update } }))
  const save = (id: string, changes: SettingsChanges) => {
    if (reject) { patch(id, { error: 'Demo host rejected this update; draft retained.' }); return }
    const values = { ...states[id].values }
    for (const [key, v] of Object.entries(changes.set)) {
      // Secrets are only represented by presence, even in this in-memory host fixture.
      values[key] = values[key].secret_present !== undefined
        ? { present: true, secret_present: true, editable: true, has_override: true }
        : { present: true, value: v, editable: true, has_override: true }
    }
    for (const key of changes.unset) values[key] = { present: true, value: demoFallbacks[key], editable: true, has_override: false }
    patch(id, { values, draft: {}, error: undefined, validation: undefined, notice: 'Demo host accepted the change.' })
    setSaved(previous => previous + 1)
  }
  return <main className="mx-auto flex min-w-0 max-w-screen-lg flex-col gap-6 p-4 text-control text-fg">
    <h1 className="text-control font-semibold">kit-settings — controlled forms</h1>
    <p className="text-control text-fg-muted">Illustrative local host, no network or persistence. Backend validation, revisions and ETags are required in a real host.</p>
    <label className="flex items-center gap-2"><input type="checkbox" checked={reject} onChange={e => setReject(e.target.checked)} className="size-4 accent-primary" />Reject saves in the demo host</label>
    <p role="status">Host save count: {saved}</p>
    {[nanite, tachyon].map(manifest => <section key={manifest.app.id} aria-labelledby={manifest.app.id} className="flex min-w-0 flex-col gap-4">
      <h2 id={manifest.app.id} className="text-control font-semibold">{manifest.app.label} example</h2>
      <SettingsRenderer contractVersion={manifest.contract_version} groups={manifest.settings} states={states}
        onDraftChange={(id, draft) => patch(id, { draft, validation: undefined, error: undefined, notice: undefined })}
        onSave={save} onReset={(id, keys) => save(id, { set: {}, unset: keys })} onValidate={id => patch(id, { validation: { valid: true, errors: [] }, notice: 'Demo host validation accepted. Real updates must revalidate.' })} />
    </section>)}
  </main>
}
