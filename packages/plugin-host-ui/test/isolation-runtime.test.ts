// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { createPluginFrameBrowser, base64Bytes, sha256Bytes, verifyArtifact, reviewFrameModule, createFrameDocument } from '../src/isolation.js'
import { store } from './helpers.js'
import type { AppIsolationSnapshot } from '../src/host.js'
const bytes = new TextEncoder().encode('export function View() { return null }')
it('refuses relative, URL, computed and unreviewed graphs while permitting declared bare peers', async () => {
  for (const code of ['import "./x.js"', 'export * from "https://host.test/x"', 'import(location.href)', 'import "unreviewed"', 'import.meta.url']) await expect(reviewFrameModule(new TextEncoder().encode(code), ['react'])).rejects.toThrow()
  await expect(reviewFrameModule(new TextEncoder().encode('import React from "react"; export const View = React.createElement'), ['react'])).resolves.toBeUndefined()
})
it('verifies exact bytes and refuses altered digests and noncanonical base64', async () => {
  const artifact = { id: 'plugin', kind: 'module' as const, sha256: await sha256Bytes(bytes), base64: base64Bytes(bytes) }
  expect([...await verifyArtifact(artifact)]).toEqual([...bytes])
  await expect(verifyArtifact({ ...artifact, sha256: '0'.repeat(64) })).rejects.toThrow('digest-mismatch')
  await expect(verifyArtifact({ ...artifact, base64: 'YR==' })).rejects.toThrow('invalid-message')
})
it('preflights digest and mode before any frame delivery or source URL fetch', async () => {
  const provision = vi.fn(), review = vi.fn(), isolation = store<AppIsolationSnapshot>({ appId: 'app', effectiveMode: 'sandboxed-frame', revision: '1' })
  const controller = createPluginFrameBrowser({ document, appId: 'app', isolation, bootstrap: '', delivery: { provision }, review,
    subscribeLeases: () => () => {}, isActive: () => false, isOwnerActive: () => false, host: () => { throw new Error('not adopted') }, bindings: () => [], props: () => ({}), diagnostics: vi.fn() })
  const bundle = { owner: 'notes', generation: '1', hostInstance: 'host', digest: `sha256:${'0'.repeat(64)}`, bytes, sourceUrl: 'https://never-fetch.test/plugin.js', signal: new AbortController().signal }
  await expect(controller.importModule(bundle)).rejects.toThrow('digest-mismatch')
  expect(provision).not.toHaveBeenCalled(); expect(review).not.toHaveBeenCalled()
  isolation.set({ appId: 'wrong-app', effectiveMode: 'main-origin', revision: '2' })
  await expect(controller.importModule(bundle)).rejects.toThrow('missing-effective-mode')
  controller.dispose()
})
it('assembles a document with fixed bootstrap bytes, distinct cryptographic nonces and no plugin configuration', async () => {
  const doc = await createFrameDocument('globalThis.bootstrap = true;', { frameId: 'frame', nonce: 'ab'.repeat(32), parentOrigin: 'https://host.test' })
  expect(doc.csp).toContain("connect-src 'none'")
  expect(doc.html).toContain('globalThis.bootstrap = true;')
  expect(doc.html).toContain('"parent_origin":"https://host.test"')
  await expect(createFrameDocument('</script>', { frameId: 'frame', nonce: 'ab'.repeat(32), parentOrigin: 'https://host.test' })).rejects.toThrow('policy-unavailable')
})
