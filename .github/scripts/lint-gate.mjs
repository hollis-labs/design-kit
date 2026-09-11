#!/usr/bin/env node
/**
 * Blocking lint gate with a ratchet.
 *
 * Runs eslint across the workspaces and compares what it finds against
 * .github/lint-baseline.json. Exits non-zero unless the findings match the
 * baseline EXACTLY — more is a regression, fewer means the baseline is stale.
 *
 * Deliberately not `command -v eslint && eslint || echo skipping`: that idiom
 * prints the skip message when the tool runs and finds something, which makes a
 * real failure indistinguishable from an absent check. go-envelopes' `make vuln`
 * has that bug today. Every exit here is explicit and distinct.
 *
 * Exit codes
 *   0  findings match the baseline
 *   1  regression: a new signature, or a higher count
 *   2  stale baseline: something was fixed — tighten it (a one-line edit)
 *   3  the gate itself could not run (eslint failed to execute, bad JSON)
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, relative } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')
const baselinePath = resolve(repoRoot, '.github', 'lint-baseline.json')

/** @returns {Array<{filePath: string, messages: Array<object>}>} */
function runEslint() {
  // `npm run lint --workspaces` gives human output; we need JSON, so drive
  // eslint directly per workspace that defines a lint script.
  const pkg = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8'))
  const globs = pkg.workspaces ?? []
  const results = []
  for (const ws of globs) {
    // Only `packages/*` today; expand if the workspace globs grow.
    const dirs = execFileSync('ls', ['-1', resolve(repoRoot, ws.replace('/*', ''))], { encoding: 'utf8' })
      .trim().split('\n').filter(Boolean)
    for (const d of dirs) {
      const wsDir = resolve(repoRoot, ws.replace('/*', ''), d)
      let wsPkg
      try { wsPkg = JSON.parse(readFileSync(resolve(wsDir, 'package.json'), 'utf8')) } catch { continue }
      if (!wsPkg.scripts?.lint) continue
      let stdout
      try {
        stdout = execFileSync('npx', ['eslint', '.', '--format', 'json'], {
          cwd: wsDir, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
        })
      } catch (err) {
        // eslint exits non-zero when it finds errors — that is expected and the
        // JSON is still on stdout. Only a missing/garbled stdout is a gate failure.
        stdout = err.stdout
        if (!stdout) {
          console.error(`lint-gate: eslint could not run in ${d}`)
          console.error(err.stderr ?? err.message)
          process.exit(3)
        }
      }
      try {
        results.push(...JSON.parse(stdout))
      } catch {
        console.error(`lint-gate: eslint produced unparseable JSON in ${d}`)
        process.exit(3)
      }
    }
  }
  return results
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
const expected = new Map()
for (const e of baseline.entries) expected.set(`${e.rule}|${e.file}`, e)

const found = new Map()
for (const file of runEslint()) {
  const rel = relative(repoRoot, file.filePath)
  for (const m of file.messages) {
    if (m.severity !== 2) continue
    const key = `${m.ruleId}|${rel}`
    found.set(key, (found.get(key) ?? 0) + 1)
  }
}

const regressions = []
const stale = []
for (const [key, count] of found) {
  const e = expected.get(key)
  if (!e) { regressions.push(`NEW    ${key} (${count})`); continue }
  if (count > e.count) regressions.push(`GREW   ${key}: ${e.count} -> ${count}`)
  else if (count < e.count) stale.push(`FIXED  ${key}: ${e.count} -> ${count}`)
}
for (const [key, e] of expected) {
  if (!found.has(key)) stale.push(`GONE   ${key} (baseline expected ${e.count})`)
}

const total = [...found.values()].reduce((a, b) => a + b, 0)
console.log(`lint-gate: ${total} error(s); baseline tolerates ${baseline.entries.reduce((a, e) => a + e.count, 0)}`)

if (regressions.length > 0) {
  console.error('\nlint-gate FAILED — new lint errors:\n')
  for (const r of regressions) console.error('  ' + r)
  console.error('\nFix them. Do not add them to .github/lint-baseline.json — that file')
  console.error('records debt inherited from the sysop-ui fork, and it only shrinks.')
  process.exit(1)
}
if (stale.length > 0) {
  console.error('\nlint-gate FAILED — the baseline is stale, which means someone fixed something:\n')
  for (const s of stale) console.error('  ' + s)
  console.error('\nRemove or lower those entries in .github/lint-baseline.json. The ratchet')
  console.error('closing is the point; this is a one-line edit, not a problem.')
  process.exit(2)
}
console.log('lint-gate: matches baseline exactly.')
for (const e of baseline.entries) {
  console.log(`  tolerated: ${e.count}x ${e.rule} in ${e.file}  (owner: ${e.owner})`)
}
