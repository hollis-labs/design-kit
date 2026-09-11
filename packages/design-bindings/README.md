# @hollis-labs/design-bindings

The binding contract: **which component draws a wire kind, how the payload reaches
it, and at what trust.**

This is the fourth row of the portfolio's ownership table, and until now the one with
no owner:

| Concern | Owner |
|---|---|
| wire — type name, schema, validation, response payloads | `go-envelopes`; may never assert appearance |
| design — tokens, components, appearance | the design-kit packages; may never assert wire identity |
| behavior — resolver lease, draft custody, submit gates | the app |
| **binding — "this schema renders as these components"** | **here** |

Every app used to write the fourth one by hand. That is the drift mechanism N
consumers deep: Nanite writes one, Tangent writes another, and the two diverge
without either being wrong.

## What this ships, and the one thing it does not

- the row **shape** — `BindingRequest`, `Binding`
- the **generator contract** — `defineBindingTable`, `HostPolicy`
- the **resolver** — `resolve`
- **no table.** Not now, not later.

A binding names components in one host's module tree, so the table is **host-local by
construction** — which is precisely why `component:` was wrong in go-envelopes, and
is the structural reason this design can refuse override while still allowing
customisation.

Zero runtime dependencies. No React: this answers *which entry, with which payload
path, at which trust*, and the host renders.

## The shape

```ts
import {
  defineBindingTable, constantTrust, resolve,
  type BindingRequest,
} from '@hollis-labs/design-bindings'

// What a kit, a plugin, or your own generator DECLARES.
const rows: BindingRequest<MyKind>[] = [
  {
    kind: 'approval-card',
    version: '1.0',
    rendererId: 'approval',                                  // distinct from kind:
    rendererClass: 'react-component',                        //   one renderer, many kinds
    entry: 'components/ApprovalCard#ApprovalCard',           // module AND symbol, one field
    payload: { from: 'field', field: 'approval', as: 'approval' },
    requestedTrust: 'core-trusted',                          // a request, not a grant
    fallback: { kind: 'none' },
  },
]

// What YOU compose. The only source of a resolvable binding.
const table = defineBindingTable({
  contractDigest: CATALOG_DIGEST,
  inlinePayloadLimitBytes: 262_144,
  trust: constantTrust('core-trusted'),   // or a real policy — see below
  defaults: kitChatBindings,              // inert rows a kit offered
  rows,                                   // yours; beats a default for the same kind
})

// What you ask at render time. Never throws.
const r = resolve(table, envelope.kind)
if (r.ok) draw(r.binding)
else drawFallback(r.code, r.reason, r.fallbackRendererId)
```

### `payload` is the part that does real work

`entry` says *which* component. `payload` says *how the envelope reaches it*, and
without it a binding loses the field that encoded actual renderer behaviour
(go-envelopes' deleted `props`). The two ApprovalCard rows are why it is a field:

| kind | rendererId | payload |
|---|---|---|
| `approval-card` | `approval` | `{ from: 'field', field: 'approval', as: 'approval' }` |
| `subagent-spawn-approval` | `approval` | `{ from: 'data' }` |

Same renderer, two payload paths. A `Record<kind, string>` cannot express that pair.

## The generator contract

A host **generates** its rows; it does not hand-write a registry. A hand-written
registry is a second source of truth, and it is why Tangent needs two drift suites
today to keep its table and its boot path from diverging.

A generator emits `BindingRequest<K>[]` as data. It needs to satisfy four things:

1. **`kind` comes from the wire catalog**, not from the design layer. The design
   layer may never assert wire identity.
2. **`entry` is `"module/path#ExportedSymbol"`** — one field, so the module and the
   symbol cannot drift apart. Use `parseEntry` when loading.
3. **`requestedTrust` is a request.** Emit what the manifest asked for. Your
   `HostPolicy` decides what it gets.
4. **Emit no trust grant, no isolation, no state, and no digest.** Those are not
   yours; they are absent from the type, so the compiler agrees.

There is no registry here — no module-level state, no `register()`. A table is a
value you build and pass to `resolve`.

## Trust, in one paragraph

Trust is **requested** by the row and **granted** by your `HostPolicy`. Isolation is
**derived** from the grant and can never be declared. A refused claim is
**quarantined, never downgraded** — a renderer running at less privilege than it
asked for looks like success and is not. Six of the seven portfolio apps need none of
this today; they write `trust: constantTrust('core-trusted')` and never think about
it again. It is in the shape so that adding the dimension later is not a v2 migration
of every binding table in the portfolio, at the exact moment someone is first doing
something security-sensitive.

## A miss is a classification, never an exception

`resolve` does not throw, has no failure path, and always returns something you can
draw. A wire kind with no binding is the **normal** case — it is what a plugin looks
like before a host has decided to draw it.

| code | what happened | what the operator does |
|---|---|---|
| `unclassified` | nothing in this build classifies the kind | ship a row, or expect the kind |
| `unavailable` | classified; this build will not serve it | ask for a different workflow |
| `quarantined` | a trust claim was refused | review the claim — it was not downgraded |
| `ambiguous` | two rows in one tier declared it | declare one host row to settle it |

`fallbackRendererId` is **only ever a fallback that preserves meaning**. A declared
fallback that does not is recorded on the row and never offered, because degrading a
structured decision into something that cannot express it returns a success the user
acts on. `null` means draw the generic view: a titled view of the payload, naming the
kind, is sufficient and honest.

This pairs with go-envelopes' `TypeSupport`. `CheckSupport` asks at build time *"do I
have a policy for every type?"* and prevents surprise; `resolve` asks at runtime
*"can I draw this one?"* and handles it. You want both.

## The one rule, and why there is no lint rule for it

**A binding names a component identity, never an appearance value.**

There is no lint rule. There is nowhere to put one: every type is closed, there is no
index signature, no `options`/`meta`/`props` bag, and `payload` is a closed
discriminated union. A type that cannot hold a colour beats a rule that objects to
one — no CI step, nobody to remember it.

**If you are about to add an extensibility escape hatch, that is the failure mode
this package was shaped to prevent.** One `Record<string, unknown>` for "renderer
options" re-opens appearance to the design layer, and it will not look like a design
decision when it lands — it will look like a convenience. If a renderer needs
something, it comes through the payload, which belongs to the wire; if it is not in
the envelope, the host knows it, and the host is rendering.

The same closedness is what keeps a kit's rows inert — see below.

## For kit authors

A kit **may** ship default binding rows for the kinds it implements. That is what
makes a kit adoptable rather than a component grab-bag.

They are `BindingRequest`s, and they are inert by construction:

- the host-only fields are **absent** from the type, not optional, so you cannot
  declare your own trust and be silently ignored;
- nothing in this package consumes a request except a host's own
  `defineBindingTable`;
- there is no registry to install into;
- `Binding` and `BindingTable` are branded, so you cannot write the composed shape
  out by hand and export it as a table.

Export them as data and let hosts compose. A host passing your rows as `defaults` and
then declaring its own row for one kind is **not overriding you** — there is no
shared table to override.

## For CW-20260910-0129 (kit-chat's interactive cards)

Four things, since you consume this and have not read the design thread:

1. **You do not need an error boundary for the "unknown card" case.** `resolve` never
   throws and always classifies, so per-envelope isolation is the default rather than
   something you wrap. You still want a boundary around a card that throws *while
   rendering* — that is a different failure and it is yours.
2. **Do not collapse the four miss codes into "couldn't render".** They are four
   different operator actions; the table above is the copy you need.
3. **Ship your cards as `BindingRequest` defaults, not a registry.** A host composes
   them. See "For kit authors".
4. **`resolve` takes a plain `string` kind**, not your generated union — the unknown
   kind is the case it exists for.

## Toolchain

```bash
npm run typecheck    # tsc; also checks test/shape.test.ts's compile-error assertions
npm run test:run     # node --test
```

No test framework and no lint dependency: the tests use `node:test`, which ships with
Node. `test/shape.test.ts` is checked by **typecheck**, not by the runner — its
`@ts-expect-error` directives fail the build both if a defence is removed and if one
becomes unnecessary.
