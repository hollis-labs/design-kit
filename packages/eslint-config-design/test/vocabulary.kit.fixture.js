/**
 * kit-dashboard's ACTUAL declared vocabulary — contract plus its own `status-*`
 * dashboard idiom, which theme.css declares 12 members of today.
 *
 * This is the realistic configuration: a repo lints against the tokens it
 * declares, not against the contract alone. It is also what makes
 * `bg-status-running` (invented, 6 live uses) catchable while `bg-status-done`
 * (real) passes — the two differ only by membership.
 */
export { TEXT_TOKENS, RADIUS_TOKENS, TRACKING_TOKENS, IDIOM_PREFIXES, SHADCN_ALIASES, DEPRECATED_TOKENS } from './vocabulary.fixture.js'
import { COLOR_TOKENS as CONTRACT } from './vocabulary.fixture.js'

export const COLOR_TOKENS = [
  ...CONTRACT,
  'status-backlog', 'status-queued', 'status-doing', 'status-review',
  'status-done', 'status-blocked', 'status-paused', 'status-archived',
  'status-inbox', 'status-routed', 'status-indexed', 'status-todo',
]
