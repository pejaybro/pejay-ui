# Toast Notification Component

A toast notification system featuring:
- **Fully Customizable Styling**: Complete visual control over status designs.
- **Interactive Gestures**: Swipe-to-dismiss drag support for touch and pointer events.
- **Built-in Theme Presets**: Ready-to-use themes for Success, Error, Warning, and Info alerts.
- **Smart Timers**: Auto-dismiss timers that pause when the user hovers over a toast.
- **Custom Rendering**: Bypasses the default style to render custom React components and functions.
- **Transitions**: Smooth entry/exit animations (slide and fade transitions).

---

## 1. Setup

To use the toast notification system, place the `<ToastContainer />` at the root of your application (typically in `App.tsx` or `main.tsx`).

```tsx
import { ToastContainer } from "@/pejay-ui/components/toast";

export default function App() {
  return (
    <>
      {/* Your App Routing/Content */}
      <ToastContainer placement="top-right" animationType="fade" />
    </>
  );
}
```

### `<ToastContainer />` Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `placement` | `"top-right" \| "top-left" \| "bottom-right" \| "bottom-left"` | `"top-right"` | The screen corner where notifications will stack. |
| `animationType` | `"fade" \| "slide"` | `"fade"` | The entrance and exit transition animation style. Can also be passed as `animation-type`. |

---

## 2. Usage & API

Import the `toast` function from the module:
```ts
import { toast } from "@/pejay-ui/components/toast";
```

### Call Signatures

The status methods (`success`, `error`, `warning`, `info`) support two call signatures:

#### 1. Quick Message (String Only)
For displaying a single-line text message with default settings:
```ts
toast.success("All changes saved!");
```
You can also pass an optional configuration object as the second argument:
```ts
toast.error("An error occurred", { duration: 5000, showClose: false });
```

#### 2. Detailed Object Configuration
For full title and description control:
```ts
toast.warning({
  title: "Low Disk Space",
  description: "You have less than 10% space remaining.",
  duration: 6000
});
```

---

### Shared Configuration Options (`ToastOptions`)
All toast methods accept an options object:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | — | Bold title text displayed in the toast. |
| `description` | `string` | — | Smaller detail text under the title. |
| `duration` | `number` | `4000` | Lifetime in milliseconds. Pass `Infinity` to disable auto-closing. |
| `showClose` | `boolean` | `true` | Whether to show the close cross button. |
| `dismiss` | `string` | — | An existing toast ID to dismiss before showing the new one. |
| `icon` | `React.ReactNode` | — | Custom React element to override the default status icon. |

---

## 3. Presets & Examples

### A. Success Toast
Use for successful operations (submitting forms, saves, payments).
```ts
toast.success({
  title: "Payment Received",
  description: "Your invoice #2093 has been paid successfully.",
  duration: 4000,
});
```

### B. Error Toast
Use for failed requests, validation errors, or application crashes.
```ts
toast.error({
  title: "Upload Failed",
  description: "The connection was lost. Please check your network and try again.",
  duration: 6000,
  showClose: true,
});
```

### C. Warning Toast
Use for alerts, soft errors, or actions requiring user attention.
```ts
toast.warning({
  title: "Unsaved Changes",
  description: "Your work will be lost if you navigate away.",
  duration: 5000,
});
```

### D. Info Toast
Use for general system notices or status updates.
```ts
toast.info({
  title: "System Maintenance",
  description: "Scheduled maintenance will begin tonight at 12:00 AM EST.",
  duration: Infinity, // Stays visible until manually closed
});
```

---

## 4. Custom Toasts

For completely custom designs, use `toast.custom()`. This method bypasses default styling and allows you to render any React component. 

### Custom Example with Manual Dismissal
You can pass a function to the `content` property. It receives the unique `id` of the toast, allowing you to trigger a manual dismiss from inside your custom UI:

```tsx
toast.custom({
  id: "my-custom-toast", // Optional custom string ID
  duration: 10000,       // 10 seconds
  content: (id) => (
    <div className="flex flex-col gap-3 p-4 w-full bg-slate-900 border border-violet-500/30 rounded-xl shadow-lg">
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-semibold text-white">Importing Contacts</h4>
        <p className="text-xs text-slate-400">Please wait while we process your file.</p>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => toast.dismiss(id)}
          className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-xs font-semibold text-white rounded-md transition-colors"
        >
          Cancel Import
        </button>
      </div>
    </div>
  )
});
```

## 5. Dismissing Toasts

Toasts can be dismissed programmatically in two ways:

### 1. By ID via `toast.dismiss()`
You can manually trigger the removal of a toast at any time by calling `toast.dismiss(id)` with the ID returned when the toast was created:
```ts
// Trigger the toast and capture its generated ID
const toastId = toast.info("Uploading file...", { duration: Infinity });

// Dismiss it later (e.g. once the file upload succeeds)
toast.dismiss(toastId);
```

### 2. Auto-Dismissing when Triggering a New Toast (via `dismiss` option)
You can automatically dismiss an active toast by passing its ID in the `dismiss` option of a new toast. This is useful for transitioning states (e.g., from a loading state to a success/error state):
```ts
// 1. Show loading toast with a fixed ID
toast.info("Saving changes...", { id: "saving-progress" });

// 2. Trigger success toast, which dismisses "saving-progress" before rendering
toast.success("All changes saved!", { dismiss: "saving-progress" });
```
