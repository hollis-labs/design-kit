# @hollis-labs/kit-observe

## 0.1.0 — 2026-10-02 — first release

First published release. Requires `@hollis-labs/design-components` `^0.3.0` and
`@hollis-labs/design-tokens` `^0.2.0`; Tailwind v4 is a required peer.
`@hollis-labs/kit-dashboard` `^0.3.0` is an OPTIONAL peer, needed only for the `/charts`
entry (`SampleSeriesView`); the root entry does not import it.

- Initial controlled ObservationStatus, HealthSummary, StatCollection and
  DiagnosticPanel, with SampleSeriesView behind `/charts` using the shared
  dashboard timestamp-sample surface. Host-owned data, time and transport.
- Manifest fixture demo and presentation/browser evidence; no app integration.
