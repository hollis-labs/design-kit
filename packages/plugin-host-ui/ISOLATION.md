# Optional frame contract

`@hollis-labs/plugin-host-ui/isolation` exports pure closed bridge parsers,
a mount state machine, bounded invocation receipts, window binding checks,
reverse-order cleanup and the typed frame CSP builder. It has no runtime peers.
Core and React call the structural `PluginFrameController` on the host adapter;
they do not import this entry. The host must supply a reviewed controller to make
sandboxed component views available. Declarative controls remain parent-rendered.

This contract does not create frames, import executable bytes or prove browser
containment. The host controller owns document delivery, verified-byte execution,
live owner/mount leases, navigation fencing and DOM/resource cleanup. Its
`isCurrent` must reject a revoked mount or stale effective app setting. Its mount
surface publishes loading, ready or failed explicitly, and must fence failures
before reporting them. Core checks registry adoption and controller currency
before mounting and rechecks on registry/controller notifications. Controller
notifications also advance the host snapshot so retained view bodies re-render.

## Wire shapes

Port messages are JSON strings. Window bootstrap messages are closed structured
objects and may only bind the channel. The envelope is
`{bridge_version:1,frame_id,nonce,seq,type}`. The nonce is a 32-byte cryptographic
value encoded as 64 lowercase hexadecimal characters; it binds the mount and is
not a credential. Port sequences are positive safe integers increasing per
sender. A `bound` acknowledgement precedes the single `init`.

Nested DTOs have these exact fields:

| DTO | Fields |
| --- | --- |
| Artifact | `id`, `kind` (`module` or `style`), `sha256` (64 lowercase hex characters), `base64` (verified bytes) |
| Import | `specifier` (approved bare module name), `artifact` (module artifact ID) |
| Binding | `id` (opaque host name), `intent` (closed command/navigate/modal descriptor) |
| Success outcome | `status: success` |
| Refused outcome | `status: refused`, `reason`, optional `action_reason`, optional bounded redacted `text` |
| Interrupted outcome | `status: cancelled`, `timeout` or `unknown-outcome` |
| Failure | `code` from the exported `FAILURE_CODES`, including `policy-unavailable` |

The exported schema and reason tables and accepted message trees are deeply
frozen. No duplicate/prototype keys, unknown fields, null optional fields,
nonfinite numbers, non-JSON values or service/handler action tags are admitted.
Import rows reject relative or URL specifiers and must reference inventory
modules. Actual bytes/digests and module graph approval remain the host's
verification responsibility; a syntactically correct digest is not proof.

The state machine intersects actual initialized export names with host-reviewed
requested names before adoption, then admits a single mount. It admits no calls
until ready. The host pins authority outside messages and must check owner,
registry/source/target leases, app scope, invocation and effective mode revision
at dispatch. `dispatchBoundAction` uses only the host's `actions.bindings` resolver
for component sources; it cannot impersonate a declarative source. Ordinary
`dispatchAction` retains the validated host projection descriptor path for either
representation. A component without either reviewed path has no action authority. The resolved
intent must match the request and is rechecked after asynchronous validation.
Target argument/effect/capability and caller checks still use the existing host
adapter. No second gateway or registry exists here.

## Bounds and receipts

The exported package bounds may be tightened by the host: control/context 64 KiB,
init 32 MiB, each raw artifact 8 MiB, aggregate raw artifacts 16 MiB, JSON depth 32,
32 outstanding calls, 20 invocations/second with burst 40, call deadline 30 seconds,
handshake deadline 10 seconds and disposal drain 2 seconds. Repeated rejected
invocations fence a flooding channel. Cancellation uses its own parser/rate budget.
The host must schedule `checkHandshake`/`expired`, abort adapter requests and
release resources; the pure session does not own clocks or ports.

`dispatchBoundAction` accepts a host-only execution observer, called after
validation immediately before the effect adapter starts. It can return false to
fence an expired/cancelled call. The frame never supplies this function. Use it to
call `markExecuting` at the actual effect boundary.
`interrupt` returns cancelled/timeout before that point and unknown-outcome after
it. A definitive host/backend receipt remains authoritative; interruptions cannot
undo committed effects and must never trigger an automatic retry. The host sends
one terminal result, fences late results, and cancels stale work before replacing
scope/context. Unknown result IDs are ignored; duplicate invocation IDs revoke.

The CSP builder accepts only a fixed bootstrap hash and a separate per-document
nonce, and refuses directive injection as policy-unavailable. A frame policy
cannot relax its inherited parent policy. No browser enforcement is claimed by
these parser/DOM tests. Self-navigation may cause network egress before a host
observes it and revokes the channel; this contract promises no universal egress or
CPU/memory containment. Main-origin components have ambient document authority.
