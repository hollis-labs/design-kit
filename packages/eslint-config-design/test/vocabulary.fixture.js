/**
 * A vocabulary standing in for @hollis-labs/design-tokens until CW-0124 lands it.
 *
 * The 43 color names are docs/token-contract.md's appendix verbatim. `mode-*` is
 * added because Nanite declares it and it is half of the test case that matters
 * most: `bg-mode-default` and `bg-bg-elevated` are REAL tokens that a structural
 * parser reports as invented, while `bg-bg-surface` is genuinely invented. Those
 * three have to come out differently.
 */
export const COLOR_TOKENS = [
  'bg', 'bg-elevated', 'surface', 'surface-hover', 'surface-active',
  'fg', 'fg-secondary', 'fg-muted', 'fg-faint',
  'border', 'border-subtle', 'divider',
  'primary', 'primary-hover', 'primary-active', 'primary-muted', 'primary-fg',
  'brand', 'brand-hover', 'brand-active', 'brand-muted', 'brand-fg',
  'selection', 'selection-fg', 'ring',
  'danger', 'danger-hover', 'danger-muted', 'danger-fg',
  'warning', 'warning-muted', 'warning-fg',
  'success', 'success-muted', 'success-fg',
  'info', 'info-muted', 'info-fg',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  // Nanite's chat idiom, declared: --color-mode-default etc.
  'mode-default', 'mode-planner', 'mode-architect', 'mode-writer',
]
/**
 * Contract §3.7 — generated, never authored by hand, but a vendored shadcn
 * component names them and they resolve, so they are part of the legal
 * vocabulary. Leaving them out made the rule report `primary-foreground` in
 * badge.tsx as invented, which it is not.
 */
export const SHADCN_ALIASES = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'muted', 'muted-foreground', 'secondary', 'secondary-foreground',
  'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
  'primary-foreground', 'input',
]

/**
 * Names that EXIST today and the contract retires (§3.3), with where they go.
 * Distinct from an invented name: these render correctly right now, so calling
 * them "renders nothing" would be false and alarming. They are a migration
 * surface, and the rule says so.
 */
export const DEPRECATED_TOKENS = {
  'border-strong': 'border',
  'border-soft': 'divider',
}

export const TEXT_TOKENS = ['micro', 'caption', 'label', 'control']
export const RADIUS_TOKENS = ['panel', 'control']
export const TRACKING_TOKENS = ['label']
export const IDIOM_PREFIXES = ['dash', 'chat']
