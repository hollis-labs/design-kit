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
package directory was landed up front, deliberately, so contributors
working on disjoint packages never touch a shared file. **Add files inside your
own package.**

**Do not edit a root-level file.** The whole parallel plan rests on the skeleton
being complete and stable: `package.json`, `tsconfig.json`, `.gitignore`,
`.npmrc`, `.github/workflows/ci.yml` and this file are shared, and two changes
touching one is exactly the collision the up-front skeleton exists to prevent. If
you need a root file changed, say so in the pull request or an issue and let a
maintainer make the change, rather than changing it alongside unrelated work.

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
node .github/scripts/design-rules-gate.mjs
```

The first four run across every workspace that defines the script. The last is the
one rule enforced over every package, `demo/` files included, and it must report
zero. CI runs it as its own step after the build, and it is **not** an npm script, so
a green run of the first four does not cover it. Run it from the repo root with the
packages built, before you push.
