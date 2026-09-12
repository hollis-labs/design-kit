# @hollis-labs/eslint-config-design

**The one rule: a component may name a token, never a value.**

It covers **scale as much as color**. `text-[13px]` names a value exactly as much
as `#1a1b26` does — and scale is the larger half by roughly seventy to one
(1,783 arbitrary-value utilities against 24 component-level hex literals).

Why a gate rather than a guideline: every number in the drift measurement is that
guideline being ignored by someone who meant well. And because Chrispian chose to
**extend** Tailwind's type scale rather than close it, `text-[13px]` stays
representable — so lint is not a backstop to the type scale, it is **the
enforcement mechanism for it**.

## The rules

| Rule | Catches | Autofix |
|---|---|---|
| `no-color-literal` | `#1a1b26`, `rgba(…)`, `color-mix(…)`, `text-[#abc123]`, `bg-[rebeccapurple]` | no |
| `no-raw-palette-utility` | `text-zinc-500`, `bg-slate-800`, `border-neutral-700` | no |
| `no-arbitrary-scale` | `text-[13px]`, `rounded-[4px]`, `tracking-[.18em]` | yes, when the value restates a named step |
| `no-undefined-token` | `bg-bg-surface`, `bg-status-running` — names that render nothing | no |
| `no-idiom-shadowing-contract` | `--color-chat-primary`, `bg-dash-fg-muted` (contract §9.3.2) | no |
| `require-disable-reason` | disabling a `design/*` rule without saying why | no |

### `no-undefined-token` is the strongest of them

Four invented token names are live in production across both codebases, at 16 use
sites, every one rendering **no color at all**, every one plausible, every one past
review: `status-running`, `status-info`, `bg-bg-surface`, `warning-fg`. A hex
literal at least renders something; an invented token renders nothing.

It works by **membership testing**, never structural parsing. That is not a style
preference — it is the only thing that separates these two:

```
bg-bg-elevated    bg- + bg-elevated    REAL     (2 uses in Nanite)
bg-bg-surface     bg- + bg-surface     INVENTED (3 uses in Nanite)
```

They differ by one segment. A parser that strips the utility prefix and assumes one
segment remains reports both as invented — and `bg-mode-default` too. Membership in
the declared vocabulary has no such failure mode.

The rule is also deliberately conservative about *what* it judges: a name is only a
candidate when its **family** is one the vocabulary declares, so `text-center`,
`text-sm` and `border-2` are never candidates. The trade is explicit — a family the
vocabulary does not declare at all is invisible to the rule. `bg-status-running` is
caught when the repo's vocabulary includes its own `status-*` idiom tokens, which it
should, since a repo lints against what it declares. `extraFamilies` covers the rest.

A **retired** name reports differently from an invented one, because
`border-strong` renders correctly today and calling that "renders nothing" would be
false. Retirements come from the vocabulary's `DEPRECATED_TOKENS` map and the
message names the replacement.

## The vocabulary is not in this package

The contract makes TypeScript the single source and generates the CSS from it. A
hardcoded copy of the token names here would be a **third list** that drifts from
the two the contract just unified, and the drift would be invisible — the rule would
report a real token as undefined, or miss an invented one.

So the vocabulary is injected, `@hollis-labs/design-tokens` is the default source,
and if it cannot be resolved this config **throws rather than falling back**. A lint
config that silently substitutes a stale vocabulary fails a build for the wrong
reason; one that refuses to load tells you what to fix.

**`@hollis-labs/design-tokens` is therefore a `peerDependency`, and npm 7+ installs
it for you** — so `npm i -D @hollis-labs/eslint-config-design` is the whole install
and the first lint run works. Declaring it was CW-20260910-0131's call at publish:
*not shipping a copy of the token list* and *not admitting the package is required*
are two different decisions, and only the first one had been made. Not shipping the
list is right; leaving it out of the manifest was not.

If you pass your own vocabulary you never touch the default path, and
`design-tokens` — no React, no dependencies — just sits there unused:

```js
designConfig({ vocabulary: myVocabulary })
```

> **Resolved.** `@hollis-labs/design-tokens` (d995bd6) exports `TEXT_SCALE`,
> `RADIUS_SCALE` and `TRACKING_SCALE` as name→value maps, plus
> `INHERITED_TEXT_STEPS` / `INHERITED_RADIUS_STEPS` / `INHERITED_TRACKING_STEPS`.
> `CONTRACT_STEP_VALUES` is gone — this package no longer restates any part of the
> contract. The `TW_*` tables in `src/tailwind.js` are a fallback for a consumer
> running these rules with no tokens package at all, not a source of truth.
>
> **Closing the type scale is now one array.** A scale table passed in options
> **replaces** the default rather than merging with it, so withdrawing
> `INHERITED_TEXT_STEPS` from what `design-tokens` exports makes every arbitrary
> value that used to restate a Tailwind step become an off-scale error, with no edit
> to these rules. Pinned by `no-arbitrary-scale (scale closed)` in the tests.

## Usage

```js
// eslint.config.js
import { designConfig } from '@hollis-labs/eslint-config-design'

export default [
  ...(await designConfig()),
]
```

`designConfig` is async because it resolves the vocabulary. ESLint 9 accepts a
promise from a flat config file.

```js
await designConfig({
  vocabulary,                    // pre-built; omit to resolve from design-tokens
  files: ['src/**/*.{ts,tsx}'],
  themeFiles: [...],             // layer 3 — exempt from the color rules
  chartFiles: [],                // see below; empty by default
  severity: 'error',
  ignoreTokens: [],
})
```

## Two exemptions, and why one is much narrower than the other

**Build output is never linted.** `**/dist/**`, `**/build/**`, `**/*.d.ts` and
`**/coverage/**` are ignored, because linting generated files reports the
generator's choices as the author's — it caught a `PLACEHOLDER_CHART_COLOR` literal
in a `design-tokens` `.d.ts`, which is a true statement about a generated file and a
useless finding. This lives in the shared config rather than in one repo's CI, so a
consumer that builds to `dist` does not have to rediscover it.

**The theme layer is exempt from the color rules, and this is load-bearing.**
Layer 3 is the only layer permitted to name a color. Without the exemption, Nanite
reports **627 errors in `lib/theme/`** and gets recorded as the portfolio's worst
offender — when all 627 are correct. Verified: 0 errors there with the exemption on.

**Chart configs are a separate, opt-in, empty-by-default carve-out.** A charting
library needs real color strings, and `chart-1..5` currently ships as names with
placeholder values. But "chart config" is a far narrower claim than "theme file" and
it must not be smuggled in under the theme exemption — so it is its own option, it
defaults to `[]`, and it only silences `no-color-literal`. A chart file still may
not invent a token name or write an arbitrary type size. **Prefer the JS accessor
the contract specifies (§3.6, §10) over widening this.** The two real cases today
are `kit-dashboard/widgets/time-series-chart.tsx` (1 `rgba`) and Nanite's chart
configs.

## The escape hatch

A genuine one-off should be legible, not invisible:

```ts
// eslint-disable-next-line design/no-arbitrary-scale -- optical centering against a fixed-height row
<div className="pt-[7px]" />
```

`require-disable-reason` enforces the `--` description on `design/*` disables. A
bare disable is indistinguishable from someone silencing a rule they disagreed
with, and it survives review the same way the four invented token names did.

## Validated against real source, not fixtures

`node scripts/validate-against-portfolio.mjs` — measured 2026-09-11:

| tree | color-literal | raw-palette | arbitrary-scale | undefined-token |
|---|---|---|---|---|
| kit-dashboard `src` | 16 | 0 | 154 | 45 |
| nanite `components/chat` | 17 | 15 | 355 | 3 |
| **nanite `lib/theme`** | **0** | **0** | **0** | **0** |
| tangent | 273 | 955 | 248 | 0 |
| tesseract | 0 | 0 | 33 | 106 |
| tether (reference) | 0 | 3 | 328 | 42 |
| hadron | 66 | 271 | 29 | 0 |

Every figure was traced to source before being accepted. The acceptance criteria
hold: `lib/theme` is fully exempt rather than 627 errors; Nanite's chat is
**16 hex + 1 rgba and 15 raw palette** against ~11,300 lines, i.e. mostly clean on
color; Tesseract and Tether are clean on color (0 hex, 0/3 raw).

Two diagnostic tools, because a bare count cannot tell one real finding repeated
100 times from one bug repeated 100 times:

```bash
node scripts/explain.mjs design/no-undefined-token apps/tesseract/frontend/src
node scripts/scale-usage-report.mjs <path>    # what closing the type scale would cost
```

## How a consumer repo opts in

Deliberately not automatic. Nanite and Tangent would fail on day one, and turning
that into a red build across the portfolio before anyone asked converts a leverage
move into a blocker. Adoption is each project's own task, on its own schedule.

1. **Install** the config and `@hollis-labs/design-tokens`.
2. **Start non-blocking.** Add it with `severity: 'warn'` and run
   `npx eslint . -f json | node -e '…'`, or just read the counts. This tells you
   the size of the problem without stopping anyone's work.
3. **Take the free wins.** `npx eslint . --fix` rewrites every arbitrary value that
   restates a named step. Portfolio-wide that is 149 of 212 arbitrary radii and
   most of the 86 `text-[12px]`/`text-[14px]` uses — unambiguous renames nobody
   defends.
4. **Declare your own idiom tokens** in the vocabulary you pass, so
   `no-undefined-token` can see your families. A repo lints against what it
   declares; without this the rule is conservative to the point of quiet.
5. **Name the theme layer** in `themeFiles`. If your hex count looks catastrophic,
   this is almost certainly why — check *where* the hex lives before believing the
   number.
6. **Flip to `error`** once the count is zero, and only then.

Do not widen an exemption to get to green. The exemptions are narrow on purpose,
and the next case will cite yours as precedent.
