import type { SVGProps } from 'react'

/**
 * THE GLYPHS THIS PACKAGE DRAWS ITSELF — vendored, not depended on.
 *
 * ============================== ATTRIBUTION ==============================
 *
 * Path data below is taken verbatim from lucide-react v1.44.0
 * (https://lucide.dev, https://github.com/lucide-icons/lucide).
 *
 * THE ICONS ARE UNDER TWO LICENCES, NOT ONE. lucide ships as ISC, but a large
 * set of its icons are derived from the Feather project and carry MIT. Twelve of
 * the seventeen taken here are in that set, so both notices are required and
 * both are reproduced.
 *
 * MIT (derived from Feather) — check, chevron-down, chevron-left, chevron-right,
 *   chevron-up, circle-alert (listed as alert-circle), triangle-alert (listed as
 *   alert-triangle), ellipsis (listed as more-horizontal), info, minus, search, x
 *
 *   The MIT License (MIT)
 *   Copyright (c) 2013-present Cole Bemis
 *
 * ISC (lucide) — circle-check, copy, eye, inbox, search-x
 *
 *   ISC License
 *   Copyright (c) 2026 Lucide Icons and Contributors
 *
 *   Permission to use, copy, modify, and/or distribute this software for any
 *   purpose with or without fee is hereby granted, provided that the above
 *   copyright notice and this permission notice appear in all copies.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 *   WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 *   MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 *   ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 *   WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 *   ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 *   OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * The full texts are in lucide-react's LICENSE file.
 *
 * ========================= WHY THEY ARE VENDORED =========================
 *
 * Chrispian decided (review round 1) that components take an icon as a prop, so
 * a consumer picks the icon library and its major version — `lucide-react` is
 * neither a peer nor a dependency of this package.
 *
 * That answers 4 of the 19 icons the base set imported. The other 15 are the
 * PRIMITIVE'S OWN ANATOMY — a Checkbox's checkmark, a Select's chevrons, a
 * Dialog's close X. Making those required props does not remove a dependency, it
 * relocates it to every consumer and makes it mandatory: a bare `<Checkbox>`
 * would render an empty box until someone wired an icon, failing visually rather
 * than at compile time. And `SelectScrollUpButton` and `DropdownMenuCheckboxItem`'s
 * indicator are rendered by a vendored primitive's internals, where there is no
 * call site for a prop to be passed at.
 *
 * So: vendored defaults here, `icon` props where an override is meaningful. The
 * dependency is gone rather than moved, which is what the decision was for.
 *
 * NOT EXPORTED FROM THE PACKAGE ROOT, deliberately. This package does not ship an
 * icon set and should not look like it does. These are the glyphs its own
 * components draw with; a consumer who wants different ones passes them.
 *
 * RECURRING COST, recorded so it is not rediscovered: the shadcn registry keeps
 * emitting `lucide-react` imports, so every future `shadcn add` re-introduces
 * them and this substitution is re-applied per component. Same recurring shape
 * that decided Base UI over Radix, contained to a component file rather than the
 * API.
 */

/**
 * The shape an icon prop takes when the COMPONENT sizes the icon.
 *
 * THE RULE, because two shapes look like inconsistency until you know the seam:
 *
 *   If the component sizes it   -> `IconComponent`, and the component renders
 *                                  `<Icon className="size-4" />`.
 *   If the consumer composes it -> `ReactNode`, and the component wraps it and
 *                                  sizes descendants.
 *
 * `IconComponent` is the default. The reason is the one rule: size is scale, and
 * a `ReactNode` icon prop forces the component either to `cloneElement` — fragile,
 * and it silently drops the consumer's own className — or to trust the caller to
 * size it, which puts a scale decision at every call site in every consuming app.
 * A prop shape that relocates a scale decision to consumers is a hole in the rule
 * this package exists to close.
 *
 * `ReactNode` is kept only where the slot is documented as arbitrary content
 * rather than an icon — `Callout.icon`, which also accepts `null` to mean "omit",
 * and `OverflowAction.icon`. Both already wrap and size their slot.
 */
export type IconComponent = (props: { className?: string }) => React.ReactNode

/** lucide's presentation attributes, on a 24x24 grid. */
function Glyph({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

type P = { className?: string }

/* — MIT, derived from Feather — */

export const CheckGlyph = (p: P) => (
  <Glyph {...p}><path d="M20 6 9 17l-5-5" /></Glyph>
)

export const ChevronDownGlyph = (p: P) => (
  <Glyph {...p}><path d="m6 9 6 6 6-6" /></Glyph>
)

export const ChevronLeftGlyph = (p: P) => (
  <Glyph {...p}><path d="m15 18-6-6 6-6" /></Glyph>
)

export const ChevronRightGlyph = (p: P) => (
  <Glyph {...p}><path d="m9 18 6-6-6-6" /></Glyph>
)

export const ChevronUpGlyph = (p: P) => (
  <Glyph {...p}><path d="m18 15-6-6-6 6" /></Glyph>
)

export const CircleAlertGlyph = (p: P) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </Glyph>
)

export const TriangleAlertGlyph = (p: P) => (
  <Glyph {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Glyph>
)

export const EllipsisGlyph = (p: P) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </Glyph>
)

export const InfoGlyph = (p: P) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </Glyph>
)

export const MinusGlyph = (p: P) => (
  <Glyph {...p}><path d="M5 12h14" /></Glyph>
)

export const SearchGlyph = (p: P) => (
  <Glyph {...p}>
    <path d="m21 21-4.34-4.34" />
    <circle cx="11" cy="11" r="8" />
  </Glyph>
)

export const XGlyph = (p: P) => (
  <Glyph {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Glyph>
)

/* — ISC, lucide — */

export const CircleCheckGlyph = (p: P) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m16 9-5.5 5.5L8 12" />
  </Glyph>
)

export const CopyGlyph = (p: P) => (
  <Glyph {...p}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Glyph>
)

export const EyeGlyph = (p: P) => (
  <Glyph {...p}>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </Glyph>
)

export const InboxGlyph = (p: P) => (
  <Glyph {...p}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Glyph>
)

export const SearchXGlyph = (p: P) => (
  <Glyph {...p}>
    <path d="m13.5 8.5-5 5" />
    <path d="m8.5 8.5 5 5" />
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Glyph>
)
