import { notify } from "@/components/base/notify";
import {
  getActiveFormOverlay,
  getActiveOverlayClose,
  isUnsavedConfirmOpen,
  setUnsavedConfirmOpen,
} from "./form-overlay-registry";
import { UNSAVED_CHANGES_NOTIFY } from "./unsaved-changes-notify";

export { UNSAVED_CHANGES_NOTIFY } from "./unsaved-changes-notify";

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

  if (dirty && requestClose) {
    showUnsavedChangesNotify(requestClose);
    return;
  }

  requestClose?.();
}

export function dismissActiveNotify() {
  notify.dismiss();
}
