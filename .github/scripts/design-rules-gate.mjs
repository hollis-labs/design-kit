#!/usr/bin/env node
/**
 * The design-rules half of the gate — the one rule, enforced.
 *
 * Two things make this more than "run eslint":
 *
 * 1. THE VOCABULARY MAY NOT EXIST YET. @hollis-labs/eslint-config-design tests
 *    token names for MEMBERSHIP in the contract and refuses to run without it
 *    (CW-20260910-0124 owns publishing it). That absence is EXPECTED today, and it
 *    must be distinguishable from a failure — the whole point of the go-envelopes
 *    `make vuln` lesson, where `command -v tool && tool || echo skipping` prints
 *    the skip message when the tool runs and finds something. So: the probe
 *    inspects the error, the two cases print different markers, and the exit codes
 *    differ. No `&&`/`||` chaining anywhere.
 *
 * 2. KIT-DASHBOARD IS A PRE-CONTRACT FORK. It carries ~215 violations because it
 *    predates the contract by construction, and its migration is CW-0125's.
 *    Failing on it would make the gate red on arrival for work nobody has been
 *    asked to do yet. So it is REPORTED, every run, with counts — not silenced, and
 *    not blocking. The new packages, authored against the contract from the first
 *    line, are blocking.
 *
 * Exit codes
 *   0  contract-compliant packages are clean (or the vocabulary is not published yet)
 *   1  a contract-compliant package violates the one rule
 *   3  the gate itself could not run
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, relative } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')
const ci = process.env.GITHUB_ACTIONS === 'true'
const notice = (msg) => console.log(ci ? `::notice title=design-rules::${msg}` : `NOTICE: ${msg}`)

/**
 * Authored against the contract — blocking.
 *
 * design-app-runtime is in this list even though it is transport and holds no
 * appearance at all (18 files, 0 findings, 0 classNames as of 2026-09-11). That is
 * deliberate, and it is the cheap half of the boundary: the package's entire value
 * is "adopt it without taking any appearance", so the gate should enforce that
 * rather than trust it. Enrolling it costs nothing now and objects the day a styled
 * helper lands there.
 */
const BLOCKING = [
  'packages/design-tokens',
  'packages/design-components',
  'packages/design-app-runtime',
  'packages/design-bindings',
  'packages/kit-chat',
  // Promoted from REPORT_ONLY by CW-20260910-0125, its documented exit condition.
  // It arrived as a pre-contract fork carrying 256 violations and reached 0 —
  // the base-classified files left with the extraction, the rest were migrated
  // onto the contract vocabulary, and the last two were contract decisions rather
  // than debt.
  'packages/kit-dashboard',
]

/**
 * Empty, and that is the finish line rather than an oversight — every package in
 * this repo is now enforced at zero on the one rule. So is every package in
 * lint-gate.mjs. There is no longer a divergence between the two gates to
 * explain, and the note that explained one has gone with it.
 */
const REPORT_ONLY = []

let designConfig, ESLint
try {
  ;({ designConfig } = await import('@hollis-labs/eslint-config-design'))
  ;({ ESLint } = await import('eslint'))
} catch (err) {
  console.error('design-rules-gate: could not load its own dependencies.')
  console.error(err.message)
  process.exit(3)
}

// DESIGN_VOCABULARY_SOURCE lets a consumer repo (or this repo's own tests) point
// the gate at a vocabulary other than the published package. It is how the
// enforcement path below is exercised before CW-0124 lands, without writing to
// that package.
/**
 * `strictFamilies` IS NOT ENABLED, AND THE MEASUREMENT IS WHY — see the option's
 * own note in eslint-config-design. Review round 3 approved turning it on for the
 * contract-authored packages; running it produced 295 findings that are almost
 * entirely Tailwind's own utilities, so the approval was given for an outcome the
 * option does not currently produce. Raised rather than shipped.
 */
let config
try {
  const override = process.env.DESIGN_VOCABULARY_SOURCE
  if (override) {
    const { vocabularyFrom } = await import('@hollis-labs/eslint-config-design')
    const mod = await import(override)
    notice(`Vocabulary overridden via DESIGN_VOCABULARY_SOURCE=${override}`)
    config = await designConfig({ vocabulary: vocabularyFrom(mod, override) })
  } else {
    config = await designConfig()
  }
} catch (err) {
  // Distinguish "the contract is not published yet" from any other failure by
  // inspecting the error, not by swallowing everything.
  const msg = String(err?.message ?? '')
  const vocabularyMissing = msg.includes('COLOR_TOKENS') || msg.includes('could not load the token vocabulary')
  if (!vocabularyMissing) {
    console.error('design-rules-gate: the config failed to build, and NOT because the')
    console.error('token vocabulary is unpublished. This is a real failure.')
    console.error(msg)
    process.exit(3)
  }
  notice(
    'Design rules are NOT YET ENFORCED: @hollis-labs/design-tokens does not export ' +
    'COLOR_TOKENS yet (CW-20260910-0124). The rules and their 74 tests are green in ' +
    'packages/eslint-config-design; only the repo-wide enforcement waits on the ' +
    'vocabulary. This step turns itself on with no edit once that lands.',
  )
  console.log('\ndesign-rules-gate: SKIPPED — vocabulary unpublished (expected).')
  console.log('This is NOT a passing enforcement run. It is an explicit, reported absence.')
  process.exit(0)
}

const parser = await import('typescript-eslint').then((m) => m.parser)
const withParser = config.map((c) => (c.files && c.plugins
  ? { ...c, languageOptions: { ...c.languageOptions, parser, parserOptions: { ecmaFeatures: { jsx: true } } } }
  : c))

async function countIn(dirs) {
  // AN EMPTY LIST MEANS LINT NOTHING, AND ESLint DOES NOT AGREE: passing it no
  // patterns makes it fall back to a default target, which reported 785 findings
  // from across the repo the moment REPORT_ONLY went empty. An empty input must
  // never be able to look like a result.
  if (dirs.length === 0) return { byRule: new Map(), sites: [], total: 0, unregistered: 0 }
  const eslint = new ESLint({ cwd: repoRoot, overrideConfigFile: true, overrideConfig: withParser, ignore: false, errorOnUnmatchedPattern: false })
  const results = await eslint.lintFiles(dirs.map((d) => `${repoRoot}/${d}/**/*.{ts,tsx}`))
  const byRule = new Map()
  const sites = []
  let unregistered = 0
  for (const r of results) {
    for (const m of r.messages) {
      if (m.ruleId === null) continue
      // kit-dashboard carries `eslint-disable` directives for react-hooks rules
      // (usePoll's justified set-state-in-effect, deliberately preserved). This
      // config does not register those plugins, so ESLint reports "Definition for
      // rule ... was not found" with the rule's own id — which looks exactly like a
      // finding and is not one. Counted separately rather than silently dropped.
      if (m.message.startsWith('Definition for rule')) { unregistered++; continue }
      byRule.set(m.ruleId, (byRule.get(m.ruleId) ?? 0) + 1)
      sites.push(`${relative(repoRoot, r.filePath)}:${m.line}  ${m.ruleId}  ${m.message}`)
    }
  }
  return { byRule, sites, total: sites.length, unregistered }
}

const blocking = await countIn(BLOCKING)
const reported = await countIn(REPORT_ONLY)

console.log('design-rules-gate — the one rule: a component may name a token, never a value.\n')
if (REPORT_ONLY.length === 0) {
  console.log('REPORTED, not blocking — none. Every package is enforced at zero.')
} else {
  console.log(`REPORTED, not blocking — ${REPORT_ONLY.join(', ')}`)
  console.log(`  ${reported.total} violation(s), across src/ and demo/:`)
  for (const [rule, n] of [...reported.byRule.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(5)}  ${rule}`)
  }
  if (reported.unregistered > 0) {
    console.log(`  (plus ${reported.unregistered} "definition for rule not found" notices from`)
    console.log('   disable directives for plugins this config does not register — not findings)')
  }
  if (reported.total > 0 && ci) {
    notice(`${REPORT_ONLY.join(', ')} carries ${reported.total} design-rule violations. Not blocking, and not hidden.`)
  }
}

console.log(`\nBLOCKING — ${BLOCKING.join(', ')}`)
console.log(`  ${blocking.total} violation(s).`)
if (blocking.total === 0) {
  console.log('\ndesign-rules-gate: PASS.')
  process.exit(0)
}
console.error('\ndesign-rules-gate FAILED. These packages are authored against the contract,')
console.error('so a violation here is new drift, not inherited debt:\n')
for (const s of blocking.sites.slice(0, 50)) console.error('  ' + s)
if (blocking.sites.length > 50) console.error(`  … and ${blocking.sites.length - 50} more`)
process.exit(1)
