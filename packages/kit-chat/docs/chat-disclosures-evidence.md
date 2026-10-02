# Chat disclosures verification (CW-20261002-0044 B)

Chromium with React 19, Base UI 1.3.0, workspace-built siblings and Tailwind 4.
This checks source that **needs the next design-components release**; the
published design-components 0.3.0 lacks Collapsible. Nothing was published.

[Browser receipt](chat-disclosures-browser.json) records the twenty light/dark
captures across all ten built-in themes, linked trigger/panel controls, Enter and
Space toggling of all four disclosures, one real link plus non-link provenance,
reduced-motion transition suppression and no horizontal overflow at 390px.
Screenshots live in [screenshots/chat-core-b](screenshots/chat-core-b).

Seven behavioral tests cover controlled ChainOfThought/Reasoning, one-time
stream completion close, explicit default collapse, user collapse during streaming, one automatic-open
request per streaming run when a controlled host declines, host-rendered reasoning,
non-link sources and Plan render composition/host actions. No tests are skipped.

The browser fixture is [chat-disclosures.tsx](../demo/chat-disclosures.tsx).
This does not cover screen readers, other browser engines, app migrations or
production transports. Streaming timer behavior is tested with fake timers;
the visual fixture is a completed transcript, not a live model stream.

A scratch consumer installed packed kit-chat, design-components, design-tokens
and design-bindings, plus required peers, with no workspace links. Its entry
imported only ChatStream and rendered plain React content. Production Vite build
and Chromium render passed with no page errors, with **no installed Streamdown**.
This verifies the optional-peer boundary, not consumer styling. The packed
siblings include unreleased source; it is not a registry 0.3.0 compatibility claim.
[Consumer receipt](chat-disclosures-consumer.json).

The collapse regression was proven failing-first against PR B head 0c0b86c:
6 tests ran, 5 passed and the new collapse test failed (expected aria-expanded
false after clicking; received true). After changing auto-open to trigger once
per streaming run, all seven disclosure tests pass. The correction also replaces
the Sources trigger paragraph with phrasing-content span.
