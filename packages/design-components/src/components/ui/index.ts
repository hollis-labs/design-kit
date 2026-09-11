/**
 * The 23 vendored primitives, in one barrel.
 *
 * These are shadcn components on Base UI (`@base-ui/react`), a peer. Fifteen bind
 * a Base UI module; of those, `badge` binds `useRender` + `mergeProps` rather than
 * a component, so fourteen bind an actual primitive. The other eight —
 * `card`, `command` (cmdk), `input-group`, `label`, `skeleton`, `sonner`, `table`,
 * `textarea` — are substrate-independent outright.
 *
 * `export *` is safe for tree-shaking here: the package declares
 * `sideEffects: ["**\/*.css"]` and the build preserves modules, so a consumer
 * importing one Button gets one Button.
 */
export * from './alert-dialog'
export * from './badge'
export * from './button'
export * from './card'
export * from './checkbox'
export * from './command'
export * from './dialog'
export * from './dropdown-menu'
export * from './input'
export * from './input-group'
export * from './label'
export * from './popover'
export * from './scroll-area'
export * from './select'
export * from './separator'
export * from './sheet'
export * from './skeleton'
export * from './sonner'
export * from './switch'
export * from './table'
export * from './tabs'
export * from './textarea'
export * from './tooltip'
