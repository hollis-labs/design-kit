/**
 * @hollis-labs/eslint-config-design — the gate.
 *
 * THE ONE RULE: a component may name a token, never a value. It covers scale as
 * much as color; `text-[13px]` names a value exactly as much as `#1a1b26` does.
 *
 * Why a gate and not a guideline: every number in the drift measurement is that
 * guideline being ignored by someone who meant well. And since Chrispian chose to
 * EXTEND Tailwind's type scale rather than close it, `text-[13px]` stays
 * representable — so lint is not a backstop to the type scale, it is the
 * enforcement mechanism for it.
 *
 * The vocabulary is never hardcoded here. See vocabulary.js.
 */

import noColorLiteral from './rules/no-color-literal.js'
import noRawPaletteUtility from './rules/no-raw-palette-utility.js'
import noArbitraryScale from './rules/no-arbitrary-scale.js'
import noUndefinedToken from './rules/no-undefined-token.js'
import noIdiomShadowingContract from './rules/no-idiom-shadowing-contract.js'
import requireDisableReason from './rules/require-disable-reason.js'
import { resolveVocabulary, vocabularyFrom } from './vocabulary.js'

export { vocabularyFrom, resolveVocabulary }

export const plugin = {
  meta: { name: '@hollis-labs/eslint-config-design' },
  rules: {
    'no-color-literal': noColorLiteral,
    'no-raw-palette-utility': noRawPaletteUtility,
    'no-arbitrary-scale': noArbitraryScale,
    'no-undefined-token': noUndefinedToken,
    'no-idiom-shadowing-contract': noIdiomShadowingContract,
    'require-disable-reason': requireDisableReason,
  },
}

/** Files that are legitimately allowed to name a color — layer 3, and only layer 3. */
export const DEFAULT_THEME_FILES = [
  '**/design-tokens/src/**',
  '**/lib/theme/**',
  '**/src/styles/**',
  '**/*.theme.{ts,tsx,js,jsx}',
  '**/theme/defaults.{ts,js}',
  '**/theme/tailwind-swatches.{ts,js}',
]

const SOURCE_FILES = ['**/*.{ts,tsx,js,jsx,mts,cts}']

/**
 * Build the flat-config array.
 *
 * Async because the vocabulary is resolved from the tokens package. ESLint 9
 * accepts a promise from `eslint.config.js`, so:
 *
 *   export default await designConfig()
 *
 * @param {Object}  [options]
 * @param {import('./vocabulary.js').Vocabulary} [options.vocabulary]
 *        Pre-built vocabulary. Omit to resolve from @hollis-labs/design-tokens.
 * @param {string[]} [options.files]       globs the rules apply to
 * @param {string[]} [options.themeFiles]  globs exempt from the color rules
 * @param {string[]} [options.chartFiles]
 *        Globs where a color LITERAL is tolerated because a charting library needs
 *        real color strings. EMPTY BY DEFAULT, and deliberately a separate option
 *        from themeFiles: "chart config" is a much narrower carve-out than "theme
 *        file" and must not be smuggled in under it. Prefer the `chart-1..5` JS
 *        accessor the contract specifies (§3.6, §10) over widening this.
 * @param {'error'|'warn'} [options.severity]
 * @param {string[]} [options.ignoreTokens]
 */
export async function designConfig(options = {}) {
  const {
    vocabulary = await resolveVocabulary(),
    files = SOURCE_FILES,
    themeFiles = DEFAULT_THEME_FILES,
    chartFiles = [],
    severity = 'error',
    ignoreTokens = [],
  } = options

  const tokens = [...vocabulary.colors]
  // Invert name -> value into value -> name, which is what the scale rule needs
  // to recognise "this arbitrary value already has a name".
  const invert = (scale) => Object.fromEntries(
    Object.entries(scale ?? {}).filter(([, v]) => Number.isFinite(v)).map(([name, v]) => [String(v), name]),
  )
  const scaleOptions = {
    text: invert(vocabulary.textScale),
    radius: invert(vocabulary.radiusScale),
    tracking: invert(vocabulary.trackingScale),
  }

  const configs = [
    {
      name: 'design/rules',
      files,
      plugins: { design: plugin },
      rules: {
        'design/no-color-literal': severity,
        'design/no-raw-palette-utility': severity,
        'design/no-arbitrary-scale': [severity, scaleOptions],
        'design/no-undefined-token': [severity, {
          tokens,
          families: [...vocabulary.families],
          ignore: ignoreTokens,
          deprecated: vocabulary.deprecated ?? {},
        }],
        'design/no-idiom-shadowing-contract': [severity, {
          idioms: vocabulary.idioms,
          contract: tokens,
        }],
        'design/require-disable-reason': severity,
      },
    },
    {
      // Layer 3 is the only layer permitted to name a color. This exemption is
      // load-bearing: without it Nanite reports 627 errors in lib/theme/ and gets
      // recorded as the portfolio's worst offender, when those 627 are correct.
      name: 'design/theme-layer-may-name-colors',
      files: themeFiles,
      rules: {
        'design/no-color-literal': 'off',
        'design/no-raw-palette-utility': 'off',
      },
    },
  ]

  if (chartFiles.length > 0) {
    configs.push({
      name: 'design/chart-configs-may-hold-literal-colors',
      files: chartFiles,
      // Only the literal is tolerated. A chart file still may not invent a token
      // name or write an arbitrary type size.
      rules: { 'design/no-color-literal': 'off' },
    })
  }

  return configs
}

export default { plugin, designConfig, vocabularyFrom, resolveVocabulary, DEFAULT_THEME_FILES }
