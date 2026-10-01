# Health feedback decision — CW-20260913-0035

Actual built Pill and Callout components rendered with compiled dashboard demo CSS
in headless Chromium. Each image shows bg, elevated, surface, hover and active
surfaces. Labels/icons stay the same; Concrete's OK now has green treatment and
WARN amber, while Flat/Mono WARN separates from orange DANGER.

| Theme/mode | Before | After |
| --- | --- | --- |
| Concrete dark | [before](nanite-default-dark-before.png) | [after](nanite-default-dark-after.png) |
| Concrete light | [before](nanite-default-light-before.png) | [after](nanite-default-light-after.png) |
| Flat/Mono dark | [before](dir-f-dark-before.png) | [after](dir-f-dark-after.png) |
| Flat/Mono light | [before](dir-f-light-before.png) | [after](dir-f-light-after.png) |

## Measured contrast

Chromium resolves/composites the actual Pill foreground and 10% fill; WCAG ratios
use the package's public `contrastRatio`. Minima span all five shown surfaces,
with the lowest ratios on surface-active. Solid-fill ratios compare the matching
`*-fg` foreground against the new tone. [Full numbers](contrast.json) retain every
surface; adjacent before/after JSON covers all ten built-ins × light/dark.
Only the approved tone/fill changes occur; all danger colors, other themes,
classes, sizes and labels remain unchanged.

| Theme/mode | Tone | New value | Plain minimum | 10% fill minimum | Solid fill foreground |
| --- | --- | --- | --- | --- | --- |
| nanite-default dark | success | `#cadcd5` | 5.70:1 | 4.66:1 | 14.71:1 |
| nanite-default dark | warning | `#e2d6c4` | 5.68:1 | 4.62:1 | 14.65:1 |
| nanite-default light | success | `#304f42` | 5.31:1 | 4.60:1 | 9.04:1 |
| nanite-default light | warning | `#594628` | 5.29:1 | 4.58:1 | 9.01:1 |
| dir-f dark | warning | `#c6b08d` | 5.58:1 | 4.62:1 | 10.00:1 |
| dir-f light | warning | `#4a3a21` | 5.28:1 | 4.56:1 | 10.95:1 |

The old Concrete health hues are the seeds, lightened/darkened in encoded sRGB
for readable text. Matching tint tokens preserve 10% alpha. This is an authored
palette decision, not another derivation rule or health token family. Nanite app
adoption is outside this PR. Chrispian's visual sign-off is tracked in
CW-20261001-0526.

The derivation fixture stays unchanged: reviewed `warning-fg` entries for
nanite-default/dark, nanite-default/light, dir-f/dark and dir-f/light still resolve
to black, white, black and white respectively. Success/tints are authored for
these palettes, so there are no changed derived rows to rewrite.
