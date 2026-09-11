import type { ColorToken } from './tokens.js'

/**
 * THE THEME TYPES — layer 3, the only layer permitted to name a colour.
 *
 * Implements docs/token-contract.md §10, with one documented deviation (see
 * `Theme.tokens` below).
 *
 * Why types at all, in one paragraph, because the record asked for an argument
 * rather than deference: scanning every colour-bearing utility in both
 * implementations against the tokens each actually declares turns up FOUR
 * INVENTED TOKEN NAMES ACROSS 16 USE SITES, every one rendering no colour, every
 * one past review in two separately-reviewed codebases — `status-running`,
 * `status-info`, `bg-bg-surface`, `warning-fg`. Each is plausible:
 * `status-running` sits beside eleven real statuses, `warning-fg` was the
 * missing corner of an otherwise-complete family, `bg-bg-surface` is a correct
 * token with one extra word. A union turns all sixteen into compile errors.
 *
 * And Nanite already ran the controlled experiment: across 6 themes × dark and
 * light × 40 keys, the TYPED half has zero drift — verified independently here,
 * 12 value sets, one key set, not a missing or extra key anywhere. The names
 * that lived only in CSS (`divider`, `selection-fg`, the nine `composer-*`) are
 * exactly the ones that drifted out, and the comment in `types.ts` describing
 * that boundary is itself wrong about where it runs.
 */

/**
 * A complete set of values for one mode.
 *
 * `Record<ColorToken, string>` is the load-bearing part: it forces every theme
 * to carry every key, which is the property that held Nanite's twelve value sets
 * together with no drift.
 *
 * A value is any CSS colour — `#rrggbb`, `rgb(r g b / a%)`, `rgba(…)`. It may
 * also reference another token in the same set (`var(--hl-fg)`) or compute from
 * one (`color-mix(…)`), because a theme is the layer allowed to do that.
 */
export type TokenValues = Record<ColorToken, string>

export type ThemeMode = 'dark' | 'light'

export interface Theme {
  id: string
  name: string
  description?: string
  author?: string
  version?: string
  /** Shipped with the package — read-only, duplicate to edit. */
  builtin?: boolean
  /** Which working implementation these values came from. Provenance, not behaviour. */
  origin?: 'nanite' | 'sysop-ui' | (string & {})
  /**
   * Whether `chart-1..5` hold designed values or the placeholder.
   *
   * REQUIRED, and required on purpose. The chart family is the one place this
   * package ships values nobody chose (§3.6), and a theme should have to say so
   * rather than let a caller assume. Every built-in theme is `'placeholder'`
   * today. `hasDesignedChartPalette()` is the runtime check.
   */
  chartPalette: 'placeholder' | 'designed'
  /**
   * ── DEVIATION FROM THE CONTRACT, REPORTED RATHER THAN PAPERED OVER ──────────
   *
   * §10 writes this as `{ dark: TokenValues; light: TokenValues }` — both
   * required. Implemented here with `light` OPTIONAL, because the contract's own
   * two requirements collide otherwise:
   *
   *   · §10 says every theme carries a complete dark AND light set.
   *   · CW-0124 says sysop-ui's four palettes must survive the move and be
   *     demonstrable.
   *
   * Those four palettes are dark-only ALTERNATES, not modes — `p1-green-phosphor`
   * has no light variant, and a phosphor CRT does not acquire one by being asked
   * politely. Satisfying both would mean inventing four light palettes, which is
   * a design pass and is Chrispian's, not this package's. `light?` is the
   * smaller deviation and it loses nothing: `Record<ColorToken, string>` still
   * forces completeness on whichever modes a theme declares, so the
   * no-drift property the requirement existed for is intact.
   *
   * Nanite's six themes carry both, unchanged.
   */
  tokens: {
    dark: TokenValues
    light?: TokenValues
  }
}

/** Which modes a theme actually ships. A dark-only theme answers `['dark']`. */
export function modesOf(theme: Theme): ThemeMode[] {
  return theme.tokens.light ? ['dark', 'light'] : ['dark']
}

/** False for every built-in theme today. See `PLACEHOLDER_CHART_COLOR`. */
export function hasDesignedChartPalette(theme: Theme): boolean {
  return theme.chartPalette === 'designed'
}

/**
 * Editor metadata. Nanite's `TokenMeta`, kept — it is what makes a theme editor
 * possible, and it is the piece sysop-ui's pure-CSS approach has no place to put.
 */
export interface TokenMeta {
  key: ColorToken
  label: string
  description?: string
  category: TokenCategory
  /** Typically authored as rgba — the `-muted` variants. */
  allowsAlpha?: boolean
}

export type TokenCategory =
  | 'surfaces' | 'text' | 'borders' | 'primary' | 'brand'
  | 'selection' | 'feedback' | 'chart'

/**
 * Component-prop types, DERIVED from the contract rather than restated.
 *
 * Nanite's `Envelope` `accent` and `StatusPill` `tone` are local string-literal
 * copies of the token vocabulary today, and CW-0116 §E found nine kit exports
 * with a prop typed `string` applied as a colour. `Extract` means removing a
 * token from the contract breaks the prop type instead of leaving it pointing at
 * nothing.
 */
export type Tone = Extract<ColorToken, 'success' | 'warning' | 'danger' | 'info'>
export type Accent = Tone | Extract<ColorToken, 'primary' | 'brand'>

export const TONES = ['success', 'warning', 'danger', 'info'] as const satisfies readonly Tone[]
export const ACCENTS = [
  'success', 'warning', 'danger', 'info', 'primary', 'brand',
] as const satisfies readonly Accent[]
