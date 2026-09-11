#!/usr/bin/env node
/**
 * The lint half of the gate — scoped by package, counting nothing.
 *
 * THIS REPLACED A RATCHET, AND WHY IS THE INTERESTING PART. The first version of
 * this gate recorded the two inherited react-refresh errors in
 * .github/lint-baseline.json by exact count, and failed the build if the count rose
 * OR FELL — a fall meaning someone had fixed something and the baseline was stale.
 *
 * That is a rule about the STATE of a mutable file, and it breaks the build when the
 * codebase IMPROVES. Chrispian's standing position, 2026-09-11:
 *
 *   A gate may assert a PROPERTY OF THE CODE. It may never assert a QUANTITY OF THE
 *   CODEBASE. "This package has no violations" is a property. "This file contains
 *   exactly two errors" is a census — and a census punishes progress.
 *
 * The irony worth recording: design-rules-gate.mjs, written the same day and sitting
 * next to this file, already had the right shape. It scopes by package and asserts a
 * property. This file now mirrors it, so the repo has ONE gate policy rather than two
 * contradictory ones.
 *
 * WHAT IS LOST, STATED HONESTLY: a ratchet notices if kit-dashboard's inherited error
 * count grows. This does not — kit-dashboard is report-only, so new lint errors there
 * are printed and do not block. That is the deliberate trade. The debt is visible
 * every run, it is owned by a real task rather than by a build failure, and the
 * moment CW-20260910-0131 rebases kit-dashboard it moves into BLOCKING and the
 * exemption is deleted. An owner with a task beats a tripwire with a number.
 *
 * NO `command -v tool && tool || echo skipping` ANYWHERE. That idiom prints the skip
 * message when the tool runs and finds something, which is why go-envelopes'
 * `make vuln` reports a real finding as "not installed". Every exit below is explicit
 * and distinct.
 *
 * Exit codes
 *   0  every blocking package is clean (report-only packages may carry anything)
 *   1  a blocking package has lint errors — new drift, in code authored clean
 *   3  the gate itself could not run
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, relative } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')
const ci = process.env.GITHUB_ACTIONS === 'true'
const notice = (msg) => console.log(ci ? `::notice title=lint::${msg}` : `NOTICE: ${msg}`)

/**
 * Authored clean from the first line — blocking at zero.
 *
 * A package belongs here from the moment it is created, not once it is finished.
 * Enrolling an empty package costs nothing and means its first violation is caught
 * on the commit that introduces it, which is the only cheap time to catch one.
 */
const BLOCKING = [
  'packages/design-tokens',
  'packages/design-components',
  'packages/design-app-runtime',
  'packages/design-bindings',
  'packages/kit-chat',
  'packages/eslint-config-design',
]

/**
 * Pre-contract fork of sysop-ui — reported every run, never blocking.
 *
 * Its two inherited react-refresh errors in src/components/json-payload.tsx come from
 * libs/sysop-ui at aef2dff, which reports the identical errors at the identical lines
 * on its own pinned plugin. Not a regression introduced by the fork.
 *
 * EXIT CONDITION, and it is a task rather than a number: CW-20260910-0131 rebases
 * kit-dashboard onto the extracted packages. When that lands, move this entry into
 * BLOCKING and delete this comment. CW-20260910-0125 removes the two react-refresh
 * errors along the way by splitting json-payload's helpers out — which needs no
 * change here, because nothing counts them.
 */
const REPORT_ONLY = ['packages/kit-dashboard']

/** Lint one package directory. Returns null if it defines no lint script. */
function lintPackage(pkgDir) {
  const abs = resolve(repoRoot, pkgDir)
  if (!existsSync(resolve(abs, 'package.json'))) return null
  let pkg
  try {
    pkg = JSON.parse(readFileSync(resolve(abs, 'package.json'), 'utf8'))
  } catch (err) {
    console.error(`lint-gate: ${pkgDir}/package.json is unreadable.`)
    console.error(err.message)
    process.exit(3)
  }
  if (!pkg.scripts?.lint) return null

  let stdout
  try {
    stdout = execFileSync('npx', ['eslint', '.', '--format', 'json'], {
      cwd: abs, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    })
  } catch (err) {
    // eslint exits non-zero when it finds errors — expected, and the JSON is still
    // on stdout. Only a missing or garbled stdout is a gate failure.
    stdout = err.stdout
    if (!stdout) {
      console.error(`lint-gate: eslint could not run in ${pkgDir}`)
      console.error(err.stderr ?? err.message)
      process.exit(3)
    }
  }

  let results
  try {
    results = JSON.parse(stdout)
  } catch {
    console.error(`lint-gate: eslint produced unparseable JSON in ${pkgDir}`)
    process.exit(3)
  }

  const byRule = new Map()
  const sites = []
  for (const file of results) {
    for (const m of file.messages) {
      if (m.severity !== 2) continue
      byRule.set(m.ruleId, (byRule.get(m.ruleId) ?? 0) + 1)
      sites.push(`${relative(repoRoot, file.filePath)}:${m.line}:${m.column}  ${m.ruleId}  ${m.message}`)
    }
  }
  return { byRule, sites, total: sites.length }
}

function scan(dirs) {
  const linted = []
  const skipped = []
  const byRule = new Map()
  const sites = []
  for (const d of dirs) {
    const r = lintPackage(d)
    if (r === null) { skipped.push(d); continue }
    linted.push(d)
    for (const [rule, n] of r.byRule) byRule.set(rule, (byRule.get(rule) ?? 0) + n)
    sites.push(...r.sites)
  }
  return { linted, skipped, byRule, sites, total: sites.length }
}

console.log('lint-gate — scoped by package. Nothing here counts anything.\n')

const reported = scan(REPORT_ONLY)
if (reported.linted.length > 0) {
  console.log(`REPORTED, not blocking — ${reported.linted.join(', ')}`)
  console.log('  A pre-contract fork of sysop-ui. Joins BLOCKING at CW-20260910-0131.')
  console.log(`  ${reported.total} error(s):`)
  for (const [rule, n] of [...reported.byRule.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(5)}  ${rule}`)
  }
  if (reported.total > 0 && ci) {
    notice(`kit-dashboard carries ${reported.total} lint error(s), inherited from the sysop-ui fork. Not blocking, and not hidden. Owner: CW-20260910-0131.`)
  }
}

const blocking = scan(BLOCKING)
console.log(`\nBLOCKING — ${blocking.linted.length > 0 ? blocking.linted.join(', ') : '(none lintable yet)'}`)
if (blocking.skipped.length > 0) {
  console.log(`  no lint script yet, skipped: ${blocking.skipped.join(', ')}`)
}
console.log(`  ${blocking.total} error(s).`)

if (blocking.total === 0) {
  console.log('\nlint-gate: PASS.')
  process.exit(0)
}

console.error('\nlint-gate FAILED. These packages are authored clean, so an error here is')
console.error('new drift rather than inherited debt. Fix it — there is no baseline to add to.\n')
for (const s of blocking.sites.slice(0, 50)) console.error('  ' + s)
if (blocking.sites.length > 50) console.error(`  … and ${blocking.sites.length - 50} more`)
process.exit(1)
