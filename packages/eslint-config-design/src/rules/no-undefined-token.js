import { classStringVisitor } from '../visit.js'
import { COLOR_PREFIXES, PALETTE_FAMILIES } from '../tailwind.js'
import { parseUtility, tokenizeClassString } from '../class-parser.js'

/**
 * The strongest rule in the set, and the one with the best evidence.
 *
 * Four invented token names are live in production across both codebases, at 16
 * use sites, every one of them rendering NO COLOR AT ALL, every one plausible,
 * every one past review:
 *
 *   status-running   kit/settings-panel.tsx:97,117            (12 statuses exist; `running` is not one)
 *   status-info      nanite/SystemPromptsViewer.tsx:116,120   (nanite declares ok/warn/danger only)
 *   bg-bg-surface    nanite/composer/{Drawer,CardRadio,BooleanChoice}.tsx  (the token is `surface`)
 *   warning-fg       nanite/SkillDetailView.tsx:421           (the missing corner of a complete family)
 *
 * A hex literal at least renders something. An invented token renders nothing, so
 * this catches a worse class of defect than no-color-literal does.
 *
 * HOW IT AVOIDS THE OBVIOUS BUG. The naive implementation strips the utility
 * prefix and assumes one segment remains, which misreads every multi-segment
 * token name — `bg-bg-elevated` and `bg-mode-default` are both REAL tokens that a
 * structural parser reports as invented. `bg-bg-surface` (invented) and
 * `bg-bg-elevated` (legitimate) differ by one segment, so no amount of structural
 * reasoning separates them. This rule therefore does no structural reasoning at
 * all: it tests the whole remainder for MEMBERSHIP in the declared vocabulary.
 *
 * It is also deliberately conservative about WHAT it judges. A remainder is only
 * treated as a token reference when its first segment is a family the vocabulary
 * actually declares — so `text-center`, `text-sm` and `border-2` are never
 * candidates. An unrecognised family is ignored rather than flagged, which trades
 * a false negative for never crying wolf. `strictFamilies` flips that.
 */
export default {
  meta: {
    type: 'problem',
    docs: { description: 'A component may only name a token that exists.' },
    schema: [{
      type: 'object',
      properties: {
        tokens: { type: 'array', items: { type: 'string' } },
        families: { type: 'array', items: { type: 'string' } },
        extraFamilies: { type: 'array', items: { type: 'string' } },
        ignore: { type: 'array', items: { type: 'string' } },
        deprecated: { type: 'object', additionalProperties: { type: 'string' } },
        strictFamilies: { type: 'boolean' },
      },
      additionalProperties: false,
    }],
    messages: {
      undefinedToken: 'Token "{{token}}" is not in the contract, so "{{cls}}" renders nothing at all. Did you mean {{suggestion}}?',
      undefinedNoSuggestion: 'Token "{{token}}" is not in the contract, so "{{cls}}" renders nothing at all.',
      unknownFamily: 'Token family "{{family}}" is not declared in the contract, so "{{cls}}" renders nothing at all.',
      retired: 'Token "{{token}}" is retired by the contract — use "{{replacement}}". It still renders today, so this is a migration, not a break.',
    },
  },
  create(context) {
    const opts = context.options[0] ?? {}
    const tokens = new Set(opts.tokens ?? [])
    const deprecated = opts.deprecated ?? {}
    const ignore = new Set(opts.ignore ?? [])
    const strictFamilies = opts.strictFamilies ?? false
    const sourceCode = context.sourceCode
    const palette = new Set(PALETTE_FAMILIES)

    if (tokens.size === 0) return {}

    // Families derived from the vocabulary itself — never a literal list.
    //
    // The gate only judges names whose FAMILY it recognises, which is what keeps
    // it from firing on `text-center` or `border-2`. The consequence is worth
    // stating plainly: a family the vocabulary does not declare at all is
    // invisible to this rule. `bg-status-running` is caught when the repo's
    // vocabulary includes its own `status-*` idiom tokens — which it should,
    // since a repo lints against what it declares — and missed when it does not.
    // `extraFamilies` is the escape valve for declaring a family whose members
    // are not all enumerable.
    const families = new Set([
      ...(opts.families ?? [...tokens].map((t) => t.split('-')[0])),
      ...(opts.extraFamilies ?? []),
    ])

    /** Closest declared token by edit distance, for an actionable message. */
    const suggest = (name) => {
      let best = null
      for (const t of tokens) {
        const d = distance(name, t)
        if (best === null || d < best.d) best = { d, t }
      }
      // Only suggest when it is actually close; a wrong suggestion is worse than none.
      return best && best.d <= Math.max(2, Math.floor(name.length / 3)) ? best.t : null
    }

    return classStringVisitor(sourceCode, (text, locate) => {
      for (const tok of tokenizeClassString(text)) {
        const p = parseUtility(tok.raw, COLOR_PREFIXES)
        if (!p || p.arbitrary) continue
        const value = p.value
        if (tokens.has(value) || ignore.has(value)) continue

        const family = value.split('-')[0]
        // A raw palette utility is no-raw-palette-utility's finding, not ours.
        if (palette.has(family)) continue

        const loc = rangeToLoc(sourceCode, locate(tok.index, tok.raw.length))

        if (!families.has(family)) {
          if (strictFamilies) {
            context.report({ loc, messageId: 'unknownFamily', data: { family, cls: tok.raw } })
          }
          continue
        }

        // A retired name is a different finding from an invented one: it renders
        // correctly today. Saying "renders nothing" about `border-strong` would be
        // false, and a rule that overstates its finding gets argued with.
        if (deprecated[value] !== undefined) {
          context.report({ loc, messageId: 'retired', data: { token: value, replacement: deprecated[value] } })
          continue
        }

        const hint = suggest(value)
        if (hint) {
          context.report({ loc, messageId: 'undefinedToken', data: { token: value, cls: tok.raw, suggestion: `"${hint}"` } })
        } else {
          context.report({ loc, messageId: 'undefinedNoSuggestion', data: { token: value, cls: tok.raw } })
        }
      }
    })
  },
}

/** Levenshtein, small and local — this runs on short token names only. */
function distance(a, b) {
  const m = a.length, n = b.length
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[n]
}

function rangeToLoc(sourceCode, [start, end]) {
  return { start: sourceCode.getLocFromIndex(start), end: sourceCode.getLocFromIndex(end) }
}
