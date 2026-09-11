# design-kit

`hollis-labs/design-kit` — the Hollis Labs frontend layering, in one monorepo.

Rebuilt so appearance has exactly one authority. **The one rule: a component may
name a token, never a value.** That covers scale as much as color — a component
reaching for `text-[13px]` is naming a value exactly as much as one reaching for
`#1a1b26`.

## The four layers

1. **headless behavior** — no appearance.
2. **token contract** — the names, and their types. A vocabulary, not values.
3. **theme** — the values, plus idiom extensions. The only layer that may name a color.
4. **components** — styled compositions of (1) referencing only (2).

Tokens come before components: a component authored with no token contract
available just relocates the drift somewhere harder to see.

## Packages

| Package | What |
|---|---|
| `packages/design-tokens` | the contract (names + types) + default values |
| `packages/design-components` | idiom-free base |
| `packages/design-app-runtime` | api client, hooks, router, storage, toast, status |
| `packages/kit-dashboard` | the dashboard idiom — forked whole from `@hollis-labs/sysop-ui` 0.9.0 |
| `packages/kit-chat` | chat input + stream, and the interactive card set |
| `packages/eslint-config-design` | the gate |

Only `kit-dashboard` has contents today. The other five are reserved and empty.

## Relationship to sysop-ui

`libs/sysop-ui` is **not** deprecated and has **not** moved. It stays published at
`@hollis-labs/sysop-ui` 0.9.0 serving its consumers. `design-kit` is a **fork**,
seeded by cloning it — so `packages/kit-dashboard` carries sysop-ui's real git
history, and nothing done here can break a live consumer. Each project migrates
onto design-kit later, in its own session.

## Commands

```bash
npm install        # installs all workspaces; builds kit-dashboard via its prepare script
npm run build      # every workspace with a build script
npm run typecheck
npm run lint
npm run test:run
npm run demo       # kit-dashboard's component gallery
```

A KIT is layers 3 + 1 bundled: which components exist and how pages lay out. That
is not a CSS concern and is not swappable by variables — which is why kits are
separate packages rather than themes.
