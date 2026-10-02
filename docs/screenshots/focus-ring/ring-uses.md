# Ring use audit — CW-20261002-0091

Baseline source: `ca8e087`. Read authored source before the built artifacts. Scan
covers every package, including all demos (design-components, kit-dashboard,
kit-chat, kit-settings, kit-observe, kit-code, kit-voice, kit-workflow and kit-admin).
The complete source / stylesheet matches are below, with baseline line numbers.

```sh
rg -n -g '*.{css,tsx,ts,jsx,js,mjs}' -g '!**/dist/**' -g '!**/node_modules/**' \
  -- '--(hl-|color-|theme-color-)?ring\b|ring-ring|border-ring|outline-ring' packages
```

Modern values are authored in design-tokens TypeScript (`ring` in every
mode of nanite.ts, sysop.ts and sysop-light.ts); CSS and legacy IDs are
generated from that source. The baseline scan below also includes generated
palette declarations, aliases and every focus/decorative use site. Kits with no
direct ring reference inherit the base Button/Input behavior. No chart uses
`ring`; workflow selection and connection SVG strokes do. Historical JSON class
receipts under package docs are measurement output, not active consumers; they
remain unchanged.

| Baseline location | Matched ring use | Disposition |
| --- | --- | --- |
| `packages/kit-chat/src/cards/artifact-card.tsx:34` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-workflow/src/styles/canvas.css:11` | `--color-ring` | Decoration: intentionally follows stronger `ring` in the three pairs; unchanged elsewhere. |
| `packages/kit-workflow/src/styles/canvas.css:13` | `--color-ring` | Decoration: intentionally follows stronger `ring` in the three pairs; unchanged elsewhere. |
| `packages/kit-workflow/src/styles/canvas.css:18` | `--color-ring` | Decoration: intentionally follows stronger `ring` in the three pairs; unchanged elsewhere. |
| `packages/kit-workflow/src/styles/canvas.css:22` | `--color-ring` | Decoration: intentionally follows stronger `ring` in the three pairs; unchanged elsewhere. |
| `packages/kit-workflow/src/styles/canvas.css:46` | `--color-ring` | Decoration: intentionally follows stronger `ring` in the three pairs; unchanged elsewhere. |
| `packages/kit-workflow/src/styles/canvas.css:76` | `--color-ring` | Keyboard focus: retains stronger `ring`. |
| `packages/kit-workflow/src/styles/canvas.css:85` | `--color-ring` | Decoration: intentionally follows stronger `ring` in the three pairs; unchanged elsewhere. |
| `packages/kit-workflow/src/styles/canvas.css:87` | `--color-ring` | Decoration: intentionally follows stronger `ring` in the three pairs; unchanged elsewhere. |
| `packages/kit-settings/src/settings.tsx:68` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-settings/src/settings.tsx:74` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-chat/src/components/chat-input.tsx:273` | `focus-within:border-ring` | Focus-within composer border; intentionally strengthens where the text field is focused. |
| `packages/kit-chat/src/components/attachment-dropzone.tsx:60` | `ring-ring` | Drag feedback: intentionally follows stronger `ring` in the three pairs. |
| `packages/kit-chat/src/components/artifact.tsx:185` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-chat/src/components/suggestion.tsx:18` | `focus-visible:outline-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-chat/src/components/inline-citation.tsx:64` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-components/src/components/theme-picker.tsx:18` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-components/src/components/ui/switch.tsx:27` | `focus-visible:border-ring`, `focus-visible:ring-ring/50` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-components/src/components/ui/textarea.tsx:20` | `focus-visible:border-ring`, `focus-visible:ring-ring/50` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-components/src/components/ui/input-group.tsx:25` | `input-group-control]:focus-visible]:border-ring`, `input-group-control]:focus-visible]:ring-ring/50` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-components/src/components/ui/input.tsx:22` | `focus-visible:border-ring`, `focus-visible:ring-ring/50` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-components/src/components/ui/badge.tsx:18` | `focus-visible:border-ring`, `focus-visible:ring-ring/50` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-components/src/components/ui/select.tsx:53` | `focus-visible:border-ring`, `focus-visible:ring-ring/50` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-components/src/components/ui/tabs.tsx:66` | `focus-visible:border-ring`, `focus-visible:outline-ring`, `focus-visible:ring-ring/50` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-components/src/components/ui/scroll-area.tsx:30` | `focus-visible:ring-ring/50` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-components/src/components/ui/button.tsx:17` | `focus-visible:border-ring`, `focus-visible:ring-ring/50` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-tokens/css/themes/dir-b.css:37` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/dir-b.css:88` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/sysop-amber-phosphor.css:37` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/sysop-amber-phosphor.css:88` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/sysop-hi-contrast.css:37` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/sysop-hi-contrast.css:88` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/dir-f.css:37` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/dir-f.css:88` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/dir-e.css:37` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/dir-e.css:88` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/sysop-p4-white.css:37` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/sysop-p4-white.css:88` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/sysop-green-phosphor.css:37` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/sysop-green-phosphor.css:88` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/dir-a.css:37` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/dir-a.css:88` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/nanite-default.css:37` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/nanite-default.css:88` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/dir-d.css:37` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes/dir-d.css:88` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/kit-dashboard/src/styles/legacy-themes.css:35` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/kit-dashboard/src/styles/legacy-themes.css:86` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/kit-dashboard/src/styles/legacy-themes.css:136` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/kit-dashboard/src/styles/legacy-themes.css:187` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/kit-dashboard/src/styles/legacy-themes.css:242` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/kit-dashboard/src/styles/legacy-themes.css:293` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/kit-dashboard/src/styles/legacy-themes.css:348` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/kit-dashboard/src/styles/legacy-themes.css:399` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/kit-dashboard/src/styles/legacy-themes.css:454` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/kit-dashboard/src/styles/legacy-themes.css:505` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:48` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:99` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:154` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:205` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:255` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:306` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:361` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:412` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:467` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:518` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:573` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:624` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:679` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:730` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:785` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:836` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:891` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:942` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:997` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:1048` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:1103` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/themes.css:1154` | `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/tokens.css:42` | `--color-ring`, `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/design-tokens/css/tokens.css:139` | `--color-ring`, `--hl-ring` | Generated token/mode value; strengthened `ring` in three canonical palette/mode pairs. |
| `packages/kit-dashboard/src/styles/theme.css:149` | `--hl-ring`, `--theme-color-ring` | Focus ring alias; updated canonical ring values. |
| `packages/kit-dashboard/src/styles/theme.css:150` | `--hl-ring`, `--theme-color-ring-soft` | General outline color: legacy alias remains mapped to `ring`; changes deliberately in the three pairs. |
| `packages/kit-dashboard/src/styles/theme.css:209` | `--theme-color-ring` | Compatibility alias to focus ring; no direct use of sidebar-ring classes found. |
| `packages/kit-dashboard/src/styles/theme.css:282` | `--theme-color-ring-soft` | General outline mapping: deliberately follows stronger `ring` in the three pairs. |
| `packages/kit-dashboard/src/styles/theme.css:338` | `ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-dashboard/src/styles/theme.css:354` | `--color-ring` | HUD text-field :focus indicator; stronger native click/keyboard focus. |
| `packages/kit-code/src/agent.tsx:108` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/design-components/src/components/ui/checkbox.tsx:22` | `focus-visible:border-ring`, `focus-visible:ring-ring/50` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-code/src/stack-trace.tsx:200` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-code/src/stack-trace.tsx:383` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-code/src/commit.tsx:66` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-code/src/file-tree.tsx:132` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-code/src/file-tree.tsx:144` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-code/src/file-tree.tsx:198` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-admin/src/admin.tsx:21` | `focus-visible:outline-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-chat/src/components/question.tsx:57` | `focus-visible:outline-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |
| `packages/kit-dashboard/src/components/data-table/data-table-row.tsx:51` | `focus-visible:ring-ring` | Keyboard focus: full-strength `ring`; native text-field click behavior retained. |

## Decorative appearance changes

The packed fixture uses the actual AttachmentDropzone dragging state, selected
React Flow edges and nodes, Node, Connection and Edge.Temporary components, and
a React Flow selection-marquee element. For all 14 IDs × both modes, compare
computed stroke, stroke width, border, outline, background and box shadow, plus
the four React Flow CSS mappings. General dashboard outline colors are included
in the pointer styles. The before/after receipts and verification summary are
linked from [the matrix](README.md). Decorative differences are intentional only in dir-a/dark, dir-e/light, and
sysop-p4-white/dark (also its p4-white legacy alias). All other theme/mode
styles must match. `ring-soft` remains retired; no token is added. Colors and
styles will be revisited in the later polishing session.

Historical evidence-only matches: `packages/design-components/docs/radius-evidence/before.json`
and `after.json`. They preserve earlier radius-task class strings and are not
runtime consumers.
