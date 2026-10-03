import { Component, createContext, createElement, Suspense, useContext, useEffect, useMemo, useSyncExternalStore, type ComponentType, type ErrorInfo, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button } from '@hollis-labs/design-components'
import type { ContributionView, PluginHostReader } from './host.js'
import { drawerTabId, PANEL_KIND, DRAWER_TAB_KIND } from './host.js'
import { orderContributions, type OrderingPolicy } from './order.js'

const HostContext = createContext<PluginHostReader | null>(null)
export function PluginHostProvider({ runtime, children }: { runtime: PluginHostReader; children: ReactNode }) {
  useEffect(() => runtime.retain(), [runtime])
  return <HostContext.Provider value={runtime}>{children}</HostContext.Provider>
}
export function usePluginHost(): PluginHostReader {
  const runtime = useContext(HostContext)
  if (!runtime) throw new Error('PluginHostProvider is required')
  return runtime
}
export function usePluginViews() {
  const host = usePluginHost()
  return useSyncExternalStore(host.subscribe, host.getSnapshot, host.getServerSnapshot).views
}
export function usePluginSlots(region: string, savedOrder: readonly string[] = [], policy?: OrderingPolicy) {
  const views = usePluginViews()
  return useMemo(() => orderContributions(views.filter(view => view.region === region), savedOrder, policy), [views, region, savedOrder, policy])
}
export function usePluginPanels() {
  const views = usePluginViews()
  return useMemo(() => views.filter(view => view.ref.kind === PANEL_KIND), [views])
}
export function usePluginDrawerTabs(region: string) {
  return usePluginSlots(region).filter(view => view.ref.kind === DRAWER_TAB_KIND)
}
interface BoundaryProps {
  resetKey: unknown
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}
interface BoundaryState { failed: boolean; resetKey: unknown }
/** Reset failed state when the export identity changes; preserve healthy child state. */
export class PluginRenderBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false, resetKey: this.props.resetKey }
  static getDerivedStateFromError(): Partial<BoundaryState> { return { failed: true } }
  static getDerivedStateFromProps(props: BoundaryProps, state: BoundaryState): Partial<BoundaryState> | null {
    return Object.is(props.resetKey, state.resetKey) ? null : { failed: false, resetKey: props.resetKey }
  }
  componentDidCatch(error: Error, info: ErrorInfo) { this.props.onError?.(error, info) }
  render() { return this.state.failed ? this.props.fallback ?? <ViewNotice>Plugin view failed.</ViewNotice> : this.props.children }
}
function ViewNotice({ children }: { children: ReactNode }) {
  return <div role="status" className="p-3 text-caption text-fg-muted">{children}</div>
}
/** The lease is checked at render time as well as at snapshot projection time. */
function CurrentView({ view, props }: { view: ContributionView; props: Readonly<Record<string, unknown>> }) {
  const host = usePluginHost()
  if (!host.isCurrent(view)) return <ViewNotice>Plugin view unavailable.</ViewNotice>
  return createElement(view.value as ComponentType<Record<string, unknown>>, props)
}
export function PluginPanelBody({ panel, fallback, loading }: { panel: ContributionView; fallback?: ReactNode; loading?: ReactNode }) {
  const host = usePluginHost()
  // Subscribe even when a caller retains an older view object: unload must fence it.
  useSyncExternalStore(host.subscribe, host.getSnapshot, host.getServerSnapshot)
  const context = useSyncExternalStore(host.renderContext.subscribe, host.renderContext.getSnapshot, host.renderContext.getServerSnapshot)
  if (panel.availability === 'isolated-controller-required') return <ViewNotice>Isolated renderer required.</ViewNotice>
  if (!host.isCurrent(panel)) return fallback ?? <ViewNotice>Plugin view unavailable.</ViewNotice>
  return <PluginRenderBoundary resetKey={panel.value} fallback={fallback} onError={() => host.report({ stage: 'render', reason: 'component-failed', ref: panel.ref })}>
    <Suspense fallback={loading ?? <ViewNotice>Loading plugin view…</ViewNotice>}>
      <CurrentView key={JSON.stringify([panel.ref.hostInstance, panel.ref.owner, panel.ref.generation, panel.ref.kind, panel.ref.key])} view={panel} props={{ ...panel.props, ...context }} />
    </Suspense>
  </PluginRenderBoundary>
}
export function PluginDrawerTabBody({ tab, fallback, loading }: { tab: ContributionView; fallback?: ReactNode; loading?: ReactNode }) {
  return <div data-plugin-tab={drawerTabId(tab.ref)}><PluginPanelBody panel={tab} fallback={fallback} loading={loading} /></div>
}
export function WidgetRenderer({ widget, fallback, loading }: { widget?: ContributionView; fallback?: ReactNode; loading?: ReactNode }) {
  return widget ? <PluginPanelBody panel={widget} fallback={fallback} loading={loading} /> : fallback ?? <ViewNotice>Widget unavailable.</ViewNotice>
}
export interface PluginReviewRow {
  /** Stable semantic identity; labels are presentation and need not be unique. */
  id: string
  label: string
  description?: string
  change: 'added' | 'removed' | 'changed' | 'unchanged'
}
export interface PluginReviewIdentity { id: string; version?: string }
export interface PluginReviewBundle { version?: string; digest?: string }
export interface PluginReviewDialogProps {
  open: boolean
  title: string
  description?: string
  plugin?: PluginReviewIdentity
  currentBundle?: PluginReviewBundle
  previousBundle?: PluginReviewBundle
  rows: readonly PluginReviewRow[]
  busy?: boolean
  error?: string
  onOpenChange(open: boolean): void
  onApprove(): void
}
/** Controlled review UI only. The host owns admission, grants and digest pinning. */
export function PluginReviewDialog({ open, title, description, plugin, currentBundle, previousBundle, rows, busy = false, error, onOpenChange, onApprove }: PluginReviewDialogProps) {
  return <Dialog open={open} onOpenChange={next => { if (!busy) onOpenChange(next) }}>
    <DialogContent showCloseButton={!busy}>
      <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description ?? 'Review the requested plugin changes.'}</DialogDescription></DialogHeader>
      {(plugin || currentBundle || previousBundle) && <dl className="space-y-3 text-caption">
        {plugin && <><dt>Plugin identity</dt><dd>{plugin.id}</dd>{plugin.version && <><dt>Plugin version</dt><dd>{plugin.version}</dd></>}</>}
        {currentBundle?.version && <><dt>Current bundle version</dt><dd>{currentBundle.version}</dd></>}
        {currentBundle?.digest && <><dt>Current bundle digest</dt><dd className="break-all">{currentBundle.digest}</dd></>}
        {previousBundle?.version && <><dt>Previous bundle version</dt><dd>{previousBundle.version}</dd></>}
        {previousBundle?.digest && <><dt>Previous bundle digest</dt><dd className="break-all">{previousBundle.digest}</dd></>}
      </dl>}
      <ul className="space-y-3">{rows.map(row => <li key={row.id} className="text-body">
        <span>{row.label}</span> <span className="text-caption text-fg-muted">{row.change}</span>
        {row.description && <p className="text-caption text-fg-muted">{row.description}</p>}
      </li>)}</ul>
      {error && <p role="alert" className="text-caption text-danger">{error}</p>}
      <DialogFooter><Button variant="ghost" disabled={busy} onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={busy} onClick={() => onApprove()}>{busy ? 'Applying…' : 'Approve'}</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}
