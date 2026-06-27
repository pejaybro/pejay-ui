# AppProvider, Side Panel & Modals — Project Roadmap

> How overlays are wired in FleetNexa frontend: architecture, call chain, and a full Customer Form walkthrough.

---

## Analysis Steps Performed

These are the steps taken to map the overlay system from app bootstrap to a real feature (Customer Form):

| Step | What was inspected | Why |
|------|-------------------|-----|
| 1 | `src/main.tsx` → `src/App.tsx` | Find where `AppProvider` is mounted in the React tree |
| 2 | `src/provider/AppProvider.tsx` | Understand the overlay stack, `open` / `close`, and rendering logic |
| 3 | `src/provider/app-context.ts` | See how context is exposed via `useAppProvider()` |
| 4 | `src/types/provider.interface.ts` | Learn `OverlayContent`, `OverlayOptions`, and stack item types |
| 5 | `src/hooks/useOverlay.ts` | Find the public API: `openSidePanel`, `openModal` |
| 6 | `src/hooks/useFormPanel.tsx` | See the form-specific wrapper over side panels |
| 7 | `src/components/base/overlay/side-panel.tsx` | Side panel animation, portal, and `SidePanelContent` |
| 8 | `src/components/base/overlay/modal.tsx` + `backdrop.tsx` | Modal rendering and backdrop behavior |
| 9 | `src/components/base/card/side-panel-card.tsx` | Standard UI shell for form side panels |
| 10 | `src/components/base/card/modal-card.tsx` | Standard UI shell for modal dialogs |
| 11 | `src/hooks/form-overlay-registry.ts` + `overlay-close.ts` | Unsaved-changes guard, Escape, keyboard shortcuts |
| 12 | `src/provider/use-keyboard-shortcuts.tsx` | Global shortcuts when overlays are open |
| 13 | Grep across routes | Find all consumers: `useFormPanel`, `useOverlay`, domain hooks |
| 14 | `src/routes/customers/*` | Trace one complete real example end-to-end |

---

## High-Level Architecture

```
main.tsx
  └── App.tsx
        └── AppProvider          ← owns overlay stack (modals + side panels)
              └── RouterProvider   ← all pages live here
              └── [stack renders]  ← Modal / SidePanel components portaled on top
```

**Key idea:** You never import `<Modal>` or `<SidePanel>` directly in a page. You call `openModal()` or `openSidePanel()` (usually via hooks), and `AppProvider` renders the overlay on top of the app.

---

## Layer 1 — App Bootstrap & Provider Mount

### Entry point

```tsx
// src/main.tsx
createRoot(document.getElementById("root")!).render(<App />);
```

### Provider tree

```tsx
// src/App.tsx
<StoreProvider>
  <QueryProvider>
    <RolesBootstrap>
      <AppProvider>                    {/* ← overlay system lives here */}
        <RouterProvider router={router} />
      </AppProvider>
    </RolesBootstrap>
  </QueryProvider>
  <ToastContainer />
  <NotifyContainer />
</StoreProvider>
```

`AppProvider` wraps the entire router so **any route** can open modals or side panels.

---

## Layer 2 — AppProvider (The Overlay Engine)

**File:** `src/provider/AppProvider.tsx`

### What it stores

A **stack** of overlay items. Each item has:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | `string` | UUID — used to close a specific overlay |
| `type` | `"modal"` \| `"side-panel"` | Which component to render |
| `content` | `(helpers) => ReactNode` | Render function; receives `{ close }` |
| `options` | `{ onSide?: "left" \| "right", ... }` | Passed to Modal / SidePanel |

### Core API (via context)

```ts
open(type, content, options?)   // push onto stack
close(id)                       // remove from stack
isOverlayOpen                   // stack.length > 0
stackDepth                      // how many overlays are open (supports stacking)
```

### How it renders

```tsx
{stack.map((item, index) => {
  const isActive = item.id === topOverlayId;  // only top overlay is interactive
  const layer = index + 1;                    // z-index layering

  if (item.type === "modal")       → <Modal>...</Modal>
  if (item.type === "side-panel")  → <SidePanel><SidePanelContent /></SidePanel>
})}
```

### Stacking behavior

- Multiple overlays can be open at once (e.g. side panel + modal on top).
- Only the **top** overlay is `isActive = true` (receives keyboard focus, Escape, backdrop clicks).
- Lower overlays stay mounted but invisible / non-interactive until the top one closes.

---

## Layer 3 — Public Hooks (How Pages Call Overlays)

### `useAppProvider()` — low-level

**File:** `src/provider/app-context.ts`

Direct access to `open`, `close`, `stack`, `isOverlayOpen`, `stackDepth`.

> Throws if used outside `<AppProvider>`.

### `useOverlay()` — recommended public API

**File:** `src/hooks/useOverlay.ts`

```ts
const { openSidePanel, openModal, isOverlayOpen, stackDepth } = useOverlay();

// Side panel — defaults to right side
openSidePanel(
  ({ close }) => <MyComponent close={close} />,
  { onSide: "left" }  // optional
);

// Modal — centered dialog
openModal(
  ({ close }) => <MyDialog close={close} />
);
```

Both call `open()` internally with `APP_PROVIDER_TYPE.MODAL` or `APP_PROVIDER_TYPE.SIDE_PANEL`.

### `useFormPanel()` — form shortcut

**File:** `src/hooks/useFormPanel.tsx`

Standard pattern for CRUD forms in side panels:

```ts
const openForm = useFormPanel();

openForm(CustomerForm, { mode: "create" });
// equivalent to:
// openSidePanel(({ close }) => <CustomerForm mode="create" close={close} />)
```

Every form component **must** accept a `close: () => void` prop.

---

## Layer 4 — Side Panel Internals

**File:** `src/components/base/overlay/side-panel.tsx`

### Flow

```
AppProvider pushes side-panel item
  → SidePanel mounts in Portal
  → AnimatePresence slides panel from right (or left)
  → Backdrop blur overlay behind it
  → SidePanelContent calls content({ close: requestClose })
  → requestClose triggers exit animation
  → onExitComplete → AppProvider.close(id) removes from stack
```

### Important distinction: two `close` functions

| Close function | What it does |
|----------------|--------------|
| AppProvider's `close(id)` | Immediately removes item from stack |
| `useAnimatedSidePanelClose()` | Starts exit animation first, then stack removal |

`SidePanelContent` wires the **animated** close into your content:

```tsx
export function SidePanelContent({ content }) {
  const requestClose = useAnimatedSidePanelClose();
  return content?.({ close: requestClose }) ?? null;
}
```

So when your form calls `close()`, the panel slides out smoothly.

### Side panel UI shell — `SidePanelCard`

**File:** `src/components/base/card/side-panel-card.tsx`

Used by almost all form side panels. Provides:

- Title, description, header slot (tabs)
- Scrollable body
- Footer (Cancel / Save buttons)
- X button and unsaved-changes protection
- Keyboard shortcut registration (`Ctrl+Enter` to submit, `Alt+←/→` for tabs)

---

## Layer 5 — Modal Internals

**File:** `src/components/base/overlay/modal.tsx`

### Flow

```
AppProvider pushes modal item
  → Modal mounts in Portal
  → Backdrop (centered, dark overlay)
  → content({ close }) rendered as children
  → close() → AppProvider.close(id) (no slide animation)
```

### Modal UI shell — `ModalCard`

**File:** `src/components/base/card/modal-card.tsx`

Centered white card with title, body, footer, and optional close button.

### When modals are used vs side panels

| Use case | Overlay type | Example |
|----------|-------------|---------|
| Create / Edit entity forms | Side panel | Customer, Agent, Shipper forms |
| Read-only detail / quick action | Modal | View Asset dialog |
| Help / info dialogs | Modal | Keyboard shortcuts (`Shift+?`) |
| Nested sub-forms inside a page | Side panel | Create Load → other charges panel |

---

## Layer 6 — Close Behavior & Keyboard Shortcuts

### Unsaved changes guard

**Files:** `src/hooks/overlay-close.ts`, `src/hooks/form-overlay-registry.ts`

When user tries to close (X, Escape, backdrop click):

```
requestOverlayCloseWithConfirm()
  → Is unsaved confirm already open? → dismiss notify
  → Is form close blocked (async in progress)? → do nothing
  → Is form dirty? → show "Unsaved changes" notify
  → Otherwise → call active close handler
```

Forms register themselves via `useFormOverlayRegistration()` inside `SidePanelCard`.

### Global keyboard shortcuts (when overlay open)

**File:** `src/provider/use-keyboard-shortcuts.tsx`

| Shortcut | Action |
|----------|--------|
| `Escape` | Close top overlay (with unsaved guard) |
| `Ctrl/Cmd + Enter` | Submit active form |
| `Alt + ←` / `Alt + →` | Previous / next form tab |
| `Shift + ?` | Open keyboard shortcuts help modal |

When **no** overlay is open:

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Alt + N` | Trigger page "new record" handler |

Pages register the new-record handler via `usePageShortcut()`.

---

## Domain Hook Pattern (Used Across Routes)

Most entity pages follow this 3-layer pattern:

```
Page (index.tsx)
  └── useXxxFormPanel()          ← domain hook
        └── useFormPanel()       ← generic form opener
              └── useOverlay()   ← openSidePanel
                    └── useAppProvider() → open()
```

### All form-panel hooks in the project

| Hook | Route | Form component |
|------|-------|----------------|
| `useCustomerFormPanel` | `/customers` | `CustomerForm` |
| `useAgentFormPanel` | `/agents` | `AgentForm` |
| `useShipperFormPanel` | `/shippers` | `ShipperForm` |
| `useConsigneeFormPanel` | `/consignees` | `ConsigneeForm` |
| `useCarrierFormPanel` | `/external-carriers` | `CarrierForm` |
| `useFactoringFormPanel` | `/factoring-company` | `FactoringForm` |
| `useRoleFormPanel` | `/roles` | `RoleForm` |
| `useFleetAddPanel` | `/fleet` | Fleet add form |
| `useViewAssetPanel` | `/fleet` | `ViewAssetDialog` (**modal**, not side panel) |

---

## Real Example — Customer Form (Start to End)

This is the complete call chain when a user clicks **"Add Customer"** on the Customers page.

### Visual flow

```
User clicks "Add Customer"
        │
        ▼
CustomersPage ──► useCustomerFormPanel()
        │
        ▼
openCustomerForm("create")
        │
        ▼
useFormPanel() ──► openSidePanel(({ close }) => <CustomerForm mode="create" close={close} />)
        │
        ▼
useOverlay() ──► open(APP_PROVIDER_TYPE.SIDE_PANEL, content, { onSide: "right" })
        │
        ▼
AppProvider.open() ──► stack.push({ id, type: "side-panel", content, options })
        │
        ▼
AppProvider re-renders ──► <SidePanel><SidePanelContent content={content} /></SidePanel>
        │
        ▼
SidePanelContent ──► content({ close: animatedClose })
        │
        ▼
<CustomerForm mode="create" close={animatedClose} />
        │
        ▼
<SidePanelCard title="Add Customer" ...>
  <CustomerTab /> or <AdvancedTab />
</SidePanelCard>
        │
        ▼
User clicks Save ──► handleSave() ──► toast.success() ──► close()
        │
        ▼
Animated slide-out ──► AppProvider.close(id) ──► panel removed from DOM
```

---

### Step-by-step with real file references

#### Step 1 — Page triggers the panel

**File:** `src/routes/customers/index.tsx`

```tsx
const openCustomerForm = useCustomerFormPanel();
usePageShortcut(() => openCustomerForm("create"));  // Ctrl+Alt+N

// "Add Customer" button
<Btn onClick={() => openCustomerForm("create")}>Add Customer</Btn>

// Table row actions (view / edit)
const handleEdit = (customer) => openCustomerForm("update", customer);
```

Three entry points, same hook:
- Header button → create mode
- Keyboard shortcut → create mode
- Table row → update mode with existing `customer` data

---

#### Step 2 — Domain hook wraps the form component

**File:** `src/routes/customers/hooks/use-customer-form-panel.tsx`

```tsx
export function useCustomerFormPanel() {
  const openForm = useFormPanel();

  return useCallback(
    (mode: CustomerFormMode = "create", customer?: Customer) => {
      openForm(CustomerForm, { mode, customer });
    },
    [openForm],
  );
}
```

This hook knows **which component** and **which props** — the page doesn't need to know about `useOverlay` or `openSidePanel`.

---

#### Step 3 — Generic form panel opens side panel

**File:** `src/hooks/useFormPanel.tsx`

```tsx
export function useFormPanel() {
  const { openSidePanel } = useOverlay();

  return useCallback(
    (Component, props) => {
      openSidePanel(({ close }) => (
        <Component {...props} close={close} />
      ));
    },
    [openSidePanel],
  );
}
```

Injects `close` into the form component automatically.

---

#### Step 4 — useOverlay pushes to AppProvider stack

**File:** `src/hooks/useOverlay.ts`

```tsx
openSidePanel(content, options) {
  open(APP_PROVIDER_TYPE.SIDE_PANEL, content, { onSide: "right", ...options });
}
```

---

#### Step 5 — AppProvider renders SidePanel

**File:** `src/provider/AppProvider.tsx`

```tsx
if (item.type === APP_PROVIDER_TYPE.SIDE_PANEL) {
  return (
    <SidePanel key={item.id} options={...} isActive={...} onClose={() => close(item.id)}>
      <SidePanelContent content={item.content} />
    </SidePanel>
  );
}
```

---

#### Step 6 — CustomerForm renders inside SidePanelCard

**File:** `src/routes/customers/components/customer-form/index.tsx`

```tsx
export function CustomerForm({ close, mode = "create", customer }) {
  const [values, setValues] = useState(() => ({
    ...getDefaultCustomerFormValues(),
    ...(customer ? customerToFormValues(customer) : {}),
  }));

  const handleSave = () => {
    if (!values.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    close();                                          // ← closes side panel
    toast.success("Customer added successfully!");
  };

  return (
    <SidePanelCard
      title={mode === "update" ? "Edit Customer" : "Add Customer"}
      close={close}
      onSubmit={handleSave}
      isDirty={isDirty}
      formTabs={...}
      footer={
        <>
          <Btn onClick={requestOverlayCloseWithConfirm}>Cancel</Btn>
          <Btn onClick={handleSave}>Save</Btn>
        </>
      }
    >
      {activeTab === "customer"
        ? <CustomerTab values={values} setField={setField} />
        : <AdvancedTab values={values} setField={setField} />}
    </SidePanelCard>
  );
}
```

**SidePanelCard** registers the form with the overlay registry so Escape / backdrop / dirty-check all work.

---

#### Step 7 — User closes the panel

| User action | What happens |
|-------------|--------------|
| Click **Save** | `handleSave()` → validation → `close()` → slide out → removed from stack |
| Click **Cancel** | `requestOverlayCloseWithConfirm()` → if dirty, shows notify → else `close()` |
| Click **X** | Same as Cancel (via `SidePanelCard.handleClose`) |
| Click **backdrop** | `requestOverlayCloseWithConfirm()` in `SidePanel` |
| Press **Escape** | `useKeyboardShortcuts` → `requestOverlayCloseWithConfirm()` |
| Press **Ctrl+Enter** | `getActiveFormOverlay().onSubmit()` → `handleSave()` |

---

## Modal Example (For Comparison) — View Asset

**File:** `src/routes/fleet/hooks/use-view-asset-panel.tsx`

```tsx
export function useViewAssetPanel() {
  const { openModal } = useOverlay();

  return useCallback(
    (asset: FleetTruck) => {
      openModal(({ close }) => <ViewAssetDialog asset={asset} close={close} />);
    },
    [openModal],
  );
}
```

**File:** `src/routes/fleet/components/view-asset-dialog.tsx`

```tsx
export function ViewAssetDialog({ asset, close }) {
  return (
    <ModalCard close={close} title={asset.name} footer={...}>
      {/* read-only fields */}
    </ModalCard>
  );
}
```

Same pattern, different shell (`ModalCard` instead of `SidePanelCard`) and different opener (`openModal` instead of `openSidePanel`).

---

## Quick Reference — How to Add a New Form Side Panel

1. **Create form component** with `close: () => void` prop
2. **Wrap in `SidePanelCard`** with title, footer, `isDirty`, `onSubmit`
3. **Create domain hook** — `useMyEntityFormPanel()` using `useFormPanel()`
4. **Call from page** — button click, table action, or `usePageShortcut()`

```tsx
// hooks/use-my-entity-form-panel.tsx
export function useMyEntityFormPanel() {
  const openForm = useFormPanel();
  return useCallback(
    (mode = "create", entity?) => openForm(MyEntityForm, { mode, entity }),
    [openForm],
  );
}

// pages/my-entity/index.tsx
const openForm = useMyEntityFormPanel();
<Btn onClick={() => openForm("create")}>Add Entity</Btn>
```

No changes needed in `AppProvider` — it already handles everything.

---

## File Map

```
src/
├── App.tsx                              # AppProvider mount point
├── provider/
│   ├── AppProvider.tsx                  # Overlay stack engine
│   ├── app-context.ts                   # useAppProvider()
│   └── use-keyboard-shortcuts.tsx       # Global overlay shortcuts
├── hooks/
│   ├── useOverlay.ts                    # openSidePanel / openModal
│   ├── useFormPanel.tsx                 # Generic form side panel opener
│   ├── overlay-close.ts                 # Unsaved changes close logic
│   ├── form-overlay-registry.ts         # Active form registration
│   └── useFormOverlayRegistration.ts    # Hook used by SidePanelCard
├── components/base/
│   ├── overlay/
│   │   ├── side-panel.tsx               # Animated side panel
│   │   ├── modal.tsx                    # Centered modal
│   │   └── backdrop.tsx                 # Modal backdrop
│   └── card/
│       ├── side-panel-card.tsx          # Form panel UI shell
│       └── modal-card.tsx               # Modal dialog UI shell
├── types/
│   └── provider.interface.ts            # Overlay types
└── routes/customers/
    ├── index.tsx                        # Page — triggers panel
    ├── hooks/use-customer-form-panel.tsx
    └── components/customer-form/index.tsx
```

---

