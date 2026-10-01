# Priority token disposition — CW-20260912-0046

Actual `PriorityBadge` components rendered with the compiled dashboard demo CSS
in headless Chromium. Canonical P1/P2 aliases are added; the component keeps compatibility utility
names until CW-20261001-0529 registers kit vocabularies. Tint mixing stays in the theme layer. Unknown priorities still fall back to
P3. Computed colors, sizes and labels are identical before/after across all ten
built-ins in light/dark and all four legacy palettes in dark. Adjacent JSON files
record every checked state, including the unchanged compatibility class names.

| Theme/mode | Before | After |
| --- | --- | --- |
| Graphite dark | [before](dir-a-dark-before.png) | [after](dir-a-dark-after.png) |
| Graphite light | [before](dir-a-light-before.png) | [after](dir-a-light-after.png) |
| Legacy P4 | [before](p4-white-dark-before.png) | [after](p4-white-dark-after.png) |
| Legacy high contrast | [before](hi-contrast-dark-before.png) | [after](hi-contrast-dark-after.png) |

Decision: keep the 22% Oklab blocked/queued fills as dashboard-owned
`dash-priority-p1-bg` / `dash-priority-p2-bg`. Retain old CSS aliases and record
retirement in `DASHBOARD_DEPRECATED_TOKENS`; no generic feedback-token fold.
Workflow `status-*` and `status-*-label` remain unchanged, with their eventual
prefix migration tracked by CW-20260911-0071. No app adoption or new gate added.
