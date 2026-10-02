# @hollis-labs/kit-code

Private, unpublished workspace at `0.0.0`. This skeleton exports no components yet.

Planned main entry: plain CodeBlock, Snippet, FileTree, StackTrace, TestResults,
Commit and Agent. Highlighting will be opt-in under `/highlight` using one
host-owned Shiki core instance, shared structurally with `kit-chat/markdown`;
ANSI rendering will be opt-in under `/terminal` using ansi-to-react. Those
subpaths are not implemented in this skeleton. Main imports load neither peer.

Shiki (`^4.5.0`, MIT) and ansi-to-react (`^6.2.6`, BSD-3-Clause) are optional
peers and development dependencies. React, Base UI, Tailwind and workspace
siblings follow the existing kit conventions. No AI SDK or markdown dependency.

Planned disclosure components need the next design-components release (unreleased).
No version bump or publication is included. Import `@hollis-labs/kit-code/source.css`
when components land so Tailwind scans their shipped classes.

`test:run` temporarily uses `--passWithNoTests` for this empty skeleton; the first
feature PR adds behavior tests and removes that flag. MIT LICENSE applies to this
original skeleton; the first AI Elements port will append full Apache-2.0 terms.
