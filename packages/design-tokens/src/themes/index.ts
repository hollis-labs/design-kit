import { NANITE_THEMES } from './nanite.js'
import { SYSOP_PALETTES } from './sysop.js'
import type { ColorToken } from '../tokens.js'
import type { Theme, ThemeMode } from '../theme.js'

export * from './nanite.js'
export * from './sysop.js'

/**
 * Ten built-in themes — and both working implementations survive whole.
 *
 * CW-0124 is explicit that losing either set costs the epic its working
 * examples, so both are here at full fidelity:
 *
 *   · SIX from `apps/nanite`, each with a complete dark AND light set. Verified
 *     independently: 12 value sets, one key set, zero drift — the property that
 *     made the typed-contract argument, reproduced rather than taken on trust.
 *   · FOUR from `libs/sysop-ui`, dark-only alternates that swap by attribute.
 *
 * The fifth sysop palette in the brief does not exist. `theme.css` has FOUR
 * `[data-theme]` selectors plus a `:root` fallback that duplicates `p4-white`
 * declaration for declaration — a fallback, not a palette.
 */
export const BUILTIN_THEMES: readonly Theme[] = [...NANITE_THEMES, ...SYSOP_PALETTES]

/**
 * What `:root` renders before anything sets `[data-theme]`.
 *
 * Nanite's own default, kept because choosing differently would be a design call
 * and this package does not get to make those. It is worth knowing what it costs:
 * Direction C collapses `primary` toward `fg` and sets `warning` and `danger` to
 * the SAME red, so THE DEFAULT THEME CANNOT DEMONSTRATE THE CONTRACT'S SEMANTIC
 * RANGE — a caution and a failure look identical in it. The contract flagged this
 * for design review (§12.5, §12.6) and it is still open.
 *
 * `dir-a` (Graphite & Ink) is the built-in that does demonstrate the range; use
 * it when showing someone what the contract buys. Changing the package default is
 * one edit here.
 */
export const DEFAULT_THEME_ID = 'nanite-default'

export function getBuiltinTheme(id: string): Theme | undefined {
  return BUILTIN_THEMES.find((t) => t.id === id)
}

/** The same sixteen in every sysop palette — the exact shape of what they lack. */
const SYSOP_DERIVED = [
  'surface-active',
  'primary-hover', 'primary-active', 'primary-muted',
  'brand-hover', 'brand-active', 'brand-muted',
  'danger-hover', 'danger-muted', 'danger-fg',
  'warning-muted', 'warning-fg',
  'success-muted', 'success-fg',
  'info-muted', 'info-fg',
] as const satisfies readonly ColorToken[]

/**
 * EVERY VALUE IN THIS PACKAGE THAT NOBODY CHOSE — the design pass's worklist.
 *
 * A contract token that neither source implementation had a value for. Filling
 * these mechanically is how the package ships complete themes without inventing
 * a palette; listing them here is how that stays honest. 88 values, and none of
 * them has been through design review.
 *
 * THREE RULES PRODUCED ALL OF THEM, applied once, offline, with the results
 * written into the theme files as literal colours so every value stays
 * inspectable and a theme editor still works:
 *
 *   R1  `X-muted`  = X at 12% alpha.
 *       The contract's own definition — "`-muted` always means a low-alpha tint
 *       used as a background" (§3.8 rule 3). Names no new colour.
 *
 *   R2  `X-hover`  = X mixed 12% toward white
 *       `X-active` = X mixed 12% toward black
 *       `surface-active` = `surface-hover` mixed 15% toward `fg`
 *       A magnitude, not a hue. sysop-ui's palettes have no interaction states
 *       for `primary`/`brand`/`danger` at all, so the alternative was repeating
 *       the base colour and shipping a button that does not respond.
 *
 *   R3  `X-fg` = white or the theme's own `bg`, whichever has higher WCAG
 *       contrast against the `X` fill.
 *       MEASURED AGAINST THE THEMES THEMSELVES, and reported rather than
 *       asserted: the rule reproduces 39 of the 48 `-fg` values Nanite's authors
 *       chose by hand. The nine it misses are all cases where they preferred
 *       white on a saturated red or orange at LOWER measured contrast — a real
 *       aesthetic convention this rule does not capture. So these values are
 *       contrast-maximal, not style-matched, and a design pass should expect to
 *       move some of them.
 *
 * `chart-1..5` are NOT in this list. They are not derived from anything; they
 * are `PLACEHOLDER_CHART_COLOR` in every theme, and `Theme.chartPalette` says so.
 */
export const DERIVED_TOKEN_VALUES: ReadonlyArray<{
  theme: string
  mode: ThemeMode
  tokens: readonly ColorToken[]
}> = [
  { theme: 'nanite-default', mode: 'dark', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'nanite-default', mode: 'light', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'dir-a', mode: 'dark', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'dir-a', mode: 'light', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'dir-b', mode: 'dark', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'dir-b', mode: 'light', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'dir-d', mode: 'dark', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'dir-d', mode: 'light', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'dir-e', mode: 'dark', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'dir-e', mode: 'light', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'dir-f', mode: 'dark', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'dir-f', mode: 'light', tokens: ['info-fg', 'warning-fg'] },
  { theme: 'sysop-p4-white', mode: 'dark', tokens: SYSOP_DERIVED },
  { theme: 'sysop-green-phosphor', mode: 'dark', tokens: SYSOP_DERIVED },
  { theme: 'sysop-amber-phosphor', mode: 'dark', tokens: SYSOP_DERIVED },
  { theme: 'sysop-hi-contrast', mode: 'dark', tokens: SYSOP_DERIVED },
]
