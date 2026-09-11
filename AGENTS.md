# design-kit

One monorepo for the Hollis Labs frontend layering. `README.md` has the package
table and the four layers; read it first.

## The one rule

**A component may name a token, never a value.** It covers **scale** as much as
color — `text-[13px]` is naming a value exactly as much as `#1a1b26` is. The only
layer permitted to name a color is the theme layer.

## Start here

- `docs/` — repo-level design docs. `docs/token-contract.md` is the document
  everything else depends on.
- `packages/design-tokens` — the contract. Nothing styled should land before it.
- `packages/kit-dashboard` — the fork of sysop-ui, whole. It has its own
  `AGENTS.md` covering its export/bundle contract, which still applies.

## Layout

This repo is npm workspaces, `packages/*`. Every root-level file and every
package directory was landed up front, deliberately, so concurrent sessions
working on disjoint packages never touch a shared file. **Add files inside your
own package.** If a root file needs to change, say so rather than changing it
under someone else.

`tsconfig.json` at the root is the base config packages extend. Package-specific
`include`, `types`, `baseUrl` and `paths` stay in the package's own tsconfig —
`paths` resolve relative to the file that declares them, so they cannot be
hoisted.

## Boundaries

`libs/sysop-ui` is a **frozen, read-only source**. It stays where it is and stays
published at 0.9.0. Read it freely; write nothing to it. `design-kit` is a fork,
not a rename, so `packages/kit-dashboard` already carries its history.

The five reserved packages are `private: true` at `0.0.0` so an empty package
cannot reach npm by accident. Publishing is a deliberate, separate step.

Ownership, and who may assert what:

| Concern | Owner |
|---|---|
| wire — type name, schema, validation, compat, response payloads | `go-envelopes`; may never assert appearance |
| design — tokens, components, appearance | these packages; may never assert wire identity |
| behavior — resolver lease, draft custody, submit gates | the app |
| binding — "this schema renders as these components" | missing today; that is the drift mechanism |

## Commands

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

Each runs across every workspace that defines the script.
