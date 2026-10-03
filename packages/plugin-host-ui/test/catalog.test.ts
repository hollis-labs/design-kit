import { describe, expect, it, vi } from 'vitest'
import { createSlotCatalog, type SlotCatalogDefinitions } from '../src/catalog.js'
import type { RegistryEntry } from '../src/host.js'
import { harness } from './helpers.js'
function definitions(): SlotCatalogDefinitions {
  return {
    kinds: ['panel', 'widget'].map(kind => ({ kind, schemaVersion: 1, representations: ['component'], regions: ['rail'], role: kind === 'widget' ? 'widget' : 'contribution',
      validate: entry => !(entry.metadata as { invalid?: boolean }).invalid,
      project: entry => ({ label: entry.local_key, region: 'rail', ...(entry.metadata as Record<string, unknown>) }) })),
    regions: [{ name: 'rail', representation: 'component', kinds: ['panel', 'widget'], widgetKinds: ['widget'], ordering: 'priority-ascending' }],
    reserved: ref => ref.key === 'reserved',
  }
}
function inspect(entry: RegistryEntry, defs = definitions()) {
  return createSlotCatalog(defs).inspect(entry, { hostInstance: 'epoch', owner: entry.owner_id, generation: entry.owner_generation, kind: entry.kind, key: entry.local_key })
}
describe('host catalog policy', () => {
  it('snapshots and freezes host definitions and opts into no undeclared kind', () => {
    const defs = definitions(), catalog = createSlotCatalog(defs)
    expect(Object.isFrozen(catalog)).toBe(true)
    expect(Object.isFrozen(catalog.kinds[0]?.representations)).toBe(true)
    expect(Object.isFrozen(catalog.regions[0]?.widgetKinds)).toBe(true)
    defs.kinds = []; defs.regions = []; defs.reserved = () => true
    const entry = harness().entry()
    expect(catalog.inspect(entry, { hostInstance: 'epoch', owner: 'sample', generation: '1', kind: 'panel', key: 'view' }).accepted).toBe(true)
    expect(inspect({ ...entry, kind: 'drawer.tab' })).toMatchObject({ accepted: false, refusal: { reason: 'unsupported-kind' } })
    const empty = createSlotCatalog({ kinds: [], regions: [], reserved: () => false })
    expect(empty.inspect(entry, { hostInstance: 'epoch', owner: 'sample', generation: '1', kind: 'panel', key: 'view' })).toMatchObject({ accepted: false, refusal: { reason: 'unsupported-kind' } })
  })
  it('rejects duplicate, dangling, missing-validator and invalid ordering policies at creation', () => {
    for (const mutate of [
      (defs: SlotCatalogDefinitions) => { defs.kinds = [...defs.kinds, defs.kinds[0]!] },
      (defs: SlotCatalogDefinitions) => { defs.regions = [] },
      (defs: SlotCatalogDefinitions) => { defs.kinds = [{ ...defs.kinds[0]!, validate: undefined! }] },
      (defs: SlotCatalogDefinitions) => { defs.regions = [{ ...defs.regions[0]!, ordering: 'future' as never }] },
      (defs: SlotCatalogDefinitions) => { defs.regions = [{ ...defs.regions[0]!, widgetKinds: ['panel'] }] },
    ]) { const defs = definitions(); mutate(defs); expect(() => createSlotCatalog(defs)).toThrow('Invalid host slot catalog') }
    const defs = definitions(); defs.kinds = [{ ...defs.kinds[0]!, kind: 'slot' }]
    expect(() => createSlotCatalog(defs)).toThrow()
  })
  it.each([
    ['unsupported-kind', { kind: 'future' }], ['unsupported-schema', { schema_version: 3 }],
    ['unsupported-representation', { representation: 'declarative' }], ['reserved', { local_key: 'reserved' }],
    ['invalid-metadata', { metadata: { invalid: true } }],
    ['projection-failed', { metadata: { props: { execute: () => null } } }],
    ['unsupported-region', { component: { export: 'View', region: 'other' } }],
  ] as const)('refuses %s by identity with safe fallback metadata', (reason, change) => {
    const entry = { ...harness().entry(), metadata: { label: 'unvalidated private label', props: { secret: 'private' } }, ...change }
    expect(inspect(entry)).toMatchObject({ accepted: false, refusal: { reason, required: false, ref: { owner: 'sample', kind: entry.kind, key: entry.local_key } }, projection: { label: 'Plugin contribution unavailable.', props: {} } })
    expect(JSON.stringify(inspect(entry))).not.toContain('private')
  })
  it('requires explicit widget acceptance and freezes validated projection data', () => {
    const entry = { ...harness().entry(), kind: 'widget', metadata: { data: { nested: ['one'] } } }
    const result = inspect(entry)
    expect(result).toMatchObject({ accepted: true, widget: true, projection: { data: { nested: ['one'] } } })
    if (result.accepted) expect(Object.isFrozen(result.projection.data)).toBe(true)
    const defs = definitions(); defs.regions = [{ ...defs.regions[0]!, widgetKinds: [] }]
    expect(inspect(entry, defs)).toMatchObject({ accepted: false, refusal: { reason: 'unsupported-widget' } })
  })
  it('keeps supported siblings and optional refused metadata visible without execution', async () => {
    const h = harness(() => null, createSlotCatalog(definitions())); h.runtime.retain()
    await h.runtime.sync([h.entry(), { ...h.entry(), local_key: 'unknown', kind: 'future', metadata: { label: 'private' } }])
    expect(h.runtime.getSnapshot().views).toHaveLength(2)
    const fallback = h.runtime.getSnapshot().views.find(view => view.ref.key === 'unknown')!
    expect(fallback).toMatchObject({ availability: 'unavailable', label: 'Plugin contribution unavailable.', refusal: { reason: 'unsupported-kind' } })
    expect(fallback.value).toBeUndefined(); expect(h.runtime.isCurrent(fallback)).toBe(false)
    expect(h.panels.reconcile).toHaveBeenLastCalledWith(h.runtime.scope, [h.runtime.getSnapshot().views.find(view => view.ref.kind === 'panel')])
  })
  it('withholds the whole host revision for a required unsupported inactive kind without registry rollback', async () => {
    const h = harness(() => null, createSlotCatalog(definitions())); h.runtime.retain()
    const snapshot = h.runtime.getSnapshot(), calls = h.panels.reconcile.mock.calls.length, listener = vi.fn()
    h.runtime.subscribe(listener)
    const result = await h.runtime.sync([{ ...h.entry(), local_key: 'new' }, { ...h.entry(), kind: 'future', required: true, status: 'declared_not_selected' }])
    expect(result.planning).toMatchObject({ accepted: false, refusals: [{ reason: 'unsupported-kind', required: true, ref: { kind: 'future', owner: 'sample', generation: '1' } }] })
    expect(h.registry.snapshot().revision).toBeGreaterThan(snapshot.revision)
    expect(h.runtime.getSnapshot()).toBe(snapshot)
    expect(h.panels.reconcile).toHaveBeenCalledTimes(calls)
    expect(listener).not.toHaveBeenCalled()
    expect(h.diagnostics).toHaveBeenCalledWith(expect.objectContaining({ stage: 'catalog', reason: 'unsupported-kind' }))
    await h.runtime.sync([{ ...h.entry(), kind: 'panel', required: false }])
    expect(h.runtime.getSnapshot().revision).toBe(h.registry.snapshot().revision)
  })
  it.each(['priority-ascending', 'priority-descending', 'manifest'] as const)('publishes region ordering %s', async ordering => {
    const defs = definitions(); defs.regions = [{ ...defs.regions[0]!, ordering }]
    const h = harness(() => null, createSlotCatalog(defs)); h.runtime.retain()
    const entry = h.entry()
    await h.runtime.sync([
      { ...entry, local_key: 'a', metadata: { priority: 20, manifestOrder: 1 } },
      { ...entry, local_key: 'b', metadata: { priority: 1, manifestOrder: 2 } },
      { ...entry, local_key: 'c', metadata: { manifestOrder: 0 } },
    ])
    expect(h.runtime.getSnapshot().views.map(view => view.ref.key)).toEqual(ordering === 'priority-ascending' ? ['b', 'c', 'a'] : ordering === 'priority-descending' ? ['a', 'c', 'b'] : ['c', 'a', 'b'])
  })
})

it('validates and freezes optional region action policy; absence admits no actions', () => {
  const defs = definitions()
  expect(createSlotCatalog(defs).actionPolicy('rail')).toBeUndefined()
  defs.regions = [{ ...defs.regions[0]!, actions: { cardinality: 'optional', allowedTags: ['command', 'modal'] } }]
  const catalog = createSlotCatalog(defs)
  expect(catalog.actionPolicy('rail')).toEqual({ cardinality: 'optional', allowedTags: ['command', 'modal'] })
  expect(Object.isFrozen(catalog.actionPolicy('rail')?.allowedTags)).toBe(true)
  for (const actions of [
    { cardinality: 'optional', allowedTags: ['handler'] },
    { cardinality: 'none', allowedTags: ['command'] },
    { cardinality: 'required', allowedTags: [] },
  ]) expect(() => createSlotCatalog({ ...defs, regions: [{ ...defs.regions[0]!, actions: actions as never }] })).toThrow()
})
