import nanite from '../../../docs/examples/nanite-admin-manifest.json'
import tachyon from '../../../docs/examples/tachyon-admin-manifest.json'
import type { SettingsState, SettingsValue } from '../src'
export { nanite, tachyon }
const value = (v: string | number | boolean, override = true): SettingsValue => ({ present: true, value: v, editable: true, has_override: override })
/** Illustrative host snapshots, explicitly authored; schema defaults never initialize controls. */
export const initialStates: Record<string, SettingsState> = {
  'app.preferences': { draft: {}, values: {
    developer_mode: value(false), tool_stream_behavior: value('streaming'), tool_drawer_retention: value(-1), embedding_mode: value(''),
  } },
  'app.deployment': { draft: {}, values: {
    listen_address: { present: true, value: '127.0.0.1:8090', editable: false, has_override: false, read_only_reason: 'Managed by deployment configuration' },
  } },
  'plugin.example-notifier': { draft: {}, values: {
    api_token: { present: true, secret_present: true, editable: true, has_override: true },
  } },
  'plugin.observe-ops': { draft: {}, values: {
    nanite_url: value('http://127.0.0.1:8091'), torque_url: value('http://127.0.0.1:8990', false), tether_url: value('http://127.0.0.1:8947', false),
  } },
}
export const demoFallbacks: Record<string, string> = { nanite_url: 'http://127.0.0.1:8090', torque_url: 'http://127.0.0.1:8990', tether_url: 'http://127.0.0.1:8947' }
