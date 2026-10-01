# Priority idiom registration — CW-20261001-0529

Before: the merged PR 28 proof, using compatibility utility names.
After: actual built PriorityBadge with canonical dash-priority utilities and
compiled dashboard demo CSS, captured in headless Chromium.
All ten built-in themes × light/dark and all four legacy dark palettes retain
identical colors, sizes and labels. Adjacent JSON records all checked states;
only the P1/P2 background class names change.

| Theme/mode | Before | After |
| --- | --- | --- |
| Graphite dark | [before](dir-a-dark-before.png) | [after](dir-a-dark-after.png) |
| Graphite light | [before](dir-a-light-before.png) | [after](dir-a-light-after.png) |
| Legacy P4 | [before](p4-white-dark-before.png) | [after](p4-white-dark-after.png) |
| Legacy high contrast | [before](hi-contrast-dark-before.png) | [after](hi-contrast-dark-after.png) |

The JSON manifest is the authored vocabulary and deprecation source; the loader
checks its bindings against theme.css. The gate scopes enrollment to this kit.
No app adoption or workflow-status migration is included.
