# Panel Component Cards Reference

There are **4 card types** available depending on how much control you need over the overlay's layout.

---

## Form Cards (Recommended for most use cases)

These cards include a built-in title row, X button, footer slot, and full keyboard shortcut support (`Ctrl+Enter` to submit, `Escape` to close with dirty guard, tab navigation via `Alt+Arrow`).

### `SidePanelCard`
A full-height side panel that slides in from the right (or left). Use for **create / edit forms**.

```tsx
import { SidePanelCard } from "@/pejay-ui/panels";

<SidePanelCard
  title="Add Vendor"
  close={close}
  onSubmit={handleSave}
  isDirty={isDirty}
  size="md"           // "sm" | "md" | "lg" | "xl"
  footer={<SaveCancelButtons />}
  headerSlot={<TabsRow />}
>
  {/* your form fields */}
</SidePanelCard>
```

### `ModalCard`
A centered modal dialog. Same feature set as `SidePanelCard`. Use for **confirmations, quick edits, or view dialogs**.

```tsx
import { ModalCard } from "@/pejay-ui/panels";

<ModalCard
  title="Edit Vendor"
  description="Update the vendor's details."
  close={close}
  onSubmit={handleSave}
  isDirty={isDirty}
  size="md"           // "sm" | "md" | "lg" | "xl"
  footer={<SaveCancelButtons />}
>
  {/* your form fields */}
</ModalCard>
```

| Prop | Type | Description |
|:---|:---|:---|
| `title` | `string` | Heading shown at the top |
| `description` | `string` | Subtitle below the title |
| `close` | `() => void` | Injected by the hook — always pass through |
| `onSubmit` | `() => void` | Enables `Ctrl+Enter` shortcut |
| `isDirty` | `boolean` | When `true`, blocks close with unsaved-changes guard |
| `closeDisabled` | `boolean` | Disables X and Escape (use during async saves) |
| `footer` | `ReactNode` | Bottom bar — typically Cancel + Save buttons |
| `headerSlot` | `ReactNode` | Renders below title (e.g. tab switcher row) |
| `size` | `"sm"\|"md"\|"lg"\|"xl"` | Controls width preset |
| `formTabs` | `FormTabsConfig` | Enables `Alt+Arrow` tab switching |

---

## Raw Wrappers (For fully custom layouts)

These wrappers render **only** a container with `p-2` padding. No title, no X button, no footer. Your content receives a `{ close }` callback and is fully responsible for triggering its own close action.

Use raw wrappers when you need to build a completely custom overlay layout that doesn't fit the standard form card structure.

### `SidePanelRaw`
Opened via `openRawSidePanel` from `useOverlay`.

```tsx
import { useOverlay } from "@/pejay-ui/panels";

const { openRawSidePanel } = useOverlay();

openRawSidePanel(({ close }) => (
  <div>
    <p>Fully custom side panel content.</p>
    <button onClick={close}>Dismiss</button>
  </div>
));
```

### `ModalRaw`
Opened via `openRawModal` from `useOverlay`.

```tsx
import { useOverlay } from "@/pejay-ui/panels";

const { openRawModal } = useOverlay();

openRawModal(({ close }) => (
  <div>
    <p>Fully custom modal content.</p>
    <button onClick={close}>Dismiss</button>
  </div>
));
```

> [!TIP]
> Raw wrappers still benefit from the global `PanelProvider` stack — they support overlay stacking and the `Escape` key still closes them.
