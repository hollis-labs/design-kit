import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      // TODO(round-1): `dark` is the dashboard's taste, not an idiom-free
      // default — a light app gets a dark toaster unless it passes `theme`.
      // sonner's own default is `system`. Left as-is pending the appearance
      // round rather than changed quietly; `{...props}` spreads last, so a
      // consumer can already override it.
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          // A REPAIR, NOT A PORT. sysop-ui reached for shadcn's stock raw
          // variables here — `var(--popover)`, `var(--popover-foreground)`,
          // `var(--border)` — and NONE OF THE THREE IS DECLARED ANYWHERE in that
          // codebase. shadcn's v4 template declares both a raw `--popover` and
          // `--color-popover: var(--popover)`; sysop-ui rebuilt the value layer as
          // `--theme-color-*` and kept only the `--color-*` half, so the raw names
          // the vendored component reaches for were never created. An invalid
          // custom property is invalid at computed-value time, so sonner falls back
          // to its own defaults: the toast renders and has simply never been
          // themed. Invisible to every instrument in this epic, all of which read
          // className strings rather than inline styles.
          //
          // `var(--radius)` DID resolve there, and would stop here: the contract
          // does not override Tailwind's radius scale and declares no bare
          // `--radius` — only `--radius-panel` and `--radius-control`.
          //
          // These name contract tokens through sonner's documented theming
          // surface. Still "a component may name a token, never a value".
          "--normal-bg": "var(--color-bg-elevated)",
          "--normal-text": "var(--color-fg)",
          "--normal-border": "var(--color-border)",
          "--border-radius": "var(--radius-control)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
