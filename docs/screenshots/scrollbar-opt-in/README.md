# Opt-in scrollbar proof — CW-20260912-0031

Actual built dashboard StatusBadge/PriorityBadge rows, compiled demo CSS and
headless Chromium with Playwright's hide-scrollbars flag removed. Every frame
shows the unchanged default, the opt-in region and explicit no-scrollbar override.
Each region was scrolled in both axes before capture. Before, all bars are hidden;
after, only the opt-in region has visible bars. Native thin-bar dimensions follow
the platform; WebKit fallback uses spacing/radius tokens.

Computed styles and scroll positions for all 24 states are in before.json and
after.json. Default styles are identical; explicit suppression, viewport size and
scrolling stay unchanged. The opt-in resolves contract fg-muted in each palette
and mode. The visible central bar is the deliberate appearance change for
Chrispian's review (CW-20261001-0526).

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

Decision: keep the opt-in beside kit-dashboard's suppression policy. Do not port
Nanite's chat-scroll/provider-scroll names: they only repeat suppression, and their
app meanings do not survive extraction. No app changes or base-package policy.
Mode adaptation comes from contract colors, not duplicated raw color literals.
