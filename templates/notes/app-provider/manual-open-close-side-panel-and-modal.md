# Manual: How to Open & Close a Side Panel and Modal (Step by Step)

> A complete hands-on guide for building overlays from scratch in this project.  
> Uses **fictional demo names** (Vendor, not Customer) so you can follow without copying real route code.

---

## Before You Start — One Rule

**Never render `<SidePanel>` or `<Modal>` directly inside a page.**

Always call `openSidePanel()` or `openModal()` from a hook.  
`AppProvider` (already mounted in `App.tsx`) renders the overlay for you.

---

## Demo Names Used in This Guide

| Real project pattern | Demo name in this guide |
|----------------------|-------------------------|
| Customer | **Vendor** |
| CustomerForm | **VendorForm** |
| useCustomerFormPanel | **useVendorFormPanel** |
| openCustomerForm | **openVendorForm** |
| ViewAssetDialog | **ViewVendorDialog** |

---

# PART A — Side Panel (Form with Data)

Use a side panel when the user needs to **create or edit** something (a form).

---

## Step 0 — Confirm AppProvider Exists (Prerequisite)

**File:** `src/App.tsx`

Your app must already have this (it does in this project):

```tsx
<AppProvider>
  <RouterProvider router={router} />
</AppProvider>
```

If `AppProvider` is missing, **no overlay will ever show**. Stop here and add it first.

---

## Step 1 — Define Your Data Type

**File:** `src/routes/vendors/data/vendors.ts` *(new file)*

```tsx
export type Vendor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
};

export const VENDORS: Vendor[] = [
  { id: "V-001", name: "Acme Supplies", email: "acme@mail.com", phone: "555-0100", status: "active" },
];
```

This is the shape of data coming **from your table/API** when editing.

---

## Step 2 — Define Form Values + Defaults

**File:** `src/routes/vendors/data/vendor-form.ts` *(new file)*

Form values can differ from table data (extra fields, different key names).

```tsx
import type { Vendor } from "./vendors";

export type VendorFormMode = "create" | "update";

export type VendorFormValues = {
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
};

export function getDefaultVendorFormValues(): VendorFormValues {
  return {
    vendorName: "",
    vendorEmail: "",
    vendorPhone: "",
  };
}

/** Convert table row → form fields (for edit mode) */
export function vendorToFormValues(vendor: Vendor): VendorFormValues {
  return {
    vendorName: vendor.name,
    vendorEmail: vendor.email,
    vendorPhone: vendor.phone,
  };
}
```

**Why two types (`Vendor` vs `VendorFormValues`)?**  
Table data and form fields are often shaped differently. Mapping keeps the form independent.

---

## Step 3 — Build the Form Component

**File:** `src/routes/vendors/components/vendor-form/index.tsx` *(new file)*

### Required rules for every form overlay component

1. Must accept `close: () => void` as a prop (injected automatically by hooks)
2. Must wrap content in `<SidePanelCard>`
3. Must call `close()` after successful save
4. Use `requestOverlayCloseWithConfirm()` for Cancel — not raw `close()`

```tsx
import { useCallback, useState } from "react";
import { Btn, SidePanelCard } from "@/components/base";
import { FormField, LightInput } from "@/components/shared";
import { useFormDirty } from "@/hooks";
import { requestOverlayCloseWithConfirm } from "@/hooks/overlay-close";
import { toast } from "@/components/base/toast";
import type { Vendor } from "../../data/vendors";
import {
  getDefaultVendorFormValues,
  vendorToFormValues,
  type VendorFormMode,
  type VendorFormValues,
} from "../../data/vendor-form";

export type VendorFormProps = {
  close: () => void;           // REQUIRED — do not omit
  mode?: VendorFormMode;
  vendor?: Vendor;              // passed when editing
};

export function VendorForm({ close, mode = "create", vendor }: VendorFormProps) {
  const isUpdate = mode === "update";

  // ── STATE: initialize with defaults, merge vendor data if editing ──
  const [values, setValues] = useState<VendorFormValues>(() => ({
    ...getDefaultVendorFormValues(),
    ...(vendor ? vendorToFormValues(vendor) : {}),
  }));

  const setField = useCallback(
    <K extends keyof VendorFormValues>(key: K, value: VendorFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const isDirty = useFormDirty(values);

  const handleSave = () => {
    if (!values.vendorName.trim()) {
      toast.error("Vendor name is required");
      return;
    }

    // TODO: call API here
    toast.success(isUpdate ? "Vendor updated!" : "Vendor created!");
    close();   // ← closes the side panel (see Part A — Closing section)
  };

  return (
    <SidePanelCard
      title={isUpdate ? "Edit Vendor" : "Add Vendor"}
      close={close}
      onSubmit={handleSave}
      isDirty={isDirty}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Btn variant="outline" onClick={requestOverlayCloseWithConfirm}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSave}>
            Save
          </Btn>
        </div>
      }
    >
      <FormField label="Vendor Name" required>
        <LightInput
          value={values.vendorName}
          onChange={(v) => setField("vendorName", v)}
        />
      </FormField>

      <FormField label="Email">
        <LightInput
          value={values.vendorEmail}
          onChange={(v) => setField("vendorEmail", v)}
          type="email"
        />
      </FormField>

      <FormField label="Phone">
        <LightInput
          value={values.vendorPhone}
          onChange={(v) => setField("vendorPhone", v)}
          type="tel"
        />
      </FormField>
    </SidePanelCard>
  );
}
```

---

## Step 4 — Create the Domain Hook

**File:** `src/routes/vendors/hooks/use-vendor-form-panel.tsx` *(new file)*

This hook connects your form component to the overlay system.

```tsx
import { useCallback } from "react";
import { useFormPanel } from "@/hooks";
import { VendorForm } from "../components/vendor-form";
import type { Vendor } from "../data/vendors";
import type { VendorFormMode } from "../data/vendor-form";

export function useVendorFormPanel() {
  const openForm = useFormPanel();

  return useCallback(
    (mode: VendorFormMode = "create", vendor?: Vendor) => {
      openForm(VendorForm, { mode, vendor });
    },
    [openForm],
  );
}
```

**What happens inside `openForm` (you don't write this — it already exists):**

```tsx
// src/hooks/useFormPanel.tsx (existing — do not duplicate)
openSidePanel(({ close }) => (
  <VendorForm mode={mode} vendor={vendor} close={close} />
));
```

---

## Step 5 — Call It From Your Page

**File:** `src/routes/vendors/index.tsx` *(new file)*

```tsx
import { Btn } from "@/components/base";
import { useVendorFormPanel } from "./hooks/use-vendor-form-panel";
import type { Vendor } from "./data/vendors";

export default function VendorsPage() {
  const openVendorForm = useVendorFormPanel();

  const handleCreate = () => {
    openVendorForm("create");          // no data — empty form
  };

  const handleEdit = (vendor: Vendor) => {
    openVendorForm("update", vendor);  // passes row data into form
  };

  return (
    <div>
      <Btn onClick={handleCreate}>Add Vendor</Btn>
      <Btn onClick={() => handleEdit({ id: "V-001", name: "Acme", email: "a@b.com", phone: "555", status: "active" })}>
        Edit First Vendor
      </Btn>
    </div>
  );
}
```

---

## Step 6 — What Happens When You Click "Add Vendor" (Open Flow)

Follow this exact order. Every step matters.

```
STEP 6.1  User clicks "Add Vendor"
          → openVendorForm("create") runs

STEP 6.2  useVendorFormPanel calls:
          → openForm(VendorForm, { mode: "create" })
          (no vendor prop — form starts empty)

STEP 6.3  useFormPanel calls:
          → openSidePanel(({ close }) => <VendorForm mode="create" close={close} />)

STEP 6.4  useOverlay calls:
          → open("side-panel", contentFn, { onSide: "right" })

STEP 6.5  AppProvider.open() runs:
          → creates id = crypto.randomUUID()
          → pushes { id, type: "side-panel", content, options } onto stack
          → React re-renders AppProvider

STEP 6.6  AppProvider renders from stack:
          → <SidePanel isActive={true} onClose={() => close(id)}>
               <SidePanelContent content={contentFn} />
             </SidePanel>

STEP 6.7  SidePanel mounts:
          → renders via Portal (on top of entire app)
          → sets body overflow = hidden (page can't scroll behind panel)
          → plays slide-in animation from right
          → registers animated close handler in form-overlay-registry

STEP 6.8  SidePanelContent runs:
          → gets animated close via useAnimatedSidePanelClose()
          → calls contentFn({ close: animatedClose })
          → renders <VendorForm mode="create" close={animatedClose} />

STEP 6.9  VendorForm mounts:
          → useState initializes values from getDefaultVendorFormValues()
          → SidePanelCard registers form (onSubmit, isDirty) for keyboard shortcuts
          → fields render empty, ready for input

DONE — panel is open, user sees the form
```

### Passing data in edit mode — what changes

Only **Step 6.2** and **Step 6.9** differ:

```
openVendorForm("update", vendor)
  → openForm(VendorForm, { mode: "update", vendor: vendorObject })

VendorForm useState init:
  → { ...getDefaultVendorFormValues(), ...vendorToFormValues(vendor) }
  → fields pre-filled with vendor.name → vendorName, etc.
```

The overlay machinery (Steps 6.3–6.8) is identical for create and edit.

---

## Step 7 — How to Close the Side Panel (All Paths)

There are **5 ways** a user can close. Each path is different.

---

### Path 1 — Save button (happy path)

```
User clicks Save
  → handleSave() runs
  → validation passes
  → API call (optional)
  → close() called directly

close() here = animated close (from SidePanelContent)
  → SidePanel sets isOpen = false
  → slide-out animation plays (~200ms)
  → AnimatePresence onExitComplete fires
  → AppProvider.close(id) removes item from stack
  → SidePanel unmounts
  → body overflow restored
```

**Use `close()` directly on save** — no unsaved-changes check needed (user chose to save).

---

### Path 2 — Cancel button

```
User clicks Cancel
  → requestOverlayCloseWithConfirm() runs

Inside requestOverlayCloseWithConfirm:
  1. Is unsaved confirm dialog already open? → dismiss it, stop
  2. Is form close blocked (closeDisabled)? → stop
  3. Is form dirty (isDirty = true)? → show "Unsaved changes" notify, stop
  4. Otherwise → call animated close()

If dirty → user sees notify dialog:
  → "Discard" → animated close runs → panel closes
  → "Keep editing" / dismiss → panel stays open
```

**Always use `requestOverlayCloseWithConfirm()` for Cancel** — never raw `close()` on Cancel.

---

### Path 3 — X button (top right of SidePanelCard)

```
User clicks X
  → SidePanelCard.handleClose()
  → requestOverlayCloseWithConfirm()
  → same dirty-check flow as Cancel (Path 2)
```

---

### Path 4 — Click backdrop (outside the panel)

```
User clicks the blurred area behind the panel
  → SidePanel backdrop onClick
  → requestOverlayCloseWithConfirm()
  → same dirty-check flow as Cancel (Path 2)
```

---

### Path 5 — Press Escape key

```
User presses Escape
  → useKeyboardShortcuts (in AppProvider) catches it
  → requestOverlayCloseWithConfirm()
  → same dirty-check flow as Cancel (Path 2)

Edge case: if unsaved confirm dialog is already open
  → Escape dismisses the notify dialog first
  → panel stays open
```

---

### Close flow diagram (all paths)

```
                    ┌─────────────────┐
                    │  User wants to  │
                    │  close panel    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
           [Save]      [Cancel/X/         [Escape]
              │         Backdrop]              │
              │              │              │
              ▼              ▼              ▼
         handleSave()   requestOverlay   requestOverlay
              │         CloseWithConfirm CloseWithConfirm
              │              │              │
              ▼              ▼              │
           close()      isDirty? ────────────┘
              │         /     \
              │       yes      no
              │        │        │
              │   show notify  animated
              │   dialog       close()
              │        │
              │   [Discard] → animated close()
              │
              ▼
         animated close()
              │
              ▼
         slide-out animation
              │
              ▼
         AppProvider.close(id)
              │
              ▼
         panel removed from DOM
```

---

## Step 8 — Edge Cases for Side Panels (Do Not Skip)

### Edge case 1 — Form is dirty

If user typed anything and tries to close via Cancel/X/backdrop/Escape:

- Panel does **not** close immediately
- "Unsaved changes" notify appears
- User must confirm discard or keep editing

**Fix:** pass `isDirty={true}` to `SidePanelCard` (via `useFormDirty(values)`).

---

### Edge case 2 — Save in progress (async)

If your save takes time (API call), block accidental close:

```tsx
const [saving, setSaving] = useState(false);

<SidePanelCard closeDisabled={saving} ...>
```

While `closeDisabled={true}`:
- X button is disabled
- Escape does nothing
- Backdrop click does nothing

**Still call `close()` yourself after save succeeds.**

---

### Edge case 3 — Validation failure

If validation fails, **do not call `close()`**:

```tsx
const handleSave = () => {
  if (!values.vendorName.trim()) {
    toast.error("Vendor name is required");
    return;   // ← panel stays open
  }
  close();
};
```

---

### Edge case 4 — Opening panel from inside another page/feature

You can import and use `useVendorFormPanel()` from any route:

```tsx
// Some other page
import { useVendorFormPanel } from "@/routes/vendors/hooks/use-vendor-form-panel";

const openVendorForm = useVendorFormPanel();
openVendorForm("create");
```

No extra setup needed — AppProvider is global.

---

### Edge case 5 — Multiple overlays stacked

If a side panel is open and something opens a modal on top:

```
stack = [ side-panel-item, modal-item ]
         ↑ not active      ↑ active (only this receives Escape/clicks)
```

- Only the **top** overlay is interactive
- Lower overlay stays mounted but invisible
- When top closes, lower panel becomes active again

---

### Edge case 6 — Side panel from left instead of right

```tsx
// If using useOverlay directly (not useFormPanel):
openSidePanel(
  ({ close }) => <VendorForm close={close} />,
  { onSide: "left" }
);
```

Default is `"right"`. `useFormPanel` always uses right.

---

### Edge case 7 — Ctrl+Enter to submit

If you pass `onSubmit={handleSave}` to `SidePanelCard`:

- User can press `Ctrl+Enter` (or `Cmd+Enter` on Mac) to save
- Works automatically — no extra code in your form

---

### Edge case 8 — useCallback is required in hooks

Always wrap hook return values in `useCallback`:

```tsx
return useCallback(
  (mode, vendor) => { openForm(VendorForm, { mode, vendor }); },
  [openForm],
);
```

Without it, page re-renders create new function references and break dependent hooks.

---

# PART B — Modal (Read-Only / Quick Dialog)

Use a modal when the user needs to **view something** or confirm a quick action — not a full form.

---

## Step 1 — Build the Modal Content Component

**File:** `src/routes/vendors/components/view-vendor-dialog.tsx` *(new file)*

### Required rules for every modal component

1. Must accept `close: () => void`
2. Wrap content in `<ModalCard>` (not SidePanelCard)
3. Call `close()` when done

```tsx
import { Btn, ModalCard } from "@/components/base";
import type { Vendor } from "../data/vendors";

type ViewVendorDialogProps = {
  vendor: Vendor;
  close: () => void;    // REQUIRED
};

export function ViewVendorDialog({ vendor, close }: ViewVendorDialogProps) {
  return (
    <ModalCard
      title={vendor.name}
      description={`ID: ${vendor.id}`}
      close={close}
      width="min(32rem, 92vw)"
      footer={
        <div className="flex justify-end gap-2">
          <Btn variant="outline" onClick={close}>Close</Btn>
        </div>
      }
    >
      <dl className="space-y-2 text-sm">
        <div><dt className="font-medium">Email</dt><dd>{vendor.email}</dd></div>
        <div><dt className="font-medium">Phone</dt><dd>{vendor.phone}</dd></div>
        <div><dt className="font-medium">Status</dt><dd>{vendor.status}</dd></div>
      </dl>
    </ModalCard>
  );
}
```

**Modal vs SidePanelCard:**

| | SidePanelCard | ModalCard |
|--|---------------|-----------|
| Position | Slides from right/left | Centered on screen |
| Use for | Create / Edit forms | View / Confirm / Quick action |
| Close animation | Slide out | Fade out |
| `isDirty` guard | Yes (built-in) | No (pass `close` directly) |
| Body scroll lock | Yes | Yes |

---

## Step 2 — Create the Modal Hook

**File:** `src/routes/vendors/hooks/use-view-vendor-dialog.tsx` *(new file)*

For modals, use `useOverlay` directly (not `useFormPanel`):

```tsx
import { useCallback } from "react";
import { useOverlay } from "@/hooks";
import { ViewVendorDialog } from "../components/view-vendor-dialog";
import type { Vendor } from "../data/vendors";

export function useViewVendorDialog() {
  const { openModal } = useOverlay();

  return useCallback(
    (vendor: Vendor) => {
      openModal(({ close }) => (
        <ViewVendorDialog vendor={vendor} close={close} />
      ));
    },
    [openModal],
  );
}
```

---

## Step 3 — Call It From Your Page

```tsx
import { useViewVendorDialog } from "./hooks/use-view-vendor-dialog";

export default function VendorsPage() {
  const openViewVendor = useViewVendorDialog();

  const handleView = (vendor: Vendor) => {
    openViewVendor(vendor);   // passes vendor data into dialog
  };

  return (
    <Btn onClick={() => handleView(VENDORS[0])}>View Vendor</Btn>
  );
}
```

---

## Step 4 — What Happens When You Click "View Vendor" (Open Flow)

```
STEP 4.1  User clicks "View Vendor"
          → openViewVendor(vendor) runs

STEP 4.2  useViewVendorDialog calls:
          → openModal(({ close }) => <ViewVendorDialog vendor={vendor} close={close} />)

STEP 4.3  useOverlay calls:
          → open("modal", contentFn, options)

STEP 4.4  AppProvider.open() runs:
          → creates UUID id
          → pushes { id, type: "modal", content, options } onto stack
          → re-renders

STEP 4.5  AppProvider renders:
          → <Modal isActive={true} onClose={() => close(id)}>
               {contentFn({ close: () => close(id) })}
             </Modal>

STEP 4.6  Modal mounts:
          → renders via Portal
          → sets body overflow = hidden
          → Backdrop fades in (centered dark overlay)
          → ViewVendorDialog renders inside with vendor data

DONE — modal is open, user sees vendor details
```

**Key difference from side panel:** Modal passes `close` directly from AppProvider (no slide animation step). Calling `close()` immediately removes from stack.

---

## Step 5 — How to Close the Modal (All Paths)

### Path 1 — Close button in footer

```
User clicks Close
  → close() called directly
  → AppProvider.close(id)
  → Modal unmounts immediately (fade out via Backdrop)
```

### Path 2 — X button on ModalCard

```
User clicks X
  → close() called directly (ModalCard passes close to X button)
  → AppProvider.close(id)
  → Modal unmounts
```

### Path 3 — Click backdrop

```
User clicks dark area outside ModalCard
  → Backdrop onClick
  → requestOverlayCloseWithConfirm()
  → for modals without isDirty registration → closes immediately
```

### Path 4 — Press Escape

```
User presses Escape
  → useKeyboardShortcuts catches it
  → requestOverlayCloseWithConfirm()
  → closes modal (no dirty check unless you registered a form)
```

---

## Step 6 — Edge Cases for Modals

### Edge case 1 — Modal on top of side panel

```
User has VendorForm open (side panel)
  → something calls openModal(...)
  → stack = [side-panel, modal]
  → modal is active, form is hidden behind it
  → closing modal reveals form again (still open, still dirty)
```

Plan for this if your form opens confirmation modals.

---

### Edge case 2 — Do not use useFormPanel for modals

`useFormPanel` always opens a **side panel**. For modals, use `useOverlay().openModal` directly.

---

### Edge case 3 — Modal with a form inside

If your modal has editable fields and you want dirty-check:

- You can still use `SidePanelCard`-style registration, but modals typically use `ModalCard` without `isDirty`
- For forms with dirty-check, prefer a **side panel** instead
- Or call `requestOverlayCloseWithConfirm()` on cancel if you add custom dirty logic

---

### Edge case 4 — Passing different data each time

Each call to `openViewVendor(vendor)` creates a **new stack item** with a fresh UUID.  
Old modals in the stack stay until explicitly closed.

---

# PART C — Quick Decision Guide

```
Need to CREATE or EDIT records?
  → Side Panel
  → useFormPanel + SidePanelCard
  → Domain hook: useVendorFormPanel
  → Page calls: openVendorForm("create") or openVendorForm("update", data)

Need to VIEW details or quick confirm?
  → Modal
  → useOverlay().openModal + ModalCard
  → Domain hook: useViewVendorDialog
  → Page calls: openViewVendor(data)
```

---

# PART D — File Checklist (Copy When Building New Feature)

For a new **side panel form** entity, create these files:

```
src/routes/vendors/
├── data/
│   ├── vendors.ts              ← table/API type + mock data
│   └── vendor-form.ts            ← form values + defaults + mapper
├── components/
│   └── vendor-form/
│       └── index.tsx             ← VendorForm (SidePanelCard + fields)
├── hooks/
│   └── use-vendor-form-panel.tsx ← connects form to overlay
└── index.tsx                     ← page, calls openVendorForm()
```

For a new **modal dialog**, create:

```
src/routes/vendors/
├── components/
│   └── view-vendor-dialog.tsx    ← ViewVendorDialog (ModalCard + content)
├── hooks/
│   └── use-view-vendor-dialog.tsx ← connects dialog to overlay
└── index.tsx                     ← page, calls openViewVendor()
```

---

# PART E — Common Mistakes

| Mistake | Result | Fix |
|---------|--------|-----|
| Render `<SidePanel>` in page directly | Double panels, no stack, broken z-index | Use `openSidePanel()` hook only |
| Forget `close` prop on form component | TypeScript error or runtime crash | Always add `close: () => void` to props |
| Call `close()` on Cancel button | Skips unsaved-changes guard | Use `requestOverlayCloseWithConfirm()` |
| Use `useFormPanel` for a modal | Opens side panel instead of modal | Use `openModal()` for modals |
| Skip `useCallback` in domain hook | Page re-renders break handlers | Wrap return in `useCallback` |
| Forget `isDirty` on SidePanelCard | User loses data silently on close | Pass `isDirty={useFormDirty(values)}` |
| Call `openVendorForm()` outside AppProvider | Hook throws error | Ensure component is inside `<AppProvider>` |
| Pass wrong data shape to form | Fields empty in edit mode | Check `vendorToFormValues()` mapping |

---

# PART F — Minimum Working Example (Side Panel Only)

If you want the shortest possible working version with no extra hooks:

```tsx
// In any page inside AppProvider:
import { useOverlay } from "@/hooks";
import { SidePanelCard, Btn } from "@/components/base";

function MyPage() {
  const { openSidePanel } = useOverlay();

  const handleOpen = () => {
    openSidePanel(({ close }) => (
      <SidePanelCard title="Hello" close={close} footer={<Btn onClick={close}>Done</Btn>}>
        <p>Panel content here</p>
      </SidePanelCard>
    ));
  };

  return <Btn onClick={handleOpen}>Open Panel</Btn>;
}
```

This works but **does not scale**. For real features, follow Part A (domain hook pattern).

---

*Manual for FleetNexa Frontend Web — demo entity: Vendor*
