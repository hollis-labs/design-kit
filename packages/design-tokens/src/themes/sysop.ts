// GENERATED CONTENT, HAND-REVIEWED. Source: libs/sysop-ui@aef2dff styles/theme.css,
// as carried into packages/kit-dashboard. Four dark-only palettes, mapped onto the
// contract vocabulary. See README.md § "Where the values came from" — every value
// marked `derived` had no source in the palette and is flagged for design review.
import type { Theme } from '../theme.js'

/** The sysop-ui default. Neutral zinc on near-black; the dense-ops look. */
export const SYSOP_P4_WHITE: Theme = {
  id: 'sysop-p4-white',
  name: 'Sysop — P4 White',
  description: 'The sysop-ui default. Neutral zinc on near-black; the dense-ops look.',
  builtin: true,
  origin: 'sysop-ui',
  chartPalette: 'placeholder',
  /** Dark-only. sysop-ui's palettes are alternates, not modes — there is no
      light set to carry, and inventing one is a design pass, not a port. */
  tokens: {
    dark: {
      'bg': 'rgb(9 9 11)',
      'bg-elevated': 'rgb(24 24 27)',
      'surface': 'rgb(24 24 27)',
      'surface-hover': 'rgb(24 24 27)',
      'surface-active': 'rgb(57 57 60)',  // derived
      'fg': 'rgb(244 244 245)',
      'fg-secondary': 'rgb(212 212 216)',
      'fg-muted': 'rgb(161 161 170)',
      'fg-faint': 'rgb(113 113 122)',
      'border': 'rgb(39 39 42)',
      'border-subtle': 'rgb(39 39 42 / 80%)',
      'divider': 'rgb(39 39 42 / 70%)',
      'primary': 'rgb(228 228 231)',
      'primary-hover': 'rgb(231 231 234)',  // derived
      'primary-active': 'rgb(201 201 203)',  // derived
      'primary-muted': 'rgb(228 228 231 / 12%)',  // derived
      'primary-fg': 'rgb(9 9 11)',
      'brand': 'rgb(228 228 231)',
      'brand-hover': 'rgb(231 231 234)',  // derived
      'brand-active': 'rgb(201 201 203)',  // derived
      'brand-muted': 'rgb(228 228 231 / 12%)',  // derived
      'brand-fg': 'rgb(9 9 11)',
      'selection': 'rgb(24 24 27)',
      'selection-fg': 'rgb(244 244 245)',
      'ring': 'rgb(63 63 70 / 60%)',
      'danger': 'rgb(251 113 133)',
      'danger-hover': 'rgb(251 130 148)',  // derived
      'danger-muted': 'rgb(251 113 133 / 12%)',  // derived
      'danger-fg': 'rgb(9 9 11)',  // derived
      'warning': 'rgb(245 158 11)',
      'warning-muted': 'rgb(245 158 11 / 12%)',  // derived
      'warning-fg': 'rgb(9 9 11)',  // derived
      'success': 'rgb(52 211 153)',
      'success-muted': 'rgb(52 211 153 / 12%)',  // derived
      'success-fg': 'rgb(9 9 11)',  // derived
      'info': 'rgb(96 165 250)',
      'info-muted': 'rgb(96 165 250 / 12%)',  // derived
      'info-fg': 'rgb(9 9 11)',  // derived
      'chart-1': '#ff00ff',
      'chart-2': '#ff00ff',
      'chart-3': '#ff00ff',
      'chart-4': '#ff00ff',
      'chart-5': '#ff00ff',
      'syntax-key': 'rgb(244 244 245)',  // derived — R4
      'syntax-string': 'rgb(210 210 213)',  // derived — R4
      'syntax-number': 'rgb(176 176 182)',  // derived — R4
      'syntax-boolean': 'rgb(144 144 151)',  // derived — R4
      'syntax-null': 'rgb(113 113 122)',  // derived — R4
    },
  },
}

/** P1 phosphor CRT. Green on black, amber for alarm. */
export const SYSOP_GREEN_PHOSPHOR: Theme = {
  id: 'sysop-green-phosphor',
  name: 'Sysop — Green Phosphor',
  description: 'P1 phosphor CRT. Green on black, amber for alarm.',
  builtin: true,
  origin: 'sysop-ui',
  chartPalette: 'placeholder',
  /** Dark-only. sysop-ui's palettes are alternates, not modes — there is no
      light set to carry, and inventing one is a design pass, not a port. */
  tokens: {
    dark: {
      'bg': 'rgb(10 10 10)',
      'bg-elevated': 'rgb(18 26 20)',
      'surface': 'rgb(18 26 20)',
      'surface-hover': 'rgb(22 34 25)',
      'surface-active': 'rgb(19 67 37)',  // derived
      'fg': 'rgb(0 255 102)',
      'fg-secondary': 'rgb(102 255 170)',
      'fg-muted': 'rgb(93 214 138)',
      'fg-faint': 'rgb(58 140 92)',
      'border': 'rgb(38 74 47)',
      'border-subtle': 'rgb(82 153 101 / 70%)',
      'divider': 'rgb(64 108 75 / 60%)',
      'primary': 'rgb(102 255 170)',
      'primary-hover': 'rgb(120 255 180)',  // derived
      'primary-active': 'rgb(90 224 150)',  // derived
      'primary-muted': 'rgb(102 255 170 / 12%)',  // derived
      'primary-fg': 'rgb(10 10 10)',
      'brand': 'rgb(102 255 170)',
      'brand-hover': 'rgb(120 255 180)',  // derived
      'brand-active': 'rgb(90 224 150)',  // derived
      'brand-muted': 'rgb(102 255 170 / 12%)',  // derived
      'brand-fg': 'rgb(10 10 10)',
      'selection': 'rgb(18 26 20)',
      'selection-fg': 'rgb(0 255 102)',
      'ring': 'rgb(102 255 170 / 58%)',
      'danger': 'rgb(255 184 77)',
      'danger-hover': 'rgb(255 193 98)',  // derived
      'danger-muted': 'rgb(255 184 77 / 12%)',  // derived
      'danger-fg': 'rgb(10 10 10)',  // derived
      'warning': 'rgb(255 212 102)',
      'warning-muted': 'rgb(255 212 102 / 12%)',  // derived
      'warning-fg': 'rgb(10 10 10)',  // derived
      'success': 'rgb(102 255 170)',
      'success-muted': 'rgb(102 255 170 / 12%)',  // derived
      'success-fg': 'rgb(10 10 10)',  // derived
      'info': 'rgb(0 204 85)',
      'info-muted': 'rgb(0 204 85 / 12%)',  // derived
      'info-fg': 'rgb(10 10 10)',  // derived
      'chart-1': '#ff00ff',
      'chart-2': '#ff00ff',
      'chart-3': '#ff00ff',
      'chart-4': '#ff00ff',
      'chart-5': '#ff00ff',
      'syntax-key': 'rgb(0 255 102)',  // derived — R4
      'syntax-string': 'rgb(38 225 102)',  // derived — R4
      'syntax-number': 'rgb(51 196 100)',  // derived — R4
      'syntax-boolean': 'rgb(56 168 97)',  // derived — R4
      'syntax-null': 'rgb(58 140 92)',  // derived — R4
    },
  },
}

/** P3 phosphor CRT. Amber on black, orange-red for alarm. */
export const SYSOP_AMBER_PHOSPHOR: Theme = {
  id: 'sysop-amber-phosphor',
  name: 'Sysop — Amber Phosphor',
  description: 'P3 phosphor CRT. Amber on black, orange-red for alarm.',
  builtin: true,
  origin: 'sysop-ui',
  chartPalette: 'placeholder',
  /** Dark-only. sysop-ui's palettes are alternates, not modes — there is no
      light set to carry, and inventing one is a design pass, not a port. */
  tokens: {
    dark: {
      'bg': 'rgb(10 10 10)',
      'bg-elevated': 'rgb(28 22 14)',
      'surface': 'rgb(28 22 14)',
      'surface-hover': 'rgb(36 28 17)',
      'surface-active': 'rgb(69 50 14)',  // derived
      'fg': 'rgb(255 176 0)',
      'fg-secondary': 'rgb(255 208 96)',
      'fg-muted': 'rgb(232 172 72)',
      'fg-faint': 'rgb(153 112 36)',
      'border': 'rgb(86 65 26)',
      'border-subtle': 'rgb(160 122 52 / 74%)',
      'divider': 'rgb(110 84 36 / 62%)',
      'primary': 'rgb(255 208 96)',
      'primary-hover': 'rgb(255 214 115)',  // derived
      'primary-active': 'rgb(224 183 84)',  // derived
      'primary-muted': 'rgb(255 208 96 / 12%)',  // derived
      'primary-fg': 'rgb(10 10 10)',
      'brand': 'rgb(255 208 96)',
      'brand-hover': 'rgb(255 214 115)',  // derived
      'brand-active': 'rgb(224 183 84)',  // derived
      'brand-muted': 'rgb(255 208 96 / 12%)',  // derived
      'brand-fg': 'rgb(10 10 10)',
      'selection': 'rgb(28 22 14)',
      'selection-fg': 'rgb(255 176 0)',
      'ring': 'rgb(255 208 96 / 56%)',
      'danger': 'rgb(255 110 78)',
      'danger-hover': 'rgb(255 127 99)',  // derived
      'danger-muted': 'rgb(255 110 78 / 12%)',  // derived
      'danger-fg': 'rgb(10 10 10)',  // derived
      'warning': 'rgb(255 208 96)',
      'warning-muted': 'rgb(255 208 96 / 12%)',  // derived
      'warning-fg': 'rgb(10 10 10)',  // derived
      'success': 'rgb(255 208 96)',
      'success-muted': 'rgb(255 208 96 / 12%)',  // derived
      'success-fg': 'rgb(10 10 10)',  // derived
      'info': 'rgb(255 176 0)',
      'info-muted': 'rgb(255 176 0 / 12%)',  // derived
      'info-fg': 'rgb(10 10 10)',  // derived
      'chart-1': '#ff00ff',
      'chart-2': '#ff00ff',
      'chart-3': '#ff00ff',
      'chart-4': '#ff00ff',
      'chart-5': '#ff00ff',
      'syntax-key': 'rgb(255 176 0)',  // derived — R4
      'syntax-string': 'rgb(229 160 21)',  // derived — R4
      'syntax-number': 'rgb(203 143 29)',  // derived — R4
      'syntax-boolean': 'rgb(178 128 34)',  // derived — R4
      'syntax-null': 'rgb(153 112 36)',  // derived — R4
    },
  },
}

/** Maximum contrast. Pure black, pure white edges, saturated status hues. */
export const SYSOP_HI_CONTRAST: Theme = {
  id: 'sysop-hi-contrast',
  name: 'Sysop — High Contrast',
  description: 'Maximum contrast. Pure black, pure white edges, saturated status hues.',
  builtin: true,
  origin: 'sysop-ui',
  chartPalette: 'placeholder',
  /** Dark-only. sysop-ui's palettes are alternates, not modes — there is no
      light set to carry, and inventing one is a design pass, not a port. */
  tokens: {
    dark: {
      'bg': 'rgb(0 0 0)',
      'bg-elevated': 'rgb(18 18 18)',
      'surface': 'rgb(18 18 18)',
      'surface-hover': 'rgb(24 24 24)',
      'surface-active': 'rgb(59 59 59)',  // derived
      'fg': 'rgb(255 255 255)',
      'fg-secondary': 'rgb(255 255 255)',
      'fg-muted': 'rgb(235 235 235)',
      'fg-faint': 'rgb(208 208 208)',
      'border': 'rgb(255 255 255)',
      'border-subtle': 'rgb(255 255 255 / 88%)',
      'divider': 'rgb(255 255 255 / 72%)',
      'primary': 'rgb(255 255 0)',
      'primary-hover': 'rgb(255 255 31)',  // derived
      'primary-active': 'rgb(224 224 0)',  // derived
      'primary-muted': 'rgb(255 255 0 / 12%)',  // derived
      'primary-fg': 'rgb(0 0 0)',
      'brand': 'rgb(255 255 0)',
      'brand-hover': 'rgb(255 255 31)',  // derived
      'brand-active': 'rgb(224 224 0)',  // derived
      'brand-muted': 'rgb(255 255 0 / 12%)',  // derived
      'brand-fg': 'rgb(0 0 0)',
      'selection': 'rgb(18 18 18)',
      'selection-fg': 'rgb(255 255 255)',
      'ring': 'rgb(255 255 0 / 84%)',
      'danger': 'rgb(255 59 48)',
      'danger-hover': 'rgb(255 83 73)',  // derived
      'danger-muted': 'rgb(255 59 48 / 12%)',  // derived
      'danger-fg': 'rgb(0 0 0)',  // derived
      'warning': 'rgb(255 255 0)',
      'warning-muted': 'rgb(255 255 0 / 12%)',  // derived
      'warning-fg': 'rgb(0 0 0)',  // derived
      'success': 'rgb(0 255 0)',
      'success-muted': 'rgb(0 255 0 / 12%)',  // derived
      'success-fg': 'rgb(0 0 0)',  // derived
      'info': 'rgb(0 255 255)',
      'info-muted': 'rgb(0 255 255 / 12%)',  // derived
      'info-fg': 'rgb(0 0 0)',  // derived
      'chart-1': '#ff00ff',
      'chart-2': '#ff00ff',
      'chart-3': '#ff00ff',
      'chart-4': '#ff00ff',
      'chart-5': '#ff00ff',
      'syntax-key': 'rgb(255 255 255)',  // derived — R4
      'syntax-string': 'rgb(243 243 243)',  // derived — R4
      'syntax-number': 'rgb(231 231 231)',  // derived — R4
      'syntax-boolean': 'rgb(220 220 220)',  // derived — R4
      'syntax-null': 'rgb(208 208 208)',  // derived — R4
    },
  },
}

export const SYSOP_PALETTES: readonly Theme[] = [
  SYSOP_P4_WHITE,
  SYSOP_GREEN_PHOSPHOR,
  SYSOP_AMBER_PHOSPHOR,
  SYSOP_HI_CONTRAST,
]
