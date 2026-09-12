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
 * `dir-a` — Graphite & Ink. Decided by Chrispian, 2026-09-10, on the §12.6
 * question the contract left open.
 *
 * NOT `nanite-default`, which is Nanite's own default and the obvious
 * inheritance. Direction C is a coherent theme doing exactly what it says —
 * "cool concrete, brand red as the only signal" — and that makes it a poor
 * default for a package whose contract just promoted success/warning/info/danger
 * to first-class names. Measured across its palette: `warning` and `danger` are
 * the same red (`#d4202e`), `success` is `#c0c4c8` and `info` is `#98a0a8` —
 * both greys. So a caution, a failure, a completion and a notice are three
 * colours between four semantics. THE DEFAULT COULD NOT DEMONSTRATE THE CONTRACT
 * IT SHIPS.
 *
 * Two criteria picked the replacement, and both matter more than taste:
 *
 *   · SEMANTIC CONVENTIONALITY. `dir-a` maps green / amber / red / blue onto
 *     success / warning / danger / info in the expected roles, so the default
 *     TEACHES the contract rather than merely satisfying it. `dir-b` was the
 *     other muted candidate and its `success` is gold, which reads as a warning.
 *     `dir-d` and `dir-e` are distinct but loud — Synthwave and Hacker/Terminal
 *     are aesthetic statements, not neutral starting points.
 *   · LIGHT MODE. All four sysop palettes are dark-only, so any of them as the
 *     default would make the package's out-of-box experience dark-only while
 *     `Theme.tokens.light` is optional. All six Nanite themes carry both.
 *
 * `dir-a` is the only built-in that is both conventional and unopinionated, and
 * its muted register reads as a starting point rather than as someone's choice —
 * which is what a default for six board-shaped apps should do.
 *
 * `nanite-default` remains a built-in. Nothing is wrong with it except being the
 * default. `defaultDemonstratesSemanticRange` in test/themes.test.js is the guard
 * that keeps this decision from being undone by accident.
 */
export const DEFAULT_THEME_ID = 'dir-a'

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
 * R4's output, and it is the same five in EVERY theme and every mode — which is
 * what makes it different in kind from the lists above. Those record what a
 * particular palette happened to lack; this one is uniform because no palette
 * ever had a syntax family at all.
 */
const SYNTAX_DERIVED = [
  'syntax-key', 'syntax-string', 'syntax-number', 'syntax-boolean', 'syntax-null',
] as const satisfies readonly ColorToken[]

/**
 * EVERY VALUE IN THIS PACKAGE THAT NOBODY CHOSE — the design pass's worklist.
 *
 * A contract token that neither source implementation had a value for. Filling
 * these mechanically is how the package ships complete themes without inventing
 * a palette; listing them here is how that stays honest. 168 values — 88 at the
 * contract's landing plus 80 from R4 — and none has been through design review.
 *
 * FOUR RULES PRODUCED ALL OF THEM, applied once, offline, with the results
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
 *   R4  `syntax-*` = five stops at 100/75/50/25/0 between the palette's own `fg`
 *       and `fg-faint`, mixed in oklab. §3.10.
 *       UNLIKE R1-R3, THIS RULE FILLS A FAMILY NO PALETTE EVER HAD, so it is
 *       derivation by design rather than a gap being patched — which is exactly
 *       why it was allowed where a chart palette was not. A ramp between two
 *       steps the palette already chose invents no colour; five distinguishable
 *       series hues would. The endpoints are literally `fg` and `fg-faint`, so
 *       only the three middle stops are new values at all.
 *       THE FLOOR IS `fg-faint`, NOT `bg`, AND THAT WAS MEASURED. The obvious
 *       derivation — `fg` toward `bg` — gives better separation and puts its
 *       bottom two stops at 1.9 / 1.8 / 1.6 / 1.4 : 1 across the sysop palettes,
 *       failing AA in all four. Flooring on the palette's own faintest legible
 *       step holds each palette's existing floor exactly: 4.12 / 4.79 / 4.43 /
 *       13.62 : 1. It costs separation on high-contrast, where adjacent stops
 *       land ΔL* 3.4 apart — thin, and measured against a baseline of ΔL* 0.0,
 *       because the map this replaces rendered two roles at the same colour
 *       there and three at the same colour on amber.
 *
 * `chart-1..5` are NOT in this list, and R4 is not a precedent for filling them.
 * They are not derived from anything; they are `PLACEHOLDER_CHART_COLOR` in every
 * theme, and `Theme.chartPalette` says so. Review round 2 (2026-09-10) decided
 * names only, §13 of the contract is the authority, and review round 4 confirmed
 * it after a later round had reversed it by accident.
 */
export const DERIVED_TOKEN_VALUES: ReadonlyArray<{
  theme: string
  mode: ThemeMode
  tokens: readonly ColorToken[]
}> = [
  { theme: 'nanite-default', mode: 'dark', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'nanite-default', mode: 'light', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'dir-a', mode: 'dark', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'dir-a', mode: 'light', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'dir-b', mode: 'dark', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'dir-b', mode: 'light', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'dir-d', mode: 'dark', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'dir-d', mode: 'light', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'dir-e', mode: 'dark', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'dir-e', mode: 'light', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'dir-f', mode: 'dark', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'dir-f', mode: 'light', tokens: ['info-fg', 'warning-fg', ...SYNTAX_DERIVED] },
  { theme: 'sysop-p4-white', mode: 'dark', tokens: [...SYSOP_DERIVED, ...SYNTAX_DERIVED] },
  { theme: 'sysop-green-phosphor', mode: 'dark', tokens: [...SYSOP_DERIVED, ...SYNTAX_DERIVED] },
  { theme: 'sysop-amber-phosphor', mode: 'dark', tokens: [...SYSOP_DERIVED, ...SYNTAX_DERIVED] },
  { theme: 'sysop-hi-contrast', mode: 'dark', tokens: [...SYSOP_DERIVED, ...SYNTAX_DERIVED] },
]
