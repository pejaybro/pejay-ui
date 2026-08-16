# Clipboard Copy Utilities

A lightweight utility to copy text/data to the clipboard on single-click buttons, double-click rows/cells, or programmatically, with an integrated custom toast notification powered by the `toast` component.

---

## 1. Single-Click Copy Button

### Option A: Using `handleClickCopy`
```tsx
import { Copy } from "lucide-react";
import { handleClickCopy } from "@/pejay-ui/utils/clipboard";

export function CopyButton({ code }: { code: string }) {
  return (
    <button
      type="button"
      onClick={handleClickCopy(code, { label: "Snippet" })}
      className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300"
      title="Copy to clipboard"
    >
      <Copy size={14} />
    </button>
  );
}
```

### Option B: Using `useClipboardCopy` Hook (with Icon Switch)
```tsx
import { Copy, Check } from "lucide-react";
import { useClipboardCopy } from "@/pejay-ui/utils/clipboard";

export function ApiKeyCopyButton({ apiKey }: { apiKey: string }) {
  const { copy, isCopied } = useClipboardCopy({ label: "API Key" });

  return (
    <button
      type="button"
      onClick={() => copy(apiKey)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium"
    >
      {isCopied ? (
        <>
          <Check size={14} className="text-green-400" />
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={14} className="text-slate-400" />
          <span>Copy Key</span>
        </>
      )}
    </button>
  );
}
```

---

## 2. Double-Click Copy

```tsx
import { handleDoubleClickCopy } from "@/pejay-ui/utils/clipboard";

export function TableRowCell({ row }) {
  return (
    <td
      onDoubleClick={handleDoubleClickCopy(row.id, { label: "Ref #" })}
      className="cursor-pointer hover:underline select-none"
      title="Double-click to copy"
    >
      {row.id}
    </td>
  );
}
```

---

## 3. Options (`CopyToClipboardOptions`)

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | — | Field name or label displayed in toast (e.g. `"Email"`, `"Ref ID"`). |
| `toastMessage` | `string` | `"Copied to clipboard"` | Custom notification text. |
| `duration` | `number` | `2000` | Toast duration in ms. |
| `showToast` | `boolean` | `true` | Whether to display the copy toast popup. |
| `customToast` | `(data) => void` | — | Custom callback if using an external toast provider. |
| `onSuccess` | `(text) => void` | — | Callback fired after successful clipboard write. |
| `onError` | `(error) => void` | — | Callback fired if clipboard write fails. |
