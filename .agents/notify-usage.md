# Historical Notify Close Guard Logic (For Panels)

This document preserves the original design for the unsaved changes close guard system using the custom `notify` component before it was removed.

## Original Files & Imports
* **registry/toast.json** (used toast)
* **templates/notes/under-dev/overlay-close.ts** (used notify.default)
* **templates/notes/under-dev/unsaved-changes-notify.ts** (content configurations)

---

## The Original Logic

When the user attempts to close a side panel or modal (via backdrop click, the Escape key, or the Cancel button), the system triggers:
```typescript
requestOverlayCloseWithConfirm();
```

### 1. Close-Guard Resolver (`overlay-close.ts`)
```typescript
import { notify } from "@/components/base/notify";
import {
  getActiveFormOverlay,
  getActiveOverlayClose,
  isUnsavedConfirmOpen,
  setUnsavedConfirmOpen,
} from "./form-overlay-registry";
import { UNSAVED_CHANGES_NOTIFY } from "./unsaved-changes-notify";

export function showUnsavedChangesNotify(onDiscard: () => void) {
  setUnsavedConfirmOpen(true);

  notify.default({
    title: UNSAVED_CHANGES_NOTIFY.title,
    description: UNSAVED_CHANGES_NOTIFY.description,
    onDismiss: () => setUnsavedConfirmOpen(false),
    defaultButton: {
      ...UNSAVED_CHANGES_NOTIFY.defaultButton,
      onClick: onDiscard,
    },
  });
}

export function requestOverlayCloseWithConfirm() {
  if (isUnsavedConfirmOpen()) {
    notify.dismiss();
    return;
  }

  const form = getActiveFormOverlay();
  if (form?.isCloseBlocked?.()) {
    return;
  }

  const requestClose = getActiveOverlayClose();
  const dirty = form?.isDirty?.() ?? false;

  // IF FORM IS DIRTY, INTERCEPT CLOSE AND SHOW DIALOG
  if (dirty && requestClose) {
    showUnsavedChangesNotify(requestClose);
    return;
  }

  requestClose?.();
}
```

### 2. Dialog Content Configuration (`unsaved-changes-notify.ts`)
```typescript
export const UNSAVED_CHANGES_NOTIFY = {
  title: "Unsaved Changes",
  description: "You have unsaved changes. Are you sure you want to discard them?",
  defaultButton: {
    text: "Discard",
    variant: "danger" as const,
  },
};
```
