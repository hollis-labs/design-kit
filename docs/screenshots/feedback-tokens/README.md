# Dashboard feedback tokens — CW-20261001-0522

All five actual `Pill` tones, rendered with the dashboard's compiled stylesheet
and legacy `p4-white` palette in headless Chromium (720 × 250). Both renders
include CW-20261001-0521, so the font-size fix does not confound this comparison.

| Before | After |
| --- | --- |
| ![Missing success and info tokens](before.png) | ![Success and info use status colors](after.png) |

Before, `--hl-success` and `--hl-info` were undefined: their Pills inherited
near-white text, transparent backgrounds and white borders. After, success
resolves to the existing done color (`#34d399`) and info to doing (`#60a5fa`).
Neutral, warning and danger are unchanged; all five remain 10px caption text.
The adjacent JSON files record computed classes, sizes, colors and backgrounds.

This is a targeted visual check, not the full theme-layer migration or the
light/dark contrast sweep. Those remain CW-20260911-0071 and CW-20261001-0498.
