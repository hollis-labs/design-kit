# AppShell Optional Aside Slot

CW-20261010-0072 adds an optional persistent right aside region to `AppShell`,
with preset widths, controlled collapse state, and responsive `OverlaySidebar`
fallback below the narrow screen threshold (1024px / `lg`).

## Anatomy

```tsx
<AppShell
  nav={<NavRail />}
  header={<PageHeader />}
  aside={<AssistantView />}
  asideLabel="Assistant"
  asideWidth="regular"
  asideCollapsed={collapsed}
  onAsideCollapsedChange={setCollapsed}
  asideHeader={<AsideHeading />}
  asideFooter={<PinnedComposer />}
>
  <RouteContent />
</AppShell>
```

## Contract & Behavior

1. **Idiom-Free Base Layout**:
   The shell owns geometry, viewport bounding (`h-dvh`), and region scroll containment.
   Chat, assistant, or inspector content is child content (e.g. via `kit-chat`
   `ChatStream` / `ChatInput`). The shell imports no transport, chat state, or model APIs.

2. **Zero Overhead When Omitted**:
   When `aside` is omitted (`aside === undefined`), existing `AppShell` behavior, DOM
   structure, and class names are completely preserved.

3. **Width Presets**:
   - `compact`: `w-80` (20rem / 320px)
   - `regular`: `w-96` (24rem / 384px, default)
   - `wide`: `w-112` (28rem / 448px)
   Widths map strictly to Tailwind spacing-scale utilities naming no arbitrary values.

4. **Collapse State**:
   Controlled via `asideCollapsed` and `onAsideCollapsedChange`. When collapsed,
   the desktop aside is completely unmounted, reserving no empty sliver or ghost column.

5. **Narrow Screen Fallback**:
   Below the 1024px (`lg`) breakpoint, the desktop aside unmounts and falls back to
   an `OverlaySidebar` (`side="right"`). The main column retains full width on narrow
   viewports (e.g. 390px mobile). Exactly one mounted copy of `aside` exists at any time.

6. **Scroll Containment**:
   The shell outer container never scrolls (`overflow-hidden`). The content column has its
   own flex column, and the aside has its own independent scrolling container
   (`[data-slot="app-shell-aside-body"]` with `overflow-y-auto min-h-0 min-w-0 flex-1`).
   Scrolling main never moves the aside, and scrolling the aside never moves main.

7. **Focus Return & Admitted Targets**:
   When the aside collapses or the narrow overlay closes:
   - Focus returns to the opening trigger if connected in the DOM, enabled, and admitted.
   - If the trigger is disconnected or unadmitted, focus falls back to `asideFocusFallbackTarget`.
   - Never guesses hidden DOM elements.
   - Resize from desktop to narrow while focus is inside the aside closes the temporary overlay
     and returns focus safely without mutating the persisted desktop collapse preference.

## Host controls and focus custody

The host renders a labelled desktop toggle in pinned header chrome and supplies
`asideFocusReturnTarget` (element or getter), `isAsideTriggerAdmitted`, and an
optional `asideFocusFallbackTarget` / `isAsideFallbackAdmitted`. Changing controlled
`asideCollapsed` removes geometry; `onAsideCollapsedChange` is the host callback
passed to its own toggle and child actions. AppShell installs no global shortcut.
The narrow trigger is visible by default; a custom button is resolved by Sheet,
including connected-but-retired admission. Sheet resolves return after dismissal
instead of racing its automatic focus handling. Caller fallback targets must be
current and admitted; no document query guesses a replacement.

`data-slot=app-shell` exposes `data-aside-state` (persistent/collapsed/overlay)
and `data-aside-width` while an aside is supplied. Existing desktop
`app-shell-aside/header/body/footer` and narrow `overlay-sidebar-body/footer`
identify the actual region owners. `aside={null}` is an explicit empty region;
omitting the prop has no aside geometry or attributes.

Aside child content must not introduce a second bounded vertical scroll owner.
Use shell body / OverlaySidebar body as the scrolling region; put composers in
`asideFooter`. A ChatStream can expand into its owner via `className=flex-none`
and `viewportClassName="flex-none overflow-visible"` with auto-scroll disabled;
its local host chooses transcript behavior. Draft/transport remain host-owned.
