# Theme migration step a — shared storage helpers

CW-20260911-0071. Baseline runtime sources: main 7407c98, before delegating the
kit wrapper. After: shared design-tokens storage helpers and the delegating
compatibility wrapper. The actual mixed-package theme gallery is rendered in
headless Chromium, with native scrollbar chrome enabled. Animations/transitions
are frozen for repeatable endpoint comparisons.

All ten built-ins × two modes plus four legacy dark palettes retain identical
computed palette values, rendered text/background/border styles and font sizes.
All 24 screenshot pairs are byte-identical; both runs have zero page errors.
The compatibility helper still reads/writes sysop.theme with the existing legacy
IDs and default. There is no CSS or palette change in this step.

| Theme/mode | Before | After |
| --- | --- | --- |
| nanite-default dark | [before](nanite-default-dark-before.png) | [after](nanite-default-dark-after.png) |
| nanite-default light | [before](nanite-default-light-before.png) | [after](nanite-default-light-after.png) |
| dir-a dark | [before](dir-a-dark-before.png) | [after](dir-a-dark-after.png) |
| dir-a light | [before](dir-a-light-before.png) | [after](dir-a-light-after.png) |
| dir-b dark | [before](dir-b-dark-before.png) | [after](dir-b-dark-after.png) |
| dir-b light | [before](dir-b-light-before.png) | [after](dir-b-light-after.png) |
| dir-d dark | [before](dir-d-dark-before.png) | [after](dir-d-dark-after.png) |
| dir-d light | [before](dir-d-light-before.png) | [after](dir-d-light-after.png) |
| dir-e dark | [before](dir-e-dark-before.png) | [after](dir-e-dark-after.png) |
| dir-e light | [before](dir-e-light-before.png) | [after](dir-e-light-after.png) |
| dir-f dark | [before](dir-f-dark-before.png) | [after](dir-f-dark-after.png) |
| dir-f light | [before](dir-f-light-before.png) | [after](dir-f-light-after.png) |
| sysop-p4-white dark | [before](sysop-p4-white-dark-before.png) | [after](sysop-p4-white-dark-after.png) |
| sysop-p4-white light | [before](sysop-p4-white-light-before.png) | [after](sysop-p4-white-light-after.png) |
| sysop-green-phosphor dark | [before](sysop-green-phosphor-dark-before.png) | [after](sysop-green-phosphor-dark-after.png) |
| sysop-green-phosphor light | [before](sysop-green-phosphor-light-before.png) | [after](sysop-green-phosphor-light-after.png) |
| sysop-amber-phosphor dark | [before](sysop-amber-phosphor-dark-before.png) | [after](sysop-amber-phosphor-dark-after.png) |
| sysop-amber-phosphor light | [before](sysop-amber-phosphor-light-before.png) | [after](sysop-amber-phosphor-light-after.png) |
| sysop-hi-contrast dark | [before](sysop-hi-contrast-dark-before.png) | [after](sysop-hi-contrast-dark-after.png) |
| sysop-hi-contrast light | [before](sysop-hi-contrast-light-before.png) | [after](sysop-hi-contrast-light-after.png) |
| p4-white dark | [before](p4-white-dark-before.png) | [after](p4-white-dark-after.png) |
| p1-green-phosphor dark | [before](p1-green-phosphor-dark-before.png) | [after](p1-green-phosphor-dark-after.png) |
| p3-amber-phosphor dark | [before](p3-amber-phosphor-dark-before.png) | [after](p3-amber-phosphor-dark-after.png) |
| hi-contrast dark | [before](hi-contrast-dark-before.png) | [after](hi-contrast-dark-after.png) |

Before/after JSON retain the measured variables and element styles. Shared
storage behavior is covered by function tests: valid/unknown ids, configurable
legacy key, null storage, blocked methods and a throwing localStorage getter.
The pre-existing kit theme tests still pass. This step does not migrate keys,
mode preferences, IDs, workflow vocabulary or palette CSS.
