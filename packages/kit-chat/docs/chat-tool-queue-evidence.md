# Tool, Confirmation and Queue verification (CW-20261002-0044 C)

Chromium, React 19 and Base UI 1.3.0. The final browser run renders an archived
copy of source commit b1db0f1 with built sibling snapshots, while the worktree
runs its gates. It includes the phrasing title span and token-sized queue
button target and aria-expanded queue chevron. Merging PR B added exports/docs but changed no rendered C source. Screenshots cover all ten built-in
themes in light/dark modes plus accepted/rejected card content and 390px mobile.
Nothing was published; the ports need the next design-components release
(unreleased), because published 0.3.0 lacks Collapsible.

The browser receipt records visible queue actions before hover/focus, keyboard
Tool/Queue toggling and checked queue chevron rotation, keyboard activation of a host Queue action, a bounded native list
scrolling with End, host-supplied accepted/rejected messages within the existing
ConfirmationCard, resolved card actions hidden, reduced-motion transition
suppression and no mobile overflow or browser errors. The list-scroll probe adds
read-only DOM rows to the fixture to make it overflow, then reloads it.

Twenty new behavioral tests cover all seven Tool states, controlled disclosure,
host content, falsy results and unknown/circular JSON, subordinate confirmation
content, opaque action IDs, pending/failed/unrecognized/canceled locks, clear
errors for every Confirmation slot outside a card, and Queue composition/actions.
The existing cards.test.tsx is untouched (23 tests pass). No snapshot churn.

The main-entry optional-peer check uses a packed ChatStream-only consumer with
no installed Streamdown, no workspace links, a production Vite build and a
Chromium render. This checks imports/rendering, not styling.

Not checked: screen readers, other browser engines, model/provider execution,
production app integration or transports. Hosts own execution, queues and
recorded response state; these components do not create any of those systems.

[Browser receipt](chat-tool-queue-browser.json),
[screenshots](screenshots/chat-core-c),
[demo fixture](../demo/chat-tool-queue.tsx).

Theme captures wait for control color transitions to settle before saving.
A DOM inspection showed Base UI Trigger uses data-panel-open rather than the
upstream closed-state attribute. Queue's indicator now follows aria-expanded;
the browser verifies -90deg when closed and 0deg when open.

[Packed consumer receipt](chat-tool-queue-consumer.json) uses source 5998008,
before the final queue class correction. That correction changes no imports or
optional-peer boundary. The packed siblings include unreleased source; this is
not a registry 0.3.0 compatibility claim.
