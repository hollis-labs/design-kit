# Matched radius evidence

BEFORE is e789ecd; AFTER is the proposed cn fix. Left/right images use the same crop. Each state has zero browser errors. Raw [before](before.json) and [after](after.json) data record all four corners, class strings and instance labels.

| Surface | 1440 dark | 1440 light | 390 dark | 390 light |
| --- | --- | --- | --- | --- |
| matrix | [pair](matrix-1440-sysop-p4-white-dark.png) | [pair](matrix-1440-dir-b-light.png) | [pair](matrix-390-sysop-p4-white-dark.png) | [pair](matrix-390-dir-b-light.png) |
| matrixDashboard | [pair](matrixDashboard-1440-sysop-p4-white-dark.png) | [pair](matrixDashboard-1440-dir-b-light.png) | [pair](matrixDashboard-390-sysop-p4-white-dark.png) | [pair](matrixDashboard-390-dir-b-light.png) |
| gallery | [pair](gallery-1440-sysop-p4-white-dark.png) | [pair](gallery-1440-dir-b-light.png) | [pair](gallery-390-sysop-p4-white-dark.png) | [pair](gallery-390-dir-b-light.png) |
| accountAccess | [pair](accountAccess-1440-sysop-p4-white-dark.png) | [pair](accountAccess-1440-dir-b-light.png) | [pair](accountAccess-390-sysop-p4-white-dark.png) | [pair](accountAccess-390-dir-b-light.png) |
| chatHistory | [pair](chatHistory-1440-sysop-p4-white-dark.png) | [pair](chatHistory-1440-dir-b-light.png) | [pair](chatHistory-390-sysop-p4-white-dark.png) | [pair](chatHistory-390-dir-b-light.png) |

## Actual computed result

| Same instances, in each width/theme combination | Before | Actual after |
| --- | --- | --- |
| Matrix xs/sm/icon-xs/icon-sm, control Button/Input overrides: contract CSS | 8px | 6px |
| Same primitive matrix: dashboard CSS | 9px | 6px |
| Gallery Small/Copy/Copy id/Retry (two)/Refresh | 9px | 6px |
| Account Revoke/Connect Mail/Disconnect Calendar | 8px | 6px |
| Chat Load older messages | 8px | 6px |
| Panel override Button/Input/Card | 10px | 10px |
| Control override Card | 6px | 6px |
| Native small Select | 6px | 6px |
| Grouped small Button | 8px contract / 9px dashboard | unchanged |
| Deliberate panel-then-lg reverse-order example | 10px | 8px contract / 9px dashboard |

All entries above are uniform across four corners. The ten existing consumer-demo instances change in all four width/theme combinations (40 measured instance-state changes). Each primitive matrix adds seven changes per combination: six control cases and the deliberate last-argument example. These are measurements from this fixture, not a portfolio inventory or a new test gate.

The fixture uses source gallery views and built sibling packages; source snapshots are authoritative. Captures use Chromium 1243 from Playwright, reduced motion and disabled transitions. The first gallery crop shows its buttons row; other gallery actions are recorded in JSON even when below the screenshot crop. Themes: sysop-p4-white dark, dir-b light.
