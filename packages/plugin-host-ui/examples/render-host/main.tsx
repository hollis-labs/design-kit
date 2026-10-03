import '@hollis-labs/design-tokens/design-tokens.css'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createSlotCatalog, createPluginHostRuntime, type AdoptedEntry, type Observable, type RegistryEntry, type AppIsolationSnapshot } from '../../src/index.js'
import { PluginHostProvider, PluginPanelBody, WidgetRenderer, usePluginSlots } from '../../src/react.js'
function externalStore<T>(value: T): Observable<T> {
  return { getSnapshot: () => value, getServerSnapshot: () => value, subscribe: () => () => {} }
}
function Panel() { const [count, setCount] = useState(0); return <button onClick={() => setCount(count + 1)}>Owned panel: {count}</button> }
function Widget() { return <p>Owned widget</p> }
const entries: RegistryEntry[] = [
  { owner_id: 'example', owner_generation: '1', local_key: 'panel', kind: 'panel', status: 'accepted', representation: 'component', schema_version: 1, required: false, metadata: {}, component: { export: 'Panel', region: 'example.rail' } },
  { owner_id: 'example', owner_generation: '1', local_key: 'widget', kind: 'widget', status: 'accepted', representation: 'component', schema_version: 1, required: false, metadata: {}, component: { export: 'Widget', region: 'example.canvas' } },
]
let revision = 0, current: RegistryEntry[] = []
const listeners = new Set<() => void>()
const registry = {
  async sync(input: readonly RegistryEntry[] | string) {
    if (typeof input === 'string') throw new Error('Example accepts projected entries')
    current = await Promise.resolve([...input]); revision++
    for (const listener of listeners) listener()
  },
  snapshot: () => ({ registryVersion: 2, hostInstance: 'example-epoch', revision, version: revision, contributions: current }),
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
  list(kind: string): AdoptedEntry[] { return current.filter(entry => entry.kind === kind).map(entry => ({ ...entry, hostInstance: 'example-epoch', value: entry.local_key === 'panel' ? Panel : Widget, isActive: () => current.includes(entry) })) },
  get(kind: string, key: string) { return this.list(kind).find(entry => `${entry.owner_id}/${entry.local_key}` === key) },
}
// Explicit development override. Production app settings normally choose sandboxed-frame;
// this example supplies no frame controller and cannot render that mode.
const isolation = externalStore<AppIsolationSnapshot>({ appId: 'example', effectiveMode: 'main-origin', revision: 'development' })
const panelStore = new Map<string, readonly string[]>()
const runtime = createPluginHostRuntime({
  scope: { appId: 'example', environmentId: 'development', clientId: 'browser' }, registry, isolation,
  renderContext: externalStore<Readonly<Record<string, unknown>>>({}),
  catalog: createSlotCatalog({
    kinds: [
      { kind: 'panel', schemaVersion: 1, role: 'contribution', representations: ['component'], regions: ['example.rail'], validate: () => true, project: entry => ({ label: entry.local_key, region: entry.component!.region }) },
      { kind: 'widget', schemaVersion: 1, role: 'widget', representations: ['component'], regions: ['example.canvas'], validate: () => true, project: entry => ({ label: entry.local_key, region: entry.component!.region }) },
    ],
    regions: [
      { name: 'example.rail', representation: 'component', kinds: ['panel'], widgetKinds: [], ordering: 'priority-ascending' },
      { name: 'example.canvas', representation: 'component', kinds: ['widget'], widgetKinds: ['widget'], ordering: 'manifest' },
    ], reserved: () => false,
  }),
  panels: { reconcile(scope, views) { panelStore.set(scope.clientId, views.map(view => view.id)) }, releaseScope(scope) { panelStore.delete(scope.clientId) } },
  diagnostics: event => console.warn(event.reason),
})
function Example() {
  const rail = usePluginSlots('example.rail'), canvas = usePluginSlots('example.canvas')
  return <main className="p-3 space-y-3"><section aria-label="Rail">{rail.map(panel => <PluginPanelBody key={panel.id} panel={panel} />)}</section>
    <section aria-label="Canvas">{canvas.map(widget => <WidgetRenderer key={widget.id} widget={widget} />)}</section>
    <button onClick={() => { void runtime.sync([]) }}>Unload example owner</button></main>
}
await runtime.sync(entries)
createRoot(document.getElementById('root')!).render(<PluginHostProvider runtime={runtime}><Example /></PluginHostProvider>)
