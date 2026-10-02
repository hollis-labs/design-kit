# Matched radius evidence — refreshed after PR #48

Option A chosen by Chrispian 2026-10-02 (delegated). BEFORE is current main
`6e62a0f`; AFTER is that main merged into this PR plus the radius fix. Both
include kit-chat's shared cn migration. All 92 matched states (23 surfaces ×
1440/390 × sysop-p4-white dark/dir-b light) have zero browser errors in the final
capture. Raw [before](before.json) and [after](after.json) record identities,
classes and all four computed corners. These are review measurements, not a CI
count/source-agreement gate or a portfolio-wide inventory.

## Exact-set answer

**NOT identical to the prior ten consumer-demo instances.** The original ten
(gallery six, account access three, chat history one) remain exactly the same,
as do the seven changes in each primitive matrix. Added surfaces contribute
36 changed occurrences per cell: observe 11, chat cards 21 across open/locked/
failed-prompt states, composer four across ready/busy/disabled/suggestion states.
That is 46 consumer-demo occurrences per cell (184 over four cells), plus 56
primitive-matrix occurrences: **240 total**. State repetitions are not distinct
callsite counts. The additional controls represent 20 distinct fixture identities.
The Nanite observe controls and composer Send were already named in the initial
broader DOM-preview report; they were absent from the earlier narrow actual-source
capture. This refresh measures them using actual source and adds the other states.

Every added changed control is cause **(a)**: a Button size variant already
naming `rounded-control`, now rendering its declared 6px. No added change is
cause (b), an explicit alias passed by a component, or cause (c), another mechanism.
No added control ends at an off-token radius. Direct kit-chat cn containers and
panel radii remain unchanged in these fixtures; the helper migration adds no
other measured transition here.

## Intended differences and cause inventory

Cause (a) = Button size variant declaring rounded-control; (b) = explicit
rounded-control/panel passed by a component; (c) = anything else. Values below
are uniform at all four corners and identical across all four cells.

| Additional identity | Before → after | Cause | Primary callsite |
| --- | --- | --- | --- |
| Nanite Copy Embedding runtime state data | 9px → 6px | (a), sm | kit-observe DiagnosticPanel → design-components CopyButton |
| Nanite Retry Process health | 9px → 6px | (a), sm | kit-observe ObservationStatus |
| Nanite Retry Tracked processes | 9px → 6px | (a), sm | kit-observe ObservationStatus |
| Nanite Retry Execution duration | 9px → 6px | (a), sm | kit-observe ObservationStatus |
| Nanite Retry Embedding runtime state | 9px → 6px | (a), sm | kit-observe ObservationStatus |
| Tachyon Copy Plugin state data | 9px → 6px | (a), sm | kit-observe DiagnosticPanel → design-components CopyButton |
| Tachyon Retry Plugin health | 9px → 6px | (a), sm | kit-observe ObservationStatus |
| Tachyon Retry Loaded plugins | 9px → 6px | (a), sm | kit-observe ObservationStatus |
| Tachyon Retry Plugin state | 9px → 6px | (a), sm | kit-observe ObservationStatus |
| Artifact Dismiss | 8px → 6px | (a), xs | kit-chat ArtifactCard |
| Document action | 8px → 6px | (a), sm | Host-supplied DocumentCard actions slot in chat-review.tsx |
| Document section | 8px → 6px | (a), xs | Host-supplied DocumentCard navigation slot in chat-review.tsx |
| Prompt Decline | 8px → 6px | (a), sm | kit-chat PromptCard |
| Prompt Submit | 8px → 6px | (a), sm | kit-chat PromptCard |
| Confirmation Dismiss | 8px → 6px | (a), sm | kit-chat ConfirmationCard |
| Confirmation Approve | 8px → 6px | (a), sm | kit-chat ConfirmationCard |
| List Submit | 8px → 6px | (a), sm | kit-chat ListCard |
| Table Choose | 8px → 6px | (a), xs | kit-chat TableCard |
| Composer Send message | 8px → 6px | (a), sm | kit-chat ChatInput |
| Composer Stop response | 8px → 6px | (a), sm | kit-chat ChatInput |

Locked cards retain Artifact Dismiss and the two host-supplied document controls;
terminal Prompt/Confirmation/List/Table actions are absent. Failed-prompt capture
uses PromptCard's handled rejection; other responders resolve without inventing
persisted state. Ready, disabled and suggestion composers show Send; busy shows
Stop. No runtime transport or app is exercised.

## Matched images

Close-ups show every added identity, including Table Choose below the card viewport
crop and ChatInput Send/Stop. BEFORE is left, AFTER is right in every row.

| Added-control close-ups | 1440 dark | 1440 light | 390 dark | 390 light |
| --- | --- | --- | --- | --- |
| All 20 identities | [pair](new-controls-1440-sysop-p4-white-dark.png) | [pair](new-controls-1440-dir-b-light.png) | [pair](new-controls-390-sysop-p4-white-dark.png) | [pair](new-controls-390-dir-b-light.png) |

| Surface | Changes per cell | 1440 dark | 1440 light | 390 dark | 390 light |
| --- | --- | --- | --- | --- | --- |
| matrix | 7 | [pair](matrix-1440-sysop-p4-white-dark.png) | [pair](matrix-1440-dir-b-light.png) | [pair](matrix-390-sysop-p4-white-dark.png) | [pair](matrix-390-dir-b-light.png) |
| matrixDashboard | 7 | [pair](matrixDashboard-1440-sysop-p4-white-dark.png) | [pair](matrixDashboard-1440-dir-b-light.png) | [pair](matrixDashboard-390-sysop-p4-white-dark.png) | [pair](matrixDashboard-390-dir-b-light.png) |
| gallery | 6 | [pair](gallery-1440-sysop-p4-white-dark.png) | [pair](gallery-1440-dir-b-light.png) | [pair](gallery-390-sysop-p4-white-dark.png) | [pair](gallery-390-dir-b-light.png) |
| accountAccess | 3 | [pair](accountAccess-1440-sysop-p4-white-dark.png) | [pair](accountAccess-1440-dir-b-light.png) | [pair](accountAccess-390-sysop-p4-white-dark.png) | [pair](accountAccess-390-dir-b-light.png) |
| chatHistory | 1 | [pair](chatHistory-1440-sysop-p4-white-dark.png) | [pair](chatHistory-1440-dir-b-light.png) | [pair](chatHistory-390-sysop-p4-white-dark.png) | [pair](chatHistory-390-dir-b-light.png) |
| settings | 0 | [pair](settings-1440-sysop-p4-white-dark.png) | [pair](settings-1440-dir-b-light.png) | [pair](settings-390-sysop-p4-white-dark.png) | [pair](settings-390-dir-b-light.png) |
| settingsWizard | 0 | [pair](settingsWizard-1440-sysop-p4-white-dark.png) | [pair](settingsWizard-1440-dir-b-light.png) | [pair](settingsWizard-390-sysop-p4-white-dark.png) | [pair](settingsWizard-390-dir-b-light.png) |
| settingsConservative | 0 | [pair](settingsConservative-1440-sysop-p4-white-dark.png) | [pair](settingsConservative-1440-dir-b-light.png) | [pair](settingsConservative-390-sysop-p4-white-dark.png) | [pair](settingsConservative-390-dir-b-light.png) |
| observe | 1 | [pair](observe-1440-sysop-p4-white-dark.png) | [pair](observe-1440-dir-b-light.png) | [pair](observe-390-sysop-p4-white-dark.png) | [pair](observe-390-dir-b-light.png) |
| observeError | 5 | [pair](observeError-1440-sysop-p4-white-dark.png) | [pair](observeError-1440-dir-b-light.png) | [pair](observeError-390-sysop-p4-white-dark.png) | [pair](observeError-390-dir-b-light.png) |
| observeTachyon | 1 | [pair](observeTachyon-1440-sysop-p4-white-dark.png) | [pair](observeTachyon-1440-dir-b-light.png) | [pair](observeTachyon-390-sysop-p4-white-dark.png) | [pair](observeTachyon-390-dir-b-light.png) |
| observeTachyonError | 4 | [pair](observeTachyonError-1440-sysop-p4-white-dark.png) | [pair](observeTachyonError-1440-dir-b-light.png) | [pair](observeTachyonError-390-sysop-p4-white-dark.png) | [pair](observeTachyonError-390-dir-b-light.png) |
| chatCards | 9 | [pair](chatCards-1440-sysop-p4-white-dark.png) | [pair](chatCards-1440-dir-b-light.png) | [pair](chatCards-390-sysop-p4-white-dark.png) | [pair](chatCards-390-dir-b-light.png) |
| chatCardsLocked | 3 | [pair](chatCardsLocked-1440-sysop-p4-white-dark.png) | [pair](chatCardsLocked-1440-dir-b-light.png) | [pair](chatCardsLocked-390-sysop-p4-white-dark.png) | [pair](chatCardsLocked-390-dir-b-light.png) |
| chatCardsError | 9 | [pair](chatCardsError-1440-sysop-p4-white-dark.png) | [pair](chatCardsError-1440-dir-b-light.png) | [pair](chatCardsError-390-sysop-p4-white-dark.png) | [pair](chatCardsError-390-dir-b-light.png) |
| chatComposer | 1 | [pair](chatComposer-1440-sysop-p4-white-dark.png) | [pair](chatComposer-1440-dir-b-light.png) | [pair](chatComposer-390-sysop-p4-white-dark.png) | [pair](chatComposer-390-dir-b-light.png) |
| chatComposerBusy | 1 | [pair](chatComposerBusy-1440-sysop-p4-white-dark.png) | [pair](chatComposerBusy-1440-dir-b-light.png) | [pair](chatComposerBusy-390-sysop-p4-white-dark.png) | [pair](chatComposerBusy-390-dir-b-light.png) |
| chatComposerDisabled | 1 | [pair](chatComposerDisabled-1440-sysop-p4-white-dark.png) | [pair](chatComposerDisabled-1440-dir-b-light.png) | [pair](chatComposerDisabled-390-sysop-p4-white-dark.png) | [pair](chatComposerDisabled-390-dir-b-light.png) |
| chatComposerSuggestions | 1 | [pair](chatComposerSuggestions-1440-sysop-p4-white-dark.png) | [pair](chatComposerSuggestions-1440-dir-b-light.png) | [pair](chatComposerSuggestions-390-sysop-p4-white-dark.png) | [pair](chatComposerSuggestions-390-dir-b-light.png) |
| chatStream | 0 | [pair](chatStream-1440-sysop-p4-white-dark.png) | [pair](chatStream-1440-dir-b-light.png) | [pair](chatStream-390-sysop-p4-white-dark.png) | [pair](chatStream-390-dir-b-light.png) |
| chatStreamStalled | 0 | [pair](chatStreamStalled-1440-sysop-p4-white-dark.png) | [pair](chatStreamStalled-1440-dir-b-light.png) | [pair](chatStreamStalled-390-sysop-p4-white-dark.png) | [pair](chatStreamStalled-390-dir-b-light.png) |
| chatStreamError | 0 | [pair](chatStreamError-1440-sysop-p4-white-dark.png) | [pair](chatStreamError-1440-dir-b-light.png) | [pair](chatStreamError-390-sysop-p4-white-dark.png) | [pair](chatStreamError-390-dir-b-light.png) |
| chatMarkdown | 0 | [pair](chatMarkdown-1440-sysop-p4-white-dark.png) | [pair](chatMarkdown-1440-dir-b-light.png) | [pair](chatMarkdown-390-sysop-p4-white-dark.png) | [pair](chatMarkdown-390-dir-b-light.png) |

## Unchanged controls and matrix semantics

Panel Button/Input/Card overrides stay 10px; control Card stays 6px; native small
Select stays 6px; grouped small Button stays 8px contract / 9px dashboard.
Both matrices retain six 8px/9px → 6px control transitions and the deliberate
panel-then-lg last-argument example (10px → 8px contract / 9px dashboard).
Settings forms, setup-secret step and conservative pending state have zero
changes. Added chat stream message/card/marker, streaming/stalled/error and
markdown fixtures have zero changes. Fixture coverage is not a claim about
external app DOM or every possible caller-supplied class combination.

Capture recipe is in [radius-aliases.md](../radius-aliases.md). The close-up
collector and contact-sheet assembler are alongside the main review fixture.
They are manual evidence tools, not CI gates. Browser: Playwright Chromium 1243;
reduced motion, transitions disabled; fixed equal viewport crops for main pairs.
