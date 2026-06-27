# SidePanelCard, Tabs, Hooks & Why the Layering Exists

> Deep dive into `SidePanelCard`, `CustomerTab` / `AdvancedTab`, `useCallback` in form hooks, naming (`openForm` vs `openCustomerForm`), deprecated exports, and whether the hook chain is over-engineered.

---

## 1. SidePanelCard — What It Is and Every Prop

**File:** `src/components/base/card/side-panel-card.tsx`

`SidePanelCard` is **not** the overlay itself. It is the **white panel UI shell** that slides in from the right. Think of it as the layout frame: header, scrollable body, footer.

The actual slide-in animation and backdrop come from `<SidePanel>` (rendered by `AppProvider`). Your form component renders **inside** that shell.

### Visual structure

```
┌─────────────────────────────────────┐  ← SidePanel (animation + backdrop)
│ ┌─────────────────────────────────┐ │
│ │ SidePanelCard                   │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Header: title + X button    │ │ │
│ │ │ headerSlot (e.g. FormTabs)  │ │ │
│ │ ├─────────────────────────────┤ │ │
│ │ │ Body (scrollable)           │ │ │
│ │ │   {children}                │ │ │  ← CustomerTab or AdvancedTab
│ │ ├─────────────────────────────┤ │ │
│ │ │ Footer: Cancel / Save        │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### All props explained

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | — | **The form fields** — tab content goes here |
| `title` | `string?` | — | Panel heading ("Add Customer", "Edit Customer") |
| `description` | `string?` | — | Subtitle under the title |
| `className` | `string?` | — | Extra CSS on the outer panel |
| `close` | `() => void?` | — | Close handler passed from overlay system |
| `footer` | `ReactNode?` | — | Bottom bar — usually Cancel + Save buttons |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"sm"` | Preset panel width |
| `width` | `string?` | — | Custom CSS width; overrides `size` |
| `headerSlot` | `ReactNode?` | — | Renders below title row — used for tab switcher |
| `bodyClassName` | `string?` | — | Extra CSS on the scrollable body |
| `onSubmit` | `() => void?` | — | Save handler — wired to `Ctrl+Enter` shortcut |
| `isDirty` | `boolean` | `false` | If true, closing shows "Unsaved changes" dialog |
| `closeDisabled` | `boolean` | `false` | Blocks X, Escape, backdrop while async work runs |
| `formTabs` | `FormTabsConfig?` | — | Enables `Alt+←` / `Alt+→` tab keyboard navigation |

### Preset widths (`size`)

| Size | Width |
|------|-------|
| `sm` | `min(480px, 100vw)` |
| `md` | `min(560px, 100vw)` |
| `lg` | `min(720px, 92vw)` ← Customer form uses this |
| `xl` | `min(840px, 95vw)` |

### What SidePanelCard does automatically (you don't call these yourself)

When `close` is provided, it runs `useFormOverlayRegistration()` which registers:

- `onSubmit` → global `Ctrl+Enter` triggers save
- `isDirty` → unsaved-changes guard on close
- `closeDisabled` → prevents accidental close during save
- `formTabs` → keyboard tab switching

The X button and backdrop both call `requestOverlayCloseWithConfirm()` — not `close()` directly — so dirty forms get a confirmation first.

---

## 1b. How Data / Fields Show Inside SidePanelCard

Data does **not** live in `SidePanelCard`. The card is a dumb layout shell. All field state lives in **`CustomerForm`** (the parent), and tabs receive it as props.

### Data flow diagram

```
CustomerForm (owns all state)
  │
  ├── useState<CustomerFormValues>(values)     ← single source of truth
  ├── setField(key, value)                     ← updates one field
  │
  └── SidePanelCard
        └── children:
              activeTab === "customer"
                ? <CustomerTab values={values} setField={setField} />
                : <AdvancedTab values={values} setField={setField} />
```

### Where values come from

**File:** `src/routes/customers/components/customer-form/index.tsx`

```tsx
const [values, setValues] = useState<CustomerFormValues>(() => ({
  ...getDefaultCustomerFormValues(),           // empty defaults for "create"
  ...(customer ? customerToFormValues(customer) : {}),  // pre-fill for "update"
}));

const setField = useCallback((key, value) => {
  setValues((prev) => ({ ...prev, [key]: value }));
}, []);
```

- **Create mode:** starts from `getDefaultCustomerFormValues()` (empty name, default country, etc.)
- **Update mode:** merges `customerToFormValues(customer)` on top of defaults (maps `customer.company` → `customerName`, etc.)

### How a single field renders

Every field in `CustomerTab` / `AdvancedTab` follows the same pattern:

```tsx
<FormField label="Customer Name" required>
  <LightInput
    value={values.customerName}                        // read from shared state
    onChange={(v) => setField("customerName", v)}      // write back via setField
    placeholder="Legal entity name"
  />
</FormField>
```

- `values.customerName` — current value from parent state
- `setField("customerName", v)` — updates parent state, React re-renders tab with new value
- `FormField` — label wrapper
- `LightInput` — styled input component

**SidePanelCard never touches field data.** It only wraps `{children}` in a scrollable div.

---

## 1c. CustomerTab vs AdvancedTab

Both tabs share the same props interface:

**File:** `src/routes/customers/components/customer-form/form-controls.tsx`

```tsx
export type CustomerFormFieldsProps = {
  values: CustomerFormValues;   // all form fields as one object
  setField: SetCustomerField;   // (key, value) => void
};
```

They are **pure presentation components** — no local state, no API calls. They only render inputs bound to `values` / `setField`.

### CustomerTab — "main" entity info

**File:** `src/routes/customers/components/customer-form/customer-tab.tsx`

| Section | Fields |
|---------|--------|
| Basic Information | customerName, customerId, address lines, country, state, city, zip |
| Billing Address | billing address fields + "Same as mailing" checkbox |
| Contact Ecosystem | primary/secondary contact, phones, emails |
| Regulatory & Classification | regulatory type/number, URS #, blacklisted, isBroker |

**Special logic in CustomerTab:**

- **`sameAsMailing` checkbox** — when checked, billing fields are disabled and mirror mailing address
- **`setMailingField`** — when user edits mailing address and "same as mailing" is on, billing fields auto-sync
- **`syncBillingFromMailing`** — copies all mailing → billing in one shot

This logic stays in `CustomerTab` because it only affects fields on that tab.

### AdvancedTab — billing, credit, quotes

**File:** `src/routes/customers/components/customer-form/advanced-tab.tsx`

| Section | Fields |
|---------|--------|
| Billing & Credit | currency, creditLimit, paymentTerms, salesRep, factoringCompany, websiteUrl |
| Invoice Options | showTelFaxOnInvoice, showDetailedRateOnInvoice |
| Duplicate | duplicateAsShipper, duplicateAsConsignee |
| Internal Notes | internalNotes (textarea) |
| Quote Settings | showMilesOnQuote, rateType, fscType, fscRate + $/% toggle |

No special sync logic — every field is a simple `setField(key, value)`.

### Why split into two tabs?

The customer form has **40+ fields**. Splitting keeps the first tab focused on identity/address/contact (what users fill most often) and moves billing/credit/quote settings to a second tab so the panel isn't one endless scroll.

Tab switching is controlled in `CustomerForm`:

```tsx
const [activeTab, setActiveTab] = useState<CustomerFormTab>("customer");

// In SidePanelCard headerSlot:
<FormTabs tabs={CUSTOMER_FORM_TABS} active={activeTab} onChange={handleTabChange} />

// In body:
{activeTab === "customer" ? <CustomerTab ... /> : <AdvancedTab ... />}
```

Tab IDs come from `CUSTOMER_FORM_TABS` in `customer-form.ts`: `"customer"` and `"advanced"`.

---

## 2. How `useCallback` Works in `useFormPanel` and `useCustomerFormPanel`

### The code

```tsx
// useFormPanel.tsx
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

// use-customer-form-panel.tsx
export function useCustomerFormPanel() {
  const openForm = useFormPanel();

  return useCallback(
    (mode = "create", customer?) => {
      openForm(CustomerForm, { mode, customer });
    },
    [openForm],
  );
}
```

### What `useCallback` does here (plain English)

`useCallback` **memoizes a function** — it returns the **same function reference** on re-renders unless its dependencies change.

Without it, every time `CustomersPage` re-renders (search typed, page changed, menu opened), `useCustomerFormPanel()` would return a **brand new function**. That new function would:

1. Break `useCallback` in `handleEdit` / `handleView` (they depend on `openCustomerForm`)
2. Re-trigger `usePageShortcut` effect (it depends on the handler)
3. Cause unnecessary child re-renders if passed as props

### Dependency chain

```
useOverlay()
  └── openSidePanel  ← stable (useCallback inside useOverlay, deps: [open])

useFormPanel()
  └── openForm       ← stable while openSidePanel unchanged (deps: [openSidePanel])

useCustomerFormPanel()
  └── openCustomerForm ← stable while openForm unchanged (deps: [openForm])
```

Each layer wraps the inner function and only recreates when the inner one changes. Since `open` from `AppProvider` is stable (`useCallback` with `[]` deps), the whole chain stays stable across page re-renders.

### Step-by-step when user clicks "Add Customer"

```
1. CustomersPage re-renders (maybe 50 times while user types in search)
   → openCustomerForm is STILL the same function reference (useCallback)

2. User clicks "Add Customer"
   → openCustomerForm("create") is called

3. Inside useCustomerFormPanel's useCallback:
   → openForm(CustomerForm, { mode: "create" })

4. Inside useFormPanel's useCallback:
   → openSidePanel(({ close }) => <CustomerForm mode="create" close={close} />)

5. Inside useOverlay's useCallback:
   → open("side-panel", content, { onSide: "right" })

6. AppProvider pushes to stack → SidePanel renders
```

The `useCallback` layers don't affect **when** the panel opens — they affect **stability of the function reference** so other hooks and memoized children don't break.

---

## 3. Naming: `openForm` vs `openCustomerForm`

These are **different variables at different layers**. Same pattern, different names for clarity.

### Layer map

| Variable name | Where | What it opens |
|---------------|-------|---------------|
| `openSidePanel` | `useOverlay()` | Any content — generic |
| `openForm` | `useFormPanel()` | Any **form component** in a side panel — still generic |
| `openCustomerForm` | `useCustomerFormPanel()` | Specifically the **Customer** form |
| `openAgentForm` | `useAgentFormPanel()` | Specifically the **Agent** form |
| `openCustomerForm` | `CustomersPage` | Same function, renamed at page level for readability |

### Why two names for the same thing?

```tsx
// Inside useCustomerFormPanel — generic inner name
const openForm = useFormPanel();   // "openForm" = I can open ANY form component

// Inside CustomersPage — domain-specific outer name
const openCustomerForm = useCustomerFormPanel();  // "openCustomerForm" = this page opens customers
```

**`openForm`** is an implementation detail inside the hook — it means "the generic form opener from `useFormPanel`".

**`openCustomerForm`** is the public API of the hook — when you read `CustomersPage`, you immediately know what opens without looking at imports.

Same pattern everywhere:

```tsx
// agents/index.tsx
const openAgentForm = useAgentFormPanel();

// shippers — likely
const openShipperForm = useShipperFormPanel();
```

You **could** name them all `openForm` at the page level, but then every page would have `openForm()` and it would be unclear which entity you're creating.

### What each function signature looks like

```tsx
// Generic — accepts any component + props
openForm(Component, props)

// Domain-specific — accepts business params only
openCustomerForm(mode?: "create" | "update", customer?: Customer)
openAgentForm(mode?, agent?)
```

The domain hook **hides** the component reference. The page never imports `CustomerForm` directly — it just calls `openCustomerForm("create")`.

---

## 4. Why `useSidePanel` and `useModal` Are Deprecated

**File:** `src/hooks/useOverlay.ts`

```tsx
/** @deprecated Prefer `useOverlay` */
export function useSidePanel() {
  return useOverlay();
}

/** @deprecated Prefer `useModal` */
export function useModal() {
  const { openModal, isOverlayOpen, stackDepth } = useOverlay();
  return { openModal, isOverlayOpen, stackDepth };
}
```

### Reason: they were merged into one hook

Originally the project likely had **two separate hooks**:

- `useSidePanel()` → only `openSidePanel`
- `useModal()` → only `openModal`

They were combined into **`useOverlay()`** which returns both:

```tsx
return { openSidePanel, openModal, isOverlayOpen, stackDepth };
```

### Why deprecate instead of delete?

- **Backward compatibility** — if any old code imported `useSidePanel` or `useModal`, it still works
- **Gradual migration** — `@deprecated` shows a warning in IDE so devs switch to `useOverlay`
- **No usages left** — a grep shows these deprecated exports are **only defined, never imported** anywhere else in the codebase. Safe to remove eventually.

### Why one hook is better

| Before (2 hooks) | After (1 hook) |
|------------------|----------------|
| Import `useSidePanel` for forms | Import `useOverlay` once |
| Import `useModal` for dialogs | Get both openers from same hook |
| Two context reads | One context read |
| Confusing which to use | Clear single entry point |

`useFormPanel` internally only needs `openSidePanel`, but it gets it from `useOverlay()` — no need for a separate `useSidePanel` import.

---

## 5. Why So Many Hooks Just to Open a Side Panel?

This is a fair question. The call chain is:

```
CustomersPage
  → useCustomerFormPanel()
    → useFormPanel()
      → useOverlay()
        → useAppProvider()
          → AppProvider.open()
            → SidePanel renders
              → CustomerForm
                → SidePanelCard
                  → CustomerTab / AdvancedTab
```

That's **4 hooks** before anything renders. Here's why each layer exists — and what you'd lose without it.

### Could you simplify to one line?

Yes, technically:

```tsx
// Hypothetical "simple" approach in CustomersPage
const { openSidePanel } = useOverlay();

<Btn onClick={() =>
  openSidePanel(({ close }) => <CustomerForm mode="create" close={close} />)
}>
```

That works. So why the layers?

---

### Layer-by-layer justification

| Layer | What it saves you from |
|-------|------------------------|
| **AppProvider + stack** | Managing portal, z-index, stacking multiple overlays, keyboard shortcuts, Escape handling — in every page manually |
| **useOverlay** | Remembering `APP_PROVIDER_TYPE.SIDE_PANEL`, default `onSide: "right"`, and the `({ close }) => JSX` render pattern every time |
| **useFormPanel** | Repeating `openSidePanel(({ close }) => <Component {...props} close={close} />)` in 10+ entity hooks; enforces `close` prop typing |
| **useCustomerFormPanel** | Page knowing about `CustomerForm` import, prop shapes, and mode/customer mapping |

---

### What the complexity actually buys you

#### 1. One overlay system for the whole app

Without `AppProvider`, every page would need its own modal/panel state:

```tsx
// Without AppProvider — repeated on every page
const [showForm, setShowForm] = useState(false);
{showForm && <Portal><SidePanel>...</SidePanel></Portal>}
```

With `AppProvider`, overlays stack correctly (form + confirm dialog on top), share Escape/keyboard behavior, and portal once at the root.

#### 2. Consistent form pattern across 10+ entities

These all use the same `useFormPanel` → `SidePanelCard` pattern:

- Customers, Agents, Shippers, Consignees, Carriers, Factoring, Roles, Fleet, Loads...

Adding a new entity is ~15 lines (form + domain hook), not re-building overlay plumbing.

#### 3. Domain hooks hide implementation

`CustomersPage` doesn't know:
- That a side panel is used (could switch to modal later)
- What component renders (`CustomerForm`)
- How `close` is injected

It only knows: `openCustomerForm("create")`.

#### 4. Type safety

`useFormPanel` enforces that every form component accepts `close: () => void`:

```tsx
<P extends { close: () => void }>(
  Component: ComponentType<P>,
  props: Omit<P, "close">,
)
```

TypeScript catches missing `close` at compile time.

#### 5. Cross-feature reuse

Create Load page opens Customer form from a different route:

```tsx
// loads/create/hooks/use-create-load-panels.tsx
const openCustomerForm = useCustomerFormPanel();
// Can spawn customer form without duplicating overlay logic
```

---

### Honest assessment: is it over-engineered?

| For this project | Verdict |
|------------------|---------|
| 10+ forms sharing one pattern | **Justified** — DRY pays off |
| Stack + keyboard + unsaved guard | **Justified** — hard to redo per page |
| `useCustomerFormPanel` wrapper | **Light but useful** — keeps pages clean |
| `useFormPanel` generic wrapper | **Justified** — removes boilerplate across entities |
| Deprecated `useSidePanel`/`useModal` | **Cleanup debt** — can delete, nothing uses them |

| If you only had 1–2 forms ever | Verdict |
|----------------------------------|---------|
| Full hook chain | **Overkill** — direct `openSidePanel` in the page would be fine |

**Bottom line:** The nesting looks heavy for one button click, but most layers are **infrastructure you pay once** (AppProvider, useOverlay, useFormPanel). Per-entity cost is only the thin domain hook (`useCustomerFormPanel` — 8 lines).

---

### Minimal vs current approach (comparison)

**Minimal (1 form in the app):**

```tsx
const { openSidePanel } = useOverlay();
openSidePanel(({ close }) => <CustomerForm close={close} mode="create" />);
```

**Current (scalable across app):**

```tsx
const openCustomerForm = useCustomerFormPanel();
openCustomerForm("create");
```

The current approach trades 2 extra hook files for:
- Readable page code
- Shared overlay behavior
- Easy addition of new entity forms
- Type-safe `close` injection

---

## Quick Reference

### SidePanelCard — you provide

```tsx
<SidePanelCard
  title="Add Customer"
  close={close}
  onSubmit={handleSave}
  isDirty={isDirty}
  size="lg"
  headerSlot={<FormTabs ... />}
  footer={<Cancel + Save buttons>}
>
  {/* tab content — CustomerTab or AdvancedTab */}
</SidePanelCard>
```

### Tab components — you provide

```tsx
<CustomerTab values={values} setField={setField} />
<AdvancedTab values={values} setField={setField} />
```

Both read/write the **same** `values` object owned by `CustomerForm`.

### Hooks — naming at each level

```
openSidePanel     ← generic overlay (useOverlay)
openForm          ← generic form-in-panel (useFormPanel)
openCustomerForm  ← customer-specific (useCustomerFormPanel)
```

### Deprecated — use instead

```tsx
// Don't use
useSidePanel()  →  useOverlay()
useModal()      →  useOverlay()
```

---

