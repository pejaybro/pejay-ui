# Panels Overlay Manager

A modular, stack-safe, and keyboard-friendly Side Panel and Modal manager for React. Supports overlay stacking, split context to prevent re-renders, and automatic keyboard shortcuts.

---

## The One Golden Rule

> **Never render `<SidePanel>` or `<Modal>` directly inside a page.**
>
> Always trigger overlays through a hook. `PanelProvider` renders everything via a React Portal on top of your entire app — you never place overlay components inside your page tree.

---

## Quick Start — Setup (Do This Once)

Wrap your root application in `PanelProvider` (in `src/main.tsx` or `src/App.tsx`):

```tsx
import { PanelProvider } from "@/pejay-ui/panels";

export default function App() {
  return (
    <PanelProvider>
      <YourApp />
    </PanelProvider>
  );
}
```

> **Important:** If `PanelProvider` is missing, **no overlay will ever appear**. Always do this step first.

---

## The 4 Overlay Types

There are 4 ways to open an overlay. Choose the one that fits your use case:

| Type                | Hook                            | Card            | Best for                                         |
| :------------------ | :------------------------------ | :-------------- | :----------------------------------------------- |
| **Form Side Panel** | `useFormPanel()`                | `SidePanelCard` | Create / Edit forms in a slide-in panel          |
| **Form Modal**      | `useModalForm()`                | `ModalCard`     | Create / Edit forms in a centered dialog         |
| **Raw Side Panel**  | `useOverlay().openRawSidePanel` | `SidePanelRaw`  | Fully custom side panel — you control everything |
| **Raw Modal**       | `useOverlay().openRawModal`     | `ModalRaw`      | Fully custom modal — you control everything      |

See the `vendor-example/` folder for a working reference of all 4 types.

---

## Pattern 1 — Form Side Panel (4-File Pattern)

Use this for create/edit forms. See `vendor-example/by-using-sidepanel/` for the full working example.

### File 1 — Types (`your-types.ts`)

```tsx
// The entity model (from your API / table row)
export type Vendor = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

// The form field values (can differ from entity shape)
export type VendorFormValues = {
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
};

export function getDefaultVendorFormValues(): VendorFormValues {
  return { vendorName: "", vendorEmail: "", vendorPhone: "" };
}

export function vendorToFormValues(vendor: Vendor): VendorFormValues {
  return {
    vendorName: vendor.name,
    vendorEmail: vendor.email,
    vendorPhone: vendor.phone,
  };
}
```

### File 2 — Form Component (`your-form.tsx`)

Rules every form overlay component **must** follow:

1. Accept `close: () => void` — injected automatically by the hook.
2. Wrap content in `<SidePanelCard>`.
3. Call `close()` only after a successful save.
4. Use `requestOverlayCloseWithConfirm` on Cancel so the dirty guard works.

```tsx
import { useState } from "react";
import {
  SidePanelCard,
  useFormDirty,
  requestOverlayCloseWithConfirm,
} from "@/pejay-ui/panels";
import type { Vendor } from "./your-types";
import { getDefaultVendorFormValues, vendorToFormValues } from "./your-types";

export type VendorFormMode = "create" | "update";
export type VendorFormProps = {
  close: () => void; // REQUIRED — always accept this
  mode?: VendorFormMode;
  vendor?: Vendor;
};

export function VendorForm({
  close,
  mode = "create",
  vendor,
}: VendorFormProps) {
  const [values, setValues] = useState(() => ({
    ...getDefaultVendorFormValues(),
    ...(vendor ? vendorToFormValues(vendor) : {}),
  }));

  const isDirty = useFormDirty(values);

  const handleSave = () => {
    if (!values.vendorName.trim()) return alert("Name required");
    console.log("Saving:", values);
    close();
  };

  return (
    <SidePanelCard
      title={mode === "update" ? "Edit Vendor" : "Add Vendor"}
      close={close}
      onSubmit={handleSave} // enables Ctrl+Enter
      isDirty={isDirty} // enables unsaved-changes guard
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={requestOverlayCloseWithConfirm}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      }
    >
      <input
        value={values.vendorName}
        onChange={e => setValues(p => ({ ...p, vendorName: e.target.value }))}
        placeholder="Vendor Name"
      />
    </SidePanelCard>
  );
}
```

### File 3 — Domain Hook (`useYourFormPanel.tsx`)

```tsx
import { useCallback } from "react";
import { useFormPanel } from "@/pejay-ui/panels";
import { VendorForm, type VendorFormMode } from "./your-form";
import type { Vendor } from "./your-types";

export function useVendorFormPanel() {
  const openForm = useFormPanel(); // <-- opens as SIDE PANEL

  return useCallback(
    (mode: VendorFormMode = "create", vendor?: Vendor) => {
      openForm(VendorForm, { mode, vendor });
    },
    [openForm],
  );
}
```

### File 4 — Page Component (`YourPage.tsx`)

```tsx
import { useVendorFormPanel } from "./useVendorFormPanel";

export default function VendorsPage() {
  const openVendorForm = useVendorFormPanel();

  return (
    <div>
      <button onClick={() => openVendorForm("create")}>Add Vendor</button>
      <button onClick={() => openVendorForm("update", selectedVendor)}>
        Edit Vendor
      </button>
    </div>
  );
}
```

---

## Pattern 2 — Form Modal (4-File Pattern)

Same form, same data — but opens in a **centered modal dialog** instead of a side panel. Only Files 2, 3, and 4 change. See `vendor-example/by-using-modal/` for the full working example.

### File 1 — Types (`your-types.ts`)

Identical to Pattern 1. The same type definitions work for both side panels and modals.

### File 2 — Form Component (`your-modal-form.tsx`)

The only difference from Pattern 1 is the wrapper: use `<ModalCard>` instead of `<SidePanelCard>`. All props are identical.

```tsx
import { useState } from "react";
import {
  ModalCard,
  useFormDirty,
  requestOverlayCloseWithConfirm,
} from "@/pejay-ui/panels";
import type { Vendor } from "./your-types";
import { getDefaultVendorFormValues, vendorToFormValues } from "./your-types";

export type VendorFormMode = "create" | "update";
export type VendorModalFormProps = {
  close: () => void;
  mode?: VendorFormMode;
  vendor?: Vendor;
};

export function VendorModalForm({
  close,
  mode = "create",
  vendor,
}: VendorModalFormProps) {
  const [values, setValues] = useState(() => ({
    ...getDefaultVendorFormValues(),
    ...(vendor ? vendorToFormValues(vendor) : {}),
  }));

  const isDirty = useFormDirty(values);

  const handleSave = () => {
    if (!values.vendorName.trim()) return alert("Name required");
    console.log("Saving:", values);
    close();
  };

  return (
    <ModalCard
      title={mode === "update" ? "Edit Vendor" : "Add Vendor"}
      description="Fill in the vendor details below."
      close={close}
      onSubmit={handleSave} // enables Ctrl+Enter
      isDirty={isDirty} // enables unsaved-changes guard
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={requestOverlayCloseWithConfirm}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      }
    >
      <input
        value={values.vendorName}
        onChange={e => setValues(p => ({ ...p, vendorName: e.target.value }))}
        placeholder="Vendor Name"
      />
    </ModalCard>
  );
}
```

### File 3 — Domain Hook (`useYourModalForm.tsx`)

Use `useModalForm()` instead of `useFormPanel()` — that's the only change.

```tsx
import { useCallback } from "react";
import { useModalForm } from "@/pejay-ui/panels";
import { VendorModalForm, type VendorFormMode } from "./your-modal-form";
import type { Vendor } from "./your-types";

export function useVendorModalForm() {
  const openForm = useModalForm(); // <-- opens as MODAL

  return useCallback(
    (mode: VendorFormMode = "create", vendor?: Vendor) => {
      openForm(VendorModalForm, { mode, vendor });
    },
    [openForm],
  );
}
```

### File 4 — Page Component (`YourModalPage.tsx`)

```tsx
import { useVendorModalForm } from "./useVendorModalForm";

export default function VendorModalPage() {
  const openVendorModal = useVendorModalForm();

  return (
    <div>
      <button onClick={() => openVendorModal("create")}>
        Add Vendor (Modal)
      </button>
      <button onClick={() => openVendorModal("update", selectedVendor)}>
        Edit Vendor (Modal)
      </button>
    </div>
  );
}
```

---

## Pattern 3 — Raw Side Panel (Custom Layout)

Use this when you need **100% custom content** in a side panel — no title, no X button, no footer. Your content receives a `{ close }` callback and is fully responsible for its own layout.

### Option A — Quick Inline (single page)

Call it directly inside the page. Good for a one-off panel that's only used in one place:

```tsx
import { useOverlay } from "@/pejay-ui/panels";

function MyPage() {
  const { openRawSidePanel } = useOverlay();

  const handleOpen = () => {
    openRawSidePanel(({ close }) => (
      <div className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Custom Side Panel</h2>
        <p>You control the entire layout here.</p>
        <button onClick={close}>Close Me</button>
      </div>
    ));
  };

  return <button onClick={handleOpen}>Open Custom Side Panel</button>;
}
```

### Option B — Domain Hook (reuse across pages)

Follow the same domain hook pattern as Patterns 1 & 2 if you need to open the same custom panel from multiple pages. Create 2 files:

**`my-custom-panel.tsx`** — your custom content component:

```tsx
// Accepts close injected by the hook
export type MyCustomPanelProps = {
  close: () => void;
  someData?: string; // any extra props your panel needs
};

export function MyCustomPanel({ close, someData }: MyCustomPanelProps) {
  return (
    <div className="p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold">Custom Side Panel</h2>
      <p>Data: {someData}</p>
      <button onClick={close}>Close</button>
    </div>
  );
}
```

**`useMyCustomPanel.tsx`** — the domain hook:

```tsx
import { useCallback } from "react";
import { useOverlay } from "@/pejay-ui/panels";
import { MyCustomPanel } from "./my-custom-panel";

export function useMyCustomPanel() {
  const { openRawSidePanel } = useOverlay();

  return useCallback(
    (someData?: string) => {
      openRawSidePanel(({ close }) => (
        <MyCustomPanel close={close} someData={someData} />
      ));
    },
    [openRawSidePanel],
  );
}
```

**Any page** — just call the hook:

```tsx
import { useMyCustomPanel } from "./useMyCustomPanel";

function PageA() {
  const openPanel = useMyCustomPanel();
  return <button onClick={() => openPanel("hello")}>Open Panel</button>;
}

function PageB() {
  const openPanel = useMyCustomPanel();
  return <button onClick={() => openPanel("world")}>Open Panel</button>;
}
```

---

## Pattern 4 — Raw Modal (Custom Layout)

Same as Pattern 3, but opens a **centered modal** with no chrome. Follows the exact same two options.

### Option A — Quick Inline (single page)

```tsx
import { useOverlay } from "@/pejay-ui/panels";

function MyPage() {
  const { openRawModal } = useOverlay();

  const handleOpen = () => {
    openRawModal(({ close }) => (
      <div className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Custom Modal</h2>
        <p>You control the entire layout here.</p>
        <button onClick={close}>Dismiss</button>
      </div>
    ));
  };

  return <button onClick={handleOpen}>Open Custom Modal</button>;
}
```

### Option B — Domain Hook (reuse across pages)

**`my-custom-modal.tsx`** — your custom content component:

```tsx
export type MyCustomModalProps = {
  close: () => void;
  someData?: string;
};

export function MyCustomModal({ close, someData }: MyCustomModalProps) {
  return (
    <div className="p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold">Custom Modal</h2>
      <p>Data: {someData}</p>
      <button onClick={close}>Dismiss</button>
    </div>
  );
}
```

**`useMyCustomModal.tsx`** — the domain hook:

```tsx
import { useCallback } from "react";
import { useOverlay } from "@/pejay-ui/panels";
import { MyCustomModal } from "./my-custom-modal";

export function useMyCustomModal() {
  const { openRawModal } = useOverlay();

  return useCallback(
    (someData?: string) => {
      openRawModal(({ close }) => (
        <MyCustomModal close={close} someData={someData} />
      ));
    },
    [openRawModal],
  );
}
```

**Any page** — just call the hook:

```tsx
import { useMyCustomModal } from "./useMyCustomModal";

function PageA() {
  const openModal = useMyCustomModal();
  return <button onClick={() => openModal("hello")}>Open Modal</button>;
}
```

---

## Working Examples

```text
panels/
└── vendor-example/
    ├── by-using-sidepanel/          ← Pattern 1 (Form Side Panel)
    │   ├── vendor-types.ts
    │   ├── vendor-form.tsx          ← Uses SidePanelCard
    │   ├── useVendorFormPanel.tsx   ← Uses useFormPanel()
    │   └── VendorsPage.tsx
    └── by-using-modal/              ← Pattern 2 (Form Modal)
        ├── vendor-types.ts
        ├── vendor-modal-form.tsx    ← Uses ModalCard
        ├── useVendorModalForm.tsx   ← Uses useModalForm()
        └── VendorModalPage.tsx
```

For **Patterns 3 & 4** (Raw Wrappers), you have two options:

- **Option A (Inline):** Best for one-off panels used in a single page.
- **Option B (Domain Hook):** Best when the same custom panel is reused across multiple pages.

Both options follow the same two-file structure shown above, except they do **not** require a `vendor-types.ts` file.

See **`COMPONENTS.md`** for the complete prop reference for all four built-in card types.

---

## Keyboard Shortcuts

The following shortcuts are automatically available whenever a panel or modal is open:

| Shortcut                     | Action                                     |
| :--------------------------- | :----------------------------------------- |
| `Esc`                        | Close the topmost panel or modal           |
| `Ctrl + Enter` / `⌘ + Enter` | Submit the active form (calls `onSubmit`)  |
| `Alt + ← / →`                | Switch between tabs in a tabbed form panel |
| `Shift + ?`                  | Open the keyboard shortcuts help dialog    |

---

## Advanced — Creating a Custom Card Type

The four built-in card types (`SidePanelCard`, `ModalCard`, `SidePanelRaw`, and `ModalRaw`) cover most use cases. If you need a completely different presentation—such as a **bottom drawer**, **fullscreen overlay**, **toast-style notification panel**, or any other custom container—you can register your own card type in four steps.

> **Note:** This requires modifying `PanelProvider.tsx` and `constants.ts` inside your project's installed `pejay-ui/panels/` directory.

---

### Step 1 — Register a New Type (`constants.ts`)

Add a new entry to the `APP_PROVIDER_TYPE` constant:

```ts
// src/pejay-ui/panels/core/constants.ts
export const APP_PROVIDER_TYPE = {
  MODAL: "modal",
  SIDE_PANEL: "side-panel",
  MODAL_RAW: "modal-raw",
  SIDE_PANEL_RAW: "side-panel-raw",
  BOTTOM_DRAWER: "bottom-drawer", // Your custom type
} as const;
```

### Step 2 — Build your card component

Create your card however you like. The only contract is that it receives `children` and whatever extra props you need. There are no rules on layout:

```tsx
// src/pejay-ui/panels/components/bottom-drawer/bottom-drawer-card.tsx
import type { ReactNode } from "react";

interface BottomDrawerCardProps {
  children: ReactNode;
  close: () => void;
  title?: string;
}

export function BottomDrawerCard({
  children,
  close,
  title,
}: BottomDrawerCardProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        {title && <h2 className="text-lg font-bold">{title}</h2>}
        <button onClick={close} className="ml-auto">
          ✕
        </button>
      </div>
      {children}
    </div>
  );
}
```

---

### Step 3 — Register it in `PanelProvider.tsx`

Import your new card and add a new `if` block inside the `stack.map()` renderer:

```tsx
// src/pejay-ui/panels/core/PanelProvider.tsx
import { BottomDrawerCard } from "../components/bottom-drawer/bottom-drawer-card";
import { Backdrop } from "../components/modal/backdrop"; // reuse existing backdrop

// Inside stack.map((item, index) => { ... }):

/* ── Bottom Drawer ── */
if (item.type === APP_PROVIDER_TYPE.BOTTOM_DRAWER) {
  const closeId = () => close(item.id);
  return (
    <div
      key={item.id}
      style={{ position: "fixed", inset: 0, zIndex: getOverlayContentZ(layer) }}
    >
      <Backdrop onClick={closeId} layer={layer} />
      <BottomDrawerCard close={closeId} title={item.options?.title as string}>
        {item.content?.({ close: closeId })}
      </BottomDrawerCard>
    </div>
  );
}
```

> **Tip:** You can reuse the existing `<Backdrop>`, `<SidePanel>`, or `<Modal>` shell components as outer containers and only swap out the inner card — this gives you the backdrop + animation for free.

---

### Step 4 — Create an `openBottomDrawer` hook

Use `usePanelOverlayActions()` to access the raw `open` primitive and wrap it in a clean hook:

```tsx
// src/pejay-ui/panels/hooks/useBottomDrawer.tsx
import { useCallback } from "react";
import { usePanelOverlayActions } from "../core/panel-context";
import { APP_PROVIDER_TYPE } from "../core/constants";
import type { OverlayContent } from "../core/types";

export function useBottomDrawer() {
  const { open } = usePanelOverlayActions();

  return useCallback(
    (content: OverlayContent, title?: string) => {
      open(APP_PROVIDER_TYPE.BOTTOM_DRAWER, content, { title });
    },
    [open],
  );
}
```

---

### Using it (same domain hook pattern as all other types)

**Option A — Inline:**

```tsx
import { useBottomDrawer } from "@/pejay-ui/panels/hooks/useBottomDrawer";

function MyPage() {
  const openDrawer = useBottomDrawer();

  return (
    <button
      onClick={() =>
        openDrawer(
          ({ close }) => (
            <div>
              <p>Bottom drawer content</p>
              <button onClick={close}>Close</button>
            </div>
          ),
          "My Drawer Title",
        )
      }
    >
      Open Drawer
    </button>
  );
}
```

**Option B — Domain hook for reuse:**

```tsx
// useMyDrawer.tsx
import { useCallback } from "react";
import { useBottomDrawer } from "@/pejay-ui/panels/hooks/useBottomDrawer";
import { MyDrawerContent } from "./my-drawer-content";

export function useMyDrawer() {
  const openDrawer = useBottomDrawer();

  return useCallback(
    (data?: MyData) => {
      openDrawer(
        ({ close }) => <MyDrawerContent close={close} data={data} />,
        "My Drawer",
      );
    },
    [openDrawer],
  );
}
```

```tsx
// Any page
import { useMyDrawer } from "./useMyDrawer";

function PageA() {
  const openDrawer = useMyDrawer();
  return <button onClick={() => openDrawer(rowData)}>Open Drawer</button>;
}
```

> **Important:** Your custom hook (`useBottomDrawer`) lives inside your project's `pejay-ui/panels/hooks/` folder, not in the `@/pejay-ui/panels` barrel export by default. Either import it directly from its file path, or add it to `hooks/index.ts` so it's available from the main `@/pejay-ui/panels` import.
