import { vi } from 'vitest'
import { createPluginHostRuntime, type AdoptedEntry, type AppIsolationSnapshot, type Observable, type RegistryEntry } from '../src/host.js'
export function store<T>(initial: T): Observable<T> & { set(value: T): void } {
  let value = initial
  const listeners = new Set<() => void>()
  return { getSnapshot: () => value, getServerSnapshot: () => value, subscribe(fn) { listeners.add(fn); return () => { listeners.delete(fn) } }, set(next) { value = next; for (const listener of listeners) listener() } }
}
export function harness(value: unknown = () => null) {
  let entries: RegistryEntry[] = [{ owner_id: 'sample', owner_generation: '1', local_key: 'view', kind: 'panel', status: 'accepted', representation: 'component', metadata: {}, component: { export: 'View', region: 'rail' } }]
  let revision = 1, active = true, exported = value
  const listeners = new Set<() => void>()
  const isolation = store<AppIsolationSnapshot>({ appId: 'app', effectiveMode: 'main-origin', revision: '1' })
  const adopted = (): AdoptedEntry => ({ ...entries[0]!, hostInstance: 'epoch', value: exported, isActive: () => active })
  const registry = {
    async sync(input: RegistryEntry[] | string) { if (typeof input === 'string') throw new Error('Unsupported input'); entries = input; revision++; for (const listener of listeners) listener() },
    snapshot: () => ({ registryVersion: 2, hostInstance: 'epoch', revision, version: revision, contributions: entries }),
    subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn) } },
    list: () => entries.length ? [adopted()] : [],
    get: () => entries.length && entries[0]?.status === 'accepted' ? adopted() : undefined,
  }
  const panels = { reconcile: vi.fn(), releaseScope: vi.fn() }, diagnostics = vi.fn()
  const renderContext = store<Readonly<Record<string, unknown>>>({ session_id: 'host-session' })
  const runtime = createPluginHostRuntime({ scope: { appId: 'app', environmentId: 'test', clientId: 'browser' }, registry, isolation, renderContext, panels, diagnostics,
    reserved: () => false, project: entry => ({ label: entry.local_key, region: 'rail', props: { session_id: 'spoof' } }) })
  return { runtime, registry, panels, isolation, renderContext, diagnostics, entry: () => entries[0]!, revoke() { active = false }, replace(next: unknown) { exported = next; revision++; for (const listener of listeners) listener() } }
}
