# Legacy → contract comparison, before migration

CW-20260911-0071 split c: measured against the actual compiled kit stylesheet, before any palette replacement. Chromium resolves each variable through background-color. Both sides use dark mode. Every contract color and kit palette/derived role is listed; rgb/rgba use 0–255 sRGB channels, alpha 0–1. Oklab/Oklch values retain Chromium’s computed-space representation. A missing variable is marked undefined (rather than the transparent probe fallback). These are value comparisons, not claims that every difference is visible.

**Visible changes exist. The final palette PR must remain open for Chrispian’s visual decision, even when CI is green.** Legacy light mode is newly enabled by the canonical alias; legacy IDs and storage remain compatible.

## p4-white → sysop-p4-white

| Variable | Legacy resolved value | Contract resolved value | Identical |
| --- | --- | --- | --- |
| --hl-bg | rgb(9, 9, 11) | rgb(9, 9, 11) | yes |
| --hl-bg-elevated | rgb(24, 24, 27) | rgb(24, 24, 27) | yes |
| --hl-surface | rgb(24, 24, 27) | rgb(24, 24, 27) | yes |
| --hl-surface-hover | rgb(24, 24, 27) | rgb(24, 24, 27) | yes |
| --hl-surface-active | undefined | rgb(57, 57, 60) | no |
| --hl-fg | rgb(244, 244, 245) | rgb(244, 244, 245) | yes |
| --hl-fg-secondary | rgb(212, 212, 216) | rgb(212, 212, 216) | yes |
| --hl-fg-muted | rgb(161, 161, 170) | rgb(161, 161, 170) | yes |
| --hl-fg-faint | rgb(113, 113, 122) | rgb(131, 131, 139) | no |
| --hl-border | rgba(39, 39, 42, 0.8) | rgb(39, 39, 42) | no |
| --hl-border-subtle | rgb(39, 39, 42) | rgba(39, 39, 42, 0.8) | no |
| --hl-divider | rgba(39, 39, 42, 0.7) | rgba(39, 39, 42, 0.7) | yes |
| --hl-primary | rgb(228, 228, 231) | rgb(228, 228, 231) | yes |
| --hl-primary-hover | undefined | rgb(231, 231, 234) | no |
| --hl-primary-active | undefined | rgb(201, 201, 203) | no |
| --hl-primary-muted | undefined | rgba(228, 228, 231, 0.12) | no |
| --hl-primary-fg | rgb(9, 9, 11) | rgb(0, 0, 0) | no |
| --hl-brand | rgb(228, 228, 231) | rgb(228, 228, 231) | yes |
| --hl-brand-hover | rgb(228, 228, 231) | rgb(231, 231, 234) | no |
| --hl-brand-active | rgb(228, 228, 231) | rgb(201, 201, 203) | no |
| --hl-brand-muted | rgb(228, 228, 231) | rgba(228, 228, 231, 0.12) | no |
| --hl-brand-fg | rgb(9, 9, 11) | rgb(0, 0, 0) | no |
| --hl-selection | rgb(24, 24, 27) | rgb(24, 24, 27) | yes |
| --hl-selection-fg | rgb(244, 244, 245) | rgb(244, 244, 245) | yes |
| --hl-ring | rgba(63, 63, 70, 0.6) | rgba(63, 63, 70, 0.6) | yes |
| --hl-danger | rgb(251, 113, 133) | rgb(251, 117, 136) | no |
| --hl-danger-hover | undefined | rgb(250, 132, 149) | no |
| --hl-danger-muted | rgba(253, 164, 175, 0.8) | color(srgb 0.984314 0.458824 0.533333 / 0.1) | no |
| --hl-danger-fg | undefined | rgb(0, 0, 0) | no |
| --hl-warning | rgb(245, 158, 11) | rgb(245, 158, 11) | yes |
| --hl-warning-muted | undefined | rgba(245, 158, 11, 0.12) | no |
| --hl-warning-fg | undefined | rgb(0, 0, 0) | no |
| --hl-success | rgb(52, 211, 153) | rgb(52, 211, 153) | yes |
| --hl-success-muted | undefined | rgba(52, 211, 153, 0.12) | no |
| --hl-success-fg | undefined | rgb(0, 0, 0) | no |
| --hl-info | rgb(96, 165, 250) | rgb(96, 165, 250) | yes |
| --hl-info-muted | undefined | rgba(96, 165, 250, 0.12) | no |
| --hl-info-fg | undefined | rgb(0, 0, 0) | no |
| --hl-chart-1 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-2 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-3 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-4 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-5 | undefined | rgb(255, 0, 255) | no |
| --hl-syntax-key | rgb(244, 244, 245) | rgb(244, 244, 245) | yes |
| --hl-syntax-string | oklab(0.863486 0.00126756 -0.00425588) | oklab(0.878718 0.00114542 -0.0038058) | no |
| --hl-syntax-number | oklab(0.759544 0.00211723 -0.00725906) | oklab(0.790007 0.00187296 -0.00635889) | no |
| --hl-syntax-boolean | oklab(0.655602 0.0029669 -0.0102622) | oklab(0.701297 0.00260049 -0.00891198) | no |
| --hl-syntax-null | rgb(113, 113, 122) | rgb(131, 131, 139) | no |
| --theme-color-bg | rgb(9, 9, 11) | rgb(9, 9, 11) | yes |
| --theme-color-panel | rgb(9, 9, 11) | rgb(9, 9, 11) | yes |
| --theme-color-panel-2 | rgb(24, 24, 27) | rgb(24, 24, 27) | yes |
| --theme-color-panel-overlay | rgb(20, 20, 22) | rgb(24, 24, 27) | no |
| --theme-color-panel-overlay-strong | rgb(21, 21, 24) | rgb(57, 57, 60) | no |
| --theme-color-panel-hover | rgb(24, 24, 27) | rgb(24, 24, 27) | yes |
| --theme-color-panel-hover-soft | rgb(15, 15, 17) | rgb(24, 24, 27) | no |
| --theme-color-border | rgb(39, 39, 42) | rgb(39, 39, 42) | yes |
| --theme-color-border-soft | rgba(39, 39, 42, 0.7) | rgba(39, 39, 42, 0.8) | no |
| --theme-color-border-strong | rgba(39, 39, 42, 0.8) | rgb(39, 39, 42) | no |
| --theme-color-text | rgb(244, 244, 245) | rgb(244, 244, 245) | yes |
| --theme-color-text-muted | rgb(212, 212, 216) | rgb(212, 212, 216) | yes |
| --theme-color-text-soft | rgb(161, 161, 170) | rgb(161, 161, 170) | yes |
| --theme-color-text-subtle | rgb(113, 113, 122) | rgb(131, 131, 139) | no |
| --theme-color-accent | rgb(228, 228, 231) | rgb(228, 228, 231) | yes |
| --theme-color-accent-foreground | rgb(9, 9, 11) | rgb(0, 0, 0) | no |
| --theme-color-danger | rgb(251, 113, 133) | rgb(251, 117, 136) | no |
| --theme-color-danger-soft | rgba(253, 164, 175, 0.8) | rgb(251, 117, 136) | no |
| --theme-color-warning | rgb(245, 158, 11) | rgb(245, 158, 11) | yes |
| --theme-color-ring | rgba(63, 63, 70, 0.6) | rgba(63, 63, 70, 0.6) | yes |
| --theme-color-ring-soft | rgba(63, 63, 70, 0.5) | rgba(63, 63, 70, 0.6) | no |
| --theme-color-overlay | rgba(0, 0, 0, 0.7) | rgba(0, 0, 0, 0.7) | yes |
| --theme-color-shadow | rgba(0, 0, 0, 0.1) | rgba(0, 0, 0, 0.1) | yes |
| --theme-color-shadow-strong | rgba(0, 0, 0, 0.2) | rgba(0, 0, 0, 0.2) | yes |
| --theme-color-status-backlog | rgb(148, 163, 184) | rgb(161, 161, 170) | no |
| --theme-color-status-todo | rgb(161, 161, 170) | rgb(212, 212, 216) | no |
| --theme-color-status-queued | rgb(251, 191, 36) | rgb(245, 158, 11) | no |
| --theme-color-status-doing | rgb(96, 165, 250) | rgb(96, 165, 250) | yes |
| --theme-color-status-review | rgb(167, 139, 250) | rgb(228, 228, 231) | no |
| --theme-color-status-done | rgb(52, 211, 153) | rgb(52, 211, 153) | yes |
| --theme-color-status-blocked | rgb(248, 113, 113) | rgb(251, 117, 136) | no |
| --theme-color-status-paused | rgb(250, 204, 21) | rgb(245, 158, 11) | no |
| --theme-color-status-archived | rgb(82, 82, 91) | rgb(161, 161, 170) | no |
| --theme-color-status-inbox | rgb(251, 191, 36) | rgb(245, 158, 11) | no |
| --theme-color-status-routed | rgb(96, 165, 250) | rgb(96, 165, 250) | yes |
| --theme-color-status-indexed | rgb(52, 211, 153) | rgb(52, 211, 153) | yes |
| --theme-color-status-backlog-label | oklab(0.81337 -0.0046289 -0.0210031) | oklab(0.814057 0.00233472 -0.00795133) | no |
| --theme-color-status-todo-label | oklab(0.814057 0.00233472 -0.00795133) | oklab(0.909633 0.00110824 -0.00363011) | no |
| --theme-color-status-queued-label | oklab(0.889089 0.00976875 0.0976914) | oklab(0.848128 0.0338478 0.0923893) | no |
| --theme-color-status-doing-label | oklab(0.815207 -0.0226256 -0.0834406) | oklab(0.815207 -0.0226256 -0.0834406) | yes |
| --theme-color-status-review-label | oklab(0.812346 0.0383294 -0.088043) | oklab(0.938805 0.000872093 -0.0028114) | no |
| --theme-color-status-done-label | oklab(0.850734 -0.0879847 0.026088) | oklab(0.850734 -0.0879847 0.026088) | yes |
| --theme-color-status-blocked-label | oklab(0.81335 0.0924714 0.0372012) | oklab(0.822154 0.0959656 0.0221813) | no |
| --theme-color-status-paused-label | oklab(0.903308 -0.00331614 0.103314) | oklab(0.848128 0.0338478 0.0923893) | no |
| --theme-color-status-archived-label | oklab(0.678364 0.00238614 -0.0082947) | oklab(0.826838 0.00217498 -0.00739311) | no |
| --theme-color-status-inbox-label | oklab(0.889089 0.00976875 0.0976914) | oklab(0.848128 0.0338478 0.0923893) | no |
| --theme-color-status-routed-label | oklab(0.815207 -0.0226256 -0.0834406) | oklab(0.815207 -0.0226256 -0.0834406) | yes |
| --theme-color-status-indexed-label | oklab(0.850734 -0.0879847 0.026088) | oklab(0.850734 -0.0879847 0.026088) | yes |
| --theme-color-priority-p1-bg | oklab(0.266135 0.0347826 0.0105351) | oklab(0.269363 0.0360638 0.00502781) | no |
| --theme-color-priority-p2-bg | oklab(0.293906 0.00445833 0.0327148) | oklab(0.278887 0.0132873 0.0307707) | no |

## p1-green-phosphor → sysop-green-phosphor

| Variable | Legacy resolved value | Contract resolved value | Identical |
| --- | --- | --- | --- |
| --hl-bg | rgb(10, 10, 10) | rgb(10, 10, 10) | yes |
| --hl-bg-elevated | rgb(18, 26, 20) | rgb(18, 26, 20) | yes |
| --hl-surface | rgb(18, 26, 20) | rgb(18, 26, 20) | yes |
| --hl-surface-hover | rgb(22, 34, 25) | rgb(22, 34, 25) | yes |
| --hl-surface-active | undefined | rgb(19, 67, 37) | no |
| --hl-fg | rgb(0, 255, 102) | rgb(0, 255, 102) | yes |
| --hl-fg-secondary | rgb(102, 255, 170) | rgb(102, 255, 170) | yes |
| --hl-fg-muted | rgb(93, 214, 138) | rgb(93, 214, 138) | yes |
| --hl-fg-faint | rgb(58, 140, 92) | rgb(53, 149, 93) | no |
| --hl-border | rgba(82, 153, 101, 0.7) | rgb(38, 74, 47) | no |
| --hl-border-subtle | rgb(38, 74, 47) | rgba(82, 153, 101, 0.7) | no |
| --hl-divider | rgba(64, 108, 75, 0.6) | rgba(64, 108, 75, 0.6) | yes |
| --hl-primary | rgb(102, 255, 170) | rgb(102, 255, 170) | yes |
| --hl-primary-hover | undefined | rgb(120, 255, 180) | no |
| --hl-primary-active | undefined | rgb(90, 224, 150) | no |
| --hl-primary-muted | undefined | rgba(102, 255, 170, 0.12) | no |
| --hl-primary-fg | rgb(10, 10, 10) | rgb(0, 0, 0) | no |
| --hl-brand | rgb(102, 255, 170) | rgb(102, 255, 170) | yes |
| --hl-brand-hover | rgb(102, 255, 170) | rgb(120, 255, 180) | no |
| --hl-brand-active | rgb(102, 255, 170) | rgb(90, 224, 150) | no |
| --hl-brand-muted | rgb(102, 255, 170) | rgba(102, 255, 170, 0.12) | no |
| --hl-brand-fg | rgb(10, 10, 10) | rgb(0, 0, 0) | no |
| --hl-selection | rgb(18, 26, 20) | rgb(18, 26, 20) | yes |
| --hl-selection-fg | rgb(0, 255, 102) | rgb(0, 255, 102) | yes |
| --hl-ring | rgba(102, 255, 170, 0.58) | rgba(102, 255, 170, 0.58) | yes |
| --hl-danger | rgb(255, 184, 77) | rgb(255, 184, 77) | yes |
| --hl-danger-hover | undefined | rgb(255, 193, 98) | no |
| --hl-danger-muted | rgba(255, 184, 77, 0.82) | rgba(255, 184, 77, 0.12) | no |
| --hl-danger-fg | undefined | rgb(0, 0, 0) | no |
| --hl-warning | rgb(255, 212, 102) | rgb(255, 212, 102) | yes |
| --hl-warning-muted | undefined | rgba(255, 212, 102, 0.12) | no |
| --hl-warning-fg | undefined | rgb(0, 0, 0) | no |
| --hl-success | rgb(102, 255, 170) | rgb(102, 255, 170) | yes |
| --hl-success-muted | undefined | rgba(102, 255, 170, 0.12) | no |
| --hl-success-fg | undefined | rgb(0, 0, 0) | no |
| --hl-info | rgb(0, 204, 85) | rgb(0, 204, 85) | yes |
| --hl-info-muted | undefined | rgba(0, 204, 85, 0.12) | no |
| --hl-info-fg | undefined | rgb(0, 0, 0) | no |
| --hl-chart-1 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-2 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-3 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-4 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-5 | undefined | rgb(255, 0, 255) | no |
| --hl-syntax-key | rgb(0, 255, 102) | rgb(0, 255, 102) | yes |
| --hl-syntax-string | oklab(0.797888 -0.186139 0.113832) | oklab(0.803532 -0.189273 0.115747) | no |
| --hl-syntax-number | oklab(0.724017 -0.157167 0.0913128) | oklab(0.735304 -0.163435 0.0951436) | no |
| --hl-syntax-boolean | oklab(0.650146 -0.128195 0.068794) | oklab(0.667076 -0.137597 0.0745402) | no |
| --hl-syntax-null | rgb(58, 140, 92) | rgb(53, 149, 93) | no |
| --theme-color-bg | rgb(10, 10, 10) | rgb(10, 10, 10) | yes |
| --theme-color-panel | rgb(15, 20, 16) | rgb(10, 10, 10) | no |
| --theme-color-panel-2 | rgb(18, 26, 20) | rgb(18, 26, 20) | yes |
| --theme-color-panel-overlay | rgb(17, 24, 18) | rgb(18, 26, 20) | no |
| --theme-color-panel-overlay-strong | rgb(20, 30, 22) | rgb(19, 67, 37) | no |
| --theme-color-panel-hover | rgb(22, 34, 25) | rgb(22, 34, 25) | yes |
| --theme-color-panel-hover-soft | rgb(19, 28, 21) | rgb(18, 26, 20) | no |
| --theme-color-border | rgb(38, 74, 47) | rgb(38, 74, 47) | yes |
| --theme-color-border-soft | rgba(64, 108, 75, 0.6) | rgba(82, 153, 101, 0.7) | no |
| --theme-color-border-strong | rgba(82, 153, 101, 0.7) | rgb(38, 74, 47) | no |
| --theme-color-text | rgb(0, 255, 102) | rgb(0, 255, 102) | yes |
| --theme-color-text-muted | rgb(102, 255, 170) | rgb(102, 255, 170) | yes |
| --theme-color-text-soft | rgb(93, 214, 138) | rgb(93, 214, 138) | yes |
| --theme-color-text-subtle | rgb(58, 140, 92) | rgb(53, 149, 93) | no |
| --theme-color-accent | rgb(102, 255, 170) | rgb(102, 255, 170) | yes |
| --theme-color-accent-foreground | rgb(10, 10, 10) | rgb(0, 0, 0) | no |
| --theme-color-danger | rgb(255, 184, 77) | rgb(255, 184, 77) | yes |
| --theme-color-danger-soft | rgba(255, 184, 77, 0.82) | rgb(255, 184, 77) | no |
| --theme-color-warning | rgb(255, 212, 102) | rgb(255, 212, 102) | yes |
| --theme-color-ring | rgba(102, 255, 170, 0.58) | rgba(102, 255, 170, 0.58) | yes |
| --theme-color-ring-soft | rgba(102, 255, 170, 0.42) | rgba(102, 255, 170, 0.58) | no |
| --theme-color-overlay | rgba(0, 0, 0, 0.78) | rgba(0, 0, 0, 0.7) | no |
| --theme-color-shadow | rgba(0, 0, 0, 0.28) | rgba(0, 0, 0, 0.1) | no |
| --theme-color-shadow-strong | rgba(0, 0, 0, 0.48) | rgba(0, 0, 0, 0.2) | no |
| --theme-color-status-backlog | rgb(84, 120, 98) | rgb(93, 214, 138) | no |
| --theme-color-status-todo | rgb(102, 153, 119) | rgb(102, 255, 170) | no |
| --theme-color-status-queued | rgb(51, 255, 136) | rgb(255, 212, 102) | no |
| --theme-color-status-doing | rgb(0, 204, 85) | rgb(0, 204, 85) | yes |
| --theme-color-status-review | rgb(102, 255, 170) | rgb(102, 255, 170) | yes |
| --theme-color-status-done | rgb(102, 255, 170) | rgb(102, 255, 170) | yes |
| --theme-color-status-blocked | rgb(255, 184, 77) | rgb(255, 184, 77) | yes |
| --theme-color-status-paused | rgb(255, 212, 102) | rgb(255, 212, 102) | yes |
| --theme-color-status-archived | rgb(49, 78, 60) | rgb(93, 214, 138) | no |
| --theme-color-status-inbox | rgb(51, 255, 136) | rgb(255, 212, 102) | no |
| --theme-color-status-routed | rgb(0, 204, 85) | rgb(0, 204, 85) | yes |
| --theme-color-status-indexed | rgb(0, 136, 51) | rgb(102, 255, 170) | no |
| --theme-color-status-backlog-label | oklab(0.671931 -0.115653 0.0669782) | oklab(0.821438 -0.168718 0.0960651) | no |
| --theme-color-status-todo-label | oklab(0.730942 -0.126624 0.0738559) | oklab(0.886916 -0.182563 0.0981027) | no |
| --theme-color-status-queued-label | oklab(0.876711 -0.203139 0.118214) | oklab(0.880377 -0.0831454 0.136302) | no |
| --theme-color-status-doing-label | oklab(0.791158 -0.194033 0.12108) | oklab(0.791158 -0.194033 0.12108) | yes |
| --theme-color-status-review-label | oklab(0.886916 -0.182563 0.0981027) | oklab(0.886916 -0.182563 0.0981027) | yes |
| --theme-color-status-done-label | oklab(0.886916 -0.182563 0.0981027) | oklab(0.886916 -0.182563 0.0981027) | yes |
| --theme-color-status-blocked-label | oklab(0.847013 -0.0622505 0.138435) | oklab(0.847013 -0.0622505 0.138435) | yes |
| --theme-color-status-paused-label | oklab(0.880377 -0.0831454 0.136302) | oklab(0.880377 -0.0831454 0.136302) | yes |
| --theme-color-status-archived-label | oklab(0.609579 -0.120188 0.0716235) | oklab(0.825632 -0.172584 0.0994222) | no |
| --theme-color-status-inbox-label | oklab(0.876711 -0.203139 0.118214) | oklab(0.880377 -0.0831454 0.136302) | no |
| --theme-color-status-routed-label | oklab(0.791158 -0.194033 0.12108) | oklab(0.791158 -0.194033 0.12108) | yes |
| --theme-color-status-indexed-label | oklab(0.676555 -0.166862 0.105638) | oklab(0.886916 -0.182563 0.0981027) | no |
| --theme-color-priority-p1-bg | oklab(0.295647 0.00872953 0.0307637) | oklab(0.295647 0.00872953 0.0307637) | yes |
| --theme-color-priority-p2-bg | oklab(0.306537 -0.0429296 0.0233492) | oklab(0.307881 0.00106805 0.0299816) | no |

## p3-amber-phosphor → sysop-amber-phosphor

| Variable | Legacy resolved value | Contract resolved value | Identical |
| --- | --- | --- | --- |
| --hl-bg | rgb(10, 10, 10) | rgb(10, 10, 10) | yes |
| --hl-bg-elevated | rgb(28, 22, 14) | rgb(28, 22, 14) | yes |
| --hl-surface | rgb(28, 22, 14) | rgb(28, 22, 14) | yes |
| --hl-surface-hover | rgb(36, 28, 17) | rgb(36, 28, 17) | yes |
| --hl-surface-active | undefined | rgb(69, 50, 14) | no |
| --hl-fg | rgb(255, 176, 0) | rgb(255, 176, 0) | yes |
| --hl-fg-secondary | rgb(255, 208, 96) | rgb(255, 208, 96) | yes |
| --hl-fg-muted | rgb(232, 172, 72) | rgb(232, 172, 72) | yes |
| --hl-fg-faint | rgb(153, 112, 36) | rgb(170, 123, 30) | no |
| --hl-border | rgba(160, 122, 52, 0.74) | rgb(86, 65, 26) | no |
| --hl-border-subtle | rgb(86, 65, 26) | rgba(160, 122, 52, 0.74) | no |
| --hl-divider | rgba(110, 84, 36, 0.62) | rgba(110, 84, 36, 0.62) | yes |
| --hl-primary | rgb(255, 208, 96) | rgb(255, 208, 96) | yes |
| --hl-primary-hover | undefined | rgb(255, 214, 115) | no |
| --hl-primary-active | undefined | rgb(224, 183, 84) | no |
| --hl-primary-muted | undefined | rgba(255, 208, 96, 0.12) | no |
| --hl-primary-fg | rgb(10, 10, 10) | rgb(0, 0, 0) | no |
| --hl-brand | rgb(255, 208, 96) | rgb(255, 208, 96) | yes |
| --hl-brand-hover | rgb(255, 208, 96) | rgb(255, 214, 115) | no |
| --hl-brand-active | rgb(255, 208, 96) | rgb(224, 183, 84) | no |
| --hl-brand-muted | rgb(255, 208, 96) | rgba(255, 208, 96, 0.12) | no |
| --hl-brand-fg | rgb(10, 10, 10) | rgb(0, 0, 0) | no |
| --hl-selection | rgb(28, 22, 14) | rgb(28, 22, 14) | yes |
| --hl-selection-fg | rgb(255, 176, 0) | rgb(255, 176, 0) | yes |
| --hl-ring | rgba(255, 208, 96, 0.56) | rgba(255, 208, 96, 0.56) | yes |
| --hl-danger | rgb(255, 110, 78) | rgb(255, 118, 69) | no |
| --hl-danger-hover | undefined | rgb(255, 125, 61) | no |
| --hl-danger-muted | rgba(255, 110, 78, 0.84) | color(srgb 1 0.462745 0.270588 / 0.1) | no |
| --hl-danger-fg | undefined | rgb(0, 0, 0) | no |
| --hl-warning | rgb(255, 208, 96) | rgb(255, 208, 96) | yes |
| --hl-warning-muted | undefined | rgba(255, 208, 96, 0.12) | no |
| --hl-warning-fg | undefined | rgb(0, 0, 0) | no |
| --hl-success | rgb(255, 208, 96) | rgb(255, 208, 96) | yes |
| --hl-success-muted | undefined | rgba(255, 208, 96, 0.12) | no |
| --hl-success-fg | undefined | rgb(0, 0, 0) | no |
| --hl-info | rgb(255, 176, 0) | rgb(255, 176, 0) | yes |
| --hl-info-muted | undefined | rgba(255, 176, 0, 0.12) | no |
| --hl-info-fg | undefined | rgb(0, 0, 0) | no |
| --hl-chart-1 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-2 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-3 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-4 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-5 | undefined | rgb(255, 0, 255) | no |
| --hl-syntax-key | rgb(255, 176, 0) | rgb(255, 176, 0) | yes |
| --hl-syntax-string | oklab(0.752549 0.0351206 0.149686) | oklab(0.762988 0.0356316 0.153116) | no |
| --hl-syntax-number | oklab(0.692675 0.030114 0.133768) | oklab(0.713552 0.0311359 0.140629) | no |
| --hl-syntax-boolean | oklab(0.6328 0.0251074 0.117851) | oklab(0.664116 0.0266402 0.128141) | no |
| --hl-syntax-null | rgb(153, 112, 36) | rgb(170, 123, 30) | no |
| --theme-color-bg | rgb(10, 10, 10) | rgb(10, 10, 10) | yes |
| --theme-color-panel | rgb(20, 16, 10) | rgb(10, 10, 10) | no |
| --theme-color-panel-2 | rgb(28, 22, 14) | rgb(28, 22, 14) | yes |
| --theme-color-panel-overlay | rgb(24, 19, 12) | rgb(28, 22, 14) | no |
| --theme-color-panel-overlay-strong | rgb(31, 24, 15) | rgb(69, 50, 14) | no |
| --theme-color-panel-hover | rgb(36, 28, 17) | rgb(36, 28, 17) | yes |
| --theme-color-panel-hover-soft | rgb(24, 19, 12) | rgb(28, 22, 14) | no |
| --theme-color-border | rgb(86, 65, 26) | rgb(86, 65, 26) | yes |
| --theme-color-border-soft | rgba(110, 84, 36, 0.62) | rgba(160, 122, 52, 0.74) | no |
| --theme-color-border-strong | rgba(160, 122, 52, 0.74) | rgb(86, 65, 26) | no |
| --theme-color-text | rgb(255, 176, 0) | rgb(255, 176, 0) | yes |
| --theme-color-text-muted | rgb(255, 208, 96) | rgb(255, 208, 96) | yes |
| --theme-color-text-soft | rgb(232, 172, 72) | rgb(232, 172, 72) | yes |
| --theme-color-text-subtle | rgb(153, 112, 36) | rgb(170, 123, 30) | no |
| --theme-color-accent | rgb(255, 208, 96) | rgb(255, 208, 96) | yes |
| --theme-color-accent-foreground | rgb(10, 10, 10) | rgb(0, 0, 0) | no |
| --theme-color-danger | rgb(255, 110, 78) | rgb(255, 118, 69) | no |
| --theme-color-danger-soft | rgba(255, 110, 78, 0.84) | rgb(255, 118, 69) | no |
| --theme-color-warning | rgb(255, 208, 96) | rgb(255, 208, 96) | yes |
| --theme-color-ring | rgba(255, 208, 96, 0.56) | rgba(255, 208, 96, 0.56) | yes |
| --theme-color-ring-soft | rgba(255, 208, 96, 0.4) | rgba(255, 208, 96, 0.56) | no |
| --theme-color-overlay | rgba(0, 0, 0, 0.78) | rgba(0, 0, 0, 0.7) | no |
| --theme-color-shadow | rgba(0, 0, 0, 0.28) | rgba(0, 0, 0, 0.1) | no |
| --theme-color-shadow-strong | rgba(0, 0, 0, 0.48) | rgba(0, 0, 0, 0.2) | no |
| --theme-color-status-backlog | rgb(133, 110, 74) | rgb(232, 172, 72) | no |
| --theme-color-status-todo | rgb(173, 132, 58) | rgb(255, 208, 96) | no |
| --theme-color-status-queued | rgb(255, 208, 96) | rgb(255, 208, 96) | yes |
| --theme-color-status-doing | rgb(255, 176, 0) | rgb(255, 176, 0) | yes |
| --theme-color-status-review | rgb(255, 228, 163) | rgb(255, 208, 96) | no |
| --theme-color-status-done | rgb(255, 208, 96) | rgb(255, 208, 96) | yes |
| --theme-color-status-blocked | rgb(255, 110, 78) | rgb(255, 118, 69) | no |
| --theme-color-status-paused | rgb(255, 236, 163) | rgb(255, 208, 96) | no |
| --theme-color-status-archived | rgb(92, 74, 47) | rgb(232, 172, 72) | no |
| --theme-color-status-inbox | rgb(255, 208, 96) | rgb(255, 208, 96) | yes |
| --theme-color-status-routed | rgb(255, 176, 0) | rgb(255, 176, 0) | yes |
| --theme-color-status-indexed | rgb(96, 165, 250) | rgb(255, 208, 96) | no |
| --theme-color-status-backlog-label | oklab(0.655821 0.0232518 0.100836) | oklab(0.794637 0.0340832 0.144721) | no |
| --theme-color-status-todo-label | oklab(0.708131 0.0272542 0.127679) | oklab(0.851608 0.0214011 0.1495) | no |
| --theme-color-status-queued-label | oklab(0.851608 0.0214011 0.1495) | oklab(0.851608 0.0214011 0.1495) | yes |
| --theme-color-status-doing-label | oklab(0.812423 0.0401273 0.165604) | oklab(0.812423 0.0401273 0.165604) | yes |
| --theme-color-status-review-label | oklab(0.880662 0.0179156 0.118639) | oklab(0.851608 0.0214011 0.1495) | no |
| --theme-color-status-done-label | oklab(0.851608 0.0214011 0.1495) | oklab(0.851608 0.0214011 0.1495) | yes |
| --theme-color-status-blocked-label | oklab(0.751594 0.107496 0.127827) | oklab(0.757519 0.0988989 0.134667) | no |
| --theme-color-status-paused-label | oklab(0.890099 0.0108894 0.122323) | oklab(0.851608 0.0214011 0.1495) | no |
| --theme-color-status-archived-label | oklab(0.59701 0.0239367 0.100003) | oklab(0.796119 0.0345869 0.146461) | no |
| --theme-color-status-inbox-label | oklab(0.851608 0.0214011 0.1495) | oklab(0.851608 0.0214011 0.1495) | yes |
| --theme-color-status-routed-label | oklab(0.812423 0.0401273 0.165604) | oklab(0.812423 0.0401273 0.165604) | yes |
| --theme-color-status-indexed-label | oklab(0.753205 -0.00674182 -0.016698) | oklab(0.851608 0.0214011 0.1495) | no |
| --theme-color-priority-p1-bg | oklab(0.269363 0.0335351 0.0225836) | oklab(0.271535 0.0303828 0.0250917) | no |
| --theme-color-priority-p2-bg | oklab(0.306035 0.00196689 0.0305304) | oklab(0.306035 0.00196689 0.0305304) | yes |

## hi-contrast → sysop-hi-contrast

| Variable | Legacy resolved value | Contract resolved value | Identical |
| --- | --- | --- | --- |
| --hl-bg | rgb(0, 0, 0) | rgb(0, 0, 0) | yes |
| --hl-bg-elevated | rgb(18, 18, 18) | rgb(18, 18, 18) | yes |
| --hl-surface | rgb(18, 18, 18) | rgb(18, 18, 18) | yes |
| --hl-surface-hover | rgb(24, 24, 24) | rgb(24, 24, 24) | yes |
| --hl-surface-active | undefined | rgb(59, 59, 59) | no |
| --hl-fg | rgb(255, 255, 255) | rgb(255, 255, 255) | yes |
| --hl-fg-secondary | rgb(255, 255, 255) | rgb(255, 255, 255) | yes |
| --hl-fg-muted | rgb(235, 235, 235) | rgb(235, 235, 235) | yes |
| --hl-fg-faint | rgb(208, 208, 208) | rgb(208, 208, 208) | yes |
| --hl-border | rgba(255, 255, 255, 0.88) | rgb(255, 255, 255) | no |
| --hl-border-subtle | rgb(255, 255, 255) | rgba(255, 255, 255, 0.88) | no |
| --hl-divider | rgba(255, 255, 255, 0.72) | rgba(255, 255, 255, 0.72) | yes |
| --hl-primary | rgb(255, 255, 0) | rgb(255, 255, 0) | yes |
| --hl-primary-hover | undefined | rgb(255, 255, 31) | no |
| --hl-primary-active | undefined | rgb(224, 224, 0) | no |
| --hl-primary-muted | undefined | rgba(255, 255, 0, 0.12) | no |
| --hl-primary-fg | rgb(0, 0, 0) | rgb(0, 0, 0) | yes |
| --hl-brand | rgb(255, 255, 0) | rgb(255, 255, 0) | yes |
| --hl-brand-hover | rgb(255, 255, 0) | rgb(255, 255, 31) | no |
| --hl-brand-active | rgb(255, 255, 0) | rgb(224, 224, 0) | no |
| --hl-brand-muted | rgb(255, 255, 0) | rgba(255, 255, 0, 0.12) | no |
| --hl-brand-fg | rgb(0, 0, 0) | rgb(0, 0, 0) | yes |
| --hl-selection | rgb(18, 18, 18) | rgb(18, 18, 18) | yes |
| --hl-selection-fg | rgb(255, 255, 255) | rgb(255, 255, 255) | yes |
| --hl-ring | rgba(255, 255, 0, 0.84) | rgba(255, 255, 0, 0.84) | yes |
| --hl-danger | rgb(255, 59, 48) | rgb(255, 100, 91) | no |
| --hl-danger-hover | undefined | rgb(255, 119, 111) | no |
| --hl-danger-muted | rgba(255, 59, 48, 0.9) | color(srgb 1 0.392157 0.356863 / 0.1) | no |
| --hl-danger-fg | undefined | rgb(0, 0, 0) | no |
| --hl-warning | rgb(255, 255, 0) | rgb(255, 255, 0) | yes |
| --hl-warning-muted | undefined | rgba(255, 255, 0, 0.12) | no |
| --hl-warning-fg | undefined | rgb(0, 0, 0) | no |
| --hl-success | rgb(0, 255, 0) | rgb(0, 255, 0) | yes |
| --hl-success-muted | undefined | rgba(0, 255, 0, 0.12) | no |
| --hl-success-fg | undefined | rgb(0, 0, 0) | no |
| --hl-info | rgb(0, 255, 255) | rgb(0, 255, 255) | yes |
| --hl-info-muted | undefined | rgba(0, 255, 255, 0.12) | no |
| --hl-info-fg | undefined | rgb(0, 0, 0) | no |
| --hl-chart-1 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-2 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-3 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-4 | undefined | rgb(255, 0, 255) | no |
| --hl-chart-5 | undefined | rgb(255, 0, 255) | no |
| --hl-syntax-key | rgb(255, 255, 255) | rgb(255, 255, 255) | yes |
| --hl-syntax-string | oklab(0.964395 0.0000439584 0.0000193566) | rgb(243, 243, 243) | no |
| --hl-syntax-number | oklab(0.928797 0.0000423491 0.0000186265) | rgb(231, 231, 231) | no |
| --hl-syntax-boolean | oklab(0.893198 0.0000407398 0.0000178963) | rgb(220, 220, 220) | no |
| --hl-syntax-null | rgb(208, 208, 208) | rgb(208, 208, 208) | yes |
| --theme-color-bg | rgb(0, 0, 0) | rgb(0, 0, 0) | yes |
| --theme-color-panel | rgb(10, 10, 10) | rgb(0, 0, 0) | no |
| --theme-color-panel-2 | rgb(18, 18, 18) | rgb(18, 18, 18) | yes |
| --theme-color-panel-overlay | rgb(6, 6, 6) | rgb(18, 18, 18) | no |
| --theme-color-panel-overlay-strong | rgb(20, 20, 20) | rgb(59, 59, 59) | no |
| --theme-color-panel-hover | rgb(24, 24, 24) | rgb(24, 24, 24) | yes |
| --theme-color-panel-hover-soft | rgb(16, 16, 16) | rgb(18, 18, 18) | no |
| --theme-color-border | rgb(255, 255, 255) | rgb(255, 255, 255) | yes |
| --theme-color-border-soft | rgba(255, 255, 255, 0.72) | rgba(255, 255, 255, 0.88) | no |
| --theme-color-border-strong | rgba(255, 255, 255, 0.88) | rgb(255, 255, 255) | no |
| --theme-color-text | rgb(255, 255, 255) | rgb(255, 255, 255) | yes |
| --theme-color-text-muted | rgb(255, 255, 255) | rgb(255, 255, 255) | yes |
| --theme-color-text-soft | rgb(235, 235, 235) | rgb(235, 235, 235) | yes |
| --theme-color-text-subtle | rgb(208, 208, 208) | rgb(208, 208, 208) | yes |
| --theme-color-accent | rgb(255, 255, 0) | rgb(255, 255, 0) | yes |
| --theme-color-accent-foreground | rgb(0, 0, 0) | rgb(0, 0, 0) | yes |
| --theme-color-danger | rgb(255, 59, 48) | rgb(255, 100, 91) | no |
| --theme-color-danger-soft | rgba(255, 59, 48, 0.9) | rgb(255, 100, 91) | no |
| --theme-color-warning | rgb(255, 255, 0) | rgb(255, 255, 0) | yes |
| --theme-color-ring | rgba(255, 255, 0, 0.84) | rgba(255, 255, 0, 0.84) | yes |
| --theme-color-ring-soft | rgba(255, 255, 255, 0.68) | rgba(255, 255, 0, 0.84) | no |
| --theme-color-overlay | rgba(0, 0, 0, 0.88) | rgba(0, 0, 0, 0.7) | no |
| --theme-color-shadow | rgba(0, 0, 0, 0.36) | rgba(0, 0, 0, 0.1) | no |
| --theme-color-shadow-strong | rgba(0, 0, 0, 0.6) | rgba(0, 0, 0, 0.2) | no |
| --theme-color-status-backlog | rgb(255, 255, 255) | rgb(235, 235, 235) | no |
| --theme-color-status-todo | rgb(208, 208, 208) | rgb(255, 255, 255) | no |
| --theme-color-status-queued | rgb(255, 255, 0) | rgb(255, 255, 0) | yes |
| --theme-color-status-doing | rgb(0, 255, 255) | rgb(0, 255, 255) | yes |
| --theme-color-status-review | rgb(255, 0, 255) | rgb(255, 255, 0) | no |
| --theme-color-status-done | rgb(0, 255, 0) | rgb(0, 255, 0) | yes |
| --theme-color-status-blocked | rgb(255, 59, 48) | rgb(255, 100, 91) | no |
| --theme-color-status-paused | rgb(255, 255, 0) | rgb(255, 255, 0) | yes |
| --theme-color-status-archived | rgb(160, 160, 160) | rgb(235, 235, 235) | no |
| --theme-color-status-inbox | rgb(255, 255, 0) | rgb(255, 255, 0) | yes |
| --theme-color-status-routed | rgb(0, 255, 255) | rgb(0, 255, 255) | yes |
| --theme-color-status-indexed | rgb(0, 255, 0) | rgb(0, 255, 0) | yes |
| --theme-color-status-backlog-label | oklab(0.999994 0.0000455678 0.0000200868) | oklab(0.964036 0.0000439227 0.0000193357) | no |
| --theme-color-status-todo-label | oklab(0.914558 0.0000417054 0.0000183344) | oklab(0.999994 0.0000455678 0.0000200868) | no |
| --theme-color-status-queued-label | oklab(0.980787 -0.0427737 0.119155) | oklab(0.980787 -0.0427737 0.119155) | yes |
| --theme-color-status-doing-label | oklab(0.94323 -0.0896237 -0.0236213) | oklab(0.94323 -0.0896237 -0.0236213) | yes |
| --theme-color-status-review-label | oklab(0.820999 0.164775 -0.101471) | oklab(0.980787 -0.0427737 0.119155) | no |
| --theme-color-status-done-label | oklab(0.919858 -0.140286 0.107709) | oklab(0.919858 -0.140286 0.107709) | yes |
| --theme-color-status-blocked-label | oklab(0.792532 0.122248 0.0668154) | oklab(0.820099 0.102479 0.0510673) | no |
| --theme-color-status-paused-label | oklab(0.980787 -0.0427737 0.119155) | oklab(0.980787 -0.0427737 0.119155) | yes |
| --theme-color-status-archived-label | oklab(0.838161 0.0000381425 0.0000168085) | oklab(0.967033 0.0000440598 0.0000193983) | no |
| --theme-color-status-inbox-label | oklab(0.980787 -0.0427737 0.119155) | oklab(0.980787 -0.0427737 0.119155) | yes |
| --theme-color-status-routed-label | oklab(0.94323 -0.0896237 -0.0236213) | oklab(0.94323 -0.0896237 -0.0236213) | yes |
| --theme-color-status-indexed-label | oklab(0.919858 -0.140286 0.107709) | oklab(0.919858 -0.140286 0.107709) | yes |
| --theme-color-priority-p1-bg | oklab(0.143929 0.0448175 0.024496) | oklab(0.154037 0.037569 0.0187217) | no |
| --theme-color-priority-p2-bg | oklab(0.212956 -0.0156904 0.0436871) | oklab(0.212956 -0.0156904 0.0436871) | yes |
