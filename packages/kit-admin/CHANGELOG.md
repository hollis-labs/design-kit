# Changelog

## 0.1.0 - 2026-10-03 - first release

- Render callback-free Settings as read-only text even for writable declarations,
  using a presentation copy without changing host data or backend capabilities.

- Controlled admin navigation/content/standalone composition per the
  [admin shell spec](../../docs/admin-shell-spec.md), over existing dashboard
  layouts, settings provenance/setup and observation components. Host-owned
  data, routes and commands remain controlled inputs.
- Require design-components, design-tokens and kit-dashboard `^0.4.0`,
  kit-settings `^0.2.0` and kit-observe `^0.1.1`.
- Keep Dashboard a declaration directory and enforce canonical resource sections,
  unavailable discovery/group states and host-owned context.
- Include opt-in `/charts` delegation, fixture demos and behavioral/browser evidence.
- Use optional settings text presentation when the host supplies no settings
  callbacks, so read-only preferences render labelled values without disabled
  editor affordances. Keep source, locks and apply state in canonical Settings.
